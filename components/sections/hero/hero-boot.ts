import { VARIANT_JS, type PrepaintVariants } from "@/components/intro/variant-snippet";

/* ============================================================================
   The hero's PRE-PAINT aperture arming (hero-lens.BAR S0; SPEC v2 §6
   "Aperture"). The D3 aperture opens the plate from a slit at the focal x,
   so the slit must be in place at FIRST PAINT — closing an image the reader
   already sees would be a flash. This inline script runs while the HTML is
   parsed, just before the hero's media markup, and marks the section
   `data-aperture="pending"` (CSS in app/globals.css, "hero & cards" block,
   clips both hero plates to the slit and hides the bracket halves) ONLY when
   every condition holds:
     motion is on (no prefers-reduced-motion, the session is not Paused) ·
     the prologue is NOT armed (`html.intro-armed`: the flight lands on an
     open Lens) · the aperture has not run this session (lib/session.ts
     `once:<key>`) · no ?skip / ?skip=all / ?skip=hero · no #hash · no
     Save-Data, not slow-2g/2g/3g · a viewport ≥ 640 px (M5: below it the
     portrait still IS the page's LCP image, and a slit held until hydration
     pushed mobile LCP to ~4 s on the skip / repeat path; phones get the
     final, open still from first paint — mobile gets stills).
   Every storage read is in try/catch; a throw means "no aperture" (S2).
   The content is never gated: only the decorative plate is clipped, the h1
   and CTA are final from first paint, and a failsafe re-opens the plate if
   the page never hydrates (the hero clears the timer when it takes over).

   VARIANT (M1.5, hero.aperture). The ALT "film-gate" opens the plate as a
   horizontal letterbox instead of the vertical slit, so its pre-paint state
   differs: the script resolves hero.aperture itself (manifest + ?variant=…;
   components/intro/variant-snippet.ts) and marks `data-aperture="gate"`,
   whose closed state (a zero-height band, the bracket halves hidden) it
   injects once into <head> as <style id="hero-gate-pre"> — React 19 skips
   foreign <head> nodes during hydration, and the rule lives with the hero.
   HeroStage reads the attribute (the kind the reader was shown) and runs
   the matching aperture.

   Shipped as the innerHTML of a hidden <div> (not a React <script>): the
   parser runs it on first load, while a client re-render (the reduced-motion
   remount in MotionProvider) re-inserts it inert and without React's
   script-tag warning. Same markup on server and client: hydration-safe.
   ========================================================================== */

/** Must match lib/session.ts ONCE_PREFIX (the once-per-session store). */
const ONCE_PREFIX = "once:";

/** The film gate's closed pre-paint state (the ALT twin of the globals.css
 *  "pending" rules): nothing of the plate shows, the halves wait. */
const GATE_CSS =
  '[data-hero][data-aperture="gate"] [data-hero-lens]>[data-lens]>div:first-child{clip-path:inset(50% 0 50% 0)!important}' +
  '[data-hero][data-aperture="gate"] [data-hero-lens]>[data-lens]>div:last-child{visibility:hidden}';

const SOURCE = `(function(C,V){try{var s=document.currentScript,e=s&&s.closest?s.closest("[data-hero]"):null;if(!e)return;var w=window,d=document,R=d.documentElement;if(R.classList.contains("intro-armed")||location.hash)return;if(!w.matchMedia("(min-width: 40rem)").matches)return;if(w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var S=w.sessionStorage;if(S.getItem("motion")==="paused"||S.getItem(C.key)==="1")return;var q=new URLSearchParams(location.search);if(q.has("skip")){var v=q.getAll("skip").join(",").toLowerCase().split(",").filter(Boolean);if(!v.length||v.indexOf("all")>=0||v.indexOf("hero")>=0)return}var n=navigator.connection;if(n&&(n.saveData||/2g$|^3g$/.test(n.effectiveType||"")))return;var g=V(C.v,"hero.aperture")==="alt";if(g&&!d.getElementById("hero-gate-pre")){var t=d.createElement("style");t.id="hero-gate-pre";t.textContent=C.css;d.head.appendChild(t)}e.setAttribute("data-aperture",g?"gate":"pending");w.__heroApertureFailsafe=setTimeout(function(){var a=e.getAttribute("data-aperture");if(a==="pending"||a==="gate")e.removeAttribute("data-aperture")},C.failsafe)}catch(x){}})(__CFG__,${VARIANT_JS});`;

/** The innerHTML of the hero's boot <div>: one inline script. `variants`
 *  carries hero.aperture's pre-paint data (prepaintVariants). */
export function heroBootHtml({
  onceKey,
  failsafeMs,
  variants,
}: {
  onceKey: string;
  failsafeMs: number;
  variants: PrepaintVariants;
}): string {
  const cfg = JSON.stringify({
    key: ONCE_PREFIX + onceKey,
    failsafe: failsafeMs,
    v: variants,
    css: GATE_CSS,
  }).replace(/</g, "\\u003c");
  return `<script>${SOURCE.replace("__CFG__", () => cfg)}</script>`;
}

/** The window slot the script parks its failsafe timer in. */
export const FAILSAFE_SLOT = "__heroApertureFailsafe";

/** The pre-paint aperture kinds (data-aperture): the DEFAULT slit, the ALT
 *  film gate. */
export type ApertureKind = "slit" | "gate";
export function apertureKindOf(attr: string | null): ApertureKind | null {
  return attr === "pending" ? "slit" : attr === "gate" ? "gate" : null;
}
