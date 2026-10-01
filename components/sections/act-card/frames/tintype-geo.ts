import { FRAME_ASPECT, type Aspects, type Box } from "@/components/sections/act-card/plate";

/* The tintype card's geometry (frames/tintype.tsx, tintype-deadeye.tsx):
   pure data, server-importable (the pin spec registers the plate on the
   frame's MATCH_ROW and hands GL the inset plate's cover). */

/** The frame's viewBox (2.39:1 ≈ 1000 × 418). */
export const VB = { w: 1000, h: 418 } as const;
/** Plate inset inside the frame (viewBox units) and its corner radius. */
export const PLATE = { x: 40, y: 22, w: 920, h: 374, r: 6 } as const;
/** The PLATE box's aspect inside the card frame (3:2 / 2.39:1). */
export const PLATE_ASPECT: Aspects = {
  base: (FRAME_ASPECT.base * PLATE.w) / VB.w / (PLATE.h / VB.h),
  sm: (FRAME_ASPECT.sm * PLATE.w) / VB.w / (PLATE.h / VB.h),
};

/** A box in PLATE-box fractions → FRAME fractions (the tintype plate is an
 *  inset of the frame). */
export function plateBoxInFrame(b: Box): Box {
  return {
    l: (PLATE.x + b.l * PLATE.w) / VB.w,
    t: (PLATE.y + b.t * PLATE.h) / VB.h,
    w: (b.w * PLATE.w) / VB.w,
    h: (b.h * PLATE.h) / VB.h,
  };
}

/** A FRAME row as a row of the inset PLATE box (MATCH_ROW → the plate). */
export const plateRow = (frameRow: number): number => (frameRow * VB.h - PLATE.y) / PLATE.h;
