"use client";

/* ============================================================================
   SMOOTH SCROLL (spec §3.1, P3-2) — OWNER: B1-SCROLL.
   The lazy half of <SmoothScroll/> (./smooth-scroll.tsx, the static facade
   app/layout.tsx mounts inside MotionProvider → ChromeGate, so /lab never
   gets it and the reduced-motion remount tears it down): loaded on
   DESKTOP_FINE only (DP-13). Renders nothing. It:
   - creates the ONE Lenis instance as ladder step 1 when
       DESKTOP_FINE && motion on && pathname "/" && the intro overlay is gone
       && not in the quiet window && !?skip=smooth && film.smoothScroll,
     re-checked live after the dynamic import (the hydration snapshot says
     motion is on for everyone), on GSAP's ticker (one clock), feeding
     ScrollTrigger.update; reduced motion or Pause DESTROYS it within the
     same task (never stop(): a stopped Lenis freezes the page) and puts
     the ticker to sleep;
   - the delegated same-page `#` link handler (bubble phase: Time-Turner,
     journey waypoints, the map dialog keep their own preventDefault) on the
     desktop motion path, with or without Lenis;
   - while Lenis lives: the keydown-capture and intro re-arm glide halts;
   - registers the desktop chunks (Lenis, GSAP, the enhancer) and starts the
     warm-up prefetch (before warm, or at page idle) on DESKTOP_FINE;
   - refresh triggers: a ResizeObserver on <main>, `fonts.loadingdone`,
     ladder step 2 (once, after the quiet window);
   - loads the desktop enhancer (ladder step 2; with motion off, after the
     quiet window at idle) on DESKTOP_FINE, home page only.
   Phones and touch never get any of it: native scroll, byte-for-byte.
   This file and lib/gsap.ts are the only two that may import `lenis` /
   `gsap` at runtime (eslint.config.mjs).
   ========================================================================== */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { film } from "@/lib/film";
import {
  DESKTOP_FINE,
  motionOffNow,
  onMotionOffChange,
  shouldSkip,
  useDesktopFine,
  useReducedMotion,
  useSkipFlags,
} from "@/lib/flags";
import { loadGsap, prefetchGsap, sleepTickerIfIdle, type GsapKit } from "@/lib/gsap";
import { onIdle } from "@/lib/idle";
import { isQuiet, prefetchChunks, registerChunk, useLadder, useQuiet, whenLadder, whenQuietEnd } from "@/lib/ladder";
import {
  getLenis,
  haltGlide,
  requestScrollRefresh,
  scrollToTarget,
  setLenis,
  trackScrollInput,
} from "@/lib/smooth-scroll";
import { introGone, useIntroPhase } from "@/components/sections/hero/intro-phase";

/* The desktop chunks (stable references: each is prefetched once). */
const loadLenis = () => import("lenis");
const loadEnhancer = () => import("@/components/enhance/desktop-enhancer");

const fineNow = (): boolean => window.matchMedia(DESKTOP_FINE).matches;

/** Same-page `#id` links → scrollToTarget (window bubble phase: anything
 *  that called preventDefault keeps its own behaviour). */
function onAnchorClick(e: MouseEvent): void {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
  let url: URL;
  try {
    url = new URL(a.href, window.location.href);
  } catch {
    return;
  }
  const here = window.location;
  if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search || !url.hash) return;
  let id = url.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep the raw id */
  }
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  // keyboard activation (detail 0: Enter on the link, the skip link) never glides
  void scrollToTarget(target, { history: "push", focus: true, immediate: e.detail === 0 });
}

/** Build the instance on the loaded modules; returns its teardown. */
function startLenis(LenisCtor: typeof Lenis, { gsap, ScrollTrigger }: GsapKit): () => void {
  const lenis = new LenisCtor({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    anchors: false,
    respectReducedMotion: true,
    // horizontal gestures (history swipe, sideways trackpad) stay native
    virtualScroll: ({ deltaX, deltaY }) => Math.abs(deltaY) >= Math.abs(deltaX),
  });
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  const offScroll = lenis.on("scroll", ScrollTrigger.update);
  setLenis(lenis);

  const root = document.documentElement;
  // app/p3/foundation.css: the boot gate already made the page Lenis-ready
  // (html height:auto); a view that booted paused and resumed needs the
  // same, once (an <html> attribute restyles the whole document)
  const bootPaused = root.dataset.motionBoot === "paused";
  if (bootPaused) root.dataset.smooth = "";
  // keyboard / focus / find-in-page scrolls are native: never overridden
  const onKey = () => haltGlide();
  // an intro replay's scrollTo(0) wins over a glide
  const mo = new MutationObserver(() => {
    if (root.classList.contains("intro-armed")) haltGlide();
  });
  window.addEventListener("keydown", onKey, true);
  mo.observe(root, { attributes: true, attributeFilter: ["class"] });
  requestScrollRefresh();

  return () => {
    window.removeEventListener("keydown", onKey, true);
    mo.disconnect();
    offScroll();
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    setLenis(null);
    lenis.destroy();
    if (bootPaused) delete root.dataset.smooth;
    requestScrollRefresh();
    sleepTickerIfIdle();
  };
}

/** Ladder step 1: the instance, for as long as `enabled` holds. */
function useLenisInstance(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let dead = false;
    let teardown: (() => void) | null = null;
    const kill = () => {
      dead = true;
      teardown?.();
      teardown = null;
    };
    // reduced motion / Pause: destroy in the same task, before React renders
    const offWatch = onMotionOffChange(() => {
      if (motionOffNow()) kill();
    });
    Promise.all([loadLenis(), loadGsap()])
      .then(([mod, kit]) => {
        if (dead || motionOffNow() || !fineNow() || isQuiet() || getLenis()) return;
        teardown = startLenis(mod.default, kit);
      })
      .catch(() => {
        /* no Lenis: native scroll, as on every phone */
      });
    return () => {
      offWatch();
      kill();
    };
  }, [enabled]);
}

/** Same-page `#` links through scrollToTarget whenever the desktop motion
 *  path is on, with or without Lenis (before it starts, `?skip=smooth`):
 *  an act anchor lands at its `landAt`, not on the card's dark p 0 (W2
 *  gate). Reduced motion / Pause: the browser's own jump. */
function useAnchors(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    window.addEventListener("click", onAnchorClick);
    return () => window.removeEventListener("click", onAnchorClick);
  }, [on]);
}

/** Register the desktop chunks; prefetch them before warm (the play screen,
 *  the flight) or at page idle. */
function useDesktopPrefetch(on: boolean): void {
  useEffect(() => {
    registerChunk(loadLenis);
    registerChunk(prefetchGsap);
    registerChunk(loadEnhancer);
    if (!on) return;
    let cancel = () => {};
    const go = () => {
      cancel = onIdle(() => prefetchChunks([]), { timeout: 2000 });
    };
    if (document.documentElement.classList.contains("intro-armed") || document.readyState === "complete") go();
    else {
      window.addEventListener("load", go, { once: true });
      cancel = () => window.removeEventListener("load", go);
    }
    return () => cancel();
  }, [on]);
}

/** What moves ScrollTrigger positions: <main> resizing, font swaps, and
 *  (once) ladder step 2 after the quiet window. */
function useRefreshTriggers(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    trackScrollInput();
    const main = document.getElementById("main");
    const ro = main && typeof ResizeObserver === "function" ? new ResizeObserver(() => requestScrollRefresh()) : null;
    if (main) ro?.observe(main);
    const fonts = document.fonts;
    const onFonts = () => requestScrollRefresh();
    fonts?.addEventListener?.("loadingdone", onFonts);
    let dead = false;
    void whenLadder(2).then(() => {
      if (dead || motionOffNow() || !fineNow()) return;
      void loadGsap().then(() => {
        if (!dead) requestScrollRefresh();
      });
    });
    return () => {
      dead = true;
      ro?.disconnect();
      fonts?.removeEventListener?.("loadingdone", onFonts);
    };
  }, [on]);
}

/** The desktop enhancer (binders + the queued-click replay): ladder step 2,
 *  or — with motion off, when the ladder halts — after the quiet window. */
function useEnhancer(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    let dead = false;
    let started = false;
    let undo: (() => void) | null = null;
    let cancelIdle = () => {};
    const start = () => {
      if (started || dead) return;
      started = true;
      loadEnhancer()
        .then((m) => {
          if (!dead && fineNow()) undo = m.default(document);
        })
        .catch(() => {
          started = false;
        });
    };
    const whenMotionOff = () => {
      if (dead || started || !motionOffNow() || isQuiet()) return;
      cancelIdle();
      cancelIdle = onIdle(start, { timeout: 2000 });
    };
    void whenLadder(2).then(start);
    void whenQuietEnd().then(whenMotionOff);
    const offWatch = onMotionOffChange(whenMotionOff);
    return () => {
      dead = true;
      cancelIdle();
      offWatch();
      undo?.();
    };
  }, [on]);
}

export default function SmoothScrollImpl(): null {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const phase = useIntroPhase();
  const skip = shouldSkip("smooth", useSkipFlags());
  const quiet = useQuiet();
  const step1 = useLadder(1);
  const home = pathname === "/";
  const motionDesk = fine && !reduced;

  const enabled = film.smoothScroll && motionDesk && home && introGone(phase) && !quiet && !skip && step1;

  useLenisInstance(enabled);
  useAnchors(motionDesk && home);
  useDesktopPrefetch(motionDesk && home);
  useRefreshTriggers(motionDesk && home);
  useEnhancer(fine && home);
  return null;
}
