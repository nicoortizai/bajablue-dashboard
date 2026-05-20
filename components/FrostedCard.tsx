"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface FrostedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Disable the on-mount fade-up animation. */
  noAnimate?: boolean;
}

/**
 * Reusable frosted-glass surface with a hairline gradient border
 * and a polite on-mount fade-up. Looks good in both light and dark.
 */
export function FrostedCard({
  children,
  className = "",
  delay = 0,
  noAnimate = false,
  ...rest
}: FrostedCardProps) {
  const initial = noAnimate ? false : { opacity: 0, y: 16 };
  const animate = noAnimate ? undefined : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={`frosted lift ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
