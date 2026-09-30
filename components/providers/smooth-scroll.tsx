"use client";

/* ============================================================================
   SMOOTH SCROLL (spec §3.1, P3-2) — OWNER: B1-SCROLL.
   Mounted once by app/layout.tsx inside MotionProvider → ChromeGate.
   On DESKTOP_FINE with motion on it will start Lenis (ladder step 1) and
   drive GSAP's ticker; phones, reduced motion and Pause keep native scroll.
   This file and lib/gsap.ts are the only two that may import `lenis` /
   `gsap` at runtime (eslint.config.mjs).
   W1.0 stub: renders nothing and starts nothing (the page is unchanged).
   ========================================================================== */

export function SmoothScroll(): null {
  return null;
}
