const express = require('express');
const path = require('path');
const router = express.Router();
const { requireManager } = require('../middleware/auth');
const { run: importPersonnelHistorique } = require('../db/seedPersonnel');
const { run: importBallancourt } = require('../db/seedBallancourt');
const db = require('../db/database');

// Même résolution de chemin que server/src/db/database.js
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/fitnessmov.db');

// POST /api/admin/seed-personnel — importe l'historique du planning personnel.
// N'écrase jamais un jour déjà renseigné, peut être relancé sans risque.
router.post('/seed-personnel', requireManager, (req, res) => {
  try {
    const result = importPersonnelHistorique();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/seed-ballancourt — importe le catalogue de cours, les coachs et
// l'historique complet (séances + planning personnel) de Ballancourt-sur-Essonne.
// Réservé à l'instance Ballancourt (SALLE_NOM) pour éviter tout risque sur les autres
// salles. N'écrase jamais une donnée déjà présente, peut être relancé sans risque.
router.post('/seed-ballancourt', requireManager, (req, res) => {
  if (process.env.SALLE_NOM !== 'Ballancourt-sur-Essonne') {
    return res.status(403).json({ error: "Import réservé à l'instance Ballancourt-sur-Essonne." });
  }
  try {
    const result = importBallancourt();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/backup — télécharge une copie du fichier SQLite de la base.
router.get('/backup', requireManager, (req, res) => {
  try {
    // Le journal WAL peut contenir des écritures récentes pas encore dans le fichier
    // principal ; on force leur écriture avant de servir le fichier.
    db.run('PRAGMA wal_checkpoint(TRUNCATE)');
    const today = new Date().toISOString().slice(0, 10);
    res.download(DB_PATH, `fitnessmov-${today}.db`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
