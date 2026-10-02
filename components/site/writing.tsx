import { writing } from "@/lib/content";
import { beatAttrs } from "@/lib/beats";
import { copyText, copyVisible, slot, variantChoiceOf } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { planeAttrs } from "@/lib/worlds";
import { Meta, WorldSection, recedeInto } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { JournalVignette, NibTitle } from "@/components/site/rdr2-graphite";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { EggHotspot } from "@/components/eggs/egg-hotspot";
import { FlyThrough } from "@/components/words/fly-through";
import { JournalSpread } from "@/components/worlds/rdr2/journal-spread";
import { RdDesktop } from "@/components/worlds/rdr2/kit";
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
 *   - ≥ 1024 a two-page spread (a soft gutter down the centre, CSS in the
 *     world-skins block; the 6 px leather edges at the viewport's sides
 *     are gone: they read as orange bug bars, ART-DIRECTOR #15): the
 *     entries on the left page; on the right page a full-page graphite
 *     frontier sketch at rest, swapped for each entry's vignette
 *     (components/worlds/rdr2/journal-spread: DEFAULT sketch-at-rest,
 *     pointer-driven; ALT leafing, scroll-driven page turns).
 *   - T9: when the next section is this world's deep (Voices, the camp),
 *     the page RECEDES INTO DUSK at its foot — an empty 18vh + the bottom
 *     padding fade paper → deep, and Voices drops its paper dome
 *     (world-kit recedeInto), so the camp fades up out of the same dark.
 *   - Entries are VERBATIM content.ts, Meta `ENTRY I … V`, a static DRAFT
 *     field; drafts are not links (0 focusables).
 * Under RD-1 option B (the entry moved to an hp act) the same section
 * renders plain parchment: no leather edge, no journal sketches, and the
 * nib + underline take the hp paper inks.
 *
 * Phase 3 (PHASE3-PLAN §7.4, §8):
 *   - B44 the NibTitle (a time star through the spotlight);
 *   - B45 the graphite horse fly-through (Muybridge, 1878, public domain;
 *     HORSE_FRAMES, loaded lazily by the words binder) along the journal page's bottom edge, ≤ 1.2 s, once,
 *     on scroll-idle (server markup; the words binder plays it);
 *   - rd-bone: the bone's hotspot (EggHotspot) over the landscape's bone;
 *     its pencilled note (copy egg.bone.note) is drawn by the lazy desktop
 *     extras (kit.tsx <RdDesktop>);
 *   - B46: the dusk at the foot is the camp's fade-up SCROLL star (moved
 *     here from the camp stage; it is declared on this item). Under the boot
 *     gate the dusk room grows so the star spans ≥ 300 px (19.5rem with the
 *     section's bottom padding).
 */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
/** B45: hooves on the page's bottom edge, left → right, ≤ 1.2 s (spec §2.3). */
const HORSE_PATH = { points: [[-0.12, 0.94], [1.12, 0.94]], ms: 1200 } as const;

export function Writing({ entry, number }: SectionProps<"index">) {
  const titleId = `${entry.id}-title`;
  const journal = slot(entry, "dressing").index === "journal";
  const dusk = recedeInto(entry);
  const note = copyText("egg.bone.note");
  const boneNote = copyVisible(note) ? note.text : null;
  // the section head; in the journal it opens the LEFT page (beside the
  // sketch), otherwise it spans the column
  const head = (inSpread: boolean) => (
    <header className={cn("max-w-[56rem]", !inSpread && "lg:max-w-[calc(50%-var(--spacing-gutter))]")}>
      <Meta fields={[number, entry.nav?.label ?? "Writing"]} />
      <NibTitle id={titleId} className="mt-tier-group max-w-title type-title text-fg">
        Thinking in public, soon.
      </NibTitle>
      <p className="mt-tier-block max-w-lead type-lead text-fg-muted">
        Short essays in progress — written for people who don&rsquo;t trade, about how I try not to fool myself.
      </p>
    </header>
  );
  return (
    <WorldSection
      entry={entry}
      labelledBy={titleId}
      className={cn(dusk && "overflow-x-clip")}
      containerClassName={cn(journal && "journal-gutter")}
    >
      {journal ? null : head(false)}
      {/* B46's scroll star and the rd-bone note (lazy, DESKTOP_FINE) */}
      {journal || dusk ? <RdDesktop part="writing" note={journal ? (boneNote ?? undefined) : undefined} /> : null}

      {journal ? (
        <JournalSpread
          entries={writing.map(({ title, angle, tag }) => ({ title, angle, tag }))}
          choice={variantChoiceOf(entry)}
          caption={<SceneCaption k="cap.writing" place="head" />}
          head={head(true)}
          fly={<FlyThrough kind="horse" lazyFrames="horse" beat="B45" path={HORSE_PATH} />}
          bone={<EggHotspot hunt="rd-bone" label="egg.hunt.name.rd-bone" />}
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

      {dusk ? (
        <>
          {/* room for the dusk: no text ever sits under the fade */}
          <div aria-hidden="true" className="h-[18vh] boot:h-[max(18vh,calc(19.5rem_-_var(--spacing-section)))]" />
          {/* B46: the camp fades up out of this dusk (a scroll star) */}
          <div
            aria-hidden="true"
            data-dusk=""
            {...planeAttrs(dusk.tone, dusk.world)}
            {...beatAttrs("B46", { weight: 1 })}
            className="pointer-events-none absolute bottom-[calc(-1*var(--spacing-section))] left-1/2 h-[calc(18vh+var(--spacing-section))] w-screen -translate-x-1/2 bg-bg [mask-image:linear-gradient(to_bottom,transparent,#000_85%)] boot:h-[max(calc(18vh_+_var(--spacing-section)),19.5rem)]"
          />
        </>
      ) : null}
    </WorldSection>
  );
}
