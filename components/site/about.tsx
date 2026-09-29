import { AboutBio } from "@/components/site/about-bio";
import { AboutPillars } from "@/components/site/about-pillars";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/**
 * About — story `split` (Act I "The Crossing", pirates canvas; SPEC v2 §3
 * row 1). A first log entry, quiet and plain: the bio and the method note on
 * the left; on the right the four pillars sit as four bearings on an
 * original rhumb rose drawn in brass once on entry (TA-06). Ground: the
 * rhumb lattice ≤ 4 %, desktop (PC-02). No backdrop video, no spotlight
 * cards, no ghost numerals (retired, SPEC §11.3).
 */
export function About({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} ground>
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "About"}
        title="A builder of quantitative systems."
      />
      <div className="mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          <AboutBio />
        </div>
        <div className="lg:col-span-7">
          <AboutPillars />
        </div>
      </div>
    </WorldSection>
  );
}
