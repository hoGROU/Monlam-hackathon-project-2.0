import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Download,
  Highlighter,
  Search,
} from "lucide-react";


import { useEffect, useRef, useState } from "react";

function ToolButton({ icon: Icon, label, onClick, active = false, disabled = false, hideLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-40 ${
        active
          ? "bg-primary-600/20 text-primary-200 ring-1 ring-primary-600/50"
          : "text-ink-400 hover:bg-ink-800 hover:text-ink-100"
      }`}
    >
      <Icon size={14} />
      <span className={hideLabel ? "hidden lg:inline" : ""}>{label}</span>
    </button>
  );
}

function DownloadMenu({ onExport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const formats = [
    ["pdf", "PDF (print)"],
    ["docx", "Word (.doc)"],
    ["txt", "Plain text"],
    ["md", "Markdown"],
  ];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
      >
        <Download size={14} />
        <span className="hidden lg:inline">Download</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-44 animate-fade-up overflow-hidden rounded-xl border border-ink-700 bg-ink-900/95 py-1 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {formats.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onExport(key);
                setOpen(false);
              }}
              className="block w-full px-3.5 py-2 text-left text-xs text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Toolbar
 * Sticky glass toolbar: copy, download, search, highlight toggle and reading
 * mode. Translate / Summarize / Keywords deliberately live in the tab bar
 * above rather than being duplicated here.
 */
export default function Toolbar({
  onCopy,
  onExport,
  onToggleSearch,
  onToggleHighlight,
  onToggleReading,
  searchOpen,
  highlight,
  reading,
}) {
  const [copied, setCopied] = useState(false);


  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="sticky top-2 z-20 -mx-1 flex items-center gap-1 overflow-x-auto rounded-xl border border-ink-800/80 bg-ink-900/80 p-1.5 shadow-lg shadow-black/30 backdrop-blur-xl">
      <ToolButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied" : "Copy"}
        onClick={handleCopy}
        hideLabel
      />
      <DownloadMenu onExport={onExport} />

      <span className="mx-0.5 h-5 w-px shrink-0 bg-ink-800" />


      <ToolButton icon={Search} label="Search" onClick={onToggleSearch} active={searchOpen} hideLabel />
      <ToolButton
        icon={Highlighter}
        label="Highlights"
        onClick={onToggleHighlight}
        active={highlight}
        hideLabel
      />
      <ToolButton
        icon={BookOpen}
        label="Reading Mode"
        onClick={onToggleReading}
        active={reading}
        hideLabel
      />
    </div>
  );
}
