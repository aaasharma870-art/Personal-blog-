/* ============================================================================
   BEATS — the page's rhythm as data (PHASE3-SPEC §2, §3.4). PURE: type-only
   imports, so Node imports it directly (the validator's beats checks).

   Sections carry `beats` + `tempo` + `estVh` in lib/page.ts; act cards carry
   them in lib/film.ts `acts[]` (at p × travel). The DOM element that
   performs a beat carries `beatAttrs(id, star?)`. Beat ids: `B<nn>` = the
   star of spec §2.3 row nn; secondary / quiet beats `B<nn>-<slug>`
   (PHASE3-PLAN §3.2).
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
  /** vh from the item top @1440×900. */
  at: number;
  /** vh. */
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
};

/** `data-beat` (+ `data-beat-star` / `data-beat-weight` for a star). */
export function beatAttrs(id: string, star?: { weight: BeatWeight }): BeatAttrs {
  return star
    ? { "data-beat": id, "data-beat-star": "", "data-beat-weight": String(star.weight) }
    : { "data-beat": id };
}
