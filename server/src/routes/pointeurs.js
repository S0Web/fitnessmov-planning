const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const rows = db.all('SELECT * FROM pointeurs WHERE actif = 1 ORDER BY nom');
  res.json(rows);
});

router.post('/', (req, res) => {
  const { nom } = req.body;
  if (!nom?.trim()) return res.status(400).json({ error: 'nom requis' });
  try {
    const r = db.run('INSERT INTO pointeurs (nom) VALUES (?)', [nom.trim()]);
    res.status(201).json(db.get('SELECT * FROM pointeurs WHERE id = ?', [r.lastInsertRowid]));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Ce pointeur existe déjà' });
    throw e;
  }
});

router.delete('/:id', (req, res) => {
  db.run('UPDATE pointeurs SET actif = 0 WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
