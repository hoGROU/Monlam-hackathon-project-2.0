import { AlertCircle, Copy, Loader2, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { useDocument } from "../../context/DocumentContext";
import { textToSpeech } from "../../lib/api";

export default function OriginalTextCard() {
  const { document: doc } = useDocument();
  const [copied, setCopied] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  const text = doc?.originalText?.trim() || "";
  const paragraphs = text ? text.split(/\n{2,}/) : [];

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleListen = async () => {
    setAudioError(null);
    setLoadingAudio(true);
    try {
      const src = await textToSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = src;
        await audioRef.current.play();
      }
    } catch (err) {
      setAudioError(err.message || "Could not generate audio.");
    } finally {
      setLoadingAudio(false);
    }
  };

  if (!text) {
    return (
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 sm:p-8">
        <p className="text-sm text-ink-400">
          No text was recognized in this document.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-ink-50">
          Original Tibetan Text
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleListen}
            disabled={loadingAudio}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 disabled:opacity-50"
          >
            {loadingAudio ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Volume2 size={13} />
            )}
            {loadingAudio ? "Generating…" : "Listen"}
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
          >
            <Copy size={13} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {audioError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs leading-relaxed text-red-300">{audioError}</p>
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} className="hidden" controls />

      <div className="space-y-5">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-xl leading-[2.1] text-ink-100"
            style={{ fontFamily: "'Noto Sans Tibetan', serif" }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
