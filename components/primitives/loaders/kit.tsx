"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject, SVGProps } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import type { LoaderSize } from "@/components/primitives/loader";

/**
 * Loader kit — the few mechanisms every world loader shares (SPEC v2 §8,
 * loaders.BAR). Kept tiny: each world renderer is its own code-split chunk.
 */

/** Rendered width of each loader size (the --loader-* tokens: 3 / 11 /
 *  13.5 rem; `stage` = the route CARD's art, --loader-stage 18 rem:
 *  RECOGNIZABILITY S20 "the loader art is ≥ 200 px"; M2 fix: 240 → 288 px,
 *  so the route card's scene reads at a glance). M5 (blind: "tiny
 *  thumbnails"): card 120 → 176 px, and the stage grows to 26 rem (416 px)
 *  ≥ 1280, where the route card's letterbox has the height for it (strokes
 *  keep the 288 px scale there: a touch bolder, never thinner). */
export const SIZE_PX: Record<LoaderSize, number> = { mini: 48, card: 176, route: 216, stage: 288 };

/** CSS width class per size (tokens, never raw px: loaders L17). `stage`
 *  shrinks to the column below 18 rem (a 320 px phone keeps its gutters). */
export const SIZE_CLASS: Record<LoaderSize, string> = {
  mini: "w-(--loader-mini)",
  card: "w-(--loader-card) max-w-full",
  route: "w-(--loader-route)",
  stage: "w-(--loader-stage) max-w-full",
};

/**
 * A stroke that draws on with `progress` (0–1), mapped DIRECTLY (no spring:
 * loaders L2). Uses pathLength=1 + a dash offset rather than
 * non-scaling-stroke (which breaks normalised dashes), so stroke widths are
 * in user units: pass `strokeWidth` already divided by the view scale.
 */
export function DrawPath({
  progress,
  ...rest
}: { progress: MotionValue<number> } & Omit<SVGProps<SVGPathElement>, "ref" | "style" | "pathLength">) {
  const offset = useTransform(progress, (v) => 1 - Math.min(1, Math.max(0, v)));
  // motion.path's typed props differ from React's SVG props on a few event
  // handlers; this component only ever passes geometry and paint.
  const props = rest as Record<string, unknown>;
  return (
    <motion.path
      {...props}
      fill="none"
      pathLength={1}
      // a 1-on / 2-off pattern: at progress 0 the path's END falls inside
      // the gap (with "1 1" it met a zero-length dash there, and a round cap
      // painted a stray dot at the undrawn stroke's end)
      strokeDasharray="1 2"
      style={{ strokeDashoffset: offset }}
    />
  );
}

/** Writes `fmt(value)` to an attribute of an SVG element as `mv` changes —
 *  no React render per frame. Returns the initial attribute value for SSR. */
export function useSvgAttr<E extends Element, T = number>(
  ref: RefObject<E | null>,
  mv: MotionValue<T>,
  attr: string,
  fmt: (v: T) => string,
): string {
  const [initial] = useState(() => fmt(mv.get()));
  useMotionValueEvent(mv, "change", (v) => {
    ref.current?.setAttribute(attr, fmt(v));
  });
  return initial;
}

/**
 * One-shot commit flash (IC-PC-09 tip flash; dur.flash). Fires when `armed`
 * turns true (motion on only), never again until `armed` has gone false —
 * so scrolling back and forth past completion never strobes (act-cards
 * "reverse": the flourish replays only after p < .9, then p = 1 again).
 */
export function useOneShot(armed: boolean, ms: number, enabled: boolean): boolean {
  const [on, setOn] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    if (!armed) {
      fired.current = false;
      return;
    }
    if (!enabled || fired.current) return;
    fired.current = true;
    // Deferred so the flash starts in its own frame (and state is never set
    // synchronously inside the effect).
    const start = window.setTimeout(() => setOn(true), 0);
    const stop = window.setTimeout(() => setOn(false), ms);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
      setOn(false);
    };
  }, [armed, enabled, ms]);
  return on;
}

/** A ticking boolean (period `ms`) while `running`; holds its value when
 *  stopped (the frozen static frame of loaders L4). */
export function useTicker(running: boolean, ms: number): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setN((k) => k + 1), ms);
    return () => window.clearInterval(t);
  }, [running, ms]);
  return n;
}

/* — Stroke sequences (the alt loaders' "drawn stroke by stroke") ————————— */

export type Pt = readonly [number, number];

/** A list of polyline strokes measured once (module scope, so the server and
 *  the client agree): stroke k owns [from, to] of the TOTAL drawn length,
 *  in drawing order. Global progress p draws exactly p of the total ink —
 *  a direct, honest mapping (loaders L2 / L18 in spirit). */
export type StrokePlan = {
  strokes: { d: string; from: number; to: number; pts: readonly Pt[]; len: number }[];
  total: number;
};

export function planStrokes(polys: readonly (readonly Pt[])[]): StrokePlan {
  const lens = polys.map((pts) => {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L;
  });
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const strokes = polys.map((pts, i) => {
    const from = acc / total;
    acc += lens[i];
    const d = pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
    return { d, from, to: acc / total, pts, len: lens[i] };
  });
  return { strokes, total };
}

/** The pen's point at global fraction f of a plan (the drawing tip). */
export function planPoint(plan: StrokePlan, f: number): { x: number; y: number } {
  const v = Math.min(1, Math.max(0, f));
  const s = plan.strokes.find((k) => v <= k.to + 1e-9) ?? plan.strokes[plan.strokes.length - 1];
  if (!s) return { x: 0, y: 0 };
  let target = ((v - s.from) / Math.max(1e-9, s.to - s.from)) * s.len;
  for (let i = 1; i < s.pts.length; i++) {
    const [ax, ay] = s.pts[i - 1];
    const [bx, by] = s.pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    if (target <= seg || i === s.pts.length - 1) {
      const t = seg ? Math.min(1, target / seg) : 0;
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
    }
    target -= seg;
  }
  const [x, y] = s.pts[0];
  return { x, y };
}

/** One stroke of a plan, drawn with the plan's global progress (direct). */
export function PlanStroke({
  progress,
  from,
  to,
  ...rest
}: { progress: MotionValue<number>; from: number; to: number } & Omit<
  SVGProps<SVGPathElement>,
  "ref" | "style" | "pathLength"
>) {
  const local = useTransform(progress, (v) => (to <= from ? (v >= to ? 1 : 0) : Math.min(1, Math.max(0, (v - from) / (to - from)))));
  return <DrawPath progress={local} {...rest} />;
}

/** Sampled points of an elliptical arc (degrees; y down, so -90 = top). */
export function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

/** Sampled points of a cubic bezier. */
export function cubicPts(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
}

/** A deterministic 0–1 hash (never Math.random: SSR == client). */
export function hash01(i: number, salt = 0): number {
  let h = Math.imul(i + 17 + salt * 131, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca77);
  return (((h ^ (h >>> 13)) >>> 0) % 10000) / 10000;
}
