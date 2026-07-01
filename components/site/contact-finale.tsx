"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { GithubMark } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";
import { CopyEmail } from "@/components/ui/copy-email";
import {
  dur,
  ease,
  item,
  itemReduced,
  maskedLine,
  maskedLineReduced,
  viewportSignature,
} from "@/lib/motion";

/**
 * ContactFinale — the closing act (signature moment 4, spec §4).
 * The h2 resolves line-by-line in the hero's masked grammar (overflow-hidden
 * mask + inner Y translate), the eyebrow/body/fine-print settle around it, and
 * the CTAs land in sequence with the CopyEmail glow blooming LAST as the final
 * gesture. transform/opacity only; reduced-motion collapses to opacity-only.
 *
 * COPY IS UNCHANGED — HEAD_LINES only choose deterministic wrap points so the
 * masked reveal has one line per mask (spec §0: layout/motion, never copy).
 */
const HEAD_LINES = [
  "Let’s talk research, markets, or",
  "building systems that are honest",
  "about their limits.",
] as const;

export function ContactFinale({
  email,
  github,
}: {
  email: string;
  github: string;
}) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
  };
  const lineStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const lineInner = reduce ? maskedLineReduced : maskedLine;
  const fade = reduce ? itemReduced : item;

  // CTAs keep DOM order (CopyEmail first); custom delays make the CopyEmail
  // glow land LAST. Reduced-motion: opacity only, no y, delay collapsed.
  const ctaItem: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: () => ({ opacity: 1, transition: { duration: 0.2, ease } }),
      }
    : {
        hidden: { opacity: 0, y: 16 },
        show: (d: number) => ({
          opacity: 1,
          y: 0,
          transition: { duration: dur.reveal, ease, delay: d },
        }),
      };
  const glow: Variants = reduce
    ? { hidden: { opacity: 0.3 }, show: { opacity: 0.3 } }
    : {
        hidden: { opacity: 0, scale: 0.8 },
        show: {
          opacity: [0, 0.7, 0.45],
          scale: 1,
          transition: { duration: 0.6, ease, delay: 0.34 },
        },
      };

  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={viewportSignature}
    >
      <motion.p variants={fade} className="eyebrow text-aqua/80">
        Contact
      </motion.p>

      <motion.h2
        variants={lineStagger}
        className="mt-5 font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-6xl"
      >
        {HEAD_LINES.map((ln) => (
          <span key={ln} className="block overflow-hidden pb-[0.15em]">
            <motion.span
              variants={lineInner}
              className="block will-change-transform"
            >
              {ln}
            </motion.span>
          </span>
        ))}
      </motion.h2>

      <motion.p
        variants={fade}
        className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone"
      >
        The most reliable way to reach me is email — I read everything. I&rsquo;m
        a high-school junior open to research conversations, mentorship, and
        serious collaboration.
      </motion.p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        {/* CopyEmail — DOM-first, but lands LAST via the largest custom delay */}
        <motion.span
          variants={ctaItem}
          custom={0.16}
          className="relative inline-flex will-change-transform"
        >
          <motion.span
            aria-hidden="true"
            variants={glow}
            className="pointer-events-none absolute -inset-4 -z-10 rounded-full will-change-transform"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(45,212,191,0.45), transparent 70%)",
            }}
          />
          <Magnetic strength={0.3}>
            <CopyEmail email={email} />
          </Magnetic>
        </motion.span>

        <motion.span
          variants={ctaItem}
          custom={0}
          className="inline-flex will-change-transform"
        >
          <Magnetic strength={0.3}>
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-canvas/40 px-5 py-3 text-sm text-ink backdrop-blur-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-gold/40"
            >
              <GithubMark className="h-4 w-4" />
              GitHub
              <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
            </a>
          </Magnetic>
        </motion.span>

        <motion.span
          variants={ctaItem}
          custom={0.08}
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-line bg-canvas/30 px-5 py-3 text-sm text-muted backdrop-blur-sm will-change-transform"
        >
          Résumé · coming soon
        </motion.span>
      </div>

      <motion.p variants={fade} className="mt-5 text-xs text-muted">
        Click the address to copy it, or{" "}
        <a
          href={`mailto:${email}`}
          className="underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-gold/60"
        >
          open it in your mail app
        </a>
        .
      </motion.p>
    </motion.div>
  );
}
