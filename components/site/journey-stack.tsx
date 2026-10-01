"use client";

import type { ReactNode } from "react";
import { journey } from "@/lib/content";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { JourneyChart, Waypoint, WaypointLabel } from "@/components/site/journey-chart";
import { legHeading } from "@/components/worlds/pirates/voyage-chart";
import { beatAttrs } from "@/lib/beats";

/** The voyage's two beats on the static steps (spec §2.3 B10 step 1, B11 step 3). */
const STEP_BEATS: Readonly<Record<number, string>> = { 0: "B10", 2: "B11" };

/* ============================================================================
   JourneyStack — the Journey's SERVER / no-JS truth (journey-voyage.BAR §3
   "pre", §4 "No JS"): the chart strip with four plain anchor links, then the
   four verbatim steps, each beside its still (MV-05a–d) and its caption.
   It is what the server renders and what hydration renders; the voyage
   (desktop) or the carousel (touch / reduced motion / Save-Data) replaces
   it right after mount — the section sits far below the fold, so the swap
   is never seen. Static: the needle on leg 1, the medallion moonlit, the X
   inked; next/image stills are lazy (0 requests when swapped out first).
   ========================================================================== */

export function JourneyStack({
  stills,
  captions,
  cartouche,
}: {
  stills: readonly MediaId[];
  captions: readonly ReactNode[];
  cartouche: ReactNode;
}) {
  return (
    <div className="mt-tier-block" data-voyage="stack">
      {cartouche}
      <JourneyChart
        className="mt-tier-group max-w-[40rem] pb-12 pt-6"
        heading={legHeading(0)}
        lid="ajar"
        active={0}
        reached={0}
        plot="full"
        cursed
        xInked
        compassClassName="w-12 sm:w-16"
        medallionClassName="w-8 sm:w-11"
      >
        <ol aria-label="Voyage waypoints" className="absolute inset-0">
          {journey.map((s, i) => (
            <Waypoint key={s.marker} index={i}>
              <a
                href={`#journey-step-${i + 1}`}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-control px-1 type-meta text-fg-muted transition-colors duration-(--dur-micro) hover:text-fg motion-off:transition-none"
              >
                <WaypointLabel index={i} compact />
              </a>
            </Waypoint>
          ))}
        </ol>
      </JourneyChart>

      {journey.map((s, i) => {
        const still = stills[i];
        return (
          <article
            key={s.marker}
            id={`journey-step-${i + 1}`}
            {...(STEP_BEATS[i] ? beatAttrs(STEP_BEATS[i], { weight: 2 }) : {})}
            aria-labelledby={`journey-step-${i + 1}-title`}
            className="grid grid-cols-1 gap-tier-group border-t border-rule py-tier-block lg:grid-cols-12 lg:gap-x-6"
          >
            <div className="lg:col-span-5">
              <p className="type-meta text-fg-muted">
                <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                <span>{s.marker}</span>
              </p>
              <h3 id={`journey-step-${i + 1}-title`} tabIndex={-1} className="mt-tier-pair type-heading text-fg">
                {s.title}
              </h3>
              <p className="mt-tier-pair max-w-body type-body text-fg-muted">{s.body}</p>
            </div>
            <div className="scene-caption-host relative lg:col-span-7 lg:col-start-6">
              {still ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-frame bg-(--world-deep)">
                  <MediaFrame media={still} layout="fill" sizes="(min-width: 1024px) 55vw, 100vw" world="pirates" />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden h-1/2 bg-linear-to-t from-(--world-deep)/85 to-transparent sm:block"
                  />
                </div>
              ) : null}
              {captions[i]}
            </div>
          </article>
        );
      })}
    </div>
  );
}
