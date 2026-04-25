import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "../lib/themes";
import { useTheme } from "../lib/ThemeContext";

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Change theme"
        style={{
          width: 34, height: 34,
          borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.55)",
          fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = "rgba(255,255,255,0.11)";
          el.style.borderColor = "rgba(255,255,255,0.22)";
          el.style.color = "rgba(255,255,255,0.85)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = "rgba(255,255,255,0.06)";
          el.style.borderColor = "rgba(255,255,255,0.12)";
          el.style.color = "rgba(255,255,255,0.55)";
        }}
      >
        🎨
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: 42, right: 0,
              width: 180, padding: "10px 8px",
              background: "rgba(6,8,20,0.88)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <p style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.2em", marginBottom: 8, paddingLeft: 6 }}>
              THEME
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px", textAlign: "left",
                    borderRadius: 6, cursor: "pointer",
                    background: t.id === theme.id ? `${t.accent}18` : "transparent",
                    border: t.id === theme.id ? `1px solid ${t.accent}50` : "1px solid transparent",
                    color: t.id === theme.id ? "#fff" : "rgba(255,255,255,0.5)",
                    fontFamily: "monospace", fontSize: 11,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => {
                    if (t.id !== theme.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (t.id !== theme.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                    }
                  }}
                >
                  <span style={{ fontSize: 13 }}>{t.emoji}</span>
                  <span>{t.name}</span>
                  {t.id === theme.id && (
                    <span style={{ marginLeft: "auto", fontSize: 10, color: t.accent }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
