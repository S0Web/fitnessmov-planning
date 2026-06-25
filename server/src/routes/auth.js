const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();
const db      = require('../db/database');
const { requireAuth } = require('../middleware/auth');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const attempt = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return attempt === hash;
}

function expiresAt23h() {
  const d = new Date();
  d.setHours(23, 0, 0, 0);
  if (d <= new Date()) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const user = db.get('SELECT * FROM app_users WHERE email = ? AND actif = 1', [email.trim().toLowerCase()]);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = expiresAt23h();
  db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, user.id, expires]);

  db.run('INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
    [user.id, 'login', `Connexion depuis ${req.ip}`]);

  res.json({ token, expires_at: expires, user: { id: user.id, prenom: user.prenom, nom: user.nom, email: user.email, role: user.role } });
});

// POST /api/auth/logout
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

// POST /api/auth/init — crée le premier manager si aucun user n'existe
router.post('/init', (req, res) => {
  const count = db.get('SELECT COUNT(*) as n FROM app_users');
  if (count.n > 0) return res.status(409).json({ error: 'Des utilisateurs existent déjà' });

  const { prenom, nom, email, password } = req.body;
  if (!prenom || !nom || !email || !password) return res.status(400).json({ error: 'Tous les champs sont requis' });

  const hash = hashPassword(password);
  const result = db.run(
    'INSERT INTO app_users (prenom, nom, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [prenom.trim(), nom.trim(), email.trim().toLowerCase(), hash, 'manager']
  );
  const user = db.get('SELECT id, prenom, nom, email, role FROM app_users WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(user);
});

module.exports = { router, hashPassword };
