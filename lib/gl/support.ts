/* ============================================================================
   GL SUPPORT — the contained WebGL layer's tier (PHASE3-SPEC §3.3):
   "gl" = the card transitions draw in WebGL; "css" = today's DOM
   choreographies on the new p ranges; "off" = the static settled card.
   `?gl=off` forces "off", `?gl=force` forces "gl" (capture runs).

   W1.0 STUB: always "off" (W2-GL implements the probe: DESKTOP_FINE, motion
   on, a WebGL2 context, the performance screen, `?skip=gl`). The hook is
   null on the server and during hydration, then the probed tier.
   ========================================================================== */

import { useSyncExternalStore } from "react";

export type GlTier = "gl" | "css" | "off";

export function glTier(): GlTier {
  return "off";
}

const noopSubscribe = () => () => {};

/** The tier (null until probed: the server and the hydration render). */
export function useGlTier(): GlTier | null {
  return useSyncExternalStore(noopSubscribe, glTier, () => null);
}
