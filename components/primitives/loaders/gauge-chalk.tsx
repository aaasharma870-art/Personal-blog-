"use client";

import { useEffect, useId, useRef } from "react";
import { animate, useMotionValue, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { dur, easeDraw } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  DrawPath,
  PlanStroke,
  SIZE_CLASS,
  SIZE_PX,
  arcPts,
  cubicPts,
  planPoint,
  planStrokes,
  useSvgAttr,
  useTicker,
  type Pt,
  type StrokePlan,
} from "@/components/primitives/loaders/kit";

/**
 * LD-3I ALT "The derivation" (idiots; lib/variants.ts `loader-gauge.motion`
 * alt). 3 Idiots explains — the default shows an honest mechanism; this one
 * shows the honest working: a chalk derivation that writes itself on the
 * board, stroke by stroke, then sketches the curve it describes.
 *
 *   f(x) = x² + 2x        f′(x) = 2x + 2        ⇒ x = −1        ∪ (vertex)
 *
 *   determinate    the chalk has drawn exactly `progress` of the total ink
 *                  (every stroke owns its share of the summed length, in
 *                  writing order: a direct map, no spring). The chalk tip
 *                  rides the head of the stroke being written.
 *   indeterminate  nothing is written: the chalk taps the board at the start
 *                  of the first line every 0.6 s (working, visibly not
 *                  progressing); frozen when the shell's idle stop drops
 *                  `animate`.
 *   complete       every stroke drawn; the answer is boxed in chalk
 *                  (easeDraw over dur.draw.short) — no flash.
 *   static         all drawn, the box drawn.
 * The glyphs are our own chalk strokes (paths, never <text>: loaders L7),
 * the maths is generic calculus (never research data), the chalk is
 * --w-chalk with one static displacement (never boiled). `mini` draws only
 * the curve sketch. aria-hidden, focusable=false; tokens only (L17).
 */

/* — Glyphs: strokes in glyph units (baseline 0, up is negative) — */
type Glyph = { w: number; s: Pt[][] };
const line = (...pts: Pt[]): Pt[] => pts;

const TWO: Pt[] = [...arcPts(2.3, -4.9, 2.1, 2.0, -175, 15, 9), [0.2, 0], [4.7, -0.1]];
const GLYPHS: Record<string, Glyph> = {
  f: { w: 4.4, s: [[...arcPts(3.4, -6.2, 1.5, 1.5, -10, -180, 8), [1.9, 1.8]], line([0.3, -3.9], [3.7, -4])] },
  "(": { w: 3, s: [arcPts(2.8, -2.8, 2.2, 4.8, -115, -245, 10)] },
  ")": { w: 3, s: [arcPts(0.2, -2.8, 2.2, 4.8, -65, 65, 10)] },
  x: { w: 5, s: [cubicPts([0, -5.2], [1.8, -4.6], [2.4, -0.8], [4.2, 0], 6), cubicPts([4.2, -5.2], [2.8, -4], [1.6, -1.2], [0, 0.1], 6)] },
  "2": { w: 5.4, s: [TWO] },
  "²": { w: 3.2, s: [TWO.map(([x, y]) => [x * 0.55, y * 0.55 - 4.6] as Pt)] },
  "=": { w: 5.8, s: [line([0, -3.6], [4.8, -3.7]), line([0.1, -1.4], [4.9, -1.5])] },
  "+": { w: 5.4, s: [line([2.3, -5.2], [2.4, -0.8]), line([0, -3], [4.6, -3.1])] },
  "′": { w: 1.8, s: [line([1.6, -7.4], [0.6, -5.2])] },
  "−": { w: 4.4, s: [line([0, -3], [3.8, -3.1])] },
  "1": { w: 3.2, s: [line([0.2, -5.4], [1.8, -7.1], [1.8, 0])] },
  "⇒": { w: 7.6, s: [line([0, -4.2], [5.2, -4.2]), line([0, -1.8], [5.2, -1.8]), line([3.6, -6.2], [6.4, -3], [3.6, 0.2])] },
  " ": { w: 1.4, s: [] },
};

/** Glyph units → viewBox units, the letter gap, and the = column. */
const G = 1.45;
const GAP = 0.7;
const X_EQ = 45;
const EQ_W = GLYPHS["="].w * G;
const PAD = 2.4;

function width(chars: string[]): number {
  return chars.reduce((a, c, i) => a + GLYPHS[c].w + (i ? GAP : 0), 0) * G;
}

function place(chars: string[], x0: number, base: number): Pt[][] {
  const out: Pt[][] = [];
  let x = x0;
  chars.forEach((c) => {
    const g = GLYPHS[c];
    for (const s of g.s) out.push(s.map(([gx, gy]) => [x + gx * G, base + gy * G] as Pt));
    x += (g.w + GAP) * G;
  });
  return out;
}

/** One derivation line, aligned on its "=". */
function row(lhs: string[], rhs: string[], base: number): { strokes: Pt[][]; rhsX: number; rhsW: number } {
  const lx = X_EQ - PAD - width(lhs);
  const rhsX = X_EQ + EQ_W + PAD;
  return {
    strokes: [...place(lhs, lx, base), ...place(["="], X_EQ, base), ...place(rhs, rhsX, base)],
    rhsX,
    rhsW: width(rhs),
  };
}

const L1 = row(["f", "(", "x", ")"], ["x", "²", " ", "+", " ", "2", "x"], 17);
const L2 = row(["f", "′", "(", "x", ")"], ["2", "x", " ", "+", " ", "2"], 35);
const L3 = row(["⇒", " ", "x"], ["−", "1"], 53);

/* — The sketch: axes, the parabola y = x² + 2x, its vertex at x = −1 — */
const O: Pt = [139, 40];
const U = 6;
const toScreen = (x: number, y: number): Pt => [O[0] + U * x, O[1] - U * 0.9 * y];
const CURVE: Pt[] = Array.from({ length: 25 }, (_, i) => {
  const x = -3.4 + (4.8 * i) / 24;
  return toScreen(x, x * x + 2 * x);
});
const VERTEX = toScreen(-1, -1);
const SKETCH: Pt[][] = [
  line([108, O[1]], [155, O[1] - 0.4]),
  line([O[0], 59], [O[0] + 0.3, 7]),
  CURVE,
  line([VERTEX[0], VERTEX[1]], [VERTEX[0], O[1]]),
  arcPts(VERTEX[0], VERTEX[1], 1.1, 1.1, -90, 270, 8),
];

const PLAN: StrokePlan = planStrokes([...L1.strokes, ...L2.strokes, ...L3.strokes, ...SKETCH]);
const PLAN_MINI: StrokePlan = planStrokes(SKETCH);
/** The answer's box (x = −1): four hand strokes with small overshoots. */
const ANSWER = (() => {
  const x0 = X_EQ - PAD - GLYPHS.x.w * G - 3;
  const x1 = L3.rhsX + L3.rhsW + 3;
  const y0 = 53 - 7.2 * G - 2.6;
  const y1 = 53 + 3.2;
  return `M${x0 - 1.5} ${y0}H${x1 + 1}M${x1} ${y0 - 1}V${y1 + 1.2}M${x1 + 1} ${y1}H${x0 - 1}M${x0} ${y1 + 1}V${y0 - 1.4}`;
})();
/** Mini: a chalk ring round the vertex. */
const VERTEX_RING = `M${VERTEX[0] + 5} ${VERTEX[1]}a5 4.4 0 1 1 -10 0a5 4.4 0 1 1 10 0.5`;

export default function GaugeChalkLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <Derivation key={props.mode} {...props} />;
}

function Derivation({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const plan = mini ? PLAN_MINI : PLAN;
  const vb = mini ? { x: 104, y: 4, w: 54, h: 58 } : { x: 0, y: 0, w: 160, h: 64 };
  const scale = SIZE_PX[size] / vb.w;
  const sw = (px: number) => px / scale;
  const filterId = useId();

  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const ink = mode === "determinate" ? progress : mode === "indeterminate" ? zero : one;

  // the box round the answer: drawn at complete (motion on), present at static / RM
  const box = useMotionValue(mode === "static" ? 1 : 0);
  useEffect(() => {
    if (mode === "static" || (mode === "complete" && reduced)) {
      box.jump(1);
      return;
    }
    if (mode !== "complete") {
      box.jump(0);
      return;
    }
    const c = animate(box, 1, { duration: dur.draw.short, ease: easeDraw });
    return () => c.stop();
  }, [mode, reduced, box]);

  // indeterminate: the chalk taps at the first stroke's start (frozen when stopped)
  const tick = useTicker(mode === "indeterminate" && running, 600);
  const tipOn = mode === "determinate" ? true : mode === "indeterminate" ? tick % 2 === 0 : false;

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
        fill="none"
        stroke="var(--w-chalk)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          {/* chalkRough: one static displacement (never boiled) */}
          <filter id={filterId} x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={0.7} />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {plan.strokes.map((s, i) => (
            <PlanStroke key={i} d={s.d} from={s.from} to={s.to} progress={ink} strokeWidth={sw(1.2)} />
          ))}
          <DrawPath d={mini ? VERTEX_RING : ANSWER} progress={box} strokeWidth={sw(1.3)} />
        </g>
        <ChalkTip plan={plan} progress={ink} r={sw(1.4)} visible={tipOn} />
      </svg>
    </span>
  );
}

/** The chalk's tip at the head of the writing (a small chalk dot). */
function ChalkTip({
  plan,
  progress,
  r,
  visible,
}: {
  plan: StrokePlan;
  progress: MotionValue<number>;
  r: number;
  visible: boolean;
}) {
  const ref = useRef<SVGCircleElement>(null);
  const cx = useSvgAttr(ref, progress, "cx", (v) => planPoint(plan, v).x.toFixed(2));
  const cy = useSvgAttr(ref, progress, "cy", (v) => planPoint(plan, v).y.toFixed(2));
  return <circle ref={ref} cx={cx} cy={cy} r={r} fill="var(--w-chalk)" stroke="none" opacity={visible ? 0.9 : 0} />;
}
