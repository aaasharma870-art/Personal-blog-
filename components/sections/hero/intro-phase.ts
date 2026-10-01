"use client";

import { useSyncExternalStore } from "react";

/**
 * The prologue's state, as the hero needs it (SPEC v2 §5.1, §5.3 "end",
 * §5.6; hero-lens.BAR S0i / H25; PHASE3-SPEC §4.2). The intro is a vanilla
 * overlay the React tree never owns, so the hero only LISTENS:
 *   - `html.intro-armed` is present while the overlay is up (set before
 *     paint by the head script, removed on the end / skip / Esc / scroll /
 *     the 3 s failsafe);
 *   - `html.intro-handoff` is added at the HOLD (P3-3): the flight's last
 *     frame is held on a static canvas, its video is gone, and the hero
 *     loop may take the decoder and start UNDER the hold, so the reveal
 *     uncovers a sea that is already moving;
 *   - a window CustomEvent "intro:end" with detail { played, reason } fires
 *     when it goes (played = the flight landed on the hero; false = it was
 *     dismissed before or instead of the flight).
 *
 * Phases: "unknown" (server + hydration: render the final state) · "armed" ·
 * "handoff" (still under the overlay, but settled FOR MEDIA) · "played" ·
 * "dismissed" · "none" (the intro never armed on this view).
 * The listener is installed when this module loads — before hydration — so
 * an early dismissal (Esc before React is up) is not missed.
 */
export type IntroPhase = "unknown" | "armed" | "handoff" | "played" | "dismissed" | "none";

type EndDetail = { played?: boolean; reason?: string };

let ended: { played: boolean } | null = null;
const listeners = new Set<() => void>();
const endCallbacks = new Set<(played: boolean) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("intro:end", (e) => {
    const detail = (e as CustomEvent<EndDetail | undefined>).detail;
    ended = { played: Boolean(detail?.played) };
    // the next task, not the controller's finish(): the hero's re-render
    // never lands in the hand-off frame
    window.setTimeout(() => {
      listeners.forEach((l) => l());
      endCallbacks.forEach((cb) => cb(ended?.played ?? false));
    }, 0);
  });
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const mo =
    typeof MutationObserver === "undefined" ? null : new MutationObserver(() => window.setTimeout(onChange, 0));
  mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => {
    listeners.delete(onChange);
    mo?.disconnect();
  };
}

function snapshot(): IntroPhase {
  const c = document.documentElement.classList;
  if (c.contains("intro-handoff")) return "handoff";
  if (c.contains("intro-armed")) return "armed";
  if (ended) return ended.played ? "played" : "dismissed";
  return "none";
}

const serverSnapshot = (): IntroPhase => "unknown";

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** Hero MEDIA may take the decoder: the overlay is gone (or never came), or
 *  it is holding its last frame for the hand-off ("handoff"). Not a signal
 *  that the overlay is off the screen: use `introGone` for that. */
export function introSettled(phase: IntroPhase): boolean {
  return phase === "none" || phase === "handoff" || phase === "played" || phase === "dismissed";
}

/** The overlay is off the screen (or never came). */
export function introGone(phase: IntroPhase): boolean {
  return phase === "none" || phase === "played" || phase === "dismissed";
}

/** Subscribe to the end of the prologue (`played` = it landed on the hero). */
export function onIntroEnd(cb: (played: boolean) => void): () => void {
  endCallbacks.add(cb);
  return () => {
    endCallbacks.delete(cb);
  };
}
