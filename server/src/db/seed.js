const db = require('./database');
const coursTypes = require('./coursCatalog');

const insertCours = db.prepare(
  'INSERT OR IGNORE INTO cours_types (nom, categorie) VALUES (?, ?)'
);
for (const c of coursTypes) {
  insertCours.run([c.nom, c.categorie]);
}
console.log(`✅ Seed cours_types — ${coursTypes.length} types insérés/ignorés.`);

// ─── Coaches ─────────────────────────────────────────────────────────────────

const coaches = [
  { prenom: 'Selim',      nom: 'Ouadi' },
  { prenom: 'Mokhtar',    nom: '' },
  { prenom: 'Imane',      nom: '' },
  { prenom: 'Marc',       nom: '' },
  { prenom: 'Samia',      nom: '' },
  { prenom: 'Enric',      nom: '' },
  { prenom: 'Maxime',     nom: '' },
  { prenom: 'Alexandra',  nom: '' },
  { prenom: 'Amisi',      nom: '' },
  { prenom: 'Benoît',     nom: '' },
  { prenom: 'Bryan',      nom: '' },
  { prenom: 'Bénédicte',  nom: '' },
  { prenom: 'Charlotte',  nom: '' },
  { prenom: 'Clarysse',   nom: '' },
  { prenom: 'Clémentine', nom: '' },
  { prenom: 'Cédric',     nom: '' },
  { prenom: 'Diana',      nom: '' },
  { prenom: 'Eric',       nom: '' },
  { prenom: 'Eya',        nom: '' },
  { prenom: 'Fatou',      nom: '' },
  { prenom: 'Halim',      nom: '' },
  { prenom: 'Ingrid',     nom: '' },
  { prenom: 'Jen',        nom: '' },
  { prenom: 'Jérôme',     nom: '' },
  { prenom: 'Malika',     nom: '' },
  { prenom: 'Marvin',     nom: '' },
  { prenom: 'Maëlle',     nom: '' },
  { prenom: 'Myriam',     nom: '' },
  { prenom: 'Myriam',     nom: 'Aqua' },
  { prenom: 'Nacer',      nom: '' },
  { prenom: 'Philippe',   nom: '' },
  { prenom: 'Renaud',     nom: '' },
  { prenom: 'Robin',      nom: '' },
  { prenom: 'Sarah',      nom: '' },
  { prenom: 'Serena',     nom: '' },
  { prenom: 'Severine',   nom: '' },
  { prenom: 'William',    nom: '' },
];

const insertCoach = db.prepare(
  'INSERT OR IGNORE INTO coaches (prenom, nom) VALUES (?, ?)'
);
for (const c of coaches) {
  insertCoach.run([c.prenom, c.nom]);
}
console.log(`✅ Seed coaches — ${coaches.length} coaches insérés/ignorés.`);
