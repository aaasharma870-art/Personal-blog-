/* ============================================================================
   SPOTLIGHT (facade) — one star at runtime (PHASE3-SPEC §3.8; P3-11 r1 F1).
   Facade + lazy impl (DP-13): lib/spotlight-impl.ts loads on first use, on
   DESKTOP_FINE with motion on. Not DESKTOP_FINE, motion off, or the server
   → time stars answer "skip" at once and scroll stars are no-ops.

   THE RULE (one arbiter, both directions). At any instant at most one star
   performs. A SCROLL star performs while the reading position lies inside
   its PERFORMANCE WINDOW (below) and the page moves — or always while
   inside it, if it is `live` (it animates on its own: a loop, a timer). A
   TIME star performs while its grant is held (≤ 1.2 s, or until `release`).
     · A time star is granted only when no star performs AND no ungated
       scroll star's window begins within its hold at the current speed.
     · A GATED scroll star (`onOwn`, e.g. a scrub sentence) yields to time
       stars: when one is granted while it owns, or its window opens during
       a hold, it is told `onOwn(false)` and holds still; `onOwn(true)`
       when the hold ends. An ungated one moves with the scroll whatever
       happens (the log then honestly shows two), so it blocks grants while
       the page moves; once the page has been still for 300 ms a waiting
       time star may play over it.
     · Ownership ends with the window: a star never keeps the spotlight
       after its performance (r1 J1 #3).

   ── HOW A HOST DECLARES A SCROLL STAR ────────────────────────────────────
   0. Declare the beat in lib/page.ts (or lib/film.ts acts[].beats):
        { id: "B44-ink", at: 0, span: 80, kind: "signature", timing: "scroll",
          star: true, weight: 1, feature: "P3-11" }
   1. ATTRIBUTE (server markup, no client code). The desktop words binder
      (components/enhance/binders/words.ts) registers every element that
      carries `data-beat-star` + `data-beat-scroll`:
        <svg {...beatAttrs("B44-ink", { weight: 1, scroll: "top 85%, bottom 35%" })}>
      → data-beat="B44-ink" data-beat-star data-beat-weight="1"
        data-beat-scroll="top 85%, bottom 35%"   (+ data-beat-live with live: true)
   2. HOOK (a client host that also wants to know when it owns):
        useScrollStar(ref, "B44-ink", { weight: 1, own: "top 85%, bottom 35%",
          onOwn: (owned) => … })            // lib/spotlight-react.ts
   3. CALL (in an effect): const off = spotlight.registerScrollStar(id, el,
        weight, { own, live, onOwn }); return off;
   Existing hosts that register without a window get theirs from the table
   in lib/spotlight-windows.ts (one place for the integrator to tune).

   THE WINDOW ("own"): "<start>, <end>", each "[<selector>] <edge> <vp%>",
   ScrollTrigger-style: the star owns from the scroll position where <edge>
   of the element meets <vp%> of the viewport height (0% = viewport top)
   to the one where the end edge does. <edge> = top | center | bottom |
   <n>% of the element's height; <vp%> may be < 0 or > 100. An optional
   leading CSS selector (no commas) measures another element instead (e.g.
   "center 50%, #journey-step-3 center 50%"). The box is measured on
   register and on resize, never per frame; a sticky element is measured
   from its parent's top (its natural place). No window: "top 80%, bottom
   20%" (the old middle-60 % band). Scrub sentences use "top 92%, bottom
   52%", the card markers "top 50%, bottom 50%".

   TIME STARS: `request(id, { weight, needsIdle?, maxWait = 1500,
   durationMs })` → "play" | "skip" ("skip" = show the end state). Hosts
   start their animation only on "play" and should `release(id)` when it
   visibly ends. needsIdle (invites, fly-throughs) waits for reading pace
   (< 300 px/s averaged, for 600 ms) and for the host to stay in view.

   `?debug=spotlight` logs to window.__spotlight.log (own/free carry `how`:
   "scrub" | "live"); tools/capture/clips.mjs counts a scrub star only while
   the page moves inside its window.
   ========================================================================== */

import { DESKTOP_FINE, motionOffNow } from "./flags";
import type { BeatWeight } from "./beats";

export type SpotlightRequest = { weight: BeatWeight; needsIdle?: boolean; maxWait?: number; durationMs?: number };
export type SpotlightAnswer = "play" | "skip";
/** A scroll star's performance window and kind (see the header). */
export type ScrollStarOptions = {
  /** "<start>, <end>" (header: THE WINDOW). Default: the element's
   *  `data-beat-scroll`, then lib/spotlight-windows.ts, then the band. */
  own?: string;
  /** It animates on its own while owned (a loop), not only with the scroll. */
  live?: boolean;
  /** GATED: told when it gains / loses the spotlight; it waits out a hold. */
  onOwn?: (owned: boolean) => void;
};

type Impl = typeof import("./spotlight-impl");
let impl: Impl | null = null;
let loading: Promise<Impl> | null = null;

function eligible(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_FINE).matches && !motionOffNow();
}

function load(): Promise<Impl> {
  if (!loading) {
    loading = import("./spotlight-impl").then((m) => (impl = m));
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

// ?debug=spotlight: load the impl up front so the probes find window.__spotlight
if (typeof window !== "undefined" && /[?&]debug=[^&]*spotlight/.test(window.location.search)) {
  window.setTimeout(() => {
    if (eligible()) void load();
  }, 0);
}

export const spotlight = {
  request(id: string, o: SpotlightRequest): Promise<SpotlightAnswer> {
    if (!eligible()) return Promise.resolve("skip");
    return load().then(
      (m) => m.request(id, o),
      (): SpotlightAnswer => "skip",
    );
  },
  release(id: string): void {
    impl?.release(id);
  },
  registerScrollStar(id: string, el: Element, weight: BeatWeight, o?: ScrollStarOptions): () => void {
    if (!eligible()) return () => {};
    let off: (() => void) | null = null;
    let cancelled = false;
    load().then(
      (m) => {
        if (!cancelled) off = m.registerScrollStar(id, el, weight, o);
      },
      () => {},
    );
    return () => {
      cancelled = true;
      off?.();
    };
  },
};
