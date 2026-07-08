import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { colorForUser } from '../lib/utils';
import logo from '../assets/logo.png';

export default function ProfilePicker() {
  const { selectProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [error, setError]       = useState(null);
  const [selecting, setSelecting] = useState(null);

  // Init : créer le premier profil (manager)
  const [showInit, setShowInit] = useState(false);
  const [initForm, setInitForm] = useState({ prenom: '', nom: '', email: '' });
  const [initError, setInitError] = useState(null);

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

  async function handleInit(e) {
    e.preventDefault();
    setInitError(null);
    try {
      const user = await api.initApp(initForm);
      await handleSelect(user.id);
    } catch (err) {
      setInitError(err.message);
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

      {!showInit ? (
        <>
          {profiles.length > 0 ? (
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
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun profil pour le moment.</p>
          )}

          <button onClick={() => setShowInit(true)}
            className="mt-10 text-xs text-gray-400 hover:text-gray-600">
            Première connexion ? Créer le compte administrateur
          </button>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Créer le compte administrateur</h2>
          <form onSubmit={handleInit} className="space-y-3">
            {initError && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{initError}</div>}
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Prénom *" required value={initForm.prenom}
                onChange={e => setInitForm(f => ({ ...f, prenom: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              <input placeholder="Nom *" required value={initForm.nom}
                onChange={e => setInitForm(f => ({ ...f, nom: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            <input type="email" placeholder="Email *" required value={initForm.email}
              onChange={e => setInitForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <button type="submit"
              className="w-full text-white rounded-lg py-2.5 font-medium"
              style={{ backgroundColor: '#2fa8cc' }}>
              Créer et se connecter
            </button>
          </form>
          <button onClick={() => setShowInit(false)} className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-center">
            ← Retour
          </button>
        </div>
      )}
    </div>
  );
}
