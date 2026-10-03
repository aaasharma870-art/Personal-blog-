/* ============================================================================
   BEATS — the page's rhythm as data (PHASE3-SPEC §2, §3.4). PURE: type-only
   imports, so Node imports it directly (the validator's beats checks).

   Sections carry `beats` + `tempo` + `estVh` in lib/page.ts; act cards carry
   them in lib/film.ts `acts[]` (at p × travel); the intro's B00/B01 sit in
   `film.prologue.beats` (outside the page rules). The DOM element that
   performs a beat carries `beatAttrs(id, star?)`. Beat ids: `B<nn>` = the
   star of spec §2.3 row nn; secondary / quiet beats `B<nn>-<slug>`
   (PHASE3-PLAN §3.2).

   UNITS. `at` / `span` are CSS vh @1440×900 (9 px each) in the beat map's
   own coordinate: the VIEWPORT-TOP scroll position, measured from the
   item's top (spec §2.3 rows are "scrollY = viewport top"). So a card's
   beats are p × travel, and a beat that plays while its section is still
   rising from below has a negative `at` (an h2 that arrives as the section
   enters: at -100, span 100). `estVh` is in VIEWPORTS (d = px@1440 / 900,
   t = px@1024 / 768). The validator places an offset ≥ 0 at the same
   fraction of the item at 1024 and keeps a negative one as is.

   TIMING. A scroll star's [at, at + span] is its declared range (the
   validator's spans, overlaps and pacing); at runtime it owns the
   spotlight over its PERFORMANCE WINDOW, measured on the element that
   carries its data-beat (lib/spotlight.ts THE WINDOW: `beatAttrs(id,
   { weight, scroll: "top 85%, bottom 35%" })`, or lib/spotlight-windows.ts
   for hosts that register without one). A time star's [at, at + span] is
   its trigger zone: the beat map sizes those rows at ≈ 100vh, i.e. the
   trigger ±50vh (spec §3.4 check 2); a time star with span 0 occupies
   at ± 50vh. Quiet beats (no `star`) only count for gaps.

   BREATHS (P3-11 r1, J1 #8; spec §2.1 pacing). A breath is DERIVED, never
   typed in: the viewport (100vh) right after each weight-3 star (a card's
   (a) → (b) set piece counts as one, from the end of its (b)). Only there
   is a rest right; a reader second with no star outside a breath is a dead
   one. scripts/checks/beats.mjs lists them and keeps them weight ≤ 1;
   tools/capture/clips.mjs places them on each run's geometry (`breath`).

   SLUGS the validator reads: `-rack` = rack focus (split windows only);
   `-spray` / `-chalk` / `-fireflies` / `-motes` = that weather kind (one
   kind per world, with the stage cues' `weather`). `world` / `act` are set
   only where a beat belongs to another world than its item (the films
   screens, the ignite card's RDR2 side); otherwise they derive.
   ========================================================================== */

import type { ActId } from "./film";
import type { WorldId } from "./worlds";

export type BeatKind =
  | "transition"
  | "push-title"
  | "push-in"
  | "title"
  | "scrub-sentence"
  | "subtitle"
  | "physical-word"
  | "fly-through"
  | "impact"
  | "letterbox"
  | "match-cut"
  | "signature"
  | "toy-invite"
  | "stage-cue"
  | "post-credits";

export type BeatWeight = 1 | 2 | 3;

export type Beat = {
  id: string;
  /** vh from the item top @1440×900, viewport-top scroll (may be < 0). */
  at: number;
  /** vh (a time star: its trigger zone; 0 = at ± 50vh). */
  span: number;
  kind: BeatKind;
  timing: "scroll" | "time";
  star?: true;
  /** Required on stars. */
  weight?: BeatWeight;
  /** push-title only. */
  push?: "in" | "sun";
  /** match-cut: the other half's data-beat. */
  pairWith?: string;
  /** Invites, fly-throughs: wait for scroll-idle (§3.8). */
  needsIdle?: true;
  world?: WorldId;
  act?: ActId;
  feature: `P3-${number}` | "existing";
};

export type Tempo = "slow" | "medium" | "brisk";

/** Estimated item height in viewports at 1440 (d) and 1024 (t), written by
 *  `tools/capture/beats.mjs --write`. */
export type EstVh = { d: number; t: number };

/** The attributes a beat's element carries. Star attributes are present
 *  only on stars (a plain beat never matches `[data-beat-star]`). */
export type BeatAttrs = {
  "data-beat": string;
  "data-beat-star"?: string;
  "data-beat-weight"?: string;
  "data-beat-scroll"?: string;
  "data-beat-live"?: string;
};

/** `data-beat` (+ `data-beat-star` / `data-beat-weight` for a star).
 *  `scroll`: a SCROLL star the desktop words binder registers with the
 *  spotlight by itself: its performance window ("top 85%, bottom 35%";
 *  lib/spotlight.ts) or `true` (lib/spotlight-windows.ts, else the
 *  default). `live`: it animates on its own while it owns (a loop). */
export function beatAttrs(id: string, star?: { weight: BeatWeight; scroll?: string | true; live?: true }): BeatAttrs {
  if (!star) return { "data-beat": id };
  const a: BeatAttrs = { "data-beat": id, "data-beat-star": "", "data-beat-weight": String(star.weight) };
  if (star.scroll) a["data-beat-scroll"] = star.scroll === true ? "" : star.scroll;
  if (star.live) a["data-beat-live"] = "";
  return a;
}
