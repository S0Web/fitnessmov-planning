const db = require('./database');
const annuaireCorbeil = require('./annuaireCorbeil');

// Remplit l'annuaire SEULEMENT si la table est vide, et seulement sur l'instance
// Corbeil-Essonnes — Ballancourt (et toute future salle) démarre avec un annuaire
// vide, à remplir manuellement par le gérant.
function seedAnnuaire() {
  if (process.env.SALLE_NOM !== 'Corbeil-Essonnes') return;
  try {
    const { n } = db.get('SELECT COUNT(*) AS n FROM annuaire_contacts');
    if (n > 0) return;
    const insert = db.prepare(
      `INSERT INTO annuaire_contacts (categorie, nom, telephone, aqua, fitness, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const c of annuaireCorbeil) {
      insert.run([c.categorie, c.nom, c.telephone || null, c.aqua ? 1 : 0, c.fitness ? 1 : 0, c.notes || null]);
    }
    if (annuaireCorbeil.length > 0) {
      console.log(`✅ Annuaire Corbeil pré-rempli (${annuaireCorbeil.length} contacts).`);
    }
  } catch (e) {
    console.error('seedAnnuaire error:', e.message);
  }
}

module.exports = { seedAnnuaire };
