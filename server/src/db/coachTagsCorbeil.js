// Coachs Corbeil-Essonnes, transcrits depuis la fiche annuaire papier : téléphone
// + discipline(s) (Aqua/Fitness, cumulables). Utilisé par backfillCoachTags.js pour
// compléter la table `coaches` existante (ne crée un nouveau coach que si aucun ne
// porte déjà ce prénom ; ne remplace jamais un téléphone déjà renseigné).
// Deux coachs s'appellent "Myriam" sur la fiche — distingués par un nom de famille
// factice (leur vrai nom de famille n'est pas connu).
module.exports = [
  { prenom: 'Vincent',   nom: '',           telephone: '06 99 77 02 57', aqua: true,  fitness: false },
  { prenom: 'Steve',     nom: '',           telephone: '06 03 45 08 27', aqua: true,  fitness: false },
  { prenom: 'Cédric',    nom: '',           telephone: '06 79 54 37 99', aqua: false, fitness: true },
  { prenom: 'Myriam',    nom: '(Contrat)',  telephone: '07 49 89 29 51', aqua: false, fitness: false },
  { prenom: 'Fatou',     nom: '',           telephone: '07 49 29 82 12', aqua: false, fitness: true },
  { prenom: 'Halim',     nom: '',           telephone: '06 14 51 91 01', aqua: false, fitness: true },
  { prenom: 'Imane',     nom: '',           telephone: '06 12 19 89 53', aqua: true,  fitness: true },
  { prenom: 'William',   nom: '',           telephone: '06 60 31 18 44', aqua: false, fitness: true },
  { prenom: 'Eya',       nom: '',           telephone: '07 68 15 11 20', aqua: false, fitness: true },
  { prenom: 'Jen',       nom: '',           telephone: '06 70 48 04 72', aqua: false, fitness: true },
  { prenom: 'Clarisse',  nom: '',           telephone: '07 69 07 24 57', aqua: false, fitness: true },
  { prenom: 'Sarah',     nom: '',           telephone: '06 85 30 82 96', aqua: false, fitness: true },
  { prenom: 'Moktar',    nom: '',           telephone: '06 20 38 56 46', aqua: true,  fitness: true },
  { prenom: 'Myriam',    nom: '(Aqua)',     telephone: '07 61 43 36 00', aqua: true,  fitness: false },
  { prenom: 'Philippe',  nom: '',           telephone: '06 85 84 31 79', aqua: true,  fitness: false },
  { prenom: 'Renaud',    nom: '',           telephone: '06 63 06 15 01', aqua: true,  fitness: false },
  { prenom: 'Bénédicte', nom: '',           telephone: '07 70 04 02 89', aqua: false, fitness: true },
];
