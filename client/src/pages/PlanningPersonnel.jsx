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

// ── Gestion des employés ─────────────────────────────────────────────────────

function EmployeModal({ employe, onSave, onToggle, onClose }) {
  const isNew = !employe?.id;
  const [form, setForm] = useState({ prenom: employe?.prenom || '', nom: employe?.nom || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{isNew ? 'Nouvel employé' : `${employe.prenom} ${employe.nom}`}</h2>
          {!isNew && (
            <button onClick={() => { onToggle(employe); onClose(); }}
              className={`text-xs px-2 py-1 rounded ${employe.actif ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
              {employe.actif ? 'Désactiver' : 'Réactiver'}
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
              <input required value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
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

function EmployesPanel({ employes, onReload, onClose }) {
  const [modal, setModal] = useState(null);
  const [showInactifs, setShowInactifs] = useState(false);

  async function handleSave(form) {
    if (modal?.id) await api.updateEmploye(modal.id, form);
    else           await api.createEmploye(form);
    onReload();
  }
  async function handleToggle(employe) {
    if (employe.actif) await api.deleteEmploye(employe.id);
    else                await api.updateEmploye(employe.id, { actif: 1 });
    onReload();
  }

  const displayed = showInactifs ? employes : employes.filter(e => e.actif);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Employés</h2>
          <button onClick={() => setModal({})} className="text-white px-3 py-1.5 rounded text-sm font-medium" style={{ backgroundColor: '#2fa8cc' }}>
            + Nouveau
          </button>
        </div>
        <div className="px-6 py-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer mb-2">
            <input type="checkbox" checked={showInactifs} onChange={e => setShowInactifs(e.target.checked)} className="rounded" />
            Afficher les inactifs
          </label>
          <div className="divide-y divide-gray-100">
            {displayed.map(e => (
              <button key={e.id} onClick={() => setModal(e)}
                className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded ${e.actif ? '' : 'opacity-40'}`}>
                {e.prenom} {e.nom}
              </button>
            ))}
            {displayed.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun employé.</p>}
          </div>
        </div>
        {modal !== null && (
          <EmployeModal employe={modal?.id ? modal : null} onSave={handleSave} onToggle={handleToggle} onClose={() => setModal(null)} />
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function PlanningPersonnel() {
  const [lundi, setLundi]     = useState(() => getLundi());
  const [employes, setEmployes] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cellModal, setCellModal] = useState(null); // { employe, date }
  const [showEmployes, setShowEmployes] = useState(false);

  const semaine = getSemaine(lundi);

  const loadEmployes = useCallback(() => {
    api.getEmployes().then(setEmployes).catch(() => {});
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

  useEffect(() => { loadEmployes(); }, [loadEmployes]);
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
        <button onClick={() => setShowEmployes(true)}
          className="mt-3 w-full text-sm px-3 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
          Gérer les employés
        </button>
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
        ) : employes.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">Aucun employé — clique sur « Gérer les employés » pour en ajouter.</p>
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
              {employes.map(emp => (
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

      {showEmployes && (
        <EmployesPanel employes={employes} onReload={loadEmployes} onClose={() => setShowEmployes(false)} />
      )}
    </div>
  );
}
