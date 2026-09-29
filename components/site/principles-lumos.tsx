"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { principles, type Principle } from "@/lib/content";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/world-kit";
import { PatronusRibbons } from "@/components/site/hp-ink";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { FloatingCandle } from "@/components/worlds/hp/floating-candle";
import { CANDLE_FLAME_AT } from "@/components/worlds/hp/sprites";

/* ============================================================================
   PRINCIPLES · ALT "lumos-candles" (RECOGNIZABILITY S18 alt, T11 alt; ICONS
   IC-HP-03 floating candles). The Great Hall's candles persist into the
   section: a field of small floating candles hangs in the section's top
   margin (the enchanted ceiling, never over text), and each principle has
   its own floating candle (a 24 × 72 px taper) that LIGHTS as its row
   enters — a wand-tip light (the Lumos sprite) touches the wick and the
   flame catches (one crossfade). The HP-07 ribbons stay as the underline.
   All light is sprites (Law 1). Static (server HTML, reduced motion /
   Pause, no JS, already in view): every candle lit, no spark.
   ========================================================================== */

export function PrinciplesLumos({ ribbons }: { ribbons: boolean }) {
  return (
    <ol aria-label="Operating principles" className="mt-tier-block border-t border-rule">
      {principles.map((p, i) => (
        <LumosRow key={p.n} p={p} index={i} ribbons={ribbons} />
      ))}
    </ol>
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
      className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 gap-y-tier-pair border-b border-rule py-tier-block sm:grid-cols-12 sm:gap-x-6"
      data-candle-row={index + 1}
    >
      <div aria-hidden="true" className="relative row-span-3 flex justify-center sm:col-span-1 sm:row-span-1">
        <span className="relative -mt-3 block">
          <FloatingCandle lit={lit} width={24} lightDelayMs={spark ? 280 : 0} />
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
  const size = 28;
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

/* — The enchanted ceiling: small lit candles in the section's top margin — */

/** Deterministic 0–1 hash (integer math: server and client agree). */
function h01(i: number, salt: number): number {
  const x = (Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 11, 40503)) >>> 0;
  return (x % 10007) / 10007;
}

const FIELD = Array.from({ length: 20 }, (_, i) => {
  // spread across the width in 20 lanes, jittered; depth = size + opacity
  const depth = h01(i, 3);
  return {
    x: ((i + 0.2 + h01(i, 1) * 0.6) / 20) * 100,
    y: 14 + h01(i, 2) * 56,
    w: 5 + Math.round(depth * 8),
    o: 0.42 + depth * 0.5,
    mobile: i % 3 === 1,
  };
});

/** The hall's candles, persisting over the section head (alt only). They
 *  hang in the top padding band (never over text), static, lit. */
export function CeilingCandles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-full h-(--section-pad)"
      data-motif="ceiling-candles"
    >
      {FIELD.map((c, i) => (
        <span
          key={i}
          className={cn("absolute", c.mobile ? "block" : "hidden sm:block")}
          style={{ left: `${c.x.toFixed(2)}%`, top: `${c.y.toFixed(2)}%`, opacity: c.o }}
        >
          <FloatingCandle lit width={c.w} />
        </span>
      ))}
    </div>
  );
}
