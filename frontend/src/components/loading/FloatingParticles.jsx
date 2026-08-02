import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * FloatingParticles
 * Slow, randomly drifting light particles rendered with GPU-friendly transforms.
 */
export default function FloatingParticles({
  count = 28,
  className = "",
  colors = ["rgba(124,92,255,0.55)", "rgba(168,85,247,0.45)", "rgba(212,175,55,0.40)", "rgba(248,250,252,0.35)"],
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = 1.5 + Math.random() * 3.5;
        return {
          id: i,
          size,
          left: Math.random() * 100,
          top: Math.random() * 100,
          color: colors[i % colors.length],
          driftX: (Math.random() - 0.5) * 60,
          driftY: -(30 + Math.random() * 90),
          duration: 14 + Math.random() * 16,
          delay: Math.random() * 12,
          opacity: 0.25 + Math.random() * 0.5,
        };
      }),
    [count, colors]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, p.opacity, p.opacity, 0],
            x: [0, p.driftX * 0.5, p.driftX],
            y: [0, p.driftY * 0.5, p.driftY],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.8, 1],
          }}
        />
      ))}
    </div>
  );
}
