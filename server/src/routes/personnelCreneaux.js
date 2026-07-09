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
    `SELECT pc.*, u.prenom, u.nom
     FROM personnel_creneaux pc
     JOIN app_users u ON u.id = pc.employe_id
     WHERE pc.date BETWEEN ? AND ?
     ORDER BY pc.employe_id, pc.date, pc.ordre`,
    [lundi, dimanche]
  );
  res.json(rows);
});

// GET /api/personnel-creneaux/cp-summary — nombre de CP pris (manager: tout le monde, sinon: soi-même)
router.get('/cp-summary', (req, res) => {
  if (req.user.role === 'manager') {
    const rows = db.all(`
      SELECT u.id, u.prenom, u.nom, COUNT(*) as cp
      FROM personnel_creneaux pc
      JOIN app_users u ON u.id = pc.employe_id
      WHERE pc.type = 'cp'
      GROUP BY u.id
      ORDER BY u.prenom
    `);
    return res.json(rows);
  }
  const row = db.get(
    `SELECT COUNT(*) as cp FROM personnel_creneaux WHERE employe_id = ? AND type = 'cp'`,
    [req.user.id]
  );
  res.json([{ id: req.user.id, prenom: req.user.prenom, nom: req.user.nom, cp: row.cp }]);
});

// PUT /api/personnel-creneaux/:employe_id/:date — upsert jour complet
router.put('/:employe_id/:date', (req, res) => {
  const { employe_id, date } = req.params;
  const employe = db.get('SELECT id FROM app_users WHERE id = ?', [employe_id]);
  if (!employe) return res.status(404).json({ error: 'Profil introuvable' });

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
