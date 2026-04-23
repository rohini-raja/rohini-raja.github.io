import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onDone: () => void;
}

const LINES = [
  { text: "> ROHINI OS v2.6.0", delay: 0 },
  { text: "> Initializing pixel engine...", delay: 400 },
  { text: "> Loading memory banks...", delay: 900 },
  { text: "> Mounting worlds: Library, Lab, Academy, Shrine...", delay: 1500 },
  { text: "> Calibrating character sprite...", delay: 2100 },
  { text: "> Syncing bookshelf from Goodreads...", delay: 2700 },
  { text: "> All systems nominal.", delay: 3300 },
  { text: "> Welcome, traveller. ✦", delay: 3900 },
];

export default function BootScreen({ onDone }: Props) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [skipAllowed, setSkipAllowed] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines((v) => [...v, i]), line.delay));
    });
    timers.push(setTimeout(() => setSkipAllowed(true), 1000));
    timers.push(setTimeout(() => setDone(true), 4600));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
  }, [done, onDone]);

  const handleSkip = () => {
    if (skipAllowed) {
      setVisibleLines(LINES.map((_, i) => i));
      setDone(true);
    }
  };

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 flex flex-col items-center justify-center scanlines"
          style={{ background: "var(--theme-terminal)" }}
          onClick={handleSkip}
        >
          {/* CRT corners */}
          <div className="absolute inset-4 pointer-events-none" style={{
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.8)",
            borderRadius: 8,
          }} />

          <div className="w-full max-w-2xl px-8 py-12 font-mono" style={{ fontSize: "clamp(10px, 2vw, 14px)" }}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 text-center"
              style={{ color: "var(--theme-terminalText)" }}
            >
              <pre className="crt-glow inline-block text-left" style={{ fontSize: "clamp(6px, 1.2vw, 10px)", lineHeight: 1.2 }}>{`
██████╗  ██████╗ ██╗  ██╗██╗███╗   ██╗██╗
██╔══██╗██╔═══██╗██║  ██║██║████╗  ██║██║
██████╔╝██║   ██║███████║██║██╔██╗ ██║██║
██╔══██╗██║   ██║██╔══██║██║██║╚██╗██║██║
██║  ██║╚██████╔╝██║  ██║██║██║ ╚████║██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝`}</pre>
            </motion.div>

            <div className="space-y-1" style={{ color: "var(--theme-terminalText)" }}>
              {LINES.map((line, i) => (
                visibleLines.includes(i) && (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={i === LINES.length - 1 ? "crt-glow font-bold mt-4" : "opacity-80"}
                  >
                    {line.text}
                  </motion.div>
                )
              ))}
              {visibleLines.length > 0 && visibleLines.length < LINES.length && (
                <span className="blink" style={{ color: "var(--theme-terminalText)" }}>█</span>
              )}
            </div>

            {skipAllowed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="absolute bottom-8 right-8 text-xs"
                style={{ color: "var(--theme-terminalText)" }}
              >
                click to skip
              </motion.p>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
