import { useRef, useState } from 'react';
import { Bold, Italic, Heading2, Minus, Image as ImageIcon } from 'lucide-react';
import { renderMarkdown } from '../lib/markdown';

const BTN = 'p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40';

export default function MarkdownEditor({ value, onChange, onUploadImage }) {
  const textareaRef = useRef(null);
  const [mode, setMode] = useState('edit'); // 'edit' | 'apercu'
  const [uploading, setUploading] = useState(false);

  function withTextarea(fn) {
    const ta = textareaRef.current;
    if (!ta) return;
    fn(ta);
  }

  function wrapSelection(marker) {
    withTextarea(ta => {
      const s = ta.selectionStart, e = ta.selectionEnd;
      const selected = value.slice(s, e) || 'texte';
      const newValue = value.slice(0, s) + marker + selected + marker + value.slice(e);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(s + marker.length, s + marker.length + selected.length);
      });
    });
  }

  function insertHeading() {
    withTextarea(ta => {
      const s = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const newValue = value.slice(0, lineStart) + '## ' + value.slice(lineStart);
      onChange(newValue);
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + 3, s + 3); });
    });
  }

  function insertSeparator() {
    withTextarea(ta => {
      const s = ta.selectionStart;
      const prefix = s > 0 && value[s - 1] !== '\n' ? '\n' : '';
      const insertion = `${prefix}\n---\n\n`;
      const newValue = value.slice(0, s) + insertion + value.slice(s);
      onChange(newValue);
      const pos = s + insertion.length;
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(pos, pos); });
    });
  }

  async function handleImagePick(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await onUploadImage(file);
      withTextarea(ta => {
        const s = ta.selectionStart;
        const insertion = `\n![](${url})\n`;
        const newValue = value.slice(0, s) + insertion + value.slice(s);
        onChange(newValue);
        const pos = s + insertion.length;
        requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(pos, pos); });
      });
    } catch (err) {
      alert("Échec de l'envoi de l'image : " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <button type="button" onClick={() => wrapSelection('**')} title="Gras" className={BTN}><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => wrapSelection('*')} title="Italique" className={BTN}><Italic className="h-4 w-4" /></button>
        <button type="button" onClick={insertHeading} title="Titre" className={BTN}><Heading2 className="h-4 w-4" /></button>
        <button type="button" onClick={insertSeparator} title="Séparateur" className={BTN}><Minus className="h-4 w-4" /></button>
        <label title="Insérer une capture d'écran" className={`${BTN} cursor-pointer ${uploading ? 'opacity-40 pointer-events-none' : ''}`}>
          <ImageIcon className="h-4 w-4" />
          <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} disabled={uploading} />
        </label>
        <div className="ml-auto flex gap-1 text-xs font-medium">
          <button type="button" onClick={() => setMode('edit')}
            className={`px-2.5 py-1 rounded ${mode === 'edit' ? 'bg-white shadow-sm text-sky-700' : 'text-gray-500'}`}>
            Éditer
          </button>
          <button type="button" onClick={() => setMode('apercu')}
            className={`px-2.5 py-1 rounded ${mode === 'apercu' ? 'bg-white shadow-sm text-sky-700' : 'text-gray-500'}`}>
            Aperçu
          </button>
        </div>
      </div>
      {mode === 'edit' ? (
        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)} rows={16}
          placeholder="Écris ton article ici… **gras**, *italique*, ## Titre, --- pour séparer, et l'icône image pour une capture d'écran."
          className="w-full p-3 text-sm focus:outline-none resize-y" />
      ) : (
        <div className="p-3 min-h-[16rem] formation-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
      )}
    </div>
  );
}
