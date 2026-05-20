"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] backdrop-blur-md transition hover:border-[color:var(--border-strong)]"
    >
      <span className="sr-only">Toggle theme</span>
      <Sun
        size={16}
        className={`absolute transition-all ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
        aria-hidden
      />
      <Moon
        size={16}
        className={`absolute transition-all ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
        aria-hidden
      />
    </button>
  );
}
