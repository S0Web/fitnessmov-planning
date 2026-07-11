import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function getSemaine(lundi) {
  const d = new Date(lundi);
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export default function TaskWidget({ lundi }) {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [newTitre, setNewTitre] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const isManager = user?.role === 'manager';
  const semaine   = getSemaine(lundi);

  function load() {
    api.getTasks(semaine).then(setTasks).catch(() => {});
  }

  useEffect(() => {
    load();
    if (isManager) api.getAppUsers().then(setUsers).catch(() => {});
  }, [semaine]);

  async function addTask() {
    if (!newTitre.trim()) return;
    const payload = { titre: newTitre.trim(), semaine };
    if (isManager && assignTo) payload.user_id = Number(assignTo);
    await api.createTask(payload);
    setNewTitre('');
    setAssignTo('');
    load();
  }

  async function toggle(task) {
    await api.patchTask(task.id, { done: !task.done });
    load();
  }

  async function remove(id) {
    await api.deleteTask(id);
    load();
  }

  // Grouper par utilisateur si manager
  const grouped = isManager
    ? tasks.reduce((acc, t) => {
        const key = t.assigned_to || 'Moi';
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
      }, {})
    : { Moi: tasks };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cette semaine</div>

      {Object.entries(grouped).map(([who, items]) => (
        <div key={who}>
          {isManager && <div className="text-xs font-semibold text-gray-600 mb-1">{who}</div>}
          <ul className="space-y-1">
            {items.map(t => (
              <li key={t.id} className="flex items-start gap-2 group">
                <input type="checkbox" checked={!!t.done} onChange={() => toggle(t)}
                  className="mt-0.5 rounded accent-sky-500 cursor-pointer" />
                <span className={`flex-1 text-xs leading-relaxed ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {t.titre}
                  {isManager && t.created_by !== user?.id && (
                    <span className="text-gray-400 ml-1">· par {t.created_by_nom}</span>
                  )}
                </span>
                <button onClick={() => remove(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-sm leading-none transition-opacity">×</button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-xs text-gray-400 italic">Aucune tâche</li>
            )}
          </ul>
        </div>
      ))}

      {/* Ajouter une tâche */}
      <div className="space-y-1 pt-1 border-t border-gray-100">
        {isManager && (
          <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-300">
            <option value="">Pour moi</option>
            {users.filter(u => u.id !== user?.id && u.actif).map(u => (
              <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
            ))}
          </select>
        )}
        <div className="flex gap-1">
          <input value={newTitre} onChange={e => setNewTitre(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
            placeholder="Nouvelle tâche…"
            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-300" />
          <button type="button" onClick={addTask} disabled={!newTitre.trim()}
            className="px-2 flex items-center text-gray-400 hover:text-sky-500 disabled:opacity-30 transition-colors"
            title="Ajouter" aria-label="Ajouter la tâche"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
