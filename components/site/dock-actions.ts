/* ============================================================================
   DOCK ACTIONS: the few things the header's control dock, the hero's
   "Director's cut" button, the palette and the closing "Play it again"
   button share. No React, no copy, tiny (the header is always-loaded).
   ========================================================================== */

import { emit } from "@/lib/events";
import { motionOffNow } from "@/lib/flags";
import { scrollToTarget } from "@/lib/smooth-scroll";

import { DC_CHOOSER_EVENT } from "@/components/site/dock-events";

/** Open the director's cut chooser (the dock listens). `detail.handled` is
 *  set by the dock, so a caller can fall back to starting a tour itself. */

export function openCutChooser(): boolean {
  const detail: { handled?: boolean } = {};
  window.dispatchEvent(new CustomEvent(DC_CHOOSER_EVENT, { detail }));
  return detail.handled === true;
}

type IntroApi = { replay?: () => boolean; prime?: () => void };
const introApi = (): IntroApi | undefined => (window as Window & { __intro?: IntroApi }).__intro;

/** Warm the intro controller (hover / focus / idle): a later replay then arms
 *  at once instead of waiting for the script. */
export function primeIntro(): void {
  try {
    introApi()?.prime?.();
  } catch {
    /* no intro on this page */
  }
}

/** Move keyboard focus to the hero's title (the h1 takes focus: tabindex -1),
 *  so a jump to the top never leaves it on a control that scrolled away. */
export function focusTitle(): void {
  const h = document.querySelector<HTMLElement>("main h1");
  if (!h) return;
  if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
  h.focus({ preventScroll: true });
}

/** The page's top, through the cut, focus on the hero title. */
export function goTop(): void {
  emit("fastlane");
  void scrollToTarget(0, { cut: true, history: false }).then(focusTitle, focusTitle);
}

/**
 * Replay the intro from its Play card. Returns:
 *  - "replay"  the intro was re-armed (the page is at the top, the play screen shows);
 *  - "busy"    the intro is already on screen: nothing to do;
 *  - "off"     motion is off (Pause or OS reduced motion): refused, the caller says why;
 *  - "top"     there is no intro to arm here: the page just went to the top.
 * Any director's cut or game stops first (`fastlane`, as the fast lane does).
 */
export type ReplayResult = "replay" | "busy" | "off" | "top";

export function replayIntro(): ReplayResult {
  if (motionOffNow()) return "off";
  if (document.documentElement.classList.contains("intro-armed")) return "busy";
  emit("fastlane");
  try {
    if (introApi()?.replay?.()) return "replay";
  } catch {
    /* fall through to the scroll */
  }
  goTop();
  return "top";
}
