const db = require('./database');

// Complète la table `coaches` avec téléphone + disciplines (Aqua/Fitness) transcrites
// de la fiche annuaire papier. Ne s'exécute qu'une seule fois : si un coach a déjà une
// discipline ou un téléphone renseigné (posé manuellement ou par un run précédent),
// on considère que c'est fait et on ne retouche plus rien (pour ne jamais écraser une
// modification manuelle ultérieure).
function backfillCoachTags(salleNom, coachTags) {
  if (process.env.SALLE_NOM !== salleNom) return;
  const dejaFait = db.get('SELECT 1 AS n FROM coaches WHERE aqua = 1 OR fitness = 1 OR telephone IS NOT NULL LIMIT 1');
  if (dejaFait) return;

  let crees = 0;
  let completes = 0;
  for (const c of coachTags) {
    const existing = c.nom
      ? db.get('SELECT id FROM coaches WHERE lower(prenom) = lower(?) AND lower(nom) = lower(?)', [c.prenom, c.nom])
      : db.get('SELECT id FROM coaches WHERE lower(prenom) = lower(?)', [c.prenom]);

    if (existing) {
      db.run('UPDATE coaches SET telephone = COALESCE(telephone, ?), aqua = ?, fitness = ? WHERE id = ?',
        [c.telephone, c.aqua ? 1 : 0, c.fitness ? 1 : 0, existing.id]);
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
