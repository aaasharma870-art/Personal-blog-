/* ============================================================================
   GL TYPES — the card specs the contained WebGL layer draws (PHASE3-SPEC
   §3.3, §7.1–§7.3; PHASE3-PLAN §3.5). Types only.
   Each pinned card has two stars: (a) the world transition over `a.range`
   and (b) the push through the act title (the `title` flavour, a
   text-as-mask) over `b.range`. Both halves meet at `row` (MATCH_ROW).
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

/** A plate's cover fit in the card frame: scale + offset (frame units). */
export type CoverBox = { scale: number; ox: number; oy: number };

export type GlCard = "opening" | "seam" | "tintype" | "ignite";

/** Carried shapes (SDFs): 32-tick compass ring, 12-tooth gear, 12-spoke
 *  wagon wheel, the snitch (sphere + two wings). */
export type GlShape = "ring32" | "gear12" | "wheel12" | "snitch";

export type GlCardSpec = {
  card: GlCard;
  variant: Variant;
  /** Star (a): the world transition, p 0–.45. */
  a: { flavour: GlFlavour; from: MediaId; to: MediaId; range: readonly [number, number] };
  /** Star (b): the act title as a mask over the push, p .50–1. */
  b: {
    flavour: "title";
    text: string;
    world: WorldId;
    maskOrigin: readonly [number, number];
    range: readonly [number, number];
  };
  /** The carried line (MATCH_ROW, 0–1 of the letterbox frame). */
  row: number;
  cover: { from: CoverBox; to: CoverBox };
  center?: readonly [number, number];
  radius?: readonly [number, number];
  shapes?: { from: GlShape; to: GlShape; at: number };
  grade?: { from: SkyKey; to: SkyKey };
  flash?: { at: number; amount: number };
  /** pc-kraken (§9.1 #6): 0 → 1 → 0 on the seam's storm, `wave` only. */
  kraken?: MotionValue<number>;
};
