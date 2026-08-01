import { AlertCircle, FileText, FileUp, Image as ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocument } from "../../context/DocumentContext";

const ACCEPTED = [".pdf", ".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"];
const MAX_BYTES = 25 * 1024 * 1024;

function formatSize(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { selectFile, loadDemoDocument } = useDocument();

  const handleFiles = (fileList) => {
    const f = fileList?.[0];
    if (!f) return;

    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setLocalError(`"${ext}" files aren't supported. Use ${ACCEPTED.join(", ")}.`);
      setSelected(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setLocalError(
        `That file is ${formatSize(f.size)}. The maximum size is ${formatSize(MAX_BYTES)}.`
      );
      setSelected(null);
      return;
    }

    setLocalError(null);
    setSelected(f);
    selectFile(f);
  };

  const startProcessing = () => {
    if (selected) {
      selectFile(selected);
      navigate("/processing");
    } else {
      // No file chosen: show the bundled sample document instead.
      loadDemoDocument();
      navigate("/dashboard");
    }
  };

  const clearSelection = () => {
    setSelected(null);
    setLocalError(null);
    selectFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section id="upload" className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
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
            ? "scale-[1.01] border-primary-500 bg-primary-950/40 shadow-lg shadow-primary-600/20"
            : "border-ink-700 bg-ink-900/60 hover:border-primary-600 hover:bg-ink-900"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 text-primary-400 ring-1 ring-primary-700/50">
          <FileUp size={24} />
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold text-ink-50">
          Drag & drop your document here
        </h3>
        <p className="mt-1.5 text-sm text-ink-400">
          or{" "}
          <button
            onClick={() => inputRef.current?.click()}
            className="font-medium text-primary-400 underline-offset-2 hover:underline"
          >
            browse your files
          </button>
        </p>

        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <FileText size={13} /> PDF
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-700" />
          <span className="inline-flex items-center gap-1">
            <ImageIcon size={13} /> JPG
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-700" />
          <span className="inline-flex items-center gap-1">
            <ImageIcon size={13} /> PNG
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-700" />
          <span>max 25 MB</span>
        </div>

        {localError && (
          <div className="mx-auto mt-6 flex max-w-md items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-2.5 text-left">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-xs leading-relaxed text-red-300">{localError}</p>
          </div>
        )}

        {selected && (
          <div className="mx-auto mt-6 flex max-w-sm items-center justify-between rounded-lg border border-ink-700 bg-ink-800/60 px-4 py-2.5 text-left">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileText size={16} className="shrink-0 text-primary-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-100">
                  {selected.name}
                </p>
                <p className="text-xs text-ink-500">{formatSize(selected.size)}</p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              aria-label="Remove file"
              className="shrink-0 rounded-md p-1 text-ink-400 hover:bg-ink-700 hover:text-ink-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <button
          onClick={startProcessing}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-600/25 transition-all hover:from-primary-500 hover:to-primary-400 active:scale-[0.98]"
        >
          {selected ? "Process Document" : "View a Sample Document"}
        </button>
      </div>
    </section>
  );
}
