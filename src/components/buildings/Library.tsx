import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { BOOKS } from "../../data/books";

interface Props {
  onClose: () => void;
}

function StarRating({ n }: { n: number }) {
  const { theme } = useTheme();
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= n ? "#ffd700" : theme.panelBorder, opacity: i <= n ? 1 : 0.3 }}>★</span>
      ))}
    </span>
  );
}

export default function Library({ onClose }: Props) {
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
            <h2 className="font-pixel text-lg" style={{ color: theme.accent, fontSize: 14 }}>
              📚 LIBRARY
            </h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>
              Books that shaped me
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

        {/* Books */}
        <div className="p-6 space-y-6">
          {BOOKS.map((book, i) => (
            <motion.div
              key={book.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-4"
              style={{ border: `1px solid ${theme.panelBorder}30`, background: `${book.color}10` }}
            >
              {/* Spine */}
              <div
                className="w-3 flex-shrink-0 rounded-sm"
                style={{ background: book.color, minHeight: 80 }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-pixel leading-relaxed" style={{ fontSize: 10, color: theme.accent }}>
                    {book.title}
                  </h3>
                  <StarRating n={book.rating} />
                </div>
                <p className="font-mono text-xs opacity-60 mb-2" style={{ color: theme.text }}>
                  by {book.author}
                </p>
                <p className="font-mono text-xs leading-relaxed" style={{ color: theme.text, opacity: 0.8 }}>
                  {book.note}
                </p>
                {book.link && (
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 font-pixel text-xs opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: theme.accent, fontSize: 8 }}
                  >
                    → view on goodreads
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {/* Goodreads shelf link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-4"
            style={{ borderTop: `1px solid ${theme.panelBorder}30` }}
          >
            <p className="font-mono text-xs opacity-50 mb-2" style={{ color: theme.text }}>
              Full shelf on Goodreads
            </p>
            <a
              href="https://www.goodreads.com/rohini-raja"
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-xs px-4 py-2 inline-block transition-all hover:scale-105"
              style={{
                border: `1px solid ${theme.accent}`,
                color: theme.accent,
                fontSize: 9,
                background: `${theme.accent}10`,
              }}
            >
              📖 SEE ALL BOOKS
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
