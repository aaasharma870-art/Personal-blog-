/* ============================================================================
   GL COVER — pure helpers that turn PlateBox geometry into the GL layer's
   CoverBox (lib/gl/types.ts) and plate points into frame points. No DOM,
   no imports: the server, the lab and the CARDS builder share the math.
   OWNER: W2-GL.
   ========================================================================== */

import type { CoverBox } from "./types";

/** PlateBox's Box (`coverBox()` in act-card/plate.tsx: fractions of the
 *  frame) → CoverBox. */
export function coverOf(box: { l: number; t: number; w: number }): CoverBox {
  return { scale: box.w, ox: box.l, oy: box.t };
}

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** `object-fit: cover` + `object-position: pos` of a plate (aspect w/h) in
 *  a frame (aspect w/h), zoomed by `zoom` ≥ 1 about `pos`: the plate's whole
 *  box as a CoverBox (the same crop as PlateBox at zoom 1). */
export function coverFor(frameAspect: number, plateAspect: number, pos: readonly [number, number], zoom = 1): CoverBox {
  // box size in frame fractions at zoom 1
  const w = frameAspect >= plateAspect ? 1 : plateAspect / frameAspect;
  const h = (w * frameAspect) / plateAspect;
  const l = -(w - 1) * c01(pos[0]);
  const t = -(h - 1) * c01(pos[1]);
  // zoom about the plate point at `pos` (its frame position stays put)
  const ax = l + pos[0] * w;
  const ay = t + pos[1] * h;
  return { scale: w * zoom, ox: ax - pos[0] * w * zoom, oy: ay - pos[1] * h * zoom };
}

/** The box as the shader's vec4: [width, height, left, top] in frame
 *  fractions (height from the plate and frame aspects). */
export function coverVec(c: CoverBox, frameAspect: number, plateAspect: number): [number, number, number, number] {
  return [c.scale, (c.scale * frameAspect) / plateAspect, c.ox, c.oy];
}

/** A plate point (0–1 of the plate) in frame fractions. */
export function inFrame(pt: readonly [number, number], box: readonly number[]): [number, number] {
  return [box[2] + pt[0] * box[0], box[3] + pt[1] * box[1]];
}
