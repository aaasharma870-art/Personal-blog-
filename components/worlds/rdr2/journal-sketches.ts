/* ============================================================================
   JOURNAL SKETCHES — the graphite art of the journal's right page (SM-11;
   RECOGNIZABILITY S15; ICONS IC-RD-01, IC-RD-13). PURE DATA, computed once
   at module load (deterministic, so the SSR and the client agree).

   The page is viewBox 0 0 400 500 (≈ 1 unit : 1.3 px on a desktop spread).
     - FURNITURE: the pencil-hatched margin rule, an illegible date scribble
       (no invented date), a pasted clipping with tape (its "print" is ruled
       lines, never glyphs).
     - LANDSCAPE (the page at rest; the passing LD-RD-alt sketch grammar at
       page scale): a far ridge with hachures, rolling hills, a lake with
       ripples, pines, a small riderless saddled horse grazing by the shore,
       a dotted trail, grass, two birds. No figure, no rider (H1).
     - BONE (Phase 3, the rd-bone egg, spec §9.1 #11): a fossil bone half-
       buried at the foot of the far ridge, among its hachures, in a
       slightly heavier line; its hotspot (a real <button> outside the
       aria-hidden page) sits on BONE_SPOT.
     - VIGNETTES: one per journal entry (SPEC SM-11), in 64-unit art drawn
       at page scale: a balance scale · a town plan crossed with one
       graphite X (the Blackwater page; never ember) · a rail line · a
       contour trail · one brush-like stroke.
   Code art only: no generated sketch near the Drawing claim (W25).
   ========================================================================== */

export type Stroke = {
  d: string;
  /** stroke width in page units */
  w: number;
  /** stroke opacity */
  o?: number;
  /** draw-on delay (s) */
  t: number;
  /** draw-on duration (s) */
  dur?: number;
};

const f = (n: number) => n.toFixed(1);

/* — furniture ————————————————————————————————————————————————————————— */

const MARGIN_HATCH = Array.from({ length: 28 }, (_, k) => `M21 ${f(40 + k * 15.5)} l14 -7`).join(" ");

export const FURNITURE = {
  margin: "M26 24 V476 M31 24 V476",
  marginHatch: MARGIN_HATCH,
  /** the date corner: an illegible scribble + its rule (never a real date) */
  date: "M50 38 c3 -7 6 3 9 -2 s6 4 9 -2 s6 4 9 -2 s6 4 9 -2 s5 3 8 -1 M48 46 h58",
  /** the pasted clipping (drawn at translate(304 82) rotate(4)) */
  clipping: {
    paper: "M-62 -42 H62 V42 H-62 Z",
    print: "M-50 -26 H46 M-50 -14 H40 M-50 -2 H48 M-50 10 H26 M-50 22 H44 M-50 32 H30",
    tape: "M-74 -50 L-48 -40 L-53 -27 L-79 -37 Z M50 -40 L76 -50 L81 -37 L55 -27 Z",
  },
} as const;

/* — landscape ———————————————————————————————————————————————————————— */

const FAR_RIDGE =
  "M40 236 L70 214 L92 222 L120 196 L140 206 L168 176 L196 204 L222 190 L250 160 L276 186 L300 178 L330 206 L360 198 L382 212";
const HILLS =
  "M36 272 C66 256 92 262 118 252 C150 238 170 262 204 254 C236 246 262 262 300 256 C330 250 356 262 384 256";
const LAKE = "M78 312 C118 294 262 290 330 306 C318 322 206 330 92 324 C84 322 78 318 78 312 Z";
const RIPPLES = "M120 306 h36 M176 300 h54 M252 308 h34 M146 316 h40 M214 318 h30";

/** Shading down the shadowed slope of each far peak. */
function hachures(peaks: readonly (readonly [number, number, number, number])[]): string {
  const out: string[] = [];
  for (const [px, py, qx, qy] of peaks) {
    for (let k = 1; k <= 5; k++) {
      const t = k / 6;
      out.push(`M${f(px + (qx - px) * t)} ${f(py + (qy - py) * t)} l-5 11`);
    }
  }
  return out.join(" ");
}
const PEAK_HATCH = hachures([
  [120, 196, 140, 206],
  [168, 176, 196, 204],
  [250, 160, 276, 186],
  [300, 178, 330, 206],
]);

/** A pencil pine: trunk and seven tiers of drooping branches. */
function pine(x: number, base: number, h: number): string {
  const tiers = 7;
  let d = `M${f(x)} ${f(base)} V${f(base - h)}`;
  for (let k = 0; k < tiers; k++) {
    const t = k / tiers;
    const y = base - h * (0.18 + 0.8 * t);
    const w = h * 0.3 * (1 - t) + 3;
    d += ` M${f(x - w)} ${f(y + w * 0.45)} L${f(x)} ${f(y)} L${f(x + w)} ${f(y + w * 0.45)}`;
  }
  return d;
}

/** A dotted trail: short dashes along a quadratic curve (drawn, not dashed,
 *  so the pathLength draw-on still works). */
function dottedTrail(): string {
  const P0 = [190, 482] as const;
  const C = [168, 432] as const;
  const P2 = [252, 404] as const;
  const at = (t: number) => [
    (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P2[0],
    (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P2[1],
  ];
  const out: string[] = [];
  for (let k = 0; k < 11; k++) {
    const a = at(k / 11);
    const b = at(k / 11 + 0.045);
    out.push(`M${f(a[0]!)} ${f(a[1]!)} L${f(b[0]!)} ${f(b[1]!)}`);
  }
  return out.join(" ");
}

const GRASS = Array.from({ length: 24 }, (_, k) => {
  const x = 42 + k * 14.3;
  const lean = k % 3 === 0 ? -3 : k % 3 === 1 ? 1 : 2;
  const h = 7 + ((k * 7) % 5);
  return `M${f(x)} 474 l${lean} -${h}`;
}).join(" ");

export const LANDSCAPE: readonly Stroke[] = [
  { d: FAR_RIDGE, w: 1.3, o: 0.75, t: 0, dur: 1 },
  { d: PEAK_HATCH, w: 0.9, o: 0.6, t: 0.7, dur: 0.5 },
  { d: HILLS, w: 1.5, t: 0.35, dur: 0.9 },
  { d: LAKE, w: 1.4, t: 0.7, dur: 0.8 },
  { d: RIPPLES, w: 1, o: 0.7, t: 1.1, dur: 0.5 },
  { d: pine(60, 452, 150), w: 1.3, t: 0.9, dur: 0.7 },
  { d: pine(92, 462, 118), w: 1.3, t: 1.05, dur: 0.6 },
  { d: pine(40, 466, 96), w: 1.2, t: 1.15, dur: 0.5 },
  { d: pine(354, 456, 138), w: 1.3, t: 1.0, dur: 0.7 },
  { d: pine(378, 466, 92), w: 1.2, t: 1.2, dur: 0.5 },
  { d: dottedTrail(), w: 1.4, o: 0.8, t: 1.5, dur: 0.6 },
  { d: GRASS, w: 1, o: 0.75, t: 1.6, dur: 0.5 },
  { d: "M150 128 q6 -6 12 0 q6 -6 12 0 M186 112 q5 -5 10 0 q5 -5 10 0", w: 1.1, t: 1.9, dur: 0.4 },
];

/** The riderless, saddled horse grazing on the far shore — local units,
 *  facing left, head down to the grass; drawn at translate(286 366)
 *  scale(1.3). Ground at y = 28. */
export const HORSE_AT = "translate(286 366) scale(1.3)";
export const HORSE: readonly Stroke[] = [
  {
    // back, croup, rump; belly; chest; neck down to the muzzle and back up
    d: "M-12 -13 C-6 -9 6 -9 16 -13 C22 -14 25 -8 24 -2 C23 3 22 6 20 9 M10 6 L-10 6 C-16 6 -20 4 -21 0 C-24 4 -30 10 -34 15 C-37 19 -39 22 -38 24 C-37 26 -34 27 -32 25 C-31 22 -29 19 -27 15 C-24 8 -19 -3 -12 -13",
    w: 1.1,
    t: 1.25,
    dur: 0.8,
  },
  { d: "M-15 5 L-16 17 L-15 28 M-11 6 L-10 17 L-11 28 M16 6 L19 15 L16 28 M20 8 L23 16 L20 28", w: 1, t: 1.6, dur: 0.4 },
  { d: "M-17 28 h3 M-12 28 h3 M14 28 h3 M18 28 h3 M-44 28 H40", w: 0.9, t: 1.75, dur: 0.3 },
  { d: "M24 -8 C31 -4 31 8 27 18 M25 -6 C29 0 29 8 26 16", w: 0.9, t: 1.7, dur: 0.3 },
  { d: "M-14 -12 l-3 5 M-17 -8 l-3 5 M-20 -4 l-3 5 M-30 14 l-3 -4 M-28 13 l-1 -5", w: 0.8, t: 1.8, dur: 0.3 },
  // the saddle and its blanket: riderless
  { d: "M-9 -10 L-8 -3 L10 -3 L11 -10 M-6 -11 C-4 -16 6 -16 8 -11 M-1 -4 V3 M-3 3 h4", w: 0.9, t: 1.85, dur: 0.35 },
];

/** The fossil bone, half-buried at the foot of the far ridge (local units,
 *  drawn at BONE_AT): one knob and the shaft above ground, the rest under a
 *  hachured mound with the far knob's tip showing. Heavier than the
 *  landscape's line (1.5 vs the ridge's 1.3), so it reads as a find. */
export const BONE_AT = "translate(222 228) rotate(-8) scale(1.1)";
export const BONE: readonly Stroke[] = [
  {
    d: "M2 -1.4 L-14.5 -1.4 C-15 -4.5 -19.5 -5 -19.5 -2.4 C-19.5 -0.8 -18 -0.3 -17.2 0 C-18 0.3 -19.5 0.8 -19.5 2.4 C-19.5 5 -15 4.5 -14.5 1.4 L2 1.4",
    w: 1.5,
    t: 1.3,
    dur: 0.45,
  },
  {
    d: "M-3 3.6 C2 -0.6 9 -2.4 16 -1.2 C20.5 -0.4 23.5 1.2 26 3 M5 -0.6 l-2.2 4.4 M9.4 -1.6 l-2.2 4.8 M13.6 -1.6 l-2 4.4 M17.8 -0.8 l-1.8 3.8 M21.8 0.6 l-1.4 3",
    w: 0.9,
    o: 0.75,
    t: 1.45,
    dur: 0.35,
  },
  { d: "M17.2 -1.6 C17.8 -4.8 21.6 -5.2 22.2 -2.4", w: 1.5, t: 1.6, dur: 0.2 },
];
/** The bone's visible middle on the page, as fractions of the 400 × 500
 *  page (BONE_AT applied to local (-8.5, 0)): where its hotspot centres. */
export const BONE_SPOT: readonly [number, number] = [0.532, 0.459];

/* — the five entry vignettes (64-unit art) —————————————————————————————— */

export type Vignette = { strokes: readonly string[]; fill?: string };

export const VIGNETTES: readonly Vignette[] = [
  // "How I try not to fool myself" — a balance scale
  {
    strokes: [
      "M32 10 L32 52 M22 54 L42 54 M12 18 L52 18",
      "M12 18 L6 32 M12 18 L18 32 M52 18 L46 32 M52 18 L58 32",
      "M5 32 Q12 40 19 32 M45 32 Q52 40 59 32",
    ],
  },
  // "The kill-list" — a small town plan crossed out with one graphite X
  {
    strokes: [
      "M10 12 h14 v10 h-14 Z M28 12 h10 v10 h-10 Z M42 12 h12 v14 h-12 Z",
      "M10 28 h10 v12 h-10 Z M24 30 h14 v8 h-14 Z M42 32 h12 v10 h-12 Z M10 46 h20 v8 h-20 Z M34 46 h20 v8 h-20 Z",
      "M6 8 L58 58 M58 8 L6 58",
    ],
  },
  // "From Pine Script to a real pipeline" — a rail line
  {
    strokes: [
      "M4 50 C20 44 38 28 56 12",
      "M10 58 C26 52 44 36 62 20",
      "M11 45 L15 53 M20 40 L25 48 M29 34 L34 42 M38 27 L43 35 M46 21 L51 29 M54 15 L59 23",
    ],
  },
  // "What wrestling and cross country taught me" — a contour trail
  {
    strokes: [
      "M12 32 C12 18 26 10 36 14 C48 18 54 28 50 40 C46 52 30 56 20 50 C14 46 12 40 12 32 Z",
      "M22 32 C22 24 30 20 36 23 C42 26 44 32 41 38 C38 44 30 45 26 42 C23 40 22 36 22 32 Z",
      "M4 60 C14 54 20 44 30 40 C38 36 44 30 60 6",
    ],
  },
  // "Mandarin and global markets" — one brush-like stroke
  {
    strokes: ["M10 48 C20 34 32 24 46 18 C52 16 56 17 58 20"],
    fill: "M8 46 C18 31 31 21 45 16 C51 14 57 15 59 19 C53 19 47 21 41 25 C31 31 21 39 13 49 Z",
  },
];

/** Where a 64-unit vignette sits on the 400 × 500 page. */
export const VIGNETTE_AT = "translate(72 132) scale(4)";
