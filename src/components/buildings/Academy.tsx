import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { STUDIES } from "../../data/studies";

interface Props {
  onClose: () => void;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  done: { label: "✓ READ", color: "#4caf50" },
  reading: { label: "▶ READING", color: "#ff9800" },
  queued: { label: "◯ QUEUED", color: "#9e9e9e" },
};

const TYPE_ICON: Record<string, string> = {
  paper: "📄",
  book: "📚",
  course: "🎓",
  topic: "💡",
};

export default function Academy({ onClose }: Props) {
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
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto"
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
              🎓 ACADEMY
            </h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>
              Papers &amp; concepts I'm exploring
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

        <div className="p-6 space-y-4">
          {/* Progress bar header */}
          <div className="flex gap-6 font-mono text-xs mb-2 opacity-60" style={{ color: theme.text }}>
            <span>
              ✓ {STUDIES.filter((s) => s.status === "done").length} read
            </span>
            <span>
              ▶ {STUDIES.filter((s) => s.status === "reading").length} in progress
            </span>
            <span>
              ◯ {STUDIES.filter((s) => s.status === "queued").length} queued
            </span>
          </div>

          {STUDIES.map((study, i) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4"
              style={{
                border: `1px solid ${study.color}30`,
                background: study.status === "done" ? `${study.color}08` : "transparent",
                opacity: study.status === "queued" ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span>{TYPE_ICON[study.type]}</span>
                  <h3 className="font-pixel leading-relaxed" style={{ fontSize: 9, color: study.status === "done" ? theme.accent : theme.text }}>
                    {study.title}
                  </h3>
                </div>
                <span
                  className="font-pixel flex-shrink-0"
                  style={{
                    fontSize: 7,
                    color: STATUS_BADGE[study.status].color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {STATUS_BADGE[study.status].label}
                </span>
              </div>

              <p className="font-mono text-xs leading-relaxed mb-3" style={{ color: theme.text, opacity: 0.7 }}>
                {study.summary}
              </p>

              <div className="flex items-center justify-between">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {study.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-pixel px-1.5 py-0.5"
                      style={{
                        fontSize: 6,
                        border: `1px solid ${study.color}40`,
                        color: study.color,
                        opacity: 0.8,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {study.link && (
                  <a
                    href={study.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel text-xs transition-opacity hover:opacity-100 opacity-60"
                    style={{ fontSize: 8, color: study.color }}
                  >
                    → PDF
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {/* Add more placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 text-center"
            style={{
              border: `1px dashed ${theme.panelBorder}40`,
              opacity: 0.4,
            }}
          >
            <p className="font-pixel" style={{ fontSize: 8, color: theme.text }}>
              + more coming soon
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
