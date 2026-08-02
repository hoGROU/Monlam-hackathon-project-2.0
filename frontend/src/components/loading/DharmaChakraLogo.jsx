import { motion } from "framer-motion";
import { useMemo } from "react";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5D77A";
const PURPLE = "#7C5CFF";

/** Eight spokes of the Dharma Chakra. */
const SPOKES = Array.from({ length: 8 }, (_, i) => i * 45);

function SparkRing({ count = 10, radius = 132, duration = 18, reverse = false }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (360 / count) * i,
        size: 2 + Math.random() * 2.5,
        delay: Math.random() * 3,
      })),
    [count]
  );

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: s.id % 2 === 0 ? GOLD_LIGHT : "#C4B5FD",
            boxShadow: `0 0 10px ${s.id % 2 === 0 ? "rgba(212,175,55,0.9)" : "rgba(124,92,255,0.9)"}`,
            transform: `rotate(${s.angle}deg) translateY(-${radius}px)`,
          }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.25, 0.7] }}
          transition={{ duration: 3.4, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  );
}

/**
 * DharmaChakraLogo
 * Modern SVG Wheel of Dharma — gold with purple neon glow, slow rotation,
 * breathing pulse, HUD rings and orbiting spark particles.
 */
export default function DharmaChakraLogo({ size = 240 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Radial light behind the wheel */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-[-40%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.42) 0%, rgba(168,85,247,0.18) 38%, transparent 68%)",
          filter: "blur(28px)",
        }}
        animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.94, 1.1, 0.94] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-[-10%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.28) 0%, transparent 62%)",
          filter: "blur(22px)",
        }}
        animate={{ opacity: [0.3, 0.75, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* HUD ring — outer dashed, slow clockwise */}
      <motion.svg
        viewBox="0 0 300 300"
        className="absolute inset-0 h-full w-full will-change-transform"
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <circle
          cx="150"
          cy="150"
          r="143"
          fill="none"
          stroke="rgba(124,92,255,0.35)"
          strokeWidth="1"
          strokeDasharray="2 12"
          strokeLinecap="round"
        />
        <circle
          cx="150"
          cy="150"
          r="133"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {[0, 90, 180, 270].map((a) => (
          <path
            key={a}
            d="M150 8 A142 142 0 0 1 196 16"
            fill="none"
            stroke="rgba(212,175,55,0.55)"
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${a} 150 150)`}
          />
        ))}
      </motion.svg>

      {/* HUD ring — inner, counter-rotating */}
      <motion.svg
        viewBox="0 0 300 300"
        className="absolute inset-0 h-full w-full will-change-transform"
        animate={{ rotate: -360 }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <circle
          cx="150"
          cy="150"
          r="118"
          fill="none"
          stroke="rgba(168,85,247,0.28)"
          strokeWidth="1"
          strokeDasharray="26 10 4 10"
          strokeLinecap="round"
        />
      </motion.svg>

      <SparkRing count={10} radius={size * 0.55} duration={22} />
      <SparkRing count={6} radius={size * 0.44} duration={30} reverse />

      {/* The wheel */}
      <motion.div
        className="relative h-full w-full will-change-transform"
        animate={{ scale: [0.985, 1.02, 0.985] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.svg
          viewBox="0 0 300 300"
          className="h-full w-full will-change-transform"
          style={{ filter: "drop-shadow(0 0 18px rgba(124,92,255,0.55))" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          role="img"
          aria-label="Dharma Chakra"
        >
          <defs>
            <linearGradient id="chakraGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBEFB8" />
              <stop offset="45%" stopColor={GOLD} />
              <stop offset="100%" stopColor="#9A7B1F" />
            </linearGradient>
            <linearGradient id="chakraSpoke" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={GOLD_LIGHT} />
              <stop offset="100%" stopColor="#B08D2A" />
            </linearGradient>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF6D6" />
              <stop offset="55%" stopColor={GOLD} />
              <stop offset="100%" stopColor="#7A5F14" />
            </radialGradient>
          </defs>

          {/* Outer rim */}
          <circle cx="150" cy="150" r="104" fill="none" stroke="url(#chakraGold)" strokeWidth="9" />
          <circle cx="150" cy="150" r="104" fill="none" stroke={PURPLE} strokeWidth="1.2" opacity="0.45" />
          <circle cx="150" cy="150" r="92" fill="none" stroke="url(#chakraGold)" strokeWidth="2.5" opacity="0.85" />

          {/* Rim jewels */}
          {SPOKES.map((a) => (
            <circle
              key={`jewel-${a}`}
              cx="150"
              cy="46"
              r="3.6"
              fill={GOLD_LIGHT}
              opacity="0.9"
              transform={`rotate(${a} 150 150)`}
            />
          ))}

          {/* Spokes */}
          {SPOKES.map((a) => (
            <g key={`spoke-${a}`} transform={`rotate(${a} 150 150)`}>
              <rect x="146.5" y="60" width="7" height="66" rx="3.5" fill="url(#chakraSpoke)" />
              <rect x="148.6" y="60" width="2.8" height="66" rx="1.4" fill="#FFF6D6" opacity="0.55" />
            </g>
          ))}

          {/* Inner ring */}
          <circle cx="150" cy="150" r="40" fill="none" stroke="url(#chakraGold)" strokeWidth="6" />
          <circle cx="150" cy="150" r="31" fill="rgba(17,24,39,0.65)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

          {/* Hub */}
          <circle cx="150" cy="150" r="18" fill="url(#hubGlow)" />
          <circle cx="150" cy="150" r="8" fill="#0B1020" opacity="0.85" />
          <circle cx="150" cy="150" r="8" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.4" opacity="0.9" />
        </motion.svg>
      </motion.div>

      {/* Breathing neon halo */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[8%] rounded-full"
        style={{ boxShadow: "0 0 60px rgba(124,92,255,0.45), inset 0 0 40px rgba(124,92,255,0.18)" }}
        animate={{ opacity: [0.35, 0.9, 0.35] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
