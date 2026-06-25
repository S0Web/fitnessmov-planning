const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();
const db      = require('../db/database');
const { requireAuth, requireManager } = require('../middleware/auth');
const { hashPassword } = require('./auth');

// GET /api/app-users — liste (manager seulement)
router.get('/', requireManager, (req, res) => {
  const users = db.all('SELECT id, prenom, nom, email, role, actif, created_at FROM app_users ORDER BY prenom, nom');
  res.json(users);
});

// POST /api/app-users — créer un utilisateur (manager)
router.post('/', requireManager, (req, res) => {
  const { prenom, nom, email, password, role } = req.body;
  if (!prenom || !nom || !email || !password) return res.status(400).json({ error: 'Tous les champs sont requis' });
  try {
    const hash = hashPassword(password);
    const result = db.run(
      'INSERT INTO app_users (prenom, nom, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [prenom.trim(), nom.trim(), email.trim().toLowerCase(), hash, role === 'manager' ? 'manager' : 'user']
    );
    const user = db.get('SELECT id, prenom, nom, email, role, actif FROM app_users WHERE id = ?', [result.lastInsertRowid]);
    db.run('INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create_user', 'app_users', user.id, `${user.prenom} ${user.nom}`]);
    res.status(201).json(user);
  } catch(e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email déjà utilisé' });
    throw e;
  }
});

// PUT /api/app-users/:id — modifier (manager ou soi-même)
router.put('/:id', requireAuth, (req, res) => {
  const isManager = req.user.role === 'manager';
  const isSelf    = req.user.id === Number(req.params.id);
  if (!isManager && !isSelf) return res.status(403).json({ error: 'Accès refusé' });

  const { prenom, nom, email, password, role, actif } = req.body;
  const user = db.get('SELECT * FROM app_users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const newHash = password ? hashPassword(password) : user.password_hash;
  const newRole = isManager && role ? (role === 'manager' ? 'manager' : 'user') : user.role;
  const newActif = isManager && actif !== undefined ? (actif ? 1 : 0) : user.actif;

  db.run(
    'UPDATE app_users SET prenom=?, nom=?, email=?, password_hash=?, role=?, actif=? WHERE id=?',
    [
      (prenom || user.prenom).trim(),
      (nom || user.nom).trim(),
      (email || user.email).trim().toLowerCase(),
      newHash, newRole, newActif,
      req.params.id
    ]
  );
  if (!newActif) db.run('DELETE FROM sessions WHERE user_id = ?', [req.params.id]);
  res.json(db.get('SELECT id, prenom, nom, email, role, actif FROM app_users WHERE id = ?', [req.params.id]));
});

// GET /api/app-users/audit — journal (manager)
router.get('/audit', requireManager, (req, res) => {
  const logs = db.all(`
    SELECT a.*, u.prenom || ' ' || u.nom AS user_nom
    FROM audit_log a
    LEFT JOIN app_users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 200
  `);
  res.json(logs);
});

module.exports = router;
