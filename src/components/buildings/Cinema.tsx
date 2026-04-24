import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const SHOWS = [
  { title: "Severance",        year: "2022–",   type: "show",  rating: 5, note: "What if your work-self and personal-self were literally different people? Apple TV's most unsettling premise." },
  { title: "Dark",             year: "2017–20", type: "show",  rating: 5, note: "German time-travel masterpiece. Rewatch-required. Ends perfectly." },
  { title: "Panchayat",        year: "2020–",   type: "show",  rating: 5, note: "Quietly the most human show on Indian streaming. Slow burn, big heart." },
  { title: "The Bear",         year: "2022–",   type: "show",  rating: 5, note: "Season 1 finale is the most stressful single episode of television I've watched." },
  { title: "Interstellar",     year: "2014",    type: "film",  rating: 5, note: "IMAX. Hans Zimmer. Tessaracts. The dock scene wrecks me every time." },
  { title: "Dune: Part Two",   year: "2024",    type: "film",  rating: 5, note: "Villeneuve built a religion and I joined it." },
  { title: "Vikram Vedha",     year: "2017",    type: "film",  rating: 5, note: "The Tamil original. Madhavan and Vijay Sethupathi at peak form. Storytelling as chess." },
  { title: "Arrival",          year: "2016",    type: "film",  rating: 5, note: "The film that made me think about language, time, and grief differently." },
  { title: "Scam 1992",        year: "2020",    type: "show",  rating: 5, note: "Harshad Mehta's story told with such craft. Pratik Gandhi is extraordinary." },
];

const TYPE_COLOR = { show: "#ff6b9d", film: "#c77dff" };

export default function Cinema({ onClose }: Props) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<"all" | "show" | "film">("all");

  const visible = SHOWS.filter(s => filter === "all" || s.type === filter);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ background: theme.panel, border: `3px solid #ff6b9d`, boxShadow: `0 0 40px #ff6b9d40` }}>

        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: theme.panel, borderBottom: `2px solid #ff6b9d50` }}>
          <div>
            <h2 className="font-pixel" style={{ color: "#ff6b9d", fontSize: 14 }}>🎬 SCREENIX</h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>My personal hall of fame</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs transition-all hover:scale-110"
            style={{ border: `1px solid #ff6b9d`, color: theme.text }}>✕ EXIT</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {(["all", "show", "film"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-pixel px-3 py-1 transition-all"
              style={{
                fontSize: 8,
                color: filter === f ? "#ff6b9d" : theme.text,
                border: `1px solid ${filter === f ? "#ff6b9d" : "#ff6b9d30"}`,
                background: filter === f ? "#ff6b9d15" : "transparent",
              }}>
              {f === "all" ? "ALL" : f === "show" ? "SHOWS" : "FILMS"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-3">
          {visible.map((s, i) => (
            <motion.div key={s.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="p-4"
              style={{ border: `1px solid #ff6b9d20`, background: "#ff6b9d06" }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-pixel" style={{ fontSize: 9, color: "#ff6b9d" }}>{s.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs opacity-40" style={{ color: theme.text }}>{s.year}</span>
                  <span className="font-pixel px-1.5 py-0.5" style={{
                    fontSize: 7,
                    color: TYPE_COLOR[s.type as keyof typeof TYPE_COLOR],
                    border: `1px solid ${TYPE_COLOR[s.type as keyof typeof TYPE_COLOR]}50`,
                  }}>{s.type}</span>
                </div>
              </div>
              <div className="mb-1">
                {"★".repeat(s.rating).split("").map((_, j) => (
                  <span key={j} style={{ color: "#ffd700", fontSize: 10 }}>★</span>
                ))}
              </div>
              <p className="font-mono text-xs opacity-70 leading-relaxed" style={{ color: theme.text }}>{s.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
