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
   - runs the failsafe (bar I5): if the controller has not set
     window.__introReady in time, `intro-armed` is removed and the SSR page
     shows. The clock (3 s; 20 s under `next dev`, lib/motion.ts) starts when
     the script is injected AND restarts when the controller script has
     loaded; a script that fails to load ends it at once (a broken network
     never blocks the visitor). Oct 20, fix5: a failsafe end does NOT write
     `intro-seen`, so a reload tries the intro again (it used to skip it for
     the rest of the tab after one slow cold start);
   - until the controller is ready: Escape, Skip, a wheel / touch scroll or a
     scroll key dismisses at once (declining always costs one key), and a
     Play press is queued for the controller. The fast lane ("Skip to the
     research", #intro-fastlane) dismisses too and lets the browser follow
     its hash (reason "fastlane-early": IntroBridge does not jump again),
     with `scroll-behavior: auto` inline for that one jump: the fast lane
     never glides through 20 screens (PHASE3-SPEC §11.3).
   - any early end also closes the quiet window ("intro:quiet-end", the
     lib/events.ts bus), so nothing waits on an intro that never ran.
   - resolves the intro's VARIANT pieces (M1.5; ./variant-snippet.ts: the
     manifest choice + ?variant=…) before the first paint: html gets
     `intro-alt-<piece>` for each piece playing its ALT (play, flight,
     codeflight, landing), and window.__introV = { "<key>": variant } is what
     the controller plays (the hero plate's variant rides along: the flight
     is registered to the default plate only).
   window.__intro.replay() is the header's "Replay intro" button, the menu's
   replay row, the palette's "Watch the intro again" (I33) and the closing
   "Mischief managed / Play it again" button (all of them through
   components/site/dock-actions.ts `replayIntro()`). Oct 22: a replay is a
   brand-new visit, not a re-arm of this page. It clears intro-seen, leaves a
   one-shot marker (sessionStorage `intro-replay` = the time, honoured for
   30 s, read and removed at the next boot), scrolls to the top and REPLACES
   the location with the clean home URL (no hash, no ?skip / ?intro; other
   query parameters such as ?variant= stay). The page then arms through the
   very same cold path as a first visit: fonts, hydration order, decoders, the
   flight's prefetch, the intro sound, the hero hand-off. (The in-page re-arm
   of the first run's controller used to carry that run's state into the
   replay.) The marker also forces the arming where a first visit would not
   (Save-Data / slow connection), as the in-page replay always did; it never
   overrides reduced motion or Pause, and a later plain reload finds no
   marker and intro-seen set, so it does not replay. Returns false if
   refused (reduced motion, Pause, storage blocked, already on the play
   screen); the caller then just goes to the top.
   ========================================================================== */

const SOURCE = `(function(w,d,C){var V=${VARIANT_JS},R=d.documentElement,K={PageDown:1,PageUp:1," ":1,Spacebar:1,ArrowDown:1,ArrowUp:1,Home:1,End:1},y0=null;
function ok(f){try{if(w.matchMedia("(prefers-reduced-motion: reduce)").matches)return 0;var s=w.sessionStorage;if(s.getItem("motion")==="paused")return 0;var q=new URLSearchParams(location.search);if(f||q.get("intro")==="1")return 1;if(C.paths.indexOf(location.pathname)<0)return 0;if(q.has("skip")){var v=q.getAll("skip").join(",").toLowerCase().split(",").filter(Boolean);if(!v.length||v.indexOf("all")>=0||v.indexOf("intro")>=0)return 0}if(location.hash)return 0;var n=navigator.connection;if(n&&(n.saveData||/2g$|^3g$/.test(n.effectiveType||"")))return 0;return s.getItem("intro-seen")==="1"?0:1}catch(e){return 0}}
function end(r){if(!R.classList.contains("intro-armed"))return;if(r==="fastlane-early"){R.style.scrollBehavior="auto";setTimeout(function(){requestAnimationFrame(function(){R.style.scrollBehavior=""})},0)}R.classList.remove("intro-armed");R.setAttribute("data-intro","skipped");if(r!=="failsafe")try{w.sessionStorage.setItem("intro-seen","1")}catch(x){}var h=r==="fastlane-early"?null:d.querySelector("main h1");if(h&&h.hasAttribute("tabindex"))try{h.focus({preventScroll:true})}catch(e){}try{w.dispatchEvent(new CustomEvent("intro:quiet-end"));w.dispatchEvent(new CustomEvent("intro:end",{detail:{played:false,reason:r}}))}catch(e){}}
function early(e){if(w.__introReady||!R.classList.contains("intro-armed"))return;var t=e.type,k=e.key,g=e.target;if(t==="touchstart"){y0=e.touches&&e.touches[0]?e.touches[0].clientY:null;return}if(t==="touchmove"&&(y0===null||!e.touches[0]||Math.abs(e.touches[0].clientY-y0)<10))return;if(t==="keydown"&&k!=="Escape"&&!K[k])return;if(t==="keydown"&&k===" "&&g&&g.closest&&g.closest("#intro button"))return;if(t==="wheel"&&e.ctrlKey)return;if(t==="click"){if(g&&g.closest&&g.closest("#intro-play")){w.__introQueued="play";return}if(g&&g.closest&&g.closest("#intro-fastlane")){end("fastlane-early");return}if(!(g&&g.closest&&g.closest("#intro-skip")))return}end(t==="click"?"skip":k==="Escape"?"esc":"scroll")}
var F=0;function fs(ms){clearTimeout(F);F=setTimeout(function(){if(!w.__introReady){w.__introFailed=1;end("failsafe")}},ms)}
function go(){var X=w.__introV={},k,a;for(k in C.v){a=X[k]=V(C.v,k);if(k.indexOf("intro.")===0)R.classList.toggle("intro-alt-"+k.slice(6),a==="alt")}R.classList.add("intro-armed");R.removeAttribute("data-intro");w.__introReady=false;w.__introQueued=null;try{performance.mark("intro:arm")}catch(e){}if(!d.getElementById("intro-ctl")){var s=d.createElement("script");s.id="intro-ctl";s.src=C.src;s.async=true;s.onload=function(){fs(C.failsafe)};s.onerror=function(){fs(0)};d.head.appendChild(s)}fs(C.failsafe)}
["keydown","wheel","touchstart","touchmove","click"].forEach(function(t){w.addEventListener(t,early,{capture:true,passive:true})});
function rp(){try{var s=w.sessionStorage,t=+s.getItem("intro-replay");if(!t)return 0;s.removeItem("intro-replay");return Date.now()-t<3e4&&C.paths.indexOf(location.pathname)>=0&&!location.hash&&!new URLSearchParams(location.search).has("skip")&&ok(1)?1:0}catch(e){return 0}}
function home(){var u=new URLSearchParams(location.search),q;u.delete("skip");u.delete("intro");q=u.toString();return C.paths[0]+(q?"?"+q:"")}
w.__intro={replay:function(){if(R.classList.contains("intro-armed")||!ok(1))return false;try{var s=w.sessionStorage;s.removeItem("intro-seen");s.setItem("intro-replay",String(Date.now()))}catch(e){return false}try{w.scrollTo({top:0,left:0,behavior:"instant"})}catch(e){w.scrollTo(0,0)}try{location.replace(home())}catch(e){return false}return true}};
var m=rp();if(ok(0)||m)go()})(window,document,__CFG__);`;

export function IntroHeadScript() {
  const cfg = JSON.stringify(introHeadConfig()).replace(/</g, "\\u003c");
  return (
    <script
      id="intro-arm"
      dangerouslySetInnerHTML={{ __html: SOURCE.replace("__CFG__", () => cfg) }}
    />
  );
}
