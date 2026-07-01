"use client";

import { useRef } from "react";
import { ArrowRight, ArrowUpRight, Check, X } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Tag } from "@/components/ui/tag";
import { ease, viewportOnce } from "@/lib/motion";
import { featuredProjects, killList, site, survivors } from "@/lib/content";

/**
 * The Ledger Reckoning (signature moment 3, second half). Settles ONCE
 * (viewportOnce — no replay). Survivors: an aqua edge-light ignites top->down
 * and rows report in from the left. Kill-list: rows drop in from the right and
 * a thin EMBER strike-line draws across each killed idea (ember = killed-only,
 * low alpha so copy stays legible). Transform/opacity only; reduced motion =
 * opacity-only, strike-line pre-drawn.
 */
export function SurvivorsPanel() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewportOnce);

  const row: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, x: -24 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease, delay: 0.15 + i * 0.08 },
    }),
  };

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px origin-top bg-gradient-to-b from-aqua/80 via-aqua/40 to-transparent"
        initial={reduce ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        animate={inView ? { opacity: 1, scaleY: 1 } : undefined}
        transition={{ duration: 0.7, ease }}
      />
      <div className="flex items-center gap-2.5">
        <Check className="h-4 w-4 text-aqua" aria-hidden="true" />
        <h3 className="font-serif text-xl font-medium text-ink">
          What survived
        </h3>
      </div>
      <p className="mt-2 text-sm text-muted">
        Three strategies cleared the full process out of many more tested.
      </p>
      <ul className="mt-6 space-y-2">
        {survivors.map((s, i) => (
          <motion.li
            key={s.name}
            custom={i}
            variants={row}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="group relative -ml-px rounded-r-md border-l-2 border-aqua/40 py-2 pl-4 transition-colors duration-200 hover:border-aqua hover:bg-elevated/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium text-ink">
                {s.name}
                <ArrowRight
                  className="h-3.5 w-3.5 -translate-x-1.5 text-aqua opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
              <Tag accent="gold">{s.status}</Tag>
            </div>
            <p className="editorial mt-1.5 text-sm italic text-stone">
              {s.thesis}
            </p>
            <p className="tnum mt-1.5 font-mono text-xs text-aqua/90">
              {s.evidence}
            </p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function KillList() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewportOnce);
  const flagshipHref = featuredProjects[0]?.href ?? site.github;

  const row: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, x: 24 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.45, ease, delay: 0.1 + i * 0.07 },
    }),
  };

  return (
    <div
      ref={ref}
      id="kill-list"
      className="scroll-mt-24 rounded-xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="flex items-center gap-2.5">
        <X className="h-4 w-4 text-ember" aria-hidden="true" />
        <h3 className="font-serif text-xl font-medium text-ink">
          The kill-list
        </h3>
      </div>
      <p className="mt-2 text-sm text-muted">
        Killed and never retuned — each ships a written post-mortem. This is
        the part I am proudest of.
      </p>
      <ul className="mt-6 space-y-1.5">
        {killList.map((k, i) => (
          <motion.li
            key={k.name}
            custom={i}
            variants={row}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="group -ml-px rounded-r-md border-l-2 border-ember/30 py-2 pl-4 pr-2 transition-colors duration-200 hover:border-ember/70 hover:bg-ember/10"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember/70 transition-transform duration-200 group-hover:scale-150"
                  aria-hidden="true"
                />
                <span className="relative text-sm text-stone transition-colors group-hover:text-ink">
                  {k.name}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-1/2 h-px origin-left bg-ember/50"
                    initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : undefined}
                    transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.07 + 0.25 }}
                  />
                </span>
              </div>
              <a
                href={flagshipHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Post-mortem for ${k.name} on GitHub`}
                className="flex shrink-0 -translate-x-1 items-center gap-1 rounded border border-ember/40 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-ember opacity-0 transition-all duration-200 hover:bg-ember/15 focus-visible:translate-x-0 focus-visible:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
              >
                Post-mortem
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-1 pl-3.5 text-xs text-muted">{k.reason}</p>
          </motion.li>
        ))}
      </ul>
      <p className="editorial mt-6 border-t border-line pt-4 text-sm italic text-stone">
        &ldquo;Tuning to a backtest usually enlarges your future loss.&rdquo;
      </p>
    </div>
  );
}
