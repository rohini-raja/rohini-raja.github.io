import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props {
  onClose: () => void;
}

const EASTER_EGGS = [
  {
    trigger: "↑ ↑ ↓ ↓ ← → ← → B A",
    hint: "A classic code unlocks something special...",
    color: "#ff6b6b",
  },
  {
    trigger: "sudo hire rohini",
    hint: "Type in your browser console",
    color: "#4ecdc4",
  },
  {
    trigger: "Idle for 30s",
    hint: "Watch the character do something unexpected",
    color: "#ffe66d",
  },
];

const FUN_FACTS = [
  "Built my first React app at 2am with 3 browser tabs open",
  "Can read pixel fonts faster than regular fonts now",
  "The Naruto task manager was inspired by actual productivity struggles",
  "Focus Flight exists because I kept losing track of deep work sessions",
  "Goodreads profile has 200+ books marked",
  "Learning distributed systems through paper reading in 2024",
];

export default function Arcade({ onClose }: Props) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto"
        style={{
          background: theme.panel,
          border: `3px solid ${theme.panelBorder}`,
          boxShadow: `0 0 40px ${theme.accent}40`,
        }}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: theme.panel, borderBottom: `2px solid ${theme.panelBorder}` }}>
          <div>
            <h2 className="font-pixel" style={{ color: theme.accent, fontSize: 14 }}>
              🕹️ ARCADE
            </h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>
              Easter eggs &amp; fun corners
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-pixel px-3 py-1 text-xs transition-all hover:scale-110"
            style={{ border: `1px solid ${theme.panelBorder}`, color: theme.text }}
          >
            ✕ EXIT
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Easter eggs */}
          <div>
            <h3 className="font-pixel mb-3" style={{ fontSize: 9, color: theme.accent }}>
              HIDDEN CODES
            </h3>
            <div className="space-y-3">
              {EASTER_EGGS.map((egg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3"
                  style={{ border: `1px solid ${egg.color}30`, background: `${egg.color}08` }}
                >
                  <span style={{ color: egg.color, fontSize: 16 }}>✦</span>
                  <div>
                    <p className="font-pixel mb-1" style={{ fontSize: 8, color: egg.color }}>
                      {egg.trigger}
                    </p>
                    <p className="font-mono text-xs opacity-60" style={{ color: theme.text }}>
                      {egg.hint}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fun facts */}
          <div>
            <h3 className="font-pixel mb-3" style={{ fontSize: 9, color: theme.accent }}>
              RANDOM.EXE
            </h3>
            <div className="space-y-2">
              {FUN_FACTS.map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-2 font-mono text-xs"
                  style={{ color: theme.text }}
                >
                  <span style={{ color: theme.accent, opacity: 0.6 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="opacity-70">{fact}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-3 font-mono text-xs"
            style={{
              border: `1px solid ${theme.panelBorder}20`,
              color: theme.text,
              opacity: 0.5,
            }}
          >
            <p className="font-pixel mb-2" style={{ fontSize: 7 }}>CONTROLS</p>
            <p>Arrow keys / WASD — move character</p>
            <p>Enter / Space — enter building</p>
            <p>Esc — exit building</p>
            <p>Drag the tamagotchi — it goes where you go</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
