/* ============================================================================
   BOOT HEAD SCRIPT (spec §3.1, plan §0.1 #7) — OWNER: B1-SCROLL.
   Rendered in <head> by app/layout.tsx on EVERY request, beside the
   prologue's IntroHeadScript. It will set `html.js` (and
   `data-motion-boot="paused"` for a Paused session) before the first paint,
   so the `boot:` / `stage-live:` Tailwind variants (app/globals.css) and
   bootGateOn() (lib/flags.ts) are right from first paint.
   W1.0 stub: renders nothing (no script ships; the variants never match).
   ========================================================================== */

export function BootHeadScript(): null {
  return null;
}
