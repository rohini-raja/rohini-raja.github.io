import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Theme, THEMES, DEFAULT_THEME } from "./themes";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("rr-theme");
    return THEMES.find((t) => t.id === saved) ?? DEFAULT_THEME;
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("rr-theme", t.id);
  };

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => {
      if (typeof v === "string") root.style.setProperty(`--theme-${k}`, v);
    });
  }, [theme]);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
