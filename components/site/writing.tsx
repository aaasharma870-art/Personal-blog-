import { writing } from "@/lib/content";
import { slot } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { Meta, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { JournalVignette, NibTitle } from "@/components/site/rdr2-graphite";
import type { SectionProps } from "@/components/sections/types";

/**
 * Writing — the journal (SPEC v2 SM-11; `index` on the paper plane, Act III
 * "The Frontier", rdr2 `journal` dressing). The dome seam rises in paper over
 * the rd canvas: a page of the journal brought into the lamplight.
 *
 *   - The h2 writes itself in pencil (HP-05 re-hosted: a mask wipe of real
 *     Newsreader text behind a moving graphite nib, once), then takes the
 *     world's ONE emphasis mark: the red pencil underline (--world-emphasis,
 *     = --paper-red on rdr2 × paper).
 *   - ≥ 1024 the section is a two-page spread (leather edge + gutter, CSS in
 *     the world-skins block): each dated entry on the left page, its graphite
 *     sketch opposite it on the right page, drawn once as the row enters (R1,
 *     never hover-gated: the entries are drafts and carry no focusables).
 *   - Entries are VERBATIM content.ts, Meta `ENTRY I … V`, a static DRAFT
 *     field; drafts are not links (unchanged).
 * Retired here: the candle-lit covers, SignalThumb tiles, bordered tag pills,
 * the pulsing draft badge and the aqua hover wash. Under RD-1 option B (the
 * entry moved to an hp act) the same component renders plain parchment: no
 * leather edge, and the nib + underline take the hp paper inks.
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

      <ol aria-label="Journal entries" className="mt-tier-block border-t border-rule">
        {writing.map((post, i) => (
          <Rise
            as="li"
            key={post.title}
            delay={Math.min(i, 3) * 0.06}
            className="grid grid-cols-[1fr_auto] items-start gap-x-6 border-b border-rule py-tier-block lg:grid-cols-2 lg:gap-x-[calc(var(--spacing-gutter)*2)]"
          >
            <div className="min-w-0">
              <Meta fields={[`Entry ${ROMAN[i] ?? i + 1}`, post.tag, "Draft"]} />
              <h3 className="mt-tier-pair type-title text-fg">{post.title}</h3>
              <p className="mt-tier-group max-w-body type-body text-fg-muted">{post.angle}</p>
            </div>
            {/* the right page: this entry's sketch (aria-hidden; its meaning is the title) */}
            <div className="pt-1 lg:flex lg:justify-start lg:pl-tier-block">
              <JournalVignette index={i} className="size-16 lg:size-28" />
            </div>
          </Rise>
        ))}
      </ol>

      <p className="mt-tier-group type-small text-fg-muted">
        Drafts in progress — published essays will appear here.
      </p>
    </WorldSection>
  );
}
