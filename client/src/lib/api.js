const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Coaches
  getCoachesRecap: (debut, fin) => req(`/coaches/recap?debut=${debut}&fin=${fin}`),
  getDashboard: (debut, fin) => req(`/dashboard?debut=${debut}&fin=${fin}`),
  getCoaches: (tous = false) => req(`/coaches${tous ? '?tous=1' : ''}`),
  createCoach: (data) => req('/coaches', { method: 'POST', body: JSON.stringify(data) }),
  updateCoach: (id, data) => req(`/coaches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleCoach: (id, actif) => req(`/coaches/${id}/actif`, { method: 'PATCH', body: JSON.stringify({ actif }) }),

  // Pointeurs
  getPointeurs: () => req('/pointeurs'),
  createPointeur: (nom) => req('/pointeurs', { method: 'POST', body: JSON.stringify({ nom }) }),
  deletePointeur: (id) => req(`/pointeurs/${id}`, { method: 'DELETE' }),

  // Cours types
  getCoursTypes: () => req('/cours-types'),

  // Séances
  getSeances: (semaine) => req(`/seances${semaine ? `?semaine=${semaine}` : ''}`),
  createSeance: (data) => req('/seances', { method: 'POST', body: JSON.stringify(data) }),
  patchSeance: (id, data) => req(`/seances/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSeance: (id) => req(`/seances/${id}`, { method: 'DELETE' }),
  dupliquerSemaine: (semaine_source, semaine_cible) =>
    req('/seances/dupliquer', { method: 'POST', body: JSON.stringify({ semaine_source, semaine_cible }) }),
};
