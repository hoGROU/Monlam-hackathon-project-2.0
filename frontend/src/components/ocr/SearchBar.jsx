import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * SearchBar
 * In-document search with match count and previous/next navigation.
 */
export default function SearchBar({
  query,
  onQueryChange,
  total = 0,
  activeIndex = 0,
  onPrev,
  onNext,
  onClose,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) onPrev();
      else onNext();
    }

    if (e.key === "Escape") onClose();
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900/80 px-3 py-2 backdrop-blur-md">
      <Search size={15} className="shrink-0 text-ink-500" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search in document…"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-600"
      />

      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-500">
        {query ? (total ? `${activeIndex + 1}/${total}` : "0/0") : ""}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={!total}
          aria-label="Previous match"
          className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 disabled:opacity-30"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!total}
          aria-label="Next match"
          className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 disabled:opacity-30"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
