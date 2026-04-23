/* Pixel art curly-haired girl — SVG sprite */
interface Props {
  facing?: "down" | "up" | "left" | "right";
  moving?: boolean;
  scale?: number;
}

export default function Character({ facing = "down", moving = false, scale = 3 }: Props) {
  const s = scale; // pixels per unit
  const w = 16 * s;
  const h = 24 * s;

  // Pixel grid: each row is a hex color or "." for transparent
  // 16×24 character: curly dark hair, light skin, angelic smile, simple dress

  // Walking bob: alternate feet
  const bob = moving ? (Date.now() % 600 > 300 ? 1 : -1) : 0;

  const palette = {
    H: "#3a1a00", // hair dark
    h: "#5c2d00", // hair mid
    S: "#f5c5a0", // skin
    s: "#e8a880", // skin shadow
    W: "#ffffff", // whites (eyes/dress)
    E: "#2a1a0a", // eye dark
    R: "#ff9090", // cheek blush
    D: "#a0c0ff", // dress light blue
    d: "#7090df", // dress shadow
    B: "#4040b0", // dress dark (outline)
    L: "#f0e0c0", // halo glow
    ".": null,
  } as Record<string, string | null>;

  // 16-wide × 24-tall pixel art
  const frames: Record<string, string[]> = {
    down: [
      "....HHHHHHH.....",
      "...HhHHHHHhH....",
      "..HhHHHHHHHhH...",
      "..HHhHHHHHhHH...",
      "..HHHhHHHhHHH...",
      "...HSSSSSSSH....",
      "...SsSSSSSSs....",
      "...SWEEWEEWS....",
      "...SRWSSSRWS....",
      "...SSSSSSSS.....",
      "..SDDDDDDDDS....",
      "..DDDDDDDDDDD...",
      ".BDDDDDDDDDDDB..",
      ".BDDDDDDDDDDDB..",
      "..BDDDDDDDDDDB..",
      "..BDDDDDDDDDDB..",
      "...BDDDDDDDB....",
      "...BDDDDDDDB....",
      "....BDDDDDB.....",
      "....SSSS.SSS....",
      "....SSSS.SSS....",
      "....SSSS.SSS....",
      "................",
      "................",
    ],
    up: [
      "....HHHHHHH.....",
      "...HhHHHHHhH....",
      "..HhHHHHHHHhH...",
      "..HHhHHHHHhHH...",
      "..HHHhHHHhHHH...",
      "...HSSSSSSSH....",
      "...SSSSSSSSSS...",
      "...SHHHHHHHHS...",
      "...SHHHHHHHHS...",
      "...SSSSSSSSSS...",
      "..SDDDDDDDDS....",
      "..DDDDDDDDDDD...",
      ".BDDDDDDDDDDDB..",
      ".BDDDDDDDDDDDB..",
      "..BDDDDDDDDDDB..",
      "..BDDDDDDDDDDB..",
      "...BDDDDDDDB....",
      "...BDDDDDDDB....",
      "....BDDDDDB.....",
      "....SSSS.SSS....",
      "....SSSS.SSS....",
      "....SSSS.SSS....",
      "................",
      "................",
    ],
  };

  const frame = frames[facing in frames ? facing : "down"];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        imageRendering: "pixelated",
        transform: `translateY(${bob}px)`,
        transition: "transform 0.1s",
        filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.5))",
      }}
    >
      {/* Halo */}
      <ellipse cx={w / 2} cy={s * 1} rx={s * 3.5} ry={s * 0.8}
        fill="#ffe066" opacity={0.7} />
      <ellipse cx={w / 2} cy={s * 1} rx={s * 3} ry={s * 0.5}
        fill="#fff8a0" opacity={0.5} />

      {frame.map((row, y) =>
        row.split("").map((ch, x) => {
          const color = palette[ch];
          if (!color) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * s}
              y={y * s}
              width={s}
              height={s}
              fill={color}
            />
          );
        })
      )}
    </svg>
  );
}
