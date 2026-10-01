/* ============================================================================
   Phase-3 window globals (PHASE3-PLAN §4.1). Set by client code only.
   ========================================================================== */

import type { LenisLike } from "@/lib/smooth-scroll";

declare global {
  interface Window {
    /** The one Lenis instance while smooth scroll runs (lib/smooth-scroll.ts
     *  `setLenis`); the capture tools read `isScrolling`. */
    __lenis?: LenisLike;
    /** Clicks on `[data-enhance-queue]` recorded by the pre-paint boot script
     *  before the desktop enhancer binds; replayed, then cleared. */
    __enhanceQ?: { sel: string; t: number }[];
    /** <PageHydrated/>: every Suspense section has hydrated. */
    __pageHydrated?: boolean;
    /** lib/codec.ts + the intro controller: one codec answer per MP4 src. */
    __codecPicks?: Record<string, "video/mp4" | "video/webm">;
    /** The intro's hero-loop blob, handed to MediaFrame (lib/codec.ts handoffSource). */
    __introHandoff?: { src: string; url: string | null; at: number };
  }
}

export {};
