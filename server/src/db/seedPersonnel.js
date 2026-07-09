const db = require('./database');
const { upsertJour } = require('./personnelWrite');
const weeks = require('./personnelData');

const ABSENCE = { cp: 'cp', ecole: 'ecole', ferie: 'ferie', arret: 'arret', absent: 'absent', x: 'repos' };

function normTime(tok) {
  const m = tok.trim().toLowerCase().match(/^(\d{1,2})h(\d{0,2})$/);
  if (!m) throw new Error(`heure invalide: "${tok}"`);
  const hh = m[1].padStart(2, '0');
  const mm = (m[2] || '0').padStart(2, '0');
  return `${hh}:${mm}`;
}

function parseCell(raw) {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (ABSENCE[key]) return { type: ABSENCE[key] };
  const segments = raw.split(',').map(seg => {
    const [d, f] = seg.split('-');
    return { debut: normTime(d), fin: normTime(f) };
  });
  return { type: 'travail', segments };
}

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  const pad = (v) => String(v).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function ensureEmploye(prenom) {
  const existing = db.get('SELECT id FROM app_users WHERE lower(prenom) = lower(?)', [prenom]);
  if (existing) return existing.id;
  const result = db.run('INSERT INTO app_users (prenom, nom, role) VALUES (?, ?, ?)', [prenom, '', 'user']);
  return result.lastInsertRowid;
}

// Importe l'historique transcrit du PDF. N'écrase jamais un jour déjà renseigné
// (manuellement ou par un import précédent) — ne comble que les jours vides.
function run() {
  let jours = 0;
  let ignores = 0;
  for (const week of weeks) {
    for (const [prenom, jourValues] of Object.entries(week.employes)) {
      const employeId = ensureEmploye(prenom);
      jourValues.forEach((raw, i) => {
        const parsed = parseCell(raw);
        if (!parsed) return;
        const date = addDays(week.lundi, i);
        const existing = db.get(
          'SELECT 1 FROM personnel_creneaux WHERE employe_id = ? AND date = ?',
          [employeId, date]
        );
        if (existing) { ignores++; return; }
        upsertJour(employeId, date, parsed);
        jours++;
      });
    }
  }
  return { jours, ignores, semaines: weeks.length };
}

module.exports = { run };

if (require.main === module) {
  const result = run();
  console.log(`✅ Import planning personnel : ${result.jours} jours insérés, ${result.ignores} déjà renseignés ignorés (sur ${result.semaines} semaines)`);
}
