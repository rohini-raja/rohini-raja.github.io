import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const COLOR = "#ffd60a";

interface APODEntry {
  date: string;
  title: string;
  explanation: string;
  url: string;
  media_type: string;
  hdurl?: string;
}

export default function Writing({ onClose }: Props) {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<APODEntry[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=5&thumbs=true")
      .then(r => r.json())
      .then((data: APODEntry[]) => {
        setEntries(data.filter(d => d.media_type === "image").slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
            <h2 className="font-pixel" style={{ color: COLOR, fontSize: 14 }}>✍️ COSMIC STORIES</h2>
            <p className="font-mono text-xs opacity-50 mt-1" style={{ color: theme.text }}>NASA Astronomy Picture of the Day — science as prose</p>
          </div>
          <button onClick={onClose} className="font-pixel px-3 py-1 text-xs hover:scale-110 transition-all"
            style={{ border: `1px solid ${COLOR}`, color: theme.text }}>✕ EXIT</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center font-pixel py-12" style={{ fontSize: 9, color: COLOR }}>
              <div className="blink">LOADING TRANSMISSIONS...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e, i) => (
                <motion.div key={e.date}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full text-left p-4 transition-all"
                    style={{
                      border: `1px solid ${open === i ? `${COLOR}60` : `${COLOR}20`}`,
                      background: open === i ? `${COLOR}0c` : `${COLOR}04`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel" style={{ fontSize: 9, color: COLOR }}>{e.title}</span>
                      <span className="font-pixel flex-shrink-0" style={{ fontSize: 8, color: `${COLOR}60` }}>{open === i ? "▲" : "▼"}</span>
                    </div>
                    <span className="font-mono text-xs opacity-40 mt-1 block" style={{ color: theme.text }}>{e.date}</span>
                  </button>

                  <AnimatePresence>
                    {open === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div style={{ borderLeft: `2px solid ${COLOR}30`, background: `${COLOR}04` }}>
                          {e.url && (
                            <img src={e.hdurl || e.url} alt={e.title}
                              style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          )}
                          <p className="font-mono text-xs leading-relaxed p-4"
                            style={{ color: theme.text, opacity: 0.85 }}>
                            {e.explanation}
                          </p>
                          <div className="px-4 pb-3">
                            <a href={`https://apod.nasa.gov/apod/ap${e.date.replace(/-/g,"").slice(2)}.html`}
                              target="_blank" rel="noopener noreferrer"
                              className="font-pixel text-xs hover:opacity-100 transition-opacity opacity-50"
                              style={{ color: COLOR, fontSize: 8 }}>
                              → view on NASA APOD ↗
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
