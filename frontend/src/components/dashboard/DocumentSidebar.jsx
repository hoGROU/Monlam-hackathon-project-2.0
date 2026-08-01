import { Calendar, Download, FileText, HardDrive, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocument } from "../../context/DocumentContext";
import { exportDocument } from "../../lib/export";

export default function DocumentSidebar() {
  const navigate = useNavigate();
  const { document: doc, file, reset, isDemo } = useDocument();
  const [previewUrl, setPreviewUrl] = useState(null);

  // Show a live thumbnail of the uploaded image (PDFs have no preview).
  useEffect(() => {
    if (file instanceof File && file.type?.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const handleReset = () => {
    reset();
    navigate("/");
  };

  if (!doc) return null;

  const confidence =
    typeof doc.ocrConfidence === "number" ? doc.ocrConfidence : null;

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-ink-800 bg-ink-900">
        <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={doc.fileName}
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              <div className="absolute inset-4 rounded-md border border-dashed border-ink-700" />
              <div className="flex flex-col items-center gap-2 text-ink-600">
                <FileText size={36} strokeWidth={1.3} />
                <span className="font-mono text-[11px]">
                  {doc.pages ? `${doc.pages} page${doc.pages > 1 ? "s" : ""}` : "Document"}
                </span>
              </div>
            </>
          )}

          {confidence !== null && (
            <span className="absolute right-2.5 top-2.5 rounded-md bg-success-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-success-500 ring-1 ring-success-800">
              {confidence}% OCR
            </span>
          )}
          {isDemo && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-gold-950/70 px-2 py-0.5 text-[10px] font-semibold text-gold-400 ring-1 ring-gold-800">
              Sample
            </span>
          )}
        </div>

        <div className="space-y-3 p-4">
          <p className="truncate text-sm font-medium text-ink-50" title={doc.fileName}>
            {doc.fileName}
          </p>
          <div className="space-y-2 text-xs text-ink-400">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <HardDrive size={13} /> File size
              </span>
              <span className="font-mono">{doc.fileSize || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} /> Processed
              </span>
              <span className="font-mono">
                {doc.createdAt
                  ? new Date(doc.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => exportDocument(doc)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-4 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:border-primary-700 hover:text-primary-400"
      >
        <Download size={15} />
        Export as PDF
      </button>

      <button
        onClick={handleReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-4 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:border-primary-700 hover:text-primary-400"
      >
        <RotateCcw size={15} />
        Upload another document
      </button>
    </aside>
  );
}
