import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";

type Mood = "happy" | "sleepy" | "hungry" | "excited";

const MOODS: Record<Mood, { face: string; msg: string }> = {
  happy: { face: "(＾▽＾)", msg: "Feeling great today!" },
  sleepy: { face: "(-_-)zzz", msg: "Time for a nap..." },
  hungry: { face: "(°□°)", msg: "Feed me knowledge!" },
  excited: { face: "(*≧▽≦)", msg: "Let's build things!" },
};

const MOOD_CYCLE: Mood[] = ["happy", "excited", "sleepy", "hungry"];

export default function Tamagotchi() {
  const { theme } = useTheme();
  const [mood, setMood] = useState<Mood>("happy");
  const [moodIdx, setMoodIdx] = useState(0);
  const [showMsg, setShowMsg] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [bounce, setBounce] = useState(false);

  // Cycle moods every 30s
  useEffect(() => {
    const t = setInterval(() => {
      setMoodIdx((i) => {
        const next = (i + 1) % MOOD_CYCLE.length;
        setMood(MOOD_CYCLE[next]);
        return next;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const pet = () => {
    setPetCount((c) => c + 1);
    setMood("excited");
    setBounce(true);
    setShowMsg(true);
    setTimeout(() => setBounce(false), 400);
    setTimeout(() => setShowMsg(false), 2000);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 left-6 z-40 cursor-grab active:cursor-grabbing select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div
        className="relative p-3 w-24"
        style={{
          background: theme.panel,
          border: `2px solid ${theme.panelBorder}`,
          boxShadow: `0 0 16px ${theme.accent}30`,
        }}
      >
        {/* Screen */}
        <div
          className="w-full aspect-square flex flex-col items-center justify-center mb-1 relative overflow-hidden"
          style={{ background: theme.terminal }}
        >
          {/* Stars */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full"
              style={{
                background: theme.accent,
                top: `${20 + i * 18}%`,
                left: `${15 + i * 20}%`,
                animation: `twinkle ${1.5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}

          <motion.div
            animate={bounce ? { y: [-4, 0, -4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="text-center"
            style={{ color: theme.accent, fontSize: 12, lineHeight: 1.4 }}
          >
            <div style={{ fontSize: 10 }}>{MOODS[mood].face}</div>
          </motion.div>
        </div>

        {/* Pet counter */}
        <div className="text-center font-pixel" style={{ fontSize: 6, color: theme.accent, opacity: 0.6 }}>
          ♥{petCount}
        </div>

        {/* Button */}
        <button
          onClick={pet}
          className="w-full mt-1 py-0.5 font-pixel transition-all hover:scale-105 active:scale-95"
          style={{
            fontSize: 6,
            background: `${theme.accent}20`,
            border: `1px solid ${theme.accent}`,
            color: theme.accent,
          }}
        >
          PET
        </button>
      </div>

      {/* Speech bubble */}
      <AnimatePresence>
        {showMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-full left-0 mb-2 px-2 py-1 whitespace-nowrap font-mono"
            style={{
              background: theme.panel,
              border: `1px solid ${theme.panelBorder}`,
              fontSize: 9,
              color: theme.text,
            }}
          >
            {MOODS[mood].msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
