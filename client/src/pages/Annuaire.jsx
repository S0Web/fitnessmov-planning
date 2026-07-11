import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

// Catégories affichées (filtres + sections). Les coachs viennent de la table
// coaches (lecture seule ici) — pour les modifier, direction l'onglet Coaches.
const DISPLAY_CATEGORIES = [
  { id: 'coach',       label: 'Coachs' },
  { id: 'prestataire', label: 'Prestataires' },
  { id: 'employe',     label: 'Employés' },
  { id: 'responsable', label: 'Responsables' },
];
// Catégories qu'on peut créer/modifier depuis cette page.
const EDITABLE_CATEGORIES = DISPLAY_CATEGORIES.filter(c => c.id !== 'coach');

function norm(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function ContactModal({ contact, onSave, onDelete, onClose }) {
  const isNew = !contact?.id;
  const [form, setForm] = useState({
    categorie: contact?.categorie || 'prestataire',
    nom:       contact?.nom       || '',
    telephone: contact?.telephone || '',
    notes:     contact?.notes     || '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{isNew ? 'Nouveau contact' : contact.nom}</h2>
          {!isNew && (
            <button onClick={() => { onDelete(contact); onClose(); }} className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50">
              Supprimer
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie *</label>
            <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
              {EDITABLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input value={form.nom} onChange={e => set('nom', e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
            <input value={form.telephone} onChange={e => set('telephone', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Contrat, remarque…"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
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

export default function Annuaire() {
  const toast = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorieFiltre, setCategorieFiltre] = useState('tous');
  const [modal, setModal] = useState(null);

  function load() {
    setLoading(true);
    api.getAnnuaire().then(setContacts).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleSave(form) {
    if (modal?.id) await api.updateAnnuaireContact(modal.id, form);
    else           await api.createAnnuaireContact(form);
    load();
  }
  async function handleDelete(contact) {
    if (!confirm(`Supprimer ${contact.nom} de l'annuaire ?`)) return;
    await api.deleteAnnuaireContact(contact.id);
    toast.success('Contact supprimé.');
    load();
  }

  const filtered = useMemo(() => {
    const q = norm(search);
    return contacts.filter(c => {
      if (categorieFiltre !== 'tous' && c.categorie !== categorieFiltre) return false;
      if (!q) return true;
      return norm(c.nom).includes(q) || norm(c.telephone).includes(q) || norm(c.notes).includes(q);
    });
  }, [contacts, search, categorieFiltre]);

  const groupes = useMemo(() => {
    return DISPLAY_CATEGORIES
      .map(c => ({ ...c, items: filtered.filter(x => x.categorie === c.id) }))
      .filter(g => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-800">Annuaire</h1>
        <button onClick={() => setModal({})}
          className="text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 self-start sm:self-auto"
          style={{ backgroundColor: '#2fa8cc' }}>
          + Nouveau contact
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un nom, un numéro…"
          className="w-full sm:max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCategorieFiltre('tous')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${categorieFiltre === 'tous' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tous
          </button>
          {DISPLAY_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategorieFiltre(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${categorieFiltre === c.id ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
      ) : groupes.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm italic">Aucun contact.</div>
      ) : (
        <div className="space-y-6">
          {groupes.map(g => (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">{g.label}</h2>
                {g.id === 'coach' && (
                  <Link to="/coaches" className="text-xs text-sky-600 hover:underline">Gérer dans Coaches →</Link>
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {g.items.map((c, i) => {
                  const nameContent = (
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-800 truncate">{c.nom}</span>
                      {c.categorie === 'coach' && (
                        <span className="flex gap-1 flex-shrink-0">
                          {!!c.aqua && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">Aqua</span>}
                          {!!c.fitness && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Fitness</span>}
                        </span>
                      )}
                      {c.notes && <span className="text-xs text-gray-400 truncate">({c.notes})</span>}
                    </span>
                  );
                  return (
                    <div key={c.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                      className="flex items-center justify-between gap-3 px-4 py-2.5">
                      {c.readonly ? (
                        <Link to="/coaches" className="min-w-0 hover:underline">{nameContent}</Link>
                      ) : (
                        <button onClick={() => setModal(c)} className="min-w-0 text-left hover:underline">{nameContent}</button>
                      )}
                      {c.telephone && (
                        <a href={`tel:${c.telephone.replace(/\s+/g, '')}`} onClick={e => e.stopPropagation()}
                          className="text-sm text-sky-600 hover:underline flex-shrink-0 tabular-nums">
                          {c.telephone}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ContactModal
          contact={modal?.id ? modal : null}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
