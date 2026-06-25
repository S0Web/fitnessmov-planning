const db = require('../db/database');

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const now = new Date().toISOString();
  const session = db.get(
    'SELECT s.*, u.id as uid, u.prenom, u.nom, u.email, u.role, u.actif FROM sessions s JOIN app_users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?',
    [token, now]
  );
  if (!session || !session.actif) return res.status(401).json({ error: 'Session expirée' });

  req.user = { id: session.uid, prenom: session.prenom, nom: session.nom, email: session.email, role: session.role };
  next();
}

function requireManager(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'manager') return res.status(403).json({ error: 'Accès manager requis' });
    next();
  });
}

module.exports = { requireAuth, requireManager, getToken };
