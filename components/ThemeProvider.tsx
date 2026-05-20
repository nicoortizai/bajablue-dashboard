"use client";

import * as React from "react";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "bajaswarm.theme";

function applyMode(mode: Mode) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("dark", mode === "dark");
  html.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark to match the Apple-Music-style hero.
  // We immediately reconcile with stored preference on mount.
  const [mode, setModeState] = React.useState<Mode>("dark");

  React.useEffect(() => {
    let stored: Mode | null = null;
    try {
      stored = (localStorage.getItem(STORAGE_KEY) as Mode | null) ?? null;
    } catch {
      stored = null;
    }
    const initial: Mode =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setModeState(initial);
    applyMode(initial);
  }, []);

  const setMode = React.useCallback((m: Mode) => {
    setModeState(m);
    applyMode(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = React.useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = React.useMemo(
    () => ({ mode, toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Render-safe fallback so SSR'd subtrees don't crash before mount.
    return {
      mode: "dark",
      toggle: () => undefined,
      setMode: () => undefined,
    };
  }
  return ctx;
}

// Prevents FOUC: applies stored class before paint via inline script.
export function ThemeBootScript() {
  const code = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var m=t==='light'||t==='dark'?t:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');var h=document.documentElement;if(m==='dark')h.classList.add('dark');else h.classList.remove('dark');h.style.colorScheme=m;}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
