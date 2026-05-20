"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Account {
  id: string;
  name: string;
  live: boolean;
}

const ACCOUNTS: Account[] = [
  { id: "bajablue", name: "BajaBlue", live: true },
  { id: "bajawing", name: "BajaWing", live: false },
  { id: "bajaswarm", name: "BajaSwarm", live: false },
  { id: "athena", name: "Athena", live: false },
];

interface AccountSwitcherProps {
  activeId?: string;
}

export function AccountSwitcher({ activeId = "bajablue" }: AccountSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const active = ACCOUNTS.find((a) => a.id === activeId) ?? ACCOUNTS[0];

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] py-1.5 pl-2 pr-3 backdrop-blur-md transition hover:border-[color:var(--border-strong)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#0A84FF] to-[#36859A] text-[11px] font-semibold text-white">
          {active.name[0]}
        </span>
        <span className="font-display text-sm font-medium text-[color:var(--fg)]">
          {active.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-[color:var(--fg-mute)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[220px] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
            role="listbox"
          >
            {ACCOUNTS.map((a) => {
              const isActive = a.id === active.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={!a.live}
                  onClick={() => {
                    if (!a.live) return;
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition ${
                    a.live
                      ? "hover:bg-[color:var(--bg-soft)]"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white ${
                        a.live
                          ? "bg-gradient-to-br from-[#0A84FF] to-[#36859A]"
                          : "bg-[color:var(--border-strong)]"
                      }`}
                    >
                      {a.name[0]}
                    </span>
                    <span className="text-[color:var(--fg)]">{a.name}</span>
                    {!a.live ? (
                      <span className="rounded-full border border-[color:var(--border)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--fg-faint)]">
                        Soon
                      </span>
                    ) : null}
                  </span>
                  {isActive ? (
                    <Check size={14} className="text-[#0A84FF]" />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
