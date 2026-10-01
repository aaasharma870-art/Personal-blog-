/* ============================================================================
   useScrollScene — the only way a component builds a GSAP/ScrollTrigger
   scene (PHASE3-SPEC §3.1). On DESKTOP_FINE with motion on it queues the
   build until ladder step 2, then runs every queued build in one flush
   (followed by ONE requestScrollRefresh(), which sorts triggers into page
   order) inside `gsap.context(…, scope)`; later builds run as they mount.
   Cleanup is the build's own return + `ctx.revert()` (every tween and
   ScrollTrigger it made). It re-runs when motion turns off/on or `deps`
   change; reduced motion, Pause, phones and touch never load GSAP here.
   `build` always sees the latest props (it is an effect event): `deps`
   alone decides when the scene is rebuilt.
   ========================================================================== */

import { useEffect, useEffectEvent, type RefObject } from "react";
import { DESKTOP_FINE, motionOffNow, useDesktopFine, useReducedMotion } from "./flags";
import { gsapIfLoaded, loadGsap, sleepTickerIfIdle, type Gsap, type ScrollTriggerStatic } from "./gsap";
import { requestScrollRefresh } from "./smooth-scroll";

export type ScrollSceneApi = { gsap: Gsap; ScrollTrigger: ScrollTriggerStatic; scope: Element };
export type ScrollSceneBuild = (api: ScrollSceneApi) => void | (() => void);

type Job = () => void;

/** Builds waiting for ladder step 2. */
const queue = new Set<Job>();
let flushed = false;
let flushing = false;

function flushWhenReady(): void {
  if (flushing) return;
  flushing = true;
  // the ladder is a desktop chunk (DP-13): imported here, never statically,
  // so a first-load host of a scene does not carry it
  import("./ladder")
    .then((m) => m.whenLadder(2))
    .then(() => loadGsap())
    .then(() => {
      flushed = true;
      const jobs = [...queue];
      queue.clear();
      for (const job of jobs) job();
      requestScrollRefresh();
    })
    .catch(() => {
      // GSAP failed to load: the page stays static; a later mount retries
      flushing = false;
    });
}

/** Queue `job` until step 2 (or run it now, after the flush). Returns the
 *  cancel for a job that has not run yet. */
function schedule(job: Job): () => void {
  if (flushed) {
    job();
    requestScrollRefresh();
    return () => {};
  }
  queue.add(job);
  flushWhenReady();
  return () => {
    queue.delete(job);
  };
}

type Ctx = ReturnType<Gsap["context"]>;

export function useScrollScene(
  ref: RefObject<Element | null>,
  build: ScrollSceneBuild,
  deps: readonly unknown[],
): void {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const live = fine && !reduced;
  const runBuild = useEffectEvent((api: ScrollSceneApi) => build(api));

  useEffect(() => {
    if (!live) return;
    const scope = ref.current;
    if (!scope) return;
    let ctx: Ctx | null = null;
    let own: void | (() => void);
    const cancel = schedule(() => {
      // live re-check: the hydration snapshot says motion is on for everyone
      if (motionOffNow() || !window.matchMedia(DESKTOP_FINE).matches || !scope.isConnected) return;
      const kit = gsapIfLoaded();
      if (!kit) return;
      ctx = kit.gsap.context(() => {
        own = runBuild({ gsap: kit.gsap, ScrollTrigger: kit.ScrollTrigger, scope });
      }, scope);
    });
    return () => {
      cancel();
      try {
        if (typeof own === "function") own();
      } finally {
        ctx?.revert();
        ctx = null;
        sleepTickerIfIdle();
      }
    };
    // `deps` is the caller's list (like useGSAP's `dependencies`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, ref, ...deps]);
}
