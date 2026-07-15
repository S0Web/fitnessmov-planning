import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../lib/api';
import { colorForUser } from '../lib/utils';
import SalleSwitcher from '../components/SalleSwitcher';
import logo from '../assets/logo.png';

// Formulaire de démarrage : uniquement affiché quand la salle n'a encore aucun profil
// (bootstrap du tout premier compte, forcément manager). Une fois un profil créé, cette
// route se ferme côté serveur — toute création ultérieure passe par Paramètres > Utilisateurs.
function FirstProfileForm({ onCreated }) {
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
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
      <h2 className="text-sm font-bold text-gray-700 mb-1">Premier compte</h2>
      <p className="text-xs text-gray-400 mb-3">Aucun profil pour l'instant — crée le premier compte (manager).</p>
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
        <button type="submit" disabled={saving}
          className="w-full text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: '#2fa8cc' }}>
          {saving ? 'Création…' : 'Créer'}
        </button>
      </form>
    </div>
  );
}

function CodeEntryModal({ profile, onSubmit, onForgot, onClose }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Code confidentiel de {profile.prenom}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}
          <input
            type="password" inputMode="numeric" placeholder="Code" autoFocus required
            value={code} onChange={e => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={busy || !code}
              className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#2fa8cc' }}>
              {busy ? 'Vérification…' : 'Valider'}
            </button>
          </div>
          <button type="button" onClick={onForgot}
            className="w-full text-xs text-gray-400 hover:text-sky-600 hover:underline">
            Code oublié ?
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateCodeModal({ profile, onCreate, onSkip, onClose, forced }) {
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) return setError('Le code doit faire au moins 4 caractères.');
    if (code !== confirmCode) return setError('Les deux codes ne correspondent pas.');
    setBusy(true);
    try {
      await onCreate(code);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function handleSkip() {
    setBusy(true);
    try {
      await onSkip();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-gray-700 mb-1">
          {forced ? `Nouveau code pour ${profile.prenom}` : `Créer un code confidentiel`}
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          {forced ? 'Choisis un nouveau code.' : `${profile.prenom} n'a pas encore de code confidentiel — facultatif, mais recommandé.`}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}
          <input
            type="password" inputMode="numeric" placeholder="Nouveau code" autoFocus required
            value={code} onChange={e => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <input
            type="password" inputMode="numeric" placeholder="Confirmer le code" required
            value={confirmCode} onChange={e => setConfirmCode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="flex gap-2 pt-1">
            {!forced && (
              <button type="button" onClick={handleSkip} disabled={busy}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
                Plus tard
              </button>
            )}
            <button type="submit" disabled={busy}
              className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#2fa8cc' }}>
              {busy ? 'Enregistrement…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePicker() {
  const { selectProfile } = useAuth();
  const { salleNom } = useConfig();
  const [profiles, setProfiles] = useState([]);
  const [error, setError]       = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [loaded, setLoaded]     = useState(false);
  const [codeModal, setCodeModal] = useState(null);   // profil en attente de saisie du code
  const [createCodeModal, setCreateCodeModal] = useState(null); // { profile, forced }

  function loadProfiles() {
    api.getProfiles().then(setProfiles).catch(() => {}).finally(() => setLoaded(true));
  }

  useEffect(() => { loadProfiles(); }, []);

  async function finalizeSelect(userId, code) {
    setError(null);
    setSelecting(userId);
    try {
      await selectProfile(userId, code);
    } catch (err) {
      setError(err.message);
      setSelecting(null);
      throw err;
    }
  }

  function handleClickProfile(profile) {
    setError(null);
    if (profile.hasCode) {
      setCodeModal(profile);
    } else {
      setCreateCodeModal({ profile, forced: false });
    }
  }

  async function handleCodeSubmit(code) {
    await finalizeSelect(codeModal.id, code);
    setCodeModal(null);
  }

  async function handleForgotCode() {
    if (!confirm(`Réinitialiser le code de ${codeModal.prenom} ? Il faudra en recréer un.`)) return;
    await api.forgetCode(codeModal.id);
    setCreateCodeModal({ profile: codeModal, forced: true });
    setCodeModal(null);
  }

  async function handleCreateCode(code) {
    await api.setCode(createCodeModal.profile.id, code);
    await finalizeSelect(createCodeModal.profile.id, code);
    setCreateCodeModal(null);
  }

  async function handleSkipCreateCode() {
    await finalizeSelect(createCodeModal.profile.id);
    setCreateCodeModal(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 relative">
      <div className="absolute top-4 right-4">
        <SalleSwitcher currentSalle={salleNom} />
      </div>

      <div className="flex flex-col items-center mb-10">
        <h1 className="text-2xl font-medium text-gray-600 mb-3">Bienvenue chez</h1>
        <img src={logo} alt="Fitnessmov Aqua" className="h-24 object-contain" />
        {salleNom && (
          <p className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">{salleNom}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm mb-6">{error}</div>
      )}

      {loaded && profiles.length === 0 ? (
        <FirstProfileForm onCreated={finalizeSelect} />
      ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => handleClickProfile(p)}
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
      )}

      {codeModal && (
        <CodeEntryModal
          profile={codeModal}
          onSubmit={handleCodeSubmit}
          onForgot={handleForgotCode}
          onClose={() => setCodeModal(null)}
        />
      )}

      {createCodeModal && (
        <CreateCodeModal
          profile={createCodeModal.profile}
          forced={createCodeModal.forced}
          onCreate={handleCreateCode}
          onSkip={handleSkipCreateCode}
          onClose={() => setCreateCodeModal(null)}
        />
      )}
    </div>
  );
}
