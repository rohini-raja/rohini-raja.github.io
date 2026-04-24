import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const VISITED = [
  { place: "Coorg, India", flag: "🌿", note: "Misty coffee hills, the kind of quiet that resets everything." },
  { place: "Hampi, India", flag: "🪨", note: "Ancient ruins in a surreal boulder landscape. Time feels different here." },
  { place: "Pondicherry, India", flag: "🌊", note: "French colonial streets, the sea at dawn, existential peace." },
  { place: "Ooty, India", flag: "🚂", note: "Toy train through the Nilgiris. Windows down, tea in hand." },
  { place: "Mysore, India", flag: "🏰", note: "Palace lights on Sunday evenings — I could watch it for hours." },
];

const WISHLIST = [
  { place: "Patagonia, Argentina", flag: "🏔️", note: "Torres del Paine. End of the world energy." },
  { place: "Kyoto, Japan", flag: "🍁", note: "Autumn leaves in Arashiyama. My most-wanted season." },
  { place: "Iceland", flag: "🌋", note: "Midnight sun, northern lights, and absolute geological drama." },
  { place: "Varanasi, India", flag: "🕯️", note: "The Ganga aarti at dusk. Something I keep postponing." },
  { place: "Sahara Desert", flag: "🏜️", note: "Sleep under stars with zero light pollution. One day." },
];

export default function Travel({ onClose }: Props) {
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
        style={{ background: theme.panel, border: `3px solid #52b788`, boxShadow: `0 0 40px #52b78840` }}>

        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: theme.panel, borderBottom: `2px solid #52b78850` }}>
          <div>
            <h2 className="font-pixel" style={{ color: "#52b788", fontSize: 14 }}>🌏 ATLAS</h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>Places that changed me</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs transition-all hover:scale-110"
            style={{ border: `1px solid #52b788`, color: theme.text }}>✕ EXIT</button>
        </div>

        <div className="p-6">
          <p className="font-pixel mb-4" style={{ fontSize: 8, color: "#52b788" }}>// BEEN THERE</p>
          <div className="space-y-3 mb-8">
            {VISITED.map((v, i) => (
              <motion.div key={v.place}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex gap-3 p-3"
                style={{ border: `1px solid #52b78820`, background: "#52b78808" }}>
                <span className="text-xl flex-shrink-0">{v.flag}</span>
                <div>
                  <p className="font-pixel mb-1" style={{ fontSize: 9, color: "#52b788" }}>{v.place}</p>
                  <p className="font-mono text-xs opacity-70" style={{ color: theme.text }}>{v.note}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="font-pixel mb-4" style={{ fontSize: 8, color: "#52b788" }}>// NEXT COORDINATES</p>
          <div className="space-y-3">
            {WISHLIST.map((w, i) => (
              <motion.div key={w.place}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                className="flex gap-3 p-3"
                style={{ border: `1px dashed #52b78828`, background: "#52b78804", opacity: 0.85 }}>
                <span className="text-xl flex-shrink-0">{w.flag}</span>
                <div>
                  <p className="font-pixel mb-1" style={{ fontSize: 9, color: "#52b78888" }}>{w.place}</p>
                  <p className="font-mono text-xs opacity-60" style={{ color: theme.text }}>{w.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
