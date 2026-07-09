import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import {
  getLundi, getSemaine, toISO,
  semaineSuivante, semainePrecedente,
} from '../lib/utils';
import MiniCalendar from '../components/MiniCalendar';
import PersonnelCreneauModal from '../components/PersonnelCreneauModal';

const TYPE_CONFIG = {
  cp:     { label: 'CP',     bg: 'bg-amber-100',   text: 'text-amber-700' },
  ecole:  { label: 'École',  bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ferie:  { label: 'Férié',  bg: 'bg-purple-100',  text: 'text-purple-700' },
  arret:  { label: 'Arrêt',  bg: 'bg-red-100',     text: 'text-red-700' },
  absent: { label: 'Absent', bg: 'bg-red-200',     text: 'text-red-800' },
  repos:  { label: 'Repos',  bg: 'bg-gray-100',    text: 'text-gray-500' },
};

function fmtTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':');
  const hh = parseInt(h, 10);
  return m === '00' ? `${hh}h` : `${hh}h${m}`;
}

export default function PlanningPersonnel() {
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

  return (
    <div className="flex gap-4">
      <aside className="hidden lg:block w-48 flex-shrink-0">
        <MiniCalendar lundi={lundi} onSelectDate={(d) => setLundi(getLundi(d))} />
        <p className="mt-3 text-xs text-gray-400 px-1">
          Les profils s'ajoutent depuis l'écran d'accueil ; ils apparaissent ici automatiquement.
        </p>
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
        ) : profils.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">Aucun profil — ajoute-en un depuis l'écran d'accueil.</p>
        ) : (
          <table className="w-full border-collapse table-fixed text-sm">
            <colgroup>
              <col style={{ width: '110px' }} />
              {semaine.map((_, i) => <col key={i} />)}
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
              </tr>
            </thead>
            <tbody>
              {profils.map(emp => (
                <tr key={emp.id}>
                  <td className="sticky left-0 z-10 bg-white border border-gray-200 px-2 py-2 font-semibold text-gray-700 align-top">
                    {emp.prenom} {emp.nom}
                  </td>
                  {semaine.map(date => {
                    const iso = toISO(date);
                    const cellCreneaux = creneaux
                      .filter(c => c.employe_id === emp.id && c.date === iso)
                      .sort((a, b) => a.ordre - b.ordre);
                    const isAbsence = cellCreneaux.length > 0 && cellCreneaux[0].type !== 'travail';

                    return (
                      <td key={iso} onClick={() => setCellModal({ employe: emp, date: iso })}
                        className="border border-gray-200 align-top p-1 min-w-[100px] h-14 cursor-pointer hover:bg-sky-50 transition-colors">
                        {cellCreneaux.length === 0 && (
                          <div className="h-full flex items-center justify-center text-gray-300 text-lg">+</div>
                        )}
                        {isAbsence && (
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${TYPE_CONFIG[cellCreneaux[0].type]?.bg} ${TYPE_CONFIG[cellCreneaux[0].type]?.text}`}>
                            {TYPE_CONFIG[cellCreneaux[0].type]?.label}
                          </span>
                        )}
                        {!isAbsence && cellCreneaux.map(c => (
                          <div key={c.id} className="text-[11px] text-gray-700 tabular-nums leading-tight">
                            {fmtTime(c.debut)}–{fmtTime(c.fin)}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
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
