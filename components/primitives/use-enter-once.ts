"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { useReducedMotion } from "@/lib/flags";
import { viewportOnce } from "@/lib/motion";

/**
 * useEnterOnce — the R1 "enter-once" driver shared by MaskReveal and the
 * Lens aperture, built so that SERVER HTML IS ALWAYS THE FINAL STATE.
 *
 *   "static"  → render the final state. The server render, hydration, motion
 *               off, and any element that was ALREADY in view at mount (it
 *               never hides in front of the reader: entrances never delay
 *               reading, DESIGN v2 §6.1).
 *   "armed"   → the element mounted OFFSCREEN, so it may be put into its
 *               pre-enter state (hidden below its mask, bracket closed) —
 *               nobody can see the swap.
 *   "entered" → it crossed `amount` of the viewport: play the entrance once.
 *
 * No `html.motion-ok` head script is needed for this: hiding happens only
 * offscreen, after hydration. (The hero aperture — which must be closed AT
 * first paint — needs that head script; see P1-EARLY open items.)
 * Turning motion off (OS or Pause) at any phase snaps back to "static".
 *
 * The OBSERVED element must not carry a zero-area clip-path while "armed"
 * (a closed iris `circle(0%)`, a wipe's `inset(0% 100% 0% 0%)`): in
 * Chromium, IntersectionObserver clips its target by the target's own
 * clip-path, so it may never report "entered" and the element stays shut
 * (ART-DIRECTOR #1). Observe an unclipped wrapper; clip an inner element
 * (film-frame.tsx, chalk.tsx SettleFrame).
 */
export type EnterPhase = "static" | "armed" | "entered";

/** 0, .05 … 1: fine enough that tall elements report their viewport share. */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

export function useEnterOnce(
  ref: RefObject<Element | null>,
  { amount = viewportOnce.amount }: { amount?: number } = {},
): EnterPhase {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<EnterPhase>("static");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced || done) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (first) {
          first = false;
          if (entry.isIntersecting) {
            // Already visible at mount (or when motion came back on): stay
            // final, never hide it in front of the reader.
            setPhase("static");
            setDone(true);
            io.disconnect();
            return;
          }
          setPhase("armed");
          return;
        }
        // `amount` of the element, or `amount` of the viewport for elements
        // too tall to ever show that fraction of themselves.
        const viewportH = entry.rootBounds?.height ?? Infinity;
        const enough =
          entry.intersectionRatio >= amount ||
          entry.intersectionRect.height >= viewportH * amount;
        if (entry.isIntersecting && enough) {
          setPhase("entered");
          setDone(true);
          io.disconnect();
        }
      },
      { threshold: THRESHOLDS.includes(amount) ? THRESHOLDS : [...THRESHOLDS, amount] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, reduced, done]);

  if (reduced) return "static";
  return phase;
}
