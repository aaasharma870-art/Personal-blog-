"use client";

import type { RefObject } from "react";

/* ============================================================================
   LETTERBOX BARS (spec §7.4, K3) — OWNER: B1-STAGE.
   <LetterboxBars/> is mounted by app/page.tsx before <main>: two fixed bars
   at --z-bars that breathe (close / open) around the act cards.
   useLetterboxScene(ref, { close, open }) ties a host's close / open to
   ScrollTrigger position strings. Reduced motion and phones: a no-op, and
   the bars never mount.
   W1.0 stub: the bars render nothing and the hook does nothing.
   ========================================================================== */

export type LetterboxSceneOptions = {
  close: readonly [start: string, end: string];
  open: readonly [start: string, end: string];
};

export function LetterboxBars(): null {
  return null;
}

export function useLetterboxScene(ref: RefObject<Element | null>, o: LetterboxSceneOptions): void {
  void ref;
  void o;
}
