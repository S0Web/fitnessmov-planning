const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Les coachs sont gérés depuis /api/coaches (table coaches) pour ne pas dupliquer
// la même donnée à deux endroits ; ici on ne CRUD que les autres catégories.
const CATEGORIES = ['prestataire', 'employe', 'responsable'];

// GET /api/annuaire — fusionne les coachs (table coaches) et les autres contacts
// (table annuaire_contacts) en une seule liste.
router.get('/', (req, res) => {
  const coachs = db.all('SELECT id, prenom, nom, telephone, aqua, fitness FROM coaches WHERE actif = 1 AND supprime = 0 ORDER BY prenom, nom')
    .map(c => ({
      id: `coach-${c.id}`,
      categorie: 'coach',
      nom: `${c.prenom} ${c.nom}`.trim(),
      telephone: c.telephone,
      aqua: c.aqua,
      fitness: c.fitness,
      notes: null,
      readonly: true,
    }));
  const autres = db.all('SELECT * FROM annuaire_contacts ORDER BY categorie, nom')
    .map(c => ({ ...c, readonly: false }));
  res.json([...coachs, ...autres]);
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
