import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const COLOR = "#52b788";

const LOCATIONS = [
  { name: "Amazon Rainforest", lat: -3.4653, lon: -62.2159, emoji: "🌿" },
  { name: "Himalayas", lat: 27.9881, lon: 86.9250, emoji: "🏔️" },
  { name: "Sahara Desert", lat: 23.4162, lon: 25.6628, emoji: "🏜️" },
  { name: "Great Barrier Reef", lat: -18.2871, lon: 147.6992, emoji: "🐠" },
  { name: "Aurora Zone, Norway", lat: 69.6496, lon: 18.9560, emoji: "🌌" },
  { name: "Grand Canyon", lat: 36.1069, lon: -112.1129, emoji: "🏜️" },
];

export default function Travel({ onClose }: Props) {
  const { theme } = useTheme();
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let done = 0;
    const results: Record<string, string> = {};

    LOCATIONS.forEach(loc => {
      const url = `https://api.nasa.gov/planetary/earth/imagery?lat=${loc.lat}&lon=${loc.lon}&dim=0.1&date=${today}&api_key=DEMO_KEY`;
      // Store the direct image URL — NASA returns a PNG directly
      results[loc.name] = url;
      done++;
      if (done === LOCATIONS.length) {
        setImages(results);
        setLoading(false);
      }
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ background: theme.panel, border: `3px solid ${COLOR}`, boxShadow: `0 0 40px ${COLOR}40` }}>

        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: theme.panel, borderBottom: `2px solid ${COLOR}40` }}>
          <div>
            <h2 className="font-pixel" style={{ color: COLOR, fontSize: 14 }}>🌏 EARTH FROM ORBIT</h2>
            <p className="font-mono text-xs opacity-50 mt-1" style={{ color: theme.text }}>NASA Earth Observatory — live satellite imagery</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs hover:scale-110 transition-all"
            style={{ border: `1px solid ${COLOR}`, color: theme.text }}>✕ EXIT</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center font-pixel py-12" style={{ fontSize: 9, color: COLOR }}>
              <div className="blink">ACQUIRING SATELLITE LOCK...</div>
            </div>
          ) : (
            <>
              <p className="font-pixel mb-4" style={{ fontSize: 8, color: COLOR }}>// SELECT A LOCATION</p>
              <div className="grid grid-cols-2 gap-3">
                {LOCATIONS.map((loc, i) => (
                  <motion.button
                    key={loc.name}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                    onClick={() => setActive(active === loc.name ? null : loc.name)}
                    className="text-left p-3 transition-all"
                    style={{
                      border: `1px solid ${active === loc.name ? COLOR : `${COLOR}30`}`,
                      background: active === loc.name ? `${COLOR}15` : `${COLOR}05`,
                    }}
                  >
                    <span className="text-lg block mb-1">{loc.emoji}</span>
                    <span className="font-pixel block" style={{ fontSize: 7, color: COLOR }}>{loc.name}</span>
                    <span className="font-mono text-xs opacity-40 block mt-0.5" style={{ color: theme.text }}>
                      {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                    </span>
                  </motion.button>
                ))}
              </div>

              {active && images[active] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 overflow-hidden"
                >
                  <p className="font-pixel mb-2" style={{ fontSize: 8, color: COLOR }}>// SATELLITE VIEW: {active.toUpperCase()}</p>
                  <div style={{ position: "relative", width: "100%", paddingTop: "100%", background: "#000" }}>
                    <img
                      src={images[active]}
                      alt={active}
                      style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        imageRendering: "pixelated",
                      }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{
                      position: "absolute", bottom: 8, right: 8,
                      fontFamily: "monospace", fontSize: 9, color: `${COLOR}cc`,
                      background: "rgba(0,0,0,0.6)", padding: "2px 6px",
                    }}>NASA Earth Observatory</div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
