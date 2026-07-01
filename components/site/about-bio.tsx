"use client";

import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { dur, ease, viewportOnce } from "@/lib/motion";
import { about } from "@/lib/content";

const clipParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const clipLine: Variants = {
  hidden: { y: 28, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: dur.reveal, ease } },
};
const clipLineReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease } },
};

export function AboutBio() {
  // useReducedMotion() is boolean | null; normalize to a strict boolean so it
  // satisfies PhilosophyQuote's `reduce: boolean` prop (null → false → animated).
  const reduce = useReducedMotion() ?? false;
  const line = reduce ? clipLineReduced : clipLine;
  return (
    <div>
      <motion.div
        variants={clipParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-5 text-base leading-relaxed text-stone"
      >
        {/* each paragraph slides up inside its own clip window */}
        <div className="overflow-hidden">
          <motion.p variants={line}>{about.bio}</motion.p>
        </div>
        <div className="overflow-hidden">
          <motion.p variants={line}>{about.bioSecond}</motion.p>
        </div>
      </motion.div>

      <PhilosophyQuote reduce={reduce} />
    </div>
  );
}

function PhilosophyQuote({ reduce }: { reduce: boolean }) {
  return (
    <motion.figure
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative mt-8 pl-5"
    >
      {/* drawn left rule (scaleY, origin-top) */}
      <motion.span
        aria-hidden="true"
        variants={{
          hidden: { scaleY: reduce ? 1 : 0 },
          show: { scaleY: 1, transition: { duration: dur.reveal, ease } },
        }}
        className="absolute left-0 top-0 h-full w-0.5 origin-top bg-aqua/40"
      />
      <figcaption className="eyebrow mb-2 text-muted">On method</figcaption>
      <motion.blockquote
        variants={{
          hidden: { opacity: 0, y: reduce ? 0 : 12 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: dur.reveal, ease, delay: reduce ? 0 : 0.1 },
          },
        }}
        className="editorial text-[1.02rem] italic leading-relaxed text-ink/90"
      >
        {about.philosophyNote}
      </motion.blockquote>
    </motion.figure>
  );
}
