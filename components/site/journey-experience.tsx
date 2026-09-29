"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { useFinePointer, useMediaQuery, useReducedMotion, useSaveData } from "@/lib/flags";
import { resolveVariant, sequenceFrames, type MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { JourneyCarousel } from "@/components/site/journey-carousel";
import { JourneyStack } from "@/components/site/journey-stack";
import { JourneyVoyage } from "@/components/site/journey-voyage";

/**
 * JourneyExperience — picks the voyage presentation (SPEC v2 SM-4, §13;
 * journey-voyage.BAR §3–§4). Hydration-safe: the server render and the
 * hydration pass are the STACK (every step + its still + the static chart:
 * the no-JS truth); right after mount it becomes
 *   desktop ≥ 1024 + fine pointer + motion on + no Save-Data → the VOYAGE
 *     (the sticky sea sequence beside the steps, 0 extra travel);
 *   otherwise → the CAROUSEL (stills, 0 sequence requests).
 * The variant (lib/variants.ts `journey.voyage`) is the manifest's choice,
 * or the ?variant=… preview after hydration.
 *   default "sea-scrub": JV scrubbed by scroll; stills MV-05a–d.
 *   alt "sail-on-cue":   JV-alt sailed on cue; the carousel's stills are the
 *     MV-05a–c alternates, while Now keeps MV-05d (the Black Pearl on the
 *     horizon: RECOGNIZABILITY S06 keeps the ship; JV-alt ends on it too).
 */
const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

/** The stills a variant shows on the stills paths. */
function stillsFor(stills: readonly MediaId[], variant: Variant): MediaId[] {
  if (variant !== "alt") return [...stills];
  return stills.map((id, i) => (i < stills.length - 1 ? (resolveVariant(id, "alt")?.id ?? id) : id));
}

export function JourneyExperience({
  choice,
  stills,
  sequence,
  captions,
  cartouche,
}: {
  choice: VariantChoice;
  stills: readonly MediaId[];
  sequence: MediaId | null;
  captions: readonly ReactNode[];
  cartouche: ReactNode;
}) {
  const hydrated = useSyncExternalStore(subscribeNothing, onClient, onServer);
  const variant = useVariant(choice, "journey.voyage");
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const wide = useMediaQuery("(min-width: 1024px)");
  const saveData = useSaveData();

  if (!hydrated) {
    return <JourneyStack stills={stillsFor(stills, variant)} captions={captions} cartouche={cartouche} />;
  }

  if (fine && wide && !reduce && !saveData) {
    const seq = sequence ? resolveVariant(sequence, variant) : null;
    return (
      <JourneyVoyage
        key={variant}
        variant={variant}
        stills={stills}
        frames={seq ? sequenceFrames(seq.id) : []}
        captions={captions}
        cartouche={cartouche}
      />
    );
  }

  return (
    <JourneyCarousel
      key={variant}
      variant={variant}
      stills={stillsFor(stills, variant)}
      captions={captions}
      cartouche={cartouche}
      saveData={saveData}
    />
  );
}
