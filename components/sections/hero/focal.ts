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

/** A plate-fraction point → fractions of the same `cover`-fitted frame. */
export function coverPoint(
  p: readonly [number, number],
  plate: Size,
  frame: Size,
  focal: readonly [number, number],
): readonly [number, number] {
  const b = coverBox({ x0: p[0], x1: p[0], y0: p[1], y1: p[1] }, plate, frame, focal);
  return [b.x0, b.y0];
}

/** The smallest box holding both (the hero Lens: the crest ∪ the Pearl). */
export function unionBox(a: Box01, b: Box01): Box01 {
  return {
    x0: Math.min(a.x0, b.x0),
    x1: Math.max(a.x1, b.x1),
    y0: Math.min(a.y0, b.y0),
    y1: Math.max(a.y1, b.y1),
  };
}

/** `b` grown by `px` / `py` on each side, kept inside 0–1. */
export function padBox(b: Box01, px: number, py: number): Box01 {
  return {
    x0: clamp(b.x0 - px, 0, 1),
    x1: clamp(b.x1 + px, 0, 1),
    y0: clamp(b.y0 - py, 0, 1),
    y1: clamp(b.y1 + py, 0, 1),
  };
}

export function boxCentre(b: Box01): readonly [number, number] {
  return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
}

/** A frame-fraction box seen through `transform: scale(s)` about `o`
 *  (frame fractions; the ALT spyglass push-in). */
export function zoomBox(b: Box01, s: number, o: readonly [number, number]): Box01 {
  if (s === 1) return b;
  return {
    x0: o[0] + (b.x0 - o[0]) * s,
    x1: o[0] + (b.x1 - o[0]) * s,
    y0: o[1] + (b.y0 - o[1]) * s,
    y1: o[1] + (b.y1 - o[1]) * s,
  };
}

/** One plate's geometry in a `view`-sized cover frame (all frame
 *  fractions): `lens` = the Lens box at the FINAL zoom (before
 *  settleFrame), `origin` = the zoom's transform-origin, `wake` = the crest
 *  band at zoom 1 (the velocity layers ride inside the zoomed plate). */
export type PlateGeo = {
  lens: Box01;
  origin: readonly [number, number];
  wake: Box01;
  /** What the bracket must enclose (the Pearl) at the final zoom, if any. */
  keep: Box01 | null;
  /** The zoom this view plays (the ALT falls back to 1: see below). */
  zoom: number;
};
export type PlateGeoInput = {
  box: Box01;
  /** The DEFAULT framing (crest ∪ Pearl): the ALT's fallback. */
  wide: Box01;
  crest: Box01;
  keep: Box01 | null;
  size: Size;
  focal: readonly [number, number];
  zoom: number;
  zoomAt: readonly [number, number];
};
/** Where the cover fit crops the Pearl out of the frame (a portrait tablet
 *  on the 16:9 plate), a push-in toward it would only shove the crest under
 *  the name: that view plays the DEFAULT framing (×1, crest ∪ Pearl). */
export function plateGeo(p: PlateGeoInput, view: Size): PlateGeo {
  const at = (zoom: number, box: Box01): PlateGeo => {
    const origin = coverPoint(p.zoomAt, p.size, view, p.focal);
    const through = (b: Box01) => zoomBox(coverBox(b, p.size, view, p.focal), zoom, origin);
    return {
      lens: through(box),
      origin,
      wake: coverBox(p.crest, p.size, view, p.focal),
      keep: p.keep ? through(p.keep) : null,
      zoom,
    };
  };
  const g = at(p.zoom, p.box);
  if (p.zoom === 1 || !g.keep) return g;
  const k = g.keep;
  const inside = k.x0 * view.w >= 24 && k.x1 * view.w <= view.w - 24 && k.y0 >= 0 && k.y1 <= 1;
  return inside ? g : at(1, p.wide);
}

/** The bracket's side margin (px): the page gutter, relaxed (never below
 *  8 px) where the gutter would cut through `keep` — on 4:3 screens the
 *  cover fit puts the Pearl outboard of the gutter line. */
export function marginFor(keep: Box01 | null, w: number, inset: number, gutter: number): number {
  if (!keep) return gutter;
  return clamp(Math.floor(w - inset - keep.x1 * w - 4), 8, gutter);
}

/** A box around a focal point when the asset has no measured focalBox:
 *  a wide, shallow band (the crest grammar of every hero plate). */
export function boxAroundFocal(focal: readonly [number, number], halfW: number, halfH: number): Box01 {
  return { x0: focal[0] - halfW, x1: focal[0] + halfW, y0: focal[1] - halfH, y1: focal[1] + halfH };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** The narrowest bracket (frame fraction): anything less reads as a glyph. */
const MIN_W = 0.08;

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
  if (x1 - x0 < MIN_W) {
    // too narrow (the ALT spyglass on one ship, or a wide h1): widen to
    // MIN_W about its centre, inside the limits; with no room left, keep a
    // minimal bracket at the right
    let a = (x0 + x1) / 2 - MIN_W / 2;
    let b = a + MIN_W;
    if (b > maxX1) {
      a -= b - maxX1;
      b = maxX1;
    }
    if (a < minX0) {
      b += minX0 - a;
      a = minX0;
    }
    if (b <= maxX1 + 1e-9) {
      x0 = a;
      x1 = b;
    } else {
      x0 = Math.min(x0, maxX1 - MIN_W);
      x1 = maxX1;
    }
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
