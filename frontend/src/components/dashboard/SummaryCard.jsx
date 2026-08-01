import { Sparkles } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";

export default function SummaryCard() {
  const { document: doc } = useDocument();
  const paragraphs = doc.summary.trim().split("\n\n");

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-100 text-gold-700 dark:bg-gold-950/50 dark:text-gold-400">
          <Sparkles size={14} />
        </span>
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
          AI Summary
        </h3>
      </div>
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[15px] leading-relaxed text-ink-700 dark:text-ink-200"
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
