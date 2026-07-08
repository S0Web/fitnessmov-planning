const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/employes — liste (actifs par défaut)
router.get('/', (req, res) => {
  const { tous } = req.query;
  const rows = tous
    ? db.all('SELECT * FROM employes ORDER BY prenom, nom')
    : db.all('SELECT * FROM employes WHERE actif = 1 ORDER BY prenom, nom');
  res.json(rows);
});

// POST /api/employes
router.post('/', (req, res) => {
  const { prenom, nom } = req.body;
  if (!prenom) return res.status(400).json({ error: 'prenom requis' });
  const result = db.run(
    'INSERT INTO employes (prenom, nom) VALUES (?, ?)',
    [prenom.trim(), (nom || '').trim()]
  );
  const created = db.get('SELECT * FROM employes WHERE id = ?', [result.lastInsertRowid]);
  if (req.user) {
    db.run('INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create_employe', 'employes', created.id, `${created.prenom} ${created.nom}`.trim()]);
  }
  res.status(201).json(created);
});

// PUT /api/employes/:id
router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM employes WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Employé introuvable' });

  const { prenom, nom, actif } = req.body;
  db.run(
    'UPDATE employes SET prenom = ?, nom = ?, actif = ? WHERE id = ?',
    [
      (prenom || existing.prenom).trim(),
      (nom !== undefined ? nom : existing.nom).trim(),
      actif !== undefined ? (actif ? 1 : 0) : existing.actif,
      req.params.id,
    ]
  );
  res.json(db.get('SELECT * FROM employes WHERE id = ?', [req.params.id]));
});

// DELETE /api/employes/:id — soft delete (désactive)
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT id FROM employes WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Employé introuvable' });
  db.run('UPDATE employes SET actif = 0 WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
