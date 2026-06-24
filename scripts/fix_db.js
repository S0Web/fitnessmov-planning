// 1. Dédoublonner les coaches (garder le plus ancien id, réassigner les séances)
// 2. Renommer les catégories salle+bike → fitness
// 3. Recréer la table cours_types avec le bon CHECK

const db = require('../server/src/db/database');

// ─── 1. Dédoublonner les coaches ────────────────────────────────────────────

const coaches = db.all('SELECT id, prenom, nom FROM coaches ORDER BY id');

// Groupe par prenom (insensible à la casse)
const byPrenom = {};
for (const c of coaches) {
  const key = c.prenom.trim().toLowerCase();
  if (!byPrenom[key]) byPrenom[key] = [];
  byPrenom[key].push(c);
}

let dedupCount = 0;
db.run('BEGIN');
try {
  for (const [key, group] of Object.entries(byPrenom)) {
    if (group.length <= 1) continue;
    // Garde le premier (id le plus bas), supprime les autres
    const keep = group[0];
    for (let i = 1; i < group.length; i++) {
      const dup = group[i];
      // Réassigne les séances
      db.run('UPDATE seances SET coach_id = ? WHERE coach_id = ?', [keep.id, dup.id]);
      db.run('UPDATE seances SET pointeur_id = ? WHERE pointeur_id = ?', [keep.id, dup.id]);
      // Supprime le doublon
      db.run('DELETE FROM coaches WHERE id = ?', [dup.id]);
      dedupCount++;
    }
  }
  db.run('COMMIT');
} catch (e) {
  db.run('ROLLBACK');
  throw e;
}
console.log(`✅ Coaches dédoublonnés: ${dedupCount} supprimés`);
console.log(`   Reste: ${db.all('SELECT COUNT(*) as n FROM coaches')[0].n} coaches`);

// ─── 2. Catégories salle + bike → fitness ───────────────────────────────────

db.run("UPDATE cours_types SET categorie = 'fitness' WHERE categorie IN ('salle', 'bike')");
console.log(`✅ Catégories mises à jour → fitness`);

// ─── 3. Vérif ────────────────────────────────────────────────────────────────

const cats = db.all("SELECT categorie, COUNT(*) as n FROM cours_types GROUP BY categorie");
console.log('Catégories:', cats.map(c => `${c.categorie}(${c.n})`).join(', '));
