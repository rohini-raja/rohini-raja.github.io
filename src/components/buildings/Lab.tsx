import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { PROJECTS } from "../../data/projects";

interface Props {
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  live: "🟢 LIVE",
  wip: "🟡 WIP",
  archived: "⚫ ARCHIVED",
};

export default function Lab({ onClose }: Props) {
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
              🔬 LAB
            </h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>
              Things I've built
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
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="p-5"
              style={{
                border: `2px solid ${project.color}40`,
                background: `${project.color}08`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 28 }}>{project.emoji}</span>
                  <div>
                    <h3 className="font-pixel" style={{ fontSize: 11, color: theme.accent }}>
                      {project.name}
                    </h3>
                    <p className="font-mono text-xs opacity-60" style={{ color: theme.text }}>
                      {project.tagline}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs" style={{ color: project.color, whiteSpace: "nowrap" }}>
                  {STATUS_LABEL[project.status]}
                </span>
              </div>

              <p className="font-mono text-xs leading-relaxed mb-4" style={{ color: theme.text, opacity: 0.8 }}>
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="font-pixel px-2 py-0.5"
                    style={{
                      fontSize: 7,
                      border: `1px solid ${project.color}60`,
                      color: project.color,
                      background: `${project.color}10`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel px-3 py-1 text-xs transition-all hover:scale-105"
                    style={{
                      fontSize: 8,
                      border: `1px solid ${project.color}`,
                      color: project.color,
                      background: `${project.color}15`,
                    }}
                  >
                    → VISIT
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel px-3 py-1 text-xs transition-all hover:scale-105"
                    style={{
                      fontSize: 8,
                      border: `1px solid ${theme.panelBorder}40`,
                      color: theme.text,
                      opacity: 0.7,
                    }}
                  >
                    → GITHUB
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
