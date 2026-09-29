import { site } from "@/lib/content";
import { film } from "@/lib/film";
import { numberWord } from "@/lib/derive";
import { resolveMedia, type MediaAsset, type MediaId } from "@/lib/media";
import { intro as introTiming } from "@/lib/motion";
import { acts, anchorId, copyVisible, hrefOfId, intensityOf, worksWords } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";
import {
  boxAroundFocal,
  coverBox,
  REFERENCE_GUTTER,
  REFERENCE_VIEWPORT,
  settleFrame,
  type Box01,
} from "@/components/sections/hero/focal";
import { heroBootHtml } from "@/components/sections/hero/hero-boot";
import { HeroStage, type HeroPlate } from "@/components/sections/hero/hero-stage";

/**
 * The cold open (SPEC v2 §6, SM-2; hero-lens.BAR). A SERVER component: the
 * text column — the one h1 (the name), the throughline, the identity Meta
 * and the one CTA — is static SSR markup in its final state from the first
 * byte (H1, H2), handed to the client HeroStage as children so no client
 * state ever re-renders or hides it. Exactly three type styles: display,
 * lead, meta (H5). Everything comes from data: the entry's props (media ids,
 * the CTA), `site.*` and the film layer — nothing here names a section, a
 * work or a file (hero-lens.BAR §8).
 *
 * The h1 is two spans with a real space (the accessible name is `site.name`)
 * and `tabindex=-1`: the prologue lands focus on it (SPEC §5.3 "end"), with
 * no ring drawn on this non-interactive target.
 */

/** Crest band around the focal point when a plate has no measured
 *  `focalBox` (half-width, half-height in plate fractions). */
const FALLBACK_BAND = { plate: [0.24, 0.07], mobile: [0.33, 0.06] } as const;
const ARROW = /\s*([↓↘→↗])\s*$/u;

function plateOf(
  still: MediaId,
  loop: MediaId | undefined,
  band: readonly [number, number],
): HeroPlate | null {
  const asset = resolveMedia(still);
  if (!asset) return null;
  const loopAsset: MediaAsset | null = loop ? resolveMedia(loop) : null;
  const focal = (asset.focal ?? [0.5, 0.5]) as readonly [number, number];
  return {
    // a loop that fell back to a still plays nothing: show the still itself
    media: loopAsset?.kind === "video" ? loopAsset.id : asset.id,
    poster: asset.id,
    size: { w: asset.width, h: asset.height },
    focal,
    box: asset.focalBox ?? boxAroundFocal(focal, band[0], band[1]),
  };
}

export function HeroSection({ entry }: SectionProps<"hero">) {
  const { cta, media, mediaMobile, loop } = entry.props;
  // below `full` intensity (SPEC §12.4) the hero keeps its still: no loop
  const plate = plateOf(media, intensityOf(entry) === "full" ? loop : undefined, FALLBACK_BAND.plate);
  const mobile = plateOf(mediaMobile, undefined, FALLBACK_BAND.mobile) ?? plate;

  const titleId = `${entry.id}-title`;
  const [first, ...rest] = site.name.split(" ");
  const href = hrefOfId(cta.to);
  const label = cta.label.replace(ARROW, "");
  const arrow = cta.label.match(ARROW)?.[1] ?? null;
  const identity = site.identity
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  // H-1 (default OFF): a derived work-credit line above the name.
  const credit = {
    text: `In ${numberWord(acts.length)} acts • after ${worksWords}`,
    status: "proposed" as const,
  };
  const showCredit = film.enabled && film.heroCredit && acts.length > 0 && copyVisible(credit);

  const onceKey = `aperture:${entry.id}`;
  const initialFrame: Box01 = plate
    ? settleFrame(coverBox(plate.box, plate.size, REFERENCE_VIEWPORT, plate.focal), {
        ...REFERENCE_VIEWPORT,
        inset: 16,
        margin: REFERENCE_GUTTER,
      })
    : { x0: 0.5, x1: 0.9, y0: 0.4, y1: 0.6 };

  const column = (
    <div className="flex flex-col items-start">
      {showCredit ? <p className="type-meta mb-tier-group text-fg-muted">{credit.text}</p> : null}
      <h1
        id={titleId}
        tabIndex={-1}
        className="type-display w-fit text-fg outline-none focus-visible:outline-none"
      >
        <span className="block">{first}</span> <span className="block">{rest.join(" ")}</span>
      </h1>
      <p className="type-lead mt-tier-group max-w-lead text-fg">{site.throughline}</p>
      <p className="type-meta mt-tier-pair text-fg-muted">
        {identity.map((part, i) => (
          <span key={part}>
            {i > 0 ? " • " : null}
            <span className="whitespace-nowrap">{part}</span>
          </span>
        ))}
      </p>
      {href ? (
        <a
          href={href}
          className="type-meta mt-tier-group inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-5 text-fg transition-colors duration-(--dur-micro) hover:border-accent-bright hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
        >
          {label}
          {arrow ? <span aria-hidden="true">{arrow}</span> : null}
        </a>
      ) : null}
    </div>
  );

  if (!plate || !mobile) {
    // No usable plate anywhere in the chain: the name still stands (no media).
    return (
      <section
        id={anchorId(entry)}
        aria-labelledby={titleId}
        className="relative flex min-h-svh flex-col justify-center bg-bg text-fg"
      >
        <div className="mx-auto w-full max-w-page px-gutter py-(--header-h)">{column}</div>
      </section>
    );
  }

  return (
    <HeroStage
      id={anchorId(entry)}
      titleId={titleId}
      boot={heroBootHtml({ onceKey, failsafeMs: introTiming.failsafeMs })}
      onceKey={onceKey}
      plate={plate}
      mobile={mobile}
      initialFrame={initialFrame}
    >
      {column}
    </HeroStage>
  );
}
