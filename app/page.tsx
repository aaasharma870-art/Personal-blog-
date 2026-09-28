import { SectionFrame } from "@/components/sections/SectionFrame";
import { rendererFor } from "@/components/sections/registry";
import { enabledSections, numberOf } from "@/lib/sections";

/** The home page is the manifest (lib/page.ts), rendered in order. Add,
 *  hide or reorder sections there — not here. */
export default function Home() {
  return (
    <>
      {enabledSections.map((entry, i) => {
        const Section = rendererFor(entry.type);
        return (
          <SectionFrame
            key={entry.id}
            entry={entry}
            prevEntry={enabledSections[i - 1] ?? null}
          >
            <Section entry={entry} number={numberOf(entry.id)} />
          </SectionFrame>
        );
      })}
    </>
  );
}
