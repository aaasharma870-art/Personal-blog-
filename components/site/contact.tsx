import { site } from "@/lib/content";
import { MaskReveal } from "@/components/primitives/mask-reveal";
import { ContactFinale } from "@/components/site/contact-finale";
import { BracketMonogram, InkCandle } from "@/components/site/hp-ink";
import { Meta, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/**
 * Contact — the last light (SPEC v2 SM-12; Act IV "The Light", hp deep).
 * The page ends by resolving, not by spectacle: the dark rises on a dome
 * (derived seam from principles), one invitation is set large at left
 * (Newsreader `title`, one masked rise), and at right the bracket that
 * opened the page closes around the AS monogram over one floating candle —
 * someone left a light on for you. The resolved bracket is the viewport's
 * ONE aqua mark. M1: the candle is an ink drawing (IC-HP-03, no glow); the
 * MV-08/09 plate (its light, and the copy flare) joins when accepted.
 * Retired: the Ken-Burns backdrop video, the radial scrim, the aqua glow
 * bloom behind Copy (DOM light, Law 1).
 * Copy is unchanged (the invitation, the lede — see the M1 note on the
 * lede's "junior" wording, bar D13, pending Aryan).
 */
export function Contact({ entry }: SectionProps<"contact">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection
      entry={entry}
      labelledBy={titleId}
      className="flex min-h-[92svh] items-center lg:min-h-svh"
    >
      <div className="grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:items-center lg:gap-x-6">
        <div className="lg:col-span-8">
          <Meta fields={[entry.nav?.label ?? "Contact"]} />
          <MaskReveal
            as="h2"
            id={titleId}
            className="mt-tier-group max-w-[22ch] type-title text-fg"
            lines={["Let’s talk research, markets, or", "building systems that are honest", "about their limits."]}
          />
          <p className="mt-tier-group max-w-lead type-body text-fg-muted">
            The most reliable way to reach me is email — I read everything. I&rsquo;m a high-school junior open to
            research conversations, mentorship, and serious collaboration.
          </p>
          <ContactFinale email={site.email} github={site.github} />
        </div>

        <div className="flex flex-col items-center lg:col-span-3 lg:col-start-10">
          <BracketMonogram initials={site.initials} />
          <InkCandle className="-mt-4 w-32 lg:w-44" />
        </div>
      </div>
    </WorldSection>
  );
}
