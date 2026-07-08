export const STATUT_CYCLE = ['programme', 'effectue', 'annule', 'paye'];

export function nextStatut(current) {
  const idx = STATUT_CYCLE.indexOf(current);
  return STATUT_CYCLE[(idx + 1) % STATUT_CYCLE.length];
}
