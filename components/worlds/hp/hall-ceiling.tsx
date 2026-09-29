import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { FloatingCandle } from "@/components/worlds/hp/floating-candle";
import { hash01 } from "@/components/worlds/hp/map-ink";
import { CEILING_CLOUDS, CEILING_NIGHT, STAR_TILE, STAR_TILE_SIZE } from "@/components/worlds/hp/sprites";

/* ============================================================================
   THE ENCHANTED CEILING (IC-HP-03 at section scale) — the Great Hall's
   night sky and its floating candles, carried out of the act-IV hall into
   Principles (alt) and Contact: a night-blue ground, drifting cloud banks,
   a star field, and fields of lit floating candles at several depths
   (far = small and dim, near = large and full).

   All light is pre-rendered images (the candle sprites, the star and cloud
   SVG images: Law 1); the night blue is a dark ground, not a light. Static
   (no bob, no twinkle): reduced motion / Pause / no JS need no special
   case. Pure (no hooks), deterministic: server- and client-safe.
   aria-hidden, pointer-events none. Hosts place the layers and keep them
   OFF text (candles) or dim under it (stars ≤ 22 %).
   ========================================================================== */

export type CandleSpot = {
  /** Centre x / flame-top y, % of the field box. */
  x: number;
  y: number;
  /** Taper width (px); height = 3 × w. */
  w: number;
  /** Opacity (depth). */
  o: number;
  /** Shown from this breakpoint up (always, when absent). */
  at?: "sm" | "lg" | "xl";
};

const AT = { sm: "hidden sm:block", lg: "hidden lg:block", xl: "hidden xl:block" } as const;

/**
 * spotsIn — `n` candles jittered across a box (% of the field), sized and
 * dimmed by depth: w in [w0, w1], opacity rising with size. Sorted far →
 * near so the near ones paint on top.
 */
export function spotsIn(
  n: number,
  seed: number,
  box: { x0: number; x1: number; y0: number; y1: number },
  size: { w0: number; w1: number; o0?: number; o1?: number },
  at?: CandleSpot["at"],
): CandleSpot[] {
  const { o0 = 0.5, o1 = 1 } = size;
  const out: CandleSpot[] = [];
  for (let i = 0; i < n; i++) {
    const d = hash01(i, seed + 3);
    out.push({
      x: box.x0 + ((i + 0.2 + hash01(i, seed + 1) * 0.6) / n) * (box.x1 - box.x0),
      y: box.y0 + hash01(i, seed + 2) * (box.y1 - box.y0),
      w: Math.round(size.w0 + d * (size.w1 - size.w0)),
      o: +(o0 + d * (o1 - o0)).toFixed(2),
      at,
    });
  }
  return out.sort((a, b) => a.w - b.w);
}

/** A field of lit floating candles (absolute; the host sizes the box). */
export function CandleField({
  spots,
  className,
  style,
}: {
  spots: readonly CandleSpot[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", className)} style={style} data-motif="candle-field">
      {spots.map((c, i) => (
        <span
          key={i}
          className={cn("absolute -translate-x-1/2", c.at ? AT[c.at] : "block")}
          style={{ left: `${c.x.toFixed(2)}%`, top: `${c.y.toFixed(2)}%`, opacity: c.o }}
        >
          <FloatingCandle lit width={c.w} />
        </span>
      ))}
    </div>
  );
}

/** The star field (a tiled image). `mask` keeps it dim under text. */
export function StarField({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      style={{
        backgroundImage: `url("${STAR_TILE}")`,
        backgroundSize: `${STAR_TILE_SIZE}px ${STAR_TILE_SIZE}px`,
        ...style,
      }}
      data-motif="ceiling-stars"
    />
  );
}

/** Cloud banks across the ceiling (stretched to the box). */
export function CeilingClouds({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      style={{ backgroundImage: `url("${CEILING_CLOUDS}")`, backgroundSize: "100% 100%", ...style }}
      data-motif="ceiling-clouds"
    />
  );
}

/** rgb() of the night blue at `a` (0–1). */
export function night(a: number): string {
  const r = parseInt(CEILING_NIGHT.slice(1, 3), 16);
  const g = parseInt(CEILING_NIGHT.slice(3, 5), 16);
  const b = parseInt(CEILING_NIGHT.slice(5, 7), 16);
  return `rgb(${r} ${g} ${b} / ${a})`;
}

/** The night-blue ground: a vertical gradient through `stops`
 *  ([alpha, position] pairs, positions as CSS lengths). */
export function NightSky({
  stops,
  className,
  style,
}: {
  stops: readonly (readonly [number, string])[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      style={{
        backgroundImage: `linear-gradient(to bottom, ${stops.map(([a, at]) => `${night(a)} ${at}`).join(", ")})`,
        ...style,
      }}
      data-motif="ceiling-night"
    />
  );
}
