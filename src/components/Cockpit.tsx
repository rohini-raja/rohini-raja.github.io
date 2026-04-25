import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onClose: () => void }

// Mini star canvas for the cockpit viewport
function ViewportCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const canvas = c;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, t = 0, angle = 0;
    const stars: { x:number; y:number; r:number; a:number; sp:number; ph:number }[] = [];

    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();

    for (let i = 0; i < 500; i++) {
      const layer = Math.random();
      stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        r: layer < 0.6 ? 0.4+Math.random()*0.6 : layer < 0.88 ? 0.8+Math.random()*1.0 : 1.4+Math.random()*1.4,
        a: 0.3+Math.random()*0.7, sp: 0.4+Math.random()*2, ph: Math.random()*Math.PI*2 });
    }

    function draw() {
      const w = canvas.width, h = canvas.height, cx = w*0.5, cy = h*0.5;
      ctx.clearRect(0,0,w,h);

      // Deep space
      ctx.fillStyle = "#00000e"; ctx.fillRect(0,0,w,h);

      // Nebula washes
      [[cx*0.6,cy*0.7,w*0.5,h*0.45,"30,0,80,0.18"],[cx*1.5,cy*1.3,w*0.4,h*0.4,"0,20,70,0.12"]].forEach(([nx,ny,rx,ry,rgba]) => {
        const g = ctx.createRadialGradient(+nx,+ny,0,+nx,+ny,Math.max(+rx,+ry));
        g.addColorStop(0,`rgba(${rgba})`); g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(+nx,+ny,+rx,+ry,0,0,Math.PI*2); ctx.fill();
      });

      // Galaxy spiral (simplified)
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle);
      ctx.globalCompositeOperation="screen";
      const R = Math.min(w,h)*0.38;
      for (let arm = 0; arm < 2; arm++) {
        const off = arm * Math.PI;
        for (let i = 0; i < 800; i++) {
          const frac = i/800, r2 = frac*R;
          const theta = Math.log(Math.max(r2,0.01)/(R*0.025))/0.26 + off;
          const sc = (Math.random()-0.5)*0.4*(1+frac);
          const px = r2*Math.cos(theta+sc), py = r2*Math.sin(theta+sc)*0.38;
          const a = (0.15+frac*0.4)*(0.5+Math.random()*0.5);
          ctx.fillStyle = frac<0.4 ? `rgba(160,200,255,${a.toFixed(2)})` : `rgba(255,230,160,${a.toFixed(2)})`;
          ctx.beginPath(); ctx.arc(px,py,0.5+Math.random()*0.8,0,Math.PI*2); ctx.fill();
        }
      }
      // Core glow
      const cg = ctx.createRadialGradient(0,0,0,0,0,R*0.14);
      cg.addColorStop(0,"rgba(255,250,220,0.9)"); cg.addColorStop(0.4,"rgba(255,200,100,0.3)"); cg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cg; ctx.beginPath(); ctx.ellipse(0,0,R*0.14,R*0.06,0,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation="source-over"; ctx.restore();

      // Stars
      ctx.globalCompositeOperation="screen";
      stars.forEach(s => {
        const tw = Math.sin(t*0.05*s.sp+s.ph);
        const a = Math.max(0.04, s.a+tw*0.18);
        ctx.fillStyle = `rgba(200,220,255,${a.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*(0.88+tw*0.14),0,Math.PI*2); ctx.fill();
      });
      ctx.globalCompositeOperation="source-over";

      angle += 0.0003; t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"100%", display:"block" }} />;
}

const ACCENT = "#00e5ff";
const PANEL  = "rgba(8,14,28,0.95)";

export default function Cockpit({ onClose }: Props) {
  const [warp, setWarp] = useState(false);
  const [coords] = useState({ lat: (Math.random()*180-90).toFixed(2), lon: (Math.random()*360-180).toFixed(2) });
  const [fuel]   = useState(Math.floor(70+Math.random()*28));
  const [shields]= useState(Math.floor(80+Math.random()*18));
  const tickRef  = useRef(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    tickRef.current = window.setInterval(() => setSpeed(s => Math.min(28000, s + 400 + Math.floor(Math.random()*200))), 80);
    return () => clearInterval(tickRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:100, display:"flex", flexDirection:"column", background:"#000" }}
    >
      {/* ── Top bar ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px",
        background: PANEL, borderBottom:`1px solid ${ACCENT}30` }}>
        <div style={{ fontFamily:"monospace", fontSize:11, color:ACCENT, letterSpacing:"0.15em" }}>
          ◈ COCKPIT · DEEP SPACE NAVIGATOR v4.1
        </div>
        <button onClick={onClose} style={{ fontFamily:"monospace", fontSize:11, color:ACCENT, background:"transparent",
          border:`1px solid ${ACCENT}50`, padding:"4px 14px", cursor:"pointer", letterSpacing:"0.1em" }}>
          ✕ EXIT
        </button>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex:1, display:"flex", gap:0, overflow:"hidden" }}>

        {/* Left instrument panel */}
        <div style={{ width:160, background:PANEL, borderRight:`1px solid ${ACCENT}20`,
          display:"flex", flexDirection:"column", gap:12, padding:14, flexShrink:0 }}>
          <Panel label="VELOCITY" value={`${speed.toLocaleString()} km/h`} accent={ACCENT} bar={speed/28000} />
          <Panel label="SHIELDS"  value={`${shields}%`} accent="#00ff9d" bar={shields/100} />
          <Panel label="FUEL"     value={`${fuel}%`}    accent="#ffd60a" bar={fuel/100} />
          <Panel label="HEADING"  value="027° NNE"       accent={ACCENT} />
          <div style={{ marginTop:"auto" }}>
            <div style={{ fontSize:8, color:`${ACCENT}60`, fontFamily:"monospace", marginBottom:6, letterSpacing:"0.1em" }}>SYSTEMS</div>
            {["NAV","LIFE SUPPORT","ENGINES","SENSORS"].map(sys => (
              <div key={sys} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:8, fontFamily:"monospace", color:`${ACCENT}80` }}>{sys}</span>
                <span style={{ fontSize:8, fontFamily:"monospace", color:"#00ff9d" }}>OK</span>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <ViewportCanvas />

          {/* Warp overlay */}
          <AnimatePresence>
            {warp && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse,transparent 10%,rgba(0,229,255,0.08) 60%,rgba(0,100,255,0.25) 100%)",
                  pointerEvents:"none" }}
              />
            )}
          </AnimatePresence>

          {/* Cockpit frame overlay — gives the "sitting inside" feel */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:`
              radial-gradient(ellipse 120% 30% at 50% 100%, rgba(0,10,24,0.95) 0%, transparent 100%),
              radial-gradient(ellipse 25% 100% at 0% 50%,   rgba(0,10,24,0.85) 0%, transparent 100%),
              radial-gradient(ellipse 25% 100% at 100% 50%, rgba(0,10,24,0.85) 0%, transparent 100%),
              radial-gradient(ellipse 100% 18% at 50% 0%,   rgba(0,10,24,0.70) 0%, transparent 100%)
            ` }} />

          {/* HUD crosshair */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", display:"flex",
            alignItems:"center", justifyContent:"center" }}>
            <svg width={80} height={80} viewBox="0 0 80 80" style={{ opacity:0.35 }}>
              <circle cx={40} cy={40} r={18} fill="none" stroke={ACCENT} strokeWidth={0.8} />
              <line x1={40} y1={16} x2={40} y2={28} stroke={ACCENT} strokeWidth={0.8}/>
              <line x1={40} y1={52} x2={40} y2={64} stroke={ACCENT} strokeWidth={0.8}/>
              <line x1={16} y1={40} x2={28} y2={40} stroke={ACCENT} strokeWidth={0.8}/>
              <line x1={52} y1={40} x2={64} y2={40} stroke={ACCENT} strokeWidth={0.8}/>
              <circle cx={40} cy={40} r={2} fill={ACCENT} opacity={0.6}/>
            </svg>
          </div>

          {/* Corner data overlays */}
          <div style={{ position:"absolute", top:12, left:14, fontFamily:"monospace", fontSize:9,
            color:`${ACCENT}cc`, lineHeight:1.7, pointerEvents:"none" }}>
            <div>LAT  {coords.lat}°</div>
            <div>LON  {coords.lon}°</div>
            <div>ALT  428 km</div>
          </div>
          <div style={{ position:"absolute", top:12, right:14, fontFamily:"monospace", fontSize:9,
            color:`${ACCENT}cc`, lineHeight:1.7, textAlign:"right", pointerEvents:"none" }}>
            <div>SECTOR  KX-7</div>
            <div>OBJECTS  {Math.floor(3+Math.random()*5)} tracked</div>
            <div style={{ color:"#00ff9d" }}>ALL CLEAR</div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width:160, background:PANEL, borderLeft:`1px solid ${ACCENT}20`,
          display:"flex", flexDirection:"column", gap:12, padding:14, flexShrink:0 }}>
          <div style={{ fontSize:8, color:`${ACCENT}60`, fontFamily:"monospace", letterSpacing:"0.1em" }}>NEARBY OBJECTS</div>
          {["LIBRARIA","LABRON","ARCADIA","CELESTIA","NOMADIA"].map((p,i) => (
            <div key={p} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:8, fontFamily:"monospace", color:`${ACCENT}80` }}>◉ {p}</span>
              <span style={{ fontSize:7, fontFamily:"monospace", color:"rgba(255,255,255,0.35)" }}>{(0.8+i*0.4).toFixed(1)} AU</span>
            </div>
          ))}

          <div style={{ width:"100%", height:1, background:`${ACCENT}15`, margin:"4px 0" }}/>
          <div style={{ fontSize:8, color:`${ACCENT}60`, fontFamily:"monospace", letterSpacing:"0.1em" }}>ACTIONS</div>

          <button
            onClick={() => setWarp(w => !w)}
            style={{ fontFamily:"monospace", fontSize:9, color: warp ? "#000" : ACCENT,
              background: warp ? ACCENT : "transparent",
              border:`1px solid ${ACCENT}`, padding:"7px 0", cursor:"pointer", letterSpacing:"0.08em" }}>
            {warp ? "⚡ WARP ACTIVE" : "⚡ ENGAGE WARP"}
          </button>

          <div style={{ marginTop:"auto", fontFamily:"monospace", fontSize:8, color:"rgba(255,255,255,0.2)",
            lineHeight:1.6, borderTop:`1px solid ${ACCENT}10`, paddingTop:10 }}>
            <div>MISSION TIME</div>
            <div style={{ color:`${ACCENT}80`, fontSize:10 }}>∞ EXPLORING</div>
            <div style={{ marginTop:8 }}>PILOT</div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:9 }}>ROHINI R.</div>
          </div>
        </div>
      </div>

      {/* ── Bottom console ── */}
      <div style={{ height:56, background:PANEL, borderTop:`1px solid ${ACCENT}20`,
        display:"flex", alignItems:"center", gap:20, padding:"0 20px" }}>
        {[["◀ ROLL L","roll-l"],["▲ PITCH UP","pitch-u"],["▼ PITCH DN","pitch-d"],["▶ ROLL R","roll-r"]].map(([label]) => (
          <button key={label} style={{ fontFamily:"monospace", fontSize:9, color:`${ACCENT}80`,
            background:"transparent", border:`1px solid ${ACCENT}20`, padding:"5px 12px", cursor:"pointer" }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:24 }}>
          {["RADAR","COMMS","SCAN"].map(btn => (
            <button key={btn} style={{ fontFamily:"monospace", fontSize:9, color:`${ACCENT}60`,
              background:"transparent", border:"none", cursor:"pointer", letterSpacing:"0.1em" }}>
              {btn}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ label, value, accent, bar }: { label:string; value:string; accent:string; bar?:number }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:7, fontFamily:"monospace", color:`${accent}60`, letterSpacing:"0.1em" }}>{label}</span>
        <span style={{ fontSize:8, fontFamily:"monospace", color:accent }}>{value}</span>
      </div>
      {bar !== undefined && (
        <div style={{ height:2, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
          <div style={{ height:"100%", width:`${(bar*100).toFixed(1)}%`, background:accent,
            borderRadius:2, transition:"width 0.3s" }} />
        </div>
      )}
    </div>
  );
}
