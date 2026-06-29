"use client";

import { useReducedMotion } from "motion/react";
import { credibility } from "@/lib/content";

function Marker({ label }: { label: string }) {
  return (
    <span className="group flex shrink-0 cursor-default items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-stone transition-colors duration-200 hover:text-aqua-bright hover:[text-shadow:0_0_14px_rgba(45,212,191,0.6)]">
      <span className="h-1 w-1 rounded-full bg-aqua/60 transition-all duration-200 group-hover:scale-150 group-hover:bg-aqua-bright" aria-hidden="true" />
      {label}
    </span>
  );
}

/** Credibility strip as a slow horizontal marquee (a distinct motion type).
 *  Reduced-motion renders a single static centered row instead. */
export function CredibilityStrip() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section
        aria-label="Areas of focus"
        className="border-t border-line bg-surface/30 py-6"
      >
        <ul className="container-edge flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {credibility.map((c) => (
            <li key={c}>
              <Marker label={c} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section
      aria-label="Areas of focus"
      className="relative overflow-hidden border-t border-line bg-surface/30 py-6"
    >
      <div className="marquee-track flex w-max">
        <div className="flex shrink-0 items-center gap-10 pr-10">
          {credibility.map((c) => (
            <Marker key={c} label={c} />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center gap-10 pr-10"
        >
          {credibility.map((c) => (
            <Marker key={`dup-${c}`} label={c} />
          ))}
        </div>
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent" />
    </section>
  );
}
