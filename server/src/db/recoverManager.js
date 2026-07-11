const db = require('./database');

// Filet de sécurité : si l'unique manager d'une salle a été supprimé définitivement
// (fonctionnalité qui préserve la ligne en DB mais la rend actif=0/supprime=1), plus
// personne ne peut promouvoir qui que ce soit manager (toutes les routes de gestion
// des rôles sont elles-mêmes réservées aux managers). Ne s'exécute que s'il n'y a
// vraiment plus aucun manager actif sur la salle — ne fait rien une fois corrigé,
// sans risque de laisser tourner indéfiniment.
function recoverManager(salleNom, prenomSecours) {
  if (process.env.SALLE_NOM !== salleNom) return;
  const hasManager = db.get(
    "SELECT 1 AS n FROM app_users WHERE role = 'manager' AND actif = 1 AND supprime = 0"
  );
  if (hasManager) return;

  const candidat = db.get(
    'SELECT id, prenom FROM app_users WHERE lower(prenom) = lower(?) AND actif = 1 AND supprime = 0',
    [prenomSecours]
  );
  if (!candidat) return;

  db.run("UPDATE app_users SET role = 'manager' WHERE id = ?", [candidat.id]);
  db.run(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [candidat.id, 'recover_manager', 'app_users', candidat.id, `${candidat.prenom} promu manager (aucun manager actif restant)`]
  );
  console.log(`✅ Aucun manager actif sur "${salleNom}" : ${candidat.prenom} promu manager.`);
}

module.exports = { recoverManager };
