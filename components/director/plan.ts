/* ============================================================================
   THE CAMERA'S PLANNER (pure: no DOM, no React) — the director's cut.
   The storyboard (./storyboard.ts) reads the live page into KEYS (a y, a hold,
   a tempo); this file turns keys into a PLAN: legs with smoothstep speed
   envelopes (ramp, cruise, ramp), holds at rest, dips to dark between
   far-apart highlights. Everything here is arithmetic on numbers, so the
   total is COMPUTED (the label "1:30" is true) and scripts/tools can run it.

   LEG MODEL. A leg of distance d between speeds v0 and v1 at cruise c:
     ramp time r = max(RMIN, 1.5 * |dv| / A)   (a smoothstep ramp peaks at
                                                1.5 * dv / r, so accel <= A)
     v(t): smoothstep v0 -> c over r1, flat c, smoothstep c -> v1 over r2
     T = r1 + (d - r1 (v0 + c)/2 - r2 (c + v1)/2) / c + r2
   When the ramps do not fit, c is lowered (bisection) so they do. The
   EASING handed to Lenis is the normalised integral of v(t) (a 256-point
   table), so one lenis.scrollTo per leg reproduces the envelope exactly.
   KEY SPEEDS. A key with a hold is at rest (v = 0); a pass key owns ONE
   speed, shared by the leg before and the leg after it (half the slower
   neighbour's cruise), so there is no stop-start at a seam.
   ========================================================================== */

import { DIP_S, TEMPO, type TourParams } from "./timing";
import type { Tour } from "./api";

export type KeyKind =
  | "hero"
  | "card-in"
  | "card-land"
  | "card-title"
  | "card-out"
  | "head"
  | "star"
  | "finale"
  | "end"
  | "edge-out"
  | "edge-in";

export type Key = {
  id: string;
  kind: KeyKind;
  /** page y at plan time (re-resolved live at every leg start) */
  y: number;
  /** seconds at rest (0 = a pass key) */
  hold: number;
  /** extra seconds before the hold counts (a card's damped progress settles) */
  settle: number;
  /** cruise factor of the leg that leaves this key (TEMPO) */
  tempo: number;
  /** index into the chapters */
  chapter: number;
  /** max cruise (px/s) of the leg that leaves this key */
  cap?: number;
  /** a dip to dark follows this key (it is an `edge-out`) */
  dip?: boolean;
  /** the live y of this key (null: gone); set by the storyboard */
  resolve?: () => number | null;
  /** never merged into a neighbour (two frames of one tall block, a pass the camera must make) */
  keep?: boolean;
  /** called as the camera sets out for this key (a lens that must be open when it arrives) */
  prep?: () => void;
};

export type Env = { v0: number; v1: number; c: number; r1: number; r2: number; T: number };

export type ElHold = { k: "hold"; key: number; dur: number; t0: number; chapter: number };
export type ElLeg = { k: "leg"; a: number; b: number; f0: number; f1: number; env: Env; d: number; t0: number; chapter: number };
export type ElDip = { k: "dip"; a: number; b: number; dur: number; t0: number; chapter: number };
export type El = ElHold | ElLeg | ElDip;

export type Plan = {
  tour: Tour;
  keys: Key[];
  els: El[];
  /** seconds, computed (never typed) */
  total: number;
  holds: number;
  motion: number;
  /** the base cruise the solve settled on (px/s) and the hold scale it used */
  vBase: number;
  holdScale: number;
  /** fastest cruise and steepest accel actually planned */
  peak: number;
  accel: number;
  dips: number;
  /** per chapter: plan second of its first element, and that element's index (-1 absent) */
  chapterStart: number[];
  chapterEl: number[];
};

/** Shortest ramp (s). */
export const RMIN = 0.3;
/** Keys closer than this many viewports merge (card keys never do). */
const MERGE_VH = 0.45;

const ss = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const rampTime = (dv: number, a: number) => (dv < 8 ? 0 : Math.max(RMIN, (1.5 * dv) / a));

/** The envelope of one leg: distance d, end speeds v0 / v1, nominal cruise cNom, accel limit a. */
export function solveLeg(d: number, v0: number, v1: number, cNom: number, a: number): Env {
  if (!(d > 0.5)) return { v0, v1, c: 0, r1: 0, r2: 0, T: 0 };
  const cruiseDist = (c: number) => d - (rampTime(Math.abs(c - v0), a) * (v0 + c)) / 2 - (rampTime(Math.abs(c - v1), a) * (c + v1)) / 2;
  let c = Math.max(cNom, v0, v1, 1);
  if (cruiseDist(c) < 0) {
    let lo = Math.max(v0, v1, 1);
    if (cruiseDist(lo) < 0) {
      // too short to ramp between the key speeds: one smoothstep between them
      const m = Math.max(v0, v1);
      const T = (2 * d) / Math.max(1, v0 + v1);
      return { v0, v1, c: m, r1: v0 < m ? T : 0, r2: v1 < m ? T : 0, T };
    }
    let hi = c;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (cruiseDist(mid) >= 0) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  const r1 = rampTime(Math.abs(c - v0), a);
  const r2 = rampTime(Math.abs(c - v1), a);
  return { v0, v1, c, r1, r2, T: r1 + Math.max(0, cruiseDist(c)) / c + r2 };
}

/** Speed (px/s) at time t of an envelope. */
export function envSpeed(e: Env, t: number): number {
  if (t <= 0) return e.v0;
  if (t >= e.T) return e.v1;
  if (t < e.r1) return e.v0 + (e.c - e.v0) * ss(t / e.r1);
  if (t > e.T - e.r2) return e.v1 + (e.c - e.v1) * ss((e.T - t) / e.r2);
  return e.c;
}

/** The easing Lenis takes: position fraction at time fraction x (monotone, 0 -> 0, 1 -> 1). */
export function easeOf(e: Env): (x: number) => number {
  const N = 256;
  const cum = new Float64Array(N + 1);
  let acc = 0;
  for (let i = 1; i <= N; i++) {
    acc += envSpeed(e, ((i - 0.5) / N) * e.T);
    cum[i] = acc;
  }
  const tot = acc || 1;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const f = x * N;
    const i = Math.min(N - 1, Math.floor(f));
    return (cum[i] + (cum[i + 1] - cum[i]) * (f - i)) / tot;
  };
}

/** One easing for several legs run back to back (a span between two rests):
 *  the normalised integral of their speed envelopes joined end to end. */
export function easeOfMany(envs: Env[]): { T: number; ease: (x: number) => number } {
  const T = envs.reduce((t, e) => t + e.T, 0);
  const N = Math.min(4096, Math.max(512, Math.ceil(T * 120)));
  const cum = new Float64Array(N + 1);
  let acc = 0;
  for (let i = 1; i <= N; i++) {
    let t = ((i - 0.5) / N) * T;
    let sp = 0;
    for (const e of envs) {
      if (t <= e.T || e === envs[envs.length - 1]) {
        sp = envSpeed(e, Math.min(t, e.T));
        break;
      }
      t -= e.T;
    }
    acc += sp;
    cum[i] = acc;
  }
  const tot = acc || 1;
  return {
    T,
    ease: (x: number) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      const f = x * N;
      const i = Math.min(N - 1, Math.floor(f));
      return (cum[i] + (cum[i + 1] - cum[i]) * (f - i)) / tot;
    },
  };
}

/** Sort by y and merge keys closer than MERGE_VH (card and dip-edge keys stay). */
export function normalizeKeys(keys: Key[], vh: number): Key[] {
  const sorted = keys.map((k, i) => ({ k, i })).sort((p, q) => p.k.y - q.k.y || p.i - q.i).map((p) => p.k);
  const fixed = (k: Key) => k.kind.startsWith("card") || k.kind.startsWith("edge") || k.kind === "hero" || k.kind === "end" || Boolean(k.keep);
  const out: Key[] = [];
  for (const k of sorted) {
    const last = out[out.length - 1];
    if (last && !fixed(k) && !fixed(last) && k.y - last.y < MERGE_VH * vh) {
      if (k.hold > last.hold) out[out.length - 1] = { ...k, y: last.y, resolve: k.resolve };
      continue;
    }
    // a hero / end key swallows a close plain key
    if (last && fixed(last) && !fixed(k) && (last.kind === "hero" || last.kind === "end") && Math.abs(k.y - last.y) < MERGE_VH * vh) continue;
    if (last && fixed(k) && (k.kind === "hero" || k.kind === "end") && !fixed(last) && Math.abs(k.y - last.y) < MERGE_VH * vh) {
      out[out.length - 1] = k;
      continue;
    }
    out.push(k);
  }
  return out;
}

/** Nominal cruise (px/s) of the leg that leaves key i. */
export function cruiseAfter(keys: Key[], i: number, P: TourParams, vBase: number): number {
  const a = keys[i];
  const b = keys[i + 1];
  let c: number;
  if (b && a.kind === "card-in" && b.kind === "card-land") c = P.card.a;
  else if (b && a.kind === "card-land" && b.kind === "card-title") c = P.card.b;
  else if (b && a.kind === "card-title" && b.kind === "card-out") c = P.card.out;
  else c = vBase * a.tempo;
  if (a.cap) c = Math.min(c, a.cap);
  return Math.min(c, P.vMax);
}

/** The speed each key is passed at: 0 on a hold and at both ends. */
export function keySpeeds(keys: Key[], P: TourParams, vBase: number): number[] {
  const n = keys.length;
  const cAfter = keys.map((_, i) => (i < n - 1 ? cruiseAfter(keys, i, P, vBase) : 0));
  return keys.map((k, i) => {
    if (k.hold > 0 || i === 0 || i === n - 1) return 0;
    const prevDip = keys[i - 1].dip;
    const cPrev = cAfter[i - 1];
    const cNext = k.dip ? Infinity : cAfter[i];
    let v: number;
    if (k.dip) v = 0.5 * cPrev;
    else if (prevDip) v = 0.5 * cNext;
    else v = 0.5 * Math.min(cPrev, cNext);
    // never faster than a neighbour leg can use (1.2 s to cross it)
    const dPrev = prevDip ? Infinity : Math.abs(k.y - keys[i - 1].y);
    const dNext = k.dip ? Infinity : Math.abs(keys[i + 1].y - k.y);
    return Math.min(v, Math.min(dPrev, dNext) / 1.2);
  });
}

export function buildEls(keys: Key[], P: TourParams, vBase: number, holdScale: number): { els: El[]; total: number } {
  const els: El[] = [];
  const kv = keySpeeds(keys, P, vBase);
  let t = 0;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const hold = k.hold > 0 ? k.hold * holdScale + k.settle : 0;
    if (hold > 0) {
      els.push({ k: "hold", key: i, dur: hold, t0: t, chapter: k.chapter });
      t += hold;
    }
    if (i === keys.length - 1) break;
    const next = keys[i + 1];
    if (k.dip) {
      els.push({ k: "dip", a: i, b: i + 1, dur: DIP_S, t0: t, chapter: next.chapter });
      t += DIP_S;
      continue;
    }
    const d = next.y - k.y;
    if (d <= 0.5) continue;
    // one leg per key pair (the player chains the legs between two rests into ONE
    // Lenis glide, so a seam at a pass key never costs a frame)
    const env = solveLeg(d, kv[i], kv[i + 1], cruiseAfter(keys, i, P, vBase), P.a);
    els.push({ k: "leg", a: i, b: i + 1, f0: 0, f1: 1, env, d, t0: t, chapter: k.chapter });
    t += env.T;
  }
  return { els, total: t };
}

function summarise(tour: Tour, keys: Key[], P: TourParams, vBase: number, holdScale: number): Plan {
  const { els, total } = buildEls(keys, P, vBase, holdScale);
  let holds = 0;
  let peak = 0;
  let accel = 0;
  let dips = 0;
  for (const e of els) {
    if (e.k === "hold") holds += e.dur;
    else if (e.k === "dip") dips++;
    else {
      peak = Math.max(peak, e.env.c);
      if (e.env.r1 > 0) accel = Math.max(accel, (1.5 * Math.abs(e.env.c - e.env.v0)) / e.env.r1);
      if (e.env.r2 > 0) accel = Math.max(accel, (1.5 * Math.abs(e.env.c - e.env.v1)) / e.env.r2);
    }
  }
  const chapterStart: number[] = [];
  const chapterEl: number[] = [];
  els.forEach((e, i) => {
    if (chapterEl[e.chapter] === undefined) {
      chapterEl[e.chapter] = i;
      chapterStart[e.chapter] = e.t0;
    }
  });
  return { tour, keys, els, total, holds, motion: total - holds, vBase, holdScale, peak, accel, dips, chapterStart, chapterEl };
}

/** Solve the plan for the tour's target length: the base cruise by bisection
 *  (clamped to vMin..vMax); when the clamp binds, the holds scale instead.
 *  The returned total is what is achieved, whether or not it hits the target. */
export function solvePlan(tour: Tour, keys: Key[], P: TourParams): Plan {
  const totalOf = (v: number, hs: number) => buildEls(keys, P, v, hs).total;
  let v = P.vMax;
  let hs = 1;
  if (totalOf(P.vMax, 1) > P.target) {
    // as fast as allowed and still long: shorten the holds
    let lo = 0.35;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (totalOf(P.vMax, mid) > P.target) hi = mid;
      else lo = mid;
    }
    hs = lo;
  } else if (totalOf(P.vMin, 1) < P.target) {
    v = P.vMin;
    let lo = 1;
    let hi = 2.2;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (totalOf(P.vMin, mid) < P.target) lo = mid;
      else hi = mid;
    }
    hs = hi;
  } else {
    let lo = P.vMin;
    let hi = P.vMax;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (totalOf(mid, 1) > P.target) lo = mid;
      else hi = mid;
    }
    v = hi;
  }
  return summarise(tour, keys, P, v, hs);
}

/** TEMPO factor of a manifest tempo code. */
export const tempoOf = (code: string): number => (code in TEMPO ? TEMPO[code as keyof typeof TEMPO] : 1);

/** "1:30" */
export const clock = (s: number): string => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};
