import { motion } from "framer-motion";

/**
 * AnimatedGlow
 * A soft radial light blob that slowly breathes and drifts.
 */
export default function AnimatedGlow({
  color = "rgba(124,92,255,0.35)",
  size = 520,
  className = "",
  duration = 9,
  delay = 0,
  drift = 24,
  blur = 60,
  style = {},
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full will-change-transform ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        ...style,
      }}
      initial={{ opacity: 0.35, scale: 0.9 }}
      animate={{
        opacity: [0.3, 0.65, 0.3],
        scale: [0.92, 1.08, 0.92],
        x: [0, drift, 0],
        y: [0, -drift * 0.6, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
