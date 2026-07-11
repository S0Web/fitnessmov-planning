// Annuaire Corbeil-Essonnes, transcrit depuis la fiche papier affichée à l'accueil.
// Seedé une seule fois (au démarrage, si la table est vide) — modifiable ensuite
// librement depuis l'onglet Annuaire. Ballancourt démarre volontairement avec un
// annuaire vide (à remplir par le gérant). Contact "Weno" volontairement omis
// (rayé sur la fiche source, numéro obsolète).
// Les coachs ne sont PAS ici : ils vivent dans la table `coaches` (voir
// server/src/db/coachTagsCorbeil.js pour leurs disciplines Aqua/Fitness + téléphone).
module.exports = [
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
