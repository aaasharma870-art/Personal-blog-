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

/** The two guided tours: "quick" is the ~90-second skim of the best parts,
 *  "full" the ~3-minute main cut. */
export type Tour = "quick" | "full";

export type DirectorsCutState = {
  running: boolean;
  paused: boolean;
  /** which tour plays (null when none runs) */
  tour: Tour | null;
  /** seconds played and the plan's total seconds (0 when idle) */
  elapsed: number;
  total: number;
  /** index into `chapters` of the chapter on screen (-1 when idle) */
  chapter: number;
  chapters: readonly string[];
};

const STOPPED: DirectorsCutState = { running: false, paused: false, tour: null, elapsed: 0, total: 0, chapter: -1, chapters: [] };

let state: DirectorsCutState = STOPPED;
let wantedTour: Tour = "full";
const listeners = new Set<() => void>();

/** The player only: publish the running state (progress via `patch`). */
export function setDirectorsCutState(running: boolean, patch: Partial<DirectorsCutState> = {}): void {
  const next: DirectorsCutState = running ? { ...(state.running ? state : STOPPED), running: true, tour: wantedTour, ...patch } : STOPPED;
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

/** Start a guided tour (call it from the click). */
export function startDirectorsCut(tour: Tour = "full"): void {
  if (!directorsCutAvailable() || state.running) return;
  wantedTour = tour;
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
      else m.play(borrowed, tour);
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
