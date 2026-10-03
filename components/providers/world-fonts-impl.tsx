"use client";

/* ============================================================================
   WORLD FONTS (PHASE3-SPEC §5.5, P3-4) — OWNER: B1-TYPE.
   The lazy half of <WorldFonts/> (./world-fonts.tsx, the static facade
   app/layout.tsx mounts; DP-13); renders nothing. On DESKTOP_WIDE only
   (phones never start it, so they fetch no world face):
   1. waits for the warm-up — ladder step 5 on DESKTOP_FINE (after the
      prologue's quiet window, one idle slice per step); on a wide touch
      screen the quiet end, then an idle slice (`onIdle`). PIRATES does not
      wait: its body face (the only gated Pirates face) is wanted by #about,
      the first section the reader meets, so it loads at once and swaps
      while #about is still far below the first screen;
   2. LOADS a world's faces (network only, nothing changes on screen) when
      any of its planes comes within 150% of a viewport (above or below);
   3. SWAPS (lib/world-fonts.ts markWorldFontsReady: the token) once the
      faces have loaded AND none of the world's text is on screen (P3-11,
      J8 #4: CLS 0). A swap re-flows the world's text; off screen below,
      nothing visible moves; off screen above, the browser's scroll
      anchoring keeps the view still. A reader already inside the world
      (a deep link, a fast scroll, reduced motion) keeps the fallback face
      until the world leaves the screen: a face that never jumps under the
      reader beats one that arrives mid-sentence. Never during the
      prologue's flight or its quiet window (the titles); in the 3 s grace
      after the titles only while the scroll is still; each swap waits for
      an idle slice (≈ 11–39 ms of style at 1440: app/globals.css scopes
      the token to the world's own planes);
   4. re-measures scroll (requestScrollRefresh: Lenis + ScrollTrigger) after
      each swap (the faces' own `loadingdone` changes no layout: the token
      is not there yet).
   The text a world's token changes: its [data-world] planes (head, act
   lettering, prose), minus the house-typed hero, header and prologue, plus
   every .world-face-<world> caption on another world's plane.
   Nothing here renders, so hydration is untouched (the tokens are added in
   an effect, after mount).
   ========================================================================== */

import { useEffect } from "react";
import { DESKTOP_FINE, DESKTOP_WIDE, motionOffNow } from "@/lib/flags";
import { onIdle } from "@/lib/idle";
import { inQuietGrace, isQuiet, sinceScroll, whenLadder, whenQuietEnd } from "@/lib/ladder";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { markWorldFontsReady, worldFontsMarked } from "@/lib/world-fonts";
import { WORLD_IDS, type WorldId } from "@/lib/worlds";

type FilmWorld = Exclude<WorldId, "house">;

/** PHASE3-SPEC §5.5: a world loads when one of its planes is this close. */
const APPROACH_MARGIN = "150% 0px";
/** "On screen" for a swap: the viewport plus a small band (a glide's last
 *  frames, the sticky header). */
const VIEW_MARGIN = "12% 0px";
/** In the grace after the titles, a swap waits for the scroll to be still
 *  this long. */
const GRACE_STILL_MS = 250;
/** If the ladder never reaches step 5 (a stalled step), start anyway this
 *  long after the quiet end. */
const LADDER_FALLBACK_MS = 8000;

const FILM_WORLDS = WORLD_IDS.filter((w): w is FilmWorld => w !== "house");
const isFilmWorld = (w: string | undefined): w is FilmWorld => FILM_WORLDS.some((f) => f === w);

/** Each world's gated faces as [the next/font var on <html>, weight]
 *  (lib/world-fonts.ts loads the same; the Pirates head is the name's
 *  file and is never gated). */
const FACES: Readonly<Record<FilmWorld, readonly (readonly [string, number])[]>> = {
  pirates: [["--font-world-pirates-body", 500]],
  idiots: [
    ["--font-world-idiots-head", 700],
    ["--font-world-idiots-lead", 400],
  ],
  rdr2: [
    ["--font-world-rdr2-head", 400],
    ["--font-world-rdr2-body", 400],
  ],
  hp: [
    ["--font-world-hp-head", 400],
    ["--font-world-hp-body", 400],
  ],
};

/** House-typed planes: no world face in them (app/p3/type.css). */
const HOUSE = "header, #intro, #intro-caps, [data-hero]";

/** The boxes whose text a world's token changes: every `[data-world]`
 *  plane but the house-typed ones (a `display: contents` frame stands in
 *  by its element children), plus the `.world-face-<world>` captions that
 *  sit on another world's plane. Pirates gates only its BODY face (its head
 *  is the name's file): only its prose sections, never the act-1 card. */
function targets(): [Element, FilmWorld][] {
  const out: [Element, FilmWorld][] = [];
  const add = (el: Element, w: FilmWorld) => {
    if (!el.closest(HOUSE)) out.push([el, w]);
  };
  for (const el of document.querySelectorAll<HTMLElement>("[data-world]")) {
    const w = el.dataset.world;
    if (!isFilmWorld(w)) continue;
    if (w === "pirates" && (!el.hasAttribute("data-section") || el.hasAttribute("data-act-card"))) continue;
    if (el.getClientRects().length > 0) add(el, w);
    else for (const child of el.children) add(child, w);
  }
  for (const w of FILM_WORLDS) {
    for (const el of document.querySelectorAll(`.world-face-${w}`)) {
      if (!el.closest(`[data-world="${w}"]`) && !el.closest(HOUSE)) out.push([el, w]);
    }
  }
  return out;
}

/** Watch every film world; `eager` worlds load without waiting to be
 *  approached. Returns the cleanup. */
function watchWorlds(ready: Promise<void>, eager: ReadonlySet<FilmWorld>): () => void {
  const marked = new Set<string>(worldFontsMarked());
  const loading = new Map<FilmWorld, Promise<void>>();
  const loaded = new Set<FilmWorld>();
  const onScreen = new Map<FilmWorld, Set<Element>>(FILM_WORLDS.map((w) => [w, new Set()]));
  const byTarget = new Map<Element, FilmWorld>();
  let dead = false;
  let warmed = false;
  const pendingSwap = new Set<FilmWorld>();
  let cancelIdle: (() => void) | null = null;

  // the next/font family names, read once, before any token restyles <html>
  const style = window.getComputedStyle(document.documentElement);
  const families = Object.fromEntries(
    FILM_WORLDS.map((w) => [w, FACES[w].map(([v, weight]) => [style.getPropertyValue(v).trim(), weight] as const)]),
  ) as Record<FilmWorld, (readonly [string, number])[]>;

  const load = (w: FilmWorld): void => {
    if (marked.has(w) || loading.has(w)) return;
    const fonts = document.fonts;
    const p = Promise.all(
      families[w].map(([family, weight]) =>
        family && fonts?.load ? fonts.load(`${weight} 1em ${family}`).then(noop, noop) : undefined,
      ),
    ).then(() => {
      loaded.add(w);
      trySwap(w);
    });
    loading.set(w, p);
  };

  const swapNow = (): void => {
    cancelIdle = null;
    if (dead) return;
    // the prologue's flight or titles: after its quiet window. In the 3 s
    // grace after the titles, only while the reader is not scrolling (the
    // first wheel after the titles never meets a restyle)
    const root = document.documentElement.classList;
    if (isQuiet() || (root.contains("intro-armed") && root.contains("intro-launched"))) {
      void whenQuietEnd().then(() => pendingSwap.forEach(trySwap));
      return;
    }
    if (inQuietGrace() && sinceScroll() < GRACE_STILL_MS) {
      window.setTimeout(() => pendingSwap.forEach(trySwap), GRACE_STILL_MS);
      return;
    }
    let any = false;
    for (const w of [...pendingSwap]) {
      pendingSwap.delete(w);
      if (marked.has(w) || (onScreen.get(w)?.size ?? 0) > 0) continue;
      marked.add(w);
      any = true;
      // loaded: the token lands in this task, while the world is off screen
      void markWorldFontsReady(w, 0);
    }
    if (any) requestScrollRefresh();
  };

  function trySwap(w: FilmWorld): void {
    if (dead || marked.has(w) || !loaded.has(w)) return;
    if ((onScreen.get(w)?.size ?? 0) > 0) return; // when it leaves the screen
    pendingSwap.add(w);
    cancelIdle ??= onIdle(swapNow, { timeout: 300 });
  }

  // 2. approach → load (eager worlds load at once; the rest after warm-up)
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const w = byTarget.get(e.target);
        if (!w || !e.isIntersecting) continue;
        if (warmed || eager.has(w)) load(w);
      }
    },
    { rootMargin: APPROACH_MARGIN },
  );
  // 3. on screen → hold the swap; off screen → swap if loaded
  const view = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const w = byTarget.get(e.target);
        if (!w) continue;
        const set = onScreen.get(w)!;
        if (e.isIntersecting) set.add(e.target);
        else set.delete(e.target);
        if (!set.size) trySwap(w);
      }
    },
    { rootMargin: VIEW_MARGIN },
  );
  for (const [el, w] of targets()) {
    if (marked.has(w)) continue;
    byTarget.set(el, w);
    near.observe(el);
    view.observe(el);
  }
  eager.forEach(load);
  void ready.then(() => {
    if (dead) return;
    warmed = true;
    // re-observe: the first callback reports the worlds already within reach
    near.disconnect();
    for (const [el] of byTarget) near.observe(el);
  });
  return () => {
    dead = true;
    cancelIdle?.();
    near.disconnect();
    view.disconnect();
  };
}

const noop = () => undefined;

/** Resolves when world fonts may start (PHASE3-SPEC §3.1 ladder step 5).
 *  With motion off the ladder halts, and nothing animates that a load could
 *  jank: after the quiet end and an idle slice, as on a touch screen. */
function warmedUp(): Promise<void> {
  if (window.matchMedia(DESKTOP_FINE).matches && !motionOffNow()) {
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
      // one idle slice after hydration, so the page's own first work goes first
      onIdle(
        () => {
          if (!cancelled) stop = watchWorlds(warmedUp(), new Set<FilmWorld>(["pirates"]));
        },
        { timeout: 2000 },
      );
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
