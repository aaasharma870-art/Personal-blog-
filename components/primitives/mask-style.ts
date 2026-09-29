import type { CSSProperties } from "react";

/* ============================================================================
   MASK STYLES — the inline mask declarations the plates and the ceilings
   share, each with its -webkit- twin (Safari < 15.4, Chrome < 120 read only
   the prefixed properties). Pure: server- and client-safe.
   ========================================================================== */

/** One mask layer. */
export function maskStyle(mask: string): CSSProperties {
  return { maskImage: mask, WebkitMaskImage: mask };
}

/** Two mask layers INTERSECTED (visible only where both are): the standard
 *  `intersect` and its legacy -webkit- spelling, `source-in`. */
export function maskIntersect(a: string, b: string): CSSProperties {
  return {
    maskImage: `${a}, ${b}`,
    WebkitMaskImage: `${a}, ${b}`,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}
