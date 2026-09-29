"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { easeDraw } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ============================================================================
   THE CURSED MEDALLION (ICONS IC-PC-04; SPEC v2 SM-4; RECOGNIZABILITY S06:
   56 px) — the Aztec gold that shows its skeleton under the moonlight.
   Our own Aztec-style coin: a stepped (castellated) rim, an inner ring and a
   geometric sun face in brass. When `cursed` turns on, a moon-silver mask
   sweeps across it ONCE (≤ 1.1 s, easeDraw) and the coin reads as its
   moonlit skull: gold in-sample, a skeleton under the moonlight of
   out-of-sample. It decorates the verbatim step ("They failed
   out-of-sample"); it adds no event. Static under reduced motion (the host
   passes `cursed` = the moonlit state). Latching is the host's job. The SSR
   markup is the final state for the props it gets. aria-hidden.
   ========================================================================== */

const R = (deg: number) => (deg * Math.PI) / 180;
const f = (n: number) => n.toFixed(2);

/** The stepped rim: 16 teeth, square steps between r 23 and r 27. */
const RIM = (() => {
  const pts: string[] = [];
  const N = 16;
  for (let k = 0; k < N; k++) {
    const a0 = (k * 360) / N;
    const a1 = a0 + 360 / N / 2;
    const a2 = a0 + 360 / N;
    for (const [r, a] of [
      [27, a0],
      [27, a1],
      [23.2, a1],
      [23.2, a2],
    ] as const) {
      pts.push(`${f(r * Math.sin(R(a)))} ${f(-r * Math.cos(R(a)))}`);
    }
  }
  return `M${pts.join(" L")} Z`;
})();

/** The gold face: a geometric sun deity (eyes, brow, nose bar, mouth, rays). */
const SUN_FACE =
  "M-10 -5 H-3 M3 -5 H10 M-11 -9 L-2 -8 M2 -8 L11 -9 M0 -4 V5 M-6 9 H6 V12 H-6 Z";
const SUN_RAYS = Array.from({ length: 8 }, (_, k) => {
  const a = R(k * 45 + 22.5);
  return `M${f(16 * Math.sin(a))} ${f(-16 * Math.cos(a))} L${f(19.5 * Math.sin(a))} ${f(-19.5 * Math.cos(a))}`;
}).join(" ");

/** The moonlit skull: cranium + jaw, two sockets, the nose, the teeth. */
const SKULL =
  "M-12 1 C-12 -10 -6.5 -15.5 0 -15.5 C6.5 -15.5 12 -10 12 1 C12 5.5 9.5 7.5 7 8.5 L7 13 L-7 13 L-7 8.5 C-9.5 7.5 -12 5.5 -12 1 Z";
const TEETH = "M-3.5 13 V9.8 M0 13 V9.8 M3.5 13 V9.8";
const NOSE = "M0 3 L-2.2 7 H2.2 Z";

export function AztecMedallion({ cursed, className }: { cursed: boolean; className?: string }) {
  const reduced = useReducedMotion();
  const clip = `medallion-moon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const t = reduced ? { duration: 0 } : { duration: 1.1, ease: easeDraw };
  return (
    <svg
      viewBox="-30 -30 60 60"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-auto overflow-visible", className)}
      data-motif="aztec-medallion"
      data-cursed={cursed ? "" : undefined}
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <defs>
        <clipPath id={clip}>
          {/* the moonlight: a band that sweeps left → right across the coin */}
          <motion.rect
            y={-30}
            width={60}
            height={60}
            initial={false}
            animate={{ attrX: cursed ? -30 : -92 }}
            transition={t}
          />
        </clipPath>
      </defs>

      {/* the gold coin (always there; the moon layer covers its face) */}
      <circle r={28.5} className="fill-bg" />
      <path d={RIM} className="stroke-(--w-brass)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <circle r={20.5} className="stroke-(--w-brass)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={SUN_FACE} className="stroke-(--w-brass)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <path d={SUN_RAYS} className="stroke-(--w-brass)" strokeWidth={1} vectorEffect="non-scaling-stroke" />

      {/* the curse, revealed by the moonlight */}
      <g clipPath={`url(#${clip})`}>
        <circle r={20} className="fill-bg" />
        <path d={RIM} className="stroke-(--w-moon)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        <circle r={20.5} className="stroke-(--w-moon)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {/* a solid moon-silver skull with dark sockets: it reads at 32 px */}
        <path d={SKULL} className="fill-(--w-moon)" />
        <circle cx={-5} cy={-1.5} r={3.6} className="fill-bg" />
        <circle cx={5} cy={-1.5} r={3.6} className="fill-bg" />
        <path d={NOSE} className="fill-bg" />
        <path d={TEETH} className="stroke-bg" strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
      </g>

      {/* the moonlight's leading edge: a hairline that crosses once */}
      {reduced ? null : (
        <motion.line
          y1={-29}
          y2={29}
          className="stroke-(--w-moon)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={
            cursed
              ? { x1: [-30, 0, 30], x2: [-30, 0, 30], opacity: [0, 0.9, 0] }
              : { x1: -30, x2: -30, opacity: 0 }
          }
          transition={cursed ? { duration: 1.1, ease: easeDraw, times: [0, 0.5, 1] } : { duration: 0 }}
        />
      )}
    </svg>
  );
}
