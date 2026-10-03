/* ============================================================================
   SMOOTH SCROLL — THE JUMPS (PHASE3-SPEC §3.1, §11.3; the lazy half of
   lib/smooth-scroll.ts, off the first load): scrollToTarget()'s body — the
   cut, the glide, the arrival, the focus move and the history write.
   Loaded by lib/smooth-scroll.ts `loadJumps()` on the first jump; the
   desktop smooth-scroll chunk prefetches it (ladder), the fast lane warms
   it on hover / focus and the intro's end warms it for the intro's fast
   lane. Client only.
   ========================================================================== */

import { emit } from "./events";
import { DESKTOP_FINE, DESKTOP_WIDE, motionOffNow } from "./flags";
import { gsapIfLoaded } from "./gsap";
import {
  clampY,
  dropHashHold,
  getCutRunner,
  getLenis,
  resolveTarget,
  targetY,
  whenUnlocked,
  type LenisLike,
  type ScrollTarget,
  type ScrollToTargetOptions,
} from "./smooth-scroll";
import { markWorldFontsReady } from "./world-fonts";
import { WORLD_IDS, type WorldId } from "./worlds";

const noop = () => {};
/** A jump longer than this many viewports never glides (spec §3.1). */
const LONG_JUMP_VIEWPORTS = 3;

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
      if (getLenis() !== l) return finish(false);
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
  const el = typeof t === "number" ? null : resolveTarget(t);
  if (typeof t !== "number" && !el) return;
  const seq = ++jumpSeq;
  // an explicit jump supersedes the load-time hash
  dropHashHold();

  // a closing modal (menu, palette, map) releases its lock first: Lenis's
  // start() would cancel a glide begun while it was stopped
  await whenUnlocked();
  if (seq !== jumpSeq) return;

  const l = getLenis();
  const off = motionOffNow();
  const y = clampY(el ? targetY(el, o.block ?? "start") : (t as number));
  const wide = window.matchMedia(DESKTOP_WIDE).matches;
  const long = (l !== null || wide) && Math.abs(y - window.scrollY) > LONG_JUMP_VIEWPORTS * window.innerHeight;
  const wantsCut = Boolean(o.cut) || long;
  const immediate = off || Boolean(o.immediate) || wantsCut;

  if (o.history && el?.id) writeHistory(o.history, el.id);

  if (immediate) {
    const runner = getCutRunner();
    // the overlay is motion: DESKTOP_FINE only (spec §1.2). A wide touch
    // screen keeps the instant jump without the fade.
    const viaCut = wantsCut && !off && runner !== null && window.matchMedia(DESKTOP_FINE).matches;
    // the target world's fonts start loading now (the click)
    let ready = viaCut || o.cut ? cutReady(el) : null;
    let yy = y;
    /** The immediate scroll; false when a newer jump owns the page (a
     *  superseded cut never lands). Measured now, not before the cut: the
     *  fade-in (and any chapter above the target) may have re-flowed. */
    const land = (): boolean => {
      if (seq !== jumpSeq) return false;
      const next = el ? clampY(targetY(el, o.block ?? "start")) : y;
      if (next !== yy || Math.abs(next - window.scrollY) >= 1) {
        yy = next;
        if (l && getLenis() === l) l.scrollTo(yy, { immediate: true, force: true });
        else window.scrollTo({ top: yy, behavior: "instant" });
      }
      return true;
    };
    // spec §11.3, the fast lane lands focused ≤ 400 ms: through the cut the
    // focus moves at the click (preventScroll: the target is reached under
    // the fade-in), so a slow jump frame never delays it; otherwise right
    // after the scroll. Either way before the font wait and the trigger
    // update (inside the cut the fonts swap under the layer, then re-land).
    let focused = !o.focus || !el;
    const focus = () => {
      if (focused || seq !== jumpSeq) return;
      focused = true;
      focusOn(el!);
    };
    if (viaCut) focus();
    const jump = async (): Promise<void> => {
      if (!land()) return;
      focus();
      if (ready) {
        await ready;
        if (!land()) return;
      }
      gsapIfLoaded()?.ScrollTrigger.update();
      // cards set their damped p to the raw value: no catch-up after a cut
      emit("scroll:jump", { y: yy, immediate: true });
    };
    if (viaCut) await runner(jump);
    else {
      // no layer to hide a swap: the fonts first
      if (ready) await ready;
      ready = null;
      await jump();
    }
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
