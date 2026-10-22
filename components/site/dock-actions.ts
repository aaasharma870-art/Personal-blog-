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

type IntroApi = { replay?: () => boolean };
const introApi = (): IntroApi | undefined => (window as Window & { __intro?: IntroApi }).__intro;

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
 * Replay the intro: THE one function every entrance uses (the header's
 * "Replay intro", the menu's replay row, the palette's "Watch the intro
 * again" and the closing "Mischief managed" button). A replay is a brand-new
 * visit: the head script (components/intro/intro-head-script.tsx
 * `__intro.replay()`) forgets `intro-seen`, leaves a one-shot marker, scrolls
 * to the top and replaces the location with the clean home URL, so the page
 * reloads straight into the Play card through the same cold path a first
 * visit takes (never a re-arm of the controller this page already ran).
 * Returns:
 *  - "replay"  the page is reloading into the intro (about a second);
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
