"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { dur, ease, easeDraw } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { useEnterOnce, type EnterPhase } from "@/components/primitives/use-enter-once";
import { GraphiteFilter, RD_PIECES, useFid } from "@/components/worlds/rdr2/kit";
import s from "@/components/worlds/rdr2/rdr2.module.css";

/* ============================================================================
   THE SATCHEL — IC-RD-11 redrawn (RECOGNIZABILITY S14 "satchel", F23): a
   leather satchel in graphite (flap, strap, buckle, stitching) with Aryan's
   REAL kit beside it — camera (photography), sketchbook and charcoal
   (drawing), drone (videography), running shoes (cross country). Only true
   objects: no hat, no gun, nothing he doesn't carry. Each item ≥ 48 px
   (64 here), labelled in Meta, ≤ 2 words (B5). The drone is his own and
   stays apart from the 3 Idiots quadcopter. The caption (cap.beyond.
   satchel, `head`) is passed in by the section.

   DEFAULT "spill": the satchel is sketched, its flap lifts, and the kit
   slides out of its mouth one piece at a time, each drawn as it lands.
   ALT "inventory": the kit is laid out in a ruled ledger; each piece is
   drawn in turn and ticked off in pencil; the satchel is drawn last, its
   flap buckled shut — packed.

   One-shot on entry; SSR / no-JS / reduced motion / Pause = the final
   drawing. Art aria-hidden; the labels are real text in a list.
   ========================================================================== */

type Kit = { label: string; strokes: string[]; heavy?: number };

/* viewBox 0 0 48 48 (rendered at 64 px) */
const KIT: readonly Kit[] = [
  {
    label: "Camera",
    strokes: [
      "M8 17 h8 l3 -5 h10 l3 5 h8 a3 3 0 0 1 3 3 v16 a3 3 0 0 1 -3 3 h-32 a3 3 0 0 1 -3 -3 v-16 a3 3 0 0 1 3 -3 Z",
      "M17 28 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M21 28 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0",
      "M36 21 h3 M8 22 h4",
    ],
  },
  {
    label: "Sketchbook",
    strokes: [
      "M10 9 h22 a2 2 0 0 1 2 2 v27 a2 2 0 0 1 -2 2 h-22 Z M10 14 h-3 M10 21 h-3 M10 28 h-3 M10 35 h-3",
      "M15 31 c4 -7 8 -1 13 -9 M15 34 h14",
      "M39 40 L45 24",
    ],
    heavy: 2, // the charcoal stick
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
      "M5 37 h41 M19 23 l4 3 M17 26 l4 3 M9 40 l2 -3 M16 40 l2 -3 M23 40 l2 -3 M30 40 l2 -3 M37 40 l2 -3",
    ],
  },
];

/* The satchel, viewBox 0 0 200 170 (leather body, strap, flap, buckle). */
const BAG = {
  strap: "M34 74 C28 -10 172 -10 166 74 M44 74 C40 4 160 4 156 74",
  body: "M26 74 L174 74 L168 156 Q166 164 158 164 L42 164 Q34 164 32 156 Z",
  stitch: "M36 84 L164 84 M40 154 L160 154",
  /** DEFAULT: the flap thrown back, open (the kit spills from the mouth). */
  flapOpen: "M28 74 L20 50 Q100 34 180 50 L172 74",
  /** ALT: the flap buckled shut over the body. */
  flapShut: "M26 74 L174 74 L170 122 Q100 138 30 122 Z",
  strapFront: "M100 130 L100 150",
  buckle: "M90 120 h20 v14 h-20 Z M100 120 v14",
  hatch: "M40 150 l10 -10 M52 150 l10 -10 M64 150 l10 -10 M136 150 l10 -10 M148 150 l10 -10",
} as const;

/* A pencil tick (ALT ledger), viewBox 0 0 20 20. */
const TICK = "M3 11 L8 16 L17 4";

function draw(phase: EnterPhase, delay: number, duration: number = dur.draw.short) {
  return {
    initial: false as const,
    animate: { pathLength: phase === "armed" ? 0 : 1 },
    transition: phase === "entered" ? { duration, ease: easeDraw, delay } : { duration: 0 },
  };
}

function fade(phase: EnterPhase, delay: number) {
  return {
    initial: false as const,
    animate: { opacity: phase === "armed" ? 0 : 1 },
    transition: phase === "entered" ? { duration: dur.base, ease, delay } : { duration: 0 },
  };
}

function Bag({ phase, shut, start, fid }: { phase: EnterPhase; shut: boolean; start: number; fid: string }) {
  return (
    <svg
      viewBox="0 0 200 170"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-44 overflow-visible sm:w-52"
      data-motif="satchel-bag"
    >
      <defs>
        <GraphiteFilter id={`bag-${fid}`} />
      </defs>
      <g filter={`url(#bag-${fid})`} fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-(--world-line)">
        <motion.path d={BAG.strap} strokeWidth={1.5} {...draw(phase, start, dur.draw.med)} />
        <motion.path d={BAG.body} strokeWidth={1.8} {...draw(phase, start + 0.2, dur.draw.med)} />
        <motion.path d={BAG.stitch} strokeWidth={1} strokeDasharray="3 4" {...fade(phase, start + 0.9)} />
        <motion.path d={BAG.hatch} strokeWidth={0.9} strokeOpacity={0.7} {...fade(phase, start + 1)} />
        {shut ? (
          <>
            <motion.path d={BAG.flapShut} strokeWidth={1.8} {...draw(phase, start + 0.6, dur.draw.short)} />
            <motion.path d={BAG.strapFront} strokeWidth={1.4} {...draw(phase, start + 1, 0.3)} />
            <motion.path d={BAG.buckle} strokeWidth={1.4} {...draw(phase, start + 1.1, 0.35)} />
          </>
        ) : (
          <>
            <motion.path d={BAG.flapOpen} strokeWidth={1.8} {...draw(phase, start + 0.6, dur.draw.short)} />
            <motion.path d={`${BAG.strapFront} ${BAG.buckle}`} strokeWidth={1.4} {...draw(phase, start + 0.9, 0.4)} />
          </>
        )}
      </g>
    </svg>
  );
}

function KitIcon({ kit, phase, delay, fid, i }: { kit: Kit; phase: EnterPhase; delay: number; fid: string; i: number }) {
  return (
    <svg viewBox="0 0 48 48" width={64} height={64} aria-hidden="true" focusable="false" className="overflow-visible">
      <defs>
        <GraphiteFilter id={`kit-${fid}-${i}`} />
      </defs>
      <g filter={`url(#kit-${fid}-${i})`} fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-(--world-line)">
        {kit.strokes.map((d, j) => (
          <motion.path
            key={d}
            d={d}
            strokeWidth={kit.heavy === j ? 3 : 1.3}
            {...draw(phase, delay + j * 0.18)}
          />
        ))}
      </g>
    </svg>
  );
}

export function Satchel({
  choice,
  caption,
  className,
}: {
  choice: VariantChoice;
  /** cap.beyond.satchel (place "head"), server-rendered. */
  caption?: ReactNode;
  className?: string;
}) {
  const v = useVariant(choice, RD_PIECES.satchel);
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.45 });
  const fid = useFid();
  const alt = v === "alt";
  const armed = phase === "armed";
  const entered = phase === "entered";

  // DEFAULT: the bag first (0–1.2 s), then each piece slides out of its mouth.
  // ALT: each piece drawn + ticked in turn, the bag drawn last.
  const itemStart = (i: number) => (alt ? 0.1 + i * 0.45 : 1.1 + i * 0.28);
  const bagStart = alt ? 0.1 + KIT.length * 0.45 : 0;

  return (
    <figure
      ref={ref}
      className={cn("m-0", className)}
      data-motif="satchel"
      data-piece={RD_PIECES.satchel}
      data-variant={v}
    >
      {caption ? <figcaption className="mb-tier-group">{caption}</figcaption> : null}
      <div className={s.satchel}>
        <Bag phase={phase} shut={alt} start={bagStart} fid={fid} />
        <ul aria-label="What I carry" className={cn(s.kit, alt && s.kitLedger)}>
          {KIT.map((k, i) => (
            <motion.li
              key={k.label}
              className="flex min-w-0 flex-col items-start gap-2"
              initial={false}
              animate={
                alt
                  ? { opacity: 1, x: 0, rotate: 0 }
                  : armed
                    ? { opacity: 0, x: -56, rotate: -8 }
                    : { opacity: 1, x: 0, rotate: 0 }
              }
              transition={entered && !alt ? { duration: dur.reveal, ease, delay: itemStart(i) - 0.15 } : { duration: 0 }}
            >
              <KitIcon kit={k} phase={phase} delay={itemStart(i)} fid={fid} i={i} />
              <span className="flex items-center gap-1.5 type-meta text-fg-muted">
                {k.label}
                {alt ? (
                  <svg viewBox="0 0 20 20" width={14} height={14} aria-hidden="true" focusable="false" className="shrink-0">
                    <motion.path
                      d={TICK}
                      fill="none"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-(--world-line)"
                      {...draw(phase, itemStart(i) + 0.4, 0.3)}
                    />
                  </svg>
                ) : null}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
