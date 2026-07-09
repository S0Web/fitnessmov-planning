import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { colorForUser } from '../lib/utils';
import logo from '../assets/logo.png';

function AddProfileModal({ onCreated, onClose }) {
  const [form, setForm] = useState({ prenom: '', nom: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const user = await api.createProfile(form);
      await onCreated(user.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Nouveau profil</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Prénom *" required autoFocus value={form.prenom}
              onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <input placeholder="Nom" value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#2fa8cc' }}>
              {saving ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePicker() {
  const { selectProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [error, setError]       = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);

  function loadProfiles() {
    api.getProfiles().then(setProfiles).catch(() => {});
  }

  useEffect(() => { loadProfiles(); }, []);

  async function handleSelect(userId) {
    setError(null);
    setSelecting(userId);
    try {
      await selectProfile(userId);
    } catch (err) {
      setError(err.message);
      setSelecting(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-2xl font-medium text-gray-600 mb-3">Bienvenue chez</h1>
        <img src={logo} alt="Fitnessmov Aqua" className="h-24 object-contain" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm mb-6">{error}</div>
      )}

      <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            disabled={selecting !== null}
            className="flex flex-col items-center gap-2 group disabled:opacity-50"
          >
            <span
              className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md transition-transform group-hover:scale-105 group-active:scale-95"
              style={{ backgroundColor: colorForUser(p.id) }}
            >
              {selecting === p.id ? '…' : `${p.prenom[0] || ''}${p.nom[0] || ''}`}
            </span>
            <span className="text-sm font-medium text-gray-700">{p.prenom}</span>
          </button>
        ))}

        <button
          onClick={() => setShowAdd(true)}
          disabled={selecting !== null}
          className="flex flex-col items-center gap-2 group disabled:opacity-50"
        >
          <span className="h-20 w-20 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-300 text-3xl font-light transition-colors group-hover:border-sky-400 group-hover:text-sky-500">
            +
          </span>
          <span className="text-sm font-medium text-gray-400 group-hover:text-sky-600">Ajouter</span>
        </button>
      </div>

      {showAdd && (
        <AddProfileModal
          onCreated={async (userId) => { setShowAdd(false); await handleSelect(userId); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
