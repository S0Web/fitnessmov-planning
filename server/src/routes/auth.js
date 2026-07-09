const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();
const db      = require('../db/database');
const { requireAuth } = require('../middleware/auth');

function expiresAtMorning(hour = 6) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

// GET /api/auth/profiles — liste des profils sélectionnables (public, sans email)
router.get('/profiles', (req, res) => {
  const profiles = db.all('SELECT id, prenom, nom, role FROM app_users WHERE actif = 1 ORDER BY prenom, nom');
  res.json(profiles);
});

// POST /api/auth/profiles — créer un nouveau profil (public, pas de mot de passe)
// Un profil = aussi un employé planifiable dans "Planning personnel".
router.post('/profiles', (req, res) => {
  const { prenom, nom, email } = req.body;
  if (!prenom || !prenom.trim()) return res.status(400).json({ error: 'Prénom requis' });

  const count = db.get('SELECT COUNT(*) as n FROM app_users').n;
  const role = count === 0 ? 'manager' : 'user';

  try {
    const result = db.run(
      'INSERT INTO app_users (prenom, nom, email, role) VALUES (?, ?, ?, ?)',
      [prenom.trim(), (nom || '').trim(), email ? email.trim().toLowerCase() : null, role]
    );
    const user = db.get('SELECT id, prenom, nom, email, role FROM app_users WHERE id = ?', [result.lastInsertRowid]);
    db.run('INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'create_profile', 'app_users', user.id, `${user.prenom} ${user.nom}`.trim()]);
    res.status(201).json(user);
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email déjà utilisé' });
    throw e;
  }
});

// POST /api/auth/select — choisir un profil (pas de mot de passe)
router.post('/select', (req, res) => {
  const { user_id } = req.body;
  const user = db.get('SELECT * FROM app_users WHERE id = ? AND actif = 1', [user_id]);
  if (!user) return res.status(404).json({ error: 'Profil introuvable' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = expiresAtMorning();
  db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, user.id, expires]);

  db.run('INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [user.id, 'switch_profile', 'app_users', user.id, `Profil sélectionné depuis ${req.ip}`]);

  res.json({ token, expires_at: expires, user: { id: user.id, prenom: user.prenom, nom: user.nom, email: user.email, role: user.role } });
});

// POST /api/auth/logout — met fin à la session (= changer de profil côté client)
router.post('/logout', requireAuth, (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.slice(7);
  if (token) db.run('DELETE FROM sessions WHERE token = ?', [token]);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = { router };
