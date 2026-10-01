/* ============================================================================
   GL SUPPORT — the contained WebGL layer's tier (PHASE3-SPEC §3.3, §12.1;
   PHASE3-PLAN §3.5). OWNER: W2-GL. In the first-load bundle (GlGate's
   facade): keep it tiny; everything heavy is in the lazy GL chunk.

     "gl"   the card transitions draw in WebGL (the one context, lazy);
     "css"  today's DOM choreographies on the new p ranges + the CSS title
            mask (no WebGL2, a software / low-power device, `?gl=off`,
            `?skip=gl`, or the context probe failed);
     "off"  the GL layer and the Phase-3 card choreography are off: not
            DESKTOP_FINE, reduced motion or Pause, Save-Data / 2G / 3G.

   THE PROBE IS THE PAGE CONTEXT: this module only pre-screens (media query,
   motion, network, `WebGL2RenderingContext`, cores, memory). The real test
   — `getContext("webgl2", { failIfMajorPerformanceCaveat:true, … })` and
   MAX_TEXTURE_SIZE ≥ 4096 — happens once, on the page's one GL canvas, in
   the lazy runtime (lib/gl/gl-lock.ts), which reports back through
   `setContextTier()`. Until then a pre-screened device reads "gl"
   ("eligible; the context is created at ladder step 4"); a failed probe
   downgrades every subscriber to "css". There is never a throwaway context.

   `?gl=force` (capture runs): skips the device heuristics and the
   performance-caveat flag (SwiftShader renders), never the a11y gates
   (reduced motion / Pause / phones stay "off"). `?gl=off` and `?skip=gl`
   show the css tier.

   HYDRATION: `useGlTier()` is null on the server and during hydration, then
   the tier; it follows live changes (Pause, OS reduced motion, resizing out
   of DESKTOP_FINE, the context probe) within the same task.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange, parseSkipFlags, shouldSkip } from "../flags";

export type GlTier = "gl" | "css" | "off";

type Nav = Navigator & {
  deviceMemory?: number;
  connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
};

/** The context probe's answer (set by the lazy runtime); null = not tried. */
let probed: "gl" | "css" | null = null;
const listeners = new Set<() => void>();
let installed = false;
let last: GlTier | null = null;

const param = (): string | null => new URLSearchParams(window.location.search).get("gl");

/** `?gl=force`: capture runs render GL in headless (SwiftShader). */
export function glForced(): boolean {
  return typeof window !== "undefined" && param() === "force";
}

/** The current tier (non-hook; "off" on the server). For effects, handlers
 *  and the lazy runtime; render code uses `useGlTier()`. */
export function glTier(): GlTier {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "off";
  const nav = navigator as Nav;
  const c = nav.connection;
  if (
    !window.matchMedia(DESKTOP_FINE).matches ||
    motionOffNow() ||
    c?.saveData ||
    /(?:^|-)(?:2g|3g)$/.test(c?.effectiveType ?? "")
  )
    return "off";
  const q = param();
  if (q === "off" || shouldSkip("gl", parseSkipFlags(window.location.search))) return "css";
  if (typeof WebGL2RenderingContext === "undefined") return "css";
  if (q !== "force" && ((nav.hardwareConcurrency || 8) < 4 || (nav.deviceMemory ?? 8) < 4)) return "css";
  return probed ?? "gl";
}

function notify(): void {
  const t = glTier();
  if (t === last) return;
  last = t;
  (window as Window & { __glTier?: GlTier }).__glTier = t;
  listeners.forEach((l) => l());
}

function install(): void {
  if (installed || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  installed = true;
  last = glTier();
  (window as Window & { __glTier?: GlTier }).__glTier = last;
  window.matchMedia(DESKTOP_FINE).addEventListener("change", notify);
  onMotionOffChange(notify);
  (navigator as Nav).connection?.addEventListener?.("change", notify);
}

/** NON-HOOK subscription (the lazy runtime): `fn` runs whenever the tier
 *  may have changed; read `glTier()` inside. Returns the unsubscribe. */
export function onGlTierChange(fn: () => void): () => void {
  install();
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The lazy runtime's context probe result ("css" = the context failed or
 *  is below the bar; the page then stays on the css tier). */
export function setContextTier(t: "gl" | "css"): void {
  probed = t;
  if (typeof window !== "undefined") notify();
}

/** The tier (null until probed: the server and the hydration render). */
export function useGlTier(): GlTier | null {
  return useSyncExternalStore(onGlTierChange, glTier, () => null);
}
