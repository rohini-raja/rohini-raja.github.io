interface Props {
  facing?: "down" | "up" | "left" | "right";
  moving?: boolean;
  scale?: number;
}

const ROTATION: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };

export default function Character({ facing = "down", moving = false, scale = 3 }: Props) {
  const size = 18 * scale;
  const rot = ROTATION[facing] ?? 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      style={{
        overflow: "visible",
        transform: `rotate(${rot}deg)`,
        transition: "transform 0.12s ease",
        filter: `drop-shadow(0 2px ${moving ? 10 : 5}px rgba(140,200,255,0.55))`,
      }}
    >
      <defs>
        {/* White composite hull — main body, slight blue cast on the shadow side */}
        <linearGradient id="hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#9fb4c7" />
          <stop offset="22%"  stopColor="#e6ecf2" />
          <stop offset="50%"  stopColor="#ffffff" />
          <stop offset="78%"  stopColor="#dde3ea" />
          <stop offset="100%" stopColor="#7e8a99" />
        </linearGradient>

        {/* Conical capsule top — softer */}
        <linearGradient id="nose" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#b0c0cf" />
          <stop offset="50%"  stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#8a98a7" />
        </linearGradient>

        {/* Solar panels — dark blue silicon with cell grid */}
        <linearGradient id="solar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a2a4d" />
          <stop offset="50%"  stopColor="#2a3f7a" />
          <stop offset="100%" stopColor="#0e1830" />
        </linearGradient>

        {/* Panel border / strut */}
        <linearGradient id="strut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c0c8d0" />
          <stop offset="100%" stopColor="#5a6470" />
        </linearGradient>

        {/* Cockpit canopy glass — dark teal, like real visor */}
        <radialGradient id="glass" cx="42%" cy="32%" r="75%">
          <stop offset="0%"   stopColor="#cce8ff" stopOpacity="0.95" />
          <stop offset="35%"  stopColor="#3a7ba8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#08182a" stopOpacity="0.95" />
        </radialGradient>

        {/* Engine bell */}
        <radialGradient id="bell" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#7a8590" />
          <stop offset="60%"  stopColor="#2a323c" />
          <stop offset="100%" stopColor="#08101a" />
        </radialGradient>

        {/* Thruster plume */}
        <radialGradient id="plume" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#e8faff" stopOpacity={moving ? 1 : 0.35} />
          <stop offset="25%"  stopColor="#7fd8ff" stopOpacity={moving ? 0.85 : 0.18} />
          <stop offset="65%"  stopColor="#1f7fff" stopOpacity={moving ? 0.45 : 0.05} />
          <stop offset="100%" stopColor="#000522" stopOpacity="0" />
        </radialGradient>

        {/* Engine core highlight */}
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="35%"  stopColor="#9fe8ff" />
          <stop offset="100%" stopColor="#0a4a88" stopOpacity="0.4" />
        </radialGradient>

        {/* Subtle hull glow */}
        <filter id="bloom">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Solar cell pattern */}
        <pattern id="cells" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="url(#solar)" />
          <path d="M 3 0 L 3 3 M 0 3 L 3 3" stroke="#0a1428" strokeWidth="0.25" opacity="0.7" />
        </pattern>
      </defs>

      {/* ── Engine plume ── */}
      <ellipse cx="36" cy={moving ? 66 : 60} rx={moving ? 7 : 4} ry={moving ? 14 : 6}
        fill="url(#plume)"
        style={moving ? { animation: "pulse 0.18s ease-in-out infinite alternate" } : undefined}
      />

      {/* ── Solar panel array (left wing) ── */}
      <g>
        {/* strut */}
        <rect x="22" y="34" width="3" height="2" fill="url(#strut)" />
        {/* panel */}
        <rect x="6" y="32" width="16" height="6" fill="url(#cells)"
          stroke="#3a4860" strokeWidth="0.4" rx="0.5" />
        {/* second panel */}
        <rect x="6" y="39" width="16" height="6" fill="url(#cells)"
          stroke="#3a4860" strokeWidth="0.4" rx="0.5" />
        {/* highlight */}
        <rect x="6" y="32" width="16" height="0.8" fill="rgba(255,255,255,0.12)" />
      </g>

      {/* ── Solar panel array (right wing) ── */}
      <g>
        <rect x="47" y="34" width="3" height="2" fill="url(#strut)" />
        <rect x="50" y="32" width="16" height="6" fill="url(#cells)"
          stroke="#3a4860" strokeWidth="0.4" rx="0.5" />
        <rect x="50" y="39" width="16" height="6" fill="url(#cells)"
          stroke="#3a4860" strokeWidth="0.4" rx="0.5" />
        <rect x="50" y="32" width="16" height="0.8" fill="rgba(255,255,255,0.12)" />
      </g>

      {/* ── Service module (lower cylinder) ── */}
      <path
        d="M 26 38
           L 26 54
           C 26 57, 28 58, 36 58
           C 44 58, 46 57, 46 54
           L 46 38 Z"
        fill="url(#hull)" stroke="#5b6a7a" strokeWidth="0.5"
      />
      {/* service module rib lines */}
      <path d="M 26 44 L 46 44" stroke="#7a8a9c" strokeWidth="0.3" opacity="0.6" />
      <path d="M 26 50 L 46 50" stroke="#7a8a9c" strokeWidth="0.3" opacity="0.6" />
      {/* USA-style flag panel */}
      <rect x="29" y="46" width="4" height="2.5" fill="#c43030" opacity="0.85" />
      <rect x="29" y="48.5" width="4" height="0.6" fill="#fff" opacity="0.85" />

      {/* ── Capsule (Orion-style truncated cone) ── */}
      <path
        d="M 30 8
           C 27 9, 25 14, 24 22
           L 23 38
           L 49 38
           L 48 22
           C 47 14, 45 9, 42 8
           L 36 6 Z"
        fill="url(#nose)" stroke="#5b6a7a" strokeWidth="0.6"
      />
      {/* capsule heat-shield band at bottom */}
      <rect x="23" y="36" width="26" height="2.4" fill="#444c58" opacity="0.6" />
      {/* capsule panel seams */}
      <path d="M 28 14 L 28 36" stroke="#aab4be" strokeWidth="0.4" opacity="0.8" />
      <path d="M 36 10 L 36 36" stroke="#aab4be" strokeWidth="0.4" opacity="0.5" />
      <path d="M 44 14 L 44 36" stroke="#aab4be" strokeWidth="0.4" opacity="0.8" />

      {/* ── Cockpit window ── */}
      <ellipse cx="36" cy="20" rx="6" ry="7" fill="url(#glass)"
        stroke="#0a1828" strokeWidth="0.6" />
      {/* window sash */}
      <ellipse cx="36" cy="20" rx="6" ry="7" fill="none"
        stroke="#dfe6ec" strokeWidth="0.5" opacity="0.8" />
      {/* window highlight */}
      <ellipse cx="33.5" cy="16.5" rx="2" ry="2.5" fill="white" opacity="0.45" />

      {/* ── Nose tip / docking port ── */}
      <circle cx="36" cy="6" r="2.2" fill="#dfe6ec" stroke="#5b6a7a" strokeWidth="0.4" />
      <circle cx="36" cy="6" r="0.9" fill="#1a2230" />

      {/* ── Engine bell ── */}
      <ellipse cx="36" cy="58" rx="9" ry="2.4" fill="url(#bell)" stroke="#1a2230" strokeWidth="0.5" />
      <ellipse cx="36" cy="58" rx="6.5" ry="1.6" fill="url(#core)" filter="url(#bloom)" />

      {/* ── RCS thrusters (small attitude jets) ── */}
      <rect x="24.5" y="34" width="1.5" height="3" fill="#5b6a7a" />
      <rect x="46" y="34" width="1.5" height="3" fill="#5b6a7a" />

      {/* ── Hull rivets ── */}
      <circle cx="27" cy="42" r="0.3" fill="#5b6a7a" />
      <circle cx="45" cy="42" r="0.3" fill="#5b6a7a" />
      <circle cx="27" cy="52" r="0.3" fill="#5b6a7a" />
      <circle cx="45" cy="52" r="0.3" fill="#5b6a7a" />
    </svg>
  );
}
