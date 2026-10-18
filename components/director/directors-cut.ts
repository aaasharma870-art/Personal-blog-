/* ============================================================================
   THE DIRECTOR'S CUT — the player (PHASE3-SPEC §11.1, P3-10 #1) — OWNER:
   W3-CINEMA; the camera rewrite (Oct 16). The lazy half of ./api.ts (DP-13):
   loaded on the first start, on DESKTOP_FINE with motion on, on the home page.

   It plays the page as a film with a CAMERA, not an autoscroll:
     ./storyboard.ts  reads the live page into keys (hero, each act card's
                      landed world and title, section heads, stars, the end);
     ./plan.ts        turns keys into legs with speed envelopes (ramp, cruise,
                      ramp), holds at rest and dips to dark, and SOLVES the
                      cruise so the tour's total lands on its target;
     this file        conducts the plan: ONE lenis.scrollTo per leg, shaped
                      by the envelope's easing, adjacent legs sharing their
                      boundary speed (no stop-start); Lenis stays the only
                      scroll writer (a rAF writer under ?skip=smooth). Each
                      leg re-resolves its target from the live DOM when it
                      starts, so a font swap or a streamed section only moves
                      the next leg, never breaks the run.
   TRANSPORT (./transport.tsx, the React half): progress, chapter ticks, prev
   / pause / next, Exit. INPUT: a wheel, touch, click or scroll key on the
   page PAUSES (the camera freezes where it is and hands the scroll over:
   "Paused · Resume" resumes from wherever the page is now); Esc exits; Space
   / K pause or resume, ← / → (and [ / ]) step a chapter; presses inside any
   `[data-dc-keep]` (the header control group, the transport, the Sound and
   Eggs toggles) never pause it, and there only K, the arrows and [ / ] steer
   (a focused button keeps Space and Enter for itself; the transport moves
   focus to its Pause button when a tour starts, so Space pauses there);
   Pause / reduced motion, the fast lane, a game, the intro stop it; a hidden
   tab or a modal's scroll lock pauses it.
   START: always from the top of the page (a hard cut through the dip when
   the page is far down), so "about 1½ / 3 minutes" is true every time.
   SOUND: none of its own choosing: it starts with the sound as the visitor
   left it. `dc:start` / `dc:stop` are emitted (the engine voices only the
   run-out at a natural end, and the one title sting per card as the card's
   title appears: the camera adds no cue of its own).
   ========================================================================== */

import { emit, on } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { getLenis, haltGlide, scrollToTarget, setCameraOwnsScroll, whenUnlocked } from "@/lib/smooth-scroll";
import { markWorldFontsReady } from "@/lib/world-fonts";
import type { WorldId } from "@/lib/worlds";
import { inKeep, inPopover, overlayOpen, setDirectorsCutEnded, START_GRACE_MS, setDirectorsCutState, setPlayhead, type Tour } from "./api";
import { easeOf, easeOfMany, solveLeg, type El, type ElDip, type ElHold, type ElLeg, type Env, type Key, type Plan } from "./plan";
import { maxScroll, planTour, type Cut } from "./storyboard";
import { TOURS } from "./timing";

/** What the next conducted element starts from (after a pause / seek / start). */
type Entry = { y?: number; rest?: boolean; holdLeft?: number };

type Run = {
  tour: Tour;
  cut: Cut | null;
  plan: Plan | null;
  /** bumped by every pause / resume / seek / stop: a conductor of an older
   *  generation returns at its next await */
  gen: number;
  stopped: boolean;
  paused: boolean;
  idx: number;
  entry: Entry | null;
  /** the playhead's current segment: plan seconds tFrom -> tTo over wall ms */
  seg: { tFrom: number; tTo: number; w0: number; wDur: number } | null;
  frozen: number;
  wake: (() => void) | null;
  cancelGlide: (() => void) | null;
  holdEnd: number;
  holdY: number;
  pausedHold: number | null;
  samples: { t: number; y: number }[];
  chapter: number;
  undo: (() => void)[];
  raf: number;
  tick: number;
  startedAt: number;
};

let run: Run | null = null;

/** A hold keeps the camera still. A page that has moved this far (px) on its own during a hold was
 *  scrolled by something else (focus on a link the Tab key reached): the tour pauses where it is. */
const DIVERGE_PX = 48;

/** `?debug=dc`: a trace on window for the probes. */
function note(msg: string): void {
  if (typeof window === "undefined" || !/[?&]debug=dc\b/.test(window.location.search)) return;
  const w = window as unknown as { __dcLog?: string[] };
  (w.__dcLog ??= []).push(`${Math.round(performance.now())} ${msg}`);
}

const clampY = (y: number): number => Math.min(maxScroll(), Math.max(0, y));
const liveY = (k: Key): number => clampY(k.resolve?.() ?? k.y);

/* — the playhead ————————————————————————————————————————————————————— */

function playheadOf(r: Run): number {
  if (r.paused) return r.frozen;
  const s = r.seg;
  if (!s) return 0;
  const f = s.wDur > 0 ? Math.min(1, Math.max(0, (performance.now() - s.w0) / s.wDur)) : 1;
  return s.tFrom + (s.tTo - s.tFrom) * f;
}

function setSeg(r: Run, tFrom: number, tTo: number, wallSeconds: number): void {
  r.seg = { tFrom, tTo, w0: performance.now(), wDur: wallSeconds * 1000 };
}

function publish(r: Run, patch: Parameters<typeof setDirectorsCutState>[1] = {}): void {
  if (r.stopped) return;
  setDirectorsCutState(true, { elapsed: Math.round(playheadOf(r)), ...patch });
}

function enterChapter(r: Run, el: El): void {
  const ch = r.cut?.display[el.chapter] ?? -1;
  if (ch !== r.chapter && ch >= 0) {
    r.chapter = ch;
    publish(r, { chapter: ch });
  }
}

/** The chapter on screen follows the playhead (a span can cross chapters). */
function followChapter(r: Run): void {
  const plan = r.plan;
  if (!plan || !r.cut) return;
  const t = playheadOf(r);
  let i = Math.min(r.idx, plan.els.length - 1);
  while (i > 0 && plan.els[i].t0 > t) i--;
  while (i < plan.els.length - 1 && plan.els[i + 1].t0 <= t) i++;
  enterChapter(r, plan.els[i]);
}

/* — glides ——————————————————————————————————————————————————————————— */

/** One glide to `y1` shaped by `env`. Resolves true on arrival, false when
 *  cancelled (a pause / seek / stop) or when something else stopped it
 *  (a modal's scroll lock, the visitor's own scroll).
 *  `settle` (a glide that ends on a rest): returns where the target is NOW.
 *  Layout still moves while the camera flies (sections rendering ahead of it),
 *  so twice on the way in, half way and at four fifths, the glide is
 *  re-aimed: its remaining distance changes by a smoothstep blend, so the
 *  speed curve never jolts and the camera lands where the frame is, with no
 *  corrective drift after the stop. */
function glide(r: Run, y1: number, env: Env, easing?: (x: number) => number, settle?: () => number | null): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    let raf = 0;
    let target = y1;
    const timers: number[] = [];
    const end = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(cap);
      timers.forEach((t) => clearTimeout(t));
      cancelAnimationFrame(raf);
      if (r.cancelGlide === cancel) r.cancelGlide = null;
      resolve(ok);
    };
    const cancel = () => end(false);
    r.cancelGlide = cancel;
    const dur = Math.max(0.05, env.T);
    // a glide that never reports (stopped by a lock, overridden): near its end = arrived
    const cap = window.setTimeout(() => end(Math.abs(window.scrollY - target) < 12), dur * 1000 + 1500);
    const ease = easing ?? easeOf(env);
    const l = getLenis();
    if (l) {
      const from = window.scrollY;
      const t0 = performance.now();
      l.scrollTo(y1, { duration: dur, easing: ease, force: true, onComplete: () => end(true) });
      if (settle && dur > 0.8) {
        const aim = () => {
          if (settled) return;
          const yNew = settle();
          if (yNew == null || Math.abs(yNew - target) < 6) return;
          const k = Math.min(0.9, (performance.now() - t0) / (dur * 1000));
          const was = target;
          const p0 = from + (was - from) * ease(k);
          const delta = yNew - was;
          if (Math.abs(yNew - p0) < 2) return;
          target = yNew;
          const rem = Math.max(0.1, dur * (1 - k));
          const blend = (u: number): number => {
            const kk = k + u * (1 - k);
            const sm = u * u * (3 - 2 * u);
            return (from + (was - from) * ease(kk) + delta * sm - p0) / (yNew - p0);
          };
          note(`aim:${Math.round(delta)}@${k.toFixed(2)}`);
          l.scrollTo(yNew, { duration: rem, easing: blend, force: true, onComplete: () => end(true) });
        };
        timers.push(window.setTimeout(aim, dur * 500), window.setTimeout(aim, dur * 800));
      }
      return;
    }
    const y0 = window.scrollY;
    const t0 = performance.now();
    const step = (now: number) => {
      if (settled) return;
      const k = Math.min(1, (now - t0) / (dur * 1000));
      window.scrollTo({ top: y0 + (y1 - y0) * ease(k), behavior: "instant" });
      if (k >= 1) end(true);
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
}

function wait(r: Run, ms: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const t = window.setTimeout(() => {
      r.wake = null;
      resolve(true);
    }, ms);
    r.wake = () => {
      clearTimeout(t);
      r.wake = null;
      resolve(false);
    };
  });
}

/** The recent speed (px/s) from the rAF samples. */
function speedOf(r: Run): number {
  const s = r.samples;
  if (s.length < 2) return 0;
  const last = s[s.length - 1];
  let j = s.length - 2;
  while (j > 0 && last.t - s[j].t < 140) j--;
  const dt = (last.t - s[j].t) / 1000;
  return dt > 0.03 ? Math.max(0, (last.y - s[j].y) / dt) : 0;
}

function worldOf(id: string): WorldId | null {
  const w = document.getElementById(id.split(":")[0])?.closest("[data-world]")?.getAttribute("data-world");
  return w && w !== "house" ? (w as WorldId) : null;
}

/** What a key needs done as the camera sets out for it (a closed lens opens): never fatal. */
const prepKey = (k: Key | undefined): void => {
  try {
    k?.prep?.();
  } catch {
    /* a frame's extra never stops the film */
  }
};

const warmWorld = (k: Key | undefined): void => {
  const w = k ? worldOf(k.id) : null;
  if (w) void markWorldFontsReady(w).catch(() => {});
};

/* — the elements ——————————————————————————————————————————————————— */

async function doHold(r: Run, g: number, el: ElHold, entry: Entry | null): Promise<boolean> {
  const left = entry?.holdLeft ?? el.dur;
  enterChapter(r, el);
  setSeg(r, el.t0 + (el.dur - left), el.t0 + el.dur, left);
  r.holdEnd = performance.now() + left * 1000;
  r.holdY = window.scrollY;
  // no sound of its own here: the engine voices one title sting per card (lib/audio/engine.ts, phase "m")
  const ms = left * 1000;
  if (ms > 0 && !(await wait(r, ms))) return false;
  return g === r.gen && !r.stopped;
}

/** The legs between two rests, as ONE Lenis glide (the envelopes joined end
 *  to end): a seam at a pass key would otherwise cost a frame (Lenis drops
 *  the leftover time of a glide's last frame). Every leg is re-solved from
 *  the live geometry NOW (a font swap or a streamed section only moves this
 *  span's end, never breaks the run). `entry` resumes the first leg from a
 *  page position at rest. Returns how many elements it ran (0 = stopped). */
async function doSpan(r: Run, g: number, first: number, entry: Entry | null): Promise<number> {
  const plan = r.plan!;
  const A = TOURS[r.tour].a;
  let last = first;
  while (plan.els[last + 1]?.k === "leg") last++;
  const legs = plan.els.slice(first, last + 1) as ElLeg[];
  enterChapter(r, legs[0]);
  const y0 = entry?.y ?? window.scrollY;
  const envs: Env[] = [];
  let at = y0;
  let planned = 0;
  let drawn = 0;
  legs.forEach((el, i) => {
    const b = plan.keys[el.b];
    const yb = liveY(b);
    prepKey(b);
    if (b.dip) warmWorld(plan.keys[el.b + 1]);
    const d = yb - at;
    if (d > 1) {
      envs.push(solveLeg(d, i === 0 && entry?.rest ? 0 : el.env.v0, el.env.v1, el.env.c, A));
      at = yb;
    }
    planned += el.env.T;
    if (i === 0) {
      const yA = liveY(plan.keys[el.a]);
      drawn = Math.min(1, Math.max(0, (y0 - yA) / Math.max(1, yb - yA)));
    }
  });
  const tFrom = legs[0].t0 + legs[0].env.T * drawn;
  const tTo = legs[0].t0 + planned;
  if (!envs.length) {
    setSeg(r, tTo, tTo, 0);
    return last - first + 1;
  }
  const lastLeg = legs[legs.length - 1];
  // a span that ends at a dip keeps its speed past the end for a moment: the cut's
  // fade-in (140 ms) then runs while the page still moves, and Lenis's one lost frame
  // at a glide's end never shows. The jump itself cancels this run-out.
  const runOut = plan.keys[lastLeg.b].dip && lastLeg.env.v1 > 40 ? lastLeg.env.v1 : 0;
  const main = easeOfMany(envs);
  if (runOut) envs.push({ v0: runOut, v1: runOut, c: runOut, r1: 0, r2: 0, T: 0.5 });
  const { T, ease } = easeOfMany(envs);
  setSeg(r, tFrom, tTo, main.T);
  if (runOut) {
    void glide(r, clampY(at + runOut * 0.5), { v0: envs[0].v0, v1: runOut, c: 0, r1: 0, r2: 0, T }, ease);
    const waited = await wait(r, main.T * 1000);
    return waited && g === r.gen && !r.stopped ? last - first + 1 : 0;
  }
  // a span that ends on a rest re-aims at the live frame on the way in (see glide)
  const toRest = lastLeg.env.v1 === 0 ? () => liveY(plan.keys[lastLeg.b]) : undefined;
  const ok = await glide(r, at, { v0: envs[0].v0, v1: envs[envs.length - 1].v1, c: 0, r1: 0, r2: 0, T }, ease, toRest);
  if (g !== r.gen || r.stopped) return 0;
  if (!ok) {
    // The glide ended short and no input said why (an input, a scroll lock, a hidden tab all
    // bump `gen` and returned above): layout moved under it (the page got shorter near the end,
    // Lenis clamped the target). Glide the rest of the way once; only a second miss pauses.
    const yT = clampY(liveY(plan.keys[lastLeg.b]));
    const rest = yT - window.scrollY;
    if (Math.abs(rest) > 12) {
      note(`reglide:${Math.round(rest)}`);
      const again = await glide(r, yT, flyEnv(Math.abs(rest), A));
      if (g !== r.gen || r.stopped) return 0;
      if (!again) {
        pause();
        return 0;
      }
    }
  }
  // layout moved under the glide and it ends on a rest: one short corrective glide, but only for a
  // real miss (the glide re-aims on the way in; a few px of settle are not worth a visible drift)
  if (lastLeg.env.v1 === 0) {
    const yNow = liveY(plan.keys[lastLeg.b]);
    const off = yNow - window.scrollY;
    if (Math.abs(off) > 40) {
      const fix = solveLeg(Math.abs(off), 0, 0, 300, A);
      const ok2 = await glide(r, yNow, fix);
      if (g !== r.gen || r.stopped) return 0;
      if (!ok2) {
        pause();
        return 0;
      }
    }
  }
  return last - first + 1;
}

/** A dip to dark: the existing cut (fade in, jump, fade out) to `y`. */
async function dipTo(y: number, key: Key | undefined): Promise<void> {
  const w = key ? worldOf(key.id) : null;
  if (w) await markWorldFontsReady(w).catch(() => {});
  await scrollToTarget(y, { cut: true, history: false });
}

async function doDip(r: Run, g: number, el: ElDip): Promise<boolean> {
  const plan = r.plan!;
  enterChapter(r, el);
  const inKey = plan.keys[el.b];
  prepKey(inKey);
  setSeg(r, el.t0, el.t0 + el.dur, el.dur);
  await dipTo(liveY(inKey), inKey);
  return g === r.gen && !r.stopped;
}

/* — the conductor ———————————————————————————————————————————————————— */

async function conduct(r: Run, g: number): Promise<void> {
  const plan = r.plan!;
  try {
    while (!r.stopped && g === r.gen) {
      if (r.idx >= plan.els.length) {
        stop("end");
        return;
      }
      const el = plan.els[r.idx];
      const entry = r.entry;
      r.entry = null;
      let ran = 0;
      if (el.k === "hold") ran = (await doHold(r, g, el, entry)) ? 1 : 0;
      else if (el.k === "leg") ran = await doSpan(r, g, r.idx, entry);
      else ran = (await doDip(r, g, el)) ? 1 : 0;
      if (!ran || g !== r.gen || r.stopped) return;
      r.idx += ran;
    }
  } catch {
    if (g === r.gen) stop("error");
  }
}

/** Where on the plan the page is at `y`: the element to resume from. */
function locate(r: Run, y: number): { idx: number; entry: Entry } {
  const plan = r.plan!;
  const ys = plan.keys.map(liveY);
  const els = plan.els;
  // a rest (hold) the page is at
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    if (el.k === "hold" && Math.abs(y - ys[el.key]) <= 6) return { idx: i, entry: { holdLeft: el.dur } };
  }
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    if (el.k === "leg") {
      const ya = ys[el.a] + el.f0 * (ys[el.b] - ys[el.a]);
      const yb = ys[el.a] + el.f1 * (ys[el.b] - ys[el.a]);
      if (y >= ya - 2 && y <= yb + 2) return { idx: i, entry: { y, rest: true } };
    } else if (el.k === "dip" && y > ys[el.a] && y < ys[el.b]) {
      return { idx: i, entry: {} };
    }
  }
  if (y <= ys[0]) return { idx: 0, entry: { rest: true } };
  return { idx: els.length - 1, entry: {} };
}

/** The plan second the page is at (for the playhead after a resume). */
function timeAt(r: Run, idx: number, entry: Entry): number {
  const el = r.plan!.els[idx];
  if (!el) return r.plan!.total;
  if (el.k === "leg" && entry.y != null) {
    const yA = liveY(r.plan!.keys[el.a]);
    const yB = liveY(r.plan!.keys[el.b]);
    const ya = yA + el.f0 * (yB - yA);
    const yb = yA + el.f1 * (yB - yA);
    return el.t0 + el.env.T * Math.min(1, Math.max(0, (entry.y - ya) / Math.max(1, yb - ya)));
  }
  if (el.k === "hold" && entry.holdLeft != null) return el.t0 + (el.dur - entry.holdLeft);
  return el.t0;
}

function launch(r: Run, loc: { idx: number; entry: Entry }): void {
  const g = ++r.gen;
  r.idx = loc.idx;
  r.entry = loc.entry;
  r.paused = false;
  r.pausedHold = null;
  r.frozen = timeAt(r, loc.idx, loc.entry);
  r.seg = null;
  setCameraOwnsScroll(true);
  const el = r.plan!.els[loc.idx];
  if (el) enterChapter(r, el);
  publish(r, { paused: false, elapsed: Math.round(r.frozen) });
  void conduct(r, g);
}

/* — start ——————————————————————————————————————————————————————————— */

/** Seconds a fly-to takes for distance d. */
const flyEnv = (d: number, a: number): Env => solveLeg(d, 0, 0, Math.max(300, d / 0.9), a);

async function begin(r: Run): Promise<void> {
  // a closing menu / palette releases its scroll lock first (a glide begun
  // while Lenis is stopped would be cancelled by its start())
  await whenUnlocked();
  if (r.stopped) return;
  const cut = planTour(r.tour);
  if (!cut) {
    stop("empty");
    return;
  }
  r.cut = cut;
  r.plan = cut.plan;
  if (typeof window !== "undefined" && /[?&]debug=dc\b/.test(window.location.search)) {
    (window as unknown as { __dcCam?: unknown }).__dcCam = { plan: cut.plan, cut, run: r };
  }
  setDirectorsCutState(true, { tour: r.tour, total: Math.round(cut.plan.total), chapters: cut.labels, starts: cut.starts.map((s) => Math.round(s)), chapter: 0, elapsed: 0, paused: false });
  setPlayhead(() => playheadOf(r));
  const vh = window.innerHeight;
  const y = window.scrollY;
  // the tour is a film: it always opens at the top, so "about 1½ / 3 minutes" is true
  // every time. A little way down (even a few px) the camera flies up first; further
  // down, the cut (the dip to dark) takes it there; at the top it simply starts
  if (y > 2) {
    if (y > 1.2 * vh) await scrollToTarget(0, { cut: true, history: false });
    else {
      const ok = await glide(r, 0, flyEnv(y, TOURS[r.tour].a));
      if (!ok && !r.stopped) return;
    }
    if (r.stopped) return;
  }
  launch(r, { idx: 0, entry: { rest: true } });
}

/** Start a run (./api.ts calls it from the click). */
export function play(tour: Tour): void {
  if (run) return;
  if (motionOffNow()) {
    setDirectorsCutState(false);
    return;
  }
  const r: Run = {
    tour,
    cut: null,
    plan: null,
    gen: 0,
    stopped: false,
    paused: false,
    idx: 0,
    entry: null,
    seg: null,
    frozen: 0,
    wake: null,
    cancelGlide: null,
    holdEnd: 0,
    holdY: 0,
    pausedHold: null,
    samples: [],
    chapter: -1,
    undo: [],
    raf: 0,
    tick: 0,
    startedAt: performance.now(),
  };
  run = r;

  /* input: page presses pause, the keys below steer, the keep zones are ignored */
  const opts = { capture: true, passive: true } as const;
  const onInput = (e: Event) => {
    if (inKeep(e)) return;
    // the second click of a double click on the chooser's button lands on the page, just after the start
    if (e.type === "pointerdown" && performance.now() - r.startedAt < START_GRACE_MS) return;
    if (!r.plan) return stop(e.type);
    freeze(r, e.type);
  };
  for (const ev of ["wheel", "touchstart", "pointerdown"] as const) {
    window.addEventListener(ev, onInput, opts);
    r.undo.push(() => window.removeEventListener(ev, onInput, opts));
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // an open menu, panel or dialog takes the first Esc (it closes itself); the next one ends the tour
      if (overlayOpen()) return;
      return stop("escape");
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab" || e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (inKeep(e)) {
      // the control group, the transport, the Sound / Eggs toggles: a press never pauses the cut,
      // and a focused button keeps Space and Enter. K, the arrows and [ / ] still steer from there
      // (focus lives on the transport's Pause button), except inside the dock's open menus
      if (inPopover(e) || !r.plan) return;
      if (!/^(k|K|ArrowLeft|ArrowRight|\[|\])$/.test(e.key)) return;
    } else if (!r.plan) return stop("key");
    switch (e.key) {
      case " ":
      case "k":
      case "K":
        e.preventDefault();
        if (e.repeat) return;
        return r.paused ? resume() : pause();
      case "ArrowRight":
      case "]":
        e.preventDefault();
        if (e.repeat) return;
        return step(1);
      case "ArrowLeft":
      case "[":
        e.preventDefault();
        if (e.repeat) return;
        return step(-1);
      case "ArrowDown":
      case "ArrowUp":
      case "PageDown":
      case "PageUp":
      case "Home":
      case "End":
        return freeze(r, `key:${e.key}`);
      default:
    }
  };
  window.addEventListener("keydown", onKey, true);
  r.undo.push(() => window.removeEventListener("keydown", onKey, true));
  r.undo.push(onMotionOffChange(() => motionOffNow() && stop("pause")));
  r.undo.push(on("fastlane", () => stop("fastlane")));
  r.undo.push(on("game:start", () => stop("game")));
  const onVis = () => {
    if (document.hidden) freeze(r, "hidden");
  };
  document.addEventListener("visibilitychange", onVis);
  r.undo.push(() => document.removeEventListener("visibilitychange", onVis));
  const mo = new MutationObserver(() => {
    if (document.documentElement.classList.contains("intro-armed")) stop("intro");
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  r.undo.push(() => mo.disconnect());

  /* the sampler: speed for a graceful pause; a scroll lock pauses */
  const sample = () => {
    if (r.stopped) return;
    const now = performance.now();
    r.samples.push({ t: now, y: window.scrollY });
    if (r.samples.length > 40) r.samples.shift();
    if (!r.paused && r.plan && document.body.style.overflow === "hidden") freeze(r, "lock");
    // the page moved on its own during a hold (Tab onto a link scrolls it natively): the visitor has the
    // scroll now, so the tour pauses here ("Resume" carries on from the plan position at this y)
    if (!r.paused && r.plan && r.holdEnd > now && Math.abs(window.scrollY - r.holdY) > DIVERGE_PX) freeze(r, "moved");
    if (!r.paused && r.plan) followChapter(r);
    r.raf = requestAnimationFrame(sample);
  };
  r.raf = requestAnimationFrame(sample);
  // the elapsed second for the dock (the bar itself reads the playhead per frame)
  r.tick = window.setInterval(() => {
    if (!r.paused && r.plan) publish(r);
  }, 1000);

  emit("dc:start");
  void begin(r).catch(() => stop("error"));
}

/* — pause, resume, seek ———————————————————————————————————————————— */

/** Freeze where the page is NOW (a wheel, a click, a key): the visitor owns
 *  the scroll from here. */
function freeze(r: Run, why = "input"): void {
  if (r.stopped || !r.plan) return;
  note(`freeze:${why}`);
  if (r.paused) {
    // already paused: a graceful decel still gliding gives way to the visitor's scroll
    if (r.cancelGlide) {
      r.cancelGlide();
      const l = getLenis();
      if (l && l.isScrolling === "smooth") haltGlide();
      setCameraOwnsScroll(false);
    }
    return;
  }
  r.frozen = playheadOf(r);
  r.pausedHold = r.holdEnd > performance.now() ? (r.holdEnd - performance.now()) / 1000 : null;
  r.paused = true;
  r.gen++;
  r.cancelGlide?.();
  r.wake?.();
  const l = getLenis();
  if (l && l.isScrolling === "smooth") haltGlide();
  setCameraOwnsScroll(false);
  publish(r, { paused: true, elapsed: Math.round(r.frozen) });
}

/** Pause with a graceful stop: a glide in flight eases to rest. */
export function pause(): void {
  const r = run;
  if (!r || r.stopped || r.paused || !r.plan) return;
  const v = speedOf(r);
  const l = getLenis();
  if (!(l && l.isScrolling === "smooth" && v > 40)) return freeze(r);
  r.frozen = playheadOf(r);
  r.pausedHold = null;
  r.paused = true;
  r.gen++;
  r.wake?.();
  publish(r, { paused: true, elapsed: Math.round(r.frozen) });
  const a = TOURS[r.tour].a;
  const rr = Math.max(0.35, (1.5 * v) / a);
  const y1 = clampY(window.scrollY + (v * rr) / 2);
  r.cancelGlide?.();
  void glide(r, y1, { v0: v, v1: 0, c: v, r1: 0, r2: rr, T: rr }).then(() => {
    if (!r.paused) return;
    setCameraOwnsScroll(false);
  });
}

/** Resume from where the page is now. */
export function resume(): void {
  const r = run;
  if (!r || r.stopped || !r.paused || !r.plan) return;
  r.cancelGlide?.();
  const y = window.scrollY;
  if (r.pausedHold != null && Math.abs(y - r.holdY) <= 6) {
    const el = r.plan.els[r.idx];
    if (el && el.k === "hold") return launch(r, { idx: r.idx, entry: { holdLeft: Math.max(0.2, r.pausedHold) } });
  }
  launch(r, locate(r, y));
}

/** Go to the first frame of display chapter `i`, then play on. */
export function seek(i: number): void {
  const r = run;
  if (!r || r.stopped || !r.plan || !r.cut) return;
  const cut = r.cut;
  const ci = Math.min(cut.firstEl.length - 1, Math.max(0, i));
  let idx = cut.firstEl[ci];
  const g = ++r.gen;
  r.cancelGlide?.();
  r.wake?.();
  const l = getLenis();
  if (l && l.isScrolling === "smooth") haltGlide();
  // the playhead holds at the chapter's start while the camera flies there
  r.paused = false;
  r.pausedHold = null;
  r.holdEnd = 0;
  r.seg = { tFrom: r.plan.els[idx]?.t0 ?? 0, tTo: r.plan.els[idx]?.t0 ?? 0, w0: performance.now(), wDur: 1 };
  publish(r, { paused: false, chapter: ci });
  r.chapter = ci;
  setCameraOwnsScroll(true);
  const plan = r.plan;
  void (async () => {
    const keys = plan.keys;
    const el = plan.els[idx];
    let y = 0;
    let keyAt: Key | undefined;
    if (el.k === "hold") {
      keyAt = keys[el.key];
      y = liveY(keyAt);
    } else if (el.k === "leg") {
      keyAt = keys[el.a];
      const yA = liveY(keys[el.a]);
      y = yA + el.f0 * (liveY(keys[el.b]) - yA);
    } else {
      keyAt = keys[el.b];
      y = liveY(keyAt);
      idx++;
    }
    const vh = window.innerHeight;
    const d = Math.abs(y - window.scrollY);
    prepKey(keyAt);
    if (d > 2) {
      if (d <= 1.2 * vh) {
        const ok = await glide(r, y, flyEnv(d, TOURS[r.tour].a));
        if (g !== r.gen || r.stopped) return;
        if (!ok) return void pause();
      } else {
        const lead = Math.min(y, 0.6 * vh);
        await dipTo(y - lead, keyAt);
        if (g !== r.gen || r.stopped) return;
        const ok = await glide(r, y, flyEnv(lead, TOURS[r.tour].a));
        if (g !== r.gen || r.stopped) return;
        if (!ok) return void pause();
      }
    }
    if (g !== r.gen || r.stopped) return;
    launch(r, { idx, entry: { rest: true } });
  })().catch(() => stop("error"));
}

/** The next (+1) or previous (-1) chapter (previous: this chapter's start first). */
export function step(dir: 1 | -1): void {
  const r = run;
  if (!r || r.stopped || !r.cut) return;
  const cut = r.cut;
  const cur = Math.max(0, r.chapter);
  if (dir > 0) {
    if (cur >= cut.labels.length - 1) return;
    return seek(cur + 1);
  }
  const into = playheadOf(r) - (cut.starts[cur] ?? 0);
  seek(into > 3 || cur === 0 ? cur : cur - 1);
}

/** Both tours' computed lengths (s) from the live page. */
export function lengths(): Record<Tour, number> {
  return { quick: planTour("quick")?.plan.total ?? 0, full: planTour("full")?.plan.total ?? 0 };
}

/** End the run (idempotent). */
export function stop(reason: string): void {
  const r = run;
  if (!r || r.stopped) return;
  note(`stop:${reason}`);
  r.stopped = true;
  run = null;
  r.gen++;
  r.cancelGlide?.();
  r.wake?.();
  // halt the programmatic glide in place: the input that stopped us (a
  // wheel, a key) owns the scroll from here
  const l = getLenis();
  if (l && l.isScrolling === "smooth") haltGlide();
  cancelAnimationFrame(r.raf);
  clearInterval(r.tick);
  for (const u of r.undo) u();
  setCameraOwnsScroll(false);
  setPlayhead(() => 0);
  const max = maxScroll();
  const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 100;
  emit("dc:stop", { reason, pct });
  if (reason === "end") setDirectorsCutEnded();
  else setDirectorsCutState(false);
}
