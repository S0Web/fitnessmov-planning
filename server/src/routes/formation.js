const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();
const db = require('../db/database');
const { requireAuth, requireManager } = require('../middleware/auth');

// Dossier de stockage des images, sur le même volume persistant que la base
// (jamais dans server/public, écrasé à chaque déploiement du client).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/fitnessmov.db');
const UPLOADS_DIR = path.join(path.dirname(DB_PATH), 'uploads', 'formation');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype)) return cb(new Error('Format d\'image non supporté'));
    cb(null, true);
  },
});

// GET /api/formation — liste des articles (sans le contenu complet), tout utilisateur authentifié.
router.get('/', requireAuth, (req, res) => {
  const rows = db.all(
    `SELECT fa.id, fa.titre, fa.ordre, fa.updated_at, u.prenom AS auteur_prenom
     FROM formation_articles fa LEFT JOIN app_users u ON u.id = fa.auteur_id
     ORDER BY fa.ordre ASC, fa.id ASC`
  );
  res.json(rows);
});

// GET /api/formation/:id — article complet.
router.get('/:id', requireAuth, (req, res) => {
  const article = db.get(
    `SELECT fa.*, u.prenom AS auteur_prenom
     FROM formation_articles fa LEFT JOIN app_users u ON u.id = fa.auteur_id
     WHERE fa.id = ?`,
    [req.params.id]
  );
  if (!article) return res.status(404).json({ error: 'Article introuvable' });
  res.json(article);
});

// POST /api/formation — crée un article (manager).
router.post('/', requireManager, (req, res) => {
  const { titre, contenu } = req.body;
  if (!titre || !titre.trim()) return res.status(400).json({ error: 'Titre requis' });
  const { max } = db.get('SELECT COALESCE(MAX(ordre), -1) AS max FROM formation_articles');
  const result = db.run(
    'INSERT INTO formation_articles (titre, contenu, ordre, auteur_id) VALUES (?, ?, ?, ?)',
    [titre.trim(), contenu || '', max + 1, req.user.id]
  );
  res.status(201).json(db.get('SELECT * FROM formation_articles WHERE id = ?', [result.lastInsertRowid]));
});

// PUT /api/formation/:id — modifie un article (manager).
router.put('/:id', requireManager, (req, res) => {
  const { titre, contenu } = req.body;
  if (!titre || !titre.trim()) return res.status(400).json({ error: 'Titre requis' });
  const existing = db.get('SELECT id FROM formation_articles WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Article introuvable' });
  db.run(
    "UPDATE formation_articles SET titre = ?, contenu = ?, updated_at = datetime('now') WHERE id = ?",
    [titre.trim(), contenu || '', req.params.id]
  );
  res.json(db.get('SELECT * FROM formation_articles WHERE id = ?', [req.params.id]));
});

// PATCH /api/formation/:id/ordre — remonte/descend un article d'un cran (manager).
router.patch('/:id/ordre', requireManager, (req, res) => {
  const { direction } = req.body;
  if (!['haut', 'bas'].includes(direction)) return res.status(400).json({ error: 'direction invalide' });
  const current = db.get('SELECT * FROM formation_articles WHERE id = ?', [req.params.id]);
  if (!current) return res.status(404).json({ error: 'Article introuvable' });
  const voisin = direction === 'haut'
    ? db.get('SELECT * FROM formation_articles WHERE ordre < ? ORDER BY ordre DESC LIMIT 1', [current.ordre])
    : db.get('SELECT * FROM formation_articles WHERE ordre > ? ORDER BY ordre ASC LIMIT 1', [current.ordre]);
  if (!voisin) return res.json({ ok: true }); // déjà en haut/bas
  db.run('UPDATE formation_articles SET ordre = ? WHERE id = ?', [voisin.ordre, current.id]);
  db.run('UPDATE formation_articles SET ordre = ? WHERE id = ?', [current.ordre, voisin.id]);
  res.json({ ok: true });
});

// DELETE /api/formation/:id — supprime un article (manager).
router.delete('/:id', requireManager, (req, res) => {
  const existing = db.get('SELECT id FROM formation_articles WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Article introuvable' });
  db.run('DELETE FROM formation_articles WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/formation/upload-image — upload d'une capture d'écran pour l'article (manager).
router.post('/upload-image', requireManager, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Aucune image reçue' });
    res.status(201).json({ url: `/uploads/formation/${req.file.filename}` });
  });
});

module.exports = router;
