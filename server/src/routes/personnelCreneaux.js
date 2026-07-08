const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { upsertJour } = require('../db/personnelWrite');

function getSemaineBounds(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diffLundi = day === 0 ? -6 : 1 - day;
  const lundi = new Date(y, m - 1, d + diffLundi);
  const dimanche = new Date(y, m - 1, d + diffLundi + 6);
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  return { lundi: fmt(lundi), dimanche: fmt(dimanche) };
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// GET /api/personnel-creneaux?semaine=YYYY-MM-DD
router.get('/', (req, res) => {
  const { lundi, dimanche } = getSemaineBounds(req.query.semaine || todayISO());
  const rows = db.all(
    `SELECT pc.*, e.prenom, e.nom
     FROM personnel_creneaux pc
     JOIN employes e ON e.id = pc.employe_id
     WHERE pc.date BETWEEN ? AND ?
     ORDER BY pc.employe_id, pc.date, pc.ordre`,
    [lundi, dimanche]
  );
  res.json(rows);
});

// PUT /api/personnel-creneaux/:employe_id/:date — upsert jour complet
router.put('/:employe_id/:date', (req, res) => {
  const { employe_id, date } = req.params;
  const employe = db.get('SELECT id FROM employes WHERE id = ?', [employe_id]);
  if (!employe) return res.status(404).json({ error: 'Employé introuvable' });

  try {
    upsertJour(employe_id, date, req.body);

    if (req.user) {
      db.run('INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'update_personnel_creneau', 'personnel_creneaux', employe_id, `${date}: ${req.body.type || 'travail'}`]);
    }

    const rows = db.all('SELECT * FROM personnel_creneaux WHERE employe_id = ? AND date = ? ORDER BY ordre', [employe_id, date]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
