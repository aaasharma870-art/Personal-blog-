"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { dur, ease, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Step = { n: string; title: string; body: string };

/**
 * GauntletTabs — the 7-part validation gauntlet as an interactive vertical
 * tablist: click (or arrow-key) a step on the left and the detail panel on the
 * right swaps in. Condenses a tall wall of cards into one tight, stateful module
 * (proper ARIA tablist + roving tabindex + reduced-motion path).
 */
/** A step numeral that counts up from 00 as the spine assembles (once). Neutral
 *  ordinal, not a metric — honesty-safe. Reduced motion renders the final value. */
function StepNumber({ n, sel }: { n: string; sel: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const parsed = Number.parseInt(n, 10);
  const target = Number.isNaN(parsed) ? 0 : parsed;
  const [val, setVal] = useState(0);

  useEffect(() => {
    // Reduced motion snaps to the final value; otherwise count from 0 once in
    // view. setState stays inside animate's async onUpdate (never synchronous in
    // the effect body) to satisfy react-hooks/set-state-in-effect.
    if (!reduce && !inView) return;
    const controls = animate(0, target, {
      duration: reduce ? 0 : 0.6,
      ease,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, target]);

  return (
    <span
      ref={ref}
      className={cn(
        "tnum font-mono text-sm font-medium transition-colors",
        sel ? "text-gold-bright" : "text-gold/70",
      )}
    >
      {String(val).padStart(2, "0")}
    </span>
  );
}

export function GauntletTabs({ steps }: { steps: readonly Step[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = steps.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => (i - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    }
  };

  const cur = steps[active] ?? steps[0];
  if (!cur) return null;

  const spine: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const stepVar: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: -14 },
    show: { opacity: 1, y: 0, transition: { duration: dur.base, ease } },
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
      <motion.div
        role="tablist"
        aria-label="Validation gauntlet steps"
        aria-orientation="vertical"
        onKeyDown={onKey}
        variants={spine}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex gap-2 overflow-x-auto pb-1 lg:col-span-5 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {steps.map((s, i) => {
          const sel = i === active;
          return (
            <motion.button
              key={s.n}
              variants={stepVar}
              type="button"
              role="tab"
              id={`gtab-${s.n}`}
              aria-selected={sel}
              aria-controls={`gpanel-${s.n}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "group relative flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-200",
                sel
                  ? "border-gold/40 bg-elevated/70"
                  : "border-line bg-surface/40 hover:border-gold/25 hover:bg-elevated/40",
              )}
            >
              {sel ? (
                <motion.span
                  layoutId="gauntlet-active-rail"
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold"
                  transition={{ duration: dur.base, ease }}
                />
              ) : null}
              <StepNumber n={s.n} sel={sel} />
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  sel ? "text-ink" : "text-stone group-hover:text-ink",
                )}
              >
                {s.title}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="lg:col-span-7">
        <div
          role="tabpanel"
          id={`gpanel-${cur.n}`}
          aria-labelledby={`gtab-${cur.n}`}
          className="h-full min-h-[14rem] rounded-xl border border-line bg-surface/60 p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cur.n}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: dur.base, ease }}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl font-medium leading-none text-gold/30">
                  {cur.n.padStart(2, "0")}
                </span>
                <h4 className="font-serif text-2xl font-medium text-ink">
                  {cur.title}
                </h4>
              </div>
              <p className="mt-5 text-base leading-relaxed text-stone">
                {cur.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
