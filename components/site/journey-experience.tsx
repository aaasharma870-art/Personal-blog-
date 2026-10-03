"use client";

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  motionOffNow,
  onMotionOffChange,
  useFinePointer,
  useMediaQuery,
  useMotionPausedAtBoot,
  useOsReducedMotion,
  useSaveData,
} from "@/lib/flags";
import { resolveVariant, sequenceFrames, type MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { JourneyCarousel } from "@/components/site/journey-carousel";
import { JourneyStack } from "@/components/site/journey-stack";

/**
 * JourneyExperience — picks the voyage presentation (SPEC v2 SM-4, §13;
 * journey-voyage.BAR §3–§4). Hydration-safe: the server render and the
 * hydration pass are the STACK (every step + its still + the static chart:
 * the no-JS truth); right after mount it becomes
 *   desktop ≥ 1024 + fine pointer + no OS reduced motion + no Save-Data →
 *     the VOYAGE (the sticky sea sequence beside the steps, 0 extra travel);
 *   otherwise → the CAROUSEL (stills, 0 sequence requests).
 * The variant (lib/variants.ts `journey.voyage`) is the manifest's choice,
 * or the ?variant=… preview after hydration.
 *   default "sea-scrub": JV scrubbed by scroll; stills MV-05a–d.
 *   alt "sail-on-cue":   JV-alt sailed on cue; the carousel's stills are the
 *     MV-05a–c alternates, while Now keeps MV-05d (the Black Pearl on the
 *     horizon: RECOGNIZABILITY S06 keeps the ship; JV-alt ends on it too).
 *
 * PHASE 3 (W3-PIRATES):
 * - The voyage is a LAZY chunk (DP-13: desktop-only code never ships to
 *   phones; plan §7 budget): the stack stands in until it arrives.
 * - The layout keys on what the page view STARTED with, never on the Pause
 *   toggle (PHASE3-SPEC §12.2 "layout unchanged", P3-2 #11): Pause mid-
 *   scroll keeps the voyage, static (its sea holds the step's still); a page
 *   view that started paused on the desktop keeps the server's stack (no
 *   reflow after hydration) until motion is resumed. OS reduced motion keeps
 *   today's carousel (P3-0).
 * - The section head is passed in (`head`): the voyage's sticky column
 *   starts level with the h2 (spec §2.3 B09: the stage → voyage window
 *   match cut), the stack and the carousel keep it above, as before.
 */
const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

type VoyageProps = ComponentProps<typeof import("@/components/site/journey-voyage").JourneyVoyage>;

/** Not safeLazy (null): if the voyage's chunk fails to load (deploy skew, a
 *  flaky network), the stack, which carries every step, shows the content. */
const JourneyVoyage = lazy(() =>
  import("@/components/site/journey-voyage").then(
    (m) => ({ default: m.JourneyVoyage }),
    () => ({ default: (p: VoyageProps) => <JourneyStack {...p} stills={stillsFor(p.stills, p.variant)} /> }),
  ),
);

/** The stills a variant shows on the stills paths. */
function stillsFor(stills: readonly MediaId[], variant: Variant): MediaId[] {
  if (variant !== "alt") return [...stills];
  return stills.map((id, i) => (i < stills.length - 1 ? (resolveVariant(id, "alt")?.id ?? id) : id));
}

export function JourneyExperience({
  choice,
  head = null,
  stills,
  sequence,
  captions,
  cartouche,
  gull = null,
  coin = null,
  marginal = null,
}: {
  choice: VariantChoice;
  /** The section head (server-rendered). */
  head?: ReactNode;
  stills: readonly MediaId[];
  sequence: MediaId | null;
  captions: readonly ReactNode[];
  cartouche: ReactNode;
  /** B12: the gull fly-through (server <FlyThrough>), voyage only. */
  gull?: ReactNode;
  /** pc-coin's hotspot and the "parley?" marginal (desktop only, by CSS). */
  coin?: ReactNode;
  marginal?: ReactNode;
}) {
  const hydrated = useSyncExternalStore(subscribeNothing, onClient, onServer);
  const variant = useVariant(choice, "journey.voyage");
  const osReduce = useOsReducedMotion();
  const pausedAtBoot = useMotionPausedAtBoot();
  const fine = useFinePointer();
  const wide = useMediaQuery("(min-width: 1024px)");
  const saveData = useSaveData();
  // a view that started paused keeps the stack until motion is first
  // resumed; from then on it is the voyage (a later Pause keeps it, static)
  // (a listener, not useMotionPaused(): the Pause toggle never re-renders
  // the journey, so the click's other listeners stop at once; spec §12.2)
  const [resumed, setResumed] = useState(false);
  useEffect(() => {
    if (!hydrated || !pausedAtBoot || resumed) return;
    return onMotionOffChange(() => {
      if (!motionOffNow()) setResumed(true);
    });
  }, [hydrated, pausedAtBoot, resumed]);

  const stack = (
    <JourneyStack
      head={head}
      stills={stillsFor(stills, variant)}
      captions={captions}
      cartouche={cartouche}
      coin={coin}
      marginal={marginal}
    />
  );

  if (!hydrated) return stack;

  if (fine && wide && !osReduce && !saveData) {
    // started paused: the server layout stays until motion is resumed
    if (pausedAtBoot && !resumed) return stack;
    const seq = sequence ? resolveVariant(sequence, variant) : null;
    return (
      <Suspense fallback={stack}>
        <JourneyVoyage
          key={variant}
          variant={variant}
          head={head}
          stills={stills}
          frames={seq ? sequenceFrames(seq.id) : []}
          captions={captions}
          cartouche={cartouche}
          gull={gull}
          coin={coin}
          marginal={marginal}
        />
      </Suspense>
    );
  }

  return (
    <JourneyCarousel
      key={variant}
      head={head}
      variant={variant}
      stills={stillsFor(stills, variant)}
      captions={captions}
      cartouche={cartouche}
      saveData={saveData}
      coin={coin}
      marginal={marginal}
    />
  );
}
