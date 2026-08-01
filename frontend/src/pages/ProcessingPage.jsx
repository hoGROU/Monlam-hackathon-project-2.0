import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Languages,
  RotateCcw,
  ScanText,
  Sparkles,
  Tags,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressWorkflow from "../components/processing/ProgressWorkflow";
import { useDocument } from "../context/DocumentContext";

const STAGES = [
  { key: "upload", label: "Upload received", detail: "File verified and sent to the server.", icon: FileText },
  { key: "ocr", label: "Running OCR", detail: "Recognizing Tibetan glyphs and folio layout.", icon: ScanText },
  { key: "translation", label: "Translating", detail: "Mapping Tibetan terms to English with context.", icon: Languages },
  { key: "summary", label: "Generating summary", detail: "Condensing the key arguments.", icon: Sparkles },
  { key: "keywords", label: "Extracting keywords", detail: "Pulling out key terminology.", icon: Tags },
  { key: "ready", label: "Finalizing", detail: "Assembling your results dashboard.", icon: CheckCircle2 },
];

const stageIndex = (key) => STAGES.findIndex((s) => s.key === key);

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { file, processFile, error, reset } = useDocument();

  const [current, setCurrent] = useState(0);
  const [stageStatus, setStageStatus] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [failed, setFailed] = useState(null);
  const startedRef = useRef(false);

  // No file? Send the user back to pick one.
  useEffect(() => {
    if (!file) navigate("/", { replace: true });
  }, [file, navigate]);

  useEffect(() => {
    if (!file || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    const run = async () => {
      const document = await processFile(file, (event) => {
        if (cancelled) return;

        const index = stageIndex(event.stage);
        if (index >= 0) {
          setStageStatus((prev) => ({ ...prev, [event.stage]: event.status }));
          setCurrent((prev) => Math.max(prev, event.status === "done" ? index + 1 : index));
        }

        // A failed translation/summary is recoverable - surface it as a warning
        if (event.status === "error" && event.stage !== "error" && event.stage !== "ocr") {
          setWarnings((prev) => [...prev, `${event.stage}: ${event.error}`]);
        }
      });

      if (cancelled) return;

      if (document) {
        setTimeout(() => navigate("/dashboard"), 600);
      } else {
        setFailed(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [file, processFile, navigate]);

  const done = current >= STAGES.length;
  const active = STAGES[Math.min(current, STAGES.length - 1)];
  const percent = Math.round((Math.min(current, STAGES.length) / STAGES.length) * 100);

  const startOver = () => {
    reset();
    navigate("/");
  };

  if (failed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-800/60 bg-red-950/20 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/60 text-red-400 ring-1 ring-red-800">
            <AlertCircle size={22} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink-50">
            Processing failed
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-300">
            {error || "Something went wrong while processing your document."}
          </p>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-ink-500">
            Check that the backend is running on port 8000 and that MONLAM_API_KEY
            is set in <span className="font-mono">backend/.env</span>.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={startOver}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <RotateCcw size={15} /> Try another document
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-5 py-2.5 text-sm font-medium text-ink-300 hover:text-ink-100"
            >
              <ArrowLeft size={15} /> Back home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-400">
          Processing
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-50">
          Reading your document
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
          {file?.name} is moving through the pipeline. OCR and translation of a
          long folio can take a minute or two.
        </p>
      </div>

      <div className="mt-12">
        <ProgressWorkflow activeIndex={current} />
      </div>

      <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-xl shadow-ink-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-950/60 text-primary-400 ring-1 ring-primary-800/50">
            <active.icon size={18} />
          </div>
          <div>
            <p className="font-medium text-ink-50">
              {done ? "Your document is ready" : active.label}
            </p>
            <p className="text-xs text-ink-400">
              {done ? "Redirecting to results…" : active.detail}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="mt-6 space-y-2.5">
          {STAGES.map((stage, i) => {
            const status = stageStatus[stage.key];
            const complete = status === "done" || i < current;
            const isActive = i === current && !done;
            const errored = status === "error";

            return (
              <li key={stage.key} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    errored
                      ? "bg-gold-950/50 text-gold-400 ring-1 ring-gold-800"
                      : complete
                      ? "bg-success-900/40 text-success-500 ring-1 ring-success-800"
                      : isActive
                      ? "bg-primary-950/60 text-primary-400 ring-1 ring-primary-800/50"
                      : "bg-ink-800 text-ink-600"
                  }`}
                >
                  {errored ? "!" : complete ? "✓" : i + 1}
                </span>
                <span
                  className={
                    errored
                      ? "text-gold-400"
                      : complete
                      ? "text-ink-500 line-through decoration-ink-700"
                      : isActive
                      ? "font-medium text-ink-50"
                      : "text-ink-600"
                  }
                >
                  {stage.label}
                  {errored && " — skipped"}
                </span>
              </li>
            );
          })}
        </ul>

        {warnings.length > 0 && (
          <div className="mt-5 rounded-lg border border-gold-800/50 bg-gold-950/20 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-400">
              Partial results
            </p>
            <ul className="mt-1.5 space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-gold-300">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={startOver}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-primary-400"
        >
          <ArrowLeft size={14} /> Cancel and start over
        </button>
      </div>
    </section>
  );
}
