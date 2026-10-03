"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motionValue, type MotionValue } from "motion/react";
import type { Variant } from "@/lib/variants";

/**
 * What every piece of an act card reads (SPEC v2 §8.2, act-cards.BAR §4):
 *   p        the ONE driver — the card's scroll passage (0 travel cards) or
 *            its pinned progress (long cards). Direct, no spring; reverses
 *            exactly by position.
 *   live     false = the static title card (SSR, no JS, reduced motion,
 *            Pause, < 640 px, a long card off desktop-fine, or a card that
 *            was already in view when the page hydrated: it goes live only
 *            once it has been offscreen, so nothing ever swaps in front of
 *            the reader).
 *   variant  which choreography the frame plays (lib/variants.ts, registry
 *            piece "card-<kind>.choreo"): the manifest's choice, or the
 *            ?variant=… preview after hydration. CardShell already renders
 *            the matching frame; frames may read it for data attributes.
 */
export type CardState = {
  p: MotionValue<number>;
  live: boolean;
  long: boolean;
  variant: Variant;
  /** Phase 3 PIN MODE (PHASE3-SPEC §7.1; DESKTOP_FINE + the boot gate, a
   *  card with travel): null below it, where every card keeps its Phase-2
   *  behaviour. In pin mode `p` above is star (a)'s progress (the frame's
   *  DOM choreography runs on it: 0 → 1 over p .00–.45, the tintype's
   *  .03–.45) and `pin` carries the rest. */
  pin?: PinState | null;
};

/** The pinned card's drivers (made by the director in card-p3.tsx). */
export type PinState = {
  kind: string;
  /** The DAMPED card p over the travel (0 → 1). */
  t: MotionValue<number>;
  /** Star (a)'s progress (the frames' `p`): t over the star's range. */
  a: MotionValue<number>;
  /** Star (b)'s progress: t .50 → 1 as 0 → 1. */
  b: MotionValue<number>;
  /** The approach: 0 as the card's top enters the viewport → 1 at t 0
   *  (the tintype's sun reaches its mark on arrival, B35). */
  enter: MotionValue<number>;
  /** The kraken swell (seam only; 0 → 1 → 0, pc-kraken). */
  kraken: MotionValue<number>;
  /** The pin-mode pieces the frames render (the lazy chunk). */
  ui: PinUi;
  /** Push / title-mask / shape variants for this card (resolved). */
  push: Variant;
  title: Variant;
};

/** What the lazy chunk hands the frames (card-p3.tsx `ui`). */
export type PinUi = {
  /** Extra layers inside a frame's settled PlateBox (the rack-focus soft
   *  copy, the plate's loop from star (b)); `plate` = the drawn asset. */
  PlateLayers: (props: { plate: string; loop?: boolean }) => ReactNode;
  /** The ignite's css-tier film burn (P3-11 r1): given the card's deep,
   *  a drawer for frames/ignite.tsx's canvas (null: none). */
  burn?: BurnUi;
};

/** (deep) → draw(ctx, star (a) p, the fire's x / y, the frame height). */
export type BurnUi = (
  deep: string,
) => ((ctx: CanvasRenderingContext2D, v: number, x: number, y: number, h: number) => void) | null;

const STATIC_P = motionValue(1);

export const CardContext = createContext<CardState>({
  p: STATIC_P,
  live: false,
  long: false,
  variant: "default",
});

export function useCard(): CardState {
  return useContext(CardContext);
}
