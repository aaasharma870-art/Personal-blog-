"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { GateDiagram } from "@/components/site/idiots-chalk";

type Step = { n: string; title: string; body: string };

/**
 * GauntletTabs — the seven real gates on the dawn board (SPEC v2 SM-6).
 * A vertical tablist (arrow keys, Home/End, roving tabindex; horizontal
 * scroll strip below lg) beside the board: the gate diagram in chalk, where
 * the chosen gate DERIVES and is the viewport's one aqua mark, then the
 * gate's own words (verbatim content.ts). Static ordinals (the replaying
 * count-up and the sliding rail are retired, SPEC §11.3). Reduced motion:
 * instant swaps, chalk pre-drawn.
 */
export function GauntletTabs({ steps }: { steps: readonly Step[] }) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const n = steps.length;

  const select = (i: number) => {
    setActive(i);
    setTouched(true);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = {
      ArrowDown: (active + 1) % n,
      ArrowRight: (active + 1) % n,
      ArrowUp: (active - 1 + n) % n,
      ArrowLeft: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  const cur = steps[active] ?? steps[0];
  if (!cur) return null;

  return (
    <div className="grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
      <div
        role="tablist"
        aria-label="Validation gauntlet gates"
        aria-orientation="vertical"
        onKeyDown={onKey}
        className="flex gap-1 overflow-x-auto pb-1 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0"
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
              aria-controls="gpanel"
              tabIndex={sel ? 0 : -1}
              onClick={() => select(i)}
              className={cn(
                "group flex min-h-11 shrink-0 items-baseline gap-3 rounded-control px-3 py-2.5 text-left transition-colors duration-(--dur-micro)",
                sel ? "bg-surface-1" : "hover:bg-surface-1",
              )}
            >
              <span className={cn("tnum type-meta", sel ? "text-fg" : "text-fg-muted")}>
                {s.n.padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "type-body whitespace-nowrap lg:whitespace-normal",
                  sel ? "text-fg" : "text-fg-muted group-hover:text-fg",
                )}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="gpanel"
        aria-labelledby={`gtab-${cur.n}`}
        className="surface-1 rounded-frame p-tier-group sm:p-8 lg:col-span-8"
      >
        <GateDiagram count={n} active={active} derive={touched && !reduce} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cur.n}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : dur.base, ease }}
            className="mt-tier-group"
          >
            <p className="type-meta text-fg-muted">
              <span className="tnum">{`GATE ${cur.n.padStart(2, "0")} / ${String(n).padStart(2, "0")}`}</span>
            </p>
            <h4 className="mt-tier-pair type-heading text-fg">{cur.title}</h4>
            <p className="mt-tier-pair max-w-body type-body text-fg-muted">{cur.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
