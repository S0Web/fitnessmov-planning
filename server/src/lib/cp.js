// Calcul du cumul de congés payés : 2,5 jours acquis par mois plein écoulé depuis la
// date de début de contrat, plus un ajustement manuel (cp_ajuste) que le manager peut
// modifier librement (reprise d'ancienneté, régularisation, etc.).

// Nombre de mois pleins écoulés entre dateDebut (YYYY-MM-DD) et aujourd'hui.
function moisEcoules(dateDebut) {
  const [y1, m1, d1] = dateDebut.split('-').map(Number);
  const debut = new Date(y1, m1 - 1, d1);
  const today = new Date();
  if (debut > today) return 0;
  let mois = (today.getFullYear() - debut.getFullYear()) * 12 + (today.getMonth() - debut.getMonth());
  if (today.getDate() < debut.getDate()) mois -= 1;
  return Math.max(0, mois);
}

// Solde de CP : calculeADate (2,5j/mois depuis la date de contrat) + ajuste (manuel) - pris.
function soldeCp(dateDebutContrat, cpAjuste, totalPris) {
  const ajuste = cpAjuste || 0;
  const calculeADate = dateDebutContrat ? Math.round(moisEcoules(dateDebutContrat) * 2.5 * 100) / 100 : 0;
  const acquis = Math.round((calculeADate + ajuste) * 100) / 100;
  return {
    calculeADate,
    ajuste,
    acquis,
    pris: totalPris,
    restant: Math.round((acquis - totalPris) * 100) / 100,
  };
}

module.exports = { moisEcoules, soldeCp };
