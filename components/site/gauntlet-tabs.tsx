"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Step = { n: string; title: string; body: string };

/**
 * GauntletTabs — the 7-part validation gauntlet as an interactive vertical
 * tablist: click (or arrow-key) a step on the left and the detail panel on the
 * right swaps in. Condenses a tall wall of cards into one tight, stateful module
 * (proper ARIA tablist + roving tabindex + reduced-motion path).
 */
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

  const cur = steps[active];

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
      <div
        role="tablist"
        aria-label="Validation gauntlet steps"
        aria-orientation="vertical"
        onKeyDown={onKey}
        className="flex gap-2 overflow-x-auto pb-1 lg:col-span-5 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {steps.map((s, i) => {
          const sel = i === active;
          return (
            <button
              key={s.n}
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
              <span
                className={cn(
                  "tnum font-mono text-sm font-medium transition-colors",
                  sel ? "text-gold-bright" : "text-gold/70",
                )}
              >
                {s.n.padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  sel ? "text-ink" : "text-stone group-hover:text-ink",
                )}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

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
