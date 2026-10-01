/* ============================================================================
   SPOTLIGHT (impl) — one star at a time (PHASE3-SPEC §3.8). Loaded lazily by
   lib/spotlight.ts on DESKTOP_FINE with motion on (DP-13); phones and reduced
   motion never load it.

   - SCROLL STARS own the spotlight while their element's page range crosses
     the middle 60% of the viewport (20%–80%). Ranges are measured when a
     star registers and again on resize (ResizeObserver(document.body) +
     window resize): per frame the arbiter reads only scrollY. Register the
     element whose page box IS the star's scroll range (for a pinned star:
     its pin spacer, measured unpinned), never a sticky child.
   - TIME STARS ask: `request(id, { weight, needsIdle?, maxWait = 1500 })`.
     "play" when nothing else owns the spotlight; a granted star holds it
     for its duration (≤ 1.2 s, or until `release(id)`). The queue grants
     the heaviest waiting star first, then the earliest. After `maxWait` the
     answer is "skip": the host shows its end state without animating.
   - needsIdle (invites, fly-throughs) also waits for scroll-idle (under
     300 px/s for 600 ms; re-armed when the reader speeds up again) and has
     no 1.5 s limit: it is dropped ("skip") when its host — the element
     carrying `data-beat="<id>"` — leaves the viewport. Without a host in
     the DOM it gives up after 6 s.
   - Every id plays at most once per page view: asking again answers
     "skip" (a remounted host shows its end state). A request already
     waiting returns the same promise (React StrictMode, double mounts).
   - Pause or OS reduced motion mid-session (html[data-motion="paused"], the
     media query) or leaving DESKTOP_FINE: every waiting star resolves
     "skip" and the hold ends at once; later requests answer "skip".
   - `?debug=spotlight`: logs requests, waits, grants, skips and ownership
     to the console and to `window.__spotlight.log` (the beats probe and the
     spotlight probe read it), and exposes the API there for the probe.
   ========================================================================== */

import type { BeatWeight } from "./beats";
import type { SpotlightAnswer, SpotlightRequest } from "./spotlight";
import { DESKTOP_FINE, motionOffNow } from "./flags";
import { onScrollIdle, scrollVelocity } from "./smooth-scroll";

const BAND = [0.2, 0.8] as const;
const MAX_WAIT = 1500;
const MAX_HOLD = 1200;
const IDLE = { ms: 600, below: 300 };
const HOSTLESS_IDLE_WAIT = 6000;

type ScrollStar = { id: string; el: Element; weight: BeatWeight; top: number; bottom: number; seq: number };
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
  offIdle: (() => void) | null;
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
};

const stars = new Map<string, ScrollStar>();
const pending = new Map<string, Pending>();
const settled = new Map<string, SpotlightAnswer>();
let hold: Hold | null = null;
let owner: ScrollStar | null = null;
let seq = 0;
let viewportH = 0;
let started = false;
let off = false;
let raf = 0;
let measureRaf = 0;

const DEBUG =
  typeof window !== "undefined" && /(?:^|[?&])debug=[^&]*\bspotlight\b/.test(window.location.search);
const log: SpotlightLogEntry[] = [];

function note(ev: SpotlightLogEntry["ev"], id?: string, extra: Partial<SpotlightLogEntry> = {}): void {
  if (!DEBUG) return;
  const e: SpotlightLogEntry = { t: Math.round(performance.now()), y: Math.round(window.scrollY), ev, id, ...extra };
  log.push(e);
  console.info(`[spotlight] ${ev}${id ? ` ${id}` : ""}${e.why ? ` (${e.why})` : ""} @y=${e.y}`);
}

function motionOff(): boolean {
  return motionOffNow() || document.documentElement.dataset.motion === "paused" || !window.matchMedia(DESKTOP_FINE).matches;
}

/* — scroll-star ranges (measured on register and on resize only) ———————— */

function measure(s: ScrollStar): void {
  const r = s.el.getBoundingClientRect();
  s.top = r.top + window.scrollY;
  s.bottom = r.bottom + window.scrollY;
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

/** The scroll star in the middle 60% (heaviest, then the most overlap). No layout reads. */
function ownerAt(y: number): ScrollStar | null {
  const b0 = y + BAND[0] * viewportH;
  const b1 = y + BAND[1] * viewportH;
  let best: ScrollStar | null = null;
  let bestScore = 0;
  for (const s of stars.values()) {
    const o = Math.min(s.bottom, b1) - Math.max(s.top, b0);
    if (o <= 0) continue;
    const score = s.weight * 1e6 + o;
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

function evaluate(): void {
  if (off) return;
  const next = ownerAt(window.scrollY);
  if (next !== owner) {
    if (next) note("own", next.id, { weight: next.weight });
    else if (owner) note("free", owner.id);
    owner = next;
  }
  tryGrant();
}

function onScroll(): void {
  // a needsIdle star that was idle and now races again waits for a new idle
  if (pending.size && scrollVelocity() >= IDLE.below) {
    for (const p of pending.values()) {
      if (p.needsIdle && p.idle) {
        p.idle = false;
        armIdle(p);
      }
    }
  }
  if (!raf) {
    raf = requestAnimationFrame(() => {
      raf = 0;
      evaluate();
    });
  }
}

function settle(p: Pending, a: SpotlightAnswer, why: string, remember = true): void {
  window.clearTimeout(p.timer);
  p.offIdle?.();
  p.io?.disconnect();
  pending.delete(p.id);
  if (remember) settled.set(p.id, a);
  note(a === "play" ? "grant" : "skip", p.id, { weight: p.weight, why });
  p.resolve(a);
}

function tryGrant(): void {
  if (off || hold || !pending.size) return;
  let p: Pending | null = null;
  for (const q of pending.values()) {
    if (q.needsIdle && !q.idle) continue;
    if (!p || q.weight > p.weight || (q.weight === p.weight && q.seq < p.seq)) p = q;
  }
  if (owner || !p) {
    for (const q of pending.values()) {
      if (q.waitLogged) continue;
      q.waitLogged = true;
      note("wait", q.id, { weight: q.weight, why: owner ? `owned by ${owner.id}` : "waiting for scroll-idle" });
    }
    return;
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
  tryGrant();
}

function armIdle(p: Pending): void {
  p.offIdle?.();
  p.offIdle = onScrollIdle(() => {
    p.offIdle = null;
    p.idle = true;
    note("idle", p.id);
    tryGrant();
  }, IDLE);
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
}

function wake(): void {
  if (!off || motionOff()) return;
  off = false;
  note("off", undefined, { why: "motion back on" });
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
        hold: hold?.id ?? null,
        pending: [...pending.keys()],
        stars: [...stars.values()].map((s) => ({ id: s.id, weight: s.weight, top: s.top, bottom: s.bottom })),
        settled: Object.fromEntries(settled),
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
    offIdle: null,
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
  if (p.needsIdle) armIdle(p);
  owner = ownerAt(window.scrollY);
  tryGrant();
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

export function registerScrollStar(id: string, el: Element, weight: BeatWeight): () => void {
  if (typeof window === "undefined") return () => {};
  start();
  const s: ScrollStar = { id, el, weight, top: 0, bottom: 0, seq: ++seq };
  measure(s);
  stars.set(id, s);
  evaluate();
  return () => {
    if (stars.get(id) !== s) return;
    stars.delete(id);
    if (owner === s) owner = null;
    evaluate();
  };
}
