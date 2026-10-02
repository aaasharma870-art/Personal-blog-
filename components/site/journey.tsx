import type { CaptionKey } from "@/lib/film";
import { film } from "@/lib/film";
import { copyText, copyVisible, variantChoiceOf, worldOf } from "@/lib/sections";
import { pieceVariant } from "@/lib/variants";
import { EggHint } from "@/components/eggs/egg-hint";
import { EggHotspot } from "@/components/eggs/egg-hotspot";
import { Lettered, SceneCaption } from "@/components/primitives/scene-caption";
import { JourneyExperience } from "@/components/site/journey-experience";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import { FlyThrough } from "@/components/words/fly-through";
import type { SectionProps } from "@/components/sections/types";

/**
 * Journey — story `voyage` (Act I "The Crossing", pirates canvas; SPEC v2
 * SM-4; bars/journey-voyage.BAR.md; RECOGNIZABILITY S06). The voyage that
 * earned the method: four verbatim steps beside a sticky SEA that turns from
 * Port Royal's harbour at night → the fog around Isla de Muerta → Calypso's
 * storm → first light with the Black Pearl on the horizon (MV-05a–d / the JV
 * sequence), over a brass chart where Jack's compass hunts and settles on
 * each leg, the course kinks with one ember tick at the break, the cursed
 * Aztec medallion turns to its moonlit skull, and the brass X marks Now.
 *
 * Server-rendered here (so no quote text, caption copy gate or lettering
 * rule is ever evaluated on the client): the section head, the cartouche
 * (the act title lettered in the world face) and one SceneCaption per step —
 *   PORT ROYAL HARBOUR AT NIGHT • PIRATES OF THE CARIBBEAN
 *   THE FOG AROUND ISLA DE MUERTA • …
 *   CALYPSO’S STORM • … (the squall it shows: ART-DIRECTOR #9)
 *   the registry line Q-PC-1 (lettered, via FilmQuote) • …
 * handed to the client experience as nodes. The variant choice is the
 * manifest's (lib/page.ts `variant`), resolved per piece on the client.
 *
 * PHASE 3 (W3-PIRATES; PHASE3-SPEC §2.3 B09–B12, §9.1 #4–#5), also handed
 * over as server nodes (0 first-load JS for the primitives):
 *   - the section head: the voyage's sticky column starts level with it
 *     (B09: the stage's MV-05a meets the window's JV frame 0);
 *   - B12 the gull fly-through (Act I's one), flown across the voyage
 *     window's SKY on scroll-idle at the journey's end;
 *   - `pc-coin`: the ≥ 44 px hotspot over the Aztec medallion ("Hold the
 *     coin to the moonlight", DESKTOP_FINE only);
 *   - the faint "parley?" marginal by the brass X (the parley spell's hint,
 *     in <EggHint>: gone when the eggs are off), desktop only.
 */
const STEP_CAPTIONS: readonly CaptionKey[] = ["cap.journey.1", "cap.journey.2", "cap.journey.3", "cap.journey.4"];

/** B12's flight across the sky zone (fractions of the zone; W2-WORDS). */
const GULL_PATH = {
  points: [
    [-0.08, 0.3],
    [0.35, 0.2],
    [0.7, 0.26],
    [1.08, 0.16],
  ],
  ms: 4200,
} as const;

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
  const choice = variantChoiceOf(entry);

  const head = (
    <SectionHead
      id={titleId}
      number={number}
      label={entry.nav?.label ?? "Journey"}
      title="How the methodology was earned."
      intro="Every part of the process I trust today exists because an earlier, prettier version of it failed me first. Step through it."
    />
  );
  const gull = <FlyThrough kind="gull" beat="B12" path={GULL_PATH} variant={pieceVariant(choice, "flythrough")} />;
  const coin = <EggHotspot hunt="pc-coin" label="egg.hunt.hint.pc-coin" className="h-14 w-14" />;
  // full brass (5.3:1 on the pirates canvas): "faint" is its size and
  // place, never a contrast below AA
  const parley = copyText("egg.hunt.hint.pc-parley");
  const marginal = copyVisible(parley) ? (
    <EggHint egg="parley">
      <span className="hidden whitespace-nowrap font-world-head text-base leading-none text-(--w-brass) df:block">
        {parley.text}
      </span>
    </EggHint>
  ) : null;

  return (
    <WorldSection entry={entry} labelledBy={titleId} ground>
      <JourneyExperience
        choice={choice}
        head={head}
        stills={voyage?.stills ?? []}
        sequence={voyage?.sequence ?? null}
        captions={captions}
        cartouche={cartouche}
        gull={gull}
        coin={coin}
        marginal={marginal}
      />
    </WorldSection>
  );
}
