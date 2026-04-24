import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

interface ISSPos { latitude: number; longitude: number; altitude: number; velocity: number }
interface Astronaut { name: string; craft: string }
interface NEO { name: string; estimated_diameter: { kilometers: { estimated_diameter_max: number } }; is_potentially_hazardous_asteroid: boolean; close_approach_data: Array<{ miss_distance: { kilometers: string }; close_approach_date: string }> }

const COLOR = "#90e0ef";

export default function Skygazing({ onClose }: Props) {
  const { theme } = useTheme();
  const [iss, setIss]           = useState<ISSPos | null>(null);
  const [crew, setCrew]         = useState<Astronaut[]>([]);
  const [neos, setNeos]         = useState<NEO[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      fetch("https://api.wheretheiss.at/v1/satellites/25544").then(r => r.json()),
      fetch("https://api.open-notify.org/astros.json").then(r => r.json()),
      fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=DEMO_KEY`).then(r => r.json()),
    ]).then(([issData, astroData, neoData]) => {
      setIss(issData);
      setCrew((astroData.people ?? []).filter((p: Astronaut) => p.craft === "ISS"));
      const allNeos: NEO[] = Object.values(neoData.near_earth_objects ?? {}).flat() as NEO[];
      setNeos(allNeos.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
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
            <h2 className="font-pixel" style={{ color: COLOR, fontSize: 14 }}>🔭 LIVE SKY DATA</h2>
            <p className="font-mono text-xs opacity-50 mt-1" style={{ color: theme.text }}>Real-time from NASA & wheretheiss.at</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs hover:scale-110 transition-all"
            style={{ border: `1px solid ${COLOR}`, color: theme.text }}>✕ EXIT</button>
        </div>

        {loading ? (
          <div className="p-12 text-center font-pixel" style={{ fontSize: 9, color: COLOR }}>
            <div className="blink">SCANNING SKY...</div>
          </div>
        ) : (
          <div className="p-6 space-y-6">

            {/* ISS Live Position */}
            {iss && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="font-pixel mb-3" style={{ fontSize: 8, color: COLOR }}>// ISS LIVE POSITION</p>
                <div className="p-4 font-mono text-xs space-y-2" style={{ background: "#0a0a1e", border: `1px solid ${COLOR}20` }}>
                  <div className="flex justify-between">
                    <span style={{ color: COLOR }}>LATITUDE</span>
                    <span style={{ color: theme.text }}>{iss.latitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLOR }}>LONGITUDE</span>
                    <span style={{ color: theme.text }}>{iss.longitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLOR }}>ALTITUDE</span>
                    <span style={{ color: theme.text }}>{iss.altitude.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLOR }}>VELOCITY</span>
                    <span style={{ color: theme.text }}>{iss.velocity.toFixed(0)} km/h</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Crew */}
            {crew.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="font-pixel mb-3" style={{ fontSize: 8, color: COLOR }}>// HUMANS IN ORBIT RIGHT NOW</p>
                <div className="space-y-2">
                  {crew.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-2"
                      style={{ border: `1px solid ${COLOR}15`, background: `${COLOR}06` }}>
                      <span style={{ color: COLOR }}>👨‍🚀</span>
                      <span className="font-mono text-xs" style={{ color: theme.text }}>{p.name}</span>
                      <span className="font-pixel ml-auto" style={{ fontSize: 7, color: `${COLOR}80` }}>{p.craft}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Near-Earth Objects */}
            {neos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p className="font-pixel mb-3" style={{ fontSize: 8, color: COLOR }}>// NEAR-EARTH ASTEROIDS TODAY</p>
                <div className="space-y-2">
                  {neos.map((neo, i) => {
                    const dia = neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2);
                    const miss = parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers ?? "0").toLocaleString();
                    const hazard = neo.is_potentially_hazardous_asteroid;
                    return (
                      <div key={i} className="p-3 font-mono text-xs"
                        style={{ border: `1px solid ${hazard ? "#ff444420" : `${COLOR}15`}`, background: hazard ? "#ff000008" : `${COLOR}04` }}>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: hazard ? "#ff6666" : COLOR }}>{neo.name.replace(/[()]/g,"")}</span>
                          {hazard && <span style={{ color: "#ff6666", fontSize: 7 }} className="font-pixel">⚠ HAZARDOUS</span>}
                        </div>
                        <span style={{ color: theme.text, opacity: 0.6 }}>Ø {dia} km · miss {miss} km</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
