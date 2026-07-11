const express = require('express');
const router = express.Router();
const db = require('../db/database');

const CATEGORIES = ['coach', 'prestataire', 'employe', 'responsable'];

// GET /api/annuaire
router.get('/', (req, res) => {
  const rows = db.all('SELECT * FROM annuaire_contacts ORDER BY categorie, nom');
  res.json(rows);
});

// POST /api/annuaire
router.post('/', (req, res) => {
  const { categorie, nom, telephone, aqua, fitness, notes } = req.body;
  if (!nom || !nom.trim()) return res.status(400).json({ error: 'Nom requis' });
  if (!CATEGORIES.includes(categorie)) return res.status(400).json({ error: 'Catégorie invalide' });

  const result = db.run(
    `INSERT INTO annuaire_contacts (categorie, nom, telephone, aqua, fitness, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [categorie, nom.trim(), telephone?.trim() || null, aqua ? 1 : 0, fitness ? 1 : 0, notes?.trim() || null]
  );
  res.status(201).json(db.get('SELECT * FROM annuaire_contacts WHERE id = ?', [result.lastInsertRowid]));
});

// PUT /api/annuaire/:id
router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM annuaire_contacts WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Contact introuvable' });

  const { categorie, nom, telephone, aqua, fitness, notes } = req.body;
  if (!nom || !nom.trim()) return res.status(400).json({ error: 'Nom requis' });
  if (!CATEGORIES.includes(categorie)) return res.status(400).json({ error: 'Catégorie invalide' });

  db.run(
    `UPDATE annuaire_contacts SET categorie=?, nom=?, telephone=?, aqua=?, fitness=?, notes=? WHERE id=?`,
    [categorie, nom.trim(), telephone?.trim() || null, aqua ? 1 : 0, fitness ? 1 : 0, notes?.trim() || null, req.params.id]
  );
  res.json(db.get('SELECT * FROM annuaire_contacts WHERE id = ?', [req.params.id]));
});

// DELETE /api/annuaire/:id
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM annuaire_contacts WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Contact introuvable' });
  db.run('DELETE FROM annuaire_contacts WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
