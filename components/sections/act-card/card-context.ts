"use client";

import { createContext, useContext } from "react";
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
};

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
