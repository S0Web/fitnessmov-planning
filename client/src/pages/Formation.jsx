import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Formation() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const [articles, setArticles] = useState(null);

  useEffect(() => {
    api.getFormationArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-800">Formation</h1>
        {isManager && (
          <Link to="/formation/nouveau"
            className="flex items-center gap-1.5 text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: '#2fa8cc' }}>
            <Plus className="h-4 w-4" /> Nouvel article
          </Link>
        )}
      </div>

      {articles === null ? (
        <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          Aucun article pour le moment.
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(a => (
            <Link key={a.id} to={`/formation/${a.id}`}
              className="block bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-sky-300 hover:shadow-sm transition-all">
              <div className="font-bold text-gray-800">{a.titre}</div>
              <div className="text-xs text-gray-400 mt-1">
                Mis à jour le {fmtDate(a.updated_at)}{a.auteur_prenom ? ` · ${a.auteur_prenom}` : ''}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
