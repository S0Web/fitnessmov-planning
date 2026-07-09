const express = require('express');
const router = express.Router();
const { requireManager } = require('../middleware/auth');
const { run: importPersonnelHistorique } = require('../db/seedPersonnel');

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

module.exports = router;
