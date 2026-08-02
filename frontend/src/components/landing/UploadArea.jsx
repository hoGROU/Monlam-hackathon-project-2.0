import {
  AlertCircle,
  ClipboardPaste,
  FileText,
  FileUp,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocument } from "../../context/DocumentContext";

const ACCEPTED = [".pdf", ".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"];
const MAX_BYTES = 25 * 1024 * 1024;

/** Map a clipboard MIME type to a file extension we accept. */
const MIME_EXT = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/tiff": "tiff",
};

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
  const [pasteHint, setPasteHint] = useState(null);
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

  /**
   * Normalise a pasted Blob into a named File and select it.
   * Returns true when the blob was accepted.
   */
  const acceptPastedBlob = useCallback(
    (blob) => {
      const ext = MIME_EXT[blob.type];
      if (!ext) return false;
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const file = new File([blob], `pasted-${stamp}.${ext}`, {
        type: blob.type,
        lastModified: Date.now(),
      });
      if (file.size > MAX_BYTES) {
        setLocalError(
          `That pasted file is ${formatSize(file.size)}. The maximum size is ${formatSize(MAX_BYTES)}.`
        );
        return true;
      }
      setLocalError(null);
      setPasteHint("Pasted from clipboard");
      setSelected(file);
      selectFile(file);
      return true;
    },
    [selectFile]
  );

  /** Toolbar button — reads the clipboard directly (needs permission). */
  const pasteFromClipboard = async () => {
    setPasteHint(null);
    if (!navigator.clipboard?.read) {
      setLocalError(
        "Your browser can't read the clipboard directly. Press Ctrl/Cmd + V on this page instead."
      );
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => MIME_EXT[t]);
        if (type) {
          const blob = await item.getType(type);
          acceptPastedBlob(blob);
          return;
        }
      }
      setLocalError("No image or PDF found on your clipboard. Copy one, then paste again.");
    } catch {
      setLocalError(
        "Clipboard access was blocked. Allow clipboard permission, or press Ctrl/Cmd + V on this page."
      );
    }
  };

  /** Global Ctrl/Cmd + V support anywhere on the landing page. */
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind !== "file") continue;
        const blob = item.getAsFile();
        if (blob && acceptPastedBlob(blob)) {
          e.preventDefault();
          return;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [acceptPastedBlob]);

  const startProcessing = () => {
    if (!selected) {
      // Never silently fall back to the bundled sample - that made it look like
      // the app "processed" a document the user never uploaded. Open the picker.
      inputRef.current?.click();
      return;
    }
    selectFile(selected);
    navigate("/processing");
  };

  const viewSample = () => {
    loadDemoDocument();
    navigate("/dashboard");
  };

  const clearSelection = () => {
    setSelected(null);
    setLocalError(null);
    setPasteHint(null);
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
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-primary-400 underline-offset-2 hover:underline"
          >
            browse your files
          </button>
        </p>

        {/* Paste from clipboard */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="flex w-full max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-ink-700/70" />
            <span className="text-[11px] uppercase tracking-widest text-ink-600">or</span>
            <span className="h-px flex-1 bg-ink-700/70" />
          </div>
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-800/60 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:border-primary-600 hover:bg-ink-800 hover:text-ink-50 active:scale-[0.98]"
          >
            <ClipboardPaste size={15} className="text-primary-400" />
            Paste from clipboard
          </button>
          <p className="text-xs text-ink-500">
            or press{" "}
            <kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">
              V
            </kbd>{" "}
            anywhere on this page
          </p>
        </div>

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
                <p className="text-xs text-ink-500">
                  {formatSize(selected.size)}
                  {pasteHint && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-950/60 px-2 py-0.5 text-[10px] font-medium text-primary-300 ring-1 ring-primary-800/60">
                      <ClipboardPaste size={10} /> {pasteHint}
                    </span>
                  )}
                </p>
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
          type="button"
          onClick={startProcessing}
          className={`mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold shadow-md transition-all active:scale-[0.98] ${
            selected
              ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-primary-600/25 hover:from-primary-500 hover:to-primary-400"
              : "bg-ink-800 text-ink-300 shadow-ink-950/30 ring-1 ring-ink-700 hover:bg-ink-700 hover:text-ink-100"
          }`}
        >
          {selected ? "Process Document" : "Choose a Document"}
        </button>

        <p className="mt-4 text-xs text-ink-500">
          Just want to look around?{" "}
          <button
            type="button"
            onClick={viewSample}
            className="font-medium text-ink-400 underline underline-offset-2 hover:text-primary-400"
          >
            View a sample document
          </button>{" "}
          (example data, not your file)
        </p>
      </div>
    </section>
  );
}
