/* ============================================================================
   DIRECTOR'S CUT API (spec §11.1, P3-10) — OWNER: W3-CINEMA.
   The small static facade (DP-13): every entry point imports this file
   (the hero button through the dc binder, the chapter select's first item,
   the palette's "Play the director's cut"); the player itself
   (./directors-cut.ts) loads on the first start.

   startDirectorsCut() plays the page as a film: DESKTOP_FINE, motion on
   (no OS reduced motion, not paused), on the home page. It must be called
   from the click itself: the click is the sound consent, so `sound.borrow()`
   runs here SYNCHRONOUSLY, before any await (W2-SOUND handoff), and the
   player awaits it before it emits `dc:start`. Anywhere else (a touch
   tablet, reduced motion, Pause) it does nothing.
   stopDirectorsCut(reason) ends a run (any input, Esc, Pause, the fast
   lane, the stop pill, the end of the page). useDirectorsCut() reads
   whether one runs ({ running }: false on the server and in hydration).
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { on } from "@/lib/events";
import { DESKTOP_FINE, motionOffNow } from "@/lib/flags";
import { sound } from "@/lib/audio";

export type DirectorsCutState = { running: boolean };

const STOPPED: DirectorsCutState = { running: false };
const RUNNING: DirectorsCutState = { running: true };

let state: DirectorsCutState = STOPPED;
const listeners = new Set<() => void>();

/** The player only: publish the running state. */
export function setDirectorsCutState(running: boolean): void {
  const next = running ? RUNNING : STOPPED;
  if (next === state) return;
  state = next;
  if (typeof window !== "undefined") {
    // probes (tools/capture/probes/cinema.mjs) read it; a plain write
    (window as Window & { __dc?: boolean }).__dc = running;
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Can the director's cut play here and now? */
export function directorsCutAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/" && window.matchMedia(DESKTOP_FINE).matches && !motionOffNow();
}

type Player = typeof import("./directors-cut");
let player: Promise<Player> | null = null;
const loadPlayer = (): Promise<Player> => {
  if (!player) {
    player = import("./directors-cut");
    player.catch(() => {
      player = null;
    });
  }
  return player;
};

const INPUT = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/** Start the director's cut (call it from the click). */
export function startDirectorsCut(): void {
  if (!directorsCutAvailable() || state.running) return;
  // the click is the consent and the gesture: borrow the sound NOW
  const borrowed = sound.borrow();
  setDirectorsCutState(true);
  // input while the player loads (the palette and the chapter select do not
  // pre-load it) cancels the run, as it stops one that plays (else the late
  // run would ignore it, then cut the page back to the top)
  let cancelled = false;
  const opts = { capture: true, passive: true } as const;
  const cancel = () => {
    cancelled = true;
  };
  const offFast = on("fastlane", cancel);
  for (const ev of INPUT) window.addEventListener(ev, cancel, opts);
  const settle = () => {
    offFast();
    for (const ev of INPUT) window.removeEventListener(ev, cancel, opts);
  };
  const abort = () => {
    setDirectorsCutState(false);
    void borrowed.then((restore) => restore());
  };
  void loadPlayer().then(
    (m) => {
      settle();
      if (cancelled) abort();
      else m.play(borrowed);
    },
    () => {
      settle();
      abort();
    },
  );
}

/** Stop a running director's cut (no-op when none runs). */
export function stopDirectorsCut(reason: string): void {
  if (!state.running) return;
  void loadPlayer().then((m) => m.stop(reason));
}

/** Whether the director's cut is running (false on the server). */
export function useDirectorsCut(): DirectorsCutState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => STOPPED,
  );
}
