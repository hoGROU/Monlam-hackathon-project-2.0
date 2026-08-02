import { AlertCircle, Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDocument } from "../../context/DocumentContext";
import { translate } from "../../lib/api";
import OCRViewer from "../ocr/OCRViewer";

/**
 * TranslationCard
 * Renders the English translation through the same premium document reader so
 * structure, highlights, search and export behave consistently across tabs.
 */
export default function TranslationCard() {

  const { document: doc, setActiveDocument } = useDocument();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  const text = doc?.translation?.trim() || "";

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      const translation = await translate(doc.originalText);
      setActiveDocument({ ...doc, translation });
    } catch (err) {
      setError(err.message || "Translation failed.");
    } finally {
      setRetrying(false);
    }
  };

  if (!text) {
    return (
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-ink-500">
          <Languages size={18} />
        </div>
        <p className="mt-3 text-sm text-ink-300">
          No translation is available for this document yet.
        </p>
        {error && <p className="mx-auto mt-2 max-w-sm text-xs text-red-300">{error}</p>}
        {doc?.originalText && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {retrying && <Loader2 size={14} className="animate-spin" />}
            {retrying ? "Translating…" : "Translate now"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs leading-relaxed text-red-300">{error}</p>
        </div>
      )}

      <OCRViewer
        text={text}
        doc={{ ...doc, language: "English (translated)" }}
      />

    </div>
  );
}
