import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function UserModal({ user, onSave, onClose }) {
  const isNew = !user?.id;
  const [form, setForm] = useState({
    prenom:   user?.prenom   || '',
    nom:      user?.nom      || '',
    email:    user?.email    || '',
    role:     user?.role     || 'user',
    actif:    user?.actif    !== undefined ? user.actif : 1,
  });
  const [error, setError]   = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">{isNew ? 'Nouvel utilisateur' : `${user.prenom} ${user.nom}`}</h2>
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rôle</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                <option value="user">Utilisateur</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            {!isNew && (
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={!!form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked ? 1 : 0 }))} />
                  Actif
                </label>
              </div>
            )}
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

export default function Settings() {
  const { user: me } = useAuth();
  const isManager = me?.role === 'manager';
  const [tab, setTab]     = useState('profil');
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (isManager) {
      api.getAppUsers().then(setUsers).catch(() => {});
      if (tab === 'audit') api.getAuditLog().then(setAudit).catch(() => {});
    }
  }, [isManager, tab]);

  async function handleSave(form) {
    if (modal?.id) await api.updateAppUser(modal.id, form);
    else           await api.createAppUser(form);
    api.getAppUsers().then(setUsers);
  }

  const TABS = [
    { id: 'profil', label: 'Mon profil' },
    ...(isManager ? [{ id: 'users', label: 'Utilisateurs' }, { id: 'audit', label: 'Historique' }] : []),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-lg font-bold text-gray-800">Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Mon profil */}
      {tab === 'profil' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: '#2fa8cc' }}>
              {me?.prenom?.[0]}{me?.nom?.[0]}
            </div>
            <div>
              <div className="font-bold text-gray-800">{me?.prenom} {me?.nom}</div>
              <div className="text-sm text-gray-500">{me?.email}</div>
              <div className="text-xs mt-0.5 px-2 py-0.5 rounded inline-block" style={{ backgroundColor: me?.role === 'manager' ? '#eef9fd' : '#f3f4f6', color: me?.role === 'manager' ? '#1a7a9b' : '#6b7280' }}>
                {me?.role === 'manager' ? 'Manager' : 'Utilisateur'}
              </div>
            </div>
          </div>
          <button onClick={() => setModal(me)}
            className="text-sm px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
            Modifier mes informations
          </button>
        </div>
      )}

      {/* Utilisateurs */}
      {tab === 'users' && isManager && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{users.length} utilisateur(s)</span>
            <button onClick={() => setModal({})}
              className="text-white px-4 py-2 rounded text-sm font-medium"
              style={{ backgroundColor: '#2fa8cc' }}>
              + Nouveau
            </button>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: '#2fa8cc', color: '#fff' }}>
                {['Nom', 'Email', 'Rôle', 'Statut', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }} className={u.actif ? '' : 'opacity-40'}>
                  <td className="px-3 py-2 font-medium">{u.prenom} {u.nom}</td>
                  <td className="px-3 py-2 text-gray-500">{u.email}</td>
                  <td className="px-3 py-2">{u.role === 'manager' ? '⭐ Manager' : 'Utilisateur'}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.actif ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => setModal(u)} className="text-xs text-sky-600 hover:underline">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historique */}
      {tab === 'audit' && isManager && (
        <div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: '#2fa8cc', color: '#fff' }}>
                {['Date', 'Utilisateur', 'Action', 'Détails'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.map((a, i) => (
                <tr key={a.id} style={{ backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-3 py-2 font-medium">{a.user_nom || '—'}</td>
                  <td className="px-3 py-2">{a.action}</td>
                  <td className="px-3 py-2 text-gray-500">{a.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <UserModal
          user={modal?.id ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
