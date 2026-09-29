"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject, SVGProps } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import type { LoaderSize } from "@/components/primitives/loader";

/**
 * Loader kit — the few mechanisms every world loader shares (SPEC v2 §8,
 * loaders.BAR). Kept tiny: each world renderer is its own code-split chunk.
 */

/** Rendered width of each loader size (the --loader-* tokens: 3 / 7.5 / 10 rem). */
export const SIZE_PX: Record<LoaderSize, number> = { mini: 48, card: 120, route: 160 };

/** CSS width class per size (tokens, never raw px: loaders L17). */
export const SIZE_CLASS: Record<LoaderSize, string> = {
  mini: "w-(--loader-mini)",
  card: "w-(--loader-card)",
  route: "w-(--loader-route)",
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
      strokeDasharray="1 1"
      style={{ strokeDashoffset: offset }}
    />
  );
}

/** Writes `fmt(value)` to an attribute of an SVG element as `mv` changes —
 *  no React render per frame. Returns the initial attribute value for SSR. */
export function useSvgAttr<E extends Element>(
  ref: RefObject<E | null>,
  mv: MotionValue<number>,
  attr: string,
  fmt: (v: number) => string,
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
