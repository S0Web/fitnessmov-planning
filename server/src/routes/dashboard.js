const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/dashboard?debut=YYYY-MM-DD&fin=YYYY-MM-DD
router.get('/', (req, res) => {
  const now   = new Date();
  const year  = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const debut = req.query.debut || `${year}-08-01`;
  const fin   = req.query.fin   || `${year + 1}-07-31`;

  // ── KPI globaux ────────────────────────────────────────────────
  const kpi = db.get(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN statut IN ('effectue','paye') THEN 1 ELSE 0 END) AS effectues,
      SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) AS annules
    FROM seances WHERE date BETWEEN ? AND ?
  `, [debut, fin]);

  // ── Fréquentation mensuelle ────────────────────────────────────
  const mensuel = db.all(`
    SELECT
      SUBSTR(date,1,7) AS mois,
      COUNT(*) AS programmes,
      SUM(CASE WHEN statut IN ('effectue','paye') THEN 1 ELSE 0 END) AS effectues,
      SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) AS annules,
      SUM(CASE WHEN statut IN ('effectue','paye') THEN nb_presents ELSE 0 END) AS effectif,
      SUM(CASE WHEN statut IN ('effectue','paye') THEN duree_minutes ELSE 0 END) AS total_minutes
    FROM seances
    WHERE date BETWEEN ? AND ?
    GROUP BY mois ORDER BY mois
  `, [debut, fin]);

  // ── Top cours ──────────────────────────────────────────────────
  const topCours = db.all(`
    SELECT
      ct.nom,
      COUNT(*) AS seances,
      SUM(COALESCE(s.nb_presents, 0)) AS total_presents,
      ROUND(AVG(CASE WHEN s.nb_presents IS NOT NULL THEN s.nb_presents END), 1) AS moy_presents
    FROM seances s
    JOIN cours_types ct ON ct.id = s.cours_type_id
    WHERE s.date BETWEEN ? AND ? AND s.statut IN ('effectue','paye')
    GROUP BY s.cours_type_id
    ORDER BY seances DESC
    LIMIT 10
  `, [debut, fin]);

  // ── Top coachs ─────────────────────────────────────────────────
  const topCoachs = db.all(`
    SELECT
      c.prenom || ' ' || c.nom AS coach,
      COUNT(*) AS seances,
      ROUND(SUM(s.duree_minutes) / 60.0, 2) AS heures,
      ROUND(AVG(CASE WHEN s.nb_presents IS NOT NULL THEN s.nb_presents END), 1) AS moy_presents
    FROM seances s
    JOIN coaches c ON c.id = s.coach_id
    WHERE s.date BETWEEN ? AND ? AND s.statut IN ('effectue','paye')
    GROUP BY s.coach_id
    ORDER BY heures DESC
    LIMIT 10
  `, [debut, fin]);

  res.json({ kpi, mensuel, topCours, topCoachs, debut, fin });
});

module.exports = router;
