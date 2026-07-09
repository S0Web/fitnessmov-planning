import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  getLundi, getSemaine, toISO,
  semaineSuivante, semainePrecedente, colorForUser,
} from '../lib/utils';
import MiniCalendar from '../components/MiniCalendar';
import PersonnelCreneauModal from '../components/PersonnelCreneauModal';

const TYPE_CONFIG = {
  cp:     { label: 'CP',     bg: '#fef3c7', text: '#92400e' },
  ecole:  { label: 'École',  bg: '#d1fae5', text: '#065f46' },
  ferie:  { label: 'Férié',  bg: '#f3e8ff', text: '#6b21a8' },
  arret:  { label: 'Arrêt',  bg: '#fee2e2', text: '#991b1b' },
  repos:  { label: 'Repos',  bg: '#f3f4f6', text: '#6b7280' },
};

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

function fmtHeures(totalMinutes) {
  if (!totalMinutes) return '—';
  const h = totalMinutes / 60;
  return (Number.isInteger(h) ? String(h) : h.toFixed(1).replace('.', ',')) + 'h';
}

function CpSummary({ isManager }) {
  const [cp, setCp] = useState([]);

  useEffect(() => { api.getCpSummary().then(setCp).catch(() => {}); }, []);

  if (cp.length === 0) return null;

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs">
      <div className="font-semibold text-gray-500 text-[11px] uppercase tracking-wide mb-2">CP pris</div>
      {isManager ? (
        <div className="space-y-1.5">
          {cp.map(c => (
            <div key={c.id} className="flex justify-between items-center text-gray-600">
              <span>{c.prenom}</span>
              <span className="font-semibold text-gray-700 tabular-nums">{c.cp}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-between items-center text-gray-600">
          <span>Mes CP</span>
          <span className="font-semibold text-gray-700 tabular-nums">{cp[0].cp}</span>
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
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
            <table className="w-full border-collapse table-fixed text-sm">
              <colgroup>
                <col style={{ width: '150px' }} />
                {semaine.map((_, i) => <col key={i} />)}
                <col style={{ width: '68px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky top-14 z-20 bg-gray-50 border-b border-gray-200 rounded-tl-xl p-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Employé
                  </th>
                  {semaine.map((date) => {
                    const iso = toISO(date);
                    const isToday = iso === today;
                    return (
                      <th key={iso} className={`sticky top-14 z-20 border-b border-gray-200 p-1.5 text-center ${isToday ? 'bg-sky-50' : 'bg-gray-50'}`}>
                        <div className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-sky-500' : 'text-gray-400'}`}>
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className={`text-sm font-bold leading-none mt-0.5 ${isToday ? 'text-sky-700' : 'text-gray-600'}`}>
                          {date.getDate()}
                        </div>
                      </th>
                    );
                  })}
                  <th className="sticky top-14 z-20 bg-sky-50 border-b border-gray-200 rounded-tr-xl p-2 text-center text-[11px] font-bold text-sky-700 uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(emp => {
                  const empCreneaux = creneaux.filter(c => c.employe_id === emp.id);
                  const travail = empCreneaux.filter(c => c.type === 'travail');
                  const totalMinutes = travail.reduce((sum, c) => sum + (toMinutes(c.fin) - toMinutes(c.debut)), 0);

                  return (
                    <tr key={emp.id} className="group/row hover:bg-gray-50/60 transition-colors">
                      <td className="sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/60 border-r border-gray-100 px-3 py-2 align-middle transition-colors">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: colorForUser(emp.id) }}
                          >
                            {emp.prenom?.[0]}{emp.nom?.[0]}
                          </span>
                          <span className="font-medium text-gray-700 truncate">{emp.prenom} {emp.nom}</span>
                        </div>
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
                            className="group/cell p-1 min-w-[100px] h-14 cursor-pointer align-middle">
                            <div
                              className="h-full w-full rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                              style={{ backgroundColor: typeCfg ? typeCfg.bg : 'transparent' }}
                            >
                              {cellCreneaux.length === 0 && (
                                <span className="text-gray-300 text-base leading-none opacity-0 group-hover/cell:opacity-100 transition-opacity">+</span>
                              )}
                              {typeCfg && (
                                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: typeCfg.text }}>
                                  {typeCfg.label}
                                </span>
                              )}
                              {!isAbsence && cellCreneaux.map(c => (
                                <div key={c.id} className="text-[13px] font-semibold text-gray-600 tabular-nums text-center leading-snug">
                                  {fmtTime(c.debut)} - {fmtTime(c.fin)}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center text-sm font-bold text-sky-700 bg-sky-50/60 tabular-nums">
                        {fmtHeures(totalMinutes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
