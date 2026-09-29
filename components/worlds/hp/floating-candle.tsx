import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { CANDLE_LIT_SPRITE, CANDLE_SPRITE_SIZE, CANDLE_UNLIT_SPRITE } from "@/components/worlds/hp/sprites";

/**
 * FloatingCandle (IC-HP-03) — one floating candle from the Great Hall at
 * page scale: a cream taper with no holder (it floats), and, when `lit`, a
 * teardrop flame with its halo. Both states are pre-rendered sprites
 * (components/worlds/hp/sprites.ts) inside one inline SVG, so the light is
 * an <image>, never DOM glow (Law 1). Lighting is a single opacity
 * crossfade (CSS, `lightMs`), instant under reduced motion / Pause
 * (motion-off). Static: no bob, no flicker, no loop.
 *
 * Pure (no hooks): server- and client-safe. aria-hidden, focusable=false.
 * `width` is the taper's CSS width in px (height = 3 × width); ≥ 24 px keeps
 * the taper ≥ 28 px tall where a candle must read at a glance (S18 alt).
 */
export function FloatingCandle({
  lit,
  width = 24,
  lightMs = 600,
  lightDelayMs = 0,
  className,
  style,
}: {
  lit: boolean;
  width?: number;
  /** Crossfade duration when the candle lights. */
  lightMs?: number;
  lightDelayMs?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { w, h } = CANDLE_SPRITE_SIZE;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={width}
      height={width * 3}
      aria-hidden="true"
      focusable="false"
      className={cn("block shrink-0 overflow-visible", className)}
      style={style}
      data-motif="floating-candle"
      data-lit={lit ? "" : undefined}
    >
      <image href={CANDLE_UNLIT_SPRITE} width={w} height={h} />
      <image
        href={CANDLE_LIT_SPRITE}
        width={w}
        height={h}
        className="transition-opacity ease-out motion-off:transition-none"
        style={{
          opacity: lit ? 1 : 0,
          transitionDuration: `${lightMs}ms`,
          transitionDelay: lit ? `${lightDelayMs}ms` : "0ms",
        }}
      />
    </svg>
  );
}
