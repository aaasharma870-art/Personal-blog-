"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { dur, ease } from "@/lib/motion";
import { journey } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Journey() {
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

  return (
    <Section
      id="journey"
      seam
      backdrop={
        <AmbientBackground
          image="/media/still-calm.png"
          video="/media/v-network.mp4"
          opacity={0.34}
          overlayClassName="bg-gradient-to-b from-canvas/82 via-canvas/86 to-canvas/92"
        />
      }
    >
      <SectionHeading
        index="02"
        eyebrow="The Journey"
        title="How the methodology was earned."
        intro="Every part of the process I trust today exists because an earlier, prettier version of it failed me first. Step through it."
        variant="right"
      />

      <div className="mt-14">
        {/* horizontal stepper */}
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
            className="absolute left-1 top-[0.45rem] h-px origin-left bg-gold"
            style={{ right: "0.25rem" }}
            initial={false}
            animate={{ scaleX: n > 1 ? i / (n - 1) : 1 }}
            transition={{ duration: dur.reveal, ease }}
          />
          <div className="relative flex justify-between">
            {journey.map((s, idx) => {
              const done = idx <= i;
              const sel = idx === i;
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
                      "h-3.5 w-3.5 rounded-full border-2 transition-all duration-300",
                      done
                        ? "border-gold bg-gold"
                        : "border-line-strong bg-canvas group-hover:border-gold/50",
                      sel &&
                        "scale-125 shadow-[0_0_12px_2px_rgba(45,212,191,0.6)]",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[0.62rem] uppercase tracking-wider transition-colors",
                      sel
                        ? "text-gold"
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
        <div className="relative mt-10 min-h-[13rem] overflow-hidden rounded-xl border border-line bg-surface/50 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow text-gold/80">
              {cur.marker} · {i + 1} / {n}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goto(i - 1)}
                disabled={i === 0}
                aria-label="Previous step"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-gold/40 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goto(i + 1)}
                disabled={i === n - 1}
                aria-label="Next step"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-gold/40 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={cur.marker}
              custom={dir}
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, x: dir * 48 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -48 }}
              transition={{ duration: dur.base, ease }}
              className="mt-5"
            >
              <h3 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                {cur.title}
              </h3>
              <p className="measure mt-3 text-base leading-relaxed text-stone">
                {cur.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
