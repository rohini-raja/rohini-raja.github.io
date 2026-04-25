import { useEffect, useRef } from "react";

interface Props {
  camRef?: React.MutableRefObject<{ x: number; y: number }>;
}

interface Particle {
  x: number; y: number;
  r: number;
  alpha: number;
  cr: number; cg: number; cb: number;
  twinkle: number;
  phase: number;
}

interface Shooter {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
}

export default function StarField({ camRef }: Props = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let galaxyAngle = 0;
    let t = 0;
    let nextShooter = 180;
    let shooters: Shooter[] = [];
    let particles: Particle[] = [];

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    // ─── Build galaxy particle system ────────────────────────────────────────
    function build() {
      particles = [];
      const R = Math.min(canvas!.width, canvas!.height) * 0.44;

      const push = (
        x: number, y: number, r: number, a: number,
        cr: number, cg: number, cb: number,
        tw = 0.6 + Math.random() * 1.4
      ) => particles.push({ x, y, r, alpha: a, cr, cg, cb, twinkle: tw, phase: Math.random() * Math.PI * 2 });

      // ── Spiral arms (2 major + 2 minor) ──────────────────────────────────
      const b = 0.26; // spiral tightness (logarithmic)
      const armConfigs = [
        { offset: 0,           scale: 1,    count: 4500 },
        { offset: Math.PI,     scale: 1,    count: 4500 },
        { offset: 0.22,        scale: 0.55, count: 2000 },
        { offset: Math.PI + 0.22, scale: 0.55, count: 2000 },
      ];

      for (const arm of armConfigs) {
        for (let i = 0; i < arm.count; i++) {
          const t2 = (i / arm.count) * 0.94 + 0.03;
          const r = t2 * R;
          const theta = Math.log(Math.max(r, 0.01) / (R * 0.025)) / b + arm.offset;
          const spread = (0.12 + t2 * 0.45) * (1 / arm.scale);
          const sc = (Math.random() - 0.5) * spread * 2;

          const px = r * Math.cos(theta + sc);
          const py = r * Math.sin(theta + sc) * 0.38; // disk tilt

          // Color: outer=blue-white, mid=white, inner=warm yellow
          let cr: number, cg: number, cb: number;
          if (t2 < 0.35) {
            cr = 180 + Math.random() * 50; cg = 200 + Math.random() * 55; cb = 255;
          } else if (t2 < 0.65) {
            cr = 230 + Math.random() * 25; cg = 235 + Math.random() * 20; cb = 255;
          } else {
            cr = 255; cg = 230 + Math.random() * 25; cb = 150 + Math.random() * 80;
          }

          const size = R * 0.0018 * (0.4 + Math.random() * 0.9) * (1 - t2 * 0.4) * arm.scale;
          const alpha = (0.25 + Math.random() * 0.55) * (0.5 + t2 * 0.5) * arm.scale;
          push(px, py, size, alpha, cr, cg, cb);
        }
      }

      // ── Bulge (dense old yellow-orange stars) ──────────────────────────────
      for (let i = 0; i < 3500; i++) {
        const u1 = Math.random(), u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
        const r = Math.abs(z) * R * 0.09;
        const theta = Math.random() * Math.PI * 2;
        push(
          r * Math.cos(theta), r * Math.sin(theta) * 0.55,
          R * 0.0025 * (0.4 + Math.random()),
          0.55 + Math.random() * 0.45,
          255, 215 + Math.floor(Math.random() * 40), 120 + Math.floor(Math.random() * 80)
        );
      }

      // ── HII regions (pink/red star-forming nebulae along arms) ─────────────
      // These are just larger glowing blobs; rendered separately in draw()

      // ── Halo (sparse, faint old stars outside disk) ────────────────────────
      for (let i = 0; i < 600; i++) {
        const r = R * 0.5 + Math.random() * R * 0.55;
        const theta = Math.random() * Math.PI * 2;
        push(
          r * Math.cos(theta), r * Math.sin(theta) * 0.5,
          R * 0.0008 * (0.5 + Math.random()),
          0.1 + Math.random() * 0.25,
          210, 215, 230
        );
      }

      // ── Distant background stars/galaxies (screen-space, not rotated) ──────
      for (let i = 0; i < 400; i++) {
        push(
          (Math.random() - 0.5) * canvas!.width * 1.6,
          (Math.random() - 0.5) * canvas!.height * 1.6,
          0.4 + Math.random() * 1.2,
          0.1 + Math.random() * 0.45,
          190 + Math.floor(Math.random() * 40),
          200 + Math.floor(Math.random() * 30),
          255,
          0.15 + Math.random() * 0.6
        );
      }
    }

    resize();
    build();
    window.addEventListener("resize", () => { resize(); build(); });

    // ─── HII region positions (relative to galaxy center, pre-defined) ───────
    const hiiRegions = [
      { x: 0.30, y:  0.03, rx: 0.10, ry: 0.038, c: "255,70,50"    },
      { x:-0.28, y: -0.04, rx: 0.09, ry: 0.032, c: "255,50,80"    },
      { x: 0.52, y:  0.06, rx: 0.06, ry: 0.022, c: "210,60,255"   },
      { x:-0.47, y: -0.05, rx: 0.07, ry: 0.028, c: "80,120,255"   },
      { x: 0.18, y: -0.05, rx: 0.05, ry: 0.018, c: "255,100,40"   },
      { x:-0.20, y:  0.06, rx: 0.05, ry: 0.020, c: "255,80,120"   },
    ];

    // ─── Draw loop ────────────────────────────────────────────────────────────
    function draw() {
      const w = canvas!.width, h = canvas!.height;
      // Parallax: galaxy drifts at 8% of camera movement, making it feel infinitely far
      const cam = camRef?.current ?? { x: 0, y: 0 };
      const cx = w * 0.5 - cam.x * 0.08;
      const cy = h * 0.5 - cam.y * 0.08;
      const R = Math.min(w, h) * 0.44;

      ctx.clearRect(0, 0, w, h);

      // Deep space base
      ctx.fillStyle = "#00000c";
      ctx.fillRect(0, 0, w, h);

      // ── Galaxy (rotated group) ──────────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(galaxyAngle);

      // Outer diffuse halo
      const haloG = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.15);
      haloG.addColorStop(0,    "rgba(255,225,160,0.13)");
      haloG.addColorStop(0.12, "rgba(255,200,120,0.07)");
      haloG.addColorStop(0.35, "rgba(140,160,255,0.03)");
      haloG.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = haloG;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.15, R * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();

      // Disk dust (faint blue-grey tint)
      const diskG = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.85);
      diskG.addColorStop(0,   "rgba(100,120,200,0.06)");
      diskG.addColorStop(0.5, "rgba(80,90,160,0.03)");
      diskG.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = diskG;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.85, R * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();

      // HII regions (screen blend so they add light)
      ctx.globalCompositeOperation = "screen";
      for (const n of hiiRegions) {
        const nx = n.x * R, ny = n.y * R;
        const rx = n.rx * R, ry = n.ry * R;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(rx, ry));
        g.addColorStop(0, `rgba(${n.c},0.22)`);
        g.addColorStop(0.5, `rgba(${n.c},0.07)`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(nx, ny, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stars (screen blend → additive light)
      for (const p of particles) {
        const tw = Math.sin(t * 0.04 * p.twinkle + p.phase);
        const a  = Math.max(0.02, p.alpha + tw * 0.14);
        const r  = Math.max(0.25, p.r * (0.88 + tw * 0.14));

        // Glow for larger stars
        if (p.r > 1.2) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
          glow.addColorStop(0, `rgba(${p.cr},${p.cg},${p.cb},${(a * 0.35).toFixed(3)})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // Central bulge glow
      const bulgeR = R * 0.18;
      const bulgeG = ctx.createRadialGradient(0, 0, 0, 0, 0, bulgeR);
      bulgeG.addColorStop(0,   "rgba(255,245,210,0.55)");
      bulgeG.addColorStop(0.15,"rgba(255,220,140,0.30)");
      bulgeG.addColorStop(0.4, "rgba(255,170,70,0.10)");
      bulgeG.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = bulgeG;
      ctx.beginPath();
      ctx.ellipse(0, 0, bulgeR, bulgeR * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      const coreR = R * 0.045;
      const coreG = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
      coreG.addColorStop(0,   "rgba(255,255,240,0.98)");
      coreG.addColorStop(0.3, "rgba(255,240,180,0.6)");
      coreG.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = coreG;
      ctx.beginPath();
      ctx.ellipse(0, 0, coreR, coreR * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── Shooting stars (screen space) ──────────────────────────────────────
      shooters = shooters.filter(sh => sh.life < sh.maxLife);
      for (const sh of shooters) {
        const prog = sh.life / sh.maxLife;
        const a = prog < 0.2 ? prog / 0.2 : prog > 0.7 ? (1 - prog) / 0.3 : 1;
        const gx = ctx.createLinearGradient(
          sh.x - sh.vx * 9, sh.y - sh.vy * 9, sh.x, sh.y
        );
        gx.addColorStop(0, "rgba(255,255,255,0)");
        gx.addColorStop(1, `rgba(220,240,255,${(a * 0.92).toFixed(3)})`);
        ctx.strokeStyle = gx;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${(a * 0.95).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
        sh.x += sh.vx; sh.y += sh.vy; sh.life++;
      }
      if (t >= nextShooter) {
        const angle = (10 + Math.random() * 35) * (Math.PI / 180);
        const speed = 8 + Math.random() * 9;
        shooters.push({
          x: Math.random() * w, y: Math.random() * h * 0.55,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 0, maxLife: 45 + Math.random() * 35,
        });
        nextShooter = t + 130 + Math.random() * 280;
      }

      galaxyAngle += 0.00022; // visibly slow drift
      t++;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none", display: "block",
      }}
    />
  );
}
