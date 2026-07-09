import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  getLundi, getSemaine, toISO,
  semaineSuivante, semainePrecedente,
} from '../lib/utils';
import MiniCalendar from '../components/MiniCalendar';
import PersonnelCreneauModal from '../components/PersonnelCreneauModal';

const TYPE_CONFIG = {
  cp:     { label: 'CP',     bg: '#fde68a', text: '#78350f' },
  ecole:  { label: 'École',  bg: '#a7f3d0', text: '#065f46' },
  ferie:  { label: 'Férié',  bg: '#e9d5ff', text: '#581c87' },
  arret:  { label: 'Arrêt',  bg: '#fecaca', text: '#7f1d1d' },
  repos:  { label: 'Repos',  bg: '#e5e7eb', text: '#4b5563' },
};

const CODE_COULEUR_CONFIG = {
  ouverture: { label: 'Ouverture', bg: '#93c5fd', text: '#1e3a8a' },
  milieu:    { label: 'Milieu',    bg: '#fca5a5', text: '#7f1d1d' },
  fermeture: { label: 'Fermeture', bg: '#c4b5fd', text: '#4c1d95' },
};

// Horaires d'ouverture de la salle
const OUVERTURE_SEMAINE = 7 * 60 + 30, FERMETURE_SEMAINE = 22 * 60;
const OUVERTURE_WEEKEND = 9 * 60,      FERMETURE_WEEKEND = 18 * 60;
const TOLERANCE = 15; // minutes

function fmtTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':');
  const hh = parseInt(h, 10);
  return m === '00' ? `${hh}h` : `${hh}h${m}`;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isWeekend(iso) {
  const day = new Date(iso + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

function fmtHeures(totalMinutes) {
  if (!totalMinutes) return '—';
  const h = totalMinutes / 60;
  return (Number.isInteger(h) ? String(h) : h.toFixed(1).replace('.', ',')) + 'h';
}

// Détermine si la semaine d'un employé est plutôt Ouverture / Milieu / Fermeture,
// à partir de ses créneaux travail comparés aux horaires de la salle.
function computeCodeCouleur(travailCreneaux) {
  const parDate = {};
  travailCreneaux.forEach(c => {
    if (!c.debut || !c.fin) return;
    (parDate[c.date] ||= []).push(c);
  });

  let ouverture = 0, fermeture = 0, milieu = 0;
  for (const [date, segs] of Object.entries(parDate)) {
    const weekend = isWeekend(date);
    const debutSalle = weekend ? OUVERTURE_WEEKEND : OUVERTURE_SEMAINE;
    const finSalle   = weekend ? FERMETURE_WEEKEND : FERMETURE_SEMAINE;
    const debutMin = Math.min(...segs.map(s => toMinutes(s.debut)));
    const finMax   = Math.max(...segs.map(s => toMinutes(s.fin)));
    const faitOuverture = debutMin <= debutSalle + TOLERANCE;
    const faitFermeture = finMax >= finSalle - TOLERANCE;
    if (faitOuverture) ouverture++;
    if (faitFermeture) fermeture++;
    if (!faitOuverture && !faitFermeture) milieu++;
  }

  if (ouverture === 0 && fermeture === 0 && milieu === 0) return null;
  if (ouverture >= fermeture && ouverture >= milieu) return 'ouverture';
  if (fermeture >= milieu) return 'fermeture';
  return 'milieu';
}

function CpSummary({ isManager }) {
  const [cp, setCp] = useState([]);

  useEffect(() => { api.getCpSummary().then(setCp).catch(() => {}); }, []);

  if (cp.length === 0) return null;

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded px-3 py-2 text-xs">
      <div className="font-semibold text-gray-600 text-[11px] uppercase tracking-wide mb-1.5">CP pris</div>
      {isManager ? (
        <div className="space-y-1">
          {cp.map(c => (
            <div key={c.id} className="flex justify-between text-gray-600">
              <span>{c.prenom}</span>
              <span className="font-bold">{c.cp}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-between text-gray-600">
          <span>Mes CP</span>
          <span className="font-bold">{cp[0].cp}</span>
        </div>
      )}
    </div>
  );
}

export default function PlanningPersonnel() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [lundi, setLundi]     = useState(() => getLundi());
  const [profils, setProfils] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cellModal, setCellModal] = useState(null); // { employe, date }

  const semaine = getSemaine(lundi);

  const loadProfils = useCallback(() => {
    api.getProfiles().then(setProfils).catch(() => {});
  }, []);

  const loadCreneaux = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPersonnelCreneaux(toISO(lundi));
      setCreneaux(data);
    } finally {
      setLoading(false);
    }
  }, [lundi]);

  useEffect(() => { loadProfils(); }, [loadProfils]);
  useEffect(() => { loadCreneaux(); }, [loadCreneaux]);

  async function handleSaveCreneau(payload) {
    await api.upsertPersonnelCreneau(cellModal.employe.id, cellModal.date, payload);
    loadCreneaux();
  }

  const today = toISO(new Date());

  // Profils actifs + profils inactifs ayant au moins un créneau cette semaine
  const rows = useMemo(() => {
    const activeIds = new Set(profils.map(p => p.id));
    const extras = new Map();
    creneaux.forEach(c => {
      if (!activeIds.has(c.employe_id) && !extras.has(c.employe_id)) {
        extras.set(c.employe_id, { id: c.employe_id, prenom: c.prenom, nom: c.nom });
      }
    });
    return [...profils, ...extras.values()].sort((a, b) => a.prenom.localeCompare(b.prenom));
  }, [profils, creneaux]);

  return (
    <div className="flex gap-4">
      <aside className="hidden lg:block w-48 flex-shrink-0">
        <MiniCalendar lundi={lundi} onSelectDate={(d) => setLundi(getLundi(d))} />
        <CpSummary isManager={isManager} />
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h1 className="text-lg font-bold text-gray-800 mr-2">Planning personnel</h1>
          <button onClick={() => setLundi(semainePrecedente(lundi))}
            className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded">←</button>
          <button onClick={() => setLundi(getLundi())}
            className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded">Auj.</button>
          <button onClick={() => setLundi(semaineSuivante(lundi))}
            className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium rounded">→</button>
          <span className="ml-1 text-sm font-semibold text-gray-700">
            {semaine[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            {' – '}
            {semaine[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">Aucun profil — ajoute-en un depuis l'écran d'accueil.</p>
        ) : (
          <table className="w-full border-collapse table-fixed text-sm">
            <colgroup>
              <col style={{ width: '110px' }} />
              {semaine.map((_, i) => <col key={i} />)}
              <col style={{ width: '64px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky top-14 z-20 bg-gray-100 border border-gray-300 p-2 text-left text-xs font-bold text-gray-500 uppercase">Employé</th>
                {semaine.map((date) => {
                  const iso = toISO(date);
                  const isToday = iso === today;
                  return (
                    <th key={iso} className={`sticky top-14 z-20 border border-gray-300 p-1.5 text-center ${isToday ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wide ${isToday ? 'text-sky-100' : 'text-gray-400'}`}>
                        {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-bold leading-none">{date.getDate()}</div>
                    </th>
                  );
                })}
                <th className="sticky top-14 z-20 bg-gray-100 border border-gray-300 p-2 text-center text-xs font-bold text-gray-500 uppercase">Total</th>
                <th className="sticky top-14 z-20 bg-gray-100 border border-gray-300 p-2 text-center text-xs font-bold text-gray-500 uppercase">Code couleur</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(emp => {
                const empCreneaux = creneaux.filter(c => c.employe_id === emp.id);
                const travail = empCreneaux.filter(c => c.type === 'travail');
                const totalMinutes = travail.reduce((sum, c) => sum + (toMinutes(c.fin) - toMinutes(c.debut)), 0);
                const codeCouleur = computeCodeCouleur(travail);
                const ccCfg = codeCouleur ? CODE_COULEUR_CONFIG[codeCouleur] : null;

                return (
                  <tr key={emp.id}>
                    <td className="sticky left-0 z-10 bg-white border border-gray-200 px-2 py-2 font-semibold text-gray-700 align-top">
                      {emp.prenom} {emp.nom}
                    </td>
                    {semaine.map(date => {
                      const iso = toISO(date);
                      const cellCreneaux = empCreneaux
                        .filter(c => c.date === iso)
                        .sort((a, b) => a.ordre - b.ordre);
                      const isAbsence = cellCreneaux.length > 0 && cellCreneaux[0].type !== 'travail';
                      const typeCfg = isAbsence ? TYPE_CONFIG[cellCreneaux[0].type] : null;

                      return (
                        <td key={iso} onClick={() => setCellModal({ employe: emp, date: iso })}
                          style={typeCfg ? { backgroundColor: typeCfg.bg } : undefined}
                          className={`border border-gray-200 p-0 min-w-[100px] h-16 cursor-pointer transition-colors ${typeCfg ? '' : 'hover:bg-sky-50'}`}>
                          <div className="h-full w-full flex flex-col items-center justify-center gap-1.5 px-1">
                            {cellCreneaux.length === 0 && (
                              <span className="text-gray-300 text-lg leading-none">+</span>
                            )}
                            {typeCfg && (
                              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: typeCfg.text }}>
                                {typeCfg.label}
                              </span>
                            )}
                            {!isAbsence && cellCreneaux.map(c => (
                              <div key={c.id} className="text-sm font-semibold text-gray-700 tabular-nums text-center leading-tight">
                                {fmtTime(c.debut)} - {fmtTime(c.fin)}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 text-center text-sm font-bold text-gray-700 tabular-nums">
                      {fmtHeures(totalMinutes)}
                    </td>
                    <td className="border border-gray-200 p-0"
                      style={ccCfg ? { backgroundColor: ccCfg.bg } : undefined}>
                      {ccCfg && (
                        <div className="h-full flex items-center justify-center py-2">
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: ccCfg.text }}>
                            {ccCfg.label}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {cellModal && (
        <PersonnelCreneauModal
          employe={cellModal.employe}
          date={cellModal.date}
          creneaux={creneaux.filter(c => c.employe_id === cellModal.employe.id && c.date === cellModal.date).sort((a, b) => a.ordre - b.ordre)}
          onSave={handleSaveCreneau}
          onClose={() => setCellModal(null)}
        />
      )}
    </div>
  );
}
