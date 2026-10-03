"use client";

/* ============================================================================
   CUT OVERLAY (spec §3.1, §11.3) — OWNER: B1-SCROLL.
   The hard cut of a long jump (scrollToTarget({ cut: true }), or any jump
   longer than 3 viewports on DESKTOP_FINE): the fast lane, the chapter
   select, far menu and palette targets. Rendered by <StageLayers/> in
   StageLayerPortal("cut"), lazily and on DESKTOP_FINE only (DP-13; a portal,
   so never in the server markup): a fixed deep layer at --z-cut (35), above the
   stage, bars, game HUDs, the stop pill and toasts, BELOW the header (40),
   so the fast lane stays visible through it.
     opacity 0 → 1 (140 ms) → the immediate scroll and the focus move →
     the target world's fonts (≤ 300 ms, started at the click) and the
     re-land + ScrollTrigger.update(), still covered → 1 → 0 (220 ms).
   Opacity only (WAAPI, compositor); visibility hidden at rest so the layer
   never paints. Reduced motion / Pause: lib/smooth-scroll.ts jumps
   instantly and never calls the cut.
   ========================================================================== */

import { useEffect, useRef } from "react";
import { setCutRunner } from "@/lib/smooth-scroll";

const IN_MS = 140;
const OUT_MS = 220;

export function CutOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let gen = 0;
    return setCutRunner(async (jump) => {
      const mine = ++gen;
      for (const a of el.getAnimations()) a.cancel();
      el.dataset.cut = "on";
      const fadeIn = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN_MS, easing: "ease-in", fill: "forwards" });
      // the fade's `finished` is delivered with a frame: on a slow frame
      // pipeline (software raster) it could hold the jump for seconds, so a
      // wall-clock cap bounds the fast lane's latency (spec §11.3, ≤ 400 ms)
      await Promise.race([
        fadeIn.finished.catch(() => undefined),
        new Promise<void>((r) => window.setTimeout(r, IN_MS + 20)),
      ]);
      // superseded by a newer cut: it owns the layer (no jump, no fade-out)
      if (mine !== gen) return;
      try {
        // the jump, the focus, then the fonts and the re-land: under the layer
        await jump();
      } finally {
        // (a newer cut started meanwhile owns the layer: no fade-out)
        if (mine === gen) {
          const fadeOut = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT_MS, easing: "ease-out", fill: "forwards" });
          fadeIn.cancel();
          const done = () => {
            if (mine !== gen) return; // a newer cut owns the layer now
            fadeOut.cancel();
            delete el.dataset.cut;
          };
          fadeOut.finished.then(done, done);
        }
      }
    });
  }, []);

  return <div ref={ref} aria-hidden="true" data-cut-overlay="" className="cut-overlay" />;
}
