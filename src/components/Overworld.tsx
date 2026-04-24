import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";
import Character from "./Character";
import Library from "./buildings/Library";
import Lab from "./buildings/Lab";
import Academy from "./buildings/Academy";
import Shrine from "./buildings/Shrine";
import Arcade from "./buildings/Arcade";

type BuildingId = "library" | "lab" | "academy" | "shrine" | "arcade";
type Direction = "up" | "down" | "left" | "right";

interface Building {
  id: BuildingId;
  label: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  roofColor: string;
  planetColor: string;
  planetLabel: string;
}

const TILE = 32;
const MAP_W = 28;
const MAP_H = 20;

const BUILDINGS: Building[] = [
  { id: "library",  label: "LIBRARY",  emoji: "📚", x: 3,  y: 3,  w: 4, h: 4, color: "#5c3d1e", roofColor: "#8b2e2e", planetColor: "#9b59b6", planetLabel: "LIBRARIA" },
  { id: "lab",      label: "LAB",      emoji: "🔬", x: 11, y: 3,  w: 4, h: 4, color: "#1a3a5c", roofColor: "#0a5a8a", planetColor: "#00e676", planetLabel: "LABRON"   },
  { id: "academy",  label: "ACADEMY",  emoji: "🎓", x: 19, y: 3,  w: 5, h: 4, color: "#2d1a5c", roofColor: "#6a2a9a", planetColor: "#ff9800", planetLabel: "ACADEM"   },
  { id: "shrine",   label: "SHRINE",   emoji: "⛩️", x: 6,  y: 13, w: 4, h: 4, color: "#5c1a1a", roofColor: "#c04040", planetColor: "#ef5350", planetLabel: "SHRINIA"  },
  { id: "arcade",   label: "ARCADE",   emoji: "🕹️", x: 17, y: 13, w: 4, h: 4, color: "#1a4a1a", roofColor: "#2a8a2a", planetColor: "#00bcd4", planetLabel: "ARCADIA"  },
];

const WATER_TILES = [
  { x: 0, y: 0, w: 2, h: MAP_H },
  { x: MAP_W - 2, y: 0, w: 2, h: MAP_H },
  { x: 0, y: 0, w: MAP_W, h: 2 },
  { x: 0, y: MAP_H - 2, w: MAP_W, h: 2 },
  { x: 8, y: 8, w: 3, h: 3 },
];

const PATH_TILES = [
  { x: 2, y: 2, w: MAP_W - 4, h: 1 },
  { x: 2, y: MAP_H - 3, w: MAP_W - 4, h: 1 },
  { x: 2, y: 2, w: 1, h: MAP_H - 4 },
  { x: MAP_W - 3, y: 2, w: 1, h: MAP_H - 4 },
  { x: 6, y: 2, w: 1, h: 16 },
  { x: 12, y: 2, w: 1, h: 16 },
  { x: 18, y: 2, w: 1, h: 16 },
  { x: 2, y: 8, w: 24, h: 1 },
  { x: 2, y: 12, w: 24, h: 1 },
];

// Seeded star positions so they don't regenerate on re-render
const STARS_NORMAL = Array.from({ length: 30 }, (_, i) => ({
  top: (i * 137.5) % 100,
  left: (i * 97.3) % 100,
  size: i % 5 === 0 ? 2 : 1,
  dur: 1.5 + (i % 4) * 0.5,
  delay: (i % 7) * 0.3,
}));

const STARS_SPACE = Array.from({ length: 200 }, (_, i) => ({
  top: (i * 47.3 + 13) % 100,
  left: (i * 83.7 + 7) % 100,
  size: i % 20 === 0 ? 3 : i % 7 === 0 ? 2 : 1,
  dur: 1 + (i % 5) * 0.4,
  delay: (i % 11) * 0.2,
  color: i % 3 === 0 ? "#a0c4ff" : i % 5 === 0 ? "#fffab0" : "#ffffff",
}));

function isSolid(px: number, py: number): boolean {
  const col = Math.floor(px / TILE);
  const row = Math.floor(py / TILE);
  for (const w of WATER_TILES) {
    if (col >= w.x && col < w.x + w.w && row >= w.y && row < w.y + w.h) return true;
  }
  for (const b of BUILDINGS) {
    const bx = b.x * TILE, by = b.y * TILE;
    const bw = b.w * TILE, bh = b.h * TILE;
    if (px + 8 >= bx && px + 8 < bx + bw && py + 8 >= by && py + 8 < by + bh - 8) return true;
  }
  if (px < TILE * 2 || py < TILE * 2 || px > (MAP_W - 3) * TILE || py > (MAP_H - 3) * TILE) return true;
  return false;
}

function nearBuilding(px: number, py: number): BuildingId | null {
  const cx = px + 12;
  const cy = py + 20;
  for (const b of BUILDINGS) {
    const bx = b.x * TILE + (b.w * TILE) / 2;
    const by = (b.y + b.h) * TILE;
    const dist = Math.hypot(cx - bx, cy - by);
    if (dist < TILE * 1.8) return b.id;
  }
  return null;
}

const BUILDING_COMPONENTS: Record<BuildingId, React.ComponentType<{ onClose: () => void }>> = {
  library: Library,
  lab: Lab,
  academy: Academy,
  shrine: Shrine,
  arcade: Arcade,
};

export default function Overworld() {
  const { theme } = useTheme();
  const [pos, setPos] = useState({ x: 13 * TILE, y: 9 * TILE });
  const [facing, setFacing] = useState<Direction>("down");
  const [moving, setMoving] = useState(false);
  const [activeBuilding, setActiveBuilding] = useState<BuildingId | null>(null);
  const [nearBy, setNearBy] = useState<BuildingId | null>(null);
  const [spaceMode, setSpaceMode] = useState(false);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const konamiRef = useRef<string[]>([]);
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const [showKonami, setShowKonami] = useState(false);
  const [isTouchDevice] = useState(() => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));

  const SPEED = 90;

  const gameLoop = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now;
    const dt = Math.min((now - lastRef.current) / 1000, 0.1);
    lastRef.current = now;

    const keys = keysRef.current;
    let dx = 0, dy = 0;

    if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) { dx -= 1; setFacing("left");  }
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) { dx += 1; setFacing("right"); }
    if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) { dy -= 1; setFacing("up");    }
    if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) { dy += 1; setFacing("down");  }

    const isMoving = dx !== 0 || dy !== 0;
    setMoving(isMoving);

    if (isMoving) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      setPos((prev) => {
        const nx = prev.x + dx * SPEED * dt;
        const ny = prev.y + dy * SPEED * dt;
        const newX = isSolid(nx, prev.y) ? prev.x : nx;
        const newY = isSolid(prev.x, ny) ? prev.y : ny;
        setNearBy(nearBuilding(newX, newY));
        return { x: newX, y: newY };
      });
    } else {
      setNearBy(nearBuilding(pos.x, pos.y));
    }

    animRef.current = requestAnimationFrame(gameLoop);
  }, [pos.x, pos.y]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === " " || e.key === "Enter") {
        const nb = nearBuilding(pos.x, pos.y);
        if (nb) setActiveBuilding(nb);
      }
      if (e.key === "Escape") setActiveBuilding(null);
      konamiRef.current.push(e.key);
      konamiRef.current = konamiRef.current.slice(-10);
      if (konamiRef.current.join(",") === KONAMI.join(",")) {
        setShowKonami(true);
        setTimeout(() => setShowKonami(false), 3000);
      }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onUp); };
  }, [pos.x, pos.y]);

  const handleDpadPress = useCallback((key: string) => {
    keysRef.current.add(key);
    if (key === "Enter") {
      const nb = nearBuilding(pos.x, pos.y);
      if (nb) setActiveBuilding(nb);
    }
  }, [pos.x, pos.y]);

  const handleDpadRelease = useCallback((key: string) => {
    keysRef.current.delete(key);
  }, []);

  useEffect(() => {
    (window as any).sudo = (cmd: string) => {
      if (cmd === "hire rohini") {
        console.log("%c✓ sudo hire rohini — executing...", "color: #6ee86e; font-size: 16px; font-weight: bold");
        console.log("%cResumeDownloading... 100%", "color: #6ee86e");
        return "Let's build something great. 🚀";
      }
    };
  }, []);

  const camX = Math.max(0, Math.min(pos.x - window.innerWidth / 2, MAP_W * TILE - window.innerWidth));
  const camY = Math.max(0, Math.min(pos.y - window.innerHeight / 2, MAP_H * TILE - window.innerHeight));

  const mapStyle: React.CSSProperties = {
    width: MAP_W * TILE,
    height: MAP_H * TILE,
    position: "relative",
    transform: `translate(${-camX}px, ${-camY}px)`,
    willChange: "transform",
  };

  const bgColor = spaceMode ? "#000010" : theme.sky;
  const stars = spaceMode ? STARS_SPACE : STARS_NORMAL;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden scanlines"
      style={{ background: bgColor, cursor: "default", touchAction: "none" }}
      tabIndex={0}
    >
      {/* Stars / space background */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            background: (s as any).color ?? theme.text,
            top: `${s.top}%`,
            left: `${s.left}%`,
            opacity: spaceMode ? 0.6 + (i % 3) * 0.15 : 0.3 + (i % 3) * 0.2,
            animation: `twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Space mode: nebula clouds */}
      {spaceMode && [
        { top: "15%", left: "10%",  w: 180, h: 80,  color: "#4a0080" },
        { top: "60%", left: "55%",  w: 220, h: 100, color: "#003060" },
        { top: "30%", left: "70%",  w: 150, h: 70,  color: "#006040" },
        { top: "75%", left: "20%",  w: 160, h: 60,  color: "#500030" },
      ].map((n, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          top: n.top, left: n.left,
          width: n.w, height: n.h,
          background: n.color,
          borderRadius: "50%",
          opacity: 0.12,
          filter: "blur(24px)",
        }} />
      ))}

      {/* Map */}
      <div style={mapStyle}>
        {/* Ground / space void */}
        <div style={{ position: "absolute", inset: 0, background: spaceMode ? "#000018" : theme.ground }} />

        {/* Water / black holes in space mode */}
        {WATER_TILES.map((w, i) => (
          <div key={i} style={{
            position: "absolute",
            left: w.x * TILE, top: w.y * TILE,
            width: w.w * TILE, height: w.h * TILE,
            background: spaceMode ? "#000000" : theme.water,
            boxShadow: spaceMode
              ? `inset 0 0 ${w.w * TILE / 2}px rgba(60,0,120,0.6)`
              : `inset 0 0 8px rgba(0,0,0,0.3)`,
            borderRadius: spaceMode ? "50%" : 0,
          }} />
        ))}

        {/* Paths / warp lanes in space mode */}
        {PATH_TILES.map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: p.x * TILE, top: p.y * TILE,
            width: p.w * TILE, height: p.h * TILE,
            background: spaceMode ? "#ffffff" : theme.path,
            opacity: spaceMode ? 0.06 : 0.7,
          }} />
        ))}

        {/* Trees / asteroids in space mode */}
        {!spaceMode && [
          [9,5],[10,6],[9,10],[15,6],[16,10],[22,6],[23,7],
          [4,16],[8,16],[14,16],[20,16],[24,16],[25,10],
        ].map(([tx, ty], i) => (
          <div key={i} style={{
            position: "absolute",
            left: tx! * TILE + TILE / 4, top: ty! * TILE + TILE / 4,
            width: TILE / 2, height: TILE / 2,
            background: theme.tree,
            borderRadius: "50% 50% 20% 20%",
            boxShadow: `0 ${TILE / 6}px 0 ${TILE / 8}px ${theme.building}`,
          }} />
        ))}

        {/* Asteroids in space mode */}
        {spaceMode && [
          [9,5],[10,6],[9,10],[15,6],[16,10],[22,6],[23,7],
          [4,16],[8,16],[14,16],[20,16],[24,16],[25,10],
        ].map(([tx, ty], i) => (
          <div key={i} style={{
            position: "absolute",
            left: tx! * TILE + TILE / 4, top: ty! * TILE + TILE / 4,
            width: TILE / 2, height: TILE / 2,
            background: `hsl(${(i * 37) % 360}, 20%, 35%)`,
            borderRadius: i % 3 === 0 ? "40% 60% 55% 45%" : "50%",
            opacity: 0.7,
          }} />
        ))}

        {/* Buildings / Planets */}
        {BUILDINGS.map((b) => {
          const isNear = nearBy === b.id;
          const cx = b.x * TILE + (b.w * TILE) / 2;
          const cy = b.y * TILE + (b.h * TILE) / 2;
          const pr = Math.min(b.w, b.h) * TILE / 2;

          if (spaceMode) {
            return (
              <Fragment key={b.id}>
                {/* Orbital ring */}
                <div style={{
                  position: "absolute",
                  left: cx - pr * 1.5,
                  top: cy - pr * 0.35,
                  width: pr * 3,
                  height: pr * 0.7,
                  border: `2px solid ${b.planetColor}50`,
                  borderRadius: "50%",
                  pointerEvents: "none",
                }} />
                {/* Planet body */}
                <div
                  onClick={() => setActiveBuilding(b.id)}
                  style={{
                    position: "absolute",
                    left: cx - pr,
                    top: cy - pr,
                    width: pr * 2,
                    height: pr * 2,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 30%, ${b.planetColor}cc, ${b.planetColor} 50%, ${b.planetColor}44)`,
                    boxShadow: isNear
                      ? `0 0 30px ${b.planetColor}, 0 0 60px ${b.planetColor}60, inset 0 0 20px rgba(0,0,0,0.4)`
                      : `0 0 20px ${b.planetColor}60, inset 0 0 20px rgba(0,0,0,0.4)`,
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                />
                {/* Planet surface detail */}
                <div style={{
                  position: "absolute",
                  left: cx - pr * 0.4,
                  top: cy - pr * 0.6,
                  width: pr * 0.5,
                  height: pr * 0.25,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  pointerEvents: "none",
                  zIndex: 3,
                }} />
                {/* Label */}
                <div style={{
                  position: "absolute",
                  left: cx - pr * 1.5,
                  top: cy - pr - 22,
                  width: pr * 3,
                  textAlign: "center",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  color: isNear ? b.planetColor : `${b.planetColor}cc`,
                  textShadow: `0 0 8px ${b.planetColor}80`,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}>
                  {b.emoji} {b.planetLabel}
                </div>
              </Fragment>
            );
          }

          return (
            <Fragment key={b.id}>
              {isNear && (
                <div style={{
                  position: "absolute",
                  left: b.x * TILE - 4, top: b.y * TILE - 4,
                  width: b.w * TILE + 8, height: b.h * TILE + 8,
                  border: `3px solid ${theme.accent}`,
                  boxShadow: `0 0 16px ${theme.accent}80`,
                  pointerEvents: "none",
                }} />
              )}
              <div onClick={() => setActiveBuilding(b.id)} style={{
                position: "absolute",
                left: b.x * TILE, top: b.y * TILE,
                width: b.w * TILE, height: TILE,
                background: b.roofColor, cursor: "pointer",
                borderBottom: `2px solid rgba(0,0,0,0.3)`,
              }} />
              <div onClick={() => setActiveBuilding(b.id)} style={{
                position: "absolute",
                left: b.x * TILE, top: b.y * TILE + TILE,
                width: b.w * TILE, height: (b.h - 1) * TILE,
                background: b.color, cursor: "pointer",
              }} />
              <div style={{
                position: "absolute",
                left: b.x * TILE + (b.w * TILE) / 2 - 6,
                top: (b.y + b.h) * TILE - TILE / 2,
                width: 12, height: TILE / 2,
                background: "rgba(0,0,0,0.6)",
                borderRadius: "4px 4px 0 0",
              }} />
              <div style={{
                position: "absolute",
                left: b.x * TILE + TILE / 2 - 4,
                top: b.y * TILE + TILE + 6,
                width: 8, height: 8,
                background: `${theme.accent}60`,
                boxShadow: `0 0 4px ${theme.accent}80`,
              }} />
              <div style={{
                position: "absolute",
                left: b.x * TILE, top: b.y * TILE - 24,
                width: b.w * TILE, textAlign: "center",
                fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                color: isNear ? theme.accent : theme.text,
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                pointerEvents: "none", whiteSpace: "nowrap",
              }}>
                {b.emoji} {b.label}
              </div>
            </Fragment>
          );
        })}

        {/* Character */}
        <div style={{ position: "absolute", left: pos.x, top: pos.y, zIndex: 10 }}>
          <Character facing={facing} moving={moving} scale={3} />
        </div>
      </div>

      {/* HUD — name plate */}
      <div className="fixed top-4 left-4 px-4 py-2" style={{
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        boxShadow: `0 0 12px ${theme.accent}30`,
      }}>
        <p className="font-pixel crt-glow" style={{ fontSize: 9, color: theme.accent }}>
          ROHINI RAJASIMMAN
        </p>
        <p className="font-mono opacity-50 mt-0.5" style={{ color: theme.text, fontSize: 9 }}>
          builder · reader · explorer
        </p>
      </div>

      {/* Space mode toggle button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setSpaceMode((s) => !s)}
        className="fixed font-pixel"
        style={{
          top: 64,
          left: 16,
          padding: "6px 10px",
          fontSize: 7,
          background: spaceMode ? `${theme.accent}20` : "rgba(0,0,20,0.7)",
          border: `2px solid ${spaceMode ? theme.accent : "#4488ff"}`,
          color: spaceMode ? theme.accent : "#4488ff",
          boxShadow: spaceMode ? `0 0 12px ${theme.accent}60` : "0 0 12px #4488ff40",
          cursor: "pointer",
          zIndex: 40,
          whiteSpace: "nowrap",
        }}
      >
        {spaceMode ? "🌍 EXIT SPACE" : "🚀 SPACESHIP MODE"}
      </motion.button>

      {/* Near building hint */}
      <AnimatePresence>
        {nearBy && !activeBuilding && (
          <div
            className="fixed left-1/2 -translate-x-1/2 px-4 py-2 font-pixel"
            style={{
              bottom: isTouchDevice ? 200 : 80,
              background: theme.panel,
              border: `2px solid ${spaceMode ? (BUILDINGS.find(b => b.id === nearBy)?.planetColor ?? theme.accent) : theme.accent}`,
              fontSize: 9,
              color: spaceMode ? (BUILDINGS.find(b => b.id === nearBy)?.planetColor ?? theme.accent) : theme.accent,
              boxShadow: `0 0 16px ${theme.accent}40`,
              whiteSpace: "nowrap",
              zIndex: 45,
            }}
          >
            {isTouchDevice ? "TAP A" : "ENTER"} to explore{" "}
            {BUILDINGS.find((b) => b.id === nearBy)?.emoji}{" "}
            {spaceMode
              ? BUILDINGS.find((b) => b.id === nearBy)?.planetLabel
              : BUILDINGS.find((b) => b.id === nearBy)?.label}
          </div>
        )}
      </AnimatePresence>

      {/* Controls hint (desktop) */}
      {!isTouchDevice && (
        <div className="fixed bottom-4 right-4 font-mono opacity-40 text-right" style={{ fontSize: 10, color: theme.text }}>
          ↑↓←→ move &nbsp;·&nbsp; ENTER explore
        </div>
      )}

      {/* Mobile D-pad — pointer events (works on all touch devices) */}
      {isTouchDevice && (
        <div className="fixed z-50 select-none" style={{ bottom: 24, right: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            {/* A button */}
            <button
              onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); handleDpadPress("Enter"); }}
              onPointerUp={(e) => { e.preventDefault(); handleDpadRelease("Enter"); }}
              onPointerCancel={(e) => { e.preventDefault(); handleDpadRelease("Enter"); }}
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: `${theme.accent}25`,
                border: `2px solid ${theme.accent}`,
                color: theme.accent,
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "none", userSelect: "none",
                marginBottom: 24,
                cursor: "pointer",
              }}
            >A</button>
            {/* D-pad grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 50px)", gridTemplateRows: "repeat(3, 50px)", gap: 3 }}>
              {([
                [null, "ArrowUp", null],
                ["ArrowLeft", null, "ArrowRight"],
                [null, "ArrowDown", null],
              ] as (string | null)[][]).map((row, ri) =>
                row.map((key, ci) =>
                  key ? (
                    <button
                      key={`${ri}-${ci}`}
                      onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); handleDpadPress(key); }}
                      onPointerUp={(e) => { e.preventDefault(); handleDpadRelease(key); }}
                      onPointerCancel={(e) => { e.preventDefault(); handleDpadRelease(key); }}
                      style={{
                        width: 50, height: 50,
                        background: theme.panel,
                        border: `2px solid ${theme.panelBorder}`,
                        color: theme.accent,
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        touchAction: "none", userSelect: "none",
                        cursor: "pointer",
                      }}
                    >
                      {key === "ArrowUp" ? "↑" : key === "ArrowDown" ? "↓" : key === "ArrowLeft" ? "←" : "→"}
                    </button>
                  ) : (
                    <div key={`${ri}-${ci}`} style={{ width: 50, height: 50, background: `${theme.panel}60`, border: `1px solid ${theme.panelBorder}20` }} />
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Konami easter egg */}
      <AnimatePresence>
        {showKonami && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="font-pixel text-center p-8" style={{
              background: theme.panel,
              border: `4px solid ${theme.accent}`,
              fontSize: 12, color: theme.accent,
              boxShadow: `0 0 60px ${theme.accent}`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
              CHEAT CODE ACTIVATED
              <div className="font-mono text-xs mt-2 opacity-60" style={{ color: theme.text }}>
                +99 lives. You found it!
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Building modals */}
      <AnimatePresence>
        {activeBuilding && (() => {
          const Comp = BUILDING_COMPONENTS[activeBuilding];
          return <Comp key={activeBuilding} onClose={() => setActiveBuilding(null)} />;
        })()}
      </AnimatePresence>
    </div>
  );
}
