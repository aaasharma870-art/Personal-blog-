import { SectionFrame } from "@/components/sections/SectionFrame";
import { rendererFor } from "@/components/sections/registry";
import { enabledSections, numberOf, pageItems } from "@/lib/sections";

/** The home page is the manifest (lib/page.ts), rendered in the derived
 *  order `pageItems` (lib/sections.ts): every enabled section, with an act
 *  card item `{ kind: "act", id, transition, from, to, title, label, … }`
 *  before the first section of each act. Add, hide or reorder sections in
 *  lib/page.ts — not here.
 *
 *  M1 integrator: act items are derived but not rendered yet — the
 *  hero + act-cards builder renders them here with <ActCard> (SPEC §9.3). */
export default function Home() {
  return (
    <>
      {pageItems.map((item) => {
        if (item.kind === "act") return null;
        const i = enabledSections.indexOf(item.entry);
        const Section = rendererFor(item.entry.type);
        return (
          <SectionFrame
            key={item.entry.id}
            entry={item.entry}
            prevEntry={enabledSections[i - 1] ?? null}
          >
            <Section entry={item.entry} number={numberOf(item.entry.id)} />
          </SectionFrame>
        );
      })}
    </>
  );
}
