const db = require('./database');

// Complète la table `coaches` avec téléphone + disciplines (Aqua/Fitness) transcrites
// de la fiche annuaire papier. Sans risque à rejouer à chaque démarrage : le téléphone
// n'est renseigné que s'il est vide (COALESCE), et aqua/fitness ne sont posés que si le
// coach n'a encore aucune discipline (aqua=0 ET fitness=0) — une fois l'un des deux
// coché (par ce backfill ou manuellement), on ne retouche plus jamais ce coach.
function backfillCoachTags(salleNom, coachTags) {
  if (process.env.SALLE_NOM !== salleNom) return;

  let crees = 0;
  let completes = 0;
  for (const c of coachTags) {
    const existing = c.nom
      ? db.get('SELECT id, telephone, aqua, fitness FROM coaches WHERE lower(prenom) = lower(?) AND lower(nom) = lower(?)', [c.prenom, c.nom])
      : db.get('SELECT id, telephone, aqua, fitness FROM coaches WHERE lower(prenom) = lower(?)', [c.prenom]);

    if (existing) {
      const sansDiscipline = !existing.aqua && !existing.fitness;
      db.run(
        `UPDATE coaches SET
           telephone = COALESCE(telephone, ?),
           aqua = CASE WHEN ? THEN ? ELSE aqua END,
           fitness = CASE WHEN ? THEN ? ELSE fitness END
         WHERE id = ?`,
        [c.telephone, sansDiscipline, c.aqua ? 1 : 0, sansDiscipline, c.fitness ? 1 : 0, existing.id]
      );
      completes++;
    } else {
      db.run('INSERT INTO coaches (prenom, nom, telephone, aqua, fitness) VALUES (?, ?, ?, ?, ?)',
        [c.prenom, c.nom || '', c.telephone, c.aqua ? 1 : 0, c.fitness ? 1 : 0]);
      crees++;
    }
  }
  console.log(`✅ Coachs ${salleNom} : ${completes} complété(s), ${crees} créé(s) (téléphone + disciplines).`);
}

module.exports = { backfillCoachTags };
