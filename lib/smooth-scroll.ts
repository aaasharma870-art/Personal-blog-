/* ============================================================================
   SMOOTH SCROLL — the Lenis store and every scroll helper (PHASE3-SPEC §3.1,
   §11.3). No Lenis import here: <SmoothScroll/> (components/providers/
   smooth-scroll.tsx) creates the one instance as ladder step 1 (DESKTOP_FINE,
   motion on, home page, after the intro's quiet window) and hands it over
   with `setLenis()`. Everything below works with or without it, so phones,
   touch tablets, reduced motion and Pause keep native scroll.

   - scrollToTarget(): every programmatic jump (anchors, palette, eggs, the
     Time-Turner, the fast lane, the chapter select). Native `scrollTo` when
     there is no Lenis (instant under reduced motion / Pause), `lenis.scrollTo
     (y, { force })` when there is. `#act-n` lands at the act's `landAt` share
     of the card's pinned travel. Jumps longer than 3 viewports never glide
     (≥ 64rem): they are immediate, wrapped in the cut (<CutOverlay/>), and
     the target world's fonts are made ready during the cut's fade-in.
   - lockScroll()/unlockScroll(): the modal lock (body overflow + lenis.stop).
   - requestScrollRefresh(): 200 ms debounced `lenis.resize()` +
     `ScrollTrigger.sort()/refresh()`, deferred while Lenis glides.
   - scrollVelocity() / onScrollIdle(): read from native scroll events, so
     they are the same with or without Lenis.
   Client only; every function is a no-op on the server.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit } from "./events";
import { film, type ActSpec } from "./film";
import { DESKTOP_FINE, DESKTOP_WIDE, motionOffNow } from "./flags";
import { gsapIfLoaded } from "./gsap";
import { actCards } from "./sections";
import { markWorldFontsReady } from "./world-fonts";
import { WORLD_IDS, type WorldId } from "./worlds";

/** The subset of Lenis 1.3's `scrollTo` options this page uses. */
export type LenisScrollOptions = {
  offset?: number;
  immediate?: boolean;
  lock?: boolean;
  duration?: number;
  force?: boolean;
  onComplete?: () => void;
};

/** What the page reads from the Lenis instance (a Lenis is assignable). */
export type LenisLike = {
  scrollTo(t: number | string | HTMLElement, o?: LenisScrollOptions): void;
  stop(): void;
  start(): void;
  resize(): void;
  /** Lenis 1.3 types this `boolean | "native" | "smooth"` (false at rest). */
  readonly isScrolling: boolean | "smooth" | "native";
  readonly velocity: number;
  readonly actualScroll: number;
};

export type ScrollTarget = string | Element | number;
export type ScrollToTargetOptions = {
  block?: "start" | "center" | "nearest";
  /** Focus the target's heading (or the target, tabindex -1) on arrival. */
  focus?: boolean;
  /** pushState for link clicks, replaceState for programmatic jumps. */
  history?: "push" | "replace" | false;
  immediate?: boolean;
  /** Wrap the jump in the cut (§11.3). Implies immediate. Reduced motion /
   *  Pause: an instant jump with no overlay. */
  cut?: boolean;
};

/** The cut (components/director/cut-overlay.tsx): fade the deep layer in
 *  (140 ms) while `ready` settles, call `jump()`, resolve, fade out (220 ms)
 *  in the background. */
export type CutRunner = (ready: Promise<void>, jump: () => void) => Promise<void>;

const noop = () => {};
/** A jump longer than this many viewports never glides (spec §3.1). */
const LONG_JUMP_VIEWPORTS = 3;
/** How long a jump waits for a closing modal to release its lock. */
const UNLOCK_WAIT_MS = 400;
/** A refresh waits for a glide to end, at most this long. */
const REFRESH_DEFER_MAX_MS = 3000;

/* — the instance ———————————————————————————————————————————————————— */

let lenis: LenisLike | null = null;
const lenisListeners = new Set<() => void>();

/** <SmoothScroll/> only: register (or clear) the one Lenis instance. */
export function setLenis(next: LenisLike | null): void {
  lenis = next;
  if (typeof window !== "undefined") {
    if (next) window.__lenis = next;
    else delete window.__lenis;
  }
  lenisListeners.forEach((l) => l());
}

export function getLenis(): LenisLike | null {
  return lenis;
}

function subscribeLenis(onChange: () => void): () => void {
  lenisListeners.add(onChange);
  return () => lenisListeners.delete(onChange);
}

/** The Lenis instance (null on the server, during hydration and whenever
 *  smooth scroll is off). */
export function useLenis(): LenisLike | null {
  return useSyncExternalStore(subscribeLenis, getLenis, () => null);
}

/** Stop a Lenis glide in place so a native scroll (keyboard, focus,
 *  find-in-page, the intro replay's scrollTo(0)) is never overridden on the
 *  next frame. `reset()` is private in Lenis 1.3: stop()+start() runs it
 *  (only while no modal holds the lock, since start() would release it). */
export function haltGlide(): void {
  const l = lenis;
  if (!l || l.isScrolling !== "smooth") return;
  if (lockOwners.size === 0) {
    l.stop();
    l.start();
  } else {
    l.scrollTo(l.actualScroll, { immediate: true, force: true });
  }
}

/* — the cut ————————————————————————————————————————————————————————— */

let cutRunner: CutRunner | null = null;

/** <CutOverlay/> only: register the cut. Returns the unregister. */
export function setCutRunner(run: CutRunner | null): () => void {
  cutRunner = run;
  return () => {
    if (cutRunner === run) cutRunner = null;
  };
}

/* — geometry ———————————————————————————————————————————————————————— */

const px = (v: string | null | undefined): number => {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

const maxScroll = (): number => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const clampY = (y: number): number => Math.min(Math.max(0, y), maxScroll());

function resolveTarget(t: string | Element): Element | null {
  if (typeof t !== "string") return t;
  let id = t.startsWith("#") ? t.slice(1) : t;
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep the raw id */
  }
  return id ? document.getElementById(id) : null;
}

/** The pin wrapper of an act card (the p target, W2-CARDS): the sticky
 *  stage's own box. The opening's program block is a SIBLING after it
 *  inside the section, so the section's height is not the travel. */
function cardPin(card: HTMLElement): HTMLElement {
  return card.querySelector<HTMLElement>(":scope > [data-act-card-pin]") ?? card;
}

/** The pinned travel of an act card in px: its pin wrapper's height beyond
 *  the sticky stage (0 when it does not pin: phones, reduced motion, no JS). */
function cardTravel(card: HTMLElement): number {
  const stage = card.querySelector<HTMLElement>("[data-card-stage], .act-card-stage");
  if (!stage || getComputedStyle(stage).position !== "sticky") return 0;
  const pin = cardPin(card);
  return Math.max(0, pin.offsetHeight - stage.offsetHeight);
}

/** `#act-n` → the card's top + landAt × travel (spec §7.1: land on the new
 *  world fully shown, never on a dark p 0). Null when it does not apply. */
function landAtY(el: Element): number | null {
  if (!(el instanceof HTMLElement) || !el.id || !el.hasAttribute("data-act-card")) return null;
  const card = actCards.find((c) => c.id === el.id);
  if (!card) return null;
  const landAt = (film.acts as readonly ActSpec[]).find((a) => a.id === card.act)?.landAt;
  if (landAt == null || !(landAt > 0)) return null;
  const travel = cardTravel(el);
  if (travel <= 0) return null;
  return cardPin(el).getBoundingClientRect().top + window.scrollY + Math.min(1, landAt) * travel;
}

/** The page y that puts `el` where `block` says, with the native anchor
 *  offset (the target's scroll-margin-top + the root's scroll-padding-top). */
function targetY(el: Element, block: "start" | "center" | "nearest"): number {
  const land = landAtY(el);
  if (land != null) return land;
  const r = el.getBoundingClientRect();
  const y0 = window.scrollY;
  const vh = window.innerHeight;
  const cs = getComputedStyle(el);
  const pad = px(cs.scrollMarginTop) + px(getComputedStyle(document.documentElement).scrollPaddingTop);
  if (block === "center") return r.top + y0 - (vh - r.height) / 2;
  if (block === "nearest") {
    if (r.top >= pad && r.bottom <= vh) return y0; // already in view
    if (r.top < pad || r.height > vh - pad) return r.top + y0 - pad;
    return r.bottom + y0 - vh + px(cs.scrollMarginBottom);
  }
  return r.top + y0 - pad;
}

const FILM_WORLDS: ReadonlySet<string> = new Set(WORLD_IDS.filter((w) => w !== "house"));

/** The cut's readiness: the target world's fonts (≤ 300 ms, B1-TYPE). */
function cutReady(el: Element | null): Promise<void> {
  const w = el?.closest("[data-world]")?.getAttribute("data-world");
  if (!w || !FILM_WORLDS.has(w)) return Promise.resolve();
  return markWorldFontsReady(w as WorldId).catch(noop);
}

/* — history + focus ——————————————————————————————————————————————— */

function writeHistory(mode: "push" | "replace", id: string): void {
  const url = `#${id}`;
  try {
    if (mode === "push" && window.location.hash !== url) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  } catch {
    /* a sandboxed frame may refuse history writes: the jump still happens */
  }
}

const FOCUSABLE = "a[href], button, input, select, textarea, summary, [tabindex]";
const shown = (e: Element): boolean => e.getClientRects().length > 0;

/** Focus the target (when it is focusable) or its first visible heading,
 *  else the target itself with a temporary tabindex=-1 (removed on blur). */
function focusOn(el: Element): void {
  let target: Element | null = el.matches(FOCUSABLE) ? el : null;
  if (!target) {
    if (el.matches("h1, h2, h3")) target = el;
    else target = Array.from(el.querySelectorAll("h1, h2, h3")).find(shown) ?? el;
  }
  if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
  const t = target;
  if (!t.matches(FOCUSABLE)) {
    t.setAttribute("tabindex", "-1");
    t.addEventListener("blur", () => t.removeAttribute("tabindex"), { once: true });
  }
  t.focus({ preventScroll: true });
}

/* — arrival ————————————————————————————————————————————————————————— */

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));

/** At `y` (within 2 px): a glide that was interrupted did not arrive. */
const arrivedAt = (y: number): boolean => Math.abs(window.scrollY - y) < 2;

const USER_SCROLL_INPUT = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/** A native smooth scroll has ended: `scrollend`, or a cap (Safari has
 *  no scrollend; a zero-length scroll fires none). Resolves `false` when
 *  the visitor took over (wheel, touch, pointer, key) and the page is not
 *  at `y`: an interrupted scroll never moves focus off screen. A slow but
 *  uninterrupted scroll still counts as arrived (the skip link's focus). */
function nativeArrival(y: number): Promise<boolean> {
  if (Math.abs(window.scrollY - y) < 1) return nextFrame().then(() => true);
  return new Promise<boolean>((resolve) => {
    let interrupted = false;
    const took = () => {
      interrupted = true;
    };
    const opts = { capture: true, passive: true } as const;
    const finish = () => {
      window.removeEventListener("scrollend", finish);
      for (const ev of USER_SCROLL_INPUT) window.removeEventListener(ev, took, opts);
      clearTimeout(timer);
      resolve(!interrupted || arrivedAt(y));
    };
    const timer = setTimeout(finish, 1500);
    window.addEventListener("scrollend", finish);
    for (const ev of USER_SCROLL_INPUT) window.addEventListener(ev, took, opts);
  });
}

/** A Lenis glide to `y`: resolves on completion, or as soon as the glide is
 *  interrupted (a wheel, a newer jump, Lenis destroyed), capped at 4 s.
 *  Resolves `true` only when it arrived (onComplete, or the page is at `y`):
 *  an interrupted glide never moves focus to an off-screen target. */
function lenisGlide(l: LenisLike, y: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let done = false;
    let started = false;
    const finish = (completed: boolean) => {
      if (done) return;
      done = true;
      clearInterval(poll);
      clearTimeout(cap);
      resolve(completed || arrivedAt(y));
    };
    const poll = setInterval(() => {
      if (lenis !== l) return finish(false);
      if (l.isScrolling === "smooth") started = true;
      else if (started) finish(false);
    }, 100);
    const cap = setTimeout(() => finish(false), 4000);
    l.scrollTo(y, { force: true, onComplete: () => finish(true) });
  });
}

/* — jumps ——————————————————————————————————————————————————————————— */

let jumpSeq = 0;

/** Scroll to an element, an id ("#about" or "about") or a page y. Resolves
 *  on arrival (and after the focus move). Unknown targets resolve at once.
 *  A newer jump supersedes an older one (the older skips its focus). */
export async function scrollToTarget(t: ScrollTarget, o: ScrollToTargetOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;
  const el = typeof t === "number" ? null : resolveTarget(t);
  if (typeof t !== "number" && !el) return;
  const seq = ++jumpSeq;

  // a closing modal (menu, palette, map) releases its lock first: Lenis's
  // start() would cancel a glide begun while it was stopped
  await whenUnlocked();
  if (seq !== jumpSeq) return;

  const l = lenis;
  const off = motionOffNow();
  const y = clampY(el ? targetY(el, o.block ?? "start") : (t as number));
  const wide = window.matchMedia(DESKTOP_WIDE).matches;
  const long = (l !== null || wide) && Math.abs(y - window.scrollY) > LONG_JUMP_VIEWPORTS * window.innerHeight;
  const wantsCut = Boolean(o.cut) || long;
  const immediate = off || Boolean(o.immediate) || wantsCut;

  if (o.history && el?.id) writeHistory(o.history, el.id);

  if (immediate) {
    const jump = () => {
      // a newer jump owns the page: a superseded cut never lands
      if (seq !== jumpSeq) return;
      // measured now, not before the cut: the fonts readied during the
      // fade-in (and any chapter above the target) may have re-flowed
      const yy = el ? clampY(targetY(el, o.block ?? "start")) : y;
      if (l && lenis === l) l.scrollTo(yy, { immediate: true, force: true });
      else window.scrollTo({ top: yy, behavior: "instant" });
      gsapIfLoaded()?.ScrollTrigger.update();
      // cards set their damped p to the raw value: no catch-up after a cut
      emit("scroll:jump", { y: yy, immediate: true });
    };
    const runner = cutRunner;
    // the overlay is motion: DESKTOP_FINE only (spec §1.2). A wide touch
    // screen keeps the instant jump without the fade.
    if (wantsCut && !off && runner && window.matchMedia(DESKTOP_FINE).matches) await runner(cutReady(el), jump);
    else {
      if (o.cut) await cutReady(el);
      jump();
    }
    if (o.focus && el && seq === jumpSeq) focusOn(el);
    await nextFrame();
    return;
  }

  emit("scroll:jump", { y, immediate: false });
  let arrived: boolean;
  if (l) arrived = await lenisGlide(l, y);
  else {
    window.scrollTo({ top: y, behavior: "smooth" });
    arrived = await nativeArrival(y);
  }
  if (o.focus && el && arrived && seq === jumpSeq) focusOn(el);
}

/* — locks (ref-counted by owner) ——————————————————————————————————— */

const lockOwners = new Set<string>();
const unlockWaiters = new Set<() => void>();
let savedOverflow = "";

/** Lock page scroll for `owner` (menu, palette, map dialog …): the body
 *  stops scrolling and Lenis stops (a wheel over the backdrop is swallowed;
 *  `[data-lenis-prevent]` scrollers inside still scroll natively). */
export function lockScroll(owner: string): void {
  if (typeof document === "undefined" || lockOwners.has(owner)) return;
  lockOwners.add(owner);
  if (lockOwners.size !== 1) return;
  savedOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  lenis?.stop();
}

/** Release `owner`'s lock; the page scrolls again when no owner is left. */
export function unlockScroll(owner: string): void {
  if (typeof document === "undefined" || !lockOwners.delete(owner) || lockOwners.size) return;
  document.body.style.overflow = savedOverflow;
  savedOverflow = "";
  lenis?.start();
  const waiters = [...unlockWaiters];
  unlockWaiters.clear();
  waiters.forEach((w) => w());
}

function whenUnlocked(): Promise<void> {
  if (!lockOwners.size) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      unlockWaiters.delete(done);
      resolve();
    };
    const timer = setTimeout(done, UNLOCK_WAIT_MS);
    unlockWaiters.add(done);
  });
}

/* — refresh ————————————————————————————————————————————————————————— */

let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let deferredSince = 0;
let refreshedWithTriggers = false;
let userScrolled = false;
let inputTracked = false;

/** Note any scroll the visitor makes themself (wheel, touch, keys), so the
 *  one-time hash re-apply never yanks them back. <SmoothScroll/> calls it
 *  at mount; idempotent. */
export function trackScrollInput(): void {
  if (inputTracked || typeof window === "undefined") return;
  inputTracked = true;
  const mark = () => {
    userScrolled = true;
    window.removeEventListener("wheel", mark, true);
    window.removeEventListener("touchmove", mark, true);
    window.removeEventListener("keydown", onKey, true);
  };
  const onKey = (e: KeyboardEvent) => {
    if (/^(PageUp|PageDown|ArrowUp|ArrowDown|Home|End| |Spacebar)$/.test(e.key)) mark();
  };
  window.addEventListener("wheel", mark, { capture: true, passive: true });
  window.addEventListener("touchmove", mark, { capture: true, passive: true });
  window.addEventListener("keydown", onKey, { capture: true, passive: true });
}

/** After the first refresh that measured ScrollTriggers, put a hash target
 *  back where the browser's load-time jump put it (pins may have moved it),
 *  unless the visitor has scrolled away since. */
function reapplyHash(): void {
  const hash = window.location.hash;
  if (!hash || hash === "#" || userScrolled) return;
  const el = resolveTarget(hash);
  if (!el) return;
  const y = clampY(targetY(el, "start"));
  if (Math.abs(y - window.scrollY) > window.innerHeight * 1.5) return;
  void scrollToTarget(el, { immediate: true, history: false });
}

function runRefresh(): void {
  const l = lenis;
  if (l && l.isScrolling === "smooth") {
    const now = performance.now();
    if (!deferredSince) deferredSince = now;
    if (now - deferredSince < REFRESH_DEFER_MAX_MS) {
      refreshTimer = setTimeout(runRefresh, 200);
      return;
    }
  }
  deferredSince = 0;
  l?.resize();
  const kit = gsapIfLoaded();
  if (!kit) return;
  // page order first (sections hydrate out of order, one Suspense each):
  // refreshPriority ties fall back to each trigger's position on the page
  kit.ScrollTrigger.sort();
  kit.ScrollTrigger.refresh();
  if (!refreshedWithTriggers && kit.ScrollTrigger.getAll().length) {
    refreshedWithTriggers = true;
    reapplyHash();
  }
}

/** Debounced (200 ms) re-measure after a layout change: `lenis.resize()`,
 *  then `ScrollTrigger.sort()` + `refresh()` (when GSAP is loaded), deferred
 *  while Lenis glides. Collapses, the stage mount, late media, font swaps
 *  and the ladder call it. */
export function requestScrollRefresh(): void {
  if (typeof window === "undefined") return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(runRefresh, 200);
}

/* — velocity + idle ————————————————————————————————————————————————— */

const sample = { y: 0, t: 0, v: 0, on: false };

function ensureSampler(): void {
  if (sample.on || typeof window === "undefined") return;
  sample.on = true;
  sample.y = window.scrollY;
  sample.t = performance.now();
  window.addEventListener(
    "scroll",
    () => {
      const now = performance.now();
      const dt = now - sample.t;
      if (dt > 0) sample.v = ((window.scrollY - sample.y) / dt) * 1000;
      sample.y = window.scrollY;
      sample.t = now;
    },
    { passive: true },
  );
}

/** Current scroll speed in px/s (0 at rest; measured from scroll events,
 *  so it is the same with or without Lenis). */
export function scrollVelocity(): number {
  if (typeof window === "undefined") return 0;
  ensureSampler();
  return performance.now() - sample.t > 120 ? 0 : Math.abs(sample.v);
}

/** Call `fn` ONCE, when the page has not scrolled (or wheeled) for `ms`
 *  (default 150) — with `below`, a scroll slower than `below` px/s does not
 *  reset the wait. Returns a cancel function. */
export function onScrollIdle(fn: () => void, o: { ms?: number; below?: number } = {}): () => void {
  if (typeof window === "undefined") return noop;
  ensureSampler();
  const ms = o.ms ?? 150;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    clearTimeout(timer);
    timer = setTimeout(fire, ms);
  };
  const onMove = () => {
    if (o.below != null && scrollVelocity() < o.below) return;
    arm();
  };
  const stop = () => {
    clearTimeout(timer);
    window.removeEventListener("scroll", onMove);
    window.removeEventListener("wheel", onMove);
  };
  function fire() {
    stop();
    fn();
  }
  window.addEventListener("scroll", onMove, { passive: true });
  window.addEventListener("wheel", onMove, { passive: true });
  arm();
  return stop;
}
