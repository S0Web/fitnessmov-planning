// Coachs Corbeil-Essonnes enregistrés sous plusieurs orthographes/paires
// prénom+nom différentes (import historique + saisies manuelles) mais désignant
// la même personne — confirmé par le manager. Comparaison sur la paire exacte
// (prénom, nom), pas sur le prénom seul : "Myriam" a DEUX personnes réelles
// distinctes selon le nom associé ("(Contrat)" vs "Aqua"/"(Aqua)" — voir
// coachTagsCorbeil.js) et il ne faut surtout pas les fusionner entre elles.
// Voir mergeCoachAliases.js pour la logique de fusion.
module.exports = [
  {
    canonique: { prenom: 'Philippe', nom: '' },
    variantes: [
      { prenom: 'Phillipe', nom: '' },
      { prenom: 'Philipe',  nom: '' },
      { prenom: 'Philippe', nom: '' },
    ],
  },
  {
    canonique: { prenom: 'Enric', nom: '' },
    variantes: [
      { prenom: 'Enric',   nom: '' },
      { prenom: 'Enrique', nom: '' },
    ],
  },
  {
    canonique: { prenom: 'Myriam', nom: 'Aqua' },
    variantes: [
      { prenom: 'Myriam', nom: 'Aqua' },
      { prenom: 'Myriam', nom: '(Aqua)' },
    ],
  },
  {
    canonique: { prenom: 'Nacer', nom: '' },
    variantes: [
      { prenom: 'Nacer',  nom: '' },
      { prenom: 'Nasser', nom: '' },
    ],
  },
];
