"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { ease, dur } from "@/lib/motion";

/**
 * RevealText — a per-word fade-up + de-blur, used ONCE on the hero headline as
 * the site's single signature text moment.
 * Reimplemented by hand, inspired by React Bits "BlurText" (reactbits.dev).
 * Accessible: the full string is the element's accessible name; the animated
 * word-spans are aria-hidden. Reduced-motion renders plain text instantly.
 */
export function RevealText({
  text,
  className,
  as = "span",
  stagger = 0.05,
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  stagger?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  // Animate transform + blur only (NOT opacity) so the headline stays
  // paint-eligible for LCP even when it is the largest contentful element.
  const word: Variants = {
    hidden: { y: 14, filter: "blur(10px)" },
    show: {
      y: 0,
      filter: "blur(0px)",
      transition: { duration: dur.reveal, ease },
    },
  };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        style={{ display: "contents" }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            variants={word}
            className="inline-block whitespace-pre will-change-transform"
          >
            {w + (i < words.length - 1 ? " " : "")}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
