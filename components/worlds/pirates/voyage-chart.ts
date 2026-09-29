/* ============================================================================
   THE VOYAGE CHART — pure geometry (no React) for the Journey's chart strip
   (SPEC v2 SM-4; bars/journey-voyage.BAR.md §3; ICONS IC-PC-02/03/04/06/07).

   One portolan strip, the same in every mode (desktop voyage, the carousel,
   the no-JS stack), so Jack's compass points the same way everywhere:
     viewBox 600 × 180 · the compass rose sits at the harbour (the course's
     start) · four waypoints · the course kinks INTO waypoint 3 ("The break":
     one ember tick, the killed Smart-Money patterns) · the brass X at
     waypoint 4 ("Now"; one X per page).
   Headings are true bearings in this y-down space (degrees clockwise from
   north), so the needle really points along the drawn legs:
     legHeading(i)  the ACTIVE step's leg (the chord arriving at waypoint i)
     bearingTo(j)   the wink: from the compass to waypoint j (IC-PC-03,
                    "points to what you want most")
   ========================================================================== */

export type Pt = readonly [x: number, y: number];

export const STRIP = { w: 600, h: 180 } as const;

/** The compass rose = the harbour, where the course begins. */
export const ROSE: Pt = [56, 112];

/** Waypoints 1–4 (Origin, Early work, The break, Now). */
export const WAYPOINTS: readonly Pt[] = [
  [168, 58],
  [282, 84],
  [366, 136],
  [548, 62],
];

export const BREAK_INDEX = 2;
export const NOW_INDEX = 3;

/** Where each waypoint's label hangs: above the course or below it. */
export const LABEL_SIDE: readonly ("above" | "below")[] = ["above", "above", "below", "below"];

/** The cursed medallion's centre (IC-PC-04), below-right of waypoint 3,
 *  clear of the leg to the X and of the waypoint's label. */
export const MEDALLION_AT: Pt = [446, 152];

/** The course, one path per leg (the alt plots them one at a time):
 *  leg 0 harbour → W1, leg 1 W1 → W2, leg 2 W2 → W3 WITH the kink (the
 *  break: the course zig-zags into the waypoint), leg 3 W3 → the X. */
export const LEGS: readonly string[] = [
  "M56 112 C92 92 128 66 168 58",
  "M168 58 C206 50 246 66 282 84",
  "M282 84 C306 98 318 108 326 118 L344 112 L352 128 L366 136",
  "M366 136 C420 128 490 96 548 62",
];

/** The whole course (the default draws it at once). */
export const COURSE = LEGS.join(" ");

/** Bearing (° clockwise from north) from a to b, y down. */
export function bearingFrom(a: Pt, b: Pt): number {
  const deg = (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** The active step's heading: the chord of the leg arriving at waypoint i
 *  (leg 0 starts at the rose). */
export function legHeading(i: number): number {
  const to = WAYPOINTS[Math.max(0, Math.min(WAYPOINTS.length - 1, i))] ?? WAYPOINTS[0]!;
  const from = i <= 0 ? ROSE : (WAYPOINTS[i - 1] ?? ROSE);
  return bearingFrom(from, to);
}

/** The wink: from the compass to waypoint j. */
export function bearingTo(j: number): number {
  return bearingFrom(ROSE, WAYPOINTS[Math.max(0, Math.min(WAYPOINTS.length - 1, j))] ?? WAYPOINTS[0]!);
}

/** The nearest equivalent of `goal` to the needle's current (unwrapped)
 *  angle: no needless full spins. */
export function nearestTurn(current: number, goal: number): number {
  return goal + 360 * Math.round((current - goal) / 360);
}

/** A point as % of the strip (for HTML overlays registered to the SVG). */
export function pct(p: Pt): { left: string; top: string } {
  return { left: `${((p[0] / STRIP.w) * 100).toFixed(3)}%`, top: `${((p[1] / STRIP.h) * 100).toFixed(3)}%` };
}

/** The frame index of each step's beat in a sequence of `frames` frames
 *  over `steps` steps: 72 frames × 4 steps → 0, 24, 48, 71 (each JV clip is
 *  24 frames and starts ON its still: MV-05a/b/c at 0/24/48, MV-05d at 71). */
export function beatFrames(frames: number, steps: number): number[] {
  if (steps <= 1 || frames <= 1) return [0];
  return Array.from({ length: steps }, (_, i) => Math.min(frames - 1, Math.round((i * frames) / (steps - 1))));
}
