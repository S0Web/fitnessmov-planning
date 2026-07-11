// Annuaire Corbeil-Essonnes, transcrit depuis la fiche papier affichée à l'accueil.
// Seedé une seule fois (au démarrage, si la table est vide) — modifiable ensuite
// librement depuis l'onglet Annuaire. Ballancourt démarre volontairement avec un
// annuaire vide (à remplir par le gérant). Contact "Weno" volontairement omis
// (rayé sur la fiche source, numéro obsolète).
module.exports = [
  // Coachs
  { categorie: 'coach', nom: 'Vincent',   telephone: '06 99 77 02 57', aqua: true,  fitness: false },
  { categorie: 'coach', nom: 'Steve',     telephone: '06 03 45 08 27', aqua: true,  fitness: false },
  { categorie: 'coach', nom: 'Cédric',    telephone: '06 79 54 37 99', aqua: false, fitness: true },
  { categorie: 'coach', nom: 'Myriam',    telephone: '07 49 89 29 51', aqua: false, fitness: false, notes: 'Contrat' },
  { categorie: 'coach', nom: 'Fatou',     telephone: '07 49 29 82 12', aqua: false, fitness: true },
  { categorie: 'coach', nom: 'Halim',     telephone: '06 14 51 91 01', aqua: false, fitness: true },
  { categorie: 'coach', nom: 'Imane',     telephone: '06 12 19 89 53', aqua: true,  fitness: true },
  { categorie: 'coach', nom: 'William',   telephone: '06 60 31 18 44', aqua: false, fitness: true },
  { categorie: 'coach', nom: 'Eya',       telephone: '07 68 15 11 20', aqua: false, fitness: true },
  { categorie: 'coach', nom: 'Jen',       telephone: '06 70 48 04 72', aqua: false, fitness: true, notes: 'Pole' },
  { categorie: 'coach', nom: 'Clarisse',  telephone: '07 69 07 24 57', aqua: false, fitness: true, notes: 'Pole' },
  { categorie: 'coach', nom: 'Sarah',     telephone: '06 85 30 82 96', aqua: false, fitness: true, notes: 'Pole' },
  { categorie: 'coach', nom: 'Moktar',    telephone: '06 20 38 56 46', aqua: true,  fitness: true },
  { categorie: 'coach', nom: 'Myriam',    telephone: '07 61 43 36 00', aqua: true,  fitness: false },
  { categorie: 'coach', nom: 'Philippe',  telephone: '06 85 84 31 79', aqua: true,  fitness: false },
  { categorie: 'coach', nom: 'Renaud',    telephone: '06 63 06 15 01', aqua: true,  fitness: false },
  { categorie: 'coach', nom: 'Bénédicte', telephone: '07 70 04 02 89', aqua: false, fitness: true, notes: 'Pole' },

  // Responsables
  { categorie: 'responsable', nom: 'SMS',    telephone: '06 27 69 21 12' },
  { categorie: 'responsable', nom: 'Djamel', telephone: '07 70 11 01 03' },
  { categorie: 'responsable', nom: 'Akim',   telephone: '06 86 71 33 12' },
  { categorie: 'responsable', nom: 'Kamel',  telephone: '06 58 44 31 69' },
  { categorie: 'responsable', nom: 'Idir',   telephone: '06 65 30 65 72' },

  // Employés
  { categorie: 'employe', nom: 'Selim', telephone: '06 18 33 69 33', notes: 'Contrat' },
  { categorie: 'employe', nom: 'Rudy',  telephone: '06 59 91 18 82', notes: 'Contrat' },

  // Prestataires
  { categorie: 'prestataire', nom: 'WIN School',      telephone: '01 64 79 77 48' },
  { categorie: 'prestataire', nom: 'Ismael ménage',   telephone: '07 53 57 41 48' },
  { categorie: 'prestataire', nom: 'PC Exona',         telephone: '06 50 76 12 66' },
  { categorie: 'prestataire', nom: 'Matrix',           telephone: '01 30 68 62 89' },
  { categorie: 'prestataire', nom: 'Resamania',        telephone: '01 84 17 33 77' },
  { categorie: 'prestataire', nom: 'Club Connect',     telephone: '06 65 13 04 14' },
  { categorie: 'prestataire', nom: 'Shopcaisse',       telephone: '09 72 37 09 80' },
  { categorie: 'prestataire', nom: 'Caméras',          telephone: '06 82 47 34 21' },
  { categorie: 'prestataire', nom: 'Petits baigneurs', telephone: '07 79 04 04 08' },
  { categorie: 'prestataire', nom: 'ABBES café',       telephone: '06 77 96 91 04' },
  { categorie: 'prestataire', nom: 'JDC',              telephone: '01 56 71 29 29' },
];
