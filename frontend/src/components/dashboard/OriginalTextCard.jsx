import { useDocument } from "../../context/DocumentContext";

export default function OriginalTextCard() {
  const { document: doc } = useDocument();
  const paragraphs = doc.originalText.trim().split("\n\n");

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
          Original Tibetan Text
        </h3>
        <span className="font-mono text-[11px] text-ink-400 dark:text-ink-500">
          u-chen script
        </span>
      </div>
      <div className="space-y-5">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-xl leading-[2.1] text-ink-800 dark:text-ink-100"
            style={{ fontFamily: "'Noto Sans Tibetan', serif" }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
