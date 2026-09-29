"use client";

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/lib/flags";
import { dur, ease } from "@/lib/motion";
import { journey } from "@/lib/content";
import { cn } from "@/lib/utils";
import { JackCompass } from "@/components/site/pirates-instruments";
import { headingOf } from "@/components/site/journey-voyage";

/**
 * JourneyCarousel — the voyage's fallback (SPEC v2 SM-4: mobile, coarse
 * pointer, reduced motion / Pause, Save-Data): a role=tablist stepper on a
 * dashed brass course (arrow keys, Home/End, roving tabindex) and one panel.
 * The legacy abstract stills are retired; the panel carries Jack's compass at
 * the TRUE bearing of the selected leg (the same chart geometry as the
 * desktop voyage), static under reduced motion. One ember tick marks The
 * break (killed: those patterns are on the kill-list); the last step ends on
 * the brass X and the caption.
 */
const BREAK_INDEX = 2;
const NOW_INDEX = 3;

export function JourneyCarousel({ nowCaption }: { nowCaption?: ReactNode }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const n = journey.length;
  const cur = journey[i];

  const goto = (idx: number) => {
    const clamped = Math.max(0, Math.min(n - 1, idx));
    setDir(clamped >= i ? 1 : -1);
    setI(clamped);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    goto(next);
    // roving focus follows the selection
    const tabs = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[Math.max(0, Math.min(n - 1, next))]?.focus();
  };

  if (!cur) return null;

  return (
    <div className="mt-tier-block">
      <div
        role="tablist"
        aria-label="Journey timeline"
        aria-orientation="horizontal"
        onKeyDown={onKey}
        className="relative"
      >
        {/* the dashed brass course under the stepper */}
        <svg aria-hidden="true" focusable="false" className="absolute inset-x-5 top-[1.3rem] h-2 w-[calc(100%-2.5rem)] overflow-visible">
          <line x1="0" x2="100%" y1="1" y2="1" className="stroke-(--w-brass)" strokeWidth={1.5} strokeDasharray="6 5" />
        </svg>
        <div className="relative flex justify-between">
          {journey.map((s, idx) => {
            const sel = idx === i;
            const reached = idx <= i;
            return (
              <button
                key={s.marker}
                type="button"
                role="tab"
                id={`journey-tab-${idx + 1}`}
                aria-selected={sel}
                aria-controls="journey-panel"
                tabIndex={sel ? 0 : -1}
                onClick={() => goto(idx)}
                className="group flex min-h-11 min-w-11 flex-col items-center gap-2 px-1"
              >
                <span className="relative flex size-11 items-center justify-center">
                  {idx === NOW_INDEX ? (
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
                      <path d="M3 3 L17 17 M17 3 L3 17" className="stroke-(--w-brass)" strokeWidth={2.25} strokeLinecap="square" />
                    </svg>
                  ) : (
                    <span
                      className={cn(
                        "size-3 rounded-full border-[1.5px] border-(--w-brass) transition-colors duration-(--dur-micro)",
                        reached ? "bg-(--w-brass)" : "bg-bg",
                        sel && "scale-125",
                      )}
                    />
                  )}
                  {idx === BREAK_INDEX ? (
                    <span aria-hidden="true" className="absolute right-0.5 top-1 h-3.5 w-0.5 rotate-45 bg-kill" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "type-meta transition-colors duration-(--dur-micro)",
                    sel ? "text-fg" : "text-fg-muted group-hover:text-fg",
                  )}
                >
                  {s.marker}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="journey-panel"
        role="tabpanel"
        aria-labelledby={`journey-tab-${i + 1}`}
        className="mt-tier-block border-t border-rule pt-tier-group"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="type-meta text-fg-muted">
            <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
            <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
            <span className="tnum">{`${i + 1} / ${n}`}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goto(i - 1)}
              disabled={i === 0}
              aria-label="Previous step"
              className="flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goto(i + 1)}
              disabled={i === n - 1}
              aria-label="Next step"
              className="flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-tier-group grid gap-tier-group sm:grid-cols-[1fr_auto] sm:items-center">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={cur.marker}
              initial={reduce ? false : { opacity: 0, x: dir * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: dir * -32 }}
              transition={{ duration: reduce ? 0 : dur.base, ease }}
            >
              <h3 className="type-heading text-fg">{cur.title}</h3>
              <p className="mt-tier-pair max-w-body type-body text-fg-muted">{cur.body}</p>
              {i === NOW_INDEX && nowCaption ? <div className="mt-tier-group">{nowCaption}</div> : null}
            </motion.div>
          </AnimatePresence>
          <div className="justify-self-start sm:justify-self-end">
            <JackCompass heading={headingOf(i)} size={112} />
          </div>
        </div>
      </div>
    </div>
  );
}
