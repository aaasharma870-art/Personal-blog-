"use client";

import { useEffect, useRef } from "react";
import { emit } from "@/lib/events";
import type { ScrollSceneApi } from "@/lib/use-scroll-scene";
import { useVariant } from "@/lib/use-variant";
import type { Variant } from "@/lib/variants";
import type { LetterboxSceneOptions } from "./letterbox-bars";

/* ============================================================================
   LETTERBOX BARS (spec §7.4, K3) — OWNER: B1-STAGE.
   The lazy half (DP-13) of ./letterbox-bars.tsx, the static facade: its
   <LetterboxBars/> loads <Bars/> here on DESKTOP_FINE with motion on, and
   its useLetterboxScene() runs `letterboxScene()` here inside the scene.
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
  if (Math.abs(p - shown) < 0.0005) return;
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

/** One consumer's scene (the facade's useLetterboxScene runs it inside
 *  useScrollScene): close the global bars over `o.close`, open them over
 *  `o.open` (ScrollTrigger [start, end] position strings on the scope).
 *  Returns the cleanup. */
export function letterboxScene({ ScrollTrigger, scope }: ScrollSceneApi, o: LetterboxSceneOptions): () => void {
  const [c0, c1] = o.close;
  const [o0, o1] = o.open;
  const id = Symbol("letterbox");
  let pc = 0;
  let po = 0;
  const set = () => setConsumer(id, pc * (1 - po));
  setBarColour(scope);
  const close = ScrollTrigger.create({
    trigger: scope,
    start: c0,
    end: c1,
    onUpdate: (st) => {
      pc = st.progress;
      set();
    },
    onRefresh: (st) => {
      pc = st.progress;
      set();
    },
  });
  const open = ScrollTrigger.create({
    trigger: scope,
    start: o0,
    end: o1,
    onUpdate: (st) => {
      po = st.progress;
      set();
    },
    onRefresh: (st) => {
      po = st.progress;
      set();
    },
  });
  return () => {
    close.kill();
    open.kill();
    setConsumer(id, null);
  };
}
