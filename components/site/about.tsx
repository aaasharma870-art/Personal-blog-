import { variantChoiceOf } from "@/lib/sections";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { AboutBio } from "@/components/site/about-bio";
import { AboutPillars } from "@/components/site/about-pillars";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/**
 * About — story `split` (Act I "The Crossing", pirates canvas; SPEC v2 §3
 * row 1; RECOGNIZABILITY S05). A first log entry, quiet and plain: the bio
 * and the method note on the left; on the right the four pillars sit as four
 * bearings around JACK'S COMPASS (lid open on its star chart; the red arrow
 * points at the pillar you reach for). The scene is named in visible text,
 * in the world face, opposite the h2 (rule b):
 *   JACK’S COMPASS — IT POINTS TO WHAT YOU WANT MOST • PIRATES OF THE CARIBBEAN
 * (cap.about; never beside a metric — About has none). Ground: the rhumb
 * lattice ≤ 4 %, desktop (PC-02). No backdrop video, no spotlight cards, no
 * ghost numerals (retired, SPEC §11.3).
 */
export function About({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} ground>
      <div className="grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <SectionHead
          id={titleId}
          number={number}
          label={entry.nav?.label ?? "About"}
          title="A builder of quantitative systems."
          className="lg:col-span-7"
        />
        {/* ≥ lg: opposite the h2; below lg it sits under the compass,
            which leads the pillars (AboutPillars) */}
        <SceneCaption
          k="cap.about"
          place="head"
          className="hidden lg:col-span-5 lg:block lg:justify-self-end lg:pb-3 lg:text-right lg:before:left-auto lg:before:right-0"
        />
      </div>
      <div className="mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          <AboutBio />
        </div>
        {/* #about-pillars: the stage's cue 2 anchor (PHASE3-SPEC §3.2 cue plan) */}
        <div id="about-pillars" className="lg:col-span-7">
          <AboutPillars choice={variantChoiceOf(entry)} caption={<SceneCaption k="cap.about" place="under" className="mt-0" />} />
        </div>
      </div>
    </WorldSection>
  );
}
