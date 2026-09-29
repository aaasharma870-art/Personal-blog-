"use client";

import { useEffect, useRef } from "react";
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
 * an enchanted night ceiling, a row of FLOATING CANDLES (IC-HP-03) hangs in
 * the dark above the Line; a cool point of light (the wand-tip light, never
 * the wand) travels the Line, and each candle kindles as the light passes
 * beneath it — one by one, the Great Hall lights up.
 *
 *   determinate    light at pathLength = progress (direct); ink behind it at
 *                  100 %, the rest of the Line a faint 35 % ink stroke;
 *                  candle k (of 8) lights exactly when progress ≥ k/8.
 *   indeterminate  the light breathes at the Line's start (opacity .6 ↔ 1 at
 *                  0.5 Hz), the first 12 % of ink holds drawn, the candles
 *                  wait unlit; frozen when the shell's idle stop drops
 *                  `animate`.
 *   complete       every candle lit; the light rests at the end.
 *   static         ink drawn, candles lit, the light at the end.
 * Each candle is a cream taper (vector) ≥ 12 px tall at card size with its
 * flame and halo as ONE pre-rendered sprite (Law 1 / L6: no CSS glow);
 * candles never flicker (no loops on DOM sprites). 0 text (L7); tokens only.
 * `mini` hangs four larger candles.
 */

const W = LINE_VIEWBOX.w;
/** Headroom above the Line for the hall (the ceiling and the candles). */
const TOP = -270;
const VB_H = LINE_VIEWBOX.h - TOP;
const CANDLES = 8;

type Candle = { x: number; y: number; at: number; h: number };
/** Candle k floats above the Line's point at (k+1)/8, at a varied height. */
function hang(n: number, big: number): Candle[] {
  return Array.from({ length: n }, (_, i) => {
    const at = (i + 1) / n;
    const q = LINE.at(Math.min(at, 0.93));
    const lift = 170 + hash01(i, 5) * 110;
    const h = (96 + hash01(i, 9) * 26) * big;
    // the flame (wick + sprite) must stay under the ceiling (inside the box)
    const flame = (12 + 92 * 0.62) * big;
    return { x: q.x, y: Math.max(TOP + h + flame + 6, q.y - lift), at, h };
  });
}
const HALL = hang(CANDLES, 1);
const HALL_MINI = hang(4, 2.1);
/** The enchanted ceiling: a scatter of faint stars (never glow). */
const STARS = Array.from({ length: 22 }, (_, i) => ({
  x: 30 + hash01(i, 21) * 940,
  y: TOP + 18 + hash01(i, 33) * 120,
  r: 3 + hash01(i, 41) * 3.5,
}));

export default function InkLightLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <InkLight key={props.mode} {...props} />;
}

function InkLight({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const scale = SIZE_PX[size] / W;
  const sw = (px: number) => px / scale;
  const one = useMotionValue(1);
  const start = useMotionValue(0.12);
  const p = mode === "determinate" ? progress : mode === "indeterminate" ? start : one;
  // candles: lit by the light's real position (never while it only waits)
  const zero = useMotionValue(0);
  const lit = mode === "indeterminate" ? zero : p;

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
  const size0 = mini ? 150 : 84;
  const xy = (v: number) => {
    const q = LINE.at(v);
    return `translate(${(q.x - size0 / 2).toFixed(1)} ${(q.y - size0 / 2).toFixed(1)})`;
  };
  const t0 = useSvgAttr(light, lightAt, "transform", xy);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])} data-loader-art="floating-candles">
      <svg viewBox={`0 ${TOP} ${W} ${VB_H}`} aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
        {mini ? null : (
          <g fill="var(--w-patronus)" opacity={0.5}>
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(1)} />
            ))}
          </g>
        )}
        {/* the whole Line, faint (ink-contour at 35 %) */}
        <path d={LINE_D} fill="none" stroke="var(--w-ink-contour)" strokeOpacity={0.35} strokeWidth={sw(1.2)} strokeLinecap="round" />
        {/* ink behind the light at full strength (direct p) */}
        <DrawPath d={LINE_D} progress={p} stroke="var(--w-ink-contour)" strokeWidth={sw(1.2)} strokeLinecap="round" />
        {(mini ? HALL_MINI : HALL).map((c, i) => (
          <FloatingCandle key={i} c={c} lit={lit} big={mini ? 2.1 : 1} />
        ))}
        <motion.g style={{ opacity: glow }}>
          <image ref={light} href={LUMOS_SPRITE} width={size0} height={size0} transform={t0} />
        </motion.g>
      </svg>
    </span>
  );
}

/** One floating candle: a cream taper (a drip at its lip, the wick) that
 *  hangs dim until the light has passed its fraction, then burns — its
 *  flame and halo the pre-rendered sprite. */
function FloatingCandle({ c, lit, big }: { c: Candle; lit: MotionValue<number>; big: number }) {
  const on = useTransform(lit, (v) => (v >= c.at - 1e-6 ? 1 : 0));
  const taper = useTransform(on, (v) => (v ? 1 : 0.42));
  const w = 24 * big;
  const top = c.y - c.h;
  const flame = 92 * big;
  return (
    <g data-candle="">
      <motion.g style={{ opacity: taper }}>
        <path
          d={`M${c.x - w / 2} ${top + 6 * big}Q${c.x - w / 2} ${top} ${c.x - w / 4} ${top}H${c.x + w / 2 - 2 * big}Q${c.x + w / 2} ${top} ${c.x + w / 2} ${top + 8 * big}V${c.y}H${c.x - w / 2}Z`}
          fill="var(--paper-s2)"
        />
        {/* a drip down one side, and the wick */}
        <path
          d={`M${c.x + w / 2 - 1} ${top + 6 * big}V${top + 30 * big}`}
          fill="none"
          stroke="var(--paper-edge-deep)"
          strokeWidth={5 * big}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path d={`M${c.x} ${top}V${top - 12 * big}`} fill="none" stroke="var(--w-ink-contour)" strokeWidth={4 * big} strokeLinecap="round" />
      </motion.g>
      <motion.image
        href={FLAME_SPRITE}
        x={c.x - flame / 2}
        y={top - 12 * big - flame * 0.62}
        width={flame}
        height={flame}
        preserveAspectRatio="none"
        style={{ opacity: on }}
      />
    </g>
  );
}
