"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { spotlight } from "@/lib/spotlight";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/* ============================================================================
   CURVE DRAW (lazy impl; PHASE3-SPEC §2.3 B25) — OWNER: W3-IDIOTS.
   Loaded by ./curve-draw.tsx on DESKTOP_FINE with motion on. It never edits
   the demo (components/visuals/backtest-demo.tsx): it lays a COVER over the
   demo's plot (its `svg[role="img"]`, measured) only while the demo is
   offscreen ("armed": useEnterOnce, so nothing ever hides in front of the
   reader), and reveals the plot once when it enters, as the B25 time star
   (through the spotlight; "skip" = the plot at once).

   The cover is the card's own ground (var(--surface-1)) carrying a copy of
   the plot's STATIC lines (its grid and dashed base, cloned from the demo's
   <line>s with the same viewBox), so the grid is there from frame 1 and
   only the curve and its fill appear. Transform / opacity only:
     DEFAULT "draw"  the cover slides off to the right behind a soft edge
                     (a static mask riding the transform) while its grid
                     counter-slides and stays put: the curve draws left →
                     right, 1.2 s;
     ALT     "fade"  the cover fades out (0.7 s): the curve comes up whole.
   (`experiment.curve`: registered in lib/variants.ts by the assembler.)
   Pause / reduced motion unmount this chunk (the facade), so the plot shows
   at once; a resize re-measures.
   THE THESIS, PLAYED (P3-11 r2, J1 #2: the experiment read as a dead stretch,
   its h2 stop a still screen; C1): once the plot has drawn, the demo is a
   GATED LIVE star, "B25-demo" (lent a still screen by the spotlight, never
   self-started). While it holds the screen it shows its own point: it presses
   the other toggle (the curve morphs naive ↔ realistic, the scan line runs,
   the index readout follows), then again every FLIP_MS. It stops the moment
   the spotlight takes the screen back (any scroll), and for good once the
   reader presses the toggle or a key in the demo, so the reader's own choice
   is never overridden. A pointer over the demo holds it still (the hover
   readout). Synthetic and labelled as before: nothing here is a result.
   ========================================================================== */

type Line = { x1: string; y1: string; x2: string; y2: string; cls: string; sw: string; dash: string | null };
type Box = { x: number; y: number; w: number; h: number; viewBox: string; lines: Line[] };

/** The soft edge of the DEFAULT wipe (px). */
const EDGE = 28;
/** The played thesis: one toggle press per FLIP_MS while the demo holds a
 *  still screen (the morph itself takes 0.9 s). */
const FLIP_MS = 2200;

/** B25-demo: the demo plays its own toggle while the spotlight lends it a
 *  still screen (see the header). `ready`: the plot is drawn. This chunk is
 *  mounted only on DESKTOP_FINE with motion on (the facade unmounts it on
 *  reduced motion and Pause), so it registers directly (lib/spotlight.ts),
 *  gated (`onOwn`) and live, with no window: it is only ever LENT a screen. */
function useThesisPlay(host: RefObject<HTMLDivElement | null>, ready: boolean) {
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    const h = host.current;
    const plot = h?.querySelector('svg[role="img"]');
    if (!h || !plot || !ready || touched) return;
    let timer = 0;
    const flip = () => {
      if (!h.matches(":hover")) h.querySelector<HTMLButtonElement>('button[aria-pressed="false"]')?.click();
    };
    // (the beat map's marker, data-beat="B25-demo", is the plot's server markup)
    const off = spotlight.registerScrollStar("B25-demo", plot, 1, {
      live: true,
      onOwn: (owned) => {
        window.clearInterval(timer);
        if (!owned) return;
        flip();
        timer = window.setInterval(flip, FLIP_MS);
      },
    });
    // the reader's own press (or a key in the demo) ends the play for good
    const stop = () => setTouched(true);
    h.addEventListener("pointerdown", stop);
    h.addEventListener("keydown", stop);
    return () => {
      window.clearInterval(timer);
      off();
      h.removeEventListener("pointerdown", stop);
      h.removeEventListener("keydown", stop);
    };
  }, [host, ready, touched]);
}

function measure(host: HTMLElement): Box | null {
  const svg = host.querySelector<SVGSVGElement>('svg[role="img"]');
  if (!svg) return null;
  const a = host.getBoundingClientRect();
  const b = svg.getBoundingClientRect();
  if (!b.width || !b.height) return null;
  const lines = Array.from(svg.children)
    .filter((c): c is SVGLineElement => c.tagName.toLowerCase() === "line")
    .map((l) => ({
      x1: l.getAttribute("x1") ?? "0",
      y1: l.getAttribute("y1") ?? "0",
      x2: l.getAttribute("x2") ?? "0",
      y2: l.getAttribute("y2") ?? "0",
      cls: l.getAttribute("class") ?? "",
      sw: l.getAttribute("stroke-width") ?? "1",
      dash: l.getAttribute("stroke-dasharray"),
    }));
  return {
    x: b.left - a.left,
    y: b.top - a.top,
    w: b.width,
    h: b.height,
    viewBox: svg.getAttribute("viewBox") ?? `0 0 ${b.width} ${b.height}`,
    lines,
  };
}

const same = (p: Box | null, q: Box | null) =>
  Boolean(p && q && Math.abs(p.x - q.x) < 0.5 && Math.abs(p.y - q.y) < 0.5 && Math.abs(p.w - q.w) < 0.5 && Math.abs(p.h - q.h) < 0.5);

export default function CurveDrawImpl({ host, choice }: { host: RefObject<HTMLDivElement | null>; choice: VariantChoice }) {
  const variant = useVariant(choice, "experiment.curve");
  const phase = useEnterOnce(host, { amount: 0.45, star: { id: "B25", weight: 1 } });
  const [box, setBox] = useState<Box | null>(null);
  const [done, setDone] = useState(false);
  const cover = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const covering = !done && (phase === "armed" || phase === "entered");
  const measured = box !== null;
  // drawn (or never hidden: already in view at mount, or skipped)
  useThesisPlay(host, done || phase === "static");

  // measure the plot while the cover is needed (and on every resize)
  useLayoutEffect(() => {
    const h = host.current;
    if (!covering || !h || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const b = measure(h);
      setBox((p) => (same(p, b) ? p : b));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(h);
    return () => ro.disconnect();
  }, [host, covering]);

  // entered: reveal once
  useEffect(() => {
    if (phase !== "entered" || done || !measured) return;
    const anims: Animation[] = [];
    if (variant === "alt") {
      const c = cover.current;
      if (c) anims.push(c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }));
    } else {
      const s = slider.current;
      const i = inner.current;
      const timing: KeyframeAnimationOptions = { duration: 1200, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "forwards" };
      if (s) anims.push(s.animate([{ transform: "translateX(0)" }, { transform: "translateX(100%)" }], timing));
      if (i) anims.push(i.animate([{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }], timing));
    }
    let live = true;
    Promise.all(anims.map((a) => a.finished)).then(
      () => {
        if (live) setDone(true);
      },
      () => undefined,
    );
    return () => {
      live = false;
      anims.forEach((a) => a.cancel());
    };
    // `measured` (not the box) gates the start: a re-measure mid-reveal must
    // not restart it
  }, [phase, done, variant, measured]);

  if (!covering || !box) return null;
  const alt = variant === "alt";
  const grid = (
    <svg viewBox={box.viewBox} preserveAspectRatio="none" aria-hidden="true" focusable="false" className="absolute inset-0 size-full">
      {box.lines.map((l, k) => (
        <line key={k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className={l.cls} strokeWidth={l.sw} strokeDasharray={l.dash ?? undefined} />
      ))}
    </svg>
  );
  return (
    <div
      ref={cover}
      aria-hidden="true"
      data-curve-cover={alt ? "fade" : "draw"}
      className="pointer-events-none absolute overflow-hidden"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, willChange: alt ? "opacity" : undefined }}
    >
      {alt ? (
        <div className="absolute inset-0" style={{ backgroundColor: "var(--surface-1)" }}>
          {grid}
        </div>
      ) : (
        // the slider starts EDGE px left of the plot (its soft edge outside
        // the clip, so no curve shows at frame 1) and travels its own width
        <div
          ref={slider}
          className="absolute inset-y-0"
          style={{
            left: -EDGE,
            width: box.w + EDGE,
            willChange: "transform",
            WebkitMaskImage: `linear-gradient(to right, transparent 0, #000 ${EDGE}px)`,
            maskImage: `linear-gradient(to right, transparent 0, #000 ${EDGE}px)`,
          }}
        >
          <div ref={inner} className="absolute inset-0" style={{ willChange: "transform", backgroundColor: "var(--surface-1)" }}>
            {/* the grid stays where the plot's grid is (it counter-slides) */}
            <div className="absolute inset-y-0" style={{ left: EDGE, width: box.w }}>
              {grid}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
