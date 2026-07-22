const db = require('./database');

// Fusionne des coachs qui désignent en réalité la même personne mais ont été
// enregistrés sous plusieurs paires (prénom, nom) différentes (import
// historique, saisies manuelles, backfill qui n'a pas reconnu une entrée déjà
// existante à cause d'un nom légèrement différent). Réservé à l'instance passée
// en paramètre. Idempotent : une fois fusionnés, il ne reste qu'une ligne par
// groupe et un nouveau passage ne trouve plus qu'un match (rien à faire).
//
// Comparaison sur la paire exacte (prénom, nom), jamais sur le prénom seul :
// deux personnes réelles différentes peuvent partager un prénom (ex. deux
// coachs "Myriam" distingués par leur nom) et il ne faut fusionner que les
// variantes explicitement listées, jamais par ressemblance approximative.
//
// groupes: [{ canonique: {prenom,nom}, variantes: [{prenom,nom}, ...] }, ...]
function mergeCoachAliases(salleNom, groupes) {
  if (process.env.SALLE_NOM !== salleNom) return;

  const DISCIPLINES = ['aqua', 'fitness', 'boxe', 'crosstraining', 'poledance'];

  for (const { canonique, variantes } of groupes) {
    const placeholders = variantes
      .map(() => '(lower(trim(prenom)) = lower(trim(?)) AND lower(trim(nom)) = lower(trim(?)))')
      .join(' OR ');
    const params = variantes.flatMap(v => [v.prenom, v.nom]);
    const matches = db.all(`SELECT * FROM coaches WHERE ${placeholders}`, params);

    if (matches.length === 0) continue;
    if (matches.length === 1) {
      const m = matches[0];
      if (m.prenom !== canonique.prenom || m.nom !== canonique.nom) {
        db.run('UPDATE coaches SET prenom = ?, nom = ? WHERE id = ?', [canonique.prenom, canonique.nom, m.id]);
      }
      continue;
    }

    // Garde le coach le plus "rempli" (disciplines + téléphone + catégories),
    // les autres sont fusionnés dedans puis supprimés.
    const score = (c) => DISCIPLINES.reduce((n, d) => n + (c[d] ? 1 : 0), 0)
      + (c.telephone ? 1 : 0) + (c.categories_extra ? 1 : 0) + (c.email ? 1 : 0);
    matches.sort((a, b) => score(b) - score(a) || a.id - b.id);
    const keeper = matches[0];
    const perdants = matches.slice(1);

    for (const perdant of perdants) {
      try {
        db.run('UPDATE seances SET coach_id = ? WHERE coach_id = ?', [keeper.id, perdant.id]);
        db.run('UPDATE coach_documents SET coach_id = ? WHERE coach_id = ?', [keeper.id, perdant.id]);
        db.run('UPDATE planning_recurrent SET coach_id = ? WHERE coach_id = ?', [keeper.id, perdant.id]);
        db.run('UPDATE modifications_ponctuelles SET ancien_coach_id = ? WHERE ancien_coach_id = ?', [keeper.id, perdant.id]);
        db.run('UPDATE modifications_ponctuelles SET nouveau_coach_id = ? WHERE nouveau_coach_id = ?', [keeper.id, perdant.id]);

        // Fusionne les données annexes (disciplines en OR, téléphone/catégories en COALESCE ;
        // email laissé de côté — colonne UNIQUE, ne pas risquer un conflit sur une fusion auto).
        const sets = ['telephone = COALESCE(telephone, ?)'];
        const values = [perdant.telephone];
        for (const d of DISCIPLINES) {
          sets.push(`${d} = CASE WHEN ? THEN 1 ELSE ${d} END`);
          values.push(!!perdant[d]);
        }
        const extraFusionne = Array.from(new Set([
          ...(keeper.categories_extra || '').split(',').filter(Boolean),
          ...(perdant.categories_extra || '').split(',').filter(Boolean),
        ])).join(',');
        sets.push('categories_extra = ?');
        values.push(extraFusionne);
        db.run(`UPDATE coaches SET ${sets.join(', ')} WHERE id = ?`, [...values, keeper.id]);

        db.run('DELETE FROM coaches WHERE id = ?', [perdant.id]);
      } catch (e) {
        console.error(`Fusion coach ${perdant.prenom} ${perdant.nom} → ${keeper.prenom} ${keeper.nom} échouée:`, e.message);
      }
    }

    if (keeper.prenom !== canonique.prenom || keeper.nom !== canonique.nom) {
      db.run('UPDATE coaches SET prenom = ?, nom = ? WHERE id = ?', [canonique.prenom, canonique.nom, keeper.id]);
    }
  }
}

// Corrige un cas précis : l'import de l'historique associe un coach par prénom
// seul (ensureCoach), ce qui est ambigu si plusieurs coachs réels partagent ce
// prénom (ex. deux "Myriam" distinguées par leur nom). Les séances aqua
// importées ont pu atterrir sur le mauvais homonyme. Réattribue toute séance
// de catégorie "aqua" actuellement sur l'un des homonymes incorrects vers le
// bon coach (prénom + nom exact). Idempotent : sans séance mal attribuée
// restante, ne fait rien.
function reassignAquaSeancesToCoach(salleNom, prenom, nomCorrect, nomsIncorrects) {
  if (process.env.SALLE_NOM !== salleNom) return;

  const bon = db.get('SELECT id FROM coaches WHERE prenom = ? AND nom = ?', [prenom, nomCorrect]);
  if (!bon) return;

  for (const nomIncorrect of nomsIncorrects) {
    const mauvais = db.get('SELECT id FROM coaches WHERE prenom = ? AND nom = ?', [prenom, nomIncorrect]);
    if (!mauvais || mauvais.id === bon.id) continue;
    db.run(
      `UPDATE seances SET coach_id = ?
       WHERE coach_id = ? AND cours_type_id IN (SELECT id FROM cours_types WHERE categorie = 'aqua')`,
      [bon.id, mauvais.id]
    );
  }
}

module.exports = { mergeCoachAliases, reassignAquaSeancesToCoach };
