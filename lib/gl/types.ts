/* ============================================================================
   GL TYPES — the card specs the contained WebGL layer draws (PHASE3-SPEC
   §3.3, §7.1–§7.3, §8.1; PHASE3-PLAN §3.5). Types only. OWNER: W2-GL.
   Each pinned card has two stars: (a) the world transition over `a.range`
   and (b) the push through the act title (the `title` flavour, a
   text-as-mask) over `b.range`. Both halves meet at `row` (MATCH_ROW).

   COORDINATES (every field): frame fractions of the card frame the GlGate
   sits in, origin top-left, y DOWN (0–1 across, 0–1 down). Radii and shape
   sizes are in frame-HEIGHT units (aspect-corrected distances).

   WHAT THE GL DRAWS, by p (lib/gl/plan.ts `frameAt`):
     p ≤ a.range[0]          the hook frame (the first pass at t = 0)
     a.range                 star (a): one pass, or OUT then IN split at the
                             meet (`shapes.at`, else .22 of a .45 range)
     a.range[1] … b.range[0] the settled `to` plate (opaque; = the DOM plate)
     b.range[0] … .68        transparent (the DOM push plays underneath)
     .68 … b.range[1]        `title`: the frame outside the letters fades to
                             the world deep, the letters (transparent: the
                             live DOM push shows through) scale about
                             `b.maskOrigin` to full-bleed
     p ≥ b.range[1]          transparent (full-bleed; the stage takes over)
   So the push layers (SEQ canvas, L08 camera group) must NOT carry
   `data-gl-replaced`: they sit under the GL canvas and show through it.

   `a.flavour` NAMES THE IN HALF the variant chose: "chalk" | "duster"
   (seam: the `wave` OUT half is implied), "ink" | "lumos" (ignite: the
   `burn` OUT half is implied), "iris" (opening), "develop" | "deadeye"
   (tintype). Passing the OUT name ("wave" / "burn") picks the IN half from
   `variant` (default → chalk / ink, alt → duster / lumos).
   ========================================================================== */

import type { MotionValue } from "motion/react";
import type { MediaId } from "../media";
import type { SkyKey } from "../sky";
import type { Variant } from "../variants";
import type { WorldId } from "../worlds";

export type GlFlavour =
  | "iris"
  | "wave"
  | "chalk"
  | "duster"
  | "develop"
  | "deadeye"
  | "burn"
  | "ink"
  | "lumos"
  | "title";

/** A plate's cover fit in the card frame: its WHOLE box (the plate's own
 *  aspect, so cover = no crop) in frame fractions — `scale` = the box width
 *  in frame widths (its height follows from the plate's aspect), `ox, oy` =
 *  the box's top-left. Registration and zoom included. From PlateBox's
 *  `coverBox()` Box `{ l, t, w }`: `{ scale: w, ox: l, oy: t }`
 *  (lib/gl/cover.ts `coverOf` / `coverFor`). */
export type CoverBox = { scale: number; ox: number; oy: number };

export type GlCard = "opening" | "seam" | "tintype" | "ignite";

/** Carried shapes (SDFs): 32-tick compass ring, 12-tooth gear, 12-spoke
 *  wagon wheel, the snitch (sphere + two wings). */
export type GlShape = "ring32" | "gear12" | "wheel12" | "snitch";

export type GlCardSpec = {
  card: GlCard;
  variant: Variant;
  /** Star (a): the world transition, p 0–.45 (tintype .03–.45). `from` /
   *  `to` are image plates (a video id falls back to its poster). Plate
   *  marks are read from lib/media.ts: `fire` (burn origin, `from`),
   *  `lineStart` → `window` (ink origin / the Lumos path, `to`), `wheel` +
   *  `wheelR` (the ignite's carried wheel, `from`), `stern` (iris centre
   *  fallback, `to`). */
  a: { flavour: GlFlavour; from: MediaId; to: MediaId; range: readonly [number, number] };
  /** Star (b): the act title as a mask over the push, p .50–1. `text` is
   *  set in the world's head face (`--font-world-head`). `maskOrigin` =
   *  the zoom point in the TITLE'S INK BOX (0–1 across the ink, 0 = cap
   *  top … 1 = ink bottom); the SDF generator snaps it to the deepest stroke
   *  point nearby, so the stroke always covers the frame at p 1. */
  b: {
    flavour: "title";
    text: string;
    world: WorldId;
    maskOrigin: readonly [number, number];
    range: readonly [number, number];
  };
  /** The carried line (MATCH_ROW, 0–1 of the letterbox frame): the develop
   *  front's origin row; the seam's shape row when `center` is absent. */
  row: number;
  cover: { from: CoverBox; to: CoverBox };
  /** The transition's focus (frame fractions): the iris disc centre; the
   *  Dead Eye chroma-split centre; the seam's carried shape. Absent → from
   *  the plate marks (above), else the frame centre on `row`. */
  center?: readonly [number, number];
  /** [start, end] radius in frame-height units (iris: start .12 × the
   *  frame diagonal, end = the farthest corner; burn / ink / lumos: their
   *  own defaults). */
  radius?: readonly [number, number];
  /** The carried shape: `from` folds into `to` at p `at` (also the OUT/IN
   *  meet). wheel12 → snitch passes through ring32 (§7.3). */
  shapes?: { from: GlShape; to: GlShape; at: number };
  /** The IN half's grade ramp (lib/sky.ts keys); ends at identity, so the
   *  settled frame equals the DOM plate. squall → day ramps via dawn. */
  grade?: { from: SkyKey; to: SkyKey };
  /** The impact (§7.6) on the GL tier: when `impact(world)` fires for
   *  `b.world` (the `impact` event), the GL pulses once — a white flash of
   *  `amount` (120 ms), or for the HP world an exposure bloom of `amount`
   *  EV (180 ms). `at` documents the p it lands on (CARDS calls impact()). */
  flash?: { at: number; amount: number };
  /** pc-kraken (§9.1 #6): 0 → 1 → 0 on the seam's storm, `wave` only. */
  kraken?: MotionValue<number>;
};
