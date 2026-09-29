/* ============================================================================
   THE LINE (TA-02, SPEC v2 §4) — geometry for the loaders and act cards.
   PURE (no React, no DOM): the server computes the same numbers as the
   client, so FIG. 0's printed length and control-point count are TRUE values
   of the path actually drawn, and SSR frames place points exactly.

   PROVISIONAL PATH. SPEC §4 has `LINE_D` in lib/line.ts, hand-fitted to
   MV-01's crest (overlay-diffed, H28). That file does not exist yet, so this
   is our own asymmetric folded curve built to the SPEC's stated geometry
   (calm tail dissolving by x ≈ .36, body x .46–.94, focal (.70, .50), a
   fold at the crest end), in the SPEC's viewBox 0 0 1000 400. When
   lib/line.ts lands, re-export its LINE_D here; everything below re-derives.
   Only absolute M / C commands are supported (the SPEC's path grammar).
   ========================================================================== */

export const LINE_VIEWBOX = { w: 1000, h: 400 } as const;

export const LINE_D =
  "M40 300C160 296 280 286 380 270C480 254 560 236 640 214C720 192 800 172 860 170C912 168 944 184 952 204C958 220 944 232 926 228";

type Pt = { x: number; y: number };
type Seg = [Pt, Pt, Pt, Pt];

function parse(d: string): { segs: Seg[]; points: number } {
  const tokens = d.match(/[MC]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const segs: Seg[] = [];
  let cur: Pt = { x: 0, y: 0 };
  let points = 0;
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === "M") {
      cur = { x: num(), y: num() };
      points += 1;
    } else if (cmd === "C") {
      // one or more implicit repeats
      while (i < tokens.length && !/^[MC]$/i.test(tokens[i])) {
        const p1 = { x: num(), y: num() };
        const p2 = { x: num(), y: num() };
        const p3 = { x: num(), y: num() };
        segs.push([cur, p1, p2, p3]);
        cur = p3;
        points += 3;
      }
    } else {
      throw new Error(`[line] unsupported path command "${cmd}" (M / C only)`);
    }
  }
  return { segs, points };
}

function bez([a, b, c, d]: Seg, t: number): Pt {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return {
    x: w0 * a.x + w1 * b.x + w2 * c.x + w3 * d.x,
    y: w0 * a.y + w1 * b.y + w2 * c.y + w3 * d.y,
  };
}

/** An arc-length lookup table over any M/C path: `at(f)` is the point at
 *  fraction f (0–1) of the path's LENGTH (what SVG `pathLength` means), and
 *  `angleAt(f)` its tangent direction in degrees. */
export function measurePath(d: string, steps = 96) {
  const { segs, points } = parse(d);
  const pts: Pt[] = [];
  for (const s of segs) {
    for (let k = pts.length ? 1 : 0; k <= steps; k++) pts.push(bez(s, k / steps));
  }
  const cum: number[] = [0];
  for (let k = 1; k < pts.length; k++) {
    cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
  }
  const length = cum[cum.length - 1] ?? 0;
  const locate = (f: number) => {
    const target = Math.min(1, Math.max(0, f)) * length;
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid;
      else hi = mid;
    }
    const span = cum[hi] - cum[lo] || 1;
    return { lo, hi, t: (target - cum[lo]) / span };
  };
  return {
    length,
    /** Absolute points in the path (M = 1, each C = 3): FIG. 0's count. */
    controlPoints: points,
    at(f: number): Pt {
      if (!pts.length) return { x: 0, y: 0 };
      const { lo, hi, t } = locate(f);
      return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * t, y: pts[lo].y + (pts[hi].y - pts[lo].y) * t };
    },
    angleAt(f: number): number {
      if (pts.length < 2) return 0;
      const { lo, hi } = locate(f);
      return (Math.atan2(pts[hi].y - pts[lo].y, pts[hi].x - pts[lo].x) * 180) / Math.PI;
    },
  };
}

/** The Line, measured once per module (server and client agree). */
export const LINE = measurePath(LINE_D);

/** FIG. 0's true values (SPEC §4 truth rule): the drawn path's length in
 *  viewBox units (1 decimal) and its control-point count. */
export const LINE_FIG = {
  length: Math.round(LINE.length * 10) / 10,
  controlPoints: LINE.controlPoints,
} as const;

/** A rect the Line is fitted into (its 1000 × 400 viewBox scaled onto it). */
export type Box = { x: number; y: number; w: number; h: number };

/** Maps a Line-space point into `box`. */
export function fitPoint(p: { x: number; y: number }, box: Box): { x: number; y: number } {
  return {
    x: box.x + (p.x / LINE_VIEWBOX.w) * box.w,
    y: box.y + (p.y / LINE_VIEWBOX.h) * box.h,
  };
}

/** LINE_D (or any absolute M/C path in Line space) re-expressed in `box`
 *  coordinates, so strokes keep a uniform width (no non-uniform scale). */
export function fitPath(d: string, box: Box): string {
  const tokens = d.match(/[MC]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const out: string[] = [];
  let pair: number[] = [];
  for (const t of tokens) {
    if (/^[MC]$/i.test(t)) {
      out.push(t);
      continue;
    }
    pair.push(Number(t));
    if (pair.length === 2) {
      const q = fitPoint({ x: pair[0], y: pair[1] }, box);
      out.push(`${q.x.toFixed(2)} ${q.y.toFixed(2)}`);
      pair = [];
    }
  }
  return out.join(" ").replace(/ ([MC]) /g, "$1").replace(/^([MC]) /, "$1");
}

/** Linear remap of p from [a, b] onto [0, 1], clamped. */
export function remap(p: number, a: number, b: number): number {
  if (b === a) return p >= b ? 1 : 0;
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/** Smoothstep on 0–1 (eases in and out; pair it with `remap`). */
export const smooth01 = (t: number) => t * t * (3 - 2 * t);
