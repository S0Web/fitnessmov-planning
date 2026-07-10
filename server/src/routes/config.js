const express = require('express');
const router = express.Router();

// GET /api/config — configuration publique de l'instance (par salle).
// Pilotée par des variables d'environnement Railway, donc chaque service
// (Corbeil, Ballancourt, …) renvoie sa propre identité sans rebuild.
router.get('/', (req, res) => {
  res.json({
    salleNom: process.env.SALLE_NOM || '',
  });
});

module.exports = router;
