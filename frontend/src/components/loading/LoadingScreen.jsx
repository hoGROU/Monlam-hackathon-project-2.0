import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import BackgroundEffects from "./BackgroundEffects";
import DharmaChakraLogo from "./DharmaChakraLogo";
import LoadingStages, { LOADING_STAGES } from "./LoadingStages";
import ProgressBar from "./ProgressBar";

const EASE = [0.22, 1, 0.36, 1];

/** easeInOut curve so progress starts slow, accelerates, then settles. */
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * LoadingScreen
 * Cinematic full-screen startup experience for the Tibetan Research Assistant.
 *
 * @param {number}   duration  Total load time in ms (default 5200)
 * @param {Function} onComplete Called once the exit animation finishes
 * @param {boolean}  show      Externally control visibility
 */
export default function LoadingScreen({ duration = 5200, onComplete, show = true }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(show);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      setProgress(easeInOut(t) * 100);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setVisible(false), reduceMotion ? 200 : 700);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  useEffect(() => {
    if (!show) setVisible(false);
  }, [show]);

  const stageIndex = Math.min(
    Math.floor((progress / 100) * LOADING_STAGES.length),
    LOADING_STAGES.length - 1
  );

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#070B16] font-sans text-[#F8FAFC] antialiased"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: EASE }}
          role="status"
          aria-live="polite"
          aria-label="Loading Tibetan Research Assistant"
        >
          <BackgroundEffects />

          {/* Content */}
          <motion.div
            className="relative z-10 flex w-full max-w-[560px] flex-col items-center px-6 py-10 sm:px-8"
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: EASE }}
              className="mb-9 sm:mb-11"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="will-change-transform"
              >
                <div className="block sm:hidden">
                  <DharmaChakraLogo size={188} />
                </div>
                <div className="hidden sm:block lg:hidden">
                  <DharmaChakraLogo size={232} />
                </div>
                <div className="hidden lg:block">
                  <DharmaChakraLogo size={264} />
                </div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <div className="relative mb-3">
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[-18%] inset-y-[-45%] rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(124,92,255,0.35) 0%, rgba(212,175,55,0.12) 45%, transparent 72%)",
                  filter: "blur(26px)",
                }}
                animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.96, 1.06, 0.96] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.h1
                initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: EASE, delay: 0.35 }}
                className="relative bg-gradient-to-r from-[#FFFFFF] via-[#A855F7] to-[#D4AF37] bg-clip-text text-center font-display text-4xl font-extrabold tracking-[0.14em] text-transparent sm:text-5xl lg:text-6xl"
                style={{ backgroundSize: "180% 100%" }}
              >
                CODE TITAN
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
              className="text-center text-[13px] font-medium tracking-[0.18em] text-[#CBD5E1] sm:text-[15px]"
            >
              Wisdom in Code. Impact in Action.
            </motion.p>

            {/* Product label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
              className="mt-4 flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-1.5 backdrop-blur-md"
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
                style={{ boxShadow: "0 0 10px rgba(212,175,55,0.9)" }}
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] sm:text-[11px]">
                Tibetan Research Assistant
              </span>
            </motion.div>

            {/* Glass panel: progress + stages */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: EASE, delay: 0.85 }}
              className="mt-11 w-full rounded-2xl border border-white/[0.08] bg-[#111827]/40 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:mt-12 sm:p-7"
            >
              <ProgressBar progress={progress} label="Loading" />
              <div className="mt-7">
                <LoadingStages index={stageIndex} />
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-[#64748B]"
            >
              Team Code Titan · AI Research Platform
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
