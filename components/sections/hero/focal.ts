/* ============================================================================
   Hero geometry — PURE (no React, no DOM): the server computes the same
   numbers as the client, so the bracket's pre-measure position in the SSR
   HTML is already the settled one at the reference viewport.

   `media.focalBox` (lib/media.ts) is measured in PLATE fractions. The hero
   plate is drawn `object-fit: cover` at `object-position` = the asset's
   focal, so a plate fraction lands at a different fraction of the frame
   box at every viewport; `coverBox` maps one onto the other. `settleFrame`
   then applies the hero-lens bar's geometry rules (H7): the left spine sits
   ≥ `gap` px right of the h1, and neither spine comes closer than `margin`
   to the frame's edge (the hero passes the page gutter).
   ========================================================================== */

export type Box01 = { x0: number; x1: number; y0: number; y1: number };
export type Size = { w: number; h: number };

/** A plate-fraction box → fractions of a `cover`-fitted frame. */
export function coverBox(
  box: Box01,
  plate: Size,
  frame: Size,
  focal: readonly [number, number],
): Box01 {
  const s = Math.max(frame.w / plate.w, frame.h / plate.h);
  const rw = plate.w * s;
  const rh = plate.h * s;
  // object-position p% aligns the plate's p% point with the frame's p% point
  const ox = (frame.w - rw) * focal[0];
  const oy = (frame.h - rh) * focal[1];
  return {
    x0: (ox + box.x0 * rw) / frame.w,
    x1: (ox + box.x1 * rw) / frame.w,
    y0: (oy + box.y0 * rh) / frame.h,
    y1: (oy + box.y1 * rh) / frame.h,
  };
}

/** A box around a focal point when the asset has no measured focalBox:
 *  a wide, shallow band (the crest grammar of every hero plate). */
export function boxAroundFocal(focal: readonly [number, number], halfW: number, halfH: number): Box01 {
  return { x0: focal[0] - halfW, x1: focal[0] + halfW, y0: focal[1] - halfH, y1: focal[1] + halfH };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The bracket's resting frame inside a `w × h` box: the spines sit `inset`
 * px OUTSIDE the framed edges, so the left spine is kept ≥ `gap` px right of
 * `avoidRight` (the h1's right edge, px from the box's left; 0 = none) and
 * both spines stay ≥ `margin` px inside the box.
 */
export function settleFrame(
  box: Box01,
  { w, h, inset, gap = 16, margin = 8, avoidRight = 0 }: {
    w: number;
    h: number;
    inset: number;
    gap?: number;
    margin?: number;
    avoidRight?: number;
  },
): Box01 {
  if (!w || !h) return box;
  const minX0 = Math.max(inset + margin, avoidRight > 0 ? avoidRight + gap + inset : 0) / w;
  const maxX1 = (w - inset - margin) / w;
  let x0 = clamp(box.x0, minX0, 1);
  let x1 = clamp(box.x1, 0, maxX1);
  if (x1 - x0 < 0.08) {
    // too narrow to frame anything: keep a minimal bracket at the right
    x0 = Math.min(x0, maxX1 - 0.08);
    x1 = maxX1;
  }
  const y0 = clamp(box.y0, (inset + margin) / h, 1);
  const y1 = clamp(box.y1, y0 + 0.02, (h - inset - margin) / h);
  return { x0: round(x0), x1: round(x1), y0: round(y0), y1: round(y1) };
}

const round = (v: number) => Math.round(v * 10000) / 10000;

export function sameBox(a: Box01, b: Box01): boolean {
  return (
    Math.abs(a.x0 - b.x0) < 1e-4 &&
    Math.abs(a.x1 - b.x1) < 1e-4 &&
    Math.abs(a.y0 - b.y0) < 1e-4 &&
    Math.abs(a.y1 - b.y1) < 1e-4
  );
}

/** The reference viewport the SSR frame is computed for (DESIGN §3.3). */
export const REFERENCE_VIEWPORT: Size = { w: 1440, h: 900 };
/** --spacing-gutter at the reference viewport (clamp(…, 4rem) = 64 px): the
 *  hero bracket's outer margin, so its right spine sits on the page grid
 *  (innerWidth − gutter, where the header's MENU and the card reel marks
 *  end), never 8 px from the viewport edge. */
export const REFERENCE_GUTTER = 64;
