import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { AnimatePresence } from "framer-motion";
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
  x: number; // tile col
  y: number; // tile row
  w: number;
  h: number;
  color: string;
  roofColor: string;
}

const TILE = 32;
const MAP_W = 28;
const MAP_H = 20;

const BUILDINGS: Building[] = [
  { id: "library",  label: "LIBRARY",  emoji: "📚", x: 3,  y: 3,  w: 4, h: 4, color: "#5c3d1e", roofColor: "#8b2e2e" },
  { id: "lab",      label: "LAB",      emoji: "🔬", x: 11, y: 3,  w: 4, h: 4, color: "#1a3a5c", roofColor: "#0a5a8a" },
  { id: "academy",  label: "ACADEMY",  emoji: "🎓", x: 19, y: 3,  w: 5, h: 4, color: "#2d1a5c", roofColor: "#6a2a9a" },
  { id: "shrine",   label: "SHRINE",   emoji: "⛩️", x: 6,  y: 13, w: 4, h: 4, color: "#5c1a1a", roofColor: "#c04040" },
  { id: "arcade",   label: "ARCADE",   emoji: "🕹️", x: 17, y: 13, w: 4, h: 4, color: "#1a4a1a", roofColor: "#2a8a2a" },
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

function isSolid(px: number, py: number): boolean {
  const col = Math.floor(px / TILE);
  const row = Math.floor(py / TILE);
  // Water
  for (const w of WATER_TILES) {
    if (col >= w.x && col < w.x + w.w && row >= w.y && row < w.y + w.h) return true;
  }
  // Buildings (all but doorstep row)
  for (const b of BUILDINGS) {
    const bx = b.x * TILE, by = b.y * TILE;
    const bw = b.w * TILE, bh = b.h * TILE;
    if (px + 8 >= bx && px + 8 < bx + bw && py + 8 >= by && py + 8 < by + bh - 8) return true;
  }
  // Map bounds
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
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Konami code easter egg
  const konamiRef = useRef<string[]>([]);
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const [showKonami, setShowKonami] = useState(false);
  const [isTouchDevice] = useState(() => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));

  const SPEED = 90; // px/s

  const gameLoop = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now;
    const dt = Math.min((now - lastRef.current) / 1000, 0.1);
    lastRef.current = now;

    const keys = keysRef.current;
    let dx = 0, dy = 0;

    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) { dx -= 1; setFacing("left"); }
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) { dx += 1; setFacing("right"); }
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) { dy -= 1; setFacing("up"); }
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) { dy += 1; setFacing("down"); }

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
        const nb = nearBuilding(newX, newY);
        setNearBy(nb);
        return { x: newX, y: newY };
      });
    } else {
      setNearBy((prev) => {
        const nb = nearBuilding(pos.x, pos.y);
        return nb;
      });
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

      // Konami
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
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
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

  // sudo easter egg
  useEffect(() => {
    (window as any).sudo = (cmd: string) => {
      if (cmd === "hire rohini") {
        console.log("%c✓ sudo hire rohini — executing...", "color: #6ee86e; font-size: 16px; font-weight: bold");
        console.log("%cResumeDownloading... 100%", "color: #6ee86e");
        console.log("%cEmail: rohini.raja@example.com", "color: #6ee86e");
        return "Let's build something great. 🚀";
      }
    };
  }, []);

  // Camera: center on character
  const camX = Math.max(0, Math.min(pos.x - window.innerWidth / 2, MAP_W * TILE - window.innerWidth));
  const camY = Math.max(0, Math.min(pos.y - window.innerHeight / 2, MAP_H * TILE - window.innerHeight));

  const mapStyle: React.CSSProperties = {
    width: MAP_W * TILE,
    height: MAP_H * TILE,
    position: "relative",
    transform: `translate(${-camX}px, ${-camY}px)`,
    willChange: "transform",
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden scanlines"
      style={{ background: theme.sky, cursor: "default" }}
      tabIndex={0}
    >
      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            background: theme.text,
            top: `${(i * 137.5) % 100}%`,
            left: `${(i * 97.3) % 100}%`,
            opacity: 0.3 + (i % 3) * 0.2,
            animation: `twinkle ${1.5 + (i % 4) * 0.5}s ease-in-out infinite`,
            animationDelay: `${(i % 7) * 0.3}s`,
          }}
        />
      ))}

      {/* Map */}
      <div style={mapStyle}>
        {/* Ground */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: theme.ground,
          }}
        />

        {/* Water */}
        {WATER_TILES.map((w, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: w.x * TILE,
              top: w.y * TILE,
              width: w.w * TILE,
              height: w.h * TILE,
              background: theme.water,
              boxShadow: `inset 0 0 8px rgba(0,0,0,0.3)`,
            }}
          />
        ))}

        {/* Paths */}
        {PATH_TILES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x * TILE,
              top: p.y * TILE,
              width: p.w * TILE,
              height: p.h * TILE,
              background: theme.path,
              opacity: 0.7,
            }}
          />
        ))}

        {/* Trees (decorative) */}
        {[
          [9, 5], [10, 6], [9, 10], [15, 6], [16, 10], [22, 6], [23, 7],
          [4, 16], [8, 16], [14, 16], [20, 16], [24, 16], [25, 10],
        ].map(([tx, ty], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: tx! * TILE + TILE / 4,
              top: ty! * TILE + TILE / 4,
              width: TILE / 2,
              height: TILE / 2,
              background: theme.tree,
              borderRadius: "50% 50% 20% 20%",
              boxShadow: `0 ${TILE / 6}px 0 ${TILE / 8}px ${theme.building}`,
            }}
          />
        ))}

        {/* Buildings */}
        {BUILDINGS.map((b) => {
          const isNear = nearBy === b.id;
          return (
            <Fragment key={b.id}>
              {/* Glow when near */}
              {isNear && (
                <div
                  style={{
                    position: "absolute",
                    left: b.x * TILE - 4,
                    top: b.y * TILE - 4,
                    width: b.w * TILE + 8,
                    height: b.h * TILE + 8,
                    border: `3px solid ${theme.accent}`,
                    boxShadow: `0 0 16px ${theme.accent}80`,
                    pointerEvents: "none",
                  }}
                />
              )}
              {/* Roof */}
              <div
                onClick={() => setActiveBuilding(b.id)}
                style={{
                  position: "absolute",
                  left: b.x * TILE,
                  top: b.y * TILE,
                  width: b.w * TILE,
                  height: TILE,
                  background: b.roofColor,
                  cursor: "pointer",
                  borderBottom: `2px solid rgba(0,0,0,0.3)`,
                }}
              />
              {/* Body */}
              <div
                onClick={() => setActiveBuilding(b.id)}
                style={{
                  position: "absolute",
                  left: b.x * TILE,
                  top: b.y * TILE + TILE,
                  width: b.w * TILE,
                  height: (b.h - 1) * TILE,
                  background: b.color,
                  cursor: "pointer",
                }}
              />
              {/* Door */}
              <div
                style={{
                  position: "absolute",
                  left: b.x * TILE + (b.w * TILE) / 2 - 6,
                  top: (b.y + b.h) * TILE - TILE / 2,
                  width: 12,
                  height: TILE / 2,
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
              {/* Window */}
              <div
                style={{
                  position: "absolute",
                  left: b.x * TILE + TILE / 2 - 4,
                  top: b.y * TILE + TILE + 6,
                  width: 8,
                  height: 8,
                  background: `${theme.accent}60`,
                  boxShadow: `0 0 4px ${theme.accent}80`,
                }}
              />
              {/* Label */}
              <div
                style={{
                  position: "absolute",
                  left: b.x * TILE,
                  top: b.y * TILE - 24,
                  width: b.w * TILE,
                  textAlign: "center",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  color: isNear ? theme.accent : theme.text,
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {b.emoji} {b.label}
              </div>
            </Fragment>
          );
        })}

        {/* Character */}
        <div
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            zIndex: 10,
          }}
        >
          <Character facing={facing} moving={moving} scale={3} />
        </div>
      </div>

      {/* HUD — name plate */}
      <div
        className="fixed top-4 left-4 px-4 py-2"
        style={{
          background: theme.panel,
          border: `2px solid ${theme.panelBorder}`,
          boxShadow: `0 0 12px ${theme.accent}30`,
        }}
      >
        <p className="font-pixel crt-glow" style={{ fontSize: 9, color: theme.accent }}>
          ROHINI RAJASIMMAN
        </p>
        <p className="font-mono text-xs opacity-50 mt-0.5" style={{ color: theme.text, fontSize: 9 }}>
          builder · reader · explorer
        </p>
      </div>

      {/* Hint: near building */}
      <AnimatePresence>
        {nearBy && !activeBuilding && (
          <div
            className="fixed left-1/2 -translate-x-1/2 px-4 py-2 font-pixel"
            style={{
              bottom: isTouchDevice ? 200 : 80,
              background: theme.panel,
              border: `2px solid ${theme.accent}`,
              fontSize: 9,
              color: theme.accent,
              boxShadow: `0 0 16px ${theme.accent}40`,
              whiteSpace: "nowrap",
              zIndex: 45,
            }}
          >
            {isTouchDevice ? "TAP" : "ENTER"} to enter{" "}
            {BUILDINGS.find((b) => b.id === nearBy)?.emoji}{" "}
            {BUILDINGS.find((b) => b.id === nearBy)?.label}
          </div>
        )}
      </AnimatePresence>

      {/* Controls hint (desktop only) */}
      {!isTouchDevice && (
        <div
          className="fixed bottom-4 right-4 font-mono opacity-40 text-right"
          style={{ fontSize: 10, color: theme.text }}
        >
          ↑↓←→ move &nbsp;·&nbsp; ENTER enter
        </div>
      )}

      {/* Mobile D-pad */}
      {isTouchDevice && (
        <div className="fixed z-50" style={{ bottom: 24, right: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            {/* Action button */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleDpadPress("Enter"); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadRelease("Enter"); }}
              onTouchCancel={(e) => { e.preventDefault(); handleDpadRelease("Enter"); }}
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: `${theme.accent}30`,
                border: `2px solid ${theme.accent}`,
                color: theme.accent,
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "none", userSelect: "none",
                marginBottom: 20,
              }}
            >A</button>
            {/* D-pad cross */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(3, 48px)", gap: 2 }}>
              {([
                [null,       "ArrowUp",    null       ],
                ["ArrowLeft", null,        "ArrowRight"],
                [null,       "ArrowDown",  null       ],
              ] as (string | null)[][]).map((row, ri) =>
                row.map((key, ci) => key ? (
                  <button
                    key={`${ri}-${ci}`}
                    onTouchStart={(e) => { e.preventDefault(); handleDpadPress(key); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleDpadRelease(key); }}
                    onTouchCancel={(e) => { e.preventDefault(); handleDpadRelease(key); }}
                    style={{
                      width: 48, height: 48,
                      background: `${theme.panel}`,
                      border: `2px solid ${theme.panelBorder}`,
                      color: theme.accent,
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      touchAction: "none", userSelect: "none",
                    }}
                  >
                    {key === "ArrowUp" ? "↑" : key === "ArrowDown" ? "↓" : key === "ArrowLeft" ? "←" : "→"}
                  </button>
                ) : (
                  <div key={`${ri}-${ci}`} style={{ width: 48, height: 48, background: `${theme.panel}60`, border: `1px solid ${theme.panelBorder}20` }} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Konami easter egg */}
      <AnimatePresence>
        {showKonami && (
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div
              className="font-pixel text-center p-8"
              style={{
                background: theme.panel,
                border: `4px solid ${theme.accent}`,
                fontSize: 12,
                color: theme.accent,
                boxShadow: `0 0 60px ${theme.accent}`,
              }}
            >
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
