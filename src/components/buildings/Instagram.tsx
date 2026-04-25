import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props { onClose: () => void }

const COLOR = "#e1306c";
const GRADIENT = "linear-gradient(135deg, #833ab4 0%, #e1306c 50%, #f77737 100%)";

export default function Instagram({ onClose }: Props) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
    >
      <div className="relative w-full max-w-sm"
        style={{
          background: theme.panel,
          border: `2px solid ${COLOR}60`,
          boxShadow: `0 0 60px ${COLOR}30, 0 0 120px #833ab430`,
          borderRadius: 16,
          overflow: "hidden",
        }}>

        {/* Header bar */}
        <div style={{
          background: GRADIENT,
          padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>📸</span>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 13, color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "0.04em" }}>
                @curiously.roo
              </p>
              <p style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Instagram
              </p>
            </div>
          </div>
          <button onClick={onClose}
            style={{
              fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.8)",
              background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            }}>✕</button>
        </div>

        <div style={{ padding: "24px 24px 20px" }}>
          {/* Profile visual */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
              background: GRADIENT,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
              boxShadow: `0 0 24px ${COLOR}50`,
            }}>🌸</div>
            <p style={{ fontFamily: "monospace", fontSize: 14, color: theme.text, margin: "0 0 4px", fontWeight: 700 }}>
              curiously.roo
            </p>
            <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
              curious by nature · sharing things that spark joy
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `${COLOR}25`, marginBottom: 20 }} />

          {/* CTA */}
          <a
            href="https://www.instagram.com/curiously.roo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", width: "100%",
              background: GRADIENT,
              color: "#fff", textDecoration: "none",
              fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
              textAlign: "center", padding: "12px 0",
              borderRadius: 8,
              boxShadow: `0 4px 20px ${COLOR}40`,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            VIEW ON INSTAGRAM ↗
          </a>

          <p style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", margin: "14px 0 0" }}>
            opens in a new tab
          </p>
        </div>
      </div>
    </motion.div>
  );
}
