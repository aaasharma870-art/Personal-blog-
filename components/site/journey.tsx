import { JourneyExperience } from "@/components/site/journey-experience";
import { FilmQuote } from "@/components/site/film-quote";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/**
 * Journey — story `voyage` (Act I "The Crossing", pirates canvas; SPEC v2
 * SM-4). The voyage that earned the method: four verbatim steps, a brass
 * course, Jack's compass settling on each real bearing, one ember tick where
 * the patterns failed out-of-sample, and the brass X at Now with its caption
 * (Q-PC-1, a registry line rendered by FilmQuote on the server and handed to
 * the client chart as a node). Ground: the rhumb lattice ≤ 4 % (desktop).
 * The generated voyage stills/sequence (MV-05a–d, JV) are planned; until
 * they are accepted the chart itself carries the section (no stale stills).
 */
export function Journey({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} ground>
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Journey"}
        title="How the methodology was earned."
        intro="Every part of the process I trust today exists because an earlier, prettier version of it failed me first. Step through it."
      />
      <JourneyExperience nowCaption={<FilmQuote id="Q-PC-1" rendition="caption" />} />
    </WorldSection>
  );
}
