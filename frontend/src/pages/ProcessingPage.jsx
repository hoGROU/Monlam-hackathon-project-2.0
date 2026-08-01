import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight, ScanText, Languages, Sparkles, CheckCircle2 } from "lucide-react";
import ProgressWorkflow from "../components/processing/ProgressWorkflow";
import { useDocument } from "../context/DocumentContext";

const STAGE_META = [
  { key: "upload", label: "Upload received", detail: "File verified and queued for processing.", icon: FileText, duration: 900 },
  { key: "ocr", label: "Running OCR", detail: "Detecting u-chen glyphs and folio layout.", icon: ScanText, duration: 2200 },
  { key: "translation", label: "Translating", detail: "Mapping Tibetan terms to English with context.", icon: Languages, duration: 2000 },
  { key: "summary", label: "Generating summary", detail: "Condensing key arguments and terminology.", icon: Sparkles, duration: 1800 },
  { key: "ready", label: "Finalizing", detail: "Assembling your results dashboard.", icon: CheckCircle2, duration: 900 },
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { document: doc, file } = useDocument();
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (stageIndex >= STAGE_META.length) {
      setDone(true);
      timeoutRef.current = setTimeout(() => navigate("/dashboard"), 900);
      return () => clearTimeout(timeoutRef.current);
    }

    const stage = STAGE_META[stageIndex];
    setStageProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / stage.duration) * 100);
      setStageProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setStageIndex((prev) => prev + 1);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [stageIndex, navigate]);

  const activeStage = STAGE_META[Math.min(stageIndex, STAGE_META.length - 1)];

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400">
          Processing
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
          Reading your document
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
          {file?.name || doc.fileName} is moving through the pipeline. This
          usually takes under a minute.
        </p>
      </div>

      <div className="mt-12">
        <ProgressWorkflow activeIndex={done ? STAGE_META.length : stageIndex} />
      </div>

      {/* Active stage card */}
      <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
            <activeStage.icon size={18} />
          </div>
          <div>
            <p className="font-medium text-ink-900 dark:text-ink-50">
              {done ? "Your document is ready" : activeStage.label}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {done ? "Redirecting to results…" : activeStage.detail}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-[width] duration-100 ease-linear"
            style={{ width: `${done ? 100 : stageProgress}%` }}
          />
        </div>

        <ul className="mt-6 space-y-2.5">
          {STAGE_META.map((stage, i) => {
            const complete = i < stageIndex || done;
            const active = i === stageIndex && !done;
            return (
              <li key={stage.key} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    complete
                      ? "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-500"
                      : active
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400"
                      : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-600"
                  }`}
                >
                  {complete ? "✓" : i + 1}
                </span>
                <span
                  className={
                    complete
                      ? "text-ink-500 line-through decoration-ink-300 dark:text-ink-500 dark:decoration-ink-700"
                      : active
                      ? "font-medium text-ink-900 dark:text-ink-50"
                      : "text-ink-400 dark:text-ink-600"
                  }
                >
                  {stage.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 transition-colors hover:text-primary-600 dark:text-ink-500 dark:hover:text-primary-400"
        >
          Skip to results <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
