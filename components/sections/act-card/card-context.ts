"use client";

import { createContext, useContext } from "react";
import { motionValue, type MotionValue } from "motion/react";

/**
 * What every piece of an act card reads (SPEC v2 §8.2, act-cards.BAR §4):
 *   p     the ONE driver — the card's scroll passage (0 travel cards) or
 *         its pinned progress (long cards). Direct, no spring; reverses
 *         exactly by position.
 *   live  false = the static title card (SSR, no JS, reduced motion, Pause,
 *         < 640 px, a long card off desktop-fine, or a card that was
 *         already in view when the page hydrated: it goes live only once it
 *         has been offscreen, so nothing ever swaps in front of the reader).
 */
export type CardState = {
  p: MotionValue<number>;
  live: boolean;
  long: boolean;
};

const STATIC_P = motionValue(1);

export const CardContext = createContext<CardState>({ p: STATIC_P, live: false, long: false });

export function useCard(): CardState {
  return useContext(CardContext);
}
