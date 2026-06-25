const express = require('express');
const router  = express.Router();
const db      = require('../db/database');
const { requireAuth } = require('../middleware/auth');

function getSemaine() {
  const now = new Date();
  const d   = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// GET /api/tasks?semaine=YYYY-WXX&user_id=X
router.get('/', requireAuth, (req, res) => {
  const semaine = req.query.semaine || getSemaine();
  const isManager = req.user.role === 'manager';

  let tasks;
  if (isManager && req.query.user_id) {
    tasks = db.all(
      `SELECT t.*, u.prenom || ' ' || u.nom AS assigned_to, c.prenom || ' ' || c.nom AS created_by_nom
       FROM tasks t
       JOIN app_users u ON u.id = t.user_id
       JOIN app_users c ON c.id = t.created_by
       WHERE t.semaine = ? AND t.user_id = ?
       ORDER BY t.created_at`,
      [semaine, req.query.user_id]
    );
  } else if (isManager && !req.query.user_id) {
    tasks = db.all(
      `SELECT t.*, u.prenom || ' ' || u.nom AS assigned_to, c.prenom || ' ' || c.nom AS created_by_nom
       FROM tasks t
       JOIN app_users u ON u.id = t.user_id
       JOIN app_users c ON c.id = t.created_by
       WHERE t.semaine = ?
       ORDER BY u.prenom, t.created_at`,
      [semaine]
    );
  } else {
    tasks = db.all(
      `SELECT t.*, u.prenom || ' ' || u.nom AS assigned_to, c.prenom || ' ' || c.nom AS created_by_nom
       FROM tasks t
       JOIN app_users u ON u.id = t.user_id
       JOIN app_users c ON c.id = t.created_by
       WHERE t.semaine = ? AND t.user_id = ?
       ORDER BY t.created_at`,
      [semaine, req.user.id]
    );
  }
  res.json(tasks);
});

// POST /api/tasks
router.post('/', requireAuth, (req, res) => {
  const { titre, semaine, user_id } = req.body;
  if (!titre) return res.status(400).json({ error: 'titre requis' });

  const targetUserId = (req.user.role === 'manager' && user_id) ? user_id : req.user.id;
  const targetSemaine = semaine || getSemaine();

  const result = db.run(
    'INSERT INTO tasks (user_id, created_by, semaine, titre) VALUES (?, ?, ?, ?)',
    [targetUserId, req.user.id, targetSemaine, titre.trim()]
  );
  res.status(201).json(db.get('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowid]));
});

// PATCH /api/tasks/:id — toggle done ou modifier titre
router.patch('/:id', requireAuth, (req, res) => {
  const task = db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Tâche introuvable' });
  if (task.user_id !== req.user.id && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const done  = req.body.done  !== undefined ? (req.body.done ? 1 : 0) : task.done;
  const titre = req.body.titre !== undefined ? req.body.titre.trim()   : task.titre;
  db.run('UPDATE tasks SET done=?, titre=? WHERE id=?', [done, titre, req.params.id]);
  res.json(db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]));
});

// DELETE /api/tasks/:id
router.delete('/:id', requireAuth, (req, res) => {
  const task = db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Tâche introuvable' });
  if (task.user_id !== req.user.id && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
