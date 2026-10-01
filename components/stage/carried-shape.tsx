/* ============================================================================
   CARRIED SHAPE (spec §7.3) — OWNER: W2-CARDS.
   The css-tier fallback: a static SVG of the INCOMING carried shape, never
   animated (the GL tier morphs the same shapes as SDFs, lib/gl/shaders.ts
   `sd()`): the compass ring (32 ticks, IC-PC-02: never a ship's wheel) folds
   into the 12-tooth gauge gear on the seam; the wagon wheel (12 spokes,
   IC-RD-04) → ring → the snitch (sphere + two wings, IC-HP-12, AT REST) on
   the ignite. Server markup, aria-hidden, no hooks; the host places and
   sizes it (a square box) and fades it by state. The geometry mirrors the
   SDFs (unit circle: ring r .8, gear r .7 + teeth to .93, wheel rim .86,
   hub .15, snitch sphere .3 + wings), so the two tiers draw one shape.
   ========================================================================== */

export type CarriedShapeId = "ring32" | "gear12" | "wheel12" | "snitch";

export type CarriedShapeProps = {
  shape: CarriedShapeId;
  className?: string;
};

const R = 100;
const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;

/** 32 ticks on the compass ring (every 8th long: the cardinal marks). */
const RING_TICKS = Array.from({ length: 32 }, (_, i) => {
  const a = (i / 32) * Math.PI * 2;
  const r0 = i % 8 === 0 ? 0.74 * R : 0.86 * R;
  return `M${pt(r0, a)}L${pt(0.98 * R, a)}`;
}).join("");

/** The 12-tooth gauge gear (rim .7, teeth to .93, bore .28). */
const GEAR = (() => {
  let d = "";
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const s = (Math.PI * 2) / n;
    d += `${i ? "L" : "M"}${pt(0.7 * R, a - s * 0.5)}L${pt(0.7 * R, a - s * 0.22)}L${pt(0.93 * R, a - s * 0.16)}L${pt(0.93 * R, a + s * 0.16)}L${pt(0.7 * R, a + s * 0.22)}`;
  }
  return `${d}Z`;
})();

/** 12 spokes from the hub (.15) to the rim (.86). */
const SPOKES = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return `M${pt(0.15 * R, a)}L${pt(0.82 * R, a)}`;
}).join("");

export function CarriedShape({ shape, className }: CarriedShapeProps) {
  return (
    <svg
      viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`}
      aria-hidden="true"
      focusable="false"
      className={className}
      data-carried-shape={shape}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shape === "ring32" ? (
        <g stroke="var(--w-brass)">
          <circle r={0.8 * R} strokeWidth={6} />
          <path d={RING_TICKS} strokeWidth={3} />
        </g>
      ) : null}
      {shape === "gear12" ? (
        <g stroke="var(--w-chalk)">
          <path d={GEAR} strokeWidth={5} />
          <circle r={0.28 * R} strokeWidth={5} />
        </g>
      ) : null}
      {shape === "wheel12" ? (
        <g stroke="var(--w-bone)">
          <circle r={0.86 * R} strokeWidth={10} />
          <circle r={0.15 * R} strokeWidth={8} />
          <path d={SPOKES} strokeWidth={6} />
        </g>
      ) : null}
      {shape === "snitch" ? (
        <g>
          {/* the wings, at rest (it never flies off) */}
          <path
            d="M-26 -6C-60 -40 -104 -34 -98 -14C-92 4 -58 6 -26 4Z M26 -6C60 -40 104 -34 98 -14C92 4 58 6 26 4Z"
            fill="var(--w-bone)"
            fillOpacity={0.85}
            stroke="var(--w-ink-contour)"
            strokeWidth={2}
          />
          <circle r={0.3 * R} fill="var(--w-ink-contour)" />
          <path d="M-22 -8C-8 -2 8 -2 22 -8M-22 8C-8 14 8 14 22 8" stroke="#7a5a1c" strokeOpacity={0.7} strokeWidth={2} />
        </g>
      ) : null}
    </svg>
  );
}
