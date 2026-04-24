interface Props {
  facing?: "down" | "up" | "left" | "right";
  moving?: boolean;
  scale?: number;
}

const ROTATION: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };

export default function Character({ facing = "down", moving = false, scale = 3 }: Props) {
  const size = 14 * scale;
  const rot = ROTATION[facing] ?? 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      style={{
        overflow: "visible",
        transform: `rotate(${rot}deg)`,
        transition: "transform 0.12s ease",
        filter: `drop-shadow(0 0 ${moving ? 8 : 4}px rgba(120,200,255,0.9))`,
      }}
    >
      <defs>
        {/* Body gradient — metallic silver-blue */}
        <linearGradient id="hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#8ab4d4" />
          <stop offset="40%"  stopColor="#e8f4ff" />
          <stop offset="70%"  stopColor="#aac8e0" />
          <stop offset="100%" stopColor="#4a7a9b" />
        </linearGradient>

        {/* Wing gradient */}
        <linearGradient id="wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5588aa" />
          <stop offset="100%" stopColor="#1a3a55" />
        </linearGradient>

        {/* Engine glow */}
        <radialGradient id="thruster" cx="50%" cy="100%" r="60%">
          <stop offset="0%"   stopColor="#00cfff" stopOpacity={moving ? 1 : 0.3} />
          <stop offset="50%"  stopColor="#0066ff" stopOpacity={moving ? 0.8 : 0.1} />
          <stop offset="100%" stopColor="#000033" stopOpacity="0" />
        </radialGradient>

        {/* Cockpit glass */}
        <radialGradient id="glass" cx="40%" cy="35%" r="70%">
          <stop offset="0%"   stopColor="#e0f8ff" stopOpacity="0.95" />
          <stop offset="60%"  stopColor="#40a0cc" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#004466" stopOpacity="0.9" />
        </radialGradient>

        {/* Engine core */}
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="40%"  stopColor="#80dfff" />
          <stop offset="100%" stopColor="#0044aa" stopOpacity="0.5" />
        </radialGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Thruster plume (behind ship, at bottom since we face "up" at rot=0) ── */}
      {moving && (
        <ellipse cx="28" cy="50" rx="6" ry="10"
          fill="url(#thruster)"
          style={{ animation: "pulse 0.25s ease-in-out infinite alternate" }}
        />
      )}
      {/* static dim plume when idle */}
      {!moving && (
        <ellipse cx="28" cy="46" rx="3.5" ry="5" fill="url(#thruster)" opacity="0.4" />
      )}

      {/* ── Left wing ── */}
      <path d="M 28 28 L 8 40 L 14 44 L 24 34 Z" fill="url(#wing)" />
      {/* wing detail line */}
      <path d="M 14 42 L 22 34" stroke="#5599bb" strokeWidth="0.8" opacity="0.6" />

      {/* ── Right wing ── */}
      <path d="M 28 28 L 48 40 L 42 44 L 32 34 Z" fill="url(#wing)" />
      <path d="M 42 42 L 34 34" stroke="#5599bb" strokeWidth="0.8" opacity="0.6" />

      {/* ── Main hull ── */}
      <path
        d="M 28 4
           C 22 6, 18 14, 17 22
           L 16 38
           C 16 42, 22 44, 28 44
           C 34 44, 40 42, 40 38
           L 39 22
           C 38 14, 34 6, 28 4 Z"
        fill="url(#hull)"
        stroke="#336688"
        strokeWidth="0.8"
      />

      {/* hull panel lines */}
      <path d="M 22 24 L 22 38" stroke="#336688" strokeWidth="0.6" opacity="0.5" />
      <path d="M 34 24 L 34 38" stroke="#336688" strokeWidth="0.6" opacity="0.5" />
      <path d="M 20 32 L 36 32"  stroke="#336688" strokeWidth="0.6" opacity="0.4" />

      {/* ── Engine nozzle ── */}
      <ellipse cx="28" cy="42" rx="6" ry="2.5"
        fill="#1a2a3a" stroke="#336688" strokeWidth="0.8" />
      <ellipse cx="28" cy="42" rx="4" ry="1.5" fill="url(#core)" filter="url(#glow)" />

      {/* ── Cockpit canopy ── */}
      <ellipse cx="28" cy="18" rx="6.5" ry="8.5" fill="url(#glass)" />
      {/* canopy highlight */}
      <ellipse cx="26" cy="14" rx="2.5" ry="3" fill="white" opacity="0.35" />

      {/* ── Nose tip ── */}
      <path d="M 25 6 L 28 2 L 31 6 Z"
        fill="#c8e4f8" stroke="#5599bb" strokeWidth="0.5" />

      {/* ── Wing engine pods ── */}
      <ellipse cx="11" cy="41" rx="3.5" ry="2"
        fill="#1a2a3a" stroke="#336688" strokeWidth="0.6" />
      <ellipse cx="11" cy="41" rx="2.2" ry="1.2" fill="url(#core)" opacity={moving ? 1 : 0.4} />

      <ellipse cx="45" cy="41" rx="3.5" ry="2"
        fill="#1a2a3a" stroke="#336688" strokeWidth="0.6" />
      <ellipse cx="45" cy="41" rx="2.2" ry="1.2" fill="url(#core)" opacity={moving ? 1 : 0.4} />
    </svg>
  );
}
