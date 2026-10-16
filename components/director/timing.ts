/* Director's cut timing (PHASE3-SPEC §11.1), pure data shared by the player
   (directors-cut.ts), the planner (plan.ts, storyboard.ts) and the
   server-rendered /lab/p3/cinema shot list.

   TOURS: the two guided tours' parameters. Nothing in a tour's LENGTH is
   typed here: the planner solves the cruise speed from the live page so the
   total lands on `target` (inside `window`); `vMax` is the fastest glide it
   may use (Aryan dislikes blur and choppy cuts: far-apart highlights are
   joined with a short dip to dark instead of a fast smear).
   SPEED / DWELL: the old tempo table (px/s per manifest tempo code, ms held
   on a star by weight). The planner reads the tempo CODE of each item
   (data-dc-shots) as a relative factor (TEMPO); the table itself is kept
   for the lab page's estimate. */
import type { Tour } from "./api";

export const SPEED = { c: 140, s: 90, m: 110, b: 150 } as const;
export const DWELL: Readonly<Record<number, number>> = { 3: 1200, 2: 600 };

/** Relative cruise factor per manifest tempo code (slow sections read
 *  slower, brisk ones sweep). */
export const TEMPO = { s: 0.8, m: 1, b: 1.25, c: 1 } as const;

/** Seconds held at rest on each kind of key. */
export type Holds = {
  hero: number;
  head: number;
  /** a section whose head frame carries a claim's lede and caveat */
  headResearch: number;
  w3: number;
  w2: number;
  finale: number;
  /** a card's landed world, its title with the logline, the end of the page */
  land: number;
  title: number;
  end: number;
};

export type TourParams = {
  /** the length the planner aims for (s), and the window it must land in */
  target: number;
  window: readonly [number, number];
  /** accel limit (px/s^2): ramps last 1.5 * dv / a */
  a: number;
  /** cruise limits (px/s) */
  vMin: number;
  vMax: number;
  holds: Holds;
  /** card cruise: world change (a), title run-up (b), leaving the title */
  card: { a: number; b: number; out: number };
  /** the lowest star weight that earns a hold (stars of this weight or more) */
  minW: number;
  /** join far-apart highlights with a dip to dark (instead of gliding) */
  dips: boolean;
  /** quick only: keep adding optional scenes while the solved cruise stays <= this (px/s) */
  comfy: number;
  /** extra seconds before a card hold counts: its damped progress settles */
  settle: number;
};

export const TOURS: Readonly<Record<Tour, TourParams>> = {
  full: {
    target: 180,
    window: [170, 190],
    a: 1200,
    vMin: 160,
    vMax: 1000,
    holds: { hero: 2, head: 1.2, headResearch: 1.6, w3: 1.2, w2: 0.8, finale: 1, land: 1.2, title: 1.8, end: 4 },
    card: { a: 130, b: 150, out: 240 },
    minW: 2,
    dips: false,
    comfy: 0,
    settle: 0.3,
  },
  quick: {
    target: 90,
    window: [85, 105],
    a: 1500,
    vMin: 220,
    vMax: 1250,
    holds: { hero: 1.2, head: 0.7, headResearch: 1.1, w3: 0.8, w2: 0, finale: 0.5, land: 0.8, title: 1, end: 3 },
    card: { a: 230, b: 260, out: 420 },
    minW: 3,
    dips: true,
    comfy: 650,
    settle: 0.3,
  },
};

/** Where in a card's pinned travel its TITLE frame sits: the letters open
 *  with the logline still on the lower bar (the title leaves at p .88 and .90
 *  crops the push). Per card id, read off the live cards at 1440x900: acts I
 *  and II read fully at .80; The Frontier's letters are whole at .78 (by .84
 *  the push crops them); The Light's mask letters form late, at .85. */
export const TITLE_AT_DEFAULT = 0.8;
export const TITLE_AT: Readonly<Record<string, number>> = { "act-3": 0.78, "act-4": 0.85 };

/** Seconds a dip to dark is planned at (the cut: fade in, jump, fade out). */
export const DIP_S = 0.6;
