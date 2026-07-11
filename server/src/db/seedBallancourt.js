const db = require('./database');
const { upsertJour } = require('./personnelWrite');
const coursCatalog = require('./coursCatalog');
const coachNames = require('./ballancourtCoaches');
const seances = require('./ballancourtSeances');
const personnel = require('./ballancourtPersonnel');

const JOUR_OFFSET = { lundi: 0, mardi: 1, mercredi: 2, jeudi: 3, vendredi: 4, samedi: 5, dimanche: 6 };

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  const pad = (v) => String(v).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

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

function ensureEmploye(prenom) {
  const existing = db.get('SELECT id FROM app_users WHERE lower(prenom) = lower(?)', [prenom]);
  if (existing) return existing.id;
  const result = db.run('INSERT INTO app_users (prenom, nom, role) VALUES (?, ?, ?)', [prenom, '', 'user']);
  return result.lastInsertRowid;
}

// Importe le catalogue de cours, les coachs, l'historique des séances et le planning
// personnel de Ballancourt-sur-Essonne. N'écrase jamais une donnée déjà présente
// (cours/coach/employé déjà existants, séance déjà à la même date+horaire+cours,
// jour de planning personnel déjà renseigné) — peut être relancé sans risque.
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

  let joursCreees = 0;
  let joursIgnores = 0;
  for (const p of personnel) {
    const employeId = ensureEmploye(p.employe);
    const offset = JOUR_OFFSET[p.jour];
    const date = addDays(p.semaine, offset);
    const existingJour = db.get(
      'SELECT 1 FROM personnel_creneaux WHERE employe_id = ? AND date = ?',
      [employeId, date]
    );
    if (existingJour) { joursIgnores++; continue; }
    const payload = p.type === 'travail'
      ? { type: 'travail', segments: p.segments.map(([debut, fin]) => ({ debut, fin })), notes: p.notes }
      : { type: p.type, notes: p.notes };
    upsertJour(employeId, date, payload);
    joursCreees++;
  }

  return { seancesCreees, seancesIgnorees, joursCreees, joursIgnores };
}

module.exports = { run };
