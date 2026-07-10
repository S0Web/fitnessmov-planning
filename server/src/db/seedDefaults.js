const db = require('./database');
const coursCatalog = require('./coursCatalog');

// Remplit le catalogue de cours SEULEMENT si la base est vide (nouvelle salle).
// Idempotent et sans risque : sur une base existante (cours_types déjà peuplée,
// ex. Corbeil), la fonction ne fait rien. Les coachs ne sont PAS auto-remplis :
// ils diffèrent d'une salle à l'autre et se saisissent depuis l'onglet Coaches.
function seedDefaults() {
  try {
    const { n } = db.get('SELECT COUNT(*) AS n FROM cours_types');
    if (n > 0) return;
    const insert = db.prepare('INSERT OR IGNORE INTO cours_types (nom, categorie) VALUES (?, ?)');
    for (const c of coursCatalog) insert.run([c.nom, c.categorie]);
    console.log(`✅ Base vierge : catalogue de ${coursCatalog.length} cours pré-rempli.`);
  } catch (e) {
    console.error('seedDefaults error:', e.message);
  }
}

module.exports = { seedDefaults };
