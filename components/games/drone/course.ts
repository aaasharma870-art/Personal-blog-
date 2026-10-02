/* ============================================================================
   THE HOMEMADE DRONE · the course (PHASE3-SPEC §9.2 #2 "Course") — OWNER:
   W3-GAMES. Pure data + pure functions, band-normalised (0–1 of the band's
   width / height), so the course is the same at 1440 (1312 × 562) and 1024
   (928 × 398) and the probe can import it.

   - Seven gates, the research gauntlet's seven, in order: gate i (0-based)
     sits at x = .10 + .13·i with its opening centred at CENTRES[i];
   - the opening is .22 of the band height;
   - a gate is passed when the drone's centre CROSSES the gate's x (either
     way) with its y inside the opening, and only the NEXT gate counts (a
     gate flown through out of order is just air);
   - take-off from the plate's `marks.drone` [.60, .47] (iconic-drone; the
     ALT plate shares its focal and has no mark of its own).
   ========================================================================== */

export const GATE_COUNT = 7;

/** The openings' centres (band height fractions), gate 1 → 7. */
export const CENTRES = [0.34, 0.66, 0.28, 0.6, 0.36, 0.7, 0.42] as const;

/** The opening's height (fraction of the band height). */
export const OPENING = 0.22;

/** Take-off and landing point (band fractions): iconic-drone `marks.drone`. */
export const TAKEOFF: readonly [number, number] = [0.6, 0.47];

/** Gate i's x (band width fraction), i = 0…6. */
export function gateX(i: number): number {
  return 0.1 + 0.13 * i;
}

/** Gate i's opening, [top, bottom] (band height fractions). */
export function gateSpan(i: number): readonly [number, number] {
  const c = CENTRES[i] ?? 0.5;
  return [c - OPENING / 2, c + OPENING / 2];
}

/**
 * Did the segment (x0, y0) → (x1, y1) pass gate i? Band px in, so the test
 * is exact at any size: the centre crosses the gate's x (inclusive at the
 * end point, so a stop exactly on the line counts once) and, at the
 * crossing, its y lies inside the opening.
 */
export function passes(i: number, x0: number, y0: number, x1: number, y1: number, w: number, h: number): boolean {
  const gx = gateX(i) * w;
  if (x0 === x1) return false;
  const before = x0 - gx;
  const after = x1 - gx;
  if (before === 0 || before * after > 0) return false;
  const t = (gx - x0) / (x1 - x0);
  const y = y0 + (y1 - y0) * t;
  const [top, bottom] = gateSpan(i);
  return y >= top * h && y <= bottom * h;
}
