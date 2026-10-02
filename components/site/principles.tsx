import { principles } from "@/lib/content";
import { slot, variantChoiceOf } from "@/lib/sections";
import { pieceVariant } from "@/lib/variants";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import { PrinciplesStage } from "@/components/site/principles-stage";
import { MapHint } from "@/components/worlds/hp/map-hint";
import { PrincipleBody, SCRUB_ROOM } from "@/components/worlds/hp/principle-body";
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
 *
 * Phase 3 (W3-HP): the h2 arrives in character (B53, `words.title-hp`); the
 * map unfold is a weight-1 time star (B52) through the spotlight; room 05
 * carries the Act IV scroll-scrubbed sentence (B55, worlds/hp/principle-body);
 * the `hp-map` egg's hint sits on the banner; the wand cursor works the
 * whole section (components/worlds/hp/wand-cursor.tsx, desktop only).
 */
export function Principles({ entry, number }: SectionProps<"principles">) {
  const titleId = `${entry.id}-title`;
  const choice = variantChoiceOf(entry);
  return (
    <WorldSection entry={entry} labelledBy={titleId}>
      <PrinciplesStage
        choice={choice}
        ribbons={slot(entry, "emphasis") === "ribbon"}
        // the `hp-map` egg's hint, set here on the server for each
        // choreography: under the Map's banner, or under the ceiling band
        hint={{
          map: <MapHint className="inset-x-0 top-full mt-2 text-center" />,
          ceiling: <MapHint className="bottom-2 right-0 text-right" />,
        }}
        // room 05's body with the Act IV scrubbed sentence (B55), rendered
        // here on the server: the words data stays out of the client bundle
        scrub={{
          at: SCRUB_ROOM,
          node: (
            <PrincipleBody
              body={principles[SCRUB_ROOM]?.body ?? ""}
              index={SCRUB_ROOM}
              scrub={pieceVariant(choice, "scrub")}
              className="mt-tier-group max-w-body type-body text-fg-muted"
            />
          ),
        }}
        head={
          <SectionHead
            id={titleId}
            number={number}
            label={entry.nav?.label ?? "Principles"}
            title="A small philosophy of work."
            intro="Five ideas I actually use when I build. The names are sources, not decoration."
            // Act IV's one animated h2 (spec §8.2, B53): inked with a nib on
            // desktop (ALT: the ink bleeds in), once, through the spotlight
            inCharacter
            world="hp"
            beat="B53"
            variant={pieceVariant(choice, "title-hp")}
          />
        }
      />
    </WorldSection>
  );
}
