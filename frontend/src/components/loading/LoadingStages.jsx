import { AnimatePresence, motion } from "framer-motion";

export const LOADING_STAGES = [
  "Initializing AI Engine",
  "Loading OCR Models",
  "Processing Tibetan Language",
  "Translating Content",
  "Generating AI Summary",
  "Preparing Workspace",
  "Finalizing Experience",
  "Ready",
];

/**
 * LoadingStages
 * Cross-fading stage label with slide + blur transitions and step pips.
 */
export default function LoadingStages({ stages = LOADING_STAGES, index = 0 }) {
  const safeIndex = Math.min(Math.max(index, 0), stages.length - 1);
  const current = stages[safeIndex];
  const isLast = safeIndex === stages.length - 1;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-7 w-full items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2.5"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: isLast ? "#D4AF37" : "#7C5CFF",
                boxShadow: `0 0 10px ${isLast ? "rgba(212,175,55,0.9)" : "rgba(124,92,255,0.9)"}`,
              }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className={`text-sm font-medium tracking-wide sm:text-[15px] ${
                isLast ? "text-[#F0D890]" : "text-[#E2E8F0]"
              }`}
            >
              {current}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step pips */}
      <div className="flex items-center gap-2">
        {stages.map((stage, i) => {
          const done = i < safeIndex;
          const active = i === safeIndex;
          return (
            <motion.span
              key={stage}
              className="h-1 rounded-full"
              animate={{
                width: active ? 22 : 6,
                opacity: active ? 1 : done ? 0.6 : 0.22,
                backgroundColor: active ? "#A855F7" : done ? "#7C5CFF" : "#94A3B8",
              }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{ boxShadow: active ? "0 0 12px rgba(168,85,247,0.7)" : "none" }}
            />
          );
        })}
      </div>
    </div>
  );
}
