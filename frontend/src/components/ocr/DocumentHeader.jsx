import { FileText, Hash, Languages, Layers } from "lucide-react";
import OCRConfidenceBadge from "./OCRConfidenceBadge";

function Meta({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
      <Icon size={13} className="text-ink-500" />
      {children}
    </span>
  );
}

/**
 * DocumentHeader
 * Title, detected document-type badge, OCR confidence and quick metadata.
 */
export default function DocumentHeader({ doc, docType, blockCount, wordCount }) {
  return (
    <header className="border-b border-ink-800/80 pb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-800/60 bg-primary-950/50 px-3 py-1 text-xs font-semibold text-primary-200">
              <span aria-hidden="true">{docType.icon}</span>
              {docType.type}
            </span>
            {docType.confidence === "low" && (
              <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
                type uncertain
              </span>
            )}
          </div>

          <h2 className="truncate font-display text-lg font-semibold text-ink-50 sm:text-xl">
            {doc?.fileName || "Recognized Document"}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Meta icon={Layers}>{doc?.pages ? `${doc.pages} page${doc.pages > 1 ? "s" : ""}` : null}</Meta>
            <Meta icon={Hash}>{wordCount ? `${wordCount.toLocaleString()} words` : null}</Meta>
            <Meta icon={FileText}>{blockCount ? `${blockCount} sections` : null}</Meta>
            <Meta icon={Languages}>{doc?.language}</Meta>
          </div>
        </div>

        <OCRConfidenceBadge confidence={doc?.ocrConfidence} withNote />
      </div>
    </header>
  );
}
