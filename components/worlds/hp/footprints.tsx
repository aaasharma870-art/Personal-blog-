import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/* ============================================================================
   MARAUDER'S-MAP FOOTPRINTS (IC-HP-06 grammar) — our own shoe prints, drawn
   for this page (a sole with an arch cut and a separate heel; never traced
   from the film's map). Ink only: no light, no glow, no text.

   The print is a RIGHT foot, toe up, in a 12 × 26 box; `side="left"` mirrors
   it. Rotate the host to walk it (180° = walking down the page, 90° = to the
   right). Pure (no hooks): server- and client-safe; always aria-hidden.
   ========================================================================== */

/** Right foot, toe up (12 × 26): the sole (arch cut on the inner edge), then the heel. */
export const PRINT_D =
  "M5.4 0.5C8.9 0.3 11.5 3 11.4 7.2C11.3 10.6 10.2 13 9.8 15.6C9.6 17.1 8.6 17.9 6.8 17.9C5 17.9 4.3 17 4.4 15.6C4.6 13.4 3.6 12 2.4 10.2C0.9 8 0.7 5.2 1.6 3.2C2.4 1.4 3.6 0.6 5.4 0.5Z" +
  "M6.9 19.6C9.2 19.6 10.3 21 10.2 22.8C10.1 24.7 8.6 25.6 6.8 25.6C4.9 25.6 3.6 24.6 3.6 22.8C3.6 21 4.8 19.6 6.9 19.6Z";

export const PRINT_BOX = { w: 12, h: 26 } as const;

/** One print as its own tiny SVG (`size` = CSS width in px). */
export function Footprint({
  side = "right",
  size = 10,
  className,
  style,
  fill = "currentColor",
}: {
  side?: "left" | "right";
  size?: number;
  className?: string;
  style?: CSSProperties;
  fill?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${PRINT_BOX.w} ${PRINT_BOX.h}`}
      width={size}
      height={(size * PRINT_BOX.h) / PRINT_BOX.w}
      aria-hidden="true"
      focusable="false"
      className={cn("block overflow-visible", className)}
      style={style}
      data-motif="footprint"
    >
      <path
        d={PRINT_D}
        fill={fill}
        transform={side === "left" ? `translate(${PRINT_BOX.w} 0) scale(-1 1)` : undefined}
      />
    </svg>
  );
}

/** A print inside another SVG, centred on (x, y), rotated `deg` (0 = toe
 *  up, 90 = toe right), scaled to `w` user units wide. */
export function PrintAt({
  x,
  y,
  deg,
  w,
  side,
  fill,
  opacity,
}: {
  x: number;
  y: number;
  deg: number;
  w: number;
  side: "left" | "right";
  fill: string;
  opacity?: number;
}) {
  const s = w / PRINT_BOX.w;
  const mirror = side === "left" ? `translate(${PRINT_BOX.w} 0) scale(-1 1)` : "";
  return (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${s.toFixed(3)}) translate(${-PRINT_BOX.w / 2} ${-PRINT_BOX.h / 2})`}
      opacity={opacity}
    >
      <path d={PRINT_D} fill={fill} transform={mirror || undefined} />
    </g>
  );
}

/** A walk of `n` alternating steps from `a` to `b` (user units): each step's
 *  centre, heading (deg, 0 = up) and side, offset ±`spread` across the path. */
export function walkBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
  n: number,
  spread: number,
): { x: number; y: number; deg: number; side: "left" | "right" }[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // heading: 0° = toe up (−y); atan2 of the direction, rotated so up = 0
  const deg = (Math.atan2(uy, ux) * 180) / Math.PI + 90;
  return Array.from({ length: n }, (_, k) => {
    const t = n === 1 ? 1 : k / (n - 1);
    const side: "left" | "right" = k % 2 ? "right" : "left";
    const off = (side === "left" ? -1 : 1) * spread;
    return {
      x: a.x + dx * t - uy * off,
      y: a.y + dy * t + ux * off,
      deg,
      side,
    };
  });
}
