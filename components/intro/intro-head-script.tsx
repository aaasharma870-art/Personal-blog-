import { introHeadConfig } from "./intro-model";
import { VARIANT_JS } from "./variant-snippet";

/* ============================================================================
   The prologue's PRE-PAINT arming script (SPEC v2 §5.1; DESIGN v3 §6.5).
   Rendered inside <head> by app/layout.tsx ONLY when the prologue renders
   (introModel() !== null: film.enabled && prologue.enabled, plates usable,
   copy visible in this build), so a disabled prologue ships zero bytes.

   It runs synchronously while the HTML is parsed, before the first paint,
   and adds `html.intro-armed` only when EVERY condition holds:
     JS runs · prefers-reduced-motion is not `reduce` · the session is not
     Paused (sessionStorage motion=paused) · no ?skip / ?skip=all /
     ?skip=intro · no #hash · no Save-Data and not slow-2g/2g/3g ·
     sessionStorage intro-seen !== "1" · the route is one the prologue lands
     on ("/").
   Every storage read is in try/catch; a throw means DO NOT ARM (bar I6).
   `?intro=1` forces arming for QA (any route, ignores intro-seen / #hash /
   ?skip / Save-Data) — never under reduced motion or Pause.

   While armed it:
   - injects the controller (/intro/intro.js, async — zero bytes otherwise);
   - starts the 3000 ms failsafe: if the controller has not set
     window.__introReady by then, `intro-armed` is removed and the SSR page
     shows (bar I5);
   - until the controller is ready: Escape, Skip, a wheel / touch scroll or a
     scroll key dismisses at once (declining always costs one key), and a
     Play press is queued for the controller. The fast lane ("Skip to the
     research", #intro-fastlane) dismisses too and lets the browser follow
     its hash (reason "fastlane-early": IntroBridge does not jump again).
   - any early end also closes the quiet window ("intro:quiet-end", the
     lib/events.ts bus), so nothing waits on an intro that never ran.
   - resolves the intro's VARIANT pieces (M1.5; ./variant-snippet.ts: the
     manifest choice + ?variant=…) before the first paint: html gets
     `intro-alt-<piece>` for each piece playing its ALT (play, flight,
     codeflight, landing), and window.__introV = { "<key>": variant } is what
     the controller plays (the hero plate's variant rides along: the flight
     is registered to the default plate only).
   window.__intro.replay() is the palette's "Watch the intro again" (I33):
   clears intro-seen, returns to the top (the flight lands on the hero) and
   re-arms; never under reduced motion or Pause. Returns false if refused.
   ========================================================================== */

const SOURCE = `(function(w,d,C){var V=${VARIANT_JS},R=d.documentElement,K={PageDown:1,PageUp:1," ":1,Spacebar:1,ArrowDown:1,ArrowUp:1,Home:1,End:1},y0=null;
function ok(f){try{if(w.matchMedia("(prefers-reduced-motion: reduce)").matches)return 0;var s=w.sessionStorage;if(s.getItem("motion")==="paused")return 0;var q=new URLSearchParams(location.search);if(f||q.get("intro")==="1")return 1;if(C.paths.indexOf(location.pathname)<0)return 0;if(q.has("skip")){var v=q.getAll("skip").join(",").toLowerCase().split(",").filter(Boolean);if(!v.length||v.indexOf("all")>=0||v.indexOf("intro")>=0)return 0}if(location.hash)return 0;var n=navigator.connection;if(n&&(n.saveData||/2g$|^3g$/.test(n.effectiveType||"")))return 0;return s.getItem("intro-seen")==="1"?0:1}catch(e){return 0}}
function end(r){if(!R.classList.contains("intro-armed"))return;R.classList.remove("intro-armed");R.setAttribute("data-intro","skipped");try{w.sessionStorage.setItem("intro-seen","1")}catch(x){}var h=r==="fastlane-early"?null:d.querySelector("main h1");if(h&&h.hasAttribute("tabindex"))try{h.focus({preventScroll:true})}catch(e){}try{w.dispatchEvent(new CustomEvent("intro:quiet-end"));w.dispatchEvent(new CustomEvent("intro:end",{detail:{played:false,reason:r}}))}catch(e){}}
function early(e){if(w.__introReady||!R.classList.contains("intro-armed"))return;var t=e.type,k=e.key,g=e.target;if(t==="touchstart"){y0=e.touches&&e.touches[0]?e.touches[0].clientY:null;return}if(t==="touchmove"&&(y0===null||!e.touches[0]||Math.abs(e.touches[0].clientY-y0)<10))return;if(t==="keydown"&&k!=="Escape"&&!K[k])return;if(t==="keydown"&&k===" "&&g&&g.closest&&g.closest("#intro button"))return;if(t==="wheel"&&e.ctrlKey)return;if(t==="click"){if(g&&g.closest&&g.closest("#intro-play")){w.__introQueued="play";return}if(g&&g.closest&&g.closest("#intro-fastlane")){end("fastlane-early");return}if(!(g&&g.closest&&g.closest("#intro-skip")))return}end(t==="click"?"skip":k==="Escape"?"esc":"scroll")}
function go(){var X=w.__introV={},k,a;for(k in C.v){a=X[k]=V(C.v,k);if(k.indexOf("intro.")===0)R.classList.toggle("intro-alt-"+k.slice(6),a==="alt")}R.classList.add("intro-armed");R.removeAttribute("data-intro");w.__introReady=false;w.__introQueued=null;try{performance.mark("intro:arm")}catch(e){}if(w.__introCtl){w.__introCtl.arm();return}if(!d.getElementById("intro-ctl")){var s=d.createElement("script");s.id="intro-ctl";s.src=C.src;s.async=true;d.head.appendChild(s)}setTimeout(function(){if(!w.__introReady){w.__introFailed=1;end("failsafe")}},C.failsafe)}
["keydown","wheel","touchstart","touchmove","click"].forEach(function(t){w.addEventListener(t,early,{capture:true,passive:true})});
w.__intro={replay:function(){if(R.classList.contains("intro-armed")||!ok(1))return false;try{w.sessionStorage.removeItem("intro-seen")}catch(e){}try{w.scrollTo({top:0,left:0,behavior:"instant"})}catch(e){w.scrollTo(0,0)}w.__introReplay=1;go();return true}};
if(ok(0))go()})(window,document,__CFG__);`;

export function IntroHeadScript() {
  const cfg = JSON.stringify(introHeadConfig()).replace(/</g, "\\u003c");
  return (
    <script
      id="intro-arm"
      dangerouslySetInnerHTML={{ __html: SOURCE.replace("__CFG__", () => cfg) }}
    />
  );
}
