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
import Instagram from "./buildings/Instagram";
import LinkedIn from "./buildings/LinkedIn";

type BuildingId = "library" | "lab" | "academy" | "shrine" | "arcade" | "skygazing" | "travel" | "writing" | "cinema" | "instagram" | "linkedin";
type Direction  = "up" | "down" | "left" | "right";

interface Building {
  id: BuildingId;
  label: string;
  emoji: string;
  planetLabel: string;
}

const TILE  = 32;
const MAP_W = 50;
const MAP_H = 50;
const SUN_CX = (MAP_W * TILE) / 2;
const SUN_CY = (MAP_H * TILE) / 2;

const BUILDINGS: Building[] = [
  { id:"academy",   label:"ACADEMY",     emoji:"🎓", planetLabel:"ACADEM"   },
  { id:"library",   label:"LIBRARY",     emoji:"📚", planetLabel:"LIBRARIA" },
  { id:"arcade",    label:"ARCADE",      emoji:"🕹️", planetLabel:"ARCADIA"  },
  { id:"shrine",    label:"SHRINE",      emoji:"⛩️", planetLabel:"SHRINIA"  },
  { id:"lab",       label:"LAB",         emoji:"🔬", planetLabel:"LABRON"   },
  { id:"cinema",    label:"CINEMA",      emoji:"🎬", planetLabel:"SCREENIX" },
  { id:"skygazing", label:"OBSERVATORY", emoji:"🔭", planetLabel:"CELESTIA" },
  { id:"travel",    label:"ATLAS",       emoji:"🌏", planetLabel:"NOMADIA"  },
  { id:"writing",   label:"SCRIPTORIUM", emoji:"✍️", planetLabel:"SCRIBOS"  },
  { id:"instagram", label:"INSTAGRAM",   emoji:"📸", planetLabel:"CURIOSIA" },
  { id:"linkedin",  label:"LINKEDIN",    emoji:"💼", planetLabel:"NEXORIA"  },
];

// Hardcoded stable image URLs — bypasses NASA API for specific planets
const PLANET_IMG_HARDCODED: Partial<Record<BuildingId, string>> = {
  instagram: "https://images-assets.nasa.gov/image/PIA06193/PIA06193~large.jpg",
  linkedin:  "https://images-assets.nasa.gov/image/PIA22946/PIA22946~large.jpg",
};

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
  instagram: "saturn planet rings cassini",
  linkedin:  "blue planet ocean earth from space",
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
  instagram: "📸",
  linkedin:  "💼",
};

// ─── Planet configs — solar-system layout (orbit around central sun) ─────────
interface PlanetCfg { r:number; atmoColor:string; orbitalR:number; orbitPeriod:number; startAngle:number; spinPeriod:number }
const ORBIT_FLATTEN = 0.92; // slight ellipse for tilted-disc look
const PLANET: Record<BuildingId, PlanetCfg> = {
  //                  r    atmo                orbitalR  period(s)  start(0-1)  spin(s)
  academy:   { r:48, atmoColor:"#f4a261", orbitalR:170, orbitPeriod:32,  startAngle:0.00, spinPeriod:18 },
  library:   { r:38, atmoColor:"#c77dff", orbitalR:240, orbitPeriod:46,  startAngle:0.18, spinPeriod:28 },
  arcade:    { r:34, atmoColor:"#00f5ff", orbitalR:310, orbitPeriod:62,  startAngle:0.42, spinPeriod:20 },
  shrine:    { r:30, atmoColor:"#e63946", orbitalR:380, orbitPeriod:80,  startAngle:0.66, spinPeriod:35 },
  lab:       { r:38, atmoColor:"#48cae4", orbitalR:450, orbitPeriod:100, startAngle:0.92, spinPeriod:22 },
  cinema:    { r:34, atmoColor:"#ff6b9d", orbitalR:520, orbitPeriod:122, startAngle:0.30, spinPeriod:24 },
  skygazing: { r:36, atmoColor:"#90e0ef", orbitalR:590, orbitPeriod:148, startAngle:0.55, spinPeriod:30 },
  travel:    { r:32, atmoColor:"#52b788", orbitalR:660, orbitPeriod:178, startAngle:0.78, spinPeriod:25 },
  writing:   { r:30, atmoColor:"#ffd60a", orbitalR:730, orbitPeriod:210, startAngle:0.10, spinPeriod:32 },
  instagram: { r:32, atmoColor:"#d4a843", orbitalR:810, orbitPeriod:245, startAngle:0.38, spinPeriod:20 },
  linkedin:  { r:30, atmoColor:"#378fe9", orbitalR:890, orbitPeriod:285, startAngle:0.62, spinPeriod:26 },
};

// 72-step elliptical orbit keyframes around the central sun
const ORBIT_KEYFRAMES = Object.entries(PLANET).map(([id, p]) => {
  const steps = Array.from({ length: 73 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const x = (p.orbitalR * Math.cos(a)).toFixed(2);
    const y = (p.orbitalR * Math.sin(a) * ORBIT_FLATTEN).toFixed(2);
    return `  ${((i / 72) * 100).toFixed(3)}% { transform: translate(${x}px,${y}px); }`;
  }).join("\n");
  return `@keyframes orbit-${id} {\n${steps}\n}`;
}).join("\n\n")
  + `\n\n@keyframes planet-spin {\n  from { transform: scale(1.15) rotate(0deg); }\n  to   { transform: scale(1.15) rotate(360deg); }\n}`
  + (() => {
    const MOON_R = 65, MOON_FLAT = 0.88;
    const steps = Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      const x = (MOON_R * Math.cos(a)).toFixed(2);
      const y = (MOON_R * Math.sin(a) * MOON_FLAT).toFixed(2);
      return `  ${((i / 72) * 100).toFixed(3)}% { transform: translate(${x}px,${y}px); }`;
    }).join("\n");
    return `\n\n@keyframes orbit-moon {\n${steps}\n}`;
  })();


// ─── Collision: just keep the ship inside the map ────────────────────────────
function isSolid(px: number, py: number): boolean {
  const m = TILE * 2;
  return px < m || py < m || px > MAP_W*TILE - m || py > MAP_H*TILE - m;
}

// Returns the planet whose current orbital position is closest to the player
// (within range). Uses time-based math that mirrors the CSS keyframe.
function nearBuilding(px: number, py: number): BuildingId | null {
  const cx = px + 12, cy = py + 20;
  const now = Date.now() / 1000;
  for (const b of BUILDINGS) {
    const p = PLANET[b.id];
    const a = ((now / p.orbitPeriod + p.startAngle) % 1) * Math.PI * 2;
    const planetX = SUN_CX + p.orbitalR * Math.cos(a);
    const planetY = SUN_CY + p.orbitalR * Math.sin(a) * ORBIT_FLATTEN;
    if (Math.hypot(cx - planetX, cy - planetY) < p.r + 28) return b.id;
  }
  return null;
}

const BUILDING_COMPONENTS: Record<BuildingId, React.ComponentType<{ onClose: ()=>void }>> = {
  library:Library, lab:Lab, academy:Academy, shrine:Shrine, arcade:Arcade,
  skygazing:Skygazing, travel:Travel, writing:Writing, cinema:Cinema, instagram:Instagram, linkedin:LinkedIn,
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
  instagram: "@curiously.roo",
  linkedin:  "in/rohini-raja",
};

// ─── Planet renderer — orbiting wrapper + NASA photo ─────────────────────────
function Planet({ b, isNear, onClick, imgSrc }: {
  b: Building; isNear: boolean; onClick: ()=>void; imgSrc?: string | null;
}) {
  const { r, atmoColor, orbitPeriod, startAngle, spinPeriod } = PLANET[b.id];
  const [hovered, setHovered] = useState(false);
  const lit = hovered || isNear;

  return (
    <Fragment>
      {/* Orbiting group (anchored at the sun) */}
      <div style={{
        position:"absolute", left: SUN_CX, top: SUN_CY,
        animation: `orbit-${b.id} ${orbitPeriod}s linear infinite`,
        animationDelay: `-${(startAngle * orbitPeriod).toFixed(2)}s`,
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

        {/* Saturn back ring — renders behind planet disk */}
        {b.id === "instagram" && (
          <div style={{
            position:"absolute",
            left:-(r*2.3), top:-(r*0.28),
            width:r*4.6, height:r*0.72,
            borderRadius:"50%",
            border:`${Math.max(4,r*0.16)}px solid`,
            borderColor:"rgba(210,175,100,0.45) rgba(190,155,80,0.35) rgba(170,135,60,0.28) rgba(190,155,80,0.35)",
            background:"transparent",
            clipPath:"inset(0 0 50% 0)",
            pointerEvents:"none", zIndex:1,
          }} />
        )}

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
            zIndex: b.id === "instagram" ? 2 : undefined,
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

        {/* Saturn front ring — renders in front of planet disk */}
        {b.id === "instagram" && (
          <div style={{
            position:"absolute",
            left:-(r*2.3), top:-(r*0.28),
            width:r*4.6, height:r*0.72,
            borderRadius:"50%",
            border:`${Math.max(4,r*0.16)}px solid`,
            borderColor:"rgba(225,190,110,0.7) rgba(205,170,90,0.6) rgba(185,150,70,0.5) rgba(205,170,90,0.6)",
            background:"transparent",
            clipPath:"inset(50% 0 0 0)",
            pointerEvents:"none", zIndex:3,
          }} />
        )}

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

        {/* Moon — only for Earth (lab) */}
        {b.id === "lab" && (
          <div style={{
            position:"absolute", left:0, top:0,
            animation:"orbit-moon 10s linear infinite",
            pointerEvents:"none", zIndex:6,
          }}>
            <div style={{
              position:"absolute", left:-10, top:-10,
              width:20, height:20, borderRadius:"50%",
              background:`radial-gradient(circle at 38% 32%,
                #f0f0ec 0%, #d0cfc8 30%, #a8a89e 60%, #6a6a62 85%, #3a3a34 100%)`,
              boxShadow:`
                inset -3px -2px 6px rgba(0,0,0,0.55),
                inset 2px 2px 4px rgba(255,255,255,0.12),
                0 0 8px rgba(220,220,200,0.18)`,
            }} />
          </div>
        )}
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
  const [pos, setPos]             = useState({ x: SUN_CX + 290, y: SUN_CY - 60 });
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
  const [showControls, setShowControls] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowControls(false), 6000);
    return () => clearTimeout(t);
  }, []);

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
      // Use hardcoded image if available — skip API call
      if (PLANET_IMG_HARDCODED[id]) {
        setPlanetImgs(prev => ({ ...prev, [id]: PLANET_IMG_HARDCODED[id]! }));
        return;
      }
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
        {/* Ground — transparent so the galaxy shows through */}
        <div style={{ position:"absolute", inset:0, background:"transparent" }} />


        {/* Distant asteroids (decorative — scattered, not obstacles) */}
        {Array.from({ length: 28 }).map((_, i) => {
          const seed = i * 137.5;
          const angle = seed * (Math.PI / 180);
          const dist = 80 + ((i * 73) % 720);
          const ax = SUN_CX + Math.cos(angle) * dist + ((i * 31) % 60 - 30);
          const ay = SUN_CY + Math.sin(angle) * dist * 0.92 + ((i * 47) % 40 - 20);
          const sz = 3 + (i % 4);
          return (
            <div key={i} style={{
              position:"absolute", left:ax, top:ay,
              width:sz, height:sz, borderRadius:"50%",
              background:`hsl(${(i*23+200)%360},12%,${30+(i%3)*8}%)`,
              opacity: 0.5,
              boxShadow:"inset -1px -1px 2px rgba(0,0,0,0.6)",
            }} />
          );
        })}

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
        borderRadius:14, padding:"10px 18px",
        zIndex:40,
      }}>
        <p style={{ fontSize:13, fontWeight:700, letterSpacing:"0.07em", color:"#fff", margin:0 }}>ROHINI RAJASIMMAN</p>
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

      {/* Onboarding controls panel — auto-dismisses after 6s */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:10 }}
            transition={{ duration:0.4 }}
            onClick={() => setShowControls(false)}
            style={{
              position:"fixed", top:"50%", left:"50%", transform:"translate(-50%, -50%)",
              zIndex:50, cursor:"pointer",
              background:"rgba(4,8,24,0.82)",
              backdropFilter:"blur(14px)",
              WebkitBackdropFilter:"blur(14px)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:12, padding:"14px 22px",
              textAlign:"center",
            }}
          >
            <p style={{ fontFamily:"monospace", fontSize:13, color:"rgba(255,255,255,0.95)", margin:"0 0 10px", letterSpacing:"0.04em", fontWeight:600 }}>
              Welcome to my space!
            </p>
            <p style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.6)", margin:"0 0 12px", lineHeight:1.8, maxWidth:320 }}>
              I have a lot of interests and hobbies, quite a lot actually!<br/>
              My universe is a little bit chaotic — I struggle to fit in everything,<br/>
              which seems impossible, but I'm trying!
            </p>
            <div style={{ width:"100%", height:1, background:"rgba(255,255,255,0.08)", margin:"0 0 10px" }} />
            <p style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 4px", lineHeight:1.7 }}>
              🚀 &nbsp;you are the spaceship
            </p>
            {isTouchDevice
              ? <p style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.35)", margin:0, lineHeight:1.7 }}>
                  D-pad to fly &nbsp;·&nbsp; tap <b style={{color:"rgba(255,255,255,0.6)"}}>A</b> near a planet to enter &nbsp;·&nbsp; <b style={{color:"rgba(255,255,255,0.6)"}}>STAR MAP</b> to jump
                </p>
              : <p style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.35)", margin:0, lineHeight:1.7 }}>
                  Arrow keys / WASD to fly &nbsp;·&nbsp; click anywhere to auto-pilot &nbsp;·&nbsp; <b style={{color:"rgba(255,255,255,0.6)"}}>Enter</b> near a planet to explore
                </p>
            }
            <p style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.2)", margin:"10px 0 0", letterSpacing:"0.04em" }}>
              click to dismiss
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop hint (persistent, faint) */}
      {!isTouchDevice && (
        <div className="fixed bottom-5 right-5" style={{ fontSize:9, color:"rgba(255,255,255,0.18)", zIndex:40, letterSpacing:"0.05em", lineHeight:1.8, textAlign:"right" }}>
          ↑↓←→ / WASD &nbsp;·&nbsp; Enter &nbsp;·&nbsp; M &nbsp;·&nbsp; E
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
