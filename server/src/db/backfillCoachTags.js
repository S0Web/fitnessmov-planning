const db = require('./database');

const DISCIPLINES = ['aqua', 'fitness', 'boxe', 'crosstraining', 'poledance'];

// Complète la table `coaches` avec téléphone + disciplines transcrites de la fiche
// annuaire papier. Sans risque à rejouer à chaque démarrage : le téléphone n'est
// renseigné que s'il est vide (COALESCE), et les disciplines ne sont posées que si
// le coach n'en a encore aucune — une fois une discipline cochée (par ce backfill ou
// manuellement), on ne retouche plus jamais ce coach.
function backfillCoachTags(salleNom, coachTags) {
  if (process.env.SALLE_NOM !== salleNom) return;

  let crees = 0;
  let completes = 0;
  for (const c of coachTags) {
    const cols = `id, telephone, ${DISCIPLINES.join(', ')}`;
    const existing = c.nom
      ? db.get(`SELECT ${cols} FROM coaches WHERE lower(prenom) = lower(?) AND lower(nom) = lower(?)`, [c.prenom, c.nom])
      : db.get(`SELECT ${cols} FROM coaches WHERE lower(prenom) = lower(?)`, [c.prenom]);

    if (existing) {
      const sansDiscipline = DISCIPLINES.every(d => !existing[d]);
      const sets = ['telephone = COALESCE(telephone, ?)'];
      const values = [c.telephone];
      for (const d of DISCIPLINES) {
        sets.push(`${d} = CASE WHEN ? THEN ? ELSE ${d} END`);
        values.push(sansDiscipline, c[d] ? 1 : 0);
      }
      db.run(`UPDATE coaches SET ${sets.join(', ')} WHERE id = ?`, [...values, existing.id]);
      completes++;
    } else {
      const disciplineCols = DISCIPLINES.map(d => c[d] ? 1 : 0);
      db.run(
        `INSERT INTO coaches (prenom, nom, telephone, ${DISCIPLINES.join(', ')}) VALUES (?, ?, ?, ${DISCIPLINES.map(() => '?').join(', ')})`,
        [c.prenom, c.nom || '', c.telephone, ...disciplineCols]
      );
      crees++;
    }
  }
  console.log(`✅ Coachs ${salleNom} : ${completes} complété(s), ${crees} créé(s) (téléphone + disciplines).`);
}

module.exports = { backfillCoachTags };
