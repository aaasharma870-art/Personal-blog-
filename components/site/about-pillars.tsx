"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { pillars } from "@/lib/content";
import { useReducedMotion } from "@/lib/flags";
import { easeDraw } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import { cn } from "@/lib/utils";
import type { VariantChoice } from "@/lib/variants";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { Rise } from "@/components/site/world-motion";
import { JackCompass, type CompassLid } from "@/components/worlds/pirates/jack-compass";

/* ============================================================================
   The four pillars as four BEARINGS around JACK'S COMPASS (SPEC v2 §3 row 1,
   TA-06; RECOGNIZABILITY S05: "replace the faint rhumb rose at the pillar
   hub with Jack's compass at 120 px, lid open; the red arrow turns toward
   the hovered or focused pillar (IC-PC-03, 'points to what you want most')
   and settles on pillar 1 at rest"). Desktop: a 2 × 2 chart whose centre
   cross holds the compass; each pillar sits in its quadrant under its Meta
   bearing (NW · NE · SW · SE = the needle's true headings 315 · 45 · 225 ·
   135). Below lg the compass leads a plain list. Copy verbatim (content.ts
   `pillars`); the compass is aria-hidden (the facts are the text).

   TWO CHOREOGRAPHIES (lib/variants.ts `about.compass`):
     default "true-north"      — the lid is open on its star chart; the first
       time the compass scrolls into view it spins a full turn and settles
       on pillar 1; hovering or focusing a pillar turns the arrow to it and
       lights that pillar's bearing in brass.
     alt "taking-bearings"     — the compass arrives SHUT; on entry the lid
       swings open, then the arrow takes the four bearings in turn (NW → NE
       → SW → SE), each plotting a brass bearing line out toward its pillar
       (desktop) and lighting its bearing, then returns to NW. Afterwards,
       hover / focus behave as the default.
   Reduced motion / Pause / already in view: the final state, static.
   ========================================================================== */

const BEARINGS = ["NW", "NE", "SW", "SE"] as const;
const HEADINGS = [315, 45, 225, 135] as const;
/** The alt's bearing sweep: lid opens at 0, bearings every 460 ms, home. */
const SWEEP = { lid: 0, first: 520, every: 460, home: 520 } as const;

/** Bearing lines from the case rim outward (desktop hub SVG, 280 × 280). */
const RAYS = HEADINGS.map((deg) => {
  const a = (deg * Math.PI) / 180;
  const p = (r: number) => `${(140 + r * Math.sin(a)).toFixed(1)} ${(140 - r * Math.cos(a)).toFixed(1)}`;
  return { line: `M${p(66)} L${p(104)}`, dot: p(104).split(" ").map(Number) as [number, number] };
});

export function AboutPillars({ choice }: { choice: VariantChoice }) {
  const variant = useVariant(choice, "about.compass");
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const phase = useEnterOnce(listRef, { amount: 0.45 });
  const [aim, setAim] = useState<number | null>(null);
  // the alt's sweep: -1 = not started; 0–3 = taking bearing k; 4 = done
  const [sweep, setSweep] = useState(-1);

  const alt = variant === "alt";
  const settled = reduced || phase === "static";

  useEffect(() => {
    if (!alt || phase !== "entered" || reduced) return;
    const timers = [0, 1, 2, 3, 4].map((k) =>
      window.setTimeout(
        () => setSweep(k),
        SWEEP.first + k * SWEEP.every + (k === 4 ? SWEEP.home - SWEEP.every : 0),
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [alt, phase, reduced]);

  // what the compass does now
  let heading: number = HEADINGS[aim ?? 0];
  let lid: CompassLid = "open";
  let plotted = 4; // bearing lines drawn (alt)
  let lit: number | null = aim ?? 0; // the pillar whose bearing is brass
  if (alt && !settled) {
    if (phase === "armed" || sweep < 0) {
      lid = phase === "armed" ? "shut" : "open";
      heading = 0;
      plotted = 0;
      lit = null;
    } else if (sweep < 4) {
      heading = HEADINGS[sweep] ?? 0;
      plotted = sweep + 1;
      lit = sweep;
    }
  }

  const draw = reduced ? { duration: 0 } : { duration: 0.42, ease: easeDraw };

  return (
    <div className="relative">
      {/* the compass: in the centre cross on desktop, leading the list below */}
      <div className="mb-tier-group lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:mb-0 lg:size-0">
        {alt ? (
          <svg
            viewBox="0 0 280 280"
            aria-hidden="true"
            focusable="false"
            className="absolute left-0 top-0 hidden size-[280px] -translate-x-1/2 -translate-y-1/2 overflow-visible lg:block"
            fill="none"
          >
            {RAYS.map((r, k) => (
              <g key={r.line}>
                <motion.path
                  d={r.line}
                  className="stroke-(--w-brass)"
                  strokeWidth={1.25}
                  strokeLinecap="square"
                  initial={false}
                  animate={{ pathLength: k < plotted ? 1 : 0, opacity: k < plotted ? 1 : 0 }}
                  transition={draw}
                />
                <motion.circle
                  cx={r.dot[0]}
                  cy={r.dot[1]}
                  r={3}
                  className="fill-(--w-brass)"
                  initial={false}
                  animate={{ opacity: k < plotted ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.2, delay: 0.3 }}
                />
              </g>
            ))}
          </svg>
        ) : null}
        {/* the CASE centre on the cross: the lid rises above it
            (-63.89 % = CASE_CENTER of the compass box, 92 / 144) */}
        <div className="lg:absolute lg:left-0 lg:top-0 lg:-translate-x-1/2 lg:-translate-y-[63.89%]">
          <JackCompass heading={heading} lid={lid} huntOnEnter={!alt} className="w-24 lg:w-[120px]" />
        </div>
      </div>
      <ol
        ref={listRef}
        aria-label="Four operating pillars"
        className="grid grid-cols-1 gap-y-tier-block sm:grid-cols-2 sm:gap-x-12 lg:gap-x-40 lg:gap-y-24"
      >
        {pillars.map((p, i) => (
          <Rise
            as="li"
            key={p.index}
            delay={i * 0.06}
            className="max-w-[34ch]"
          >
            <div
              onPointerEnter={() => setAim(i)}
              onPointerLeave={() => setAim(null)}
              onFocus={() => setAim(i)}
              onBlur={() => setAim(null)}
            >
              <p className="type-meta text-fg-muted">
                <span className="tnum">{p.index}</span>
                <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                <span
                  className={cn(
                    "transition-colors duration-(--dur-micro) motion-off:transition-none",
                    lit === i && "text-(--w-brass)",
                  )}
                >
                  {BEARINGS[i]}
                </span>
              </p>
              <h3 className="mt-tier-pair type-heading text-fg">{p.title}</h3>
              <p className="mt-tier-pair type-body text-fg-muted">{p.body}</p>
            </div>
          </Rise>
        ))}
      </ol>
    </div>
  );
}
