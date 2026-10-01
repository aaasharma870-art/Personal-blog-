import { FRAME_ASPECT, type Aspects } from "@/components/sections/act-card/plate";

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
