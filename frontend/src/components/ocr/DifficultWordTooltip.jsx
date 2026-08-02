import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * DifficultWordTooltip
 * Wraps an uncommon word with a dotted underline. Hover (desktop) or tap
 * (touch) reveals a glass card with the meaning, a plain-English explanation
 * and an optional pronunciation you can hear.
 */
export default function DifficultWordTooltip({ word, entry }) {
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setFlip(rect.top < 190);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const speak = (e) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(word);
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-help rounded-sm border-b border-dotted border-gold-500/80 bg-transparent text-inherit decoration-dotted underline-offset-4 transition-colors hover:bg-gold-500/10"
      >
        {word}
      </button>

      {open && (
        <span
          role="tooltip"
          className={`absolute left-1/2 z-50 w-64 -translate-x-1/2 animate-fade-up rounded-xl border border-ink-700/80 bg-ink-900/95 p-3.5 text-left shadow-2xl shadow-black/60 backdrop-blur-xl sm:w-72 ${
            flip ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          <span className="mb-1.5 flex items-center justify-between gap-2">
            <span className="font-display text-sm font-semibold capitalize text-gold-300">
              {word}
            </span>
            {entry.pronunciation && (
              <button
                type="button"
                onClick={speak}
                title="Hear pronunciation"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-ink-400 transition-colors hover:bg-ink-800 hover:text-primary-300"
              >
                <Volume2 size={11} /> {entry.pronunciation}
              </button>
            )}
          </span>
          <span className="block text-xs leading-relaxed text-ink-200">{entry.meaning}</span>
          {entry.simple && (
            <span className="mt-2 block rounded-lg bg-primary-950/50 px-2.5 py-1.5 text-[11px] leading-relaxed text-primary-200 ring-1 ring-primary-800/50">
              In simple words: {entry.simple}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
