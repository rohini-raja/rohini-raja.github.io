import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";

interface Props {
  onClose: () => void;
}

const PUZZLE_ANSWER = "karna";

export default function Shrine({ onClose }: Props) {
  const { theme } = useTheme();
  const [answer, setAnswer] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const checkPuzzle = () => {
    if (answer.toLowerCase().trim() === PUZZLE_ANSWER) {
      setUnlocked(true);
      setWrong(false);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1500);
    }
  };

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:rohini.raja@example.com?subject=Hello from your portfolio&body=${encodeURIComponent(`From: ${name}\n\n${msg}`)}`;
    window.open(mailtoLink);
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="relative w-full max-w-lg"
        style={{
          background: theme.panel,
          border: `3px solid ${theme.panelBorder}`,
          boxShadow: `0 0 40px ${theme.accent}40`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `2px solid ${theme.panelBorder}` }}>
          <div>
            <h2 className="font-pixel" style={{ color: theme.accent, fontSize: 14 }}>
              ⛩️ SHRINE
            </h2>
            <p className="font-mono text-xs opacity-60 mt-1" style={{ color: theme.text }}>
              Leave an offering — say hello
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

        <div className="p-6">
          {!unlocked ? (
            /* Puzzle gate */
            <motion.div className="text-center space-y-4">
              <p className="font-pixel" style={{ fontSize: 9, color: theme.accent, lineHeight: 2 }}>
                THE SHRINE REQUIRES AN OFFERING
              </p>
              <div
                className="p-4 font-mono text-sm leading-relaxed"
                style={{
                  background: `${theme.accent}08`,
                  border: `1px solid ${theme.panelBorder}30`,
                  color: theme.text,
                }}
              >
                <p className="mb-2 opacity-70 text-xs">Answer to enter:</p>
                <p>
                  "He was born to the wrong mother, loved the wrong woman, and served the wrong king —
                  yet he remained the greatest warrior of the Mahabharata.
                  He is {" "}<span style={{ color: theme.accent }}>_______</span>'s wife's husband."
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkPuzzle()}
                  placeholder="type your answer..."
                  className="flex-1 px-3 py-2 font-mono text-sm bg-transparent outline-none"
                  style={{
                    border: `1px solid ${wrong ? "#ff4444" : theme.panelBorder}`,
                    color: theme.text,
                    transition: "border-color 0.2s",
                  }}
                />
                <button
                  onClick={checkPuzzle}
                  className="font-pixel px-4 py-2 transition-all hover:scale-105"
                  style={{
                    fontSize: 8,
                    background: `${theme.accent}20`,
                    border: `1px solid ${theme.accent}`,
                    color: theme.accent,
                  }}
                >
                  OFFER
                </button>
              </div>

              {wrong && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-pixel text-xs"
                  style={{ color: "#ff4444", fontSize: 8 }}
                >
                  ✗ Not quite. Think deeper.
                </motion.p>
              )}
            </motion.div>
          ) : sent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 space-y-3"
            >
              <div style={{ fontSize: 48 }}>🌸</div>
              <p className="font-pixel" style={{ fontSize: 10, color: theme.accent }}>
                MESSAGE SENT
              </p>
              <p className="font-mono text-xs opacity-60" style={{ color: theme.text }}>
                Your offering has been received.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={sendMsg}
              className="space-y-4"
            >
              <p className="font-pixel text-center mb-4" style={{ fontSize: 8, color: theme.accent }}>
                ✓ THE SHRINE WELCOMES YOU
              </p>
              <div>
                <label className="font-pixel text-xs block mb-1" style={{ fontSize: 8, color: theme.text, opacity: 0.6 }}>
                  YOUR NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="who are you?"
                  className="w-full px-3 py-2 font-mono text-sm bg-transparent outline-none"
                  style={{ border: `1px solid ${theme.panelBorder}`, color: theme.text }}
                />
              </div>
              <div>
                <label className="font-pixel text-xs block mb-1" style={{ fontSize: 8, color: theme.text, opacity: 0.6 }}>
                  YOUR MESSAGE
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  required
                  rows={4}
                  placeholder="say something..."
                  className="w-full px-3 py-2 font-mono text-sm bg-transparent outline-none resize-none"
                  style={{ border: `1px solid ${theme.panelBorder}`, color: theme.text }}
                />
              </div>
              <button
                type="submit"
                className="w-full font-pixel py-2 transition-all hover:scale-105"
                style={{
                  fontSize: 9,
                  background: `${theme.accent}20`,
                  border: `2px solid ${theme.accent}`,
                  color: theme.accent,
                }}
              >
                SEND OFFERING ✉️
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
