"use client";

import { useId } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useTicker } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, LINE_VIEWBOX } from "@/components/primitives/loaders/line";

/**
 * LD-HP ALT "Footprints" (hp; lib/variants.ts `loader-ink-light.motion`
 * alt). Harry Potter reveals — the default sends a light along the Line;
 * this one is the Marauder's Map's own tell: ink footprints walk the Line,
 * each step inking in as it lands and fading behind the walker, until the
 * feet stop together at the Line's end. No light, no candles: ink only.
 *
 *   determinate    a dotted ink path is drawn to `progress` (pathLength,
 *                  direct); step k (12 steps, alternating feet, spaced
 *                  along .04–.9 of the Line) lands when the path reaches
 *                  it — the newest three at full ink, the older ones faded
 *                  to 35 % (the map's fading trail).
 *   indeterminate  two steps pace in place at the Line's start (one foot,
 *                  then the other, every 0.5 s): someone is there, nothing
 *                  has advanced. Frozen when the shell's idle stop drops
 *                  `animate`.
 *   complete       the path drawn; every step faded; the feet side by side
 *                  at the end, at full ink. No flash.
 *   static         the same as complete.
 * Our own print shapes (a sole and a heel, never a traced map). Ink is
 * --w-ink-contour (8.94:1 on hp deep, L8); 0 sprites, 0 glow, 0 text.
 */

const W = LINE_VIEWBOX.w;
const H = LINE_VIEWBOX.h;
const STEPS = 12;
const OFFSET = 17;
/** A print, toe along +x, heel at the origin (sole + heel, filled ink). */
const PRINT =
  "M13 -6.6C20 -9.4 34 -9.6 42 -6.2C48 -3.6 48 3.6 42 6.2C34 9.6 20 9.4 13 6.6C9 4.6 9 -4.6 13 -6.6Z" +
  "M0.4 -5C3.6 -7.4 8 -6.8 9 -3.4C9.8 -1 9.8 1 9 3.4C8 6.8 3.6 7.4 0.4 5C-2 3 -2 -3 0.4 -5Z";

type Step = { x: number; y: number; a: number; at: number };

/** Step k: its landing fraction, alternating left / right of the Line. */
const WALK: Step[] = Array.from({ length: STEPS }, (_, k) => {
  // steps land from .04 to .9 of the Line; the fold at its end is where the
  // feet stop together (complete)
  const at = 0.04 + (0.86 * k) / (STEPS - 1);
  const q = LINE.at(at);
  const a = LINE.angleAt(at);
  const side = k % 2 ? 1 : -1;
  const r = (a * Math.PI) / 180;
  return { x: q.x - Math.sin(r) * OFFSET * side, y: q.y + Math.cos(r) * OFFSET * side, a, at };
});

/** The feet together at the Line's end (complete / static). */
const END = (() => {
  const q = LINE.at(0.955);
  const a = LINE.angleAt(0.93);
  const r = (a * Math.PI) / 180;
  return [-1, 1].map((side) => ({
    x: q.x - Math.cos(r) * 24 - Math.sin(r) * 11 * side,
    y: q.y - Math.sin(r) * 24 + Math.cos(r) * 11 * side,
    a,
  }));
})();

const printT = (s: { x: number; y: number; a: number }, scale = 1) =>
  `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.a.toFixed(1)}) scale(${scale})`;

export default function InkFootprintsLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <Footprints key={props.mode} {...props} />;
}

function Footprints({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const scale = SIZE_PX[size] / W;
  const sw = (px: number) => px / scale;
  const maskId = useId();
  const one = useMotionValue(1);
  const zero = useMotionValue(0);
  const walk = mode === "determinate" ? progress : mode === "indeterminate" ? zero : one;
  const done = mode === "complete" || mode === "static";
  // mini draws bigger feet (the prints would vanish at 48 px)
  const big = size === "mini" ? 1.8 : 1.25;

  // indeterminate: one foot, then the other, pacing at the start
  const tick = useTicker(mode === "indeterminate" && running, 500);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg
        viewBox={`0 -60 ${W} ${H + 60}`}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
        fill="none"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <DrawPath d={LINE_D} progress={walk} stroke="white" strokeWidth={sw(4)} strokeLinecap="butt" />
          </mask>
        </defs>
        {/* the corridor, faint; the walked path, a dotted ink line (= progress) */}
        <path d={LINE_D} stroke="var(--w-ink-contour)" strokeOpacity={0.18} strokeWidth={sw(1)} strokeLinecap="round" />
        <path
          d={LINE_D}
          stroke="var(--w-ink-contour)"
          strokeWidth={sw(1.2)}
          strokeLinecap="round"
          strokeDasharray={`${sw(0.1)} ${sw(4)}`}
          mask={`url(#${maskId})`}
        />
        <g fill="var(--w-ink-contour)">
          {mode === "indeterminate"
            ? WALK.slice(0, 2).map((s, k) => (
                <path key={k} d={PRINT} transform={printT(s, big)} opacity={tick % 2 === k ? 1 : 0.2} />
              ))
            : WALK.map((s, k) => <Print key={k} step={s} walk={walk} done={done} big={big} />)}
          {done
            ? END.map((s, k) => <path key={`end${k}`} d={PRINT} transform={printT(s, big)} />)
            : null}
        </g>
      </svg>
    </span>
  );
}

/** One step: lands when the walk passes it, fades once three newer steps
 *  have landed (complete: every step faded, the end pair carries the ink). */
function Print({ step, walk, done, big }: { step: Step; walk: MotionValue<number>; done: boolean; big: number }) {
  const opacity = useTransform(walk, (v) => {
    if (v < step.at - 1e-6) return 0;
    if (done) return 0.35;
    const age = (v - step.at) * STEPS;
    return age < 2.5 ? 1 : age > 3.5 ? 0.35 : 1 - 0.65 * (age - 2.5);
  });
  return <motion.path d={PRINT} transform={printT(step, big)} style={{ opacity }} />;
}
