"use client";

/* ============================================================================
   WORLD FONTS (PHASE3-SPEC §5.5, P3-4) — OWNER: B1-TYPE.
   The lazy half of <WorldFonts/> (./world-fonts.tsx, the static facade
   app/layout.tsx mounts; DP-13); renders nothing. On DESKTOP_WIDE only
   (phones never start it, so they fetch no world face):
   1. waits for the warm-up — ladder step 5 on DESKTOP_FINE (after the
      prologue's quiet window, one idle slice per step); on a wide touch
      screen the quiet end, then an idle slice (`onIdle`);
   2. then adds a world's token (lib/world-fonts.ts markWorldFontsReady)
      when any of its planes comes within 150% of a viewport (above or
      below), so the faces swap while the world is still off screen. At the
      top of the page that is Pirates (the hero) at once; a deep link marks
      the world it lands in, not the ones it skipped;
   3. re-measures scroll (requestScrollRefresh: Lenis + ScrollTrigger) each
      time fonts finish loading (`loadingdone`): a face swap re-flows text.
   Nothing here renders, so hydration is untouched (the tokens are added in
   an effect, after mount).
   ========================================================================== */

import { useEffect } from "react";
import { DESKTOP_FINE, DESKTOP_WIDE } from "@/lib/flags";
import { onIdle } from "@/lib/idle";
import { whenLadder, whenQuietEnd } from "@/lib/ladder";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { markWorldFontsReady, worldFontsMarked } from "@/lib/world-fonts";
import { WORLD_IDS, type WorldId } from "@/lib/worlds";

/** PHASE3-SPEC §5.5: a world loads when one of its planes is this close. */
const APPROACH_MARGIN = "150% 0px";
/** If the ladder never reaches step 5 (a stalled step), start anyway this
 *  long after the quiet end. */
const LADDER_FALLBACK_MS = 8000;

const FILM_WORLDS = WORLD_IDS.filter((w): w is Exclude<WorldId, "house"> => w !== "house");
const isFilmWorld = (w: string | undefined): w is Exclude<WorldId, "house"> =>
  FILM_WORLDS.some((f) => f === w);

/** The boxes to watch for each world: every `[data-world]` plane but the
 *  header and the prologue; a `display: contents` frame (SectionFrame)
 *  stands in by its element children. */
function targets(): [Element, Exclude<WorldId, "house">][] {
  const out: [Element, Exclude<WorldId, "house">][] = [];
  for (const el of document.querySelectorAll<HTMLElement>("[data-world]")) {
    const w = el.dataset.world;
    if (!isFilmWorld(w) || el.closest("header, #intro, #intro-caps")) continue;
    if (el.getClientRects().length > 0) out.push([el, w]);
    else for (const child of el.children) out.push([child, w]);
  }
  return out;
}

/** Watch every film world's planes; returns the cleanup. */
function watchWorlds(): () => void {
  const done = new Set<string>(worldFontsMarked());
  const byTarget = new Map<Element, Exclude<WorldId, "house">>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const w = byTarget.get(e.target);
        if (!w || done.has(w)) continue;
        done.add(w);
        void markWorldFontsReady(w, 0);
        for (const [t, tw] of byTarget) if (tw === w) io.unobserve(t);
      }
      if (FILM_WORLDS.every((w) => done.has(w))) io.disconnect();
    },
    { rootMargin: APPROACH_MARGIN },
  );
  for (const [el, w] of targets()) {
    if (done.has(w)) continue;
    byTarget.set(el, w);
    io.observe(el);
  }
  const fonts = document.fonts;
  const onLoaded = () => requestScrollRefresh();
  fonts?.addEventListener?.("loadingdone", onLoaded);
  return () => {
    io.disconnect();
    fonts?.removeEventListener?.("loadingdone", onLoaded);
  };
}

/** Resolves when world fonts may start (PHASE3-SPEC §3.1 ladder step 5). */
function warmedUp(): Promise<void> {
  if (window.matchMedia(DESKTOP_FINE).matches) {
    const fallback = whenQuietEnd().then(
      () => new Promise<void>((r) => window.setTimeout(r, LADDER_FALLBACK_MS)),
    );
    return Promise.race([whenLadder(5), fallback]);
  }
  return whenQuietEnd().then(() => new Promise<void>((r) => void onIdle(r, { timeout: 2000 })));
}

export default function WorldFontsImpl(): null {
  useEffect(() => {
    if (typeof window.matchMedia !== "function" || typeof IntersectionObserver === "undefined") return;
    const wide = window.matchMedia(DESKTOP_WIDE);
    let cancelled = false;
    let armed = false;
    let stop: (() => void) | null = null;
    const arm = () => {
      if (armed || !wide.matches) return;
      armed = true;
      wide.removeEventListener("change", arm);
      void warmedUp().then(() => {
        if (!cancelled) stop = watchWorlds();
      });
    };
    arm();
    // a window widened past 64rem later (phones never get here)
    if (!armed) wide.addEventListener("change", arm);
    return () => {
      cancelled = true;
      wide.removeEventListener("change", arm);
      stop?.();
    };
  }, []);
  return null;
}
