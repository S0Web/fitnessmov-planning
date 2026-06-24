export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const STATUT_CONFIG = {
  programme: { label: 'Programmé', bg: 'bg-gray-200',    text: 'text-gray-700',  solid: 'bg-gray-400' },
  effectue:  { label: 'Effectué',  bg: 'bg-green-500',   text: 'text-white',     solid: 'bg-green-500' },
  annule:    { label: 'Annulé',    bg: 'bg-red-500',     text: 'text-white',     solid: 'bg-red-500' },
  paye:      { label: 'Payé',      bg: 'bg-emerald-700', text: 'text-white',     solid: 'bg-emerald-700' },
};

export const CATEGORIE_CONFIG = {
  aqua:    { bg: 'bg-aqua-light',   border: 'border-aqua',   dot: 'bg-aqua',   hdr: '#2fa8cc', cell: '#eef9fd' },
  fitness: { bg: 'bg-fitness-light', border: 'border-fitness', dot: 'bg-fitness', hdr: '#c9a464', cell: '#fdf6ec' },
};

// Retourne le lundi de la semaine contenant `date`
export function getLundi(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Retourne les 7 dates (lundi→dimanche) de la semaine
export function getSemaine(lundi) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundi);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// Utilise l'heure locale (pas UTC) pour éviter le décalage timezone
export function toISO(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatDateShort(date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function semaineSuivante(lundi) {
  const d = new Date(lundi);
  d.setDate(d.getDate() + 7);
  return d;
}

export function semainePrecedente(lundi) {
  const d = new Date(lundi);
  d.setDate(d.getDate() - 7);
  return d;
}
