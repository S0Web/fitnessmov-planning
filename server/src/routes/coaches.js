const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/coaches/recap?debut=YYYY-MM-DD&fin=YYYY-MM-DD
router.get('/recap', (req, res) => {
  // Défaut : 12 derniers mois
  const now = new Date();
  const defaultFin   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-28`;
  const d12          = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const defaultDebut = `${d12.getFullYear()}-${String(d12.getMonth()+1).padStart(2,'0')}-01`;
  const debut = req.query.debut || defaultDebut;
  const fin   = req.query.fin   || defaultFin;

  const coaches = db.all('SELECT id, prenom, nom, email, telephone, aqua, fitness, boxe, crosstraining, poledance, actif FROM coaches WHERE supprime = 0 ORDER BY prenom, nom');
  const seances = db.all(
    `SELECT coach_id, SUBSTR(date,1,7) as mois, SUM(duree_minutes) as mins
     FROM seances
     WHERE statut = 'effectue' AND date BETWEEN ? AND ?
     GROUP BY coach_id, mois`,
    [debut, fin]
  );

  const map = {};
  for (const c of coaches) {
    map[c.id] = { ...c, mois: {}, total: 0 };
  }
  for (const s of seances) {
    if (!map[s.coach_id]) continue;
    const h = Math.round((s.mins / 60) * 100) / 100;
    map[s.coach_id].mois[s.mois] = h;
    map[s.coach_id].total = Math.round((map[s.coach_id].total + h) * 100) / 100;
  }

  const result = Object.values(map).sort((a, b) => b.total - a.total);
  res.json({ coaches: result });
});

// GET /api/coaches — liste tous les coaches (actifs par défaut)
router.get('/', (req, res) => {
  const { tous } = req.query;
  const rows = tous
    ? db.all('SELECT * FROM coaches WHERE supprime = 0 ORDER BY nom, prenom')
    : db.all('SELECT * FROM coaches WHERE actif = 1 AND supprime = 0 ORDER BY nom, prenom');
  res.json(rows);
});

// GET /api/coaches/:id
router.get('/:id', (req, res) => {
  const coach = db.get('SELECT * FROM coaches WHERE id = ?', [req.params.id]);
  if (!coach) return res.status(404).json({ error: 'Coach introuvable' });
  res.json(coach);
});

// POST /api/coaches
router.post('/', (req, res) => {
  const { nom, prenom, email, telephone, aqua, fitness, boxe, crosstraining, poledance } = req.body;
  if (!prenom || !prenom.trim()) {
    return res.status(400).json({ error: 'prenom est obligatoire' });
  }
  try {
    const result = db.run(
      'INSERT INTO coaches (nom, prenom, email, telephone, aqua, fitness, boxe, crosstraining, poledance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [(nom || '').trim(), prenom.trim(), email?.trim() || null, telephone?.trim() || null,
       aqua ? 1 : 0, fitness ? 1 : 0, boxe ? 1 : 0, crosstraining ? 1 : 0, poledance ? 1 : 0]
    );
    const created = db.get('SELECT * FROM coaches WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    throw err;
  }
});

// PUT /api/coaches/:id — mise à jour complète
router.put('/:id', (req, res) => {
  const { nom, prenom, email, telephone, aqua, fitness, boxe, crosstraining, poledance } = req.body;
  if (!prenom || !prenom.trim()) {
    return res.status(400).json({ error: 'prenom est obligatoire' });
  }
  const existing = db.get('SELECT id FROM coaches WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Coach introuvable' });

  try {
    db.run(
      'UPDATE coaches SET nom = ?, prenom = ?, email = ?, telephone = ?, aqua = ?, fitness = ?, boxe = ?, crosstraining = ?, poledance = ? WHERE id = ?',
      [(nom || '').trim(), prenom.trim(), email?.trim() || null, telephone?.trim() || null,
       aqua ? 1 : 0, fitness ? 1 : 0, boxe ? 1 : 0, crosstraining ? 1 : 0, poledance ? 1 : 0, req.params.id]
    );
    res.json(db.get('SELECT * FROM coaches WHERE id = ?', [req.params.id]));
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    throw err;
  }
});

// PATCH /api/coaches/:id — édition rapide (téléphone + disciplines), sans repasser
// par le nom complet — utilisé par l'Annuaire pour modifier un coach sur place.
router.patch('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM coaches WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Coach introuvable' });

  const fields = ['telephone', 'aqua', 'fitness', 'boxe', 'crosstraining', 'poledance'];
  const updates = {};
  for (const f of fields) if (f in req.body) updates[f] = req.body[f];

  const sets = Object.keys(updates).map(f => `${f} = ?`);
  if (sets.length === 0) return res.json(existing);
  const values = Object.entries(updates).map(([f, v]) =>
    f === 'telephone' ? (v?.trim() || null) : (v ? 1 : 0)
  );
  db.run(`UPDATE coaches SET ${sets.join(', ')} WHERE id = ?`, [...values, req.params.id]);
  res.json(db.get('SELECT * FROM coaches WHERE id = ?', [req.params.id]));
});

// PATCH /api/coaches/:id/actif — active/désactive
router.patch('/:id/actif', (req, res) => {
  const { actif } = req.body;
  if (actif === undefined) return res.status(400).json({ error: 'actif requis' });
  const existing = db.get('SELECT id FROM coaches WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Coach introuvable' });
  db.run('UPDATE coaches SET actif = ? WHERE id = ?', [actif ? 1 : 0, req.params.id]);
  res.json(db.get('SELECT * FROM coaches WHERE id = ?', [req.params.id]));
});

// DELETE /api/coaches/:id — désactive (soft) ; avec ?definitif=1 : suppression
// définitive (la ligne reste en DB pour l'historique des séances passées).
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT id FROM coaches WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Coach introuvable' });
  if (req.query.definitif === '1') {
    db.run('UPDATE coaches SET supprime = 1, actif = 0 WHERE id = ?', [req.params.id]);
  } else {
    db.run('UPDATE coaches SET actif = 0 WHERE id = ?', [req.params.id]);
  }
  res.json({ ok: true });
});

module.exports = router;
