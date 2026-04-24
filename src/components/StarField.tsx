import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number;
  r: number;
  speed: number;
  phase: number;
  baseAlpha: number;
  rgb: [number, number, number];
}

interface Shooter {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
}

// Warm whites, cool blues, faint reds — like real stars
const STAR_RGBS: [number,number,number][] = [
  [255,255,255], [255,253,232], [232,240,255],
  [255,214,200], [200,216,255], [170,221,255],
];

function randRgb(): [number,number,number] {
  return STAR_RGBS[Math.floor(Math.random() * STAR_RGBS.length)];
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let shooters: Shooter[] = [];
    const stars: Star[] = [];

    function W() { return canvas!.width; }
    function H() { return canvas!.height; }

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function seedStars() {
      stars.length = 0;
      const count = Math.floor((W() * H()) / 1200);
      for (let i = 0; i < count; i++) {
        const layer = Math.random();
        stars.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          r: layer < 0.6  ? Math.random() * 0.7 + 0.2
           : layer < 0.88 ? Math.random() * 1.1 + 0.7
           :                Math.random() * 1.6 + 1.2,
          speed:     0.4 + Math.random() * 2.2,
          phase:     Math.random() * Math.PI * 2,
          baseAlpha: layer < 0.6  ? 0.3  + Math.random() * 0.35
                   : layer < 0.88 ? 0.5  + Math.random() * 0.35
                   :                0.75 + Math.random() * 0.25,
          rgb: randRgb(),
        });
      }
    }

    function spawnShooter() {
      const angle = (10 + Math.random() * 40) * (Math.PI / 180);
      const speed = 8 + Math.random() * 10;
      shooters.push({
        x: Math.random() * W(),
        y: Math.random() * H() * 0.6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 30,
      });
    }

    resize();
    seedStars();
    window.addEventListener("resize", () => { resize(); seedStars(); });

    let t = 0;
    let nextShooterAt = 100 + Math.random() * 200;

    function draw() {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Deep space base
      ctx.fillStyle = "#00000f";
      ctx.fillRect(0, 0, w, h);

      // Subtle nebula washes
      const nebulae: [number,number,number,number,string][] = [
        [w*0.15, h*0.2,  w*0.55, h*0.55, "30,0,80,0.16"],
        [w*0.72, h*0.6,  w*0.45, h*0.4,  "0,20,70,0.12"],
        [w*0.45, h*0.45, w*0.6,  h*0.45, "0,35,55,0.09"],
        [w*0.28, h*0.82, w*0.38, h*0.32, "55,0,65,0.07"],
      ];
      nebulae.forEach(([cx, cy, rx, ry, rgba]) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        g.addColorStop(0, `rgba(${rgba})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Stars
      for (const s of stars) {
        const twinkle = Math.sin(t * s.speed + s.phase);
        const alpha   = Math.max(0.04, s.baseAlpha + twinkle * 0.28);
        const r       = s.r * (0.85 + twinkle * 0.18);
        const [sr, sg, sb] = s.rgb;

        // Soft glow for larger stars
        if (s.r > 1.4) {
          const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 5);
          glow.addColorStop(0, `rgba(${sr},${sg},${sb},${(alpha * 0.5).toFixed(3)})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `rgba(${sr},${sg},${sb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle on the very brightest
        if (s.r > 1.6 && alpha > 0.82) {
          ctx.strokeStyle = `rgba(${sr},${sg},${sb},${(alpha * 0.4).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - r*4, s.y); ctx.lineTo(s.x + r*4, s.y);
          ctx.moveTo(s.x, s.y - r*4); ctx.lineTo(s.x, s.y + r*4);
          ctx.stroke();
        }
      }

      // Shooting stars
      shooters = shooters.filter(sh => sh.life < sh.maxLife);
      for (const sh of shooters) {
        const p = sh.life / sh.maxLife;
        const a = p < 0.2 ? p / 0.2 : p > 0.7 ? (1 - p) / 0.3 : 1;
        const steps = Math.ceil(sh.vx ? 60 / Math.abs(sh.vx) * Math.abs(sh.vx) : 60);
        const gx = ctx.createLinearGradient(
          sh.x - sh.vx * 8, sh.y - sh.vy * 8,
          sh.x, sh.y
        );
        gx.addColorStop(0, "rgba(255,255,255,0)");
        gx.addColorStop(1, `rgba(220,240,255,${(a * 0.9).toFixed(3)})`);
        ctx.strokeStyle = gx;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sh.x - sh.vx * 8, sh.y - sh.vy * 8);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        // head dot
        ctx.fillStyle = `rgba(255,255,255,${(a * 0.95).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life++;
        void steps;
      }

      // Schedule next shooter
      if (t >= nextShooterAt) {
        spawnShooter();
        nextShooterAt = t + 120 + Math.random() * 300;
      }

      t += 1;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", seedStars);
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
