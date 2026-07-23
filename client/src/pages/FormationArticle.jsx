import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { renderMarkdown } from '../lib/markdown';
import MarkdownEditor from '../components/MarkdownEditor';

export default function FormationArticle() {
  const { id } = useParams();
  const isNew = id === 'nouveau';
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [article, setArticle] = useState(null);
  const [editing, setEditing] = useState(isNew);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api.getFormationArticle(id).then(a => {
      setArticle(a);
      setTitre(a.titre);
      setContenu(a.contenu);
    }).catch(() => setArticle(false));
  }, [id, isNew]);

  async function handleSave() {
    if (!titre.trim()) { toast.error('Le titre est obligatoire'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const created = await api.createFormationArticle({ titre, contenu });
        toast.success('Article créé');
        setArticle(created);
        setEditing(false);
        navigate(`/formation/${created.id}`, { replace: true });
      } else {
        const updated = await api.updateFormationArticle(id, { titre, contenu });
        setArticle(updated);
        setEditing(false);
        toast.success('Article enregistré');
      }
    } catch (err) {
      toast.error('Échec : ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement l'article "${article.titre}" ?`)) return;
    try {
      await api.deleteFormationArticle(id);
      toast.success('Article supprimé');
      navigate('/formation');
    } catch (err) {
      toast.error('Échec : ' + err.message);
    }
  }

  async function handleReorder(direction) {
    try {
      await api.reorderFormationArticle(id, direction);
    } catch (err) {
      toast.error('Échec : ' + err.message);
    }
  }

  if (!isNew && article === null) {
    return <div className="max-w-3xl mx-auto text-center py-10 text-gray-400 text-sm">Chargement…</div>;
  }
  if (article === false) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10 text-gray-400 text-sm">
        Article introuvable. <Link to="/formation" className="text-sky-600 hover:underline">Retour</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link to="/formation" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      {editing ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l'article"
            className="w-full text-lg font-bold border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          <MarkdownEditor value={contenu} onChange={setContenu} onUploadImage={api.uploadFormationImage} />
          <div className="flex gap-2 pt-1">
            {!isNew && (
              <button onClick={() => { setEditing(false); setTitre(article.titre); setContenu(article.contenu); }}
                className="flex-1 border border-gray-300 text-gray-600 rounded py-2 text-sm hover:bg-gray-50">
                Annuler
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex-1 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#2fa8cc' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-xl font-bold text-gray-800">{article.titre}</h1>
            {isManager && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleReorder('haut')} title="Monter" className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => handleReorder('bas')} title="Descendre" className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button onClick={() => setEditing(true)} title="Modifier" className="p-1.5 rounded text-sky-600 hover:bg-sky-50">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={handleDelete} title="Supprimer" className="p-1.5 rounded text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="formation-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(article.contenu) }} />
        </div>
      )}
    </div>
  );
}
