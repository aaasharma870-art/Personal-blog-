"use client";

import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { dur, easeDraw } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { drawn, faded, useDrawPhase } from "@/components/site/world-motion";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/* ============================================================================
   RDR2 GRAPHITE — Act III "The Frontier" (SPEC v2 SM-15, SM-11, SM-16;
   ICONS IC-RD-01/04/07; rdr2 STUDY R-1). Everything is pencil: the world's
   `line` ink (--world-line: --w-pencil on the dark rd planes, --paper-pencil
   on the journal paper), 1.4 px, with our own R-1 paper-tooth filter on the
   static layer. "Kept by hand" (RD-P1): marks draw ONCE; motion off = drawn.
   No light in the DOM (Law 1): the campfire here is a pencil sketch, the
   fire's glow belongs to MV-11 media when it is accepted.
   ========================================================================== */

/** R-1 graphite: a slight wobble plus paper tooth (our own filter). */
function GraphiteFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="g" />
      <feDisplacementMap in="SourceGraphic" in2="g" scale="1.2" result="w" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.25" result="tooth" />
      <feComposite in="w" in2="tooth" operator="in" />
    </filter>
  );
}

const useFid = () => useId().replace(/:/g, "");

/* — IC-RD-07 running-shoe prints beside a dashed pencil trail (Athletics) — */

const FORE =
  "M0 -12 C4 -12 5.5 -7 5 -3 C4.6 0 2.5 1 0 1 C-2.5 1 -4.6 0 -5 -3 C-5.5 -7 -4 -12 0 -12 Z";
const HEEL =
  "M0 4 C3 4 3.6 7 3.4 9 C3.2 11.5 1.8 12.5 0 12.5 C-1.8 12.5 -3.2 11.5 -3.4 9 C-3.6 7 -3 4 0 4 Z";

/** Prints along a gentle S of stride ≈ 30 (human prints: it is his running). */
const PRINTS = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  const x = 22 + t * 236;
  const y = 44 - 16 * Math.sin(t * Math.PI * 1.2);
  const dx = 236;
  const dy = -16 * Math.PI * 1.2 * Math.cos(t * Math.PI * 1.2);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // soles point along the trail
  const side = i % 2 === 0 ? -1 : 1;
  const nx = -dy / Math.hypot(dx, dy);
  const ny = dx / Math.hypot(dx, dy);
  return { x: x + side * 7 * nx, y: y + side * 7 * ny, ang };
});

export function ShoePrints({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.5);
  const fid = useFid();
  return (
    <svg
      ref={ref}
      viewBox="0 0 280 80"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-full max-w-[17.5rem] overflow-visible", className)}
      data-motif="shoe-prints"
    >
      <defs>
        <GraphiteFilter id={`g-${fid}`} />
      </defs>
      <g filter={`url(#g-${fid})`} className="fill-none stroke-(--world-line)" strokeWidth={1.1} strokeLinejoin="round">
        {PRINTS.map((p, i) => (
          <motion.g
            key={i}
            transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.ang.toFixed(1)}) scale(0.62)`}
            {...faded(phase, { delay: 0.15 + i * 0.13 })}
          >
            <path d={FORE} />
            <path d={HEEL} />
          </motion.g>
        ))}
      </g>
    </svg>
  );
}

/* — IC-RD-01 journal vignettes: five graphite sketches (Writing) ——————— */

const VIGNETTES: Record<string, { strokes: string[]; fill?: string }> = {
  // "How I try not to fool myself" — a balance scale
  scale: {
    strokes: [
      "M32 10 L32 52 M22 54 L42 54 M12 18 L52 18",
      "M12 18 L6 32 M12 18 L18 32 M52 18 L46 32 M52 18 L58 32",
      "M5 32 Q12 40 19 32 M45 32 Q52 40 59 32",
    ],
  },
  // "The kill-list" — a small town plan, crossed out with one graphite X
  plan: {
    strokes: [
      "M10 12 h14 v10 h-14 Z M28 12 h10 v10 h-10 Z M42 12 h12 v14 h-12 Z",
      "M10 28 h10 v12 h-10 Z M24 30 h14 v8 h-14 Z M42 32 h12 v10 h-12 Z M10 46 h20 v8 h-20 Z M34 46 h20 v8 h-20 Z",
      "M6 8 L58 58 M58 8 L6 58",
    ],
  },
  // "From Pine Script to a real pipeline" — a rail line
  rail: {
    strokes: [
      "M4 50 C20 44 38 28 56 12",
      "M10 58 C26 52 44 36 62 20",
      "M11 45 L15 53 M20 40 L25 48 M29 34 L34 42 M38 27 L43 35 M46 21 L51 29 M54 15 L59 23",
    ],
  },
  // "What wrestling and cross country taught me" — a contour trail
  contour: {
    strokes: [
      "M12 32 C12 18 26 10 36 14 C48 18 54 28 50 40 C46 52 30 56 20 50 C14 46 12 40 12 32 Z",
      "M22 32 C22 24 30 20 36 23 C42 26 44 32 41 38 C38 44 30 45 26 42 C23 40 22 36 22 32 Z",
      "M4 60 C14 54 20 44 30 40 C38 36 44 30 60 6",
    ],
  },
  // "Mandarin and global markets" — one brush-like stroke
  brush: {
    strokes: ["M10 48 C20 34 32 24 46 18 C52 16 56 17 58 20"],
    fill: "M8 46 C18 31 31 21 45 16 C51 14 57 15 59 19 C53 19 47 21 41 25 C31 31 21 39 13 49 Z",
  },
};
const VIGNETTE_ORDER = ["scale", "plan", "rail", "contour", "brush"] as const;

/** A 64 px graphite vignette for journal entry `index` (drawn once, static
 *  under reduced motion; the SPEC's inline form, used at every width in M1). */
export function JournalVignette({ index, className }: { index: number; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.6);
  const fid = useFid();
  const v = VIGNETTES[VIGNETTE_ORDER[index % VIGNETTE_ORDER.length] ?? "scale"] ?? VIGNETTES.scale!;
  return (
    <svg
      ref={ref}
      viewBox="0 0 64 64"
      width={64}
      height={64}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 overflow-visible", className)}
      data-motif="journal-vignette"
    >
      <defs>
        <GraphiteFilter id={`v-${fid}`} />
      </defs>
      <g filter={`url(#v-${fid})`}>
        {v.fill ? (
          <motion.path d={v.fill} className="fill-(--world-line)" fillOpacity={0.85} {...faded(phase, { delay: 0.5 })} />
        ) : null}
        {v.strokes.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            className="stroke-(--world-line)"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...drawn(phase, { duration: dur.draw.short, delay: i * 0.25 })}
          />
        ))}
      </g>
    </svg>
  );
}

/* — HP-05 re-hosted: the h2 that writes itself in pencil (Writing) ———— */

/**
 * NibTitle — the real heading text, revealed once left → right behind a
 * moving graphite nib point (≤ 1.4 s), then one red pencil underline (the
 * rdr2 `pencil-underline` emphasis: --world-emphasis = --paper-red on the
 * journal). The text is in the DOM, final, from first paint; only an element
 * that mounted offscreen is ever masked.
 */
export function NibTitle({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.5 });
  const fid = useFid();
  const armed = phase === "armed";
  const entered = phase === "entered";
  const WRITE = 1.3;
  return (
    <h2 ref={ref} id={id} className={cn("relative", className)}>
      <motion.span
        className="block"
        initial={false}
        animate={{ clipPath: armed ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)" }}
        transition={entered ? { duration: WRITE, ease: [0.45, 0.05, 0.55, 0.95] } : { duration: 0 }}
      >
        {children}
      </motion.span>
      {entered ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[0.18em] left-0 size-1.5 rounded-full bg-(--world-line)"
          initial={{ left: "0%", opacity: 1 }}
          animate={{ left: "100%", opacity: [1, 1, 0] }}
          transition={{ duration: WRITE, ease: [0.45, 0.05, 0.55, 0.95], opacity: { duration: WRITE + 0.3, times: [0, 0.85, 1] } }}
        />
      ) : null}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-3 left-0 h-2.5 w-[min(100%,18ch)] overflow-visible"
        data-emphasis="pencil-underline"
      >
        <defs>
          <GraphiteFilter id={`u-${fid}`} />
        </defs>
        <motion.path
          d="M2 6 C90 3 190 8 290 5 S380 4 398 6"
          fill="none"
          className="stroke-(--world-emphasis)"
          strokeWidth={2.2}
          strokeLinecap="round"
          filter={`url(#u-${fid})`}
          initial={false}
          animate={{ pathLength: armed ? 0 : 1 }}
          transition={entered ? { duration: dur.draw.short, ease: easeDraw, delay: WRITE } : { duration: 0 }}
        />
      </svg>
    </h2>
  );
}

/* — IC-RD-04 the campfire, as a pencil sketch (Voices) —————————————— */

const STONES = Array.from({ length: 11 }, (_, k) => {
  const a = (k / 11) * Math.PI * 2;
  const x = 120 + 58 * Math.cos(a);
  const y = 158 + 15 * Math.sin(a);
  return `M${(x - 7).toFixed(1)} ${y.toFixed(1)} C${(x - 7).toFixed(1)} ${(y - 5).toFixed(1)} ${(x + 7).toFixed(1)} ${(y - 5).toFixed(1)} ${(x + 7).toFixed(1)} ${y.toFixed(1)} C${(x + 7).toFixed(1)} ${(y + 4).toFixed(1)} ${(x - 7).toFixed(1)} ${(y + 4).toFixed(1)} ${(x - 7).toFixed(1)} ${y.toFixed(1)} Z`;
}).join(" ");

export function CampfireSketch({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.45);
  const fid = useFid();
  return (
    <svg
      ref={ref}
      viewBox="0 0 240 190"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-full overflow-visible", className)}
      data-motif="campfire-sketch"
    >
      <defs>
        <GraphiteFilter id={`c-${fid}`} />
      </defs>
      <g filter={`url(#c-${fid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* two canvas tents, barely there behind the fire */}
        <motion.path
          d="M18 150 L60 74 L102 150 M60 74 L60 150 M50 150 L60 124 L70 150"
          className="stroke-(--world-quiet)"
          strokeOpacity={0.7}
          strokeWidth={1.2}
          {...drawn(phase, { duration: dur.draw.med })}
        />
        <motion.path
          d="M150 146 L188 84 L226 146 M188 84 L188 146"
          className="stroke-(--world-quiet)"
          strokeOpacity={0.55}
          strokeWidth={1.2}
          {...drawn(phase, { duration: dur.draw.med, delay: 0.15 })}
        />
        {/* the stone ring */}
        <motion.path d={STONES} className="stroke-(--world-line)" strokeWidth={1.3} {...drawn(phase, { duration: dur.draw.long, delay: 0.3 })} />
        {/* crossed logs */}
        <motion.path
          d="M82 156 L158 136 M86 138 L156 158 M96 150 L144 142"
          className="stroke-(--world-line)"
          strokeWidth={1.5}
          {...drawn(phase, { duration: dur.draw.short, delay: 0.7 })}
        />
        {/* the flame, as a drawn outline (its light belongs to media) */}
        <motion.path
          d="M120 142 C106 128 108 112 118 96 C119 108 128 112 126 124 C132 118 134 110 132 102 C144 116 140 134 126 142 Z M112 138 C106 130 108 122 112 116 C113 124 117 128 116 136"
          className="stroke-(--world-emphasis)"
          strokeWidth={1.4}
          {...drawn(phase, { duration: dur.draw.med, delay: 0.95 })}
        />
      </g>
    </svg>
  );
}

/* — IC-RD-11 the satchel: a pencil strip of his REAL kit (Beyond) ———————— */

const KIT: readonly { label: string; strokes: string[] }[] = [
  {
    label: "Camera",
    strokes: [
      "M8 17 h8 l3 -5 h10 l3 5 h8 a3 3 0 0 1 3 3 v16 a3 3 0 0 1 -3 3 h-32 a3 3 0 0 1 -3 -3 v-16 a3 3 0 0 1 3 -3 Z",
      "M17 28 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M21 28 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0",
    ],
  },
  {
    label: "Sketchbook",
    strokes: [
      "M10 9 h22 a2 2 0 0 1 2 2 v27 a2 2 0 0 1 -2 2 h-22 Z M10 14 h-3 M10 21 h-3 M10 28 h-3 M10 35 h-3",
      "M15 31 c4 -7 8 -1 13 -9",
      "M38 38 L45 23",
    ],
  },
  {
    label: "Drone",
    strokes: [
      "M20 20 h8 v8 h-8 Z M20 20 L13 13 M28 20 L35 13 M20 28 L13 35 M28 28 L35 35",
      "M7 13 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M29 13 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M7 35 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M29 35 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
    ],
  },
  {
    label: "Running shoes",
    strokes: [
      "M5 33 c0 -4 3 -6 7 -6 l6 -8 c2 -2 4 -2 5 0 l3 5 c4 3 10 4 15 5 c3 1 5 3 5 6 v2 h-41 Z",
      "M5 37 h41 M19 23 l4 3 M17 26 l4 3",
    ],
  },
];

/**
 * SatchelStrip (IC-RD-11) — what he carries: four true objects from the
 * Beyond facts (photography, drawing, drone videography, cross country),
 * pencil-sketched once as the strip enters; the labels are real text (Meta,
 * ≤ 2 words). The drone is his own, kept apart from the 3 Idiots doodle.
 */
export function SatchelStrip({ className }: { className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const phase = useDrawPhase(ref, 0.5);
  const fid = useFid();
  return (
    <ul ref={ref} aria-label="What I carry" className={cn("flex flex-wrap gap-x-8 gap-y-tier-group", className)} data-motif="satchel">
      {KIT.map((k, i) => (
        <li key={k.label} className="flex flex-col items-start gap-2">
          <svg viewBox="0 0 48 48" width={48} height={48} aria-hidden="true" focusable="false" className="overflow-visible">
            <defs>
              <GraphiteFilter id={`s-${fid}-${i}`} />
            </defs>
            <g filter={`url(#s-${fid}-${i})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {k.strokes.map((d, j) => (
                <motion.path
                  key={d}
                  d={d}
                  className="stroke-(--world-line)"
                  strokeWidth={j === 2 && k.label === "Sketchbook" ? 3 : 1.4}
                  {...drawn(phase, { duration: dur.draw.short, delay: i * 0.18 + j * 0.2 })}
                />
              ))}
            </g>
          </svg>
          <span className="type-meta text-fg-muted">{k.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* — HP-03′ re-hosted: the lead quote READ INTO FIRELIGHT (Voices) —————— */

/**
 * FirelightRead — a one-shot mask from --fg-muted to --fg (both AA), 1.2 s,
 * travelling from the fire's side (right → left). No glow, no text-shadow,
 * no filter on text (Law 1): an ink copy is un-masked over the muted one.
 * Server HTML, motion off, and anything already in view at mount = plain
 * ink (the overlay only exists while it can play).
 */
export function FirelightRead({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.6 });
  const live = phase !== "static";
  return (
    <div ref={ref} className={cn("relative", className)} data-motif="firelight-read">
      <div className={live ? "text-fg-muted" : "text-fg"}>{children}</div>
      {live ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-fg"
          initial={false}
          animate={{ clipPath: phase === "armed" ? "inset(0 0 0 100%)" : "inset(0 0 0 0%)" }}
          transition={phase === "entered" ? { duration: 1.2, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}
