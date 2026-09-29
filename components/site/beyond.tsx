import { beyond } from "@/lib/content";
import { slot } from "@/lib/sections";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { SatchelStrip, ShoePrints } from "@/components/site/rdr2-graphite";
import { Handbill, TrailMap } from "@/components/site/rdr2-frontier";
import type { SectionProps } from "@/components/sections/types";

/**
 * Beyond — story `notes` (Act III "The Frontier"; SPEC v2 SM-15, rdr2
 * `frontier` dressing on the rd canvas). The life around the work, in the
 * dark foreground: four plain notes (verbatim content.ts), each an h3 with
 * its facts beside it — no zig-zag, no ghost numerals, no parallax motifs,
 * no stale backdrop video (retired, SPEC §11.3).
 *
 * The frontier dressing, M1 (code only; the MV-10 golden-hour band joins
 * when the plate is accepted, MEDIA-PLAN v2):
 *   - Athletics: a small ILLUSTRATIVE trail map (desktop, ≤ 30 %) whose fog
 *     lifts as you read, and a line of running-shoe prints drawn once
 *     (IC-RD-07; human prints, it is his running).
 *   - Creative: the satchel strip of his real kit (IC-RD-11).
 *   - The end: the WANTED handbill of confirmed facts that asks you to
 *     write (IC-RD-03 / RD-07) — the section's later HERO.
 * Leadership and Community stay plain rows: the camp is carried by the
 * ground alone. In any world whose `notes` dressing is not `frontier` the
 * same notes render plain (SPEC §12.4).
 */
export function Beyond({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  const frontier = slot(entry, "dressing").notes === "frontier";
  const handbill =
    frontier && entry.props.variant === "notes" && entry.props.handbill?.enabled !== false;

  return (
    <WorldSection entry={entry} labelledBy={titleId}>
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Beyond"}
        title="Discipline, service, and a trained eye."
        intro="The same temperament, away from the terminal."
      />

      <div className="mt-tier-block border-t border-rule">
        {beyond.map((b, i) => {
          const noteId = `${entry.id}-note-${i + 1}`;
          const athletics = frontier && b.kicker === "Athletics";
          const creative = frontier && b.kicker === "Creative";
          return (
            <Rise
              as="article"
              key={b.kicker}
              className="grid grid-cols-1 gap-tier-group border-b border-rule py-tier-block lg:grid-cols-12 lg:gap-x-6"
            >
              <div className="lg:col-span-4">
                <Meta fields={[b.kicker]} />
                <h3 id={noteId} className="mt-tier-pair type-heading text-fg">
                  {b.title}
                </h3>
                {athletics ? (
                  <div className="mt-tier-group hidden max-w-[24rem] lg:block">
                    <TrailMap />
                    <ShoePrints className="mt-tier-group" />
                  </div>
                ) : null}
              </div>
              <div className="lg:col-span-8">
                <dl aria-labelledby={noteId} className="grid grid-cols-1 gap-x-8 gap-y-tier-group sm:grid-cols-2">
                  {b.items.map((it) => (
                    <div key={it.head}>
                      <dt className="type-body text-fg">{it.head}</dt>
                      <dd className="mt-1 type-small text-fg-muted">{it.body}</dd>
                    </div>
                  ))}
                </dl>
                {creative ? <SatchelStrip className="mt-tier-block" /> : null}
              </div>
            </Rise>
          );
        })}
      </div>

      {handbill ? (
        <div className="mt-tier-block flex justify-center lg:justify-end lg:pr-[8%]">
          <Handbill />
        </div>
      ) : null}
    </WorldSection>
  );
}
