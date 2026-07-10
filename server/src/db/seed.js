const db = require('./database');

const coursTypes = [
  // Aqua
  { nom: 'Aquagym',              categorie: 'aqua' },
  { nom: 'Aquabike',             categorie: 'aqua' },
  { nom: 'Aquaboxing',           categorie: 'aqua' },
  { nom: 'Aquapower',            categorie: 'aqua' },
  { nom: 'Aquadynamique',        categorie: 'aqua' },
  { nom: 'Aquatraining',         categorie: 'aqua' },
  { nom: 'Aquapalming',          categorie: 'aqua' },
  { nom: 'Aquastep',             categorie: 'aqua' },
  { nom: 'Aquafusion',           categorie: 'aqua' },
  { nom: 'Aquatrampoline',       categorie: 'aqua' },
  // Bike
  { nom: 'Biking',               categorie: 'bike' },
  { nom: 'RPM',                  categorie: 'bike' },
  // Salle
  { nom: 'Bodybarre',            categorie: 'salle' },
  { nom: 'CAF',                  categorie: 'salle' },
  { nom: 'CAF XL',               categorie: 'salle' },
  { nom: 'CAF 100% femmes',      categorie: 'salle' },
  { nom: 'HIIT',                 categorie: 'salle' },
  { nom: 'Bodypump',             categorie: 'salle' },
  { nom: 'Bodycombat',           categorie: 'salle' },
  { nom: "Fit'Combat",           categorie: 'salle' },
  { nom: "Fit'Attack",           categorie: 'salle' },
  { nom: 'Stretching postural',  categorie: 'salle' },
  { nom: '100% stretching',      categorie: 'salle' },
  { nom: '100% Abdos',           categorie: 'salle' },
  { nom: 'Circuit training',     categorie: 'salle' },
  { nom: 'K step',               categorie: 'salle' },
  { nom: 'Crosstraining',        categorie: 'salle' },
  { nom: 'Callisthénie',         categorie: 'salle' },
  { nom: 'Step débutant',        categorie: 'salle' },
  { nom: 'Step intermédiaire',   categorie: 'salle' },
  { nom: 'Global training',      categorie: 'salle' },
  { nom: 'Pilates',              categorie: 'salle' },
  { nom: 'Zumba',                categorie: 'salle' },
  { nom: 'Zumba 100% femmes',    categorie: 'salle' },
  { nom: 'AfroDance',            categorie: 'salle' },
  { nom: 'Boxe anglaise',        categorie: 'salle' },
  { nom: 'Kick boxing 100% femmes', categorie: 'salle' },
  { nom: 'SG 100% femmes',       categorie: 'salle' },
  { nom: 'No Limit',             categorie: 'salle' },
  { nom: 'Tabata XT',            categorie: 'salle' },
  { nom: 'Lower Power',          categorie: 'salle' },
  { nom: 'Upper Power',          categorie: 'salle' },
  { nom: 'MMA Grappling',        categorie: 'salle' },
  { nom: 'Pole dance',           categorie: 'salle' },
  { nom: 'Forest Training',      categorie: 'salle' },
];

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
