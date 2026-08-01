import { useNavigate } from "react-router-dom";
import { FileText, RotateCcw, Calendar, HardDrive } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";

export default function DocumentSidebar() {
  const navigate = useNavigate();
  const { document: doc, file, reset } = useDocument();

  const handleReset = () => {
    reset();
    navigate("/");
  };

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
        {/* Preview */}
        <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-ink-100 to-ink-50 dark:from-ink-800 dark:to-ink-900">
          <div className="absolute inset-4 rounded-md border border-dashed border-ink-300 dark:border-ink-700" />
          <div className="flex flex-col items-center gap-2 text-ink-400 dark:text-ink-600">
            <FileText size={36} strokeWidth={1.3} />
            <span className="font-mono text-[11px]">Page 1 of {doc.pages}</span>
          </div>
          <span className="absolute right-2.5 top-2.5 rounded-md bg-success-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-success-700 dark:bg-success-900/40 dark:text-success-500">
            {doc.ocrConfidence}% OCR
          </span>
        </div>

        {/* File info */}
        <div className="space-y-3 p-4">
          <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-50">
            {file?.name || doc.fileName}
          </p>
          <div className="space-y-2 text-xs text-ink-500 dark:text-ink-400">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <HardDrive size={13} /> File size
              </span>
              <span className="font-mono">{file?.size || doc.fileSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} /> Uploaded
              </span>
              <span className="font-mono">Just now</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-primary-700 dark:hover:text-primary-400"
      >
        <RotateCcw size={15} />
        Upload another document
      </button>
    </aside>
  );
}
