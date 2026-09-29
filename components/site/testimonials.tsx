import { testimonials } from "@/lib/content";
import { slot } from "@/lib/sections";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { CampfireSketch, FirelightRead } from "@/components/site/rdr2-graphite";
import type { SectionProps } from "@/components/sections/types";

/**
 * Voices — the teacher quotes (SPEC v2 SM-16; `quotes` on rd deep, Act III,
 * rdr2 `campfire` dressing). Night: people are HEARD, not shown (RD-P6). The
 * three quotes sit left in the dark foreground, verbatim content.ts; the
 * lead quote is READ INTO FIRELIGHT (HP-03′: a one-shot mask muted → ink
 * from the fire's side; no glow on text). At right, the camp is drawn in
 * pencil — a stone ring, crossed logs, two tents barely there — until the
 * MV-11 campfire plate (media: the fire's light belongs there, Law 1) is
 * accepted. Retired: spotlight cards, tilt, monogram chips, giant quote
 * glyphs and the stale backdrop (SPEC §11.3). No faces anywhere (H1).
 */
export function Testimonials({ entry, number }: SectionProps<"quotes">) {
  const titleId = `${entry.id}-title`;
  const campfire = slot(entry, "dressing").quotes === "campfire";
  const [lead, ...rest] = testimonials;

  return (
    <WorldSection entry={entry} labelledBy={titleId}>
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Voices"}
        title="In their words."
      />

      <div className="mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-7">
          {lead ? (
            <figure>
              {campfire ? (
                <FirelightRead>
                  <blockquote className="font-serif text-lead leading-[1.4] font-normal italic tracking-[-0.01em] lg:text-heading lg:leading-[1.35]">
                    {`“${lead.quote}”`}
                  </blockquote>
                </FirelightRead>
              ) : (
                <blockquote className="font-serif text-lead leading-[1.4] font-normal italic tracking-[-0.01em] text-fg lg:text-heading lg:leading-[1.35]">
                  {`“${lead.quote}”`}
                </blockquote>
              )}
              <figcaption className="mt-tier-group">
                <Meta fields={[<cite key="n" className="not-italic">{lead.name}</cite>, lead.roleLine]} />
              </figcaption>
            </figure>
          ) : null}

          <ul aria-label="More from teachers" className="mt-tier-block space-y-tier-block border-t border-rule pt-tier-block">
            {rest.map((t, i) => (
              <Rise as="li" key={t.name} delay={i * 0.08}>
                <figure>
                  <blockquote className="max-w-body type-body text-fg">{`“${t.quote}”`}</blockquote>
                  <figcaption className="mt-tier-pair">
                    <Meta fields={[<cite key="n" className="not-italic">{t.name}</cite>, t.roleLine]} />
                  </figcaption>
                </figure>
              </Rise>
            ))}
          </ul>
        </div>

        {campfire ? (
          <div className="order-first mx-auto w-full max-w-[14rem] lg:order-none lg:col-span-4 lg:col-start-9 lg:mx-0 lg:max-w-none">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+4rem)]">
              <CampfireSketch />
            </div>
          </div>
        ) : null}
      </div>
    </WorldSection>
  );
}
