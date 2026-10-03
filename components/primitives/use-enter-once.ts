"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { DESKTOP_FINE, useReducedMotion } from "@/lib/flags";
import { viewportOnce } from "@/lib/motion";
import { spotlight } from "@/lib/spotlight";
import type { BeatWeight } from "@/lib/beats";

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
 *
 * `star` (PHASE3-SPEC §3.8, a time star of the beat map): on DESKTOP_FINE an
 * armed element asks the spotlight before it enters. "play" → "entered";
 * "skip" (another star owns the screen for over 1.5 s) → "static", i.e. the
 * end state with no animation. Elsewhere (phones, tablets) it enters as
 * before, without asking; motion off stays "static". The host should also
 * carry `beatAttrs(star.id, { weight })` (lib/beats.ts) so the spotlight can
 * drop a request whose host has left the viewport. `star.ms`: how long the
 * entrance visibly moves (the hold; default 1.2 s, the cap): a host never
 * starts before the grant, and the grant covers no more than it shows.
 */
export type EnterPhase = "static" | "armed" | "entered";

/** 0, .05 … 1: fine enough that tall elements report their viewport share. */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

export function useEnterOnce(
  ref: RefObject<Element | null>,
  { amount = viewportOnce.amount, star }: { amount?: number; star?: { id: string; weight: BeatWeight; ms?: number } } = {},
): EnterPhase {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<EnterPhase>("static");
  const [done, setDone] = useState(false);
  const starId = star?.id;
  const starWeight = star?.weight ?? 1;
  const starMs = star?.ms;

  useEffect(() => {
    if (reduced || done) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let first = true;
    let asking = false;
    let cancelled = false;
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
          io.disconnect();
          if (starId && window.matchMedia(DESKTOP_FINE).matches) {
            // one star at a time: wait for the spotlight (≤ 1.5 s), or skip
            asking = true;
            void spotlight.request(starId, { weight: starWeight, durationMs: starMs }).then((answer) => {
              asking = false;
              if (cancelled) return;
              setPhase(answer === "play" ? "entered" : "static");
              setDone(true);
            });
            return;
          }
          setPhase("entered");
          setDone(true);
        }
      },
      { threshold: THRESHOLDS.includes(amount) ? THRESHOLDS : [...THRESHOLDS, amount] },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      // torn down while still waiting: withdraw (a granted hold runs out alone)
      if (asking && starId) spotlight.release(starId);
    };
  }, [ref, amount, reduced, done, starId, starWeight, starMs]);

  if (reduced) return "static";
  return phase;
}
