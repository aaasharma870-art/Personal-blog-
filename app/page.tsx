import { Suspense, type ReactNode } from "react";
import { SectionFrame } from "@/components/sections/SectionFrame";
import { rendererFor } from "@/components/sections/registry";
import { ActCardSection } from "@/components/sections/act-card/act-card-section";
import { enabledSections, numberOf, pageItems, type PageItem } from "@/lib/sections";
import { StageGate } from "@/components/stage/stage-gate";
import { LetterboxBars } from "@/components/stage/letterbox-bars";
import { StageLayers } from "@/components/stage/stage-layers";
import { PageHydrated } from "@/components/site/page-hydrated";

/** The home page is the manifest (lib/page.ts), rendered in the derived
 *  order `pageItems` (lib/sections.ts): every enabled section, with an act
 *  card item `{ kind: "act", id, transition, from, to, title, label, … }`
 *  before the first section of each act. Add, hide or reorder sections in
 *  lib/page.ts — not here.
 *
 *  Act items render as letterboxed loading-reel interstitials
 *  (components/sections/act-card: SPEC v2 §8.2, §9.3); each card owns its
 *  plane (the incoming world's deep), so it needs no SectionFrame.
 *
 *  M2: this page owns <main id="main"> (the root layout no longer does), so
 *  the `credits` section (SPEC SM-13: "rendered as the page <footer>")
 *  renders AFTER </main> and stays the contentinfo landmark. The validator
 *  keeps credits the last enabled entry. */
function renderItem(item: PageItem): ReactNode {
  if (item.kind === "act") return <ActCardSection key={item.id} item={item} />;
  const i = enabledSections.indexOf(item.entry);
  const Section = rendererFor(item.entry.type);
  return (
    <SectionFrame key={item.entry.id} entry={item.entry} prevEntry={enabledSections[i - 1] ?? null}>
      <Section entry={item.entry} number={numberOf(item.entry.id)} />
    </SectionFrame>
  );
}

/** Every item but the hero hydrates in its own Suspense boundary (nothing
 *  here suspends: the server HTML is the same, plus boundary comments). The
 *  root's first render then covers the hero only, and each section
 *  hydrates as its own interruptible task — a click on Play (or anything
 *  else) never waits behind the whole page's hydration. */
function hydrateApart(item: PageItem): ReactNode {
  if (item.kind === "section" && item.entry.type === "hero") return renderItem(item);
  const key = item.kind === "act" ? item.id : item.entry.id;
  return (
    <Suspense key={key} fallback={null}>
      {renderItem(item)}
    </Suspense>
  );
}

const isCredits = (item: PageItem) => item.kind === "section" && item.entry.type === "credits";

export default function Home() {
  return (
    <>
      {/* Phase 3 (PHASE3-PLAN §4.2): the stage, the letterbox bars and the
          fixed layers sit before <main>; W1.0 stubs render nothing. */}
      <StageGate />
      <LetterboxBars />
      <StageLayers />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {pageItems.filter((item) => !isCredits(item)).map(hydrateApart)}
      </main>
      {pageItems.filter(isCredits).map(hydrateApart)}
      {/* the LAST Suspense child: it hydrates after every section (B1-INTRO) */}
      <Suspense fallback={null}>
        <PageHydrated />
      </Suspense>
    </>
  );
}
