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
     Save-Data, not slow-2g/2g/3g.
   Every storage read is in try/catch; a throw means "no aperture" (S2).
   The content is never gated: only the decorative plate is clipped, the h1
   and CTA are final from first paint, and a failsafe re-opens the plate if
   the page never hydrates (the hero clears the timer when it takes over).

   Shipped as the innerHTML of a hidden <div> (not a React <script>): the
   parser runs it on first load, while a client re-render (the reduced-motion
   remount in MotionProvider) re-inserts it inert and without React's
   script-tag warning. Same markup on server and client: hydration-safe.
   ========================================================================== */

/** Must match lib/session.ts ONCE_PREFIX (the once-per-session store). */
const ONCE_PREFIX = "once:";

const SOURCE = `(function(C){try{var s=document.currentScript,e=s&&s.closest?s.closest("[data-hero]"):null;if(!e)return;var w=window,R=document.documentElement;if(R.classList.contains("intro-armed")||location.hash)return;if(w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var S=w.sessionStorage;if(S.getItem("motion")==="paused"||S.getItem(C.key)==="1")return;var q=new URLSearchParams(location.search);if(q.has("skip")){var v=q.getAll("skip").join(",").toLowerCase().split(",").filter(Boolean);if(!v.length||v.indexOf("all")>=0||v.indexOf("hero")>=0)return}var n=navigator.connection;if(n&&(n.saveData||/2g$|^3g$/.test(n.effectiveType||"")))return;e.setAttribute("data-aperture","pending");w.__heroApertureFailsafe=setTimeout(function(){if(e.getAttribute("data-aperture")==="pending")e.removeAttribute("data-aperture")},C.failsafe)}catch(x){}})(__CFG__);`;

/** The innerHTML of the hero's boot <div>: one inline script. */
export function heroBootHtml({ onceKey, failsafeMs }: { onceKey: string; failsafeMs: number }): string {
  const cfg = JSON.stringify({ key: ONCE_PREFIX + onceKey, failsafe: failsafeMs }).replace(
    /</g,
    "\\u003c",
  );
  return `<script>${SOURCE.replace("__CFG__", cfg)}</script>`;
}

/** The window slot the script parks its failsafe timer in. */
export const FAILSAFE_SLOT = "__heroApertureFailsafe";
