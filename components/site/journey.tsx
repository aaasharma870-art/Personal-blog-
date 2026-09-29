import type { CaptionKey } from "@/lib/film";
import { film } from "@/lib/film";
import { copyVisible, variantChoiceOf, worldOf } from "@/lib/sections";
import { Lettered, SceneCaption } from "@/components/primitives/scene-caption";
import { JourneyExperience } from "@/components/site/journey-experience";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/**
 * Journey — story `voyage` (Act I "The Crossing", pirates canvas; SPEC v2
 * SM-4; bars/journey-voyage.BAR.md; RECOGNIZABILITY S06). The voyage that
 * earned the method: four verbatim steps beside a sticky SEA that turns from
 * Port Royal's harbour at night → the fog around Isla de Muerta → the squall
 * → first light with the Black Pearl on the horizon (MV-05a–d / the JV
 * sequence), over a brass chart where Jack's compass hunts and settles on
 * each leg, the course kinks with one ember tick at the break, the cursed
 * Aztec medallion turns to its moonlit skull, and the brass X marks Now.
 *
 * Server-rendered here (so no quote text, caption copy gate or lettering
 * rule is ever evaluated on the client): the section head, the cartouche
 * (the act title lettered in the world face) and one SceneCaption per step —
 *   PORT ROYAL HARBOUR AT NIGHT • PIRATES OF THE CARIBBEAN
 *   THE FOG AROUND ISLA DE MUERTA • …
 *   THE CURSE OF THE AZTEC GOLD • …
 *   the registry line Q-PC-1 (lettered, via FilmQuote) • …
 * handed to the client experience as nodes. The variant choice is the
 * manifest's (lib/page.ts `variant`), resolved per piece on the client.
 */
const STEP_CAPTIONS: readonly CaptionKey[] = ["cap.journey.1", "cap.journey.2", "cap.journey.3", "cap.journey.4"];

export function Journey({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  const voyage = entry.props.variant === "voyage" ? entry.props : null;
  const world = worldOf(entry);

  // the cartouche: the act's title, lettered (the act's one display-face
  // moment besides its captions); hidden when the title may not render
  const act = entry.act ? film.acts.find((a) => a.id === entry.act) : undefined;
  const actTitle = act && copyVisible(act.title) ? act.title.text : null;
  const cartouche =
    actTitle && world !== "house" ? (
      <p
        aria-hidden="true"
        data-cartouche=""
        className="inline-block border-[3px] border-double border-(--w-brass) px-4 pb-1 pt-2"
      >
        <Lettered
          world={world}
          text={actTitle}
          className="block text-title leading-none tracking-[0.02em] text-(--w-brass)"
        />
      </p>
    ) : null;

  const captions = STEP_CAPTIONS.map((k) => <SceneCaption key={k} k={k} place="bl" />);

  return (
    <WorldSection entry={entry} labelledBy={titleId} ground>
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Journey"}
        title="How the methodology was earned."
        intro="Every part of the process I trust today exists because an earlier, prettier version of it failed me first. Step through it."
      />
      <JourneyExperience
        choice={variantChoiceOf(entry)}
        stills={voyage?.stills ?? []}
        sequence={voyage?.sequence ?? null}
        captions={captions}
        cartouche={cartouche}
      />
    </WorldSection>
  );
}
