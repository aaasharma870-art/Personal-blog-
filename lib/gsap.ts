/* ============================================================================
   GSAP LOADER — the only way GSAP enters the page (PHASE3-SPEC §3.1).
   Dynamic `import()` only (never a top-level value import: gsap stays out of
   the `/` first-load chunks), loaded on DESKTOP_FINE with motion on by the
   callers (smooth scroll at ladder step 1, useScrollScene at step 2).
   ScrollTrigger is registered and `config({ ignoreMobileResize: true })`
   runs once, inside the promise. No side effects at evaluation. Components
   never import GSAP themselves. No `@gsap/react`, never ScrollSmoother,
   never normalizeScroll().
   ========================================================================== */

export type Gsap = typeof import("gsap").gsap;
export type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type GsapKit = { gsap: Gsap; ScrollTrigger: ScrollTriggerStatic };

let loading: Promise<GsapKit> | null = null;
/** The registered kit once `loadGsap()` has resolved (null before). */
let loaded: GsapKit | null = null;

/** Fetch + evaluate the two modules only (the warm-up prefetch, spec §3.1
 *  (a)): no registration, no ticker, no instance. */
export function prefetchGsap(): Promise<unknown> {
  return Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
}

/** Load gsap + ScrollTrigger once (cached; a failed load may retry). */
export function loadGsap(): Promise<GsapKit> {
  if (!loading) {
    loading = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([core, st]) => {
      const gsap = core.gsap;
      const ScrollTrigger = st.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      loaded = { gsap, ScrollTrigger };
      return loaded;
    });
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** The kit if GSAP is already loaded, else null. Never starts a load (jumps
 *  and refreshes use it: a phone must never fetch GSAP for a jump). */
export function gsapIfLoaded(): GsapKit | null {
  return loaded;
}

let sleepTimer: ReturnType<typeof setTimeout> | undefined;

/** After a teardown (Lenis destroyed, scenes reverted on reduced motion or
 *  Pause): put GSAP's ticker to sleep once nothing needs it, so no rAF is
 *  left running. Deferred 50 ms so every effect cleanup of the same commit
 *  has run first. Anything that animates later wakes the ticker itself. */
export function sleepTickerIfIdle(): void {
  if (typeof window === "undefined" || !loaded) return;
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => {
    if (!loaded) return;
    const { gsap, ScrollTrigger } = loaded;
    // the root timeline's own listener is always there; more = a live tick
    const listeners = (gsap.ticker as unknown as { _listeners?: readonly unknown[] })._listeners;
    if (listeners && listeners.length > 1) return;
    if (ScrollTrigger.getAll().length) return;
    if (gsap.globalTimeline.getChildren(true, true, true).some((a) => a.isActive())) return;
    gsap.ticker.sleep();
  }, 50);
}
