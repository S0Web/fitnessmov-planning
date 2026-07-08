import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import {
  getLundi, getSemaine, toISO,
  semaineSuivante, semainePrecedente, STATUT_CONFIG,
} from '../lib/utils';
import SeanceCard from '../components/SeanceCard';
import SeanceModal from '../components/SeanceModal';
import MiniCalendar from '../components/MiniCalendar';
import TaskWidget from '../components/TaskWidget';
import HeadcountPopover from '../components/HeadcountPopover';
import { nextStatut } from '../lib/statutCycle';

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseMinutes(horaire) {
  if (!horaire) return 0;
  if (horaire.includes('h')) {
    const [h, m] = horaire.split('h');
    return parseInt(h) * 60 + (m ? parseInt(m) || 0 : 0);
  }
  if (horaire.includes(':')) {
    const [h, m] = horaire.split(':');
    return parseInt(h) * 60 + parseInt(m);
  }
  return parseInt(horaire) * 60;
}

function formatHoraire(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

const CUTOFF = 14 * 60;

const ROWS = [
  { id: 'aqua-matin',     l1: 'Aqua',    l2: 'Matin',      categorie: 'aqua',    matin: true,  hdrBg: '#2fa8cc', hdrTxt: '#fff', cellBg: '#eef9fd' },
  { id: 'fitness-matin',  l1: 'Fitness', l2: 'Matin',      categorie: 'fitness', matin: true,  hdrBg: '#c9a464', hdrTxt: '#fff', cellBg: '#fdf6ec' },
  { id: 'aqua-apmidi',    l1: 'Aqua',    l2: 'Après-midi', categorie: 'aqua',    matin: false, hdrBg: '#1a7a9b', hdrTxt: '#fff', cellBg: '#e8f7fc' },
  { id: 'fitness-apmidi', l1: 'Fitness', l2: 'Après-midi', categorie: 'fitness', matin: false, hdrBg: '#9a7535', hdrTxt: '#fff', cellBg: '#faeedd' },
];

// ── Vue grille ─────────────────────────────────────────────────────────────────

function VueGrille({ semaine, seances, loading, today, onOpenCard, onPatch, onDelete, onAdd }) {
  return (
    <div>
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col style={{ width: '72px' }} />
          {semaine.map((_, i) => <col key={i} />)}
        </colgroup>

        <thead>
          <tr>
            <th className="sticky top-14 z-20 bg-gray-100 border border-gray-300 p-0" />
            {semaine.map((date) => {
              const iso = toISO(date);
              const isToday = iso === today;
              return (
                <th key={iso} className={`sticky top-14 z-20 border border-gray-300 p-0 text-center ${isToday ? 'bg-sky-600' : 'bg-gray-100'}`}>
                  <div className={`px-1 py-1.5 ${isToday ? 'text-white' : 'text-gray-700'}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wide ${isToday ? 'text-sky-100' : 'text-gray-400'}`}>
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold leading-none ${isToday ? 'text-white' : 'text-gray-800'}`}>
                      {date.getDate()}
                    </div>
                    <div className={`text-[10px] ${isToday ? 'text-sky-200' : 'text-gray-400'}`}>
                      {date.toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {ROWS.map(row => (
            <tr key={row.id}>
              {/* Label en 2 lignes */}
              <td
                style={{ backgroundColor: row.hdrBg, color: row.hdrTxt }}
                className="sticky left-0 z-10 border border-gray-300 px-1.5 py-2 align-middle text-center"
              >
                <div className="text-[11px] font-bold uppercase leading-tight">{row.l1}</div>
                <div className="text-[10px] font-medium opacity-80 leading-tight">{row.l2}</div>
              </td>

              {semaine.map((date) => {
                const iso = toISO(date);
                const cellSeances = seances.filter(s =>
                  s.date === iso &&
                  s.categorie === row.categorie &&
                  (row.matin ? parseMinutes(s.horaire) < CUTOFF : parseMinutes(s.horaire) >= CUTOFF)
                );
                return (
                  <td key={iso} style={{ backgroundColor: row.cellBg }} className="border border-gray-200 align-top p-1 min-w-[110px]">
                    <div className="space-y-1">
                      {loading && cellSeances.length === 0 && (
                        <div className="h-4 bg-white/60 rounded animate-pulse" />
                      )}
                      {cellSeances.map(s => (
                        <SeanceCard key={s.id} seance={s} onPatch={onPatch} onDelete={onDelete} onClick={onOpenCard} />
                      ))}
                      <button
                        onClick={() => onAdd(iso)}
                        className="w-full text-[10px] text-gray-400 hover:text-sky-600 py-0.5 border border-dashed border-gray-200 hover:border-sky-300 bg-white/40 rounded transition-colors"
                      >+</button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Vue liste ──────────────────────────────────────────────────────────────────

function VueListe({ seances, loading, onOpenCard, onPatch, onDelete }) {
  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>;
  if (!seances.length) return null;

  // Grouper par date pour insérer des séparateurs
  const byDate = seances.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const TH = 'sticky top-14 z-20 bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide border border-gray-200';

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className={`${TH} text-left`}>Horaire</th>
            <th className={`${TH} text-left`}>Cours</th>
            <th className={`${TH} text-left`}>Catégorie</th>
            <th className={`${TH} text-left`}>Coach</th>
            <th className={`${TH} text-left`}>Statut</th>
            <th className={`${TH} text-center`}>Présents</th>
            <th className={`${TH} text-left`}>Pointeur</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(byDate).map(([date, rows]) => {
            const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long'
            });
            return [
              // Séparateur de jour
              <tr key={`sep-${date}`}>
                <td colSpan={7} style={{ backgroundColor: '#5bcae8' }} className="text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider capitalize">
                  {dayLabel}
                </td>
              </tr>,
              // Lignes de séances
              ...rows.map((s, i) => {
                const startMins = parseMinutes(s.horaire);
                const endMins = startMins + (s.duree_minutes || 60);
                const statut = STATUT_CONFIG[s.statut] || STATUT_CONFIG.programme;
                const isAqua = s.categorie === 'aqua';
                const sansCoach = !s.coach_prenom && !s.coach_nom;
                const bg = sansCoach ? '#fee2e2' : (i % 2 === 0 ? '#ffffff' : '#f9fafb');

                return (
                  <tr
                    key={s.id}
                    onClick={() => onOpenCard(s)}
                    style={{ backgroundColor: bg }}
                    className={`hover:opacity-80 cursor-pointer ${s.statut === 'annule' ? 'opacity-40' : ''}`}
                  >
                    <td className="px-3 py-1.5 border-b border-gray-100 tabular-nums text-xs text-gray-600 whitespace-nowrap">
                      {formatHoraire(startMins)} – {formatHoraire(endMins)}
                    </td>
                    <td className="px-3 py-1.5 border-b border-gray-100 font-semibold text-gray-800 text-xs">
                      {s.cours_nom}
                    </td>
                    <td className="px-3 py-1.5 border-b border-gray-100">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
                        ${isAqua ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isAqua ? 'Aqua' : 'Fitness'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border-b border-gray-100 text-xs text-gray-600">
                      {s.coach_prenom} {s.coach_nom}
                    </td>
                    <td className="px-3 py-1.5 border-b border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatch(s.id, { statut: nextStatut(s.statut) });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide hover:opacity-80 ${statut.bg} ${statut.text}`}
                      >
                        {statut.label}
                      </button>
                    </td>
                    <td className="px-3 py-1.5 border-b border-gray-100 text-center text-xs text-gray-500">
                      <HeadcountPopover value={s.nb_presents} onSelect={(n) => onPatch(s.id, { nb_presents: n })}>
                        {s.nb_presents ?? '—'}
                      </HeadcountPopover>
                    </td>
                    <td className="px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500">
                      {s.pointeur_nom ?? '—'}
                    </td>
                  </tr>
                );
              })
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function Planning() {
  const [lundi, setLundi]         = useState(() => getLundi());
  const [seances, setSeances]     = useState([]);
  const [coaches, setCoaches]     = useState([]);
  const [coursTypes, setCoursTypes] = useState([]);
  const [pointeurs, setPointeurs] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(null);
  const [vue, setVue]             = useState('grille');
  const [dupliquer, setDupliquer] = useState(false);

  const semaine = getSemaine(lundi);

  const loadSeances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSeances(toISO(lundi));
      setSeances(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [lundi]);

  useEffect(() => {
    api.getCoaches().then(setCoaches).catch(() => {});
    api.getCoursTypes().then(setCoursTypes).catch(() => {});
    api.getPointeurs().then(setPointeurs).catch(() => {});
  }, []);

  useEffect(() => { loadSeances(); }, [loadSeances]);

  async function handlePatch(id, data) {
    await api.patchSeance(id, data);
    loadSeances();
  }
  async function handleDelete(id) {
    if (!confirm('Supprimer cette séance ?')) return;
    await api.deleteSeance(id);
    setSeances(prev => prev.filter(s => s.id !== id));
  }
  async function handleSave(payload) {
    if (modal && typeof modal === 'object') {
      await api.patchSeance(modal.id, payload);
    } else if (modal && typeof modal === 'string') {
      await api.createSeance({ ...payload, date: modal.replace('new:', '') });
    }
    setModal(null);
    loadSeances();
  }
  async function handleDupliquer() {
    const source = toISO(semainePrecedente(lundi));
    setDupliquer(true);
    try {
      await api.dupliquerSemaine(source, toISO(lundi));
      await loadSeances();
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setDupliquer(false);
    }
  }

  const today = toISO(new Date());
  const isCurrentWeek = semaine.some(d => toISO(d) === today);
  const semaineVide = !loading && seances.length === 0;
  const total     = seances.length;
  const effectues = seances.filter(s => s.statut === 'effectue' || s.statut === 'paye').length;
  const annules   = seances.filter(s => s.statut === 'annule').length;
  const seanceEnEdition = modal && typeof modal === 'object' ? modal : null;

  return (
    <div className="flex gap-4">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-48 flex-shrink-0">
        <MiniCalendar lundi={lundi} onSelectDate={(d) => setLundi(getLundi(d))} />

        <div className="mt-3 bg-white border border-gray-200 rounded px-3 py-2 text-xs space-y-1.5">
          <div className="font-semibold text-gray-600 text-[11px] uppercase tracking-wide mb-1">Séances</div>
          <div className="flex justify-between text-gray-600"><span>Total</span><span className="font-bold">{total}</span></div>
          <div className="flex justify-between text-green-700"><span>Effectués</span><span className="font-bold">{effectues}</span></div>
          {annules > 0 && <div className="flex justify-between text-red-600"><span>Annulés</span><span className="font-bold">{annules}</span></div>}
        </div>

        <div className="mt-3">
          <TaskWidget lundi={lundi} />
        </div>
      </aside>

      {/* ── Contenu ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Barre navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button onClick={() => setLundi(semainePrecedente(lundi))}
              className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded">←</button>
            <button onClick={() => setLundi(getLundi())}
              style={isCurrentWeek ? { backgroundColor: '#2fa8cc', color: '#fff' } : {}}
              className={`px-2.5 py-1.5 text-sm font-medium rounded transition-colors ${
                isCurrentWeek ? '' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}>Auj.</button>
            <button onClick={() => setLundi(semaineSuivante(lundi))}
              className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded">→</button>
            <span className="ml-1 text-xs sm:text-sm font-semibold text-gray-700 truncate">
              <span className="hidden sm:inline">
                {semaine[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                {' – '}
                {semaine[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="sm:hidden">
                {semaine[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' – '}
                {semaine[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </span>
          </div>

          <div className="flex items-center bg-gray-100 rounded p-0.5 gap-0.5 flex-shrink-0">
            <button onClick={() => setVue('grille')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                vue === 'grille' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>⊞ Grille</button>
            <button onClick={() => setVue('liste')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                vue === 'liste' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>☰ Liste</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700 mb-3">
            Erreur : {error} — <button onClick={loadSeances} className="underline">Réessayer</button>
          </div>
        )}

        {/* Semaine vide — bouton dupliquer */}
        {semaineVide && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
            <p className="text-sm">Aucune séance cette semaine.</p>
            <button
              onClick={handleDupliquer}
              disabled={dupliquer}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-medium rounded hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {dupliquer ? 'Duplication…' : '⧉ Dupliquer la semaine précédente'}
            </button>
            <p className="text-xs text-gray-400">Copie les cours de la semaine du {semainePrecedente(lundi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} en statut Programmé</p>
          </div>
        )}

        {!semaineVide && vue === 'grille' && (
          <VueGrille
            semaine={semaine}
            seances={seances}
            loading={loading}
            today={today}
            onOpenCard={(s) => setModal(s)}
            onPatch={handlePatch}
            onDelete={handleDelete}
            onAdd={(iso) => setModal(`new:${iso}`)}
          />
        )}

        {!semaineVide && vue === 'liste' && (
          <VueListe
            seances={seances}
            loading={loading}
            onOpenCard={(s) => setModal(s)}
            onPatch={handlePatch}
            onDelete={handleDelete}
          />
        )}
      </div>

      {modal !== null && (
        <SeanceModal
          seance={seanceEnEdition}
          coaches={coaches}
          coursTypes={coursTypes}
          pointeurs={pointeurs}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onPointeursChange={setPointeurs}
        />
      )}
    </div>
  );
}
