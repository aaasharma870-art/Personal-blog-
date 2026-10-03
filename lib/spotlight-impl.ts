/* ============================================================================
   SPOTLIGHT (impl) — one star at a time (PHASE3-SPEC §3.8; P3-11 r1 F1).
   Loaded lazily by lib/spotlight.ts on DESKTOP_FINE with motion on (DP-13);
   phones and reduced motion never load it. The rules and the host API are
   in lib/spotlight.ts; this file is the arbiter.

   - SCROLL STARS own the spotlight while the reading position (scrollY)
     lies inside their PERFORMANCE WINDOW [a, b]: two page positions from
     the window spec ("top 92%, bottom 52%"; lib/spotlight-windows.ts
     parses it), measured when a star registers and on resize
     (ResizeObserver(document.body) + window resize); per frame the
     arbiter reads only scrollY. Two in their windows: the one that began
     last (a hand-off; a short star nested in a long one owns while it
     lasts), then the heavier. One id, one entry: the same
     element registered twice (a host and the words binder) is counted
     once and leaves when both have unregistered.
   - TIME STARS ask: `request(id, { weight, needsIdle?, maxWait = 1500 })`.
     "play" when no star performs and no scroll star's window begins
     within the hold at the current speed (the LOOKAHEAD); the queue grants
     the heaviest waiting star first, then the earliest. A granted star
     holds the spotlight for its duration (≤ 1.2 s, or until `release`).
     After `maxWait` the answer is "skip": the host shows its end state.
   - A scroll star PERFORMS while it owns and the page moves; a `live` one
     whenever it owns. An ungated scrub owner that has been still for
     300 ms (the reader stopped) lets a waiting time star play; an ungated
     star whose window opens during a hold owns at once (the log shows the
     overlap: it moves with the scroll, nothing can stop it).
   - A GATED scroll star (`onOwn`) YIELDS: it never blocks a grant nor
     counts for the lookahead; when a time star is granted while it owns,
     or its window opens during a hold, it is told `onOwn(false)` (logged
     "free" / "wait") and holds still, and `onOwn(true)` when the hold ends
     (the scrub sentence then completes with a short fade); for 500 ms
     after that hand-back it blocks grants, so its finish is not cut.
   - needsIdle (invites, fly-throughs) also waits for READING PACE: the
     speed averaged over 500 ms stays under 300 px/s for 600 ms (spec
     §3.8); there is no 1.5 s limit: it is dropped ("skip") when its host —
     the element carrying `data-beat="<id>"` — leaves the viewport. Without
     a host in the DOM it gives up after 6 s.
   - Every id plays at most once per page view: asking again answers
     "skip" (a remounted host shows its end state). A request already
     waiting returns the same promise (React StrictMode, double mounts).
   - Pause or OS reduced motion mid-session (html[data-motion="paused"], the
     media query) or leaving DESKTOP_FINE: every waiting star resolves
     "skip" and the hold ends at once; later requests answer "skip".
   - `?debug=spotlight`: logs requests, waits, grants, skips, ownership
     (own / free with `how`: "scrub" | "live") to the console and to
     `window.__spotlight.log` (the screencast, the beats probe and the
     spotlight probe read it), and exposes the API there for the probe.
   ========================================================================== */

import type { BeatWeight } from "./beats";
import type { ScrollStarOptions, SpotlightAnswer, SpotlightRequest } from "./spotlight";
import { DESKTOP_FINE, motionOffNow } from "./flags";
import { DEFAULT_WINDOW, LIVE_STARS, SCROLL_WINDOWS, parseWindow, type WindowEdge } from "./spotlight-windows";

const MAX_WAIT = 1500;
const MAX_HOLD = 1200;
/** Reading pace (spec §3.8 "velocity < 300 px/s for 600 ms"), averaged. */
const IDLE = { ms: 600, below: 300 };
const SPEED_MS = 500;
/** An ungated scrub owner this long without a scroll event is still. */
const FREEZE_MS = 300;
/** The lookahead's margin while moving (share of the viewport). */
const LOOK_PAD = 0.04;
/** A gated star handed back after a hold finishes what it held (the scrub's
 *  fade) before the next grant. */
const HANDBACK_MS = 500;
const HOSTLESS_IDLE_WAIT = 6000;

type Window = readonly [WindowEdge, WindowEdge];
type ScrollStar = {
  id: string;
  el: Element;
  weight: BeatWeight;
  win: Window;
  spec: string;
  how: "scrub" | "live";
  onOwn: ((owned: boolean) => void) | null;
  /** The last thing the host was told (undefined = nothing yet). */
  told: boolean | undefined;
  refs: number;
  seq: number;
  /** The window in scroll px, and whether it could be measured. */
  a: number;
  b: number;
  placed: boolean;
  /** Handed back after a hold: it blocks grants until then. */
  busyUntil: number;
};
type Pending = {
  id: string;
  weight: BeatWeight;
  needsIdle: boolean;
  durationMs: number;
  seq: number;
  t0: number;
  idle: boolean;
  promise: Promise<SpotlightAnswer>;
  resolve: (a: SpotlightAnswer) => void;
  timer: number;
  io: IntersectionObserver | null;
  waitLogged: boolean;
};
type Hold = { id: string; weight: BeatWeight; timer: number; t0: number };
export type SpotlightLogEntry = {
  t: number;
  y: number;
  ev: "request" | "wait" | "grant" | "skip" | "end" | "release" | "own" | "free" | "idle" | "off";
  id?: string;
  weight?: BeatWeight;
  why?: string;
  how?: "scrub" | "live";
};

const stars = new Map<string, ScrollStar>();
const pending = new Map<string, Pending>();
const settled = new Map<string, SpotlightAnswer>();
let hold: Hold | null = null;
let owner: ScrollStar | null = null;
/** A gated scroll star in its window, waiting for the hold to end. */
let deferred: ScrollStar | null = null;
let seq = 0;
let viewportH = 0;
let started = false;
let off = false;
let raf = 0;
let measureRaf = 0;
let recheckTimer = 0;
/** Scroll samples [t, y] taken once per evaluated frame (the speed). */
const samples: [number, number][] = [];
let lastScrollT = 0;
let lastBusyT = 0;
/** The scroll position the last evaluate() saw (the log's `y`). */
let lastY = 0;

const DEBUG =
  typeof window !== "undefined" && /(?:^|[?&])debug=[^&]*\bspotlight\b/.test(window.location.search);
const log: SpotlightLogEntry[] = [];

function note(ev: SpotlightLogEntry["ev"], id?: string, extra: Partial<SpotlightLogEntry> = {}): void {
  if (!DEBUG) return;
  // `lastY` (the last evaluate's scroll), never a fresh window.scrollY: a
  // read here would force the whole-document restyle a Pause has just
  // queued, inside the Pause (debug logging must not cost the skip)
  const e: SpotlightLogEntry = { t: Math.round(performance.now()), y: Math.round(lastY), ev, id, ...extra };
  log.push(e);
  console.info(`[spotlight] ${ev}${id ? ` ${id}` : ""}${e.why ? ` (${e.why})` : ""} @y=${e.y}`);
}

/** The attribute first: setting html[data-motion="paused"] invalidates the
 *  whole document's style, and `matchMedia().matches` would force that
 *  restyle (≈ 100+ ms headless) before Pause could answer "skip". */
function motionOff(): boolean {
  return document.documentElement.dataset.motion === "paused" || motionOffNow() || !window.matchMedia(DESKTOP_FINE).matches;
}

/* — speed, stillness, reading pace (no layout reads) —————————————————— */

function sample(y: number): void {
  const now = performance.now();
  samples.push([now, y]);
  while (samples.length > 2 && now - samples[0][0] > SPEED_MS) samples.shift();
  if (speed() >= IDLE.below) lastBusyT = now;
}

/** px/s averaged over the last 500 ms (0 once the page has stopped). */
function speed(): number {
  const n = samples.length;
  if (n < 2) return 0;
  const now = performance.now();
  const [t1, y1] = samples[n - 1];
  if (now - t1 > 150) return 0;
  const [t0, y0] = samples[0];
  return (Math.abs(y1 - y0) * 1000) / Math.max(100, t1 - t0);
}

/** +1 down, -1 up, 0 still. */
function direction(): number {
  const n = samples.length;
  return n < 2 ? 0 : Math.sign(samples[n - 1][1] - samples[0][1]);
}

const still = (): boolean => performance.now() - lastScrollT >= FREEZE_MS;
const readingPace = (): boolean => performance.now() - lastBusyT >= IDLE.ms;

/* — scroll-star windows (measured on register and on resize only) ———————— */

const stickyOf = new WeakMap<Element, boolean>();

/** An element's page top and height; a sticky element from its parent's
 *  top (its natural place). null when it renders no box. */
function boxOf(el: Element): { top: number; h: number } | null {
  if (!el.isConnected || !el.getClientRects().length) return null;
  const r = el.getBoundingClientRect();
  let sticky = stickyOf.get(el);
  if (sticky === undefined) {
    sticky = getComputedStyle(el).position === "sticky";
    stickyOf.set(el, sticky);
  }
  const top = sticky && el.parentElement ? el.parentElement.getBoundingClientRect().top : r.top;
  return { top: top + window.scrollY, h: r.height };
}

function edgeY(s: ScrollStar, e: WindowEdge): number | null {
  let el: Element = s.el;
  if (e.sel) {
    try {
      el = document.querySelector(e.sel) ?? s.el;
    } catch {
      el = s.el;
    }
  }
  const box = boxOf(el);
  return box ? box.top + e.f * box.h - e.v * viewportH : null;
}

function measure(s: ScrollStar): void {
  const a = edgeY(s, s.win[0]);
  const b = edgeY(s, s.win[1]);
  s.placed = a != null && b != null && b > a;
  if (a != null && b != null) {
    s.a = a;
    s.b = b;
  }
}

function remeasure(): void {
  measureRaf = 0;
  viewportH = window.innerHeight;
  stars.forEach(measure);
  evaluate();
}

function scheduleMeasure(): void {
  if (!measureRaf) measureRaf = requestAnimationFrame(remeasure);
}

/* — ownership + the queue ——————————————————————————————————————————— */

/** The scroll star whose window holds `y`: the one that began last (a
 *  hand-off; a short star nested in a long one owns while it lasts, then
 *  the long one again), then the heavier, then the last registered. No
 *  layout reads. */
function inWindowAt(y: number): ScrollStar | null {
  let best: ScrollStar | null = null;
  for (const s of stars.values()) {
    if (!s.placed || y < s.a || y >= s.b) continue;
    if (!best || s.a > best.a || (s.a === best.a && (s.weight > best.weight || (s.weight === best.weight && s.seq > best.seq)))) best = s;
  }
  return best;
}

/** A star in its window that is performing now and cannot hold still: an
 *  ungated live one, or ungated while the page moves, or a gated one just
 *  handed back after a hold. Nothing is granted over it. */
function performer(): ScrollStar | null {
  const moving = !still();
  const now = performance.now();
  for (const s of stars.values()) {
    if (!s.placed || lastY < s.a || lastY >= s.b) continue;
    if (s.onOwn ? s.busyUntil > now : s.how === "live" || moving) return s;
  }
  return null;
}

function tell(s: ScrollStar, owned: boolean): void {
  if (s.told === owned) return;
  s.told = owned;
  try {
    s.onOwn?.(owned);
  } catch {
    /* a host's callback never breaks the arbiter */
  }
}

function evaluate(): void {
  if (off) return;
  lastY = window.scrollY;
  sample(lastY);
  const next = inWindowAt(lastY);
  if (next && hold && next.onOwn && next !== owner) {
    // a gated star whose window opened during a hold waits for it
    if (owner) {
      const prev = owner;
      owner = null;
      note("free", prev.id);
      tell(prev, false);
    }
    if (deferred !== next) {
      deferred = next;
      note("wait", next.id, { weight: next.weight, why: `held by ${hold.id}` });
      tell(next, false);
    }
  } else if (next !== owner) {
    const prev = owner;
    if (next && next === deferred) next.busyUntil = performance.now() + HANDBACK_MS;
    owner = next;
    deferred = null;
    if (prev) tell(prev, false);
    if (next) {
      note("own", next.id, { weight: next.weight, how: next.how });
      tell(next, true);
    } else if (prev) note("free", prev.id);
  } else if (!next) deferred = null;
  tryGrant();
}

function scheduleEvaluate(): void {
  if (!raf) {
    raf = requestAnimationFrame(() => {
      raf = 0;
      evaluate();
    });
  }
}

function onScroll(): void {
  lastScrollT = performance.now();
  scheduleEvaluate();
}

/** Re-runs the queue later (stillness, reading pace, a lookahead). */
function recheck(ms: number): void {
  if (recheckTimer) return;
  recheckTimer = window.setTimeout(() => {
    recheckTimer = 0;
    tryGrant();
  }, Math.max(16, Math.ceil(ms)));
}

function settle(p: Pending, a: SpotlightAnswer, why: string, remember = true): void {
  window.clearTimeout(p.timer);
  p.io?.disconnect();
  pending.delete(p.id);
  if (remember) settled.set(p.id, a);
  note(a === "play" ? "grant" : "skip", p.id, { weight: p.weight, why });
  p.resolve(a);
}

/** A scroll star whose window would begin within `ms` at the current speed
 *  (in the scroll's direction), other than the owner. */
function imminent(ms: number): ScrollStar | null {
  const v = speed();
  if (v <= 0) return null;
  const reach = (v * Math.min(ms, MAX_HOLD)) / 1000 + LOOK_PAD * viewportH;
  const dir = direction();
  for (const s of stars.values()) {
    // a gated star yields to a hold: it never stops a grant
    if (!s.placed || s === owner || s.onOwn) continue;
    if (dir >= 0 ? s.a > lastY && s.a - lastY <= reach : s.b <= lastY && lastY - s.b <= reach) return s;
  }
  return null;
}

function waitNote(q: Pending, why: string): void {
  if (q.waitLogged) return;
  q.waitLogged = true;
  note("wait", q.id, { weight: q.weight, why });
}

function tryGrant(): void {
  if (off || hold || !pending.size) return;
  const pace = readingPace();
  let p: Pending | null = null;
  for (const q of pending.values()) {
    if (q.needsIdle) {
      if (pace && !q.idle) note("idle", q.id);
      q.idle = pace;
      if (!pace) continue;
    }
    if (!p || q.weight > p.weight || (q.weight === p.weight && q.seq < p.seq)) p = q;
  }
  // a star performs and cannot hold still: a live one, or an ungated one
  // while the page moves (a gated owner yields, below)
  const busy = performer();
  if (busy) {
    for (const q of pending.values()) waitNote(q, `owned by ${busy.id}`);
    if (busy.onOwn) recheck(busy.busyUntil - performance.now());
    else if (busy.how !== "live") recheck(FREEZE_MS - (performance.now() - lastScrollT));
    return;
  }
  if (!p) {
    for (const q of pending.values()) waitNote(q, "waiting for reading pace");
    recheck(IDLE.ms - (performance.now() - lastBusyT));
    return;
  }
  const next = imminent(p.durationMs);
  if (next) {
    waitNote(p, `${next.id} begins within the hold`);
    recheck(120);
    return;
  }
  if (owner?.onOwn) {
    // a gated owner yields: it holds still until the hold ends
    const s = owner;
    owner = null;
    deferred = s;
    note("free", s.id, { why: `yields to ${p.id}` });
    tell(s, false);
  }
  settle(p, "play", `waited ${Math.round(performance.now() - p.t0)} ms`);
  hold = {
    id: p.id,
    weight: p.weight,
    t0: performance.now(),
    timer: window.setTimeout(() => endHold("held"), Math.min(Math.max(p.durationMs, 0), MAX_HOLD)),
  };
}

function endHold(why: string): void {
  if (!hold) return;
  window.clearTimeout(hold.timer);
  note("end", hold.id, { why });
  hold = null;
  // a deferred gated star takes over on the next frame (never in the
  // caller's task: release() may run inside a Pause)
  scheduleEvaluate();
}

/** Pause, reduced motion or a narrow window: everything resolves "skip" now. */
function shutDown(why: string): void {
  if (off) return;
  off = true;
  note("off", undefined, { why });
  [...pending.values()].forEach((p) => settle(p, "skip", why));
  if (hold) {
    window.clearTimeout(hold.timer);
    hold = null;
  }
  owner = null;
  deferred = null;
  window.clearTimeout(recheckTimer);
  recheckTimer = 0;
}

function wake(): void {
  if (!off || motionOff()) return;
  off = false;
  note("off", undefined, { why: "motion back on" });
  stars.forEach((s) => (s.told = undefined));
  scheduleMeasure();
}

function start(): void {
  if (started) return;
  started = true;
  viewportH = window.innerHeight;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", scheduleMeasure, { passive: true });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(scheduleMeasure).observe(document.body);
  const check = () => (motionOff() ? shutDown("motion off") : wake());
  new MutationObserver(check).observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", check);
  window.matchMedia(DESKTOP_FINE).addEventListener("change", check);
  if (DEBUG) {
    (window as unknown as { __spotlight?: unknown }).__spotlight = {
      log,
      request,
      release,
      registerScrollStar,
      state: () => ({
        owner: owner?.id ?? null,
        deferred: deferred?.id ?? null,
        hold: hold?.id ?? null,
        pending: [...pending.keys()],
        stars: [...stars.values()].map((s) => ({
          id: s.id,
          weight: s.weight,
          own: s.spec,
          how: s.how,
          gated: Boolean(s.onOwn),
          a: Math.round(s.a),
          b: Math.round(s.b),
          placed: s.placed,
        })),
        settled: Object.fromEntries(settled),
        speed: Math.round(speed()),
        off,
      }),
    };
  }
}

/* — the API (lib/spotlight.ts forwards here) ————————————————————————— */

export function request(id: string, o: SpotlightRequest): Promise<SpotlightAnswer> {
  if (typeof window === "undefined") return Promise.resolve("skip");
  const waiting = pending.get(id);
  if (waiting) return waiting.promise;
  start();
  note("request", id, { weight: o.weight, why: o.needsIdle ? "needs idle" : undefined });
  if (settled.has(id)) {
    note("skip", id, { why: "once per view" });
    return Promise.resolve("skip");
  }
  if (off || motionOff()) {
    shutDown("motion off");
    settled.set(id, "skip");
    note("skip", id, { why: "motion off" });
    return Promise.resolve("skip");
  }
  let resolve!: (a: SpotlightAnswer) => void;
  const promise = new Promise<SpotlightAnswer>((r) => (resolve = r));
  const p: Pending = {
    id,
    weight: o.weight,
    needsIdle: Boolean(o.needsIdle),
    durationMs: o.durationMs ?? MAX_HOLD,
    seq: ++seq,
    t0: performance.now(),
    idle: false,
    promise,
    resolve,
    timer: 0,
    io: null,
    waitLogged: false,
  };
  pending.set(id, p);

  const host = document.querySelector(`[data-beat="${CSS.escape(id)}"]`);
  const maxWait = o.maxWait ?? (p.needsIdle ? (host ? Infinity : HOSTLESS_IDLE_WAIT) : MAX_WAIT);
  if (Number.isFinite(maxWait)) p.timer = window.setTimeout(() => settle(p, "skip", `maxWait ${maxWait} ms`), maxWait);
  if (host && typeof IntersectionObserver !== "undefined") {
    p.io = new IntersectionObserver(([e]) => {
      if (e && !e.isIntersecting && pending.get(id) === p) settle(p, "skip", "host left the viewport");
    });
    p.io.observe(host);
  }
  evaluate();
  return promise;
}

/** Ends a hold early, or withdraws a waiting request (it may ask again later). */
export function release(id: string): void {
  if (hold?.id === id) {
    note("release", id);
    endHold("released");
    return;
  }
  const p = pending.get(id);
  if (p) settle(p, "skip", "withdrawn", false);
}

/** Registers `el` as the scroll star `id` (lib/spotlight.ts: THE WINDOW).
 *  The window: `o.own`, else the element's `data-beat-scroll`, else
 *  lib/spotlight-windows.ts, else the old middle-60 % band. */
export function registerScrollStar(id: string, el: Element, weight: BeatWeight, o: ScrollStarOptions = {}): () => void {
  if (typeof window === "undefined") return () => {};
  start();
  let s = stars.get(id);
  if (s && s.el === el) {
    s.refs++;
    if (o.own && o.own !== s.spec) {
      const win = parseWindow(o.own);
      if (win) {
        s.spec = o.own;
        s.win = win;
      }
    }
    if (o.live) s.how = "live";
    if (o.onOwn) s.onOwn = o.onOwn;
  } else {
    if (s) {
      // another element under the same id replaces it
      if (owner === s) owner = null;
      if (deferred === s) deferred = null;
    }
    const attr = el.getAttribute("data-beat-scroll")?.trim();
    const candidates = [o.own, attr, SCROLL_WINDOWS[id]];
    let spec = DEFAULT_WINDOW;
    let win = parseWindow(DEFAULT_WINDOW)!;
    for (const c of candidates) {
      const w = c ? parseWindow(c) : null;
      if (c && w) {
        spec = c;
        win = w;
        break;
      }
    }
    const live = o.live ?? (el.hasAttribute("data-beat-live") || LIVE_STARS.has(id));
    s = { id, el, weight, win, spec, how: live ? "live" : "scrub", onOwn: o.onOwn ?? null, told: undefined, refs: 1, seq: ++seq, a: 0, b: 0, placed: false, busyUntil: 0 };
    stars.set(id, s);
  }
  viewportH = window.innerHeight;
  measure(s);
  evaluate();
  const me = s;
  const gate = o.onOwn;
  let gone = false;
  return () => {
    if (gone) return;
    gone = true;
    if (stars.get(id) !== me) return;
    if (gate && me.onOwn === gate) me.onOwn = null;
    if (--me.refs > 0) return;
    stars.delete(id);
    if (owner === me) {
      owner = null;
      note("free", id, { why: "unregistered" });
    }
    if (deferred === me) deferred = null;
    // re-evaluated on the next frame, never in the caller's task: stars
    // unregister on Pause (the words binder's reset, a host's effect
    // cleanup), and evaluate()'s window.scrollY would force the whole-
    // document restyle the Pause has just queued, inside the Pause
    scheduleEvaluate();
  };
}
