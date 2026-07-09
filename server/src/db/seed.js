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
  // Fitness (bike)
  { nom: 'Biking',               categorie: 'fitness' },
  { nom: 'RPM',                  categorie: 'fitness' },
  // Fitness (salle)
  { nom: 'Bodybarre',            categorie: 'fitness' },
  { nom: 'CAF',                  categorie: 'fitness' },
  { nom: 'CAF XL',               categorie: 'fitness' },
  { nom: 'CAF 100% femmes',      categorie: 'fitness' },
  { nom: 'HIIT',                 categorie: 'fitness' },
  { nom: 'Bodypump',             categorie: 'fitness' },
  { nom: 'Bodycombat',           categorie: 'fitness' },
  { nom: "Fit'Combat",           categorie: 'fitness' },
  { nom: "Fit'Attack",           categorie: 'fitness' },
  { nom: 'Stretching postural',  categorie: 'fitness' },
  { nom: '100% stretching',      categorie: 'fitness' },
  { nom: '100% Abdos',           categorie: 'fitness' },
  { nom: 'Circuit training',     categorie: 'fitness' },
  { nom: 'K step',               categorie: 'fitness' },
  { nom: 'Crosstraining',        categorie: 'fitness' },
  { nom: 'Callisthénie',         categorie: 'fitness' },
  { nom: 'Step débutant',        categorie: 'fitness' },
  { nom: 'Step intermédiaire',   categorie: 'fitness' },
  { nom: 'Global training',      categorie: 'fitness' },
  { nom: 'Pilates',              categorie: 'fitness' },
  { nom: 'Zumba',                categorie: 'fitness' },
  { nom: 'Zumba 100% femmes',    categorie: 'fitness' },
  { nom: 'AfroDance',            categorie: 'fitness' },
  { nom: 'Boxe anglaise',        categorie: 'fitness' },
  { nom: 'Kick boxing 100% femmes', categorie: 'fitness' },
  { nom: 'SG 100% femmes',       categorie: 'fitness' },
  { nom: 'No Limit',             categorie: 'fitness' },
  { nom: 'Tabata XT',            categorie: 'fitness' },
  { nom: 'Lower Power',          categorie: 'fitness' },
  { nom: 'Upper Power',          categorie: 'fitness' },
  { nom: 'MMA Grappling',        categorie: 'fitness' },
  { nom: 'Pole dance',           categorie: 'fitness' },
  { nom: 'Forest Training',      categorie: 'fitness' },
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
