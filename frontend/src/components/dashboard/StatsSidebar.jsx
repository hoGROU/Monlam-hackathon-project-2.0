import { Clock, Gauge, Languages, Layers, Type } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";

export default function StatsSidebar() {
  const { document: doc } = useDocument();

  if (!doc) return null;

  const confidence =
    typeof doc.ocrConfidence === "number" ? doc.ocrConfidence : null;

  const stats = [
    { icon: Layers, label: "Total pages", value: doc.pages || "—" },
    {
      icon: Type,
      label: "Word count",
      value: doc.wordCount ? doc.wordCount.toLocaleString() : "—",
    },
    {
      icon: Gauge,
      label: "OCR confidence",
      value: confidence !== null ? `${confidence}%` : "n/a",
      accent: confidence !== null,
    },
    { icon: Languages, label: "Language", value: doc.language || "—", small: true },
    { icon: Clock, label: "Processing time", value: doc.processingTime || "—" },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
        <h3 className="font-display text-sm font-semibold text-ink-50">
          Document Statistics
        </h3>
        <div className="mt-4 space-y-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-ink-400">
                <stat.icon size={14} />
                {stat.label}
              </span>
              <span
                className={`text-right font-mono text-sm font-semibold ${
                  stat.accent ? "text-success-500" : "text-ink-50"
                } ${stat.small ? "max-w-[110px] truncate text-xs font-medium" : ""}`}
                title={stat.small ? String(stat.value) : undefined}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {confidence !== null && (
          <>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success-600 to-success-500"
                style={{ width: `${Math.min(100, confidence)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-500">
              Confidence score across all pages
            </p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-gold-800/50 bg-gold-950/20 p-4">
        <p className="text-xs leading-relaxed text-gold-300">
          Tip: OCR is never perfect on handwritten folios — compare the original
          text tab against your source scan before citing it.
        </p>
      </div>
    </aside>
  );
}
