import { motion } from "framer-motion";

/**
 * ProgressBar
 * Glassy track with a purple gradient fill, animated border glow,
 * moving shimmer, leading light head and an animated percentage readout.
 */
export default function ProgressBar({ progress = 0, label = "Loading" }) {
  const value = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      <div className="mb-3 flex items-end justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#94A3B8]">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <motion.span
            key={Math.round(value)}
            initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-gradient-to-r from-[#F8FAFC] via-[#C4B5FD] to-[#D4AF37] bg-clip-text font-mono text-lg font-semibold tabular-nums text-transparent sm:text-xl"
          >
            {Math.round(value)}
          </motion.span>
          <span className="font-mono text-sm text-[#94A3B8]">%</span>
        </div>
      </div>

      {/* Track */}
      <div className="relative">
        {/* Animated border glow */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(124,92,255,0.0), rgba(124,92,255,0.55), rgba(212,175,55,0.45), rgba(124,92,255,0.0))",
            backgroundSize: "220% 100%",
            filter: "blur(7px)",
          }}
          animate={{ backgroundPosition: ["0% 50%", "200% 50%"], opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md sm:h-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
        >
          <motion.div
            className="relative h-full rounded-full will-change-[width]"
            style={{
              background:
                "linear-gradient(90deg, #4C3BCF 0%, #7C5CFF 45%, #A855F7 78%, #D4AF37 100%)",
              boxShadow: "0 0 18px rgba(124,92,255,0.55)",
            }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                backgroundSize: "50% 100%",
                backgroundRepeat: "no-repeat",
              }}
              animate={{ backgroundPosition: ["-60% 0%", "160% 0%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Leading light head */}
          <motion.div
            aria-hidden="true"
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, #FFFFFF 0%, rgba(212,175,55,0.7) 40%, transparent 70%)",
            }}
            animate={{ left: `${value}%`, opacity: value > 0 && value < 100 ? [0.6, 1, 0.6] : 0 }}
            transition={{
              left: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </div>
      </div>
    </div>
  );
}
