/* ============================================================================
   GAMES · shared types and names (PHASE3-SPEC §9.2 #2, #3) — OWNER: W3-GAMES.
   Types only plus two constants: safe in server and client code, costs the
   first load nothing. The strings themselves are resolved on the server
   (components/games/copy.ts) and arrive as props, so no client chunk reads
   lib/film or lib/content for them (PHASE3-PLAN deferred #34: a lazy module
   must not pull content exports into the first load).
   ========================================================================== */

/** The homemade drone's strings (lib/film.ts `toy.drone.*`, filled). */
export type DroneCopy = {
  /** "▲ Take off" */
  pill: string;
  /** "Fly the homemade drone": the play field's name. */
  cmd: string;
  /** How to fly (the field's description). */
  help: string;
  /** "Gate n of 7 · <gauntlet[n].title verbatim>", gate 1 → 7. */
  gates: readonly string[];
  /** The gauntlet's seven titles, verbatim (the flight plan's list). */
  titles: readonly string[];
  /** "{n}/7 gates · {s} s" (n and s are filled by the game). */
  score: string;
  /** "Next: the kill-list ↓" */
  next: string;
  /** "Motion is off: here is the flight plan" */
  rm: string;
  /** "Best {s} s" once lib/film.ts has `toy.drone.best` (handoff), else null. */
  best: string | null;
};

/** The words on a game's arcade key and the line beside it (lib/film.ts
 *  `game.*`, resolved on the server so no client chunk reads lib/film). */
export type GameKeyCopy = {
  /** "Mini-game": the small label over the line, so the key reads as a game. */
  tag: string;
  /** The one plain line about what you do and how to stop. */
  what: string;
  /** The same line while Pause or reduced motion is on, when the press does
   *  something else (the drone: it opens the flight plan); null: `what` stays. */
  whatStill: string | null;
  /** The key's state window while it waits ("Ready"). */
  ready: string;
  /** … and while the game runs ("Live"). */
  live: string;
};

/** One baked drone sprite (a static image import, resolved on the server). */
export type DroneSprite = { src: string; width: number; height: number };
/** The sprite per `systems.drone` variant: default chalk, alt blueprint. */
export type DroneSprites = { default: DroneSprite; alt: DroneSprite };

/** Dead Eye's strings (lib/film.ts `toy.deadeye.*`). */
export type DeadEyeCopy = {
  /** "DEAD EYE" (the pill's accessible name; the pill shows it lettered). */
  pill: string;
  /** "Survived: not a target" */
  survivor: string;
  /** "{n}/5 marked · {s} s of Dead Eye left" */
  score: string;
  /** "Fire" */
  fire: string;
  /** "Release" */
  release: string;
  /** "Best: {n}/5 · {s} s" once lib/film.ts has `toy.deadeye.best` (handoff), else null. */
  best: string | null;
  /** "Click the killed ideas to mark them, then Fire." (how to play; shown in the HUD until the result). */
  help: string | null;
};

/** The window event that calls Dead Eye from outside the ledger (the typed
 *  word and the palette, through components/eggs/dead-eye.ts):
 *  detail { action: "start" | "fire" | "stop" }. */
export const DEAD_EYE_CALL = "p3:deadeye-call";

export type DeadEyeAction = "start" | "fire" | "stop";

/** Fill "{n}" / "{s}" style slots (the copy is filled on the server except
 *  for the live numbers). */
export function fill(t: string, v: Readonly<Record<string, string | number>>): string {
  return t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));
}

/** Seconds with one decimal ("18.4"). */
export const secs = (ms: number): string => (Math.max(0, ms) / 1000).toFixed(1);
