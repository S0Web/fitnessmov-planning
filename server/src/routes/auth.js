const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();
const db      = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { hashCode, verifyCode } = require('../lib/codeHash');

function expiresAtMorning(hour = 6) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

// GET /api/auth/profiles — liste des profils sélectionnables (public, sans email)
router.get('/profiles', (req, res) => {
  const profiles = db.all('SELECT id, prenom, nom, role, code_hash FROM app_users WHERE actif = 1 ORDER BY prenom, nom')
    .map(({ code_hash, ...p }) => ({ ...p, hasCode: !!code_hash }));
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

// POST /api/auth/select — choisir un profil (code confidentiel requis s'il en a un)
router.post('/select', (req, res) => {
  const { user_id, code } = req.body;
  const user = db.get('SELECT * FROM app_users WHERE id = ? AND actif = 1', [user_id]);
  if (!user) return res.status(404).json({ error: 'Profil introuvable' });

  if (user.code_hash) {
    if (!code) return res.status(400).json({ error: 'Code requis' });
    if (!verifyCode(code, user.code_hash)) return res.status(401).json({ error: 'Code incorrect' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = expiresAtMorning();
  db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, user.id, expires]);

  db.run('INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [user.id, 'switch_profile', 'app_users', user.id, `Profil sélectionné depuis ${req.ip}`]);

  res.json({ token, expires_at: expires, user: { id: user.id, prenom: user.prenom, nom: user.nom, email: user.email, role: user.role } });
});

// POST /api/auth/set-code — crée le code confidentiel d'un profil (uniquement s'il n'en
// a pas déjà un ; pour changer un code existant, passer par "code oublié" d'abord).
router.post('/set-code', (req, res) => {
  const { user_id, code } = req.body;
  if (!code || code.trim().length < 4) return res.status(400).json({ error: 'Le code doit faire au moins 4 caractères' });
  const user = db.get('SELECT id, code_hash FROM app_users WHERE id = ? AND actif = 1', [user_id]);
  if (!user) return res.status(404).json({ error: 'Profil introuvable' });
  if (user.code_hash) return res.status(409).json({ error: 'Un code existe déjà pour ce profil' });

  db.run('UPDATE app_users SET code_hash = ? WHERE id = ?', [hashCode(code.trim()), user.id]);
  res.json({ ok: true });
});

// POST /api/auth/forget-code — réinitialise (supprime) le code confidentiel d'un profil,
// sans vérification de l'ancien code. Volontairement peu sécurisé pour l'instant (pas de
// lien avec une adresse mail encore) — sert surtout d'effet dissuasif.
router.post('/forget-code', (req, res) => {
  const { user_id } = req.body;
  const user = db.get('SELECT id FROM app_users WHERE id = ? AND actif = 1', [user_id]);
  if (!user) return res.status(404).json({ error: 'Profil introuvable' });
  db.run('UPDATE app_users SET code_hash = NULL WHERE id = ?', [user.id]);
  res.json({ ok: true });
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
