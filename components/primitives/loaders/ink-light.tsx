"use client";

import { useEffect, useId, useRef } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { loader as loaderTiming } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, hash01, useSvgAttr } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, LINE_VIEWBOX } from "@/components/primitives/loaders/line";
import { FLAME_SPRITE, LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";

/**
 * LD-HP "The floating candles" (hp; SPEC v2 §8; M2 RECOGNIZABILITY S20,
 * caption cap.loader.hp "THE FLOATING CANDLES"). Harry Potter reveals: under
 * the Great Hall's ENCHANTED CEILING (a starry night-sky band that fades
 * into the hall), a row of FLOATING CANDLES (IC-HP-03) hangs at varied
 * heights, silhouetted against the stars; a cool point of light (the
 * wand-tip light, never the wand) travels the Line beneath them, and each
 * candle kindles as the light passes under it — one by one, the hall lights
 * up.
 *
 * M2 fix (BLIND-1: card 0.50–0.60, "ticks"): fewer, much bigger candles —
 * at card size each is a ~4 px cream taper 18–24 px tall with a ~22 px flame
 * and halo sprite (taper + flame + halo ≫ 12 px) — hung INTO the ceiling
 * band, so the lit card reads as "candles under the starry hall ceiling".
 *
 *   determinate    light at pathLength = progress (direct); ink behind it at
 *                  100 %, the rest of the Line a faint 35 % ink stroke;
 *                  candle k (of 7) lights exactly when progress ≥ (k + ½)/7
 *                  (the light is under it).
 *   indeterminate  the light breathes at the Line's start (opacity .6 ↔ 1 at
 *                  0.5 Hz) and the first 12 % of ink holds drawn — so the ONE
 *                  candle above that ink burns and the rest wait unlit (a
 *                  hall visibly not yet lit, never a blank card); frozen when
 *                  the shell's idle stop drops `animate`.
 *   complete       every candle lit; the light rests at the end.
 *   static         ink drawn, candles lit, the light at the end.
 * Flames and halos are ONE pre-rendered sprite each (Law 1 / L6: no CSS
 * glow); the ceiling is an SVG fill (never luminous paint); candles never
 * flicker (no loops on DOM sprites). 0 text (L7); tokens only (L17). `mini`
 * hangs four larger candles, no ceiling.
 */

const W = LINE_VIEWBOX.w;
/** Headroom above the Line for the hall (the ceiling and the candles), and
 *  the crop below it (the Line never dips under y = 300). */
const TOP = -330;
const BOTTOM = 330;
const VB_H = BOTTOM - TOP;
/** The enchanted ceiling: a night-sky band from the top, fading out by here. */
const CEIL_END = TOP + 330;
const CANDLES = 7;

type Candle = { x: number; y: number; at: number; h: number };
/** Candle k floats above the Line's point at (k + ½)/n, its base between
 *  y ≈ 30 and 120 (the flames up in the ceiling band), its height varied. */
function hang(n: number, big: number): Candle[] {
  return Array.from({ length: n }, (_, i) => {
    const at = (i + 0.5) / n;
    const q = LINE.at(Math.min(at, 0.93));
    const h = (150 + hash01(i, 9) * 50) * big;
    const base = 30 + hash01(i, 5) * 90;
    // the flame (wick + sprite) must stay under the viewBox top
    const flame = (14 + 180 * 0.62) * big;
    return { x: q.x, y: Math.max(TOP + h + flame + 8, Math.min(base, q.y - 70)), at, h };
  });
}
const HALL = hang(CANDLES, 1);
const HALL_MINI = hang(4, 1.5);
/** The ceiling's stars: small dots, and a few four-point glints (vector
 *  shapes, never glow). */
const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: 18 + hash01(i, 21) * 964,
  y: TOP + 16 + Math.pow(hash01(i, 33), 1.35) * 270,
  r: 3.5 + hash01(i, 41) * 4.5,
}));
const GLINTS = Array.from({ length: 6 }, (_, i) => ({
  x: 70 + ((i + hash01(i, 7) * 0.7) * 880) / 6,
  y: TOP + 34 + hash01(i, 13) * 170,
  s: 16 + hash01(i, 17) * 10,
}));
const glint = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x + s * 0.16} ${y - s * 0.16} ${x + s} ${y}Q${x + s * 0.16} ${y + s * 0.16} ${x} ${y + s}Q${x - s * 0.16} ${y + s * 0.16} ${x - s} ${y}Q${x - s * 0.16} ${y - s * 0.16} ${x} ${y - s}Z`;
/** The ceiling's night sky: a blue-grey mixed from the palette's own inks. */
const SKY = "color-mix(in oklab, var(--w-patronus) 26%, var(--hp-deep))";

export default function InkLightLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <InkLight key={props.mode} {...props} />;
}

function InkLight({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const skyId = useId();
  const scale = SIZE_PX[size] / W;
  const sw = (px: number) => px / scale;
  const one = useMotionValue(1);
  const start = useMotionValue(0.12);
  const p = mode === "determinate" ? progress : mode === "indeterminate" ? start : one;
  // candles: lit by the ink actually drawn (indeterminate: the first 12 %)
  const lit = p;
  const zero = useMotionValue(0);

  // indeterminate breathing of the light at the start
  const glow = useMotionValue(1);
  useEffect(() => {
    if (mode !== "indeterminate" || !running) return;
    const half = 1 / loaderTiming.inkBreatheHz / 2;
    const c = animate(glow, [glow.get(), 0.6, 1], { duration: half * 2, ease: "easeInOut", repeat: Infinity });
    return () => c.stop();
  }, [mode, running, glow]);
  useEffect(() => {
    if (reduced) glow.jump(1);
  }, [reduced, glow]);

  // the light's position along the Line (indeterminate: resting at the start)
  const lightAt: MotionValue<number> = mode === "indeterminate" ? zero : p;
  const light = useRef<SVGImageElement>(null);
  const size0 = mini ? 150 : 90;
  const xy = (v: number) => {
    const q = LINE.at(v);
    return `translate(${(q.x - size0 / 2).toFixed(1)} ${(q.y - size0 / 2).toFixed(1)})`;
  };
  const t0 = useSvgAttr(light, lightAt, "transform", xy);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])} data-loader-art="floating-candles">
      <svg viewBox={`0 ${TOP} ${W} ${VB_H}`} aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
        {mini ? null : (
          <>
            <defs>
              <linearGradient id={skyId} x1="0" y1={TOP} x2="0" y2={CEIL_END} gradientUnits="userSpaceOnUse">
                <stop offset="0" style={{ stopColor: SKY, stopOpacity: 1 }} />
                <stop offset="0.55" style={{ stopColor: SKY, stopOpacity: 0.62 }} />
                <stop offset="1" style={{ stopColor: SKY, stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {/* the enchanted ceiling: the night sky, fading into the hall */}
            <rect x={0} y={TOP} width={W} height={CEIL_END - TOP} rx={28} fill={`url(#${skyId})`} />
            <g fill="var(--w-patronus)">
              {STARS.map((s, i) => (
                <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(1)} opacity={0.5 + hash01(i, 55) * 0.4} />
              ))}
              {GLINTS.map((g, i) => (
                <path key={`g${i}`} d={glint(g.x, g.y, g.s)} opacity={0.85} />
              ))}
            </g>
          </>
        )}
        {/* the whole Line, faint (ink-contour at 35 %) */}
        <path d={LINE_D} fill="none" stroke="var(--w-ink-contour)" strokeOpacity={0.35} strokeWidth={sw(1.2)} strokeLinecap="round" />
        {/* ink behind the light at full strength (direct p) */}
        <DrawPath d={LINE_D} progress={p} stroke="var(--w-ink-contour)" strokeWidth={sw(1.2)} strokeLinecap="round" />
        {(mini ? HALL_MINI : HALL).map((c, i) => (
          <FloatingCandle key={i} c={c} lit={lit} big={mini ? 1.5 : 1} />
        ))}
        <motion.g style={{ opacity: glow }}>
          <image ref={light} href={LUMOS_SPRITE} width={size0} height={size0} transform={t0} />
        </motion.g>
      </svg>
    </span>
  );
}

/** One floating candle: a cream taper (a melted lip, a drip, a shaded side,
 *  the wick) that hangs dim until the light has passed its fraction, then
 *  burns — its flame and halo the pre-rendered sprite. */
function FloatingCandle({ c, lit, big }: { c: Candle; lit: MotionValue<number>; big: number }) {
  const on = useTransform(lit, (v) => (v >= c.at - 1e-6 ? 1 : 0));
  const taper = useTransform(on, (v) => (v ? 1 : 0.6));
  const w = 34 * big;
  const top = c.y - c.h;
  const flame = 180 * big;
  const wick = 14 * big;
  return (
    <g data-candle="">
      <motion.g style={{ opacity: taper }}>
        <path
          d={`M${c.x - w / 2} ${top + 9 * big}Q${c.x - w / 2} ${top} ${c.x - w / 4} ${top + 2 * big}H${c.x + w / 2 - 4 * big}Q${c.x + w / 2} ${top} ${c.x + w / 2} ${top + 12 * big}V${c.y}Q${c.x} ${c.y + 7 * big} ${c.x - w / 2} ${c.y}Z`}
          fill="var(--paper-s2)"
        />
        {/* the shaded side (a cylinder, not a stick) and a drip down it */}
        <path
          d={`M${c.x + w / 2 - 6.5 * big} ${top + 8 * big}V${c.y}`}
          fill="none"
          stroke="var(--paper-edge-deep)"
          strokeWidth={7 * big}
          opacity={0.55}
        />
        <path
          d={`M${c.x - w / 2 + 6 * big} ${top + 6 * big}V${top + 40 * big}`}
          fill="none"
          stroke="var(--paper-edge)"
          strokeWidth={7 * big}
          strokeLinecap="round"
        />
        <path d={`M${c.x} ${top + 2 * big}V${top - wick}`} fill="none" stroke="var(--w-ink-contour)" strokeWidth={5 * big} strokeLinecap="round" />
      </motion.g>
      <motion.image
        href={FLAME_SPRITE}
        x={c.x - flame / 2}
        y={top - wick - flame * 0.62}
        width={flame}
        height={flame}
        preserveAspectRatio="none"
        style={{ opacity: on }}
      />
    </g>
  );
}
