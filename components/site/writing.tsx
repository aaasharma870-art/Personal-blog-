import { writing } from "@/lib/content";
import { slot, variantChoiceOf } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { Meta, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { JournalVignette, NibTitle } from "@/components/site/rdr2-graphite";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { JournalSpread } from "@/components/worlds/rdr2/journal-spread";
import type { SectionProps } from "@/components/sections/types";

/**
 * Writing — the journal (SPEC v2 SM-11; `index` on the paper plane, Act III
 * "The Frontier", rdr2 `journal` dressing; RECOGNIZABILITY S15). The dome
 * seam rises in paper over the rd canvas: a page of Arthur Morgan's
 * journal brought into the lamplight.
 *
 *   - The h2 writes itself in pencil (HP-05 re-hosted: a mask wipe of real
 *     Newsreader text behind a moving graphite nib, once), then takes the
 *     world's ONE emphasis mark: the red pencil underline (--paper-red).
 *   - "ARTHUR MORGAN'S JOURNAL • RED DEAD REDEMPTION 2" in Rye heads the left
 *     page, above ENTRY I (its rule and film span in pencil, so the page
 *     keeps exactly one red mark).
 *   - ≥ 1024 a two-page spread (leather edge + gutter, CSS in the world-
 *     skins block): the entries on the left page; on the right page a full-
 *     page graphite frontier sketch at rest, swapped for each entry's
 *     vignette (components/worlds/rdr2/journal-spread: DEFAULT sketch-at-
 *     rest, pointer-driven; ALT leafing, scroll-driven page turns).
 *   - Entries are VERBATIM content.ts, Meta `ENTRY I … V`, a static DRAFT
 *     field; drafts are not links (0 focusables).
 * Under RD-1 option B (the entry moved to an hp act) the same section
 * renders plain parchment: no leather edge, no journal sketches, and the
 * nib + underline take the hp paper inks.
 */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function Writing({ entry, number }: SectionProps<"index">) {
  const titleId = `${entry.id}-title`;
  const journal = slot(entry, "dressing").index === "journal";
  return (
    <WorldSection
      entry={entry}
      labelledBy={titleId}
      className={cn(journal && "journal-spread")}
      containerClassName={cn(journal && "journal-gutter")}
    >
      <header className="max-w-[56rem] lg:max-w-[calc(50%-var(--spacing-gutter))]">
        <Meta fields={[number, entry.nav?.label ?? "Writing"]} />
        <NibTitle id={titleId} className="mt-tier-group max-w-title type-title text-fg">
          Thinking in public, soon.
        </NibTitle>
        <p className="mt-tier-block max-w-lead type-lead text-fg-muted">
          Short essays in progress — written for people who don&rsquo;t trade, about how I try not to fool myself.
        </p>
      </header>

      {journal ? (
        <JournalSpread
          entries={writing.map(({ title, angle, tag }) => ({ title, angle, tag }))}
          choice={variantChoiceOf(entry)}
          caption={<SceneCaption k="cap.writing" place="head" />}
        />
      ) : (
        <ol aria-label="Entries" className="mt-tier-block border-t border-rule">
          {writing.map((post, i) => (
            <Rise
              as="li"
              key={post.title}
              delay={Math.min(i, 3) * 0.06}
              className="grid grid-cols-[1fr_auto] items-start gap-x-6 border-b border-rule py-tier-block"
            >
              <div className="min-w-0">
                <Meta fields={[`Entry ${ROMAN[i] ?? i + 1}`, post.tag, "Draft"]} />
                <h3 className="mt-tier-pair type-title text-fg">{post.title}</h3>
                <p className="mt-tier-group max-w-body type-body text-fg-muted">{post.angle}</p>
              </div>
              <div className="pt-1">
                <JournalVignette index={i} className="size-16" />
              </div>
            </Rise>
          ))}
        </ol>
      )}

      <p className="mt-tier-group type-small text-fg-muted">
        Drafts in progress — published essays will appear here.
      </p>
    </WorldSection>
  );
}
