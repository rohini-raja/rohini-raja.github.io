import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";
import Character from "./Character"; // spaceship
import StarField from "./StarField";
import Cockpit from "./Cockpit";
import Library from "./buildings/Library";
import Lab from "./buildings/Lab";
import Academy from "./buildings/Academy";
import Shrine from "./buildings/Shrine";
import Arcade from "./buildings/Arcade";
import Skygazing from "./buildings/Skygazing";
import Travel from "./buildings/Travel";
import Writing from "./buildings/Writing";
import Cinema from "./buildings/Cinema";

type BuildingId = "library" | "lab" | "academy" | "shrine" | "arcade" | "skygazing" | "travel" | "writing" | "cinema";
type Direction  = "up" | "down" | "left" | "right";

interface Building {
  id: BuildingId;
  label: string;
  emoji: string;
  x: number; y: number; w: number; h: number;
  color: string; roofColor: string;
  planetLabel: string;
}

const TILE  = 32;
const MAP_W = 30;
const MAP_H = 30;

const BUILDINGS: Building[] = [
  // Row 1
  { id:"library",   label:"LIBRARY",     emoji:"📚", x:3,  y:3,  w:4, h:4, color:"#5c3d1e", roofColor:"#8b2e2e", planetLabel:"LIBRARIA" },
  { id:"lab",       label:"LAB",         emoji:"🔬", x:11, y:3,  w:4, h:4, color:"#1a3a5c", roofColor:"#0a5a8a", planetLabel:"LABRON"   },
  { id:"academy",   label:"ACADEMY",     emoji:"🎓", x:19, y:3,  w:5, h:4, color:"#2d1a5c", roofColor:"#6a2a9a", planetLabel:"ACADEM"   },
  // Row 2
  { id:"shrine",    label:"SHRINE",      emoji:"⛩️", x:4,  y:13, w:4, h:4, color:"#5c1a1a", roofColor:"#c04040", planetLabel:"SHRINIA"  },
  { id:"arcade",    label:"ARCADE",      emoji:"🕹️", x:13, y:13, w:4, h:4, color:"#1a4a1a", roofColor:"#2a8a2a", planetLabel:"ARCADIA"  },
  { id:"skygazing", label:"OBSERVATORY", emoji:"🔭", x:21, y:13, w:4, h:4, color:"#0a1a3a", roofColor:"#1a3a6a", planetLabel:"CELESTIA" },
  // Row 3
  { id:"travel",    label:"ATLAS",       emoji:"🌏", x:3,  y:23, w:4, h:4, color:"#0a3a1a", roofColor:"#1a6a3a", planetLabel:"NOMADIA"  },
  { id:"writing",   label:"SCRIPTORIUM", emoji:"✍️", x:12, y:23, w:4, h:4, color:"#3a2a0a", roofColor:"#6a4a1a", planetLabel:"SCRIBOS"  },
  { id:"cinema",    label:"CINEMA",      emoji:"🎬", x:21, y:23, w:4, h:4, color:"#3a0a3a", roofColor:"#6a1a6a", planetLabel:"SCREENIX" },
];

// ─── NASA image queries per planet ──────────────────────────────────────────
const NASA_QUERIES: Record<BuildingId, string> = {
  library:   "hubble deep field galaxy",
  lab:       "earth from space blue marble",
  academy:   "jupiter planet juno",
  shrine:    "mars planet global view",
  arcade:    "saturn rings cassini",
  skygazing: "milky way stars nebula night sky",
  travel:    "earth continents africa europe from space",
  writing:   "cosmic dust pillar star formation nebula",
  cinema:    "aurora borealis northern lights from space",
};

const FALLBACK_ICONS: Record<BuildingId, string> = {
  library:   "🌌",
  lab:       "🌍",
  academy:   "🪐",
  shrine:    "🔴",
  arcade:    "💫",
  skygazing: "🔭",
  travel:    "🗺️",
  writing:   "✍️",
  cinema:    "🎬",
};

// ─── Planet configs — size, glow, and orbital params ─────────────────────────
interface PlanetCfg { r:number; atmoColor:string; orbitR:number; orbitRy:number; orbitPeriod:number; orbitPhase:number; spinPeriod:number }
const PLANET: Record<BuildingId, PlanetCfg> = {
  //                  r    atmo        orbitR  orbitRy  period  phase  spin(s)
  library:   { r:88,  atmoColor:"#c77dff", orbitR:38, orbitRy:14, orbitPeriod:13, orbitPhase:0.00, spinPeriod:28 },
  lab:       { r:84,  atmoColor:"#48cae4", orbitR:30, orbitRy:11, orbitPeriod:9,  orbitPhase:0.28, spinPeriod:22 },
  academy:   { r:108, atmoColor:"#f4a261", orbitR:48, orbitRy:17, orbitPeriod:17, orbitPhase:0.55, spinPeriod:18 },
  shrine:    { r:80,  atmoColor:"#e63946", orbitR:32, orbitRy:12, orbitPeriod:10, orbitPhase:0.40, spinPeriod:35 },
  arcade:    { r:86,  atmoColor:"#00f5ff", orbitR:34, orbitRy:13, orbitPeriod:11, orbitPhase:0.75, spinPeriod:20 },
  skygazing: { r:90,  atmoColor:"#90e0ef", orbitR:40, orbitRy:15, orbitPeriod:14, orbitPhase:0.15, spinPeriod:30 },
  travel:    { r:84,  atmoColor:"#52b788", orbitR:30, orbitRy:11, orbitPeriod:12, orbitPhase:0.65, spinPeriod:25 },
  writing:   { r:82,  atmoColor:"#ffd60a", orbitR:28, orbitRy:10, orbitPeriod:8,  orbitPhase:0.50, spinPeriod:32 },
  cinema:    { r:96,  atmoColor:"#ff6b9d", orbitR:44, orbitRy:16, orbitPeriod:15, orbitPhase:0.30, spinPeriod:24 },
};

// Smooth 36-step elliptical orbit keyframes (cos/sin so the path is a real ellipse)
const ORBIT_KEYFRAMES = Object.entries(PLANET).map(([id, p]) => {
  const steps = Array.from({ length: 37 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const x = (p.orbitR  * Math.cos(a)).toFixed(2);
    const y = (p.orbitRy * Math.sin(a)).toFixed(2);
    return `  ${((i / 36) * 100).toFixed(2)}% { transform: translate(${x}px,${y}px); }`;
  }).join("\n");
  return `@keyframes orbit-${id} {\n${steps}\n}`;
}).join("\n\n") + `\n\n@keyframes planet-spin {\n  from { transform: scale(1.15) rotate(0deg); }\n  to   { transform: scale(1.15) rotate(360deg); }\n}`;


// ─── Collision helpers ───────────────────────────────────────────────────────
const WATER_TILES = [
  { x:0,      y:0,      w:2,      h:MAP_H },
  { x:MAP_W-2,y:0,      w:2,      h:MAP_H },
  { x:0,      y:0,      w:MAP_W,  h:2     },
  { x:0,      y:MAP_H-2,w:MAP_W,  h:2     },
  { x:8,      y:8,      w:3,      h:3     },
  { x:8,      y:18,     w:3,      h:3     },
];

function isSolid(px: number, py: number): boolean {
  const col = Math.floor(px/TILE), row = Math.floor(py/TILE);
  for (const w of WATER_TILES)
    if (col>=w.x && col<w.x+w.w && row>=w.y && row<w.y+w.h) return true;
  for (const b of BUILDINGS) {
    const bx=b.x*TILE, by=b.y*TILE, bw=b.w*TILE, bh=b.h*TILE;
    if (px+8>=bx && px+8<bx+bw && py+8>=by && py+8<by+bh-8) return true;
  }
  if (px<TILE*2 || py<TILE*2 || px>(MAP_W-3)*TILE || py>(MAP_H-3)*TILE) return true;
  return false;
}

function nearBuilding(px: number, py: number): BuildingId | null {
  const cx=px+12, cy=py+20;
  for (const b of BUILDINGS) {
    const bx=b.x*TILE+(b.w*TILE)/2, by=(b.y+b.h)*TILE;
    if (Math.hypot(cx-bx, cy-by) < TILE*1.8) return b.id;
  }
  return null;
}

const BUILDING_COMPONENTS: Record<BuildingId, React.ComponentType<{ onClose: ()=>void }>> = {
  library:Library, lab:Lab, academy:Academy, shrine:Shrine, arcade:Arcade,
  skygazing:Skygazing, travel:Travel, writing:Writing, cinema:Cinema,
};

const PLANET_DESCRIPTIONS: Record<BuildingId, string> = {
  library:   "Books & Literature",
  lab:       "Research & Tech",
  academy:   "Education & Learning",
  shrine:    "Reflections",
  arcade:    "Games & Fun",
  skygazing: "Astronomy & Space",
  travel:    "Adventures & Places",
  writing:   "Stories & Writing",
  cinema:    "Films & Cinema",
};

// ─── Planet renderer — orbiting wrapper + NASA photo ─────────────────────────
function Planet({ b, isNear, onClick, imgSrc }: {
  b: Building; isNear: boolean; onClick: ()=>void; imgSrc?: string | null;
}) {
  const { r, atmoColor, orbitPeriod, orbitPhase, spinPeriod } = PLANET[b.id];
  const [hovered, setHovered] = useState(false);
  const cx = b.x*TILE + (b.w*TILE)/2;
  const cy = b.y*TILE + (b.h*TILE)/2;
  const lit = hovered || isNear;

  return (
    <Fragment>
      {/* Orbiting group */}
      <div style={{
        position:"absolute", left: cx, top: cy,
        animation: `orbit-${b.id} ${orbitPeriod}s linear infinite`,
        animationDelay: `-${(orbitPhase * orbitPeriod).toFixed(2)}s`,
        zIndex:2,
      }}>

        {/* Hover tooltip — visible even when far away */}
        <AnimatePresence>
          {hovered && !isNear && (
            <motion.div
              initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
              transition={{ duration:0.14 }}
              style={{
                position:"absolute", left:"50%", transform:"translateX(-50%)",
                top:-r-48, whiteSpace:"nowrap", pointerEvents:"none", zIndex:30,
                fontFamily:"monospace", fontSize:10, color:"#fff",
                background:"rgba(0,0,0,0.78)", backdropFilter:"blur(8px)",
                border:`1px solid ${atmoColor}55`, borderRadius:6, padding:"5px 13px",
                boxShadow:`0 0 14px ${atmoColor}30`,
              }}
            >
              {b.emoji} {b.planetLabel} &nbsp;·&nbsp;
              <span style={{ color:atmoColor }}>click to enter</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Planet clickable area */}
        <div
          onClick={e => { e.stopPropagation(); onClick(); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position:"absolute", left:-r, top:-r,
            width:r*2, height:r*2,
            borderRadius:"50%", overflow:"hidden",
            cursor:"pointer",
            filter: lit
              ? `drop-shadow(0 0 ${r*0.3}px ${atmoColor}) drop-shadow(0 0 ${r*0.6}px ${atmoColor}70)`
              : `drop-shadow(0 0 ${r*0.12}px ${atmoColor}50)`,
            transition:"filter 0.3s",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}>
          {imgSrc
            ? <img src={imgSrc} alt={b.planetLabel}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block",
                  animation:`planet-spin ${spinPeriod}s linear infinite` }} />
            : <div style={{
                width:"100%", height:"100%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:r*0.65, userSelect:"none",
                background:`radial-gradient(circle at 38% 35%, ${atmoColor}40, #020510)`,
                animation:`planet-spin ${spinPeriod}s linear infinite`,
              }}>{FALLBACK_ICONS[b.id]}</div>
          }
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle at 35% 30%, transparent 40%, rgba(0,0,0,0.52) 100%)" }} />
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle at 72% 68%, rgba(0,0,0,0.68) 18%, transparent 62%)" }} />
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle at 28% 28%, rgba(255,255,255,0.14) 0%, transparent 48%)" }} />
        </div>

        {/* Label */}
        <div style={{
          position:"absolute", left:-r*1.5, top:r+8,
          width:r*3, textAlign:"center",
          fontFamily:'"Share Tech Mono",monospace',
          fontSize:9, letterSpacing:"0.1em",
          color: lit ? "#fff" : "rgba(255,255,255,0.38)",
          textShadow: lit ? `0 0 18px ${atmoColor}, 0 0 6px ${atmoColor}` : "none",
          pointerEvents:"none", whiteSpace:"nowrap",
          transition:"color 0.3s, text-shadow 0.3s",
        }}>
          {b.emoji} {b.planetLabel}
        </div>
      </div>
    </Fragment>
  );
}

// ─── Star Map overlay ────────────────────────────────────────────────────────
function StarMap({ planetImgs, onWarp, onClose }: {
  planetImgs: Partial<Record<BuildingId, string>>;
  onWarp: (id: BuildingId) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.25 }}
      style={{
        position:"fixed", inset:0, zIndex:80,
        background:"rgba(0,1,10,0.93)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"32px 20px", overflow:"auto",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ delay:0.08, duration:0.35 }}
        onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:860 }}
      >
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:"monospace", fontSize:9, color:"#00e5ff55", letterSpacing:"0.35em", marginBottom:10 }}>
            ◈ GALACTIC NAVIGATION SYSTEM
          </div>
          <div style={{ fontFamily:"monospace", fontSize:24, color:"#fff", letterSpacing:"0.12em", fontWeight:300 }}>
            SELECT DESTINATION
          </div>
          <div style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.28)", marginTop:8, letterSpacing:"0.1em" }}>
            CLICK ANY PLANET TO WARP THERE INSTANTLY
          </div>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {BUILDINGS.map((b, i) => {
            const { atmoColor } = PLANET[b.id];
            const img = planetImgs[b.id];
            return (
              <motion.div
                key={b.id}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.12 + i*0.04, duration:0.28 }}
                whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }}
                onClick={() => onWarp(b.id)}
                style={{
                  cursor:"pointer",
                  background:`linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.25) 100%)`,
                  border:`1px solid ${atmoColor}25`, borderRadius:14,
                  padding:"18px 14px 14px",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                  transition:"border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${atmoColor}65`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${atmoColor}22, inset 0 0 20px ${atmoColor}08`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${atmoColor}25`;
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{
                  width:70, height:70, borderRadius:"50%", overflow:"hidden", flexShrink:0,
                  boxShadow:`0 0 26px ${atmoColor}55, 0 0 8px ${atmoColor}80`, position:"relative",
                }}>
                  {img
                    ? <img src={img} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={b.planetLabel} />
                    : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:30,
                        background:`radial-gradient(circle at 35% 30%, ${atmoColor}50, #020510)` }}>
                        {FALLBACK_ICONS[b.id]}
                      </div>
                  }
                  <div style={{ position:"absolute", inset:0, borderRadius:"50%", pointerEvents:"none",
                    background:"radial-gradient(circle at 35% 30%, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
                  <div style={{ position:"absolute", inset:0, borderRadius:"50%", pointerEvents:"none",
                    background:"radial-gradient(circle at 72% 68%, rgba(0,0,0,0.6) 18%, transparent 60%)" }} />
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"monospace", fontSize:12, color:"#fff", letterSpacing:"0.1em", marginBottom:4 }}>
                    {b.emoji} {b.planetLabel}
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:8, color:`${atmoColor}bb`, letterSpacing:"0.06em" }}>
                    {PLANET_DESCRIPTIONS[b.id]}
                  </div>
                </div>
                <div style={{ fontFamily:"monospace", fontSize:8, color:`${atmoColor}70`, letterSpacing:"0.2em" }}>
                  ▶ WARP
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ textAlign:"center", marginTop:22, fontFamily:"monospace", fontSize:9,
          color:"rgba(255,255,255,0.18)", letterSpacing:"0.12em" }}>
          [M] CLOSE &nbsp;·&nbsp; ESC DISMISS &nbsp;·&nbsp; CLICK OUTSIDE TO EXIT
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Overworld() {
  const { theme } = useTheme();
  const [pos, setPos]             = useState({ x:13*TILE, y:9*TILE });
  const [facing, setFacing]       = useState<Direction>("down");
  const [moving, setMoving]       = useState(false);
  const [activeBuilding, setActiveBuilding] = useState<BuildingId | null>(null);
  const [nearBy, setNearBy]       = useState<BuildingId | null>(null);
  const [cockpitOpen, setCockpitOpen] = useState(false);
  const [warpColor, setWarpColor] = useState<string | null>(null);
  const [starMapOpen, setStarMapOpen] = useState(false);
  const velRef    = useRef({ vx:0, vy:0 });
  const targetRef = useRef<{x:number; y:number} | null>(null);

  const enterPlanet = useCallback((id: BuildingId) => {
    setStarMapOpen(false);
    const color = PLANET[id].atmoColor;
    setWarpColor(color);
    setTimeout(() => setActiveBuilding(id), 260);
    setTimeout(() => setWarpColor(null), 950);
  }, []);

  // NASA data
  const [epicUrl, setEpicUrl]       = useState<string | null>(null);
  const [epicDate, setEpicDate]     = useState<string | null>(null);
  const [planetImgs, setPlanetImgs] = useState<Partial<Record<BuildingId,string>>>({});

  const keysRef      = useRef<Set<string>>(new Set());
  const animRef      = useRef<number>(0);
  const lastRef      = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const camRef       = useRef({ x: 0, y: 0 });

  const konamiRef = useRef<string[]>([]);
  const KONAMI    = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const [showKonami, setShowKonami] = useState(false);
  const [isTouchDevice] = useState(() =>
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  const SPEED = 90;

  // ── Fetch all NASA data on mount ──────────────────────────────────────────
  useEffect(() => {
    // 1. EPIC – real-time Earth
    fetch("https://epic.gsfc.nasa.gov/api/natural")
      .then(r => r.json())
      .then((data: Array<{ image:string; date:string }>) => {
        if (!data?.length) return;
        const latest = data[0];
        const d  = new Date(latest.date.replace(" ","T") + "Z");
        const yr = d.getUTCFullYear();
        const mo = String(d.getUTCMonth()+1).padStart(2,"0");
        const dy = String(d.getUTCDate()).padStart(2,"0");
        setEpicUrl(`https://epic.gsfc.nasa.gov/archive/natural/${yr}/${mo}/${dy}/png/${latest.image}.png`);
        setEpicDate(latest.date.slice(0,10));
      })
      .catch(() => {});

    // 3. NASA Image Library – one real photo per planet
    (Object.entries(NASA_QUERIES) as [BuildingId, string][]).forEach(([id, query]) => {
      // Lab planet uses EPIC Earth directly – skip Image Library for it
      if (id === "lab") return;
      fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=5`)
        .then(r => r.json())
        .then((data: { collection:{ items:Array<{ links?:Array<{ href:string }> }> } }) => {
          const items = data.collection?.items;
          if (!items?.length) return;
          // Try to get a larger image by upgrading the thumb URL
          const thumb = items[0]?.links?.[0]?.href;
          if (!thumb) return;
          const large = thumb.replace("~thumb.jpg","~large.jpg").replace("~thumb.png","~large.png");
          setPlanetImgs(prev => ({ ...prev, [id]: large }));
        })
        .catch(() => {});
    });
  }, []);

  // Wire EPIC Earth into lab planet once loaded
  useEffect(() => {
    if (epicUrl) setPlanetImgs(prev => ({ ...prev, lab: epicUrl }));
  }, [epicUrl]);

  // ── Game loop — velocity + friction for smooth gliding movement ──────────
  const ACCEL   = 520;
  const FRICTION = 0.82;
  const MAX_SPD  = 160;

  const gameLoop = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now;
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const keys = keysRef.current;
    let ix = 0, iy = 0;
    const hasKeys = keys.has("ArrowLeft")||keys.has("a")||keys.has("A")||
      keys.has("ArrowRight")||keys.has("d")||keys.has("D")||
      keys.has("ArrowUp")||keys.has("w")||keys.has("W")||
      keys.has("ArrowDown")||keys.has("s")||keys.has("S");

    if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) { ix -= 1; setFacing("left");  }
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) { ix += 1; setFacing("right"); }
    if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) { iy -= 1; setFacing("up");    }
    if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) { iy += 1; setFacing("down");  }
    if (hasKeys) targetRef.current = null;

    // Click-to-navigate: steer toward clicked target when no keys held
    if (!hasKeys && targetRef.current) {
      const dx = targetRef.current.x - pos.x;
      const dy = targetRef.current.y - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 20) { targetRef.current = null; }
      else {
        ix = dx / dist; iy = dy / dist;
        setFacing(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      }
    }

    const len = Math.hypot(ix, iy);
    if (len > 0) { ix /= len; iy /= len; }

    const vel = velRef.current;
    vel.vx = (vel.vx + ix * ACCEL * dt) * FRICTION;
    vel.vy = (vel.vy + iy * ACCEL * dt) * FRICTION;
    // Cap speed
    const spd = Math.hypot(vel.vx, vel.vy);
    if (spd > MAX_SPD) { vel.vx = vel.vx/spd*MAX_SPD; vel.vy = vel.vy/spd*MAX_SPD; }

    const isMoving = spd > 2;
    setMoving(isMoving);

    if (spd > 0.5) {
      setPos(prev => {
        const nx = prev.x + vel.vx * dt;
        const ny = prev.y + vel.vy * dt;
        const newX = isSolid(nx, prev.y) ? (vel.vx = 0, prev.x) : nx;
        const newY = isSolid(prev.x, ny) ? (vel.vy = 0, prev.y) : ny;
        setNearBy(nearBuilding(newX, newY));
        return { x:newX, y:newY };
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
        if (nb) enterPlanet(nb);
      }
      if (e.key === "Escape") { setActiveBuilding(null); setCockpitOpen(false); setStarMapOpen(false); }
      if (e.key === "e" || e.key === "E") setCockpitOpen(o => !o);
      if (e.key === "m" || e.key === "M") setStarMapOpen(o => !o);
      konamiRef.current.push(e.key);
      konamiRef.current = konamiRef.current.slice(-10);
      if (konamiRef.current.join(",") === KONAMI.join(",")) {
        setShowKonami(true);
        setTimeout(() => setShowKonami(false), 3000);
      }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup",   onUp);
    return () => { window.removeEventListener("keydown",onKey); window.removeEventListener("keyup",onUp); };
  }, [pos.x, pos.y]);

  const handleDpadPress   = useCallback((key: string) => {
    keysRef.current.add(key);
    if (key === "Enter") {
      const nb = nearBuilding(pos.x, pos.y);
      if (nb) setActiveBuilding(nb);
    }
  }, [pos.x, pos.y]);
  const handleDpadRelease = useCallback((key: string) => { keysRef.current.delete(key); }, []);

  useEffect(() => {
    (window as any).sudo = (cmd: string) => {
      if (cmd === "hire rohini") {
        console.log("%c✓ sudo hire rohini","color:#6ee86e;font-size:16px;font-weight:bold");
        return "Let's build something great. 🚀";
      }
    };
  }, []);

  const camX = Math.max(0, Math.min(pos.x - window.innerWidth/2,  MAP_W*TILE - window.innerWidth));
  const camY = Math.max(0, Math.min(pos.y - window.innerHeight/2, MAP_H*TILE - window.innerHeight));
  camRef.current = { x: camX, y: camY };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ background:"transparent", cursor:"default", touchAction:"none" }}
      tabIndex={0}
    >
      {/* ── Planet orbit keyframes (one per planet, generated at module level) ── */}
      <style>{ORBIT_KEYFRAMES}</style>

      {/* ── Animated starfield background ── */}
      <StarField camRef={camRef} />


      {/* ── Map ── */}
      <div
        style={{
          width:MAP_W*TILE, height:MAP_H*TILE,
          position:"relative",
          transform:`translate(${-camX}px,${-camY}px)`,
          willChange:"transform", zIndex:3,
          cursor:"crosshair",
        }}
        onClick={e => {
          const worldX = e.clientX + camRef.current.x;
          const worldY = e.clientY + camRef.current.y;
          if (!isSolid(worldX - 12, worldY - 12))
            targetRef.current = { x: worldX - 12, y: worldY - 12 };
        }}
      >
        {/* Ground — transparent so NASA galaxy shows through */}
        <div style={{ position:"absolute", inset:0, background:"transparent" }} />

        {/* Asteroids (trees) */}
        {[
          [9,5],[10,6],[9,10],[15,6],[16,10],[22,6],[23,7],
          [2,11],[11,11],[19,11],[27,11],
          [2,19],[11,19],[19,19],[27,19],
          [7,25],[16,25],[25,25],
        ].map(([tx,ty], i) => (
          <div key={i} style={{
            position:"absolute", left:tx!*TILE+2, top:ty!*TILE+4,
            width:TILE-4, height:TILE-6,
            background:`hsl(${(i*41+200)%360},15%,28%)`,
            borderRadius: i%3===0 ? "42% 58% 60% 40%/55% 45% 55% 45%"
                        : i%2===0 ? "60% 40% 45% 55%/50% 60% 40% 50%"
                        : "50%",
            opacity:0.75, boxShadow:"inset -3px -2px 6px rgba(0,0,0,0.5)",
          }} />
        ))}

        {/* Planets (real NASA images) */}
        {BUILDINGS.map(b => (
          <Planet
            key={b.id}
            b={b}
            isNear={nearBy === b.id}
            onClick={() => enterPlanet(b.id)}
            imgSrc={planetImgs[b.id]}
          />
        ))}

        {/* Character */}
        <div style={{ position:"absolute", left:pos.x, top:pos.y, zIndex:10 }}>
          <Character facing={facing} moving={moving} scale={3} />
        </div>
      </div>

      {/* ── HUD ── */}
      <div className="fixed top-5 left-5" style={{
        background:"rgba(4,8,20,0.88)",
        backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        border:"1px solid rgba(255,255,255,0.14)",
        borderRadius:14, padding:"12px 20px",
        zIndex:40, maxWidth:260,
      }}>
        <p style={{ fontSize:13, fontWeight:700, letterSpacing:"0.07em", color:"#fff", margin:0 }}>ROHINI RAJASIMMAN</p>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.45)", margin:"3px 0 8px", letterSpacing:"0.05em" }}>builder · reader · explorer</p>
        <div style={{ width:"100%", height:1, background:"rgba(255,255,255,0.08)", marginBottom:8 }} />
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.65, letterSpacing:"0.02em" }}>
          Software engineer passionate about building products that sit at the intersection of technology and human experience.
          Loves space, stories, and shipping things that matter.
        </p>
        <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
          {["Software Eng","Space Nerd","Avid Reader","Cinephile"].map(tag => (
            <span key={tag} style={{
              fontSize:8, padding:"2px 7px", borderRadius:20,
              border:"1px solid rgba(255,255,255,0.15)",
              color:"rgba(255,255,255,0.5)", letterSpacing:"0.04em",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Near-planet hint */}
      <AnimatePresence>
        {nearBy && !activeBuilding && (() => {
          const bld = BUILDINGS.find(b => b.id === nearBy)!;
          const { atmoColor } = PLANET[nearBy];
          return (
            <motion.div
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
              className="fixed left-1/2 -translate-x-1/2"
              style={{
                bottom: isTouchDevice ? 210 : 32,
                background:"rgba(0,0,0,0.65)",
                backdropFilter:"blur(10px)",
                WebkitBackdropFilter:"blur(10px)",
                border:`1px solid ${atmoColor}60`,
                borderRadius:8, padding:"8px 18px",
                fontSize:12, color:"#fff",
                boxShadow:`0 0 20px ${atmoColor}30`,
                whiteSpace:"nowrap", zIndex:45,
                letterSpacing:"0.04em",
              }}>
              {bld.emoji} {bld.planetLabel} &nbsp;·&nbsp;
              <span style={{ color:atmoColor }}>{isTouchDevice ? "tap A" : "press Enter"}</span>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Desktop hint */}
      {!isTouchDevice && (
        <div className="fixed bottom-5 right-5" style={{ fontSize:10, color:"rgba(255,255,255,0.22)", zIndex:40, letterSpacing:"0.05em", lineHeight:1.8, textAlign:"right" }}>
          ↑↓←→ / WASD move &nbsp;·&nbsp; click anywhere &nbsp;·&nbsp; hover planets<br/>
          Enter explore &nbsp;·&nbsp; [M] star map &nbsp;·&nbsp; [E] cockpit
        </div>
      )}

      {/* Mobile D-pad */}
      {isTouchDevice && (
        <div className="fixed z-50 select-none" style={{ bottom:24, right:16 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:14 }}>
            {/* A button */}
            <button
              onPointerDown={e=>{ e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); handleDpadPress("Enter"); }}
              onPointerUp={e=>{ e.preventDefault(); handleDpadRelease("Enter"); }}
              onPointerCancel={e=>{ e.preventDefault(); handleDpadRelease("Enter"); }}
              style={{
                width:54, height:54, borderRadius:"50%",
                background:"rgba(255,255,255,0.12)",
                backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                border:"1px solid rgba(255,255,255,0.25)",
                color:"#fff", fontSize:13, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center",
                touchAction:"none", userSelect:"none", marginBottom:26, cursor:"pointer",
              }}
            >A</button>
            {/* D-pad */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,48px)", gridTemplateRows:"repeat(3,48px)", gap:4 }}>
              {([
                [null,"ArrowUp",null],
                ["ArrowLeft",null,"ArrowRight"],
                [null,"ArrowDown",null],
              ] as (string|null)[][]).map((row,ri) =>
                row.map((key,ci) => key ? (
                  <button
                    key={`${ri}-${ci}`}
                    onPointerDown={e=>{ e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); handleDpadPress(key); }}
                    onPointerUp={e=>{ e.preventDefault(); handleDpadRelease(key); }}
                    onPointerCancel={e=>{ e.preventDefault(); handleDpadRelease(key); }}
                    style={{
                      width:48, height:48, borderRadius:8,
                      background:"rgba(255,255,255,0.1)",
                      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                      border:"1px solid rgba(255,255,255,0.2)",
                      color:"#fff", fontSize:18,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      touchAction:"none", userSelect:"none", cursor:"pointer",
                    }}
                  >{key==="ArrowUp"?"↑":key==="ArrowDown"?"↓":key==="ArrowLeft"?"←":"→"}</button>
                ) : (
                  <div key={`${ri}-${ci}`} style={{ width:48, height:48 }} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NASA attribution */}
      {epicDate && (
        <div style={{
          position:"fixed",bottom:8,left:8,
          fontFamily:"monospace",fontSize:8,opacity:0.4,
          color:"#aef",zIndex:50,pointerEvents:"none",lineHeight:1.7,
        }}>
          <div>Earth: NASA EPIC {epicDate}</div>
        </div>
      )}

      {/* Konami */}
      <AnimatePresence>
        {showKonami && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="font-pixel text-center p-8" style={{
              background:theme.panel,border:`4px solid ${theme.accent}`,
              fontSize:12,color:theme.accent,boxShadow:`0 0 60px ${theme.accent}`,
            }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🌟</div>
              CHEAT CODE ACTIVATED
              <div className="font-mono text-xs mt-2 opacity-60" style={{ color:theme.text }}>+99 lives. You found it!</div>
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

      {/* Bottom-right buttons (desktop only) */}
      {!isTouchDevice && <div style={{ position:"fixed", bottom:24, right:24, zIndex:40, display:"flex", gap:8 }}>
        <motion.button
          onClick={() => setStarMapOpen(o => !o)}
          whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
          style={{
            background:"rgba(180,100,255,0.12)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(180,100,255,0.4)",
            color:"#b87fff", fontFamily:"monospace",
            fontSize:10, letterSpacing:"0.12em",
            padding:"9px 18px", cursor:"pointer", borderRadius:4,
          }}
        >
          ⊹ STAR MAP  [M]
        </motion.button>
        <motion.button
          onClick={() => setCockpitOpen(true)}
          whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
          style={{
            background:"rgba(0,229,255,0.12)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(0,229,255,0.4)",
            color:"#00e5ff", fontFamily:"monospace",
            fontSize:10, letterSpacing:"0.12em",
            padding:"9px 18px", cursor:"pointer", borderRadius:4,
          }}
        >
          ◈ COCKPIT  [E]
        </motion.button>
      </div>}

      {/* Mobile star map button */}
      {isTouchDevice && (
        <motion.button
          onClick={() => setStarMapOpen(o => !o)}
          whileTap={{ scale:0.95 }}
          style={{
            position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
            background:"rgba(180,100,255,0.18)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(180,100,255,0.5)",
            color:"#b87fff", fontFamily:"monospace",
            fontSize:11, letterSpacing:"0.1em",
            padding:"10px 22px", cursor:"pointer", borderRadius:20, zIndex:49,
          }}
        >
          ⊹ STAR MAP
        </motion.button>
      )}

      {/* Warp entry flash */}
      <AnimatePresence>
        {warpColor && (
          <>
            <motion.div
              key="warp-streak"
              initial={{ opacity:0, scale:0.8 }}
              animate={{ opacity:[0, 0.5, 0], scale:[0.8, 1.8, 2.4] }}
              transition={{ duration:0.75, times:[0, 0.3, 1] }}
              style={{
                position:"fixed", inset:"-40%", zIndex:87, pointerEvents:"none",
                background:`repeating-conic-gradient(from 0deg, ${warpColor}18 0deg 4deg, transparent 4deg 20deg)`,
                borderRadius:"50%",
              }}
            />
            <motion.div
              key="warp-flash"
              initial={{ opacity:0 }}
              animate={{ opacity:[0, 1, 0.85, 0] }}
              transition={{ duration:0.85, times:[0, 0.14, 0.55, 1] }}
              style={{
                position:"fixed", inset:0, zIndex:88, pointerEvents:"none",
                background:`radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.97) 0%, ${warpColor}ee 28%, ${warpColor}99 58%, transparent 100%)`,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Cockpit overlay */}
      <AnimatePresence>
        {cockpitOpen && <Cockpit key="cockpit" onClose={() => setCockpitOpen(false)} />}
      </AnimatePresence>

      {/* Star Map overlay */}
      <AnimatePresence>
        {starMapOpen && (
          <StarMap
            key="starmap"
            planetImgs={planetImgs}
            onWarp={enterPlanet}
            onClose={() => setStarMapOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
