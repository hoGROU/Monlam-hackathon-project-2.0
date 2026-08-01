import { Loader2, Tags } from "lucide-react";
import { useState } from "react";
import { useDocument } from "../../context/DocumentContext";
import { extractKeywords } from "../../lib/api";

const TYPE_STYLES = {
  concept: "bg-primary-950/40 text-primary-400 border-primary-800",
  practice: "bg-success-950/30 text-success-500 border-success-800",
  text: "bg-gold-950/30 text-gold-400 border-gold-800",
  person: "bg-ink-800 text-ink-200 border-ink-700",
  place: "bg-ink-800 text-ink-200 border-ink-700",
};

const LEGEND = [
  { type: "concept", label: "Concept", dot: "bg-primary-800" },
  { type: "practice", label: "Practice", dot: "bg-success-800" },
  { type: "text", label: "Text", dot: "bg-gold-800" },
  { type: "person", label: "Person / Place", dot: "bg-ink-600" },
];

export default function KeywordCard() {
  const { document: doc, setActiveDocument } = useDocument();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  const keywords = Array.isArray(doc?.keywords) ? doc.keywords : [];

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      const result = await extractKeywords(doc.originalText, doc.translation);
      setActiveDocument({ ...doc, keywords: result });
    } catch (err) {
      setError(err.message || "Keyword extraction failed.");
    } finally {
      setRetrying(false);
    }
  };

  if (keywords.length === 0) {
    return (
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-ink-500">
          <Tags size={18} />
        </div>
        <p className="mt-3 text-sm text-ink-300">
          No keywords were extracted for this document.
        </p>
        {error && (
          <p className="mx-auto mt-2 max-w-sm text-xs text-red-300">{error}</p>
        )}
        {doc?.originalText && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {retrying && <Loader2 size={14} className="animate-spin" />}
            {retrying ? "Extracting…" : "Extract keywords"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 sm:p-8">
      <h3 className="mb-5 font-display text-sm font-semibold text-ink-50">
        Keywords
      </h3>

      <div className="flex flex-wrap gap-2.5">
        {keywords.map((kw, i) => (
          <span
            key={`${kw.term}-${i}`}
            className={`inline-flex flex-col rounded-lg border px-3 py-1.5 text-xs ${
              TYPE_STYLES[kw.type] || TYPE_STYLES.concept
            }`}
          >
            <span className="font-medium">{kw.term}</span>
            {kw.translation && (
              <span className="opacity-75">{kw.translation}</span>
            )}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink-800 pt-4 text-xs text-ink-400">
        {LEGEND.map((item) => (
          <span key={item.type} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${item.dot}`} /> {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
