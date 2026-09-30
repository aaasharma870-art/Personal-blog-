/* ============================================================================
   GSAP LOADER — the only way GSAP enters the page (PHASE3-SPEC §3.1).
   Dynamic `import()` only (never a top-level value import: gsap stays out of
   the `/` first-load chunks), loaded on DESKTOP_FINE with motion on by the
   callers (useScrollScene, the ladder). ScrollTrigger is registered and
   `config({ ignoreMobileResize: true })` runs once, inside the promise. No
   side effects at evaluation. Components never import GSAP themselves.
   No `@gsap/react`, never ScrollSmoother, never normalizeScroll().
   ========================================================================== */

export type Gsap = typeof import("gsap").gsap;
export type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type GsapKit = { gsap: Gsap; ScrollTrigger: ScrollTriggerStatic };

let loading: Promise<GsapKit> | null = null;

/** Load gsap + ScrollTrigger once (cached; a failed load may retry). */
export function loadGsap(): Promise<GsapKit> {
  if (!loading) {
    loading = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([core, st]) => {
      const gsap = core.gsap;
      const ScrollTrigger = st.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap, ScrollTrigger };
    });
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}
