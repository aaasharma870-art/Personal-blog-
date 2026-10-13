"use client";

import { useEffect, useRef, type RefObject } from "react";
import { emit } from "@/lib/events";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { useScrollScene, type ScrollSceneApi } from "@/lib/use-scroll-scene";
import { useVariant } from "@/lib/use-variant";
import type { Variant } from "@/lib/variants";
import type { LetterboxSceneOptions } from "./letterbox-bars";

/* ============================================================================
   LETTERBOX BARS (spec §7.4, K3) — OWNER: B1-STAGE.
   The lazy half (DP-13) of ./letterbox-bars.tsx, the static facade: its
   <LetterboxBars/> loads <Bars/> here on DESKTOP_FINE with motion on;
   useLetterboxScene() (below; its host is lazy) runs `letterboxScene()`.
   <LetterboxBars/> is mounted by app/page.tsx before <main>: one fixed pair
   at --z-bars (below the header and the fast lane), in the scene world's
   deep. Height --lb-h (app/p3/stage.css): (100svh − 100vw/2.39)/2 at
   ≥ 80rem (148.7 px @1440×900); below 80rem capped at 11svh (84.5 px
   @1024×768). Mounted only on DESKTOP_FINE with motion on (client only:
   the server renders nothing, so phones, reduced motion, no-JS and a
   paused view never have bars); a mid-session Pause unmounts them (fixed
   overlays: no layout shift).

   useLetterboxScene(ref, { close: [start, end], open: [start, end] }) ties
   a host to the bars with ScrollTrigger position strings (through
   useScrollScene: DESKTOP_FINE + motion on + ladder step 2; otherwise a
   no-op). Close over ≥ 40vh, hold, open over ≥ 40vh. Consumers (spec
   §7.4): the films' "house lights down" only (W3-CINEMA); voices has none.

   `letterbox.breath` (lib/variants.ts):
     DEFAULT "slide"     — the bars scaleY 0 → 1 from the viewport edges;
     ALT     "iris-bars" — an elliptical iris closes toward the 2.39 band
                           (one static radial layer, scaled), then the flat
                           bars square it off and the iris lets go.
   Transform / opacity only, written once per ScrollTrigger update.

   While the bars are closed, html[data-letterbox] sets scroll-padding to
   the bars (stage.css; Lenis's scrollTo reads it), and a focusin on an
   element under a bar opens them until focus leaves (WCAG 2.4.11).
   Emits `letterbox` { state: "close" | "open" } when the state flips.
   ========================================================================== */

/* — the module store: one pair of bars, any number of consumers ———————— */
type Els = { top: HTMLElement | null; bottom: HTMLElement | null; iris: HTMLElement | null; root: HTMLElement | null };
const els: Els = { top: null, bottom: null, iris: null, root: null };
const consumers = new Map<symbol, number>();
let variant: Variant = "default";
let forcedOpen = false;
let shown = -1;
let closed = false;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

function progress(): number {
  if (forcedOpen) return 0;
  let p = 0;
  consumers.forEach((v) => {
    p = Math.max(p, v);
  });
  return p;
}

function apply(): void {
  const p = progress();
  // sub-step changes are skipped, never the ends: fully closed is exactly 1
  if (p === shown || (p > 0 && p < 1 && Math.abs(p - shown) < 0.0005)) return;
  shown = p;
  const { top, bottom, iris } = els;
  if (variant === "alt") {
    // the iris closes over p 0 → .8; the flat bars square it off .75 → 1;
    // the iris lets go .9 → 1 (the bars alone hold the band)
    const bars = ramp(p, 0.75, 1);
    for (const b of [top, bottom]) {
      if (!b) continue;
      b.style.transform = "scaleY(1)";
      b.style.opacity = bars.toFixed(3);
    }
    if (iris) {
      const s = 1 + 1.6 * (1 - ramp(p, 0, 0.8)) ** 2;
      iris.style.transform = `scale(${s.toFixed(4)})`;
      iris.style.opacity = (p <= 0 ? 0 : 1 - ramp(p, 0.9, 1)).toFixed(3);
    }
  } else {
    for (const b of [top, bottom]) {
      if (!b) continue;
      b.style.opacity = "1";
      b.style.transform = `scaleY(${p.toFixed(4)})`;
    }
  }
  const nowClosed = p > 0;
  if (nowClosed !== closed) {
    closed = nowClosed;
    const root = document.documentElement;
    if (closed) root.setAttribute("data-letterbox", "");
    else root.removeAttribute("data-letterbox");
    emit("letterbox", { state: closed ? "close" : "open" });
  }
}

function setConsumer(id: symbol, p: number | null): void {
  if (p === null) consumers.delete(id);
  else consumers.set(id, clamp01(p));
  apply();
}

/** The scene world's deep, read once per scene from the host's plane. */
function setBarColour(scope: Element): void {
  const deep = getComputedStyle(scope).getPropertyValue("--world-deep").trim();
  if (deep && els.root) els.root.style.setProperty("--lb-bg", deep);
}

/** The bars (the facade mounts them on DESKTOP_FINE with motion on). */
export function Bars() {
  const v = useVariant(null, "letterbox.breath");
  const root = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const iris = useRef<HTMLDivElement>(null);
  const alt = v === "alt";

  useEffect(() => {
    variant = alt ? "alt" : "default";
    els.root = root.current;
    els.top = top.current;
    els.bottom = bottom.current;
    els.iris = iris.current;
    shown = -1;
    apply();
    return () => {
      els.root = els.top = els.bottom = els.iris = null;
      shown = -1;
      if (closed) {
        closed = false;
        document.documentElement.removeAttribute("data-letterbox");
        emit("letterbox", { state: "open" });
      }
    };
  }, [alt]);

  // WCAG 2.4.11: a focused element under a closed bar opens the bars until
  // focus moves on.
  useEffect(() => {
    const onIn = (e: FocusEvent) => {
      const t = e.target;
      if (!closed || !(t instanceof Element) || !top.current) return;
      const h = top.current.offsetHeight; // the bar's layout height = --lb-h
      const r = t.getBoundingClientRect();
      if (r.top < h || r.bottom > window.innerHeight - h) {
        forcedOpen = true;
        apply();
      }
    };
    const onOut = () => {
      if (!forcedOpen) return;
      forcedOpen = false;
      apply();
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      forcedOpen = false;
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="letterbox" data-variant={alt ? "iris-bars" : "slide"}>
      {alt ? <div ref={iris} className="letterbox-iris" /> : null}
      <div ref={top} className="letterbox-bar" data-bar="top" />
      <div ref={bottom} className="letterbox-bar" data-bar="bottom" />
    </div>
  );
}

/** A ScrollTrigger position "<edge> <n>%" (edge top | center | bottom | a
 *  percentage of the box) as [edge share of the box, viewport share]. */
type Pos = readonly [edge: number, at: number];
const EDGES: Readonly<Record<string, number>> = { top: 0, center: 0.5, bottom: 1 };
function pos(s: string): Pos {
  const [e = "top", v = "0%"] = s.trim().split(/\s+/);
  return [EDGES[e] ?? parseFloat(e) / 100, parseFloat(v) / 100];
}
const posString = ([e, at]: Pos) => `${e * 100}% ${at * 100}%`;

/** One consumer's scene (useLetterboxScene below runs it inside
 *  useScrollScene): close the global bars over `o.close`, open them over
 *  `o.open` (ScrollTrigger [start, end] position strings on the scope).
 *  The close and the open are read from the scope's LIVE box on every
 *  update (one rect read), not from ScrollTrigger's cached positions: a
 *  jump re-flows the lazy sections above after the last refresh, and the
 *  stale ranges left the hold at .82 with a dip on the way in (W3 gate).
 *  So the bars are fully closed from the close's end until the open starts.
 *  One trigger, a viewport wider than the scene on each side, only times
 *  the reads. Returns the cleanup. */
export function letterboxScene({ ScrollTrigger, scope }: ScrollSceneApi, o: LetterboxSceneOptions): () => void {
  const [c0, c1] = o.close.map(pos);
  const [o0, o1] = o.open.map(pos);
  const id = Symbol("letterbox");
  setBarColour(scope);
  const set = () => {
    const r = scope.getBoundingClientRect();
    const vh = window.innerHeight;
    // the scroll left until a position is reached (≤ 0: reached)
    const d = ([e, at]: Pos) => r.top + e * r.height - at * vh;
    const span = (a: Pos, b: Pos) => clamp01(-d(a) / Math.max(1, d(b) - d(a)));
    setConsumer(id, span(c0, c1) * (1 - span(o0, o1)));
  };
  const st = ScrollTrigger.create({
    trigger: scope,
    start: posString([c0[0], c0[1] + 1]),
    end: posString([o1[0], o1[1] - 1]),
    onUpdate: set,
    onRefresh: set,
    onToggle: set,
  });
  return () => {
    st.kill();
    setConsumer(id, null);
  };
}

/** Close the global bars over `o.close`, open them over `o.open` (both
 *  ScrollTrigger [start, end] position strings on the host `ref`). A no-op
 *  on phones, under reduced motion / Pause and before ladder step 2. Its
 *  only host (components/sections/films/films-desktop.tsx) is lazy, so it
 *  lives here, off the first load. */
export function useLetterboxScene(ref: RefObject<Element | null>, o: LetterboxSceneOptions): void {
  const [c0, c1] = o.close;
  const [o0, o1] = o.open;
  useScrollScene(
    ref,
    (api) => {
      const undo = letterboxScene(api, { close: [c0, c1], open: [o0, o1] });
      requestScrollRefresh();
      return undo;
    },
    [c0, c1, o0, o1],
  );
}
