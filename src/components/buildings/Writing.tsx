import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const ENTRIES = [
  {
    title: "On doing things badly at first",
    date: "2024-11",
    tag: "reflection",
    body: "Every skill I have started as embarrassment. Bad code, awkward sentences, wrong notes on a keyboard. The thing nobody tells you is that doing it badly is not the price you pay to get good — it is how getting good actually works.",
  },
  {
    title: "What stargazing taught me about patience",
    date: "2024-08",
    tag: "nature",
    body: "You cannot rush a meteor shower. You sit, your eyes adjust, and then the sky starts performing. Most worthwhile things in life require the same thing: showing up, going dark, and waiting for your eyes to adjust.",
  },
  {
    title: "Why I keep a paper journal in 2024",
    date: "2024-06",
    tag: "habits",
    body: "Typing feels like talking to a machine. Writing by hand feels like talking to myself. The slowness is the point — it filters out the noise and leaves only what actually matters.",
  },
  {
    title: "Travel as translation",
    date: "2023-12",
    tag: "travel",
    body: "Every new place teaches you a new word for something you thought was universal. Coorg taught me that 'morning' could smell like cardamom and mist. Hampi taught me that 'old' could feel like another planet.",
  },
];

const TAG_COLORS: Record<string, string> = {
  reflection: "#c77dff",
  nature:     "#52b788",
  habits:     "#ffd60a",
  travel:     "#48cae4",
};

export default function Writing({ onClose }: Props) {
  const { theme } = useTheme();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ background: theme.panel, border: `3px solid #ffd60a`, boxShadow: `0 0 40px #ffd60a40` }}>

        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: theme.panel, borderBottom: `2px solid #ffd60a50` }}>
          <div>
            <h2 className="font-pixel" style={{ color: "#ffd60a", fontSize: 14 }}>✍️ SCRIPTORIUM</h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>Things I wrote down</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs transition-all hover:scale-110"
            style={{ border: `1px solid #ffd60a`, color: theme.text }}>✕ EXIT</button>
        </div>

        <div className="p-6 space-y-3">
          {ENTRIES.map((e, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-4 transition-all"
                style={{
                  border: `1px solid ${open === i ? "#ffd60a60" : "#ffd60a20"}`,
                  background: open === i ? "#ffd60a0c" : "#ffd60a05",
                }}>
                <div className="flex items-center justify-between">
                  <span className="font-pixel" style={{ fontSize: 9, color: "#ffd60a" }}>{e.title}</span>
                  <span className="font-pixel text-xs" style={{ color: "#ffd60a60" }}>{open === i ? "▲" : "▼"}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-xs opacity-40" style={{ color: theme.text }}>{e.date}</span>
                  <span className="font-pixel px-2 py-0.5" style={{
                    fontSize: 7, color: TAG_COLORS[e.tag] ?? theme.accent,
                    border: `1px solid ${TAG_COLORS[e.tag] ?? theme.accent}50`,
                  }}>{e.tag}</span>
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden">
                    <p className="font-mono text-sm leading-relaxed px-4 py-4"
                      style={{ color: theme.text, opacity: 0.85, borderLeft: `2px solid #ffd60a30` }}>
                      {e.body}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          <p className="font-mono text-xs text-center opacity-30 pt-4" style={{ color: theme.text }}>
            — more entries brewing —
          </p>
        </div>
      </div>
    </motion.div>
  );
}
