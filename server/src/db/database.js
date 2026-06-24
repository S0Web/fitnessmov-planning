const { Database } = require('node-sqlite3-wasm');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/fitnessmov.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');

const tryAlter = (sql) => { try { db.run(sql); } catch (_) {} };

// ─── Tables ─────────────────────────────────────────────────────────────────

db.run(`
  CREATE TABLE IF NOT EXISTS coaches (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT NOT NULL DEFAULT '',
    prenom      TEXT NOT NULL,
    email       TEXT UNIQUE,
    telephone   TEXT,
    actif       INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS pointeurs (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nom   TEXT NOT NULL UNIQUE,
    actif INTEGER NOT NULL DEFAULT 1
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS coach_documents (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id     INTEGER NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK(type IN ('carte_pro', 'contrat', 'autre')),
    nom_fichier  TEXT NOT NULL,
    chemin       TEXT NOT NULL,
    date_upload  TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS cours_types (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nom       TEXT NOT NULL UNIQUE,
    categorie TEXT NOT NULL CHECK(categorie IN ('aqua', 'fitness'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS planning_recurrent (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    cours_type_id  INTEGER NOT NULL REFERENCES cours_types(id),
    coach_id       INTEGER NOT NULL REFERENCES coaches(id),
    jour_semaine   INTEGER NOT NULL CHECK(jour_semaine BETWEEN 0 AND 6),
    horaire        TEXT NOT NULL,
    duree_minutes  INTEGER NOT NULL DEFAULT 60,
    actif          INTEGER NOT NULL DEFAULT 1
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS seances (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    date           TEXT NOT NULL,
    cours_type_id  INTEGER NOT NULL REFERENCES cours_types(id),
    coach_id       INTEGER REFERENCES coaches(id),
    horaire        TEXT NOT NULL,
    duree_minutes  INTEGER NOT NULL DEFAULT 60,
    statut         TEXT NOT NULL DEFAULT 'programme'
                   CHECK(statut IN ('programme', 'effectue', 'annule', 'paye')),
    nb_presents    INTEGER,
    pointeur_id    INTEGER REFERENCES pointeurs(id),
    notes          TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

tryAlter('ALTER TABLE seances ADD COLUMN pointeur_id INTEGER REFERENCES pointeurs(id)');
tryAlter('ALTER TABLE seances ADD COLUMN notes TEXT');
tryAlter('ALTER TABLE coaches ADD COLUMN nom TEXT NOT NULL DEFAULT \'\'');

// Migration : rendre coach_id nullable (supprime NOT NULL si présent dans l'ancienne DB)
;(function migrateCoachNullable() {
  try {
    const cols = db.all('PRAGMA table_info(seances)');
    const coachCol = cols.find(c => c.name === 'coach_id');
    if (!coachCol || coachCol.notnull === 0) return; // déjà OK
    console.log('⚙️  Migration: rendre seances.coach_id nullable...');
    db.run('PRAGMA foreign_keys = OFF');
    db.run('BEGIN');
    db.run(`CREATE TABLE seances_mig (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      date           TEXT NOT NULL,
      cours_type_id  INTEGER NOT NULL REFERENCES cours_types(id),
      coach_id       INTEGER REFERENCES coaches(id),
      horaire        TEXT NOT NULL,
      duree_minutes  INTEGER NOT NULL DEFAULT 60,
      statut         TEXT NOT NULL DEFAULT 'programme'
                     CHECK(statut IN ('programme','effectue','annule','paye')),
      nb_presents    INTEGER,
      pointeur_id    INTEGER REFERENCES pointeurs(id),
      notes          TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    db.run('INSERT INTO seances_mig SELECT * FROM seances');
    db.run('DROP TABLE seances');
    db.run('ALTER TABLE seances_mig RENAME TO seances');
    db.run('COMMIT');
    db.run('PRAGMA foreign_keys = ON');
    console.log('✅ Migration coach_id nullable OK');
  } catch(e) {
    try { db.run('ROLLBACK'); } catch(_) {}
    db.run('PRAGMA foreign_keys = ON');
    console.error('Migration error:', e.message);
  }
})();

db.run(`
  CREATE TABLE IF NOT EXISTS modifications_ponctuelles (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    seance_id         INTEGER NOT NULL REFERENCES seances(id) ON DELETE CASCADE,
    type              TEXT NOT NULL CHECK(type IN ('annulation', 'remplacement_coach', 'ajout')),
    ancien_coach_id   INTEGER REFERENCES coaches(id),
    nouveau_coach_id  INTEGER REFERENCES coaches(id),
    raison            TEXT,
    date_modification TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
