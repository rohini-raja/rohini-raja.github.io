import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const OBJECTS = [
  { name: "Orion Nebula", id: "M42", emoji: "✨", note: "The stellar nursery that makes me feel small in the best way. Visible to the naked eye on a clear night." },
  { name: "Andromeda Galaxy", id: "M31", emoji: "🌌", note: "Our nearest galactic neighbour, 2.5 million light-years away. Looking at it is looking into the past." },
  { name: "The Pleiades", id: "M45", emoji: "💫", note: "Seven sisters. Ancient cultures across the world built calendars around them. I could stare all night." },
  { name: "Saturn's rings", id: "Saturn", emoji: "🪐", note: "First time I saw it through a telescope I gasped. No photo prepares you for the real thing." },
  { name: "Milky Way core", id: "Sagittarius", emoji: "🌠", note: "That dense, glowing band on a moonless night far from city lights — nothing compares." },
  { name: "ISS passing over", id: "ISS", emoji: "🛰️", note: "A bright dot crossing the sky in 6 minutes. Humans are up there right now. Wild." },
];

const FACTS = [
  "Light from the Sun takes ~8 minutes to reach us",
  "There are more stars than grains of sand on Earth",
  "The Voyager 1 probe is still transmitting from 24 billion km away",
  "A day on Venus is longer than its year",
];

export default function Skygazing({ onClose }: Props) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ background: theme.panel, border: `3px solid #90e0ef`, boxShadow: `0 0 40px #90e0ef40` }}>

        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: theme.panel, borderBottom: `2px solid #90e0ef50` }}>
          <div>
            <h2 className="font-pixel" style={{ color: "#90e0ef", fontSize: 14 }}>🔭 OBSERVATORY</h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>Things I find in the dark</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs transition-all hover:scale-110"
            style={{ border: `1px solid #90e0ef`, color: theme.text }}>✕ EXIT</button>
        </div>

        <div className="p-6 space-y-4">
          <p className="font-pixel text-center mb-6" style={{ fontSize: 8, color: "#90e0ef", opacity: 0.7 }}>
            — FAVOURITE TARGETS —
          </p>

          {OBJECTS.map((obj, i) => (
            <motion.div key={obj.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-4"
              style={{ border: `1px solid #90e0ef20`, background: "#90e0ef08" }}>
              <div className="text-2xl flex-shrink-0 mt-1">{obj.emoji}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-pixel" style={{ fontSize: 9, color: "#90e0ef" }}>{obj.name}</h3>
                  <span className="font-mono text-xs opacity-40" style={{ color: theme.text }}>{obj.id}</span>
                </div>
                <p className="font-mono text-xs leading-relaxed" style={{ color: theme.text, opacity: 0.8 }}>{obj.note}</p>
              </div>
            </motion.div>
          ))}

          <div className="mt-6 p-4" style={{ border: `1px solid #90e0ef20`, background: "#0a0a1e" }}>
            <p className="font-pixel mb-3" style={{ fontSize: 8, color: "#90e0ef" }}>// COSMIC FACTS</p>
            {FACTS.map((f, i) => (
              <p key={i} className="font-mono text-xs mb-2 opacity-70" style={{ color: theme.text }}>
                <span style={{ color: "#90e0ef" }}>›</span> {f}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
