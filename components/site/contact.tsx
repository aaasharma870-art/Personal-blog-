import { site } from "@/lib/content";
import { variantChoiceOf } from "@/lib/sections";
import { MaskReveal } from "@/components/primitives/mask-reveal";
import { ContactScene } from "@/components/site/contact-scene";
import { Meta, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/**
 * Contact — the last light (SPEC v2 SM-12; bar contact-resolution v3;
 * RECOGNIZABILITY S19 + T12; Act IV "The Light", hp deep).
 *
 * The page ends by resolving, not by spectacle: the dark rises on a dome
 * (the derived seam from principles), one invitation is set large at left
 * (Newsreader `title`, one masked rise) — and at right, in the dark, ONE
 * FLOATING CANDLE FROM THE GREAT HALL burns at the end of a fading trail of
 * candles (MV-08; its 8 s breathing loop MV-09 on desktop, one decoder).
 * The bracket that opened on Play closes around the AS monogram over the
 * flame: [ A · flame · S ] — someone left a light on for you. The resolved
 * bracket is the viewport's ONE aqua mark. Copying the address makes the
 * flame answer once (a 120 ms masked brightness flare inside the plate).
 *
 * The plate never sits under text (the invitation and the controls own the
 * left columns; the plate is its own radially feathered window at right,
 * and below the controls on mobile), so every glyph keeps the section's AA
 * tokens. Around it, MORE OF THE GREAT HALL: the enchanted ceiling's night
 * blue, clouds and stars, and a field of floating candles receding into it
 * (code sprites; ≥ lg around the plate, a band above it below lg).
 * Caption: A FLOATING CANDLE FROM THE GREAT HALL • HARRY POTTER — UNDER
 * the plate at every width (ART-DIRECTOR #13: never stacked on the h2; the
 * loop moves, so never on it).
 *
 * T12: the section's last 30vh deepens from hp deep to the house deep of
 * the credits (a background gradient), so the roll begins without an edge,
 * and the last light's trail runs on down to the credits' head (dots;
 * ALT: the Map's footprints) — the credits close it with the ink fold.
 * Variant piece `contact.lastlight` (DEFAULT "bracket-close", ALT
 * "map-walk"): see contact-scene.tsx. Copy is unchanged (the invitation;
 * the lede keeps its "junior" wording, bar D13, pending Aryan).
 */
export function Contact({ entry }: SectionProps<"contact">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection
      entry={entry}
      labelledBy={titleId}
      className="flex min-h-[92svh] items-center bg-[linear-gradient(to_bottom,transparent_calc(100%_-_30vh),var(--house-deep))] lg:min-h-svh"
    >
      <ContactScene
        choice={variantChoiceOf(entry)}
        plate={entry.props.media ?? "MV-08"}
        loop={entry.props.loop ?? "MV-09"}
        email={site.email}
        github={site.github}
        initials={site.initials}
        text={
          <>
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
          </>
        }
      />
    </WorldSection>
  );
}
