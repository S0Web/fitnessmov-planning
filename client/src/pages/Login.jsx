import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import logo from '../assets/logo.png';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Init : créer le premier compte manager
  const [showInit, setShowInit] = useState(false);
  const [initForm, setInitForm] = useState({ prenom: '', nom: '', email: '', password: '' });
  const [initError, setInitError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(form.email, form.password);
      login(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInit(e) {
    e.preventDefault();
    setInitError(null);
    try {
      await api.initApp(initForm);
      const res = await api.login(initForm.email, initForm.password);
      login(res.token, res.user);
    } catch (err) {
      setInitError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="logo" className="h-16 w-16 object-contain rounded mb-3" />
          <h1 className="text-xl font-bold text-gray-800">Fitnessmov&apos; <span style={{ color: '#5bcae8' }}>Planning</span></h1>
        </div>

        {!showInit ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe</label>
                <input type="password" required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
                style={{ backgroundColor: '#2fa8cc' }}>
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
            <button onClick={() => setShowInit(true)}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 w-full text-center">
              Première connexion ? Créer le compte administrateur
            </button>
          </>
        ) : (
          <>
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
              <input type="password" placeholder="Mot de passe *" required value={initForm.password}
                onChange={e => setInitForm(f => ({ ...f, password: e.target.value }))}
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
          </>
        )}
      </div>
    </div>
  );
}
