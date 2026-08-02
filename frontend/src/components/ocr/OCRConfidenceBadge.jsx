import { AlertTriangle, CheckCircle2, Gauge } from "lucide-react";

/**
 * OCRConfidenceBadge
 * Shows recognition accuracy with a colour-coded pill, plus an inline warning
 * when the score is low enough to need manual verification.
 */
export default function OCRConfidenceBadge({ confidence, withNote = false }) {
  if (typeof confidence !== "number") return null;

  const high = confidence >= 92;
  const medium = confidence >= 78 && confidence < 92;
  const Icon = high ? CheckCircle2 : medium ? Gauge : AlertTriangle;

  const tone = high
    ? "bg-success-500/10 text-success-500 ring-success-800/50"
    : medium
      ? "bg-gold-500/10 text-gold-300 ring-gold-800/50"
      : "bg-red-500/10 text-red-300 ring-red-800/50";

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone}`}
        title="Estimated OCR accuracy"
      >
        <Icon size={13} />
        OCR Accuracy {Math.round(confidence)}%
      </span>

      {withNote && !high && (
        <p className="text-[11px] leading-relaxed text-ink-500">
          Some words may require manual verification.
        </p>
      )}
    </div>
  );
}
