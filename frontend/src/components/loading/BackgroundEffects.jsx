import { motion } from "framer-motion";
import { useMemo } from "react";
import AnimatedGlow from "./AnimatedGlow";
import FloatingParticles from "./FloatingParticles";

function Stars({ count = 60 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() < 0.85 ? 1 : 1.8,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 5,
        peak: 0.2 + Math.random() * 0.55,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ width: s.size, height: s.size, left: `${s.left}%`, top: `${s.top}%` }}
          animate={{ opacity: [0.05, s.peak, 0.05] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function LightRay({ left, rotate, delay, width = 160, opacity = 0.09 }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute -top-1/4 h-[150%] will-change-transform"
      style={{
        left,
        width,
        rotate,
        background: `linear-gradient(to bottom, rgba(124,92,255,${opacity}) 0%, rgba(168,85,247,${opacity * 0.6}) 45%, transparent 100%)`,
        filter: "blur(40px)",
      }}
      animate={{ opacity: [0.25, 0.7, 0.25], x: [0, 30, 0] }}
      transition={{ duration: 16, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/**
 * BackgroundEffects
 * Deep-navy canvas: radial gradients, drifting glow blobs, light rays,
 * faint stars, floating particles, subtle grid and a vignette.
 */
export default function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, #131a33 0%, #0a0f21 45%, #070b16 100%)",
        }}
      />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 72%)",
        }}
      />

      <Stars count={70} />

      {/* Light rays */}
      <LightRay left="12%" rotate={-14} delay={0} width={180} />
      <LightRay left="48%" rotate={8} delay={5} width={220} opacity={0.07} />
      <LightRay left="80%" rotate={16} delay={9} width={160} opacity={0.08} />

      {/* Drifting glow blobs */}
      <AnimatedGlow
        color="rgba(124,92,255,0.35)"
        size={620}
        blur={80}
        duration={12}
        className="left-[-12%] top-[-10%]"
      />
      <AnimatedGlow
        color="rgba(168,85,247,0.28)"
        size={560}
        blur={90}
        duration={14}
        delay={2}
        drift={-30}
        className="right-[-14%] bottom-[-12%]"
      />
      <AnimatedGlow
        color="rgba(212,175,55,0.14)"
        size={420}
        blur={100}
        duration={16}
        delay={4}
        drift={18}
        className="left-[62%] top-[8%]"
      />

      <FloatingParticles count={30} />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 40%, rgba(3,6,14,0.55) 78%, rgba(3,6,14,0.9) 100%)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
