"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { principles, type Principle } from "@/lib/content";
import { dur, ease } from "@/lib/motion";
import { Meta } from "@/components/site/world-kit";
import { PatronusRibbons } from "@/components/site/hp-ink";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { FloatingCandle } from "@/components/worlds/hp/floating-candle";
import { CANDLE_FLAME_AT } from "@/components/worlds/hp/sprites";
import {
  CandleField,
  CeilingClouds,
  NightSky,
  StarField,
  spotsIn,
  type CandleSpot,
} from "@/components/worlds/hp/hall-ceiling";

/* ============================================================================
   PRINCIPLES · ALT "lumos-candles" (RECOGNIZABILITY S18 alt, T11 alt; ICONS
   IC-HP-03 floating candles). THE GREAT HALL'S ENCHANTED CEILING carries on
   over the section: a night-blue sky with drifting cloud banks and stars,
   and fields of lit floating candles at several depths (far = small and
   dim) — over the section head from its first pixel, beside the h2 (≥ xl)
   and in each row's free right-hand corner (≥ sm). Each principle has its
   own floating candle (a 28 × 84 px taper) that LIGHTS as its row enters —
   a wand-tip light (the Lumos sprite) touches the wick and the flame
   catches (one crossfade). The HP-07 ribbons stay as the underline.

   T11 (alt): out of the act-IV hall the ground darkens to hp canvas, then
   the ceiling's night blue fades back in with its candles — the hall's
   candles persist as the principles' candles; no edge anywhere (the sky is
   a gradient from transparent, the stars are masked in).

   Legibility: candles never sit over text (they live in the head band,
   the head's right side above the caption, and each row's right corner);
   the stars dim to 18 % behind the text columns; the night blue keeps
   every text token ≥ 12 : 1. All light is sprites (Law 1). Static (server
   HTML, reduced motion / Pause, no JS, already in view): every candle lit,
   no spark.
   ========================================================================== */

const MASK = (m: string): CSSProperties => ({ maskImage: m, WebkitMaskImage: m });
const MASK2 = (a: string, b: string): CSSProperties => ({
  maskImage: `${a}, ${b}`,
  WebkitMaskImage: `${a}, ${b}`,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
});
/** Across the container (the ground layers overhang it by one gutter). */
const inC = (f: number) => `calc(var(--spacing-gutter) + ${f} * (100% - 2 * var(--spacing-gutter)))`;

/** The head band's candles (the hall's ceiling, over the section head). */
const BAND: readonly CandleSpot[] = [
  ...spotsIn(8, 11, { x0: 2, x1: 98, y0: 14, y1: 50 }, { w0: 8, w1: 20, o0: 0.55, o1: 1 }),
  ...spotsIn(14, 23, { x0: 1, x1: 99, y0: 6, y1: 40 }, { w0: 6, w1: 12, o0: 0.4, o1: 0.7 }, "sm"),
  ...spotsIn(7, 37, { x0: 4, x1: 96, y0: 30, y1: 58 }, { w0: 16, w1: 24, o0: 0.85, o1: 1 }, "lg"),
].sort((a, b) => a.w - b.w);

/** Beside the h2, above the caption (xl). */
const HEAD_SIDE = spotsIn(8, 51, { x0: 6, x1: 94, y0: 2, y1: 58 }, { w0: 9, w1: 20, o0: 0.5, o1: 1 }, "xl");

/** Each row's right-hand corner (sm+), one small constellation per row. */
const ROW_SIDE: readonly (readonly CandleSpot[])[] = principles.map((_, i) =>
  spotsIn(3, 61 + i * 7, { x0: 16, x1: 84, y0: 0, y1: 38 }, { w0: 10, w1: 20, o0: 0.55, o1: 0.95 }, "sm"),
);

export function PrinciplesLumos({ ribbons, head }: { ribbons: boolean; head: ReactNode }) {
  return (
    <div className="relative" data-motif="enchanted-ceiling">
      <CeilingGround />
      {/* the ceiling band over the head (reaches up into the section's top padding) */}
      <div aria-hidden="true" className="relative h-24 sm:h-36">
        <CandleField spots={BAND} className="inset-x-0 bottom-0 top-[calc(-1*var(--section-pad))]" />
      </div>
      <div className="relative">
        <CandleField spots={HEAD_SIDE} className="right-0 top-0 hidden h-[calc(100%-7.5rem)] w-[25rem] xl:block" />
        {head}
      </div>
      <ol aria-label="Operating principles" className="relative mt-tier-block border-t border-rule">
        {principles.map((p, i) => (
          <LumosRow key={p.n} p={p} index={i} ribbons={ribbons} />
        ))}
      </ol>
    </div>
  );
}

/** The night sky behind the whole stage: the blue ground, the clouds over
 *  the head, and the stars (full over the head and in the side bands, dim
 *  behind the text columns). */
function CeilingGround() {
  const box = "pointer-events-none absolute -z-10 left-[calc(-1*var(--spacing-gutter))] right-[calc(-1*var(--spacing-gutter))]";
  return (
    <div aria-hidden="true">
      <NightSky
        className={`${box} bottom-[calc(-0.5*var(--section-pad))] top-[calc(-1*var(--section-pad))]`}
        stops={[
          [0, "0px"],
          [0.92, "9rem"],
          [0.82, "36rem"],
          [0.5, "68rem"],
          [0.3, "70%"],
          [0, "100%"],
        ]}
      />
      <CeilingClouds
        className={`${box} top-[calc(-1*var(--section-pad))] h-[52rem]`}
        style={MASK("linear-gradient(to bottom, transparent, #000 16%, #000 55%, transparent)")}
      />
      {/* over the head: full */}
      <StarField
        className={`${box} top-[calc(-1*var(--section-pad))] h-[56rem]`}
        style={MASK("linear-gradient(to bottom, transparent, #000 8rem, #000 40rem, transparent)")}
      />
      {/* over the list: the side bands full, the text columns dim (sm+) */}
      <StarField
        className={`${box} bottom-0 top-[44rem] hidden sm:block`}
        style={MASK2(
          `linear-gradient(to right, #000 ${inC(0.06)}, rgb(0 0 0 / 0.18) ${inC(0.1)}, rgb(0 0 0 / 0.18) ${inC(0.74)}, #000 ${inC(0.79)})`,
          "linear-gradient(to bottom, transparent, #000 10rem, #000 70%, transparent)",
        )}
      />
    </div>
  );
}

function LumosRow({ p, index, ribbons }: { p: Principle; index: number; ribbons: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.45 });
  const lit = phase !== "armed";
  const spark = phase === "entered";
  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 gap-y-tier-pair border-b border-rule py-tier-block sm:grid-cols-12 sm:gap-x-6"
      data-candle-row={index + 1}
    >
      {/* the hall's candles in this row's free corner (below the thinker) */}
      <CandleField spots={ROW_SIDE[index]} className="bottom-[6%] right-0 top-[40%] hidden w-[20%] sm:block" />
      <div aria-hidden="true" className="relative row-span-3 flex justify-center sm:col-span-1 sm:row-span-1">
        <span className="relative -mt-4 block">
          <FloatingCandle lit={lit} width={28} lightDelayMs={spark ? 280 : 0} />
          {spark ? <LumosSpark /> : null}
        </span>
      </div>
      <Meta className="sm:col-span-1" fields={[p.n]} />
      <div className="sm:col-span-7">
        <h3 className="type-title text-fg">{p.title}</h3>
        {ribbons ? <PatronusRibbons className="mt-tier-pair" /> : null}
        <p className="mt-tier-group max-w-body type-body text-fg-muted">{p.body}</p>
      </div>
      {p.thinker ? <Meta className="sm:col-span-3 sm:text-right" fields={[p.thinker]} /> : null}
    </li>
  );
}

/** "Lumos": the cool wand-tip light blooms at the wick once and goes (a
 *  sprite; opacity + scale only), just before the flame catches. */
function LumosSpark() {
  const size = 30;
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute"
      style={{ left: `calc(${CANDLE_FLAME_AT.x * 100}% - ${size / 2}px)`, top: `calc(${CANDLE_FLAME_AT.y * 100}% - ${size / 2}px)` }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.9] }}
      transition={{ duration: dur.reveal, ease, times: [0, 0.35, 1] }}
      data-motif="lumos-spark"
    >
      <image href={LUMOS_SPRITE} width={24} height={24} />
    </motion.svg>
  );
}
