import { slot, variantChoiceOf } from "@/lib/sections";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import { PrinciplesStage } from "@/components/site/principles-stage";
import type { SectionProps } from "@/components/sections/types";

/**
 * Principles — five numbered rows (SPEC v2 §3 row 13; Act IV "The Light",
 * hp; RECOGNIZABILITY S18 + T11). Body text verbatim from content.ts; the
 * numbers and "after …" attributions are Meta. Two choreographies, one DOM
 * contract (the same h2, <ol>, five h3s, no extra focus stops):
 *
 *   DEFAULT "marauders-map" — out of the Great Hall the page unfolds a
 *     sheet of parchment from its centre (3 panels, transform only). The
 *     five principles are ROOMS drawn in ink, joined by one corridor, and a
 *     pair of footprints walks the corridor with the reader (scroll-driven),
 *     turning in at each room's door under a YOU banner and fading behind.
 *     Caption: THE MARAUDER'S MAP • HARRY POTTER.
 *   ALT "lumos-candles" — the hall's candles persist: a field of floating
 *     candles hangs over the section head, and one candle per principle
 *     lights ("Lumos") as its row enters. Caption: LUMOS • HARRY POTTER.
 *
 * Both keep HP-07: the silver-blue (on parchment: ink) ribbons converge once
 * into each title's underline (the hp `ribbon` emphasis slot; another world
 * renders plain rows). Reduced motion / Pause / no JS: the final state —
 * the map unfolded with a static trail, or every candle lit.
 * Variant piece: `principles.map` (lib/variants.ts; ?variant=principles:alt).
 */
export function Principles({ entry, number }: SectionProps<"principles">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId}>
      <PrinciplesStage
        choice={variantChoiceOf(entry)}
        ribbons={slot(entry, "emphasis") === "ribbon"}
        head={
          <SectionHead
            id={titleId}
            number={number}
            label={entry.nav?.label ?? "Principles"}
            title="A small philosophy of work."
            intro="Five ideas I actually use when I build. The names are sources, not decoration."
          />
        }
      />
    </WorldSection>
  );
}
