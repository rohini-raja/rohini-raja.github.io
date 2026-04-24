import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";
import Character from "./Character";
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

// ─── Planet configs — only glow colour and size, no CSS drawings ─────────────
const PLANET: Record<BuildingId, { r: number; atmoColor: string }> = {
  library:   { r:88,  atmoColor:"#c77dff" },
  lab:       { r:84,  atmoColor:"#48cae4" },
  academy:   { r:108, atmoColor:"#f4a261" },
  shrine:    { r:80,  atmoColor:"#e63946" },
  arcade:    { r:86,  atmoColor:"#00f5ff" },
  skygazing: { r:90,  atmoColor:"#90e0ef" },
  travel:    { r:84,  atmoColor:"#52b788" },
  writing:   { r:82,  atmoColor:"#ffd60a" },
  cinema:    { r:96,  atmoColor:"#ff6b9d" },
};


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

// ─── Planet renderer — real NASA photo, nothing drawn ────────────────────────
function Planet({ b, isNear, onClick, imgSrc }: {
  b: Building; isNear: boolean; onClick: ()=>void; imgSrc?: string | null;
}) {
  const { r, atmoColor } = PLANET[b.id];
  const cx = b.x*TILE + (b.w*TILE)/2;
  const cy = b.y*TILE + (b.h*TILE)/2;

  return (
    <Fragment>
      {/* Glow — real atmospheric light, not a drawing */}
      <div style={{
        position:"absolute",
        left:cx - r*1.6, top:cy - r*1.6,
        width:r*3.2, height:r*3.2,
        borderRadius:"50%",
        background:`radial-gradient(circle, ${atmoColor}22 0%, ${atmoColor}08 50%, transparent 72%)`,
        filter:"blur(8px)",
        pointerEvents:"none", zIndex:1,
        opacity: isNear ? 1 : 0.6,
        transition:"opacity 0.3s",
      }} />

      {/* Planet — NASA photo only */}
      <div onClick={onClick} style={{
        position:"absolute",
        left:cx-r, top:cy-r,
        width:r*2, height:r*2,
        borderRadius:"50%",
        overflow:"hidden",
        cursor:"pointer",
        zIndex:3,
        boxShadow: isNear
          ? `0 0 0 2px ${atmoColor}, 0 0 40px ${atmoColor}80`
          : `0 0 0 1px ${atmoColor}40`,
        transition:"box-shadow 0.3s",
        background:"#000",
      }}>
        {imgSrc
          ? <img src={imgSrc} alt={b.planetLabel}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          : <div style={{
              width:"100%", height:"100%",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:r*0.65, userSelect:"none",
              background:"#050510",
            }}>{FALLBACK_ICONS[b.id]}</div>
        }
      </div>

      {/* Label */}
      <div style={{
        position:"absolute",
        left:cx-r*1.4, top:cy+r+10,
        width:r*2.8, textAlign:"center",
        fontFamily:'"Inter","Share Tech Mono",monospace',
        fontSize:10, fontWeight:500, letterSpacing:"0.08em",
        color: isNear ? "#fff" : "rgba(255,255,255,0.5)",
        textShadow: isNear ? `0 0 16px ${atmoColor}` : "none",
        pointerEvents:"none", whiteSpace:"nowrap",
        transition:"color 0.3s",
        zIndex:6,
      }}>
        {b.emoji}  {b.planetLabel}
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
    // 1. NASA Image Library – real Hubble/JWST galaxy image for background
    fetch("https://images-api.nasa.gov/search?q=hubble+spiral+galaxy+deep+field&media_type=image&page_size=10")
      .then(r => r.json())
      .then((data: { collection:{ items:Array<{ links?:Array<{ href:string }>; data?:Array<{ title:string }> }> } }) => {
        const items = data.collection?.items;
        if (!items?.length) return;
        // Pick a random one for variety each visit
        const pick = items[Math.floor(Math.random() * Math.min(items.length, 8))];
        const thumb = pick?.links?.[0]?.href;
        const title = pick?.data?.[0]?.title ?? "NASA Galaxy";
        if (!thumb) return;
        // Upgrade to original/large image
        const large = thumb
          .replace("~thumb.jpg", "~orig.jpg")
          .replace("~thumb.png", "~orig.png");
        setNasaBg(large);
        setNasaBgTitle(title);
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
      className="fixed inset-0 overflow-hidden"
      style={{ background:"transparent", cursor:"default", touchAction:"none" }}
      tabIndex={0}
    >
      {/* ── NASA galaxy background — full brightness, no CSS overlay ── */}
      {nasaBg
        ? <img src={nasaBg} alt="NASA galaxy" style={{
            position:"fixed", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center",
            zIndex:0, pointerEvents:"none",
            display:"block",
          }} />
        : <div style={{ position:"fixed", inset:0, background:"#000", zIndex:0 }} />
      }


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
      <div className="fixed top-5 left-5" style={{
        background:"rgba(0,0,0,0.55)",
        backdropFilter:"blur(12px)",
        WebkitBackdropFilter:"blur(12px)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:12, padding:"10px 18px",
        zIndex:40,
      }}>
        <p style={{ fontSize:13, fontWeight:600, letterSpacing:"0.06em", color:"#fff", margin:0 }}>ROHINI RAJASIMMAN</p>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:"2px 0 0", letterSpacing:"0.04em" }}>builder · reader · explorer</p>
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
        <div className="fixed bottom-5 right-5" style={{ fontSize:11, color:"rgba(255,255,255,0.25)", zIndex:40, letterSpacing:"0.05em" }}>
          ↑↓←→ move &nbsp;·&nbsp; Enter explore
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
