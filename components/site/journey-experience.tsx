"use client";

import type { ReactNode } from "react";
import { useFinePointer, useMediaQuery, useReducedMotion } from "@/lib/flags";
import { JourneyCarousel } from "@/components/site/journey-carousel";
import { JourneyVoyage } from "@/components/site/journey-voyage";

/**
 * JourneyExperience — picks the voyage presentation (SPEC v2 SM-4, §13):
 *   desktop ≥ 1024 + fine pointer + motion on → the voyage (steps in normal
 *   flow beside a sticky chart with Jack's compass; 0 extra travel);
 *   mobile / coarse / reduced motion / Pause → the carousel with the compass
 *   at each leg's bearing. The hooks are hydration-safe (false on the server),
 *   so the server HTML is the carousel and the voyage enhances after mount.
 */
export function JourneyExperience({ nowCaption }: { nowCaption?: ReactNode }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const wide = useMediaQuery("(min-width: 1024px)");
  return fine && wide && !reduce ? (
    <JourneyVoyage nowCaption={nowCaption} />
  ) : (
    <JourneyCarousel nowCaption={nowCaption} />
  );
}
