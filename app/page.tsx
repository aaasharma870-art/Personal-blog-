import type { ReactNode } from "react";
import { SectionFrame } from "@/components/sections/SectionFrame";
import { rendererFor } from "@/components/sections/registry";
import { ActCardSection } from "@/components/sections/act-card/act-card-section";
import { enabledSections, numberOf, pageItems, type PageItem } from "@/lib/sections";

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

const isCredits = (item: PageItem) => item.kind === "section" && item.entry.type === "credits";

export default function Home() {
  return (
    <>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {pageItems.filter((item) => !isCredits(item)).map(renderItem)}
      </main>
      {pageItems.filter(isCredits).map(renderItem)}
    </>
  );
}
