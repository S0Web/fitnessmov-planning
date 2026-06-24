const db = require('../server/src/db/database');

db.run('PRAGMA foreign_keys = OFF');
db.run('BEGIN');
try {
  db.run(`CREATE TABLE cours_types_new (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nom       TEXT NOT NULL UNIQUE,
    categorie TEXT NOT NULL CHECK(categorie IN ('aqua','fitness'))
  )`);
  const rows = db.all('SELECT id, nom, categorie FROM cours_types');
  const ins = db.prepare('INSERT INTO cours_types_new (id, nom, categorie) VALUES (?, ?, ?)');
  for (const r of rows) {
    ins.run([r.id, r.nom, r.categorie === 'aqua' ? 'aqua' : 'fitness']);
  }
  db.run('DROP TABLE cours_types');
  db.run('ALTER TABLE cours_types_new RENAME TO cours_types');
  db.run('COMMIT');
  const cats = db.all('SELECT categorie, COUNT(*) as n FROM cours_types GROUP BY categorie');
  console.log('✅ Catégories:', cats.map(c => `${c.categorie}(${c.n})`).join(', '));
} catch(e) {
  db.run('ROLLBACK');
  throw e;
} finally {
  db.run('PRAGMA foreign_keys = ON');
}
