import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const COLOR = "#ff6b9d";

interface NASAVideo {
  nasa_id: string;
  title: string;
  description: string;
  date_created: string;
  thumb?: string;
  href: string;
}

export default function Cinema({ onClose }: Props) {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<NASAVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://images-api.nasa.gov/search?q=space+exploration+mission&media_type=video&page_size=9")
      .then(r => r.json())
      .then((data: { collection: { items: Array<{ href: string; data: Array<{ nasa_id: string; title: string; description: string; date_created: string }>; links?: Array<{ href: string; rel: string }> }> } }) => {
        const items = data.collection?.items ?? [];
        const parsed: NASAVideo[] = items.map(item => ({
          nasa_id:      item.data[0]?.nasa_id ?? "",
          title:        item.data[0]?.title ?? "",
          description:  item.data[0]?.description ?? "",
          date_created: item.data[0]?.date_created?.slice(0, 10) ?? "",
          thumb:        item.links?.find(l => l.rel === "preview")?.href,
          href:         item.href,
        }));
        setVideos(parsed.filter(v => v.title));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openVideo = (v: NASAVideo) => {
    window.open(`https://images.nasa.gov/details/${v.nasa_id}`, "_blank", "noopener");
  };

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
            <h2 className="font-pixel" style={{ color: COLOR, fontSize: 14 }}>🎬 NASA VIDEO VAULT</h2>
            <p className="font-mono text-xs opacity-50 mt-1" style={{ color: theme.text }}>Real mission footage from NASA Image Library</p>
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
            <>
              <p className="font-pixel mb-4" style={{ fontSize: 8, color: COLOR }}>// CLICK TO WATCH ON NASA ↗</p>
              <div className="grid grid-cols-1 gap-3">
                {videos.map((v, i) => (
                  <motion.button
                    key={v.nasa_id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => openVideo(v)}
                    className="text-left flex gap-3 p-3 w-full transition-all hover:scale-[1.01]"
                    style={{ border: `1px solid ${COLOR}20`, background: `${COLOR}06` }}
                  >
                    {v.thumb ? (
                      <img src={v.thumb} alt={v.title}
                        style={{ width: 80, height: 54, objectFit: "cover", flexShrink: 0, background: "#000" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div style={{ width: 80, height: 54, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 24 }}>🎬</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-pixel mb-1 leading-relaxed" style={{ fontSize: 8, color: COLOR }}>
                        {v.title.length > 60 ? v.title.slice(0, 60) + "…" : v.title}
                      </p>
                      <p className="font-mono text-xs opacity-40" style={{ color: theme.text }}>{v.date_created}</p>
                      <p className="font-mono text-xs opacity-60 mt-1 line-clamp-2 leading-relaxed" style={{ color: theme.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {v.description?.slice(0, 120)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
