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
  { nom: 'Fit\'Combat',          categorie: 'salle' },
  { nom: 'Stretching postural',  categorie: 'salle' },
  { nom: '100% stretching',      categorie: 'salle' },
  { nom: 'Circuit training',     categorie: 'salle' },
  { nom: 'K step',               categorie: 'salle' },
  { nom: 'Crosstraining',        categorie: 'salle' },
  { nom: 'Callisthénie',         categorie: 'salle' },
  { nom: 'Step débutant',        categorie: 'salle' },
  { nom: 'Global training',      categorie: 'salle' },
  { nom: 'Pilates',              categorie: 'salle' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO cours_types (nom, categorie) VALUES (?, ?)'
);

for (const c of coursTypes) {
  insert.run([c.nom, c.categorie]);
}

console.log(`✅ Seed cours_types — ${coursTypes.length} types insérés/ignorés.`);
