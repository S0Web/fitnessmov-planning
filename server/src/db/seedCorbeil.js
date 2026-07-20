const db = require('./database');
const coursCatalog = require('./coursCatalog');
const coachNames = require('./corbeilCoaches');
const seances = require('./corbeilSeances');

function ensureCoursType(nom) {
  const existing = db.get('SELECT id FROM cours_types WHERE nom = ?', [nom]);
  if (existing) return existing.id;
  const catalogEntry = coursCatalog.find(c => c.nom === nom);
  const categorie = catalogEntry ? catalogEntry.categorie : 'fitness';
  const result = db.run('INSERT INTO cours_types (nom, categorie) VALUES (?, ?)', [nom, categorie]);
  return result.lastInsertRowid;
}

function ensureCoach(prenom) {
  const existing = db.get('SELECT id FROM coaches WHERE lower(prenom) = lower(?)', [prenom]);
  if (existing) return existing.id;
  const result = db.run('INSERT INTO coaches (prenom, nom) VALUES (?, ?)', [prenom, '']);
  return result.lastInsertRowid;
}

// Importe l'historique des séances de Corbeil-Essonnes (juin 2024 - août 2025),
// transcrit depuis planning_cours_co.xlsx. Réservé à l'instance Corbeil-Essonnes.
// N'écrase jamais une séance déjà présente (même date + horaire + cours) — peut
// être relancé sans risque. Marque l'import comme fait dans import_markers pour
// que le bouton d'import disparaisse ensuite côté client.
function run() {
  coachNames.forEach(ensureCoach);

  let seancesCreees = 0;
  let seancesIgnorees = 0;
  for (const s of seances) {
    const coursTypeId = ensureCoursType(s.cours_nom);
    const coachId = s.coach_nom ? ensureCoach(s.coach_nom) : null;
    const existing = db.get(
      'SELECT 1 FROM seances WHERE date = ? AND horaire = ? AND cours_type_id = ?',
      [s.date, s.horaire, coursTypeId]
    );
    if (existing) { seancesIgnorees++; continue; }
    db.run(
      `INSERT INTO seances (date, cours_type_id, coach_id, horaire, duree_minutes, statut, nb_presents, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.date, coursTypeId, coachId, s.horaire, s.duree_minutes, s.statut, s.nb_presents, s.notes]
    );
    seancesCreees++;
  }

  db.run('INSERT OR IGNORE INTO import_markers (nom, importe_le) VALUES (?, datetime(\'now\'))', ['corbeil_historique_2024_2025']);

  return { seancesCreees, seancesIgnorees };
}

module.exports = { run };
