import { Layers, Type, Gauge, Languages, Clock } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";

export default function StatsSidebar() {
  const { document: doc } = useDocument();

  const stats = [
    { icon: Layers, label: "Total pages", value: doc.pages },
    { icon: Type, label: "Word count", value: doc.wordCount.toLocaleString() },
    { icon: Gauge, label: "OCR confidence", value: `${doc.ocrConfidence}%`, accent: true },
    { icon: Languages, label: "Language", value: doc.language, small: true },
    { icon: Clock, label: "Processing time", value: doc.processingTime },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
          Document Statistics
        </h3>
        <div className="mt-4 space-y-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                <stat.icon size={14} />
                {stat.label}
              </span>
              <span
                className={`text-right font-mono text-sm font-semibold ${
                  stat.accent
                    ? "text-success-600 dark:text-success-500"
                    : "text-ink-900 dark:text-ink-50"
                } ${stat.small ? "max-w-[110px] truncate text-xs font-medium" : ""}`}
                title={stat.small ? stat.value : undefined}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div
            className="h-full rounded-full bg-success-500"
            style={{ width: `${doc.ocrConfidence}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-400 dark:text-ink-500">
          Confidence score across all pages
        </p>
      </div>

      <div className="rounded-xl border border-gold-300/60 bg-gold-50/60 p-4 dark:border-gold-800/50 dark:bg-gold-950/20">
        <p className="text-xs leading-relaxed text-gold-800 dark:text-gold-300">
          Tip: low-confidence glyphs are underlined in the original text tab —
          double check those against the source scan.
        </p>
      </div>
    </aside>
  );
}
