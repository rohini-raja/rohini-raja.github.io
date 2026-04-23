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
        className="w-10 h-10 rounded-none font-pixel text-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{
          background: theme.panel,
          border: `2px solid ${theme.accent}`,
          boxShadow: `0 0 12px ${theme.accent}40`,
          color: theme.text,
        }}
        title="Change theme"
      >
        🎨
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 right-0 p-3 w-52"
            style={{
              background: theme.panel,
              border: `2px solid ${theme.panelBorder}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="font-pixel text-xs mb-3 opacity-70" style={{ color: theme.text }}>
              PALETTE
            </p>
            <div className="space-y-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-all"
                  style={{
                    background: t.id === theme.id ? `${t.accent}20` : "transparent",
                    border: t.id === theme.id ? `1px solid ${t.accent}` : "1px solid transparent",
                    color: theme.text,
                  }}
                >
                  <span>{t.emoji}</span>
                  <span className="font-mono text-xs">{t.name}</span>
                  {t.id === theme.id && (
                    <span className="ml-auto text-xs" style={{ color: t.accent }}>✓</span>
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
