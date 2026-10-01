/* ============================================================================
   GL PLAN — what a card's GL frame draws at p, as pure data (PHASE3-SPEC
   §7.1–§7.3, §8.1). No DOM, no WebGL: the runtime feeds the result to the
   shader; Node can test it. OWNER: W2-GL.
   ========================================================================== */

import { SKY, skyMix, type SkyKey } from "../sky";
import { coverVec, inFrame } from "./cover";
import type { GlCardSpec, GlFlavour, GlShape } from "./types";

/** The OUT/IN meet of a .45 star (a) (§7.1: p .22). */
export const MEET = 0.22;
const A_END = 0.45;
/** The act title's letters start opening at p .68 (§8.1). */
export const TITLE_IN = 0.68;

export type Pass = { flavour: GlFlavour; r0: number; r1: number; role: "out" | "in" | "one" };
export type Draw = { kind: "clear" } | { kind: "pass"; pass: Pass; t: number } | { kind: "title"; t: number };
export type Uniforms = Record<string, number | readonly number[]>;

const CLEAR: Draw = { kind: "clear" };
const OUT: Partial<Record<GlFlavour, "wave" | "burn">> = {
  wave: "wave",
  chalk: "wave",
  duster: "wave",
  burn: "burn",
  ink: "burn",
  lumos: "burn",
};
const SHAPE_ID: Record<GlShape, number> = { ring32: 0, gear12: 1, wheel12: 2, snitch: 3 };
const ID4 = [1, 1, 1, 0] as const;

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ss = (a: number, b: number, x: number) => {
  const t = c01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Star (a) as one pass, or the OUT half then the IN half (seam, ignite). */
export function passesOf(s: GlCardSpec): Pass[] {
  const [a0, a1] = s.a.range;
  const f = s.a.flavour;
  const out = OUT[f];
  if (!out) return [{ flavour: f, r0: a0, r1: a1, role: "one" }];
  const alt = s.variant === "alt";
  const inn: GlFlavour = f !== out ? f : out === "wave" ? (alt ? "duster" : "chalk") : alt ? "lumos" : "ink";
  const meet = s.shapes?.at ?? a0 + ((a1 - a0) * MEET) / A_END;
  return [
    { flavour: out, r0: a0, r1: meet, role: "out" },
    { flavour: inn, r0: meet, r1: a1, role: "in" },
  ];
}

/** Every program the card needs (its passes, plus the title mask). */
export function programsOf(s: GlCardSpec, title: boolean): GlFlavour[] {
  const f = passesOf(s).map((p) => p.flavour);
  return title ? [...f, "title"] : f;
}

/** What to draw at `p` (see lib/gl/types.ts for the map). */
export function frameAt(s: GlCardSpec, p: number, title: boolean): Draw {
  const [b0, b1] = s.b.range;
  if (p >= b1) return CLEAR;
  if (p >= b0) {
    const ti = Math.min(Math.max(TITLE_IN, b0), b1 - 1e-3);
    return title && p >= ti ? { kind: "title", t: (p - ti) / (b1 - ti) } : CLEAR;
  }
  const ps = passesOf(s);
  for (const pass of ps) {
    if (p <= pass.r1) return { kind: "pass", pass, t: c01((p - pass.r0) / Math.max(1e-6, pass.r1 - pass.r0)) };
  }
  return { kind: "pass", pass: ps[ps.length - 1], t: 1 };
}

/** The frame's geometry and plate data (the runtime reads them once). */
export type Geo = {
  res: readonly [number, number];
  fromAspect: number;
  toAspect: number;
  mark(which: "from" | "to", name: string): readonly [number, number] | null;
  deep: readonly [number, number, number];
};
/** Per-draw inputs that are not p-derived. */
export type Live = {
  p: number;
  kraken: number;
  flash: readonly [number, number];
  roll: boolean;
  titleXf: readonly number[] | null;
};

const gradeVec = (k: { gain: readonly number[]; ev: number }) => [k.gain[0], k.gain[1], k.gain[2], k.ev];

/** The grade at t along the card's ramp (squall → day goes through dawn). */
function gradeAt(from: SkyKey, to: SkyKey, t: number): { cur: number[]; end: number[] } {
  const stops: SkyKey[] = from === "squall" && to === "day" ? ["squall", "dawn", "day"] : [from, to];
  const x = c01(t) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return { cur: gradeVec(skyMix(stops[i], stops[i + 1], x - i)), end: gradeVec(SKY[to]) };
}

/** Every uniform for `d` (the header contract in lib/gl/shaders.ts). */
export function uniformsFor(s: GlCardSpec, d: Draw, g: Geo, l: Live): Uniforms {
  const [W, H] = g.res;
  const A = W / H;
  const cf = coverVec(s.cover.from, A, g.fromAspect);
  const ct = coverVec(s.cover.to, A, g.toAspect);
  const at = (which: "from" | "to", n: string): [number, number] | null => {
    const m = g.mark(which, n);
    return m ? inFrame(m, which === "from" ? cf : ct) : null;
  };
  const far = (c: readonly number[]) =>
    Math.max(Math.hypot(c[0] * A, c[1]), Math.hypot((1 - c[0]) * A, c[1]), Math.hypot(c[0] * A, 1 - c[1]), Math.hypot((1 - c[0]) * A, 1 - c[1]));
  const centre = s.center ? [s.center[0], s.center[1]] : null;
  const u: Uniforms = {
    uRes: g.res,
    uCoverFrom: cf,
    uCoverTo: ct,
    uRow: s.row,
    uDeep: g.deep,
    uFlash: l.flash,
    uKraken: 0,
    uP: 0,
    uCenter: [0.5, s.row],
    uRadius: [0.1, 1],
    uShapeFrom: -1,
    uShapeTo: -1,
    uShape: [0, 0, 0, 0],
    uMorph: 0,
    uSpin: 0,
    uGradeFrom: ID4,
    uGradeTo: ID4,
    uTitleXf: l.titleXf ?? [0, 0, -1, -1],
  };
  if (d.kind === "clear") return u;
  u.uP = d.t;
  if (d.kind === "title") return u;

  const t = d.t;
  switch (d.pass.flavour) {
    case "iris": {
      const c = centre ?? at("to", "stern") ?? [0.5, s.row];
      u.uCenter = c;
      u.uRadius = s.radius ?? [0.12 * Math.hypot(A, 1), far(c) + 0.03];
      break;
    }
    case "wave":
      u.uKraken = l.kraken;
      break;
    case "deadeye":
      u.uCenter = centre ?? [0.5, 0.5];
      break;
    case "burn": {
      const c = at("from", "fire") ?? centre ?? [0.5, 0.7];
      u.uCenter = c;
      u.uRadius = [0.04, far(c) + 0.25];
      break;
    }
    case "ink": {
      const c = at("to", "lineStart") ?? [0.08, 0.3];
      u.uCenter = c;
      u.uRadius = [0, far(c) + 0.4];
      break;
    }
    case "lumos": {
      // the light sweeps from the line's start to the window on an arc
      const a = at("to", "lineStart") ?? [0.08, 0.3];
      const b = centre ?? at("to", "window") ?? [0.5, 0.35];
      const e = ss(0, 1, t);
      const k = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 0.2];
      const q = (i: number) => (1 - e) * (1 - e) * a[i] + 2 * (1 - e) * e * k[i] + e * e * b[i];
      u.uCenter = [q(0), q(1)];
      u.uRadius = [0.1, far(b) + 0.35];
      break;
    }
  }

  if (s.grade && d.pass.role !== "out") {
    const gr = gradeAt(s.grade.from, s.grade.to, t);
    u.uGradeFrom = gr.cur;
    u.uGradeTo = gr.end;
  }

  if (s.shapes) {
    const { from, to, at: m0 } = s.shapes;
    const a1 = s.a.range[1];
    const p = l.p;
    const alpha = ss(m0 - 0.1, m0 - 0.03, p) * (1 - ss(a1 - 0.07, a1 - 0.01, p));
    if (alpha > 0) {
      let m = l.roll ? ss(m0 - 0.005, m0 + 0.005, p) : ss(m0 - 0.02, m0 + 0.1, p);
      let ids: [GlShape, GlShape] = [from, to];
      // wheel → ring → snitch (§7.3): the fold passes through the ring
      if (!l.roll && from !== "ring32" && to !== "ring32") {
        if (m < 0.5) {
          ids = [from, "ring32"];
          m *= 2;
        } else {
          ids = ["ring32", to];
          m = m * 2 - 1;
        }
      }
      const pos = (s.card === "ignite" ? at("from", "wheel") : null) ?? centre ?? [0.5, s.row];
      const rim = s.card === "ignite" ? at("from", "wheelR") : null;
      const size = rim ? Math.max(0.03, Math.hypot((rim[0] - pos[0]) * A, rim[1] - pos[1])) : 0.1;
      let x = pos[0];
      let spin = 0;
      if (l.roll) {
        // match.shape ALT: the shape rolls along the meet row into the next
        const k = ss(m0 - 0.1, m0 + 0.1, p) - 0.5;
        x += (k * 0.3) / A;
        spin = (-k * 0.3) / size;
      }
      u.uShapeFrom = SHAPE_ID[ids[0]];
      u.uShapeTo = SHAPE_ID[ids[1]];
      u.uMorph = m;
      u.uShape = [x, pos[1], size, alpha];
      u.uSpin = spin;
    }
  }
  return u;
}

/** The title SDF's layout data (lib/gl/sdf-title.ts). Texture px. */
export type SdfMeta = {
  w: number;
  h: number;
  /** the zoom origin (deepest stroke point near maskOrigin) */
  ox: number;
  oy: number;
  /** the inscribed radius of the stroke at the origin */
  rIn: number;
  /** cap height; ink box [x0, y0 (cap top), x1, y1] */
  cap: number;
  ink: readonly [number, number, number, number];
};

/** frame uv → title SDF uv at title-local t (0 → 1, p .68 → 1): the title
 *  rests centred (cap ≤ 20% of the frame height, ink ≤ 80% of its width),
 *  then scales about its origin, which drifts to the frame centre, until
 *  the stroke's inscribed disc covers the frame. */
export function titleXf(m: SdfMeta, res: readonly [number, number], t: number): [number, number, number, number] {
  const [W, H] = res;
  const k = Math.min((0.2 * H) / m.cap, (0.8 * W) / Math.max(1, m.ink[2] - m.ink[0]));
  const cx = (m.ink[0] + m.ink[2]) / 2;
  const cy = m.ink[1] + m.cap / 2;
  const e = ss(0, 1, t);
  const px = W / 2 + (m.ox - cx) * k * (1 - e);
  const py = H / 2 + (m.oy - cy) * k * (1 - e);
  const end = ((Math.hypot(W, H) / 2) * 1.08) / Math.max(0.5, m.rIn * k);
  const ks = k * Math.pow(Math.max(1, end), t * t);
  return [W / (ks * m.w), H / (ks * m.h), (m.ox - px / ks) / m.w, (m.oy - py / ks) / m.h];
}
