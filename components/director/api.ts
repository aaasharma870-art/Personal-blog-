/* ============================================================================
   DIRECTOR'S CUT API (spec §11.1, P3-10) — OWNER: W3-CINEMA, rebuilt by the
   camera worker (Oct 16: two tours, a transport, no autoscroll feel).
   The small static facade (DP-13): every entry point imports this file
   (the header switch and chooser, the hero button through the dc binder, the
   chapter select's first item, the palette's "Play the director's cut"); the
   player itself (./directors-cut.ts) loads on the first start.

   startDirectorsCut(tour) plays the page as a film: DESKTOP_FINE, motion on
   (no OS reduced motion, not paused), on the home page, the intro not
   playing. "quick" is the ~90-second skim of the best parts, "full" the
   ~3-minute main cut; both lengths are COMPUTED from the live page (the
   plan's total shows in `state.total` once a run starts, and
   `directorsCutLengths()` gives both before one does).
   It does NOT touch the sound: the cut starts with the sound as the visitor
   left it (the old click-borrow that unmuted is gone).
   stopDirectorsCut(reason) ends a run (Esc, the switch, Pause, the fast
   lane, a game, the end). A wheel / touch / key / click on the page PAUSES
   it instead (the transport shows "Paused · Resume"); presses inside any
   `[data-dc-keep]` element (the header control group, the transport) never
   pause it. pauseDirectorsCut / resumeDirectorsCut / seekDirectorsCut /
   stepDirectorsCut / restartDirectorsCut drive the transport.
   useDirectorsCut() reads the state ({ running }: false on the server and in
   hydration). The progress BAR is not React state: the transport reads
   `getPlayhead()` from its own rAF.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { on } from "@/lib/events";
import { DESKTOP_FINE, motionOffNow } from "@/lib/flags";

export { cameraOwnsScroll as directorsCutOwnsScroll } from "@/lib/smooth-scroll";

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
  /** chapter start seconds (the transport's ticks), parallel to `chapters` */
  starts: readonly number[];
  /** the run finished: the transport offers Play again / Skip to the research for a while */
  ended: boolean;
};

const STOPPED: DirectorsCutState = {
  running: false,
  paused: false,
  tour: null,
  elapsed: 0,
  total: 0,
  chapter: -1,
  chapters: [],
  starts: [],
  ended: false,
};

/** How long the end state stays up. */
const END_MS = 12000;

let state: DirectorsCutState = STOPPED;
let wantedTour: Tour = "full";
let endTimer: ReturnType<typeof setTimeout> | undefined;
let playhead: () => number = () => 0;
const listeners = new Set<() => void>();

function commit(next: DirectorsCutState): void {
  if (next === state) return;
  state = next;
  if (typeof window !== "undefined") {
    // probes (tools/capture/probes/cinema.mjs) read it; a plain write
    (window as Window & { __dc?: boolean }).__dc = next.running;
  }
  listeners.forEach((l) => l());
}

/** The player only: publish the running state (progress via `patch`). */
export function setDirectorsCutState(running: boolean, patch: Partial<DirectorsCutState> = {}): void {
  if (!running) {
    commit(STOPPED);
    return;
  }
  clearTimeout(endTimer);
  commit({ ...(state.running ? state : STOPPED), running: true, tour: wantedTour, ...patch, ended: false });
}

/** The player only: a run reached its end (the end state shows for a while). */
export function setDirectorsCutEnded(): void {
  const s = state;
  clearTimeout(endTimer);
  commit({
    ...STOPPED,
    tour: s.tour ?? wantedTour,
    total: s.total,
    elapsed: s.total,
    chapters: s.chapters,
    starts: s.starts,
    chapter: s.chapters.length - 1,
    ended: true,
  });
  endTimer = setTimeout(() => {
    if (state.ended) commit(STOPPED);
  }, END_MS);
}

/** Dismiss the end state. */
export function clearDirectorsCutEnded(): void {
  clearTimeout(endTimer);
  if (state.ended) commit(STOPPED);
}

/** The player only: where the camera is, in seconds of the plan (read per frame by the transport). */
export function setPlayhead(fn: () => number): void {
  playhead = fn;
}
export function getPlayhead(): number {
  return playhead();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Can the director's cut play here and now? */
export function directorsCutAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.pathname === "/" &&
    window.matchMedia(DESKTOP_FINE).matches &&
    !motionOffNow() &&
    !document.documentElement.classList.contains("intro-armed")
  );
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

/** Set while a start waits for the player chunk: a stop in that window cancels it. */
let cancelPending: (() => void) | null = null;

/** An event inside the control group or the transport never pauses the cut. */
export const KEEP = "[data-dc-keep]";
export const inKeep = (e: Event): boolean => e.target instanceof Element && Boolean(e.target.closest(KEEP));

const INPUT = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/** Start a guided tour (call it from the click). */
export function startDirectorsCut(tour: Tour = "full", o: { top?: boolean } = {}): void {
  if (!directorsCutAvailable() || state.running) return;
  wantedTour = tour;
  setDirectorsCutState(true, { tour, paused: false, elapsed: 0, total: 0, chapter: -1, chapters: [], starts: [] });
  // input while the player loads (the palette and the chapter select do not
  // pre-load it) cancels the run, as it stops one that plays (else the late
  // run would ignore it)
  let cancelled = false;
  const opts = { capture: true, passive: true } as const;
  const cancel = (e: Event) => {
    if (inKeep(e)) return;
    cancelled = true;
  };
  const offFast = on("fastlane", () => {
    cancelled = true;
  });
  for (const ev of INPUT) window.addEventListener(ev, cancel, opts);
  cancelPending = () => {
    cancelled = true;
  };
  const settle = () => {
    cancelPending = null;
    offFast();
    for (const ev of INPUT) window.removeEventListener(ev, cancel, opts);
  };
  const abort = () => setDirectorsCutState(false);
  void loadPlayer().then(
    (m) => {
      settle();
      if (cancelled) abort();
      else m.play(tour, Boolean(o.top));
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
  // still loading the player: cancel the start (the one stop; nothing plays later)
  if (cancelPending) {
    cancelPending();
    return;
  }
  void loadPlayer().then((m) => m.stop(reason));
}

/** Pause (the camera eases to rest where it is). */
export function pauseDirectorsCut(): void {
  if (state.running && !state.paused) void loadPlayer().then((m) => m.pause());
}

/** Resume from where the page is now. */
export function resumeDirectorsCut(): void {
  if (state.running && state.paused) void loadPlayer().then((m) => m.resume());
}

/** Go to the start of chapter `i` (an index into `state.chapters`) and play on. */
export function seekDirectorsCut(i: number): void {
  if (state.running) void loadPlayer().then((m) => m.seek(i));
}

/** The next (+1) or previous (-1) chapter. */
export function stepDirectorsCut(dir: 1 | -1): void {
  if (state.running) void loadPlayer().then((m) => m.step(dir));
}

/** Play the last tour again from the top (the end state's button). */
export function restartDirectorsCut(): void {
  const tour = state.tour ?? wantedTour;
  clearDirectorsCutEnded();
  startDirectorsCut(tour, { top: true });
}

/** The two tours' computed lengths in seconds, from the live page (the
 *  player loads for it; 0 when it cannot plan). */
export function directorsCutLengths(): Promise<Record<Tour, number>> {
  return loadPlayer().then(
    (m) => m.lengths(),
    () => ({ quick: 0, full: 0 }),
  );
}

/** Whether the director's cut is running (false on the server). */
export function useDirectorsCut(): DirectorsCutState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => STOPPED,
  );
}

/* probes (`/?debug=dc`): the same entry points on window, plus the state */
if (typeof window !== "undefined" && /[?&]debug=dc\b/.test(window.location.search)) {
  (window as unknown as { __dcApi?: unknown }).__dcApi = {
    start: startDirectorsCut,
    stop: stopDirectorsCut,
    pause: pauseDirectorsCut,
    resume: resumeDirectorsCut,
    seek: seekDirectorsCut,
    step: stepDirectorsCut,
    restart: restartDirectorsCut,
    lengths: directorsCutLengths,
    state: () => state,
    playhead: getPlayhead,
  };
}
