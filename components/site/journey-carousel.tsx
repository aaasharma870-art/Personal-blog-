"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dur, ease } from "@/lib/motion";
import { journey } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Chapters describing ideas that were later killed/failed render their node in
 *  the semantic ember hue (ember = "killed" only, never decorative). This is a
 *  presentation mapping over existing markers — no copy/content change. */
const KILLED_MARKERS = new Set(["Early work", "The break"]);

export function JourneyCarousel() {
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
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goto(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goto(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goto(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goto(n - 1);
    }
  };

  if (!cur) return null; // index guard (noUncheckedIndexedAccess-safe)

  return (
    <div className="mt-14">
      {/* horizontal stepper (tablist) */}
      <div
        role="tablist"
        aria-label="Journey timeline"
        aria-orientation="horizontal"
        onKeyDown={onKey}
        className="relative"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-1 top-[0.45rem] h-px bg-line"
        />
        <motion.div
          aria-hidden="true"
          className="absolute left-1 top-[0.45rem] h-px origin-left bg-aqua"
          style={{ right: "0.25rem" }}
          initial={false}
          animate={{ scaleX: n > 1 ? i / (n - 1) : 1 }}
          transition={{ duration: dur.reveal, ease }}
        />
        <div className="relative flex justify-between">
          {journey.map((s, idx) => {
            const done = idx <= i;
            const sel = idx === i;
            const killed = KILLED_MARKERS.has(s.marker);
            return (
              <button
                key={s.marker}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-label={`${s.marker}: ${s.title}`}
                tabIndex={sel ? 0 : -1}
                onClick={() => goto(idx)}
                className="group flex flex-col items-center gap-3"
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full border-2 transition-[transform,background-color,border-color] duration-300",
                    killed
                      ? done
                        ? "border-ember bg-ember"
                        : "border-ember/50 bg-canvas group-hover:border-ember"
                      : done
                        ? "border-aqua bg-aqua"
                        : "border-line-strong bg-canvas group-hover:border-aqua/50",
                    sel && "scale-125",
                    sel && !killed && "shadow-[0_0_12px_2px_rgba(45,212,191,0.6)]",
                    sel && killed && "shadow-[0_0_12px_2px_rgba(239,111,108,0.55)]",
                  )}
                />
                <span
                  className={cn(
                    "font-mono text-[0.62rem] uppercase tracking-wider transition-colors",
                    sel
                      ? killed
                        ? "text-ember"
                        : "text-aqua-bright"
                      : "text-muted group-hover:text-stone",
                  )}
                >
                  {s.marker}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* content card */}
      <div className="relative mt-10 min-h-[18rem] overflow-hidden rounded-xl border border-line bg-surface/50 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow text-aqua/80">
            {cur.marker} · {i + 1} / {n}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goto(i - 1)}
              disabled={i === 0}
              aria-label="Previous step"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-aqua/40 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goto(i + 1)}
              disabled={i === n - 1}
              aria-label="Next step"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-aqua/40 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={cur.marker}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -48 }}
            transition={{ duration: dur.base, ease }}
            className="mt-5 grid gap-6 sm:grid-cols-[1fr_0.9fr] sm:items-center"
          >
            <div>
              <h3 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                {cur.title}
              </h3>
              <p className="measure mt-3 text-base leading-relaxed text-stone">
                {cur.body}
              </p>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line">
              <Image
                src={cur.image}
                alt=""
                fill
                sizes="(min-width: 640px) 40vw, 90vw"
                quality={45}
                className="object-cover opacity-70"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-canvas/70 via-canvas/20 to-transparent"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
