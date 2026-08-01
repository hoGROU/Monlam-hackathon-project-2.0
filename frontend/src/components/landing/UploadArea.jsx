import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, FileText, Image as ImageIcon, X } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";

const ACCEPTED = [".pdf", ".jpg", ".jpeg", ".png"];

function formatSize(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { uploadFile } = useDocument();

  const handleFiles = (fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    setSelected({ name: f.name, size: formatSize(f.size) });
  };

  const startProcessing = () => {
    uploadFile(selected || { name: "sample-manuscript.pdf", size: "3.4 MB" });
    navigate("/processing");
  };

  return (
    <section
      id="upload"
      className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 sm:p-14 ${
          isDragging
            ? "scale-[1.01] border-primary-500 bg-primary-50/70 dark:bg-primary-950/30"
            : "border-ink-300 bg-white hover:border-primary-400 hover:bg-primary-50/30 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-primary-600 dark:hover:bg-primary-950/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
          <FileUp size={24} />
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
          Drag &amp; drop your document here
        </h3>
        <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
          or{" "}
          <button
            onClick={() => inputRef.current?.click()}
            className="font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-400"
          >
            browse your files
          </button>
        </p>

        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-ink-400 dark:text-ink-500">
          <span className="inline-flex items-center gap-1">
            <FileText size={13} /> PDF
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-300 dark:bg-ink-700" />
          <span className="inline-flex items-center gap-1">
            <ImageIcon size={13} /> JPG
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-300 dark:bg-ink-700" />
          <span className="inline-flex items-center gap-1">
            <ImageIcon size={13} /> PNG
          </span>
        </div>

        {selected && (
          <div className="mx-auto mt-6 flex max-w-sm items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-2.5 text-left dark:border-ink-700 dark:bg-ink-800/60">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileText size={16} className="shrink-0 text-primary-600 dark:text-primary-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                  {selected.name}
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-500">{selected.size}</p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Remove file"
              className="shrink-0 rounded-md p-1 text-ink-400 hover:bg-ink-200 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <button
          onClick={startProcessing}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all hover:bg-primary-700 active:scale-[0.98]"
        >
          {selected ? "Process Document" : "Try with a Sample Document"}
        </button>
      </div>
    </section>
  );
}
