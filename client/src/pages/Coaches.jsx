import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import { DISCIPLINE_CONFIG } from '../lib/utils';

// ── Helpers ────────────────────────────────────────────────────────────────────

const MOIS_LABELS = {
  '01':'Janvier','02':'Février','03':'Mars','04':'Avril','05':'Mai','06':'Juin',
  '07':'Juillet','08':'Août','09':'Septembre','10':'Octobre','11':'Novembre','12':'Décembre',
};
const MOIS_COURTS = {
  '01':'Jan','02':'Fév','03':'Mar','04':'Avr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Aoû','09':'Sep','10':'Oct','11':'Nov','12':'Déc',
};

function getLast13Months() {
  const now    = new Date();
  const months = [];
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  }
  const debut = months[0] + '-01';
  const finD  = new Date(now.getFullYear(), now.getMonth()+1, 0);
  const fin   = `${finD.getFullYear()}-${String(finD.getMonth()+1).padStart(2,'0')}-${String(finD.getDate()).padStart(2,'0')}`;
  return { months, debut, fin };
}

function periodeLabel(mode, anneeScolaire, libreAnnee, libreMois, libreJour) {
  if (mode === 'tout') return 'De tout temps';
  if (mode === 'scolaire') return `Saison ${anneeScolaire}–${anneeScolaire + 1}`;
  if (!libreMois) return `Année ${libreAnnee}`;
  if (!libreJour) return `${MOIS_LABELS[libreMois]} ${libreAnnee}`;
  return `${libreJour}/${libreMois}/${libreAnnee}`;
}

function getAcademicYear() {
  const now  = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const debut = `${year}-08-01`;
  const fin   = `${year + 1}-07-31`;
  return { year, debut, fin };
}

function fmtH(val) {
  if (!val && val !== 0) return '';
  const r = Math.round(val * 100) / 100;
  return r % 1 === 0 ? String(r) : r.toFixed(2).replace(/\.?0+$/, '');
}

function pct(a, b) {
  if (!b) return '—';
  return (a / b * 100).toFixed(2).replace('.', ',') + ' %';
}

// ── Mini graphique SVG ─────────────────────────────────────────────────────────

function LineChart({ data, xKey, yKey, color = '#5bcae8', label = '' }) {
  if (!data || data.length === 0) return null;
  const vals   = data.map(d => d[yKey] || 0);
  const maxVal = Math.max(...vals, 1);
  const W = 500, H = 160, PAD = { top: 16, right: 16, bottom: 40, left: 48 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top  - PAD.bottom;
  const step = iW / (data.length - 1 || 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + iH - (d[yKey] || 0) / maxVal * iH,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length-1].x.toFixed(1)},${(PAD.top+iH).toFixed(1)} L${PAD.left},${(PAD.top+iH).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Grille */}
      {yTicks.map((t, i) => {
        const y = PAD.top + iH - (t / maxVal) * iH;
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W-PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{t}</text>
          </g>
        );
      })}
      {/* Aire */}
      <path d={area} fill={color} fillOpacity="0.12" />
      {/* Ligne */}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {/* Points */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
      {/* Labels X */}
      {data.map((d, i) => (
        <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fontSize="9" fill="#6b7280"
          transform={`rotate(-35, ${pts[i].x}, ${H-4})`}>
          {MOIS_COURTS[d[xKey]?.slice(5,7)] || d[xKey]}
        </text>
      ))}
      {/* Label Y */}
      {label && (
        <text x={12} y={PAD.top + iH/2} textAnchor="middle" fontSize="10" fill="#9ca3af"
          transform={`rotate(-90, 12, ${PAD.top + iH/2})`}>{label}</text>
      )}
    </svg>
  );
}

// ── Modale coach ───────────────────────────────────────────────────────────────

function CoachModal({ coach, onSave, onToggle, onDelete, onClose }) {
  const isNew = !coach?.id;
  const [form, setForm] = useState({
    nom:           coach?.nom           || '',
    prenom:        coach?.prenom        || '',
    email:         coach?.email         || '',
    telephone:     coach?.telephone     || '',
    aqua:          coach?.aqua          || false,
    fitness:       coach?.fitness       || false,
    boxe:          coach?.boxe          || false,
    crosstraining: coach?.crosstraining || false,
    poledance:     coach?.poledance     || false,
  });
  const [error, setSaving2] = useState(null);
  const [saving, setSaving]  = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaving2(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setSaving2(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {isNew ? 'Nouveau coach' : `${coach.prenom} ${coach.nom}`}
          </h2>
          {!isNew && (
            <div className="flex items-center gap-1">
              {!coach.actif && (
                <button
                  onClick={() => { onDelete(coach); onClose(); }}
                  className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50"
                >
                  Supprimer définitivement
                </button>
              )}
              <button
                onClick={() => { onToggle(coach); onClose(); }}
                className={`text-xs px-2 py-1 rounded ${coach.actif ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
              >
                {coach.actif ? 'Désactiver' : 'Réactiver'}
              </button>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
              <input value={form.prenom} onChange={e => set('prenom', e.target.value)} required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
            <input value={form.telephone} onChange={e => set('telephone', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Discipline(s)</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {Object.entries(DISCIPLINE_CONFIG).map(([key, cfg]) => (
                <label key={key} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className={`rounded ${cfg.accent}`} />
                  {cfg.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded py-2 text-sm hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving}
              className="flex-1 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#2fa8cc' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

const CATEGORIE_LABELS = { programme: 'Programmés', effectue: 'Effectués', annule: 'Annulés' };

export default function Coaches() {
  const [recap, setRecap]       = useState(null);
  const [dashboard, setDash]    = useState(null);
  const [modal, setModal]       = useState(null);
  const [showInactifs, setShowInactifs] = useState(false);
  const [loading, setLoading]   = useState(true);

  // Récapitulatif des heures : quels statuts comptent comme "réalisé"
  const [inclureEffectue, setInclureEffectue] = useState(true);
  const [inclurePaye, setInclurePaye]         = useState(true);

  // Tableau de bord : période
  const [periodeMode, setPeriodeMode] = useState('scolaire'); // 'tout' | 'scolaire' | 'libre'
  const [anneeScolaire, setAnneeScolaire] = useState(() => getAcademicYear().year);
  const [libreAnnee, setLibreAnnee] = useState(() => new Date().getFullYear());
  const [libreMois, setLibreMois]   = useState('');
  const [libreJour, setLibreJour]   = useState('');
  // Tableau de bord : catégorie (clic sur Prog./Effect./Annulés)
  const [statutCat, setStatutCat] = useState(null);

  const { months, debut, fin } = getLast13Months();
  const currentMois = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;
  })();

  function dashboardParams() {
    const base = periodeMode === 'tout' ? { periode: 'tout' }
      : periodeMode === 'scolaire' ? { debut: `${anneeScolaire}-08-01`, fin: `${anneeScolaire + 1}-07-31` }
      : (() => {
          const y = libreAnnee;
          if (!libreMois) return { debut: `${y}-01-01`, fin: `${y}-12-31` };
          if (!libreJour) {
            const finD = new Date(y, Number(libreMois), 0).getDate();
            return { debut: `${y}-${libreMois}-01`, fin: `${y}-${libreMois}-${String(finD).padStart(2, '0')}` };
          }
          return { debut: `${y}-${libreMois}-${libreJour}`, fin: `${y}-${libreMois}-${libreJour}` };
        })();
    return statutCat ? { ...base, statut: statutCat } : base;
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, d] = await Promise.all([
        api.getCoachesRecap({ debut, fin, effectue: inclureEffectue ? 1 : 0, paye: inclurePaye ? 1 : 0 }),
        api.getDashboard(dashboardParams()),
      ]);
      setRecap(r);
      setDash(d);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inclureEffectue, inclurePaye, periodeMode, anneeScolaire, libreAnnee, libreMois, libreJour, statutCat]);

  useEffect(() => { load(); }, [load]);

  function toggleCategorie(cat) {
    setStatutCat(prev => prev === cat ? null : cat);
  }

  async function handleSave(form) {
    if (modal?.id) await api.updateCoach(modal.id, form);
    else           await api.createCoach(form);
    load();
  }
  async function handleToggle(coach) {
    await api.toggleCoach(coach.id, !coach.actif);
    load();
  }
  async function handleDelete(coach) {
    if (!confirm(`Supprimer définitivement ${coach.prenom} ${coach.nom} ?\n\nIl disparaît de la liste mais reste visible sur les séances passées.`)) return;
    await api.deleteCoach(coach.id, true);
    load();
  }

  const coaches   = recap?.coaches || [];
  const displayed = showInactifs ? coaches : coaches.filter(c => c.actif);

  // Ligne total
  const totauxMois = {};
  let grandTotal = 0;
  for (const c of displayed) {
    for (const m of months) {
      totauxMois[m] = (totauxMois[m] || 0) + (c.mois[m] || 0);
    }
    grandTotal += c.total || 0;
  }

  const TH = 'z-20 bg-gray-100 px-2 py-2 text-xs font-bold text-gray-600 uppercase border border-gray-200 text-center whitespace-nowrap';

  const kpi    = dashboard?.kpi    || {};
  const mensuel = dashboard?.mensuel || [];
  const topCours = dashboard?.topCours || [];
  const topCoachs = dashboard?.topCoachs || [];
  const ANNEES_DISPONIBLES = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="space-y-8">

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Récapitulatif heures par coach
      ════════════════════════════════════════════════════════════ */}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Récapitulatif des heures effectuées</h1>
            <p className="text-xs text-gray-400 mt-0.5">13 derniers mois</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={inclureEffectue} onChange={e => setInclureEffectue(e.target.checked)} className="rounded" />
              Effectuées
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={inclurePaye} onChange={e => setInclurePaye(e.target.checked)} className="rounded" />
              Payées
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={showInactifs} onChange={e => setShowInactifs(e.target.checked)} className="rounded" />
              Inactifs
            </label>
            <button onClick={() => setModal({})}
              className="flex items-center gap-1.5 text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: '#2fa8cc' }}>
              <Plus className="h-4 w-4" /> Nouveau coach
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full border-collapse text-sm min-w-[860px]">
            <thead>
              <tr>
                <th className={`${TH} text-left sticky left-0 z-30 bg-gray-100`} style={{ minWidth: 92 }}>Coach</th>
                {months.map(m => (
                  <th key={m} className={`${TH}`}
                    style={m === currentMois ? { color: '#2fa8cc', backgroundColor: '#eef9fd' } : {}}>
                    {MOIS_COURTS[m.slice(5,7)]}
                  </th>
                ))}
                <th className={`${TH}`} style={{ color: '#1a7a9b' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((coach, i) => {
                const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
                return (
                  <tr key={coach.id} style={{ backgroundColor: bg }} className={coach.actif ? '' : 'opacity-40'}>
                    <td className="sticky left-0 z-10 border-b border-gray-100 px-2 py-1.5 font-semibold" style={{ backgroundColor: bg, maxWidth: 92 }}>
                      <button onClick={() => setModal(coach)} title={`${coach.prenom} ${coach.nom}`}
                        className="hover:underline text-left truncate block w-full" style={{ color: '#1a7a9b' }}>
                        {coach.prenom} {coach.nom}
                      </button>
                    </td>
                    {months.map(m => {
                      const v = coach.mois[m];
                      return (
                        <td key={m} className="border-b border-gray-100 px-2 py-1.5 text-center text-xs tabular-nums"
                          style={{ color: v ? '#111' : '#d1d5db', backgroundColor: m === currentMois ? '#eef9fd' : undefined }}>
                          {v ? fmtH(v) : '—'}
                        </td>
                      );
                    })}
                    <td className="border-b border-gray-100 px-3 py-1.5 text-center font-bold text-xs tabular-nums" style={{ color: '#1a7a9b' }}>
                      {coach.total ? fmtH(coach.total) : '—'}
                    </td>
                  </tr>
                );
              })}

              {/* Ligne total */}
              <tr style={{ backgroundColor: '#f0f9ff' }}>
                <td className="sticky left-0 z-10 px-3 py-2 font-extrabold text-xs uppercase tracking-wide border-t-2 border-gray-300" style={{ backgroundColor: '#f0f9ff', color: '#1a7a9b' }}>
                  Total
                </td>
                {months.map(m => (
                  <td key={m} className="px-2 py-2 text-center text-xs font-bold tabular-nums border-t-2 border-gray-300"
                    style={{ color: '#1a7a9b', backgroundColor: m === currentMois ? '#d6f3fb' : undefined }}>
                    {totauxMois[m] ? fmtH(Math.round(totauxMois[m] * 100)/100) : '—'}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-extrabold text-xs tabular-nums border-t-2 border-gray-300" style={{ color: '#1a7a9b' }}>
                  {fmtH(Math.round(grandTotal * 100)/100)}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Dashboard KPI (saison en cours)
      ════════════════════════════════════════════════════════════ */}

      {!loading && dashboard && (
        <div>
          {/* Titre dashboard */}
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Tableau de bord · {periodeLabel(periodeMode, anneeScolaire, libreAnnee, libreMois, libreJour)}
          </h2>

          {/* Filtre période */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
            <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Période</span>
            <select value={periodeMode} onChange={e => setPeriodeMode(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300">
              <option value="scolaire">Année scolaire</option>
              <option value="libre">Date libre</option>
              <option value="tout">De tout temps</option>
            </select>
            {periodeMode === 'scolaire' && (
              <select value={anneeScolaire} onChange={e => setAnneeScolaire(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300">
                {ANNEES_DISPONIBLES.map(y => <option key={y} value={y}>{y}–{y + 1}</option>)}
              </select>
            )}
            {periodeMode === 'libre' && (
              <>
                <select value={libreAnnee} onChange={e => setLibreAnnee(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300">
                  {ANNEES_DISPONIBLES.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={libreMois} onChange={e => { setLibreMois(e.target.value); setLibreJour(''); }}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300">
                  <option value="">Toute l&apos;année</option>
                  {Object.entries(MOIS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                {libreMois && (
                  <select value={libreJour} onChange={e => setLibreJour(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300">
                    <option value="">Tout le mois</option>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
              </>
            )}
            {statutCat && (
              <button onClick={() => setStatutCat(null)}
                className="ml-1 text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200">
                Top Cours/Coachs filtrés : {CATEGORIE_LABELS[statutCat]} ✕
              </button>
            )}
          </div>

          {/* KPI cards (cliquables : filtrent Top Cours/Top Coachs par catégorie) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button onClick={() => toggleCategorie('programme')}
              className="border-2 rounded-lg p-5 text-center transition-shadow"
              style={{ borderColor: '#5bcae8', backgroundColor: '#eef9fd', boxShadow: statutCat === 'programme' ? '0 0 0 3px #5bcae880' : undefined }}>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Cours programmés</div>
              <div className="text-4xl font-extrabold" style={{ color: '#1a7a9b' }}>{kpi.total ?? '—'}</div>
            </button>
            <button onClick={() => toggleCategorie('effectue')}
              className="border-2 rounded-lg p-5 text-center transition-shadow"
              style={{ borderColor: '#86efac', backgroundColor: '#f0fdf4', boxShadow: statutCat === 'effectue' ? '0 0 0 3px #86efac80' : undefined }}>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Cours effectués</div>
              <div className="text-4xl font-extrabold text-green-600">{kpi.effectues ?? '—'}</div>
            </button>
            <button onClick={() => toggleCategorie('annule')}
              className="border-2 rounded-lg p-5 text-center transition-shadow"
              style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2', boxShadow: statutCat === 'annule' ? '0 0 0 3px #fca5a580' : undefined }}>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Taux d&apos;annulation</div>
              <div className="text-4xl font-extrabold text-red-500">{pct(kpi.annules, kpi.total)}</div>
            </button>
          </div>

          {/* Tableau mensuel + graphique */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tableau fréquentation mensuelle */}
            <div className="overflow-x-auto">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Fréquentation mensuelle</h3>
              <table className="w-full border-collapse text-xs min-w-[520px]">
                <thead>
                  <tr style={{ backgroundColor: '#2fa8cc', color: '#fff' }}>
                    {['Mois','Prog.','Effect.','Annulés','Annul. %','Effectif','Moy.','Heures'].map((h, i) => {
                      const cat = { 1: 'programme', 2: 'effectue', 3: 'annule' }[i];
                      const actif = cat && statutCat === cat;
                      return (
                        <th key={h}
                          onClick={cat ? () => toggleCategorie(cat) : undefined}
                          title={cat ? `Filtrer Top Cours/Top Coachs par : ${CATEGORIE_LABELS[cat]}` : undefined}
                          className={`px-2 py-1.5 font-bold ${i === 0 ? 'text-left' : 'text-center'} ${cat ? 'cursor-pointer select-none hover:bg-white/10' : ''} ${actif ? 'underline decoration-2 underline-offset-2' : ''}`}>
                          {h}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {mensuel.map((row, i) => {
                    const taux = row.programmes ? (row.annules / row.programmes * 100).toFixed(2) : '0';
                    const moy  = row.effectues  ? Math.round(row.effectif / row.effectues) : 0;
                    const heurs = Math.round((row.total_minutes || 0) / 60 * 100) / 100;
                    const bg   = i % 2 === 0 ? '#f9fafb' : '#ffffff';
                    return (
                      <tr key={row.mois} style={{ backgroundColor: bg }}>
                        <td className="px-2 py-1 border-b border-gray-100 capitalize font-medium">
                          {MOIS_LABELS[row.mois.slice(5,7)]}
                        </td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums">{row.programmes}</td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums text-green-700">{row.effectues}</td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums text-red-500">{row.annules}</td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums">{taux} %</td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums">{row.effectif || 0}</td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums">{moy || '—'}</td>
                        <td className="px-2 py-1 border-b border-gray-100 text-center tabular-nums font-medium" style={{ color: '#1a7a9b' }}>{fmtH(heurs)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Graphique heures par mois */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">Total heures par mois</h3>
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <LineChart
                  data={mensuel.map(m => ({ mois: m.mois, heures: Math.round((m.total_minutes||0)/60*100)/100 }))}
                  xKey="mois"
                  yKey="heures"
                  color="#5bcae8"
                  label="Heures"
                />
              </div>
            </div>
          </div>

          {/* Top cours + Top coachs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Top Cours{statutCat && <span className="text-gray-400 font-normal"> · {CATEGORIE_LABELS[statutCat]}</span>}
              </h3>
              <table className="w-full border-collapse text-xs min-w-[360px]">
                <thead>
                  <tr style={{ backgroundColor: '#2fa8cc', color: '#fff' }}>
                    {['Cours','Séances','Participants','Moyenne'].map((h, i) => (
                      <th key={h} className={`px-3 py-1.5 font-bold ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCours.map((row, i) => (
                    <tr key={row.nom} style={{ backgroundColor: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                      <td className="px-3 py-1.5 border-b border-gray-100 font-medium">{row.nom}</td>
                      <td className="px-3 py-1.5 border-b border-gray-100 text-center tabular-nums">{row.seances}</td>
                      <td className="px-3 py-1.5 border-b border-gray-100 text-center tabular-nums">{row.total_presents || '—'}</td>
                      <td className="px-3 py-1.5 border-b border-gray-100 text-center tabular-nums">{row.moy_presents ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Top Coachs{statutCat && <span className="text-gray-400 font-normal"> · {CATEGORIE_LABELS[statutCat]}</span>}
              </h3>
              <table className="w-full border-collapse text-xs min-w-[360px]">
                <thead>
                  <tr style={{ backgroundColor: '#c9a464', color: '#fff' }}>
                    {['Coach','Heures','Séances','Moy. présents'].map((h, i) => (
                      <th key={h} className={`px-3 py-1.5 font-bold ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCoachs.map((row, i) => (
                    <tr key={row.coach} style={{ backgroundColor: i % 2 === 0 ? '#fdf6ec' : '#ffffff' }}>
                      <td className="px-3 py-1.5 border-b border-gray-100 font-medium">{row.coach}</td>
                      <td className="px-3 py-1.5 border-b border-gray-100 text-center tabular-nums font-bold" style={{ color: '#1a7a9b' }}>{fmtH(row.heures)}</td>
                      <td className="px-3 py-1.5 border-b border-gray-100 text-center tabular-nums">{row.seances}</td>
                      <td className="px-3 py-1.5 border-b border-gray-100 text-center tabular-nums">{row.moy_presents ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modale coach */}
      {modal !== null && (
        <CoachModal
          coach={modal?.id ? modal : null}
          onSave={handleSave}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
