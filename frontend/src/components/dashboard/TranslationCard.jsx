import { Copy } from "lucide-react";
import { useState } from "react";
import { useDocument } from "../../context/DocumentContext";

export default function TranslationCard() {
  const { document: doc } = useDocument();
  const [copied, setCopied] = useState(false);
  const paragraphs = doc.translation.trim().split("\n\n");

  const handleCopy = () => {
    navigator.clipboard?.writeText(doc.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
          English Translation
        </h3>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
        >
          <Copy size={13} />
          {copied ? "Copied" : "Copy"}
        </button>
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
