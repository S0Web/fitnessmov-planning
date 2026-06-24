const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/cours-types
router.get('/', (req, res) => {
  const rows = db.all('SELECT * FROM cours_types ORDER BY categorie, nom');
  res.json(rows);
});

// POST /api/cours-types
router.post('/', (req, res) => {
  const { nom, categorie } = req.body;
  if (!nom || !categorie) return res.status(400).json({ error: 'nom et categorie requis' });
  const valid = ['aqua', 'fitness'];
  if (!valid.includes(categorie)) return res.status(400).json({ error: 'categorie invalide' });
  try {
    const result = db.run(
      'INSERT INTO cours_types (nom, categorie) VALUES (?, ?)',
      [nom.trim(), categorie]
    );
    res.status(201).json(db.get('SELECT * FROM cours_types WHERE id = ?', [result.lastInsertRowid]));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Ce cours existe déjà' });
    throw err;
  }
});

module.exports = router;
