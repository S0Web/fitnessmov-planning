import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ breaks: true, gfm: true });

// Rendu HTML sûr (assaini) d'un contenu markdown restreint (gras, italique,
// titres, séparateur, images) — utilisé pour l'affichage des articles Formation.
export function renderMarkdown(source) {
  const html = marked.parse(source || '');
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
