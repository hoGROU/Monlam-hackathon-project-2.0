import { useDocument } from "../../context/DocumentContext";

const TYPE_STYLES = {
  concept: "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/40 dark:text-primary-400 dark:border-primary-800",
  practice: "bg-success-50 text-success-700 border-success-200 dark:bg-success-950/30 dark:text-success-500 dark:border-success-800",
  text: "bg-gold-50 text-gold-700 border-gold-200 dark:bg-gold-950/30 dark:text-gold-400 dark:border-gold-800",
};

export default function KeywordCard() {
  const { document: doc } = useDocument();

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:p-8">
      <h3 className="mb-5 font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
        Keywords
      </h3>

      <div className="flex flex-wrap gap-2.5">
        {doc.keywords.map((kw) => (
          <span
            key={kw.term}
            className={`inline-flex flex-col rounded-lg border px-3 py-1.5 text-xs ${TYPE_STYLES[kw.type]}`}
          >
            <span className="font-medium">{kw.term}</span>
            <span className="opacity-75">{kw.translation}</span>
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-4 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary-200 dark:bg-primary-800" /> Concept
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-success-200 dark:bg-success-800" /> Practice
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gold-200 dark:bg-gold-800" /> Text
        </span>
      </div>
    </div>
  );
}
