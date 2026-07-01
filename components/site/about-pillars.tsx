"use client";

import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { SpotlightCard } from "@/components/visuals/spotlight-card";
import { ParallaxLayer } from "@/components/visuals/parallax-layer";
import { dur, ease, viewportOnce } from "@/lib/motion";
import { pillars } from "@/lib/content";

/** "Dealt-in" stagger — transform+opacity only; a slight rotate reads like a
 *  card being dealt onto the table. Reduced-motion → opacity only. */
const dealtParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const dealtCard: Variants = {
  hidden: { opacity: 0, y: 30, rotate: -1.5, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: dur.reveal, ease },
  },
};
const dealtReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease } },
};

export function AboutPillars() {
  const reduce = useReducedMotion();
  const child = reduce ? dealtReduced : dealtCard;
  return (
    <div className="relative lg:col-span-7">
      {/* research-glow depth — sibling behind the cards */}
      <ParallaxLayer depth={0.6} className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden="true"
          className="absolute -inset-x-6 -top-10 h-64"
          style={{
            background:
              "radial-gradient(60% 60% at 70% 20%, rgba(45,212,191,0.08), transparent 70%)",
          }}
        />
      </ParallaxLayer>

      <motion.div
        role="list"
        aria-label="Four operating pillars"
        variants={dealtParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {pillars.map((p) => (
          <motion.div key={p.index} role="listitem" variants={child} className="h-full">
            <SpotlightCard tier="raised" accent="aqua" tilt className="h-full p-6">
              {/* oversized ghost index numeral (editorial spine) — clipped by
                  the card's own overflow-hidden, sits behind the copy */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[7rem] leading-none text-ink/[0.05]"
              >
                {p.index}
              </span>
              <div className="relative flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-lg font-medium text-ink">{p.title}</h3>
                <span className="font-mono text-xs text-aqua/80">{p.index}</span>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-stone">{p.body}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
