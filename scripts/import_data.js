// Import complet depuis extracted.json → SQLite
const db = require('../server/src/db/database');
const data = require('./extracted.json');

// ─── Normalisation des noms (doublons casse) ────────────────────────────────

function normalize(name) {
  const map = {
    'FATOU': 'Fatou', 'fatou': 'Fatou',
    'bryan': 'Bryan',
    'eric': 'Eric', 'Enric': 'Enric', // Enric est un coach différent
    'malika': 'Malika',
    'marc': 'Marc',
    'sarah': 'Sarah',
    'selim': 'Selim',
    'serena': 'Serena',
  };
  return map[name] || name;
}

function normalizeCours(nom) {
  const map = {
    'Aquadynamic': 'Aquadynamique',
    'caf 100% femmes': 'CAF 100% femmes',
    'Kstep': 'K step',
    'global training': 'Global training',
    'zumba 100%femmes': 'Zumba 100% femmes',
    "fit'attack": "Fit'attack",
  };
  return map[nom] || nom;
}

// ─── Catégories des cours ────────────────────────────────────────────────────

const coursCategories = {
  // Aqua
  'Aquagym': 'aqua', 'Aquabike': 'aqua', 'Aquaboxing': 'aqua', 'Aquapower': 'aqua',
  'Aquadynamique': 'aqua', 'Aquatraining': 'aqua', 'Aquapalming': 'aqua',
  'Aquafusion': 'aqua', 'Aquatrampoline': 'aqua', 'Aquadynamic': 'aqua',
  'Aquabike sunday': 'aqua', 'Aquafitness sunday': 'aqua', 'Aquastep': 'aqua',
  // Bike
  'Biking': 'bike', 'RPM': 'bike',
  // Salle (tout le reste)
};

function getCategorie(nom) {
  return coursCategories[nom] || 'salle';
}

// ─── 1. Pointeurs ────────────────────────────────────────────────────────────

const pointeursNorm = new Set();
for (const p of data.pointeurs) {
  // Mohammed/Mohamed → Mohammed
  const norm = p === 'Mohamed' ? 'Mohammed' : p;
  pointeursNorm.add(norm);
}

const insertPointeur = db.prepare('INSERT OR IGNORE INTO pointeurs (nom) VALUES (?)');
for (const p of pointeursNorm) {
  insertPointeur.run([p]);
}
console.log(`✅ Pointeurs insérés: ${pointeursNorm.size}`);

// ─── 2. Coaches ──────────────────────────────────────────────────────────────

const coachesNorm = new Set();
for (const c of data.coaches) {
  coachesNorm.add(normalize(c));
}

const insertCoach = db.prepare('INSERT OR IGNORE INTO coaches (prenom, nom) VALUES (?, ?)');
for (const prenom of coachesNorm) {
  insertCoach.run([prenom, '']);
}
console.log(`✅ Coaches insérés: ${coachesNorm.size}`);

// ─── 3. Cours types ──────────────────────────────────────────────────────────

const coursNorm = new Set();
for (const c of data.cours) {
  coursNorm.add(normalizeCours(c));
}

const insertCours = db.prepare('INSERT OR IGNORE INTO cours_types (nom, categorie) VALUES (?, ?)');
for (const nom of coursNorm) {
  insertCours.run([nom, getCategorie(nom)]);
}
console.log(`✅ Cours insérés: ${coursNorm.size}`);

// ─── 4. Séances ──────────────────────────────────────────────────────────────

// Vider les séances existantes de test
db.run('DELETE FROM seances');

const insertSeance = db.prepare(`
  INSERT OR IGNORE INTO seances (date, cours_type_id, coach_id, horaire, duree_minutes, statut, nb_presents, pointeur_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0, skipped = 0;

db.run('BEGIN');
try {
  for (const s of data.seances) {
    const coachNorm = normalize(s.coach);
    const coursNorm2 = normalizeCours(s.cours);
    const pointeurNorm = s.pointeur === 'Mohamed' ? 'Mohammed' : s.pointeur;

    const coach = db.get('SELECT id FROM coaches WHERE prenom = ?', [coachNorm]);
    const cours = db.get('SELECT id FROM cours_types WHERE nom = ?', [coursNorm2]);
    const pointeur = pointeurNorm
      ? db.get('SELECT id FROM pointeurs WHERE nom = ?', [pointeurNorm])
      : null;

    if (!coach || !cours) { skipped++; continue; }

    insertSeance.run([
      s.date, cours.id, coach.id,
      s.horaire, s.duree, s.statut,
      s.nb_presents ?? null,
      pointeur?.id ?? null,
    ]);
    inserted++;
  }
  db.run('COMMIT');
} catch (e) {
  db.run('ROLLBACK');
  throw e;
}
console.log(`✅ Séances importées: ${inserted} (ignorées: ${skipped})`);
