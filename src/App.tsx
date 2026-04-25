import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./lib/ThemeContext";
import BootScreen from "./components/BootScreen";
import Overworld from "./components/Overworld";
import ThemePicker from "./components/ThemePicker";

function Game() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!booted ? (
          <BootScreen key="boot" onDone={() => setBooted(true)} />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", height: "100%" }}
          >
            <Overworld />
            <ThemePicker />

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Game />
    </ThemeProvider>
  );
}
