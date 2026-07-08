import { useState, useRef, useEffect } from 'react';

const NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function HeadcountPopover({ value, onSelect, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function handlePick(n) {
    onSelect(n);
    setOpen(false);
  }

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title="Renseigner l'effectif"
        className="text-[11px] text-gray-400 font-medium hover:text-sky-600 hover:underline"
      >
        {children}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
        >
          <div className="grid grid-cols-6 gap-1 w-[168px]">
            {NUMBERS.map(n => (
              <button
                key={n}
                onClick={() => handlePick(n)}
                className={`h-6 w-6 text-[11px] rounded font-medium transition-colors
                  ${value === n ? 'bg-sky-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-sky-100'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}
