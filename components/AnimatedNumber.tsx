"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Format the eased value for rendering. Receives the current numeric tick. */
  format?: (v: number) => string;
  duration?: number;
  className?: string;
  /** If true, runs animation immediately on mount instead of on viewport entry. */
  immediate?: boolean;
  /** ARIA label override; defaults to the formatted final value. */
  ariaLabel?: string;
}

const defaultFormat = (v: number) => {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Math.round(v),
  );
};

export function AnimatedNumber({
  value,
  format = defaultFormat,
  duration = 1.4,
  className,
  immediate = false,
  ariaLabel,
}: AnimatedNumberProps) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [text, setText] = React.useState(() => format(0));
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    if (!immediate && !inView) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setText(format(value));
      startedRef.current = true;
      return;
    }

    startedRef.current = true;
    const controls = animate(0, value, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setText(format(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, format, immediate]);

  return (
    <span
      ref={ref}
      className={`tabular ${className ?? ""}`}
      aria-label={ariaLabel ?? format(value)}
    >
      {text}
    </span>
  );
}
