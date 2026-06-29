"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { dur, ease, viewportReplay } from "@/lib/motion";

/**
 * SectionSeam — a dramatic cinematic transition that plays at a section's top
 * edge as it scrolls in: the aqua line draws from center with a white flash, a
 * large glow blooms, a soft light shaft falls into the section, and a bright
 * streak sweeps across. One-shot (viewport once), transform/opacity only.
 * Reduced motion collapses to a static hairline.
 */
export function SectionSeam() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-aqua/40 to-transparent"
      />
    );
  }

  const line: Variants = {
    hidden: { scaleX: 0, opacity: 0.2 },
    show: { scaleX: 1, opacity: 1, transition: { duration: dur.reveal, ease } },
  };
  const flash: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: [0, 1, 0], transition: { duration: 0.9, ease, times: [0, 0.22, 1] } },
  };
  const bloom: Variants = {
    hidden: { opacity: 0, scaleX: 0.4 },
    show: {
      opacity: [0, 0.9, 0.32],
      scaleX: 1,
      transition: { duration: 1.2, ease, times: [0, 0.4, 1] },
    },
  };
  const shaft: Variants = {
    hidden: { opacity: 0, scaleY: 0.3 },
    show: {
      opacity: [0, 0.5, 0],
      scaleY: 1,
      transition: { duration: 1.5, ease, times: [0, 0.35, 1] },
    },
  };
  const sweep: Variants = {
    hidden: { x: "-40vw", opacity: 0 },
    show: { x: "110vw", opacity: [0, 1, 0], transition: { duration: 1.1, ease, delay: 0.05 } },
  };

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px"
      initial="hidden"
      whileInView="show"
      viewport={viewportReplay}
    >
      <motion.div
        variants={line}
        className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-aqua/80 to-transparent"
      />
      <motion.div
        variants={flash}
        className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
      <motion.div
        variants={bloom}
        className="absolute left-1/2 top-0 h-40 w-[44rem] max-w-[90vw] origin-center -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{
          background: "radial-gradient(ellipse, rgba(45,212,191,0.28), transparent 70%)",
        }}
      />
      <motion.div
        variants={shaft}
        className="absolute left-1/2 top-0 h-48 w-[60rem] max-w-[96vw] origin-top -translate-x-1/2"
        style={{
          background: "linear-gradient(to bottom, rgba(45,212,191,0.14), transparent 80%)",
        }}
      />
      <motion.div
        variants={sweep}
        className="absolute top-0 h-0.5 w-56 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-aqua to-transparent"
        style={{ boxShadow: "0 0 18px 3px rgba(45,212,191,0.6)" }}
      />
    </motion.div>
  );
}
