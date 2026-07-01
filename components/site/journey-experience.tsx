"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { JourneyCarousel } from "@/components/site/journey-carousel";
import { JourneyTrack } from "@/components/site/journey-track";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false, // server + first paint: assume the fallback
  );
}

/**
 * JourneyExperience — picks the presentation:
 *  • desktop + fine pointer + motion-on → the sticky-pinned horizontal track.
 *  • touch / coarse pointer / reduced-motion / <sm → the vertical carousel
 *    (role=tablist + arrow-keys + roving tabindex, all content in normal DOM
 *    flow). The pin is progressive enhancement.
 */
export function JourneyExperience() {
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");
  const wideEnough = useMediaQuery("(min-width: 640px)");
  const pinned = finePointer && wideEnough && !reduce;
  return pinned ? <JourneyTrack /> : <JourneyCarousel />;
}
