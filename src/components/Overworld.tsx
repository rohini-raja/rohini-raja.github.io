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
const MAP_W = 28;
const MAP_H = 20;

const BUILDINGS: Building[] = [
  { id:"library", label:"LIBRARY", emoji:"📚", x:3,  y:3,  w:4, h:4, color:"#5c3d1e", roofColor:"#8b2e2e", planetLabel:"LIBRARIA" },
  { id:"lab",     label:"LAB",     emoji:"🔬", x:11, y:3,  w:4, h:4, color:"#1a3a5c", roofColor:"#0a5a8a", planetLabel:"LABRON"   },
  { id:"academy", label:"ACADEMY", emoji:"🎓", x:19, y:3,  w:5, h:4, color:"#2d1a5c", roofColor:"#6a2a9a", planetLabel:"ACADEM"   },
  { id:"shrine",  label:"SHRINE",  emoji:"⛩️", x:6,  y:13, w:4, h:4, color:"#5c1a1a", roofColor:"#c04040", planetLabel:"SHRINIA"  },
  { id:"arcade",  label:"ARCADE",  emoji:"🕹️", x:17, y:13, w:4, h:4, color:"#1a4a1a", roofColor:"#2a8a2a", planetLabel:"ARCADIA"  },
];

// ─── NASA image queries per planet ──────────────────────────────────────────
const NASA_QUERIES: Record<BuildingId, string> = {
  library:  "hubble deep field galaxy",
  lab:      "earth from space blue marble",
  academy:  "jupiter planet juno",
  shrine:   "mars planet global view",
  arcade:   "saturn rings cassini",
};

const FALLBACK_ICONS: Record<BuildingId, string> = {
  library:  "🌌",
  lab:      "🌍",
  academy:  "🪐",
  shrine:   "🔴",
  arcade:   "💫",
};

// ─── Planet visual configs ───────────────────────────────────────────────────
const PLANET: Record<BuildingId, {
  r: number;
  gradient: string;
  atmoColor: string;
  ring?:   { color: string; w: number; h: number; thickness: number };
  moon?:   { r: number; color: string; orbit: number; speed: number };
  tail?:   boolean;
  floatDur: number;
}> = {
  library: {
    r:88, gradient:"radial-gradient(circle at 38% 30%,#f3d0ff,#9d4edd 35%,#5a189a 65%,#10002b)",
    atmoColor:"#c77dff",
    ring:{ color:"#c77dff", w:3.6, h:0.55, thickness:3 },
    moon:{ r:11, color:"#e0aaff", orbit:132, speed:11 },
    floatDur:5,
  },
  lab: {
    r:84, gradient:"radial-gradient(circle at 36% 27%,#d0f7ff,#48cae4 28%,#0096c7 58%,#023e8a 82%,#03045e)",
    atmoColor:"#48cae4",
    moon:{ r:14, color:"#caf0f8", orbit:128, speed:9 },
    floatDur:6,
  },
  academy: {
    r:108, gradient:"radial-gradient(circle at 36% 28%,#fff3b0,#f4a261 26%,#e76f51 52%,#9b2226 78%,#370617)",
    atmoColor:"#f4a261",
    ring:{ color:"#f4a261", w:3.8, h:0.52, thickness:4 },
    floatDur:7,
  },
  shrine: {
    r:80, gradient:"radial-gradient(circle at 40% 33%,#ff9e9e,#c1121f 40%,#6a040f 70%,#270000)",
    atmoColor:"#e63946", tail:true,
    floatDur:4,
  },
  arcade: {
    r:86, gradient:"radial-gradient(circle at 33% 26%,#b2ffff,#00f5ff 25%,#0096c7 54%,#023e8a 78%,#010b1f)",
    atmoColor:"#00f5ff",
    ring:{ color:"#00f5ff", w:3.5, h:0.50, thickness:2 },
    floatDur:5.5,
  },
};

// ─── Background constants ────────────────────────────────────────────────────
const STARS = Array.from({ length: 220 }, (_, i) => ({
  top:  (i*47.3+13)%100,  left: (i*83.7+7)%100,
  size: i%25===0 ? 3 : i%7===0 ? 2 : 1,
  dur:  1+(i%5)*0.4,  delay: (i%11)*0.18,
  color: i%4===0 ? "#a8d8ff" : i%7===0 ? "#fff8b0" : "#ffffff",
}));

const NEBULAE = [
  { top:"8%",  left:"5%",  w:260, h:120, color:"#5a0080", dur:6   },
  { top:"55%", left:"52%", w:300, h:130, color:"#003870", dur:8   },
  { top:"28%", left:"65%", w:200, h:100, color:"#006050", dur:7   },
  { top:"72%", left:"12%", w:220, h:90,  color:"#600028", dur:9   },
  { top:"40%", left:"30%", w:160, h:70,  color:"#1a0060", dur:10  },
  { top:"18%", left:"40%", w:180, h:80,  color:"#004040", dur:7.5 },
];

const SHOOT_STARS = Array.from({ length: 7 }, (_, i) => ({
  top:`${(i*14+3)%75}%`, left:`${(i*19+5)%65}%`,
  dur:3+i*1.4, delay:i*2.2,
}));

// ─── Collision helpers ───────────────────────────────────────────────────────
const WATER_TILES = [
  { x:0,      y:0,      w:2,      h:MAP_H },
  { x:MAP_W-2,y:0,      w:2,      h:MAP_H },
  { x:0,      y:0,      w:MAP_W,  h:2     },
  { x:0,      y:MAP_H-2,w:MAP_W,  h:2     },
  { x:8,      y:8,      w:3,      h:3     },
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
};

// ─── Planet renderer ─────────────────────────────────────────────────────────
function Planet({ b, isNear, onClick, imgSrc }: {
  b: Building; isNear: boolean; onClick: ()=>void; imgSrc?: string | null;
}) {
  const cfg   = PLANET[b.id];
  const cx    = b.x*TILE + (b.w*TILE)/2;
  const cy    = b.y*TILE + (b.h*TILE)/2;
  const r     = cfg.r;
  const ringW = cfg.ring ? cfg.ring.w * r : 0;
  const ringH = cfg.ring ? cfg.ring.h * r : 0;

  return (
    <Fragment>
      {/* Outer atmosphere halo */}
      <div style={{
        position:"absolute", left:cx-r*1.8, top:cy-r*1.8,
        width:r*3.6, height:r*3.6, borderRadius:"50%",
        background:`radial-gradient(circle,${cfg.atmoColor}28 0%,${cfg.atmoColor}10 45%,transparent 70%)`,
        animation:`atmospherePulse ${cfg.floatDur}s ease-in-out infinite`,
        pointerEvents:"none", zIndex:1,
      }} />

      {/* Comet tail */}
      {cfg.tail && (
        <div style={{
          position:"absolute", left:cx-r*0.25, top:cy-r*2.6,
          width:r*0.5, height:r*2.8,
          background:`linear-gradient(to top,${cfg.atmoColor}70,${cfg.atmoColor}20,transparent)`,
          borderRadius:"0 0 50% 50%", filter:"blur(6px)",
          animation:"cometPulse 3s ease-in-out infinite",
          pointerEvents:"none", zIndex:1,
        }} />
      )}

      {/* Ring bottom half */}
      {cfg.ring && (
        <div style={{
          position:"absolute", left:cx-ringW/2, top:cy-ringH/2,
          width:ringW, height:ringH,
          border:`${cfg.ring.thickness}px solid ${cfg.ring.color}55`,
          borderRadius:"50%", boxShadow:`0 0 10px ${cfg.ring.color}30`,
          pointerEvents:"none", zIndex:2,
        }} />
      )}

      {/* Planet body */}
      <div onClick={onClick} style={{
        position:"absolute", left:cx-r, top:cy-r,
        width:r*2, height:r*2, borderRadius:"50%",
        background: imgSrc ? "#000" : cfg.gradient,
        boxShadow: isNear
          ? `0 0 50px ${cfg.atmoColor},0 0 100px ${cfg.atmoColor}55,inset 0 0 30px rgba(0,0,0,0.5)`
          : `0 0 28px ${cfg.atmoColor}60,inset 0 0 25px rgba(0,0,0,0.45)`,
        cursor:"pointer", overflow:"hidden", zIndex:3,
      }}>
        {/* NASA real image */}
        {imgSrc
          ? <img src={imgSrc} alt={b.planetLabel} style={{
              width:"100%", height:"100%", objectFit:"cover",
              borderRadius:"50%", display:"block",
            }} />
          : (
            /* Fallback icon while loading / offline */
            <div style={{
              width:"100%", height:"100%",
              background:cfg.gradient,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:r*0.7, userSelect:"none",
            }}>
              {FALLBACK_ICONS[b.id]}
            </div>
          )
        }

        {/* Atmosphere rim overlay (always on top of image) */}
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          background:`radial-gradient(circle,transparent 55%,${cfg.atmoColor}18 75%,${cfg.atmoColor}35 90%,rgba(0,0,0,0.5) 100%)`,
          pointerEvents:"none",
        }} />

        {/* Specular highlight */}
        <div style={{
          position:"absolute", left:"10%", top:"7%",
          width:"36%", height:"26%",
          background:"radial-gradient(circle,rgba(255,255,255,0.32),transparent 70%)",
          borderRadius:"50%", pointerEvents:"none",
        }} />
      </div>

      {/* Ring top half */}
      {cfg.ring && (
        <div style={{
          position:"absolute", left:cx-ringW/2, top:cy-ringH/2,
          width:ringW, height:ringH/2,
          overflow:"hidden", pointerEvents:"none", zIndex:4,
        }}>
          <div style={{
            width:ringW, height:ringH,
            border:`${cfg.ring.thickness}px solid ${cfg.ring.color}88`,
            borderRadius:"50%", boxShadow:`0 0 12px ${cfg.ring.color}40`,
          }} />
        </div>
      )}

      {/* Moon orbit */}
      {cfg.moon && (
        <div style={{
          position:"absolute", left:cx, top:cy, width:0, height:0,
          animationName:"moonOrbit",
          animationDuration:`${cfg.moon.speed}s`,
          animationTimingFunction:"linear",
          animationIterationCount:"infinite",
          pointerEvents:"none", zIndex:5,
        }}>
          <div style={{
            position:"absolute",
            left:cfg.moon.orbit-cfg.moon.r*2, top:-cfg.moon.r*2,
            width:cfg.moon.r*4, height:cfg.moon.r*4,
            borderRadius:"50%",
            background:`radial-gradient(circle,${cfg.moon.color}30,transparent 65%)`,
          }} />
          <div style={{
            position:"absolute",
            left:cfg.moon.orbit-cfg.moon.r, top:-cfg.moon.r,
            width:cfg.moon.r*2, height:cfg.moon.r*2, borderRadius:"50%",
            background:`radial-gradient(circle at 35% 30%,${cfg.moon.color},${cfg.moon.color}88)`,
            boxShadow:`0 0 8px ${cfg.moon.color}60`,
          }} />
        </div>
      )}

      {/* Label */}
      <div style={{
        position:"absolute", left:cx-r*1.6, top:cy-r-28,
        width:r*3.2, textAlign:"center",
        fontFamily:'"Press Start 2P",monospace', fontSize:8,
        color: isNear ? cfg.atmoColor : `${cfg.atmoColor}bb`,
        textShadow: isNear
          ? `0 0 12px ${cfg.atmoColor},0 0 24px ${cfg.atmoColor}80`
          : `0 0 8px ${cfg.atmoColor}60`,
        pointerEvents:"none", whiteSpace:"nowrap", zIndex:6,
      }}>
        {b.emoji} {b.planetLabel}
      </div>
    </Fragment>
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

  // NASA data
  const [nasaBg, setNasaBg]         = useState<string | null>(null);
  const [nasaBgTitle, setNasaBgTitle] = useState<string>("");
  const [epicUrl, setEpicUrl]       = useState<string | null>(null);
  const [epicDate, setEpicDate]     = useState<string | null>(null);
  const [planetImgs, setPlanetImgs] = useState<Partial<Record<BuildingId,string>>>({});

  const keysRef      = useRef<Set<string>>(new Set());
  const animRef      = useRef<number>(0);
  const lastRef      = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const konamiRef = useRef<string[]>([]);
  const KONAMI    = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const [showKonami, setShowKonami] = useState(false);
  const [isTouchDevice] = useState(() =>
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  const SPEED = 90;

  // ── Fetch all NASA data on mount ──────────────────────────────────────────
  useEffect(() => {
    // 1. APOD – galaxy background
    fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true")
      .then(r => r.json())
      .then((d: { url:string; hdurl?:string; title:string; media_type:string; thumbnail_url?:string }) => {
        const url = d.media_type === "image" ? (d.hdurl || d.url) : (d.thumbnail_url || null);
        if (url) { setNasaBg(url); setNasaBgTitle(d.title); }
      })
      .catch(() => {});

    // 2. EPIC – real-time Earth
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

  // ── Game loop ─────────────────────────────────────────────────────────────
  const gameLoop = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now;
    const dt   = Math.min((now - lastRef.current) / 1000, 0.1);
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
      const len = Math.hypot(dx,dy); dx/=len; dy/=len;
      setPos(prev => {
        const nx = prev.x + dx*SPEED*dt, ny = prev.y + dy*SPEED*dt;
        const newX = isSolid(nx, prev.y) ? prev.x : nx;
        const newY = isSolid(prev.x, ny) ? prev.y : ny;
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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden scanlines"
      style={{ background:"#000010", cursor:"default", touchAction:"none" }}
      tabIndex={0}
    >
      {/* ── NASA APOD real galaxy background ── */}
      {nasaBg && (
        <div style={{
          position:"fixed", inset:0,
          backgroundImage:`url(${nasaBg})`,
          backgroundSize:"cover", backgroundPosition:"center",
          filter:"brightness(0.35) saturate(1.5)",
          zIndex:0, pointerEvents:"none",
        }} />
      )}

      {/* ── Stars (always on, denser with NASA bg) ── */}
      {STARS.map((s, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width:s.size, height:s.size, background:s.color,
          top:`${s.top}%`, left:`${s.left}%`,
          opacity: nasaBg ? 0.35+(i%4)*0.08 : 0.55+(i%4)*0.12,
          animation:`twinkle ${s.dur}s ease-in-out infinite`,
          animationDelay:`${s.delay}s`, zIndex:1,
        }} />
      ))}

      {/* ── Nebulae ── */}
      {NEBULAE.map((n, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          top:n.top, left:n.left, width:n.w, height:n.h,
          background:n.color, borderRadius:"50%", filter:"blur(32px)",
          animation:`nebulaBreath ${n.dur}s ease-in-out infinite`,
          animationDelay:`${i*0.8}s`, zIndex:1,
        }} />
      ))}

      {/* ── Shooting stars ── */}
      {SHOOT_STARS.map((s, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          top:s.top, left:s.left, width:2, height:2, borderRadius:1,
          background:"white", boxShadow:"0 0 4px white",
          transformOrigin:"left center",
          animation:`shootStar ${s.dur}s linear infinite`,
          animationDelay:`${s.delay}s`, zIndex:2,
        }} />
      ))}

      {/* ── NASA EPIC real Earth – fixed floating sphere ── */}
      <div style={{
        position:"fixed", right:-70, bottom:-70,
        width:400, height:400, borderRadius:"50%",
        overflow:"hidden", zIndex:2, pointerEvents:"none",
        boxShadow:"0 0 70px rgba(50,140,255,0.5),0 0 180px rgba(30,80,200,0.2)",
      }}>
        {epicUrl
          ? <img src={epicUrl} alt="Live Earth" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
          : <div style={{ width:"100%",height:"100%",background:"radial-gradient(circle at 40% 35%,#1a6b9a,#0a3d62 45%,#020d1a)" }} />
        }
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          background:"radial-gradient(circle,transparent 58%,rgba(50,140,255,0.2) 75%,rgba(60,160,255,0.5) 92%,rgba(40,110,200,0.65) 100%)",
        }} />
      </div>

      {/* ── Map ── */}
      <div style={{
        width:MAP_W*TILE, height:MAP_H*TILE,
        position:"relative",
        transform:`translate(${-camX}px,${-camY}px)`,
        willChange:"transform", zIndex:3,
      }}>
        {/* Ground void */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 50% 50%,#00001e 0%,#000010 60%,#000008)",
        }} />

        {/* Black holes (water) */}
        {WATER_TILES.map((w, i) => (
          <div key={i} style={{
            position:"absolute", left:w.x*TILE, top:w.y*TILE,
            width:w.w*TILE, height:w.h*TILE,
            background:"radial-gradient(circle,#000 30%,#1a003a 70%,#000)",
            boxShadow:`inset 0 0 ${w.w*TILE*0.6}px rgba(80,0,160,0.7),0 0 20px rgba(60,0,120,0.4)`,
            borderRadius:"50%",
          }} />
        ))}

        {/* Asteroids (trees) */}
        {[
          [9,5],[10,6],[9,10],[15,6],[16,10],[22,6],[23,7],
          [4,16],[8,16],[14,16],[20,16],[24,16],[25,10],
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
            onClick={() => setActiveBuilding(b.id)}
            imgSrc={planetImgs[b.id]}
          />
        ))}

        {/* Character */}
        <div style={{ position:"absolute", left:pos.x, top:pos.y, zIndex:10 }}>
          <Character facing={facing} moving={moving} scale={3} />
        </div>
      </div>

      {/* ── HUD ── */}
      <div className="fixed top-4 left-4 px-4 py-2" style={{
        background:theme.panel, border:`2px solid ${theme.panelBorder}`,
        boxShadow:`0 0 12px ${theme.accent}30`, zIndex:40,
      }}>
        <p className="font-pixel crt-glow" style={{ fontSize:9, color:theme.accent }}>ROHINI RAJASIMMAN</p>
        <p className="font-mono opacity-50 mt-0.5" style={{ color:theme.text, fontSize:9 }}>builder · reader · explorer</p>
      </div>

      {/* Near-planet hint */}
      <AnimatePresence>
        {nearBy && !activeBuilding && (() => {
          const bld = BUILDINGS.find(b => b.id === nearBy)!;
          const pc  = PLANET[nearBy];
          return (
            <div className="fixed left-1/2 -translate-x-1/2 px-4 py-2 font-pixel" style={{
              bottom: isTouchDevice ? 200 : 80,
              background:theme.panel, border:`2px solid ${pc.atmoColor}`,
              fontSize:9, color:pc.atmoColor,
              boxShadow:`0 0 16px ${pc.atmoColor}40`,
              whiteSpace:"nowrap", zIndex:45,
            }}>
              {isTouchDevice ? "TAP A" : "ENTER"} to explore {bld.emoji} {bld.planetLabel}
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Desktop hint */}
      {!isTouchDevice && (
        <div className="fixed bottom-4 right-4 font-mono opacity-40 text-right" style={{ fontSize:10, color:theme.text, zIndex:40 }}>
          ↑↓←→ move · ENTER explore
        </div>
      )}

      {/* Mobile D-pad */}
      {isTouchDevice && (
        <div className="fixed z-50 select-none" style={{ bottom:24, right:16 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
            <button
              onPointerDown={e=>{ e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); handleDpadPress("Enter"); }}
              onPointerUp={e=>{ e.preventDefault(); handleDpadRelease("Enter"); }}
              onPointerCancel={e=>{ e.preventDefault(); handleDpadRelease("Enter"); }}
              style={{
                width:52,height:52,borderRadius:"50%",
                background:`${theme.accent}25`,border:`2px solid ${theme.accent}`,
                color:theme.accent,fontFamily:'"Press Start 2P",monospace',fontSize:10,
                display:"flex",alignItems:"center",justifyContent:"center",
                touchAction:"none",userSelect:"none",marginBottom:24,cursor:"pointer",
              }}
            >A</button>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,50px)",gridTemplateRows:"repeat(3,50px)",gap:3 }}>
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
                      width:50,height:50,
                      background:theme.panel,border:`2px solid ${theme.panelBorder}`,
                      color:theme.accent,fontFamily:'"Press Start 2P",monospace',fontSize:16,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      touchAction:"none",userSelect:"none",cursor:"pointer",
                    }}
                  >{key==="ArrowUp"?"↑":key==="ArrowDown"?"↓":key==="ArrowLeft"?"←":"→"}</button>
                ) : (
                  <div key={`${ri}-${ci}`} style={{ width:50,height:50,background:`${theme.panel}60`,border:`1px solid ${theme.panelBorder}20` }} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NASA attribution */}
      {(nasaBg || epicDate) && (
        <div style={{
          position:"fixed",bottom:8,left:8,
          fontFamily:"monospace",fontSize:8,opacity:0.4,
          color:"#aef",zIndex:50,pointerEvents:"none",lineHeight:1.7,
        }}>
          {nasaBg && <div>APOD: {nasaBgTitle}</div>}
          {epicDate && <div>Earth: NASA EPIC {epicDate}</div>}
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
    </div>
  );
}
