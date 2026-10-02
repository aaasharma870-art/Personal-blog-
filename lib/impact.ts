/* ============================================================================
   IMPACT — "new world revealed" (PHASE3-SPEC §7.6): once per world per page
   view, a no-op under reduced motion or Pause. OWNER: W2-CARDS.
     shake    a WAAPI transform on the FRAME element only (`o.el`): a 3-step
              decaying jolt over 280 ms (px; never the page);
     flash    ONE white overlay opacity pulse inside `o.el` (120 ms; the GL
              tier pulses `uFlash` itself, so a GL-engaged card passes 0);
     bloomEv  an exposure bloom (HP Lumos): a warm-white additive overlay
              pulse of ≈ the EV's brightness (180 ms).
   One flash, never saturated red, never repeating (WCAG 2.3.1). It emits
   `impact` for sound (lib/audio's IMPACT_CUES) and the GL layer. Every
   pulse is transform / opacity on a layer that exists only for its run.
   ========================================================================== */

import { emit } from "./events";
import { motionOffNow, onMotionOffChange } from "./flags";
import type { WorldId } from "./worlds";

export type ImpactOptions = { el?: HTMLElement; shake?: number; flash?: number; bloomEv?: number };

const fired = new Set<WorldId>();

const live = new Set<Animation>();
let watching = false;

/** Track an impact-family animation (the shake, a pulse, the seam's chalk
 *  puff): a Pause or reduced motion cancels every live one in the same task
 *  (spec §12.2, ≤ 100 ms; W2 gate). */
export function trackImpactAnim(a: Animation): Animation {
  live.add(a);
  const drop = () => live.delete(a);
  a.finished.then(drop, drop);
  if (!watching) {
    watching = true;
    onMotionOffChange(() => {
      if (!motionOffNow()) return;
      live.forEach((x) => x.cancel());
      live.clear();
    });
  }
  return a;
}

const SHAKE_MS = 280;
const FLASH_MS = 120;
const BLOOM_MS = 180;

/** A decaying jolt on the frame (transform only; composed with nothing:
 *  the frame element itself carries no transform of its own). */
function shake(el: HTMLElement, px: number): void {
  if (typeof el.animate !== "function" || !(px > 0)) return;
  const a = el.animate(
    [
      { transform: "translate3d(0, 0, 0)" },
      { transform: `translate3d(${(-px).toFixed(2)}px, ${(px * 0.5).toFixed(2)}px, 0)`, offset: 0.12 },
      { transform: `translate3d(${(px * 0.66).toFixed(2)}px, ${(-px * 0.4).toFixed(2)}px, 0)`, offset: 0.34 },
      { transform: `translate3d(${(-px * 0.3).toFixed(2)}px, ${(px * 0.2).toFixed(2)}px, 0)`, offset: 0.6 },
      { transform: "translate3d(0, 0, 0)" },
    ],
    { duration: SHAKE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
  trackImpactAnim(a);
}

/** One overlay pulse inside `el` (removed when it ends). */
function pulse(el: HTMLElement, peak: number, ms: number, bloom: boolean): void {
  if (!(peak > 0) || typeof document === "undefined") return;
  const o = document.createElement("span");
  o.setAttribute("aria-hidden", "true");
  o.setAttribute("data-impact-pulse", bloom ? "bloom" : "flash");
  o.style.cssText =
    "position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;will-change:opacity;" +
    (bloom
      ? "background:radial-gradient(ellipse at 50% 45%, #fff6e0 0%, #ffe9c4 45%, rgba(255,233,196,.35) 100%);mix-blend-mode:plus-lighter;"
      : "background:#fff;");
  el.appendChild(o);
  const done = () => o.remove();
  if (typeof o.animate !== "function") return done();
  const a = o.animate(
    [{ opacity: 0 }, { opacity: peak, offset: 0.25 }, { opacity: 0 }],
    { duration: ms, easing: "ease-out" },
  );
  a.onfinish = done;
  a.oncancel = done;
  trackImpactAnim(a);
}

/** Fire `world`'s impact. true when it fired (first time this view, motion
 *  on); false when it already fired, motion is off, or on the server. */
export function impact(world: WorldId, o: ImpactOptions = {}): boolean {
  if (typeof window === "undefined" || motionOffNow() || fired.has(world)) return false;
  fired.add(world);
  emit("impact", { world });
  const el = o.el;
  if (el) {
    if (o.shake) shake(el, o.shake);
    if (o.flash) pulse(el, Math.min(0.2, o.flash), FLASH_MS, false);
    // +0.35 EV ≈ ×1.27 brightness: a .3 additive warm-white peak
    if (o.bloomEv) pulse(el, Math.min(0.4, (2 ** o.bloomEv - 1) * 1.1), BLOOM_MS, true);
  }
  return true;
}
