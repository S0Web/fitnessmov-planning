const db = require('../db/database');

// Normalise une IPv4 mappée en IPv6 (ex. "::ffff:1.2.3.4") vers sa forme IPv4 simple,
// pour que la comparaison avec la liste blanche fonctionne quel que soit le format
// choisi par Express/Node selon la configuration réseau.
function normalizeIp(ip) {
  if (!ip) return ip;
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

function isIpWhitelisted(ip) {
  const clean = normalizeIp(ip);
  if (!clean) return false;
  return !!db.get('SELECT 1 FROM ip_autorisees WHERE ip = ?', [clean]);
}

// "Privilégié" = accès complet en écriture + annuaire : manager, ou IP dans la liste
// blanche (gérée par un manager depuis Paramètres).
function isPrivileged(req) {
  return req.user?.role === 'manager' || isIpWhitelisted(req.ip);
}

// Bloque les écritures (POST/PUT/PATCH/DELETE) pour les comptes non-managers depuis
// une IP non autorisée. Laisse passer les lectures (GET) sans restriction — sauf pour
// l'annuaire qui a sa propre garde plus stricte (requireAnnuaireAccess).
function requireWriteAccess(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  if (isPrivileged(req)) return next();
  return res.status(403).json({
    error: "Modification non autorisée depuis cet accès. Connecte-toi depuis la salle (IP autorisée) ou avec un compte manager.",
  });
}

// Annuaire : ni lecture ni écriture pour un compte non-manager depuis une IP non autorisée
// (contient des coordonnées personnelles).
function requireAnnuaireAccess(req, res, next) {
  if (isPrivileged(req)) return next();
  return res.status(403).json({
    error: "Annuaire non accessible depuis cet accès. Connecte-toi depuis la salle (IP autorisée) ou avec un compte manager.",
  });
}

module.exports = { normalizeIp, isIpWhitelisted, isPrivileged, requireWriteAccess, requireAnnuaireAccess };
