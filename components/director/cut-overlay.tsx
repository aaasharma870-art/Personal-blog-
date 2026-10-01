"use client";

/* ============================================================================
   CUT OVERLAY (spec §3.1, §11.3) — OWNER: B1-SCROLL.
   The hard cut of a long jump (scrollToTarget({ cut: true }), or any jump
   longer than 3 viewports ≥ 64rem): the fast lane, the chapter select, far
   menu and palette targets. Rendered by <StageLayers/> in
   StageLayerPortal("cut"): a fixed deep layer at --z-cut (35), above the
   stage, bars, game HUDs, the stop pill and toasts, BELOW the header (40),
   so the fast lane stays visible through it.
     opacity 0 → 1 (140 ms) while the target world's fonts get ready →
     the immediate scroll + ScrollTrigger.update() → 1 → 0 (220 ms).
   Opacity only (WAAPI, compositor); visibility hidden at rest so the layer
   never paints. Reduced motion / Pause: lib/smooth-scroll.ts jumps
   instantly and never calls the cut. Server markup is one empty div, the
   same for every visitor.
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
    return setCutRunner(async (ready, jump) => {
      const mine = ++gen;
      for (const a of el.getAnimations()) a.cancel();
      el.dataset.cut = "on";
      const fadeIn = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN_MS, easing: "ease-in", fill: "forwards" });
      await Promise.all([fadeIn.finished.catch(() => undefined), ready.catch(() => undefined)]);
      try {
        jump();
      } finally {
        const fadeOut = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT_MS, easing: "ease-out", fill: "forwards" });
        fadeIn.cancel();
        const done = () => {
          if (mine !== gen) return; // a newer cut owns the layer now
          fadeOut.cancel();
          delete el.dataset.cut;
        };
        fadeOut.finished.then(done, done);
      }
    });
  }, []);

  return <div ref={ref} aria-hidden="true" data-cut-overlay="" className="cut-overlay" />;
}
