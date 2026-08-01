import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useDocument } from "../../context/DocumentContext";
import { summarize } from "../../lib/api";

export default function SummaryCard() {
  const { document: doc, setActiveDocument } = useDocument();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  const text = doc?.summary?.trim() || "";
  const paragraphs = text ? text.split(/\n{2,}/) : [];

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      const summary = await summarize(doc.translation || doc.originalText);
      setActiveDocument({ ...doc, summary });
    } catch (err) {
      setError(err.message || "Summarization failed.");
    } finally {
      setRetrying(false);
    }
  };

  if (!text) {
    return (
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gold-950/60 text-gold-400 ring-1 ring-gold-800/50">
          <Sparkles size={18} />
        </div>
        <p className="mt-3 text-sm text-ink-300">
          No summary is available for this document yet.
        </p>
        {error && (
          <p className="mx-auto mt-2 max-w-sm text-xs text-red-300">{error}</p>
        )}
        {(doc?.originalText || doc?.translation) && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {retrying && <Loader2 size={14} className="animate-spin" />}
            {retrying ? "Summarizing…" : "Generate summary"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-950/60 text-gold-400 ring-1 ring-gold-800/50">
          <Sparkles size={14} />
        </span>
        <h3 className="font-display text-sm font-semibold text-ink-50">
          AI Summary
        </h3>
      </div>
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-ink-200">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
