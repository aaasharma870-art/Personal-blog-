import { testimonials } from "@/lib/content";
import { slot, variantChoiceOf } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { FirelightRead } from "@/components/site/rdr2-graphite";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { EggHotspot } from "@/components/eggs/egg-hotspot";
import { CampfireStage } from "@/components/worlds/rdr2/campfire-stage";
import type { SectionProps } from "@/components/sections/types";

/**
 * Voices — the teacher quotes (SPEC v2 SM-16; `quotes` on rd deep, Act III,
 * rdr2 `campfire` dressing; RECOGNIZABILITY S16). Night at the gang's camp:
 * people are HEARD, not shown (RD-P6). The three quotes sit in the dark
 * foreground, verbatim content.ts; the lead quote is READ INTO FIRELIGHT
 * (a one-shot mask muted → ink from the fire's side; no glow on text).
 *
 * The camp (components/worlds/rdr2/campfire-stage):
 *   DEFAULT camp-at-dusk — the iconic camp plate stays behind the quotes as
 *     you read (a sticky full-bleed backdrop, the deep holding across the
 *     quote column and falling away by 65 %), fading up from --rd-deep out
 *     of the journal; "THE GANG'S CAMP AT DUSK • RED DEAD REDEMPTION 2" in
 *     the section head, under the h2.
 *   ALT fireside-loop — the campfire band (MV-11 → the MV-11L loop, desktop,
 *     one decoder) opens from a cutscene letterbox; "THE CAMPFIRE • RED DEAD
 *     REDEMPTION 2" under it; each voice is read into firelight in turn.
 * The fire's position (iconic-camp `marks.fire`) is where card III→IV's
 * embers rise. Retired: spotlight cards, tilt, monogram chips, giant quote
 * glyphs and the stale backdrop (SPEC §11.3). No faces anywhere (H1).
 * Any world whose `quotes` dressing is not `campfire` renders the plain list.
 *
 * Phase 3 (B47): the camp drifts toward the fire, the night veil, the lead
 * quote read into firelight, fireflies; rd-fire's ≥ 44 px hotspot "Warm your
 * hands by the fire" sits on the fire (DESKTOP_FINE; the stage places it).
 */
const LEAD_QUOTE = "font-serif text-lead leading-[1.4] font-normal italic tracking-[-0.01em] lg:text-heading lg:leading-[1.35]";

export function Testimonials({ entry, number }: SectionProps<"quotes">) {
  const titleId = `${entry.id}-title`;
  const campfire = slot(entry, "dressing").quotes === "campfire";
  const { media, altMedia, loop } = entry.props;
  const [lead, ...rest] = testimonials;

  const head = (
    <SectionHead id={titleId} number={number} label={entry.nav?.label ?? "Voices"} title="In their words." />
  );
  const cite = (name: string, roleLine: string) => (
    <Meta fields={[<cite key="n" className="not-italic">{name}</cite>, roleLine]} />
  );

  if (campfire && media) {
    return (
      <WorldSection entry={entry} labelledBy={titleId} className="overflow-x-clip">
        <CampfireStage
          choice={variantChoiceOf(entry)}
          media={media}
          altMedia={altMedia}
          loop={loop}
          head={head}
          lead={
            lead ? (
              <figure>
                <FirelightRead>
                  <blockquote className={LEAD_QUOTE}>{`“${lead.quote}”`}</blockquote>
                </FirelightRead>
                <figcaption className="mt-tier-group">{cite(lead.name, lead.roleLine)}</figcaption>
              </figure>
            ) : null
          }
          rest={rest.map((t) => ({
            key: t.name,
            quote: <blockquote className="max-w-body type-body text-fg">{`“${t.quote}”`}</blockquote>,
            cite: cite(t.name, t.roleLine),
          }))}
          caption={<SceneCaption k="cap.voices" place="head" />}
          captionUnder={<SceneCaption k="cap.voices" place="under" />}
          altCaption={<SceneCaption k="cap.voices.alt" place="under" />}
          fireSpot={<EggHotspot hunt="rd-fire" label="egg.hunt.hint.rd-fire" className="size-16" />}
        />
      </WorldSection>
    );
  }

  return (
    <WorldSection entry={entry} labelledBy={titleId}>
      {head}
      <div className="mt-tier-block max-w-[48rem]">
        {lead ? (
          <figure>
            <blockquote className={cn(LEAD_QUOTE, "text-fg")}>{`“${lead.quote}”`}</blockquote>
            <figcaption className="mt-tier-group">{cite(lead.name, lead.roleLine)}</figcaption>
          </figure>
        ) : null}
        <ul aria-label="More from teachers" className="mt-tier-block space-y-tier-block border-t border-rule pt-tier-block">
          {rest.map((t, i) => (
            <Rise as="li" key={t.name} delay={i * 0.08}>
              <figure>
                <blockquote className="max-w-body type-body text-fg">{`“${t.quote}”`}</blockquote>
                <figcaption className="mt-tier-pair">{cite(t.name, t.roleLine)}</figcaption>
              </figure>
            </Rise>
          ))}
        </ul>
      </div>
    </WorldSection>
  );
}
