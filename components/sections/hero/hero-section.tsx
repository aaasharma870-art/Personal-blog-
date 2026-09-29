import { site } from "@/lib/content";
import { film } from "@/lib/film";
import { numberWord } from "@/lib/derive";
import { registeredTo, resolveVariant, type MediaId } from "@/lib/media";
import { intro as introTiming } from "@/lib/motion";
import {
  acts,
  anchorId,
  captionOf,
  copyVisible,
  hrefOfId,
  intensityOf,
  variantChoiceOf,
  worksWords,
} from "@/lib/sections";
import { VARIANTS, type Variant } from "@/lib/variants";
import type { SectionProps } from "@/components/sections/types";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { prepaintVariants } from "@/components/intro/prepaint-variants";
import {
  boxAroundFocal,
  boxCentre,
  marginFor,
  padBox,
  plateGeo,
  REFERENCE_GUTTER,
  REFERENCE_VIEWPORT,
  settleFrame,
  unionBox,
} from "@/components/sections/hero/focal";
import { heroBootHtml } from "@/components/sections/hero/hero-boot";
import {
  HeroStage,
  type HeroGeo,
  type HeroPlate,
  type HeroPlates,
} from "@/components/sections/hero/hero-stage";

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
 *
 * VARIANTS (M1.5; lib/variants.ts host "hero"): the server resolves BOTH
 * sides of every media piece and HeroStage picks with useVariant() (the
 * manifest's choice through hydration, `?variant=…` after mount):
 *   hero.plate     props.media / mediaMobile | their registered alternates
 *   hero.loop      props.loop                | its registered alternate
 *   hero.aperture  bracket slit              | film gate (hero-boot.ts)
 *   hero.velocity  grain + chroma            | crest spray (velocity-layers)
 * A loop plays over a still only when it is REGISTERED to it (starts or
 * ends on it: lib/media.ts registeredTo). Today both loops are cut from the
 * default plate, so over the ALT plate the hero keeps its still rather than
 * jump (preview the loop ALT with ?variant=hero.loop:alt).
 *
 * M2 FIX (ART-DIRECTOR #3 / #15; RECOGNIZABILITY S03, T1):
 *   - The Lens frames the crest AND the Black Pearl: its box is the plate's
 *     `focalBox` (the crest) ∪ `rects.pearl` (lib/media.ts), so the bracket
 *     now holds the ship instead of a wave beside it.
 *   - hero.plate ALT "spyglass": there is no acceptable MV-01 ALT, so the
 *     ALT is a different FRAMING of the same registered plate — it pushes in
 *     ×SPYGLASS.zoom about the Pearl and the Lens frames the ship alone (the
 *     velocity wake / spray still ride the crest: `crest`). Mobile plays
 *     MV-02-alt with the same framing (static). The push-in runs after the
 *     flight lands (HeroStage), so the landing still meets the flight's
 *     last frame at zoom 1.
 *   - cap.hero "THE BLACK PEARL ON THE HORIZON • PIRATES OF THE CARIBBEAN"
 *     (proposed): a <p>, never a heading. ≥ 640 it sits bottom-right over
 *     the calm dark water on its own scrim — exactly where the flight's
 *     Pirates caption lingers, so the hand-off is a crossfade in place
 *     (app/intro.css "T1"); < 640 it sits under the portrait still.
 */

/** hero.plate ALT (M2): the push-in toward the Pearl and the Lens's margin
 *  around the ship (plate fractions). ≤ 1.2 keeps the crest's bright body
 *  right of the name (MV-01 name zone) and the loop near its native size. */
const SPYGLASS = { zoom: 1.18, pad: [0.012, 0.018] } as const;

/** Crest band around the focal point when a plate has no measured
 *  `focalBox` (half-width, half-height in plate fractions). */
const FALLBACK_BAND = { plate: [0.24, 0.07], mobile: [0.33, 0.06] } as const;
const ARROW = /\s*([↓↘→↗])\s*$/u;

/** One side of the plate: `still`'s `variant` (resolveVariant: a missing
 *  alternate falls back to the default), and the loop each hero.loop
 *  variant plays over it — a VIDEO registered to this very still, else null
 *  (a loop that fell back to a still, or one cut from another plate, plays
 *  nothing: the still stays). */
function plateOf(
  still: MediaId,
  variant: Variant,
  loop: MediaId | undefined,
  band: readonly [number, number],
): HeroPlate | null {
  const asset = resolveVariant(still, variant);
  if (!asset) return null;
  const focal = (asset.focal ?? [0.5, 0.5]) as readonly [number, number];
  // the crest (measured, else the band) and the Pearl (when measured)
  const crest = asset.focalBox ?? boxAroundFocal(focal, band[0], band[1]);
  const pearl = asset.rects?.pearl ?? null;
  const spy = variant === "alt" && pearl !== null;
  const wide = pearl ? unionBox(crest, pearl) : crest;
  const box = spy ? padBox(pearl, SPYGLASS.pad[0], SPYGLASS.pad[1]) : wide;
  const loopFor = (v: Variant): MediaId | null => {
    const l = loop ? resolveVariant(loop, v) : null;
    return l && l.kind === "video" && registeredTo(l, asset.id) ? l.id : null;
  };
  return {
    poster: asset.id,
    size: { w: asset.width, h: asset.height },
    focal,
    box,
    wide,
    crest,
    keep: pearl,
    zoom: spy ? SPYGLASS.zoom : 1,
    zoomAt: pearl ? boxCentre(pearl) : focal,
    // where the ALT film gate opens: the horizon, else the lantern, else
    // the middle of the crest band
    horizon: asset.marks?.horizon?.[1] ?? asset.marks?.lantern?.[1] ?? (crest.y0 + crest.y1) / 2,
    loops: { default: loopFor("default"), alt: loopFor("alt") },
  };
}

/** Both sides of a plate, or null when the default has nothing usable. */
function platesOf(
  still: MediaId,
  loop: MediaId | undefined,
  band: readonly [number, number],
): HeroPlates | null {
  const d = plateOf(still, "default", loop, band);
  if (!d) return null;
  return { default: d, alt: plateOf(still, "alt", loop, band) ?? d };
}

export function HeroSection({ entry }: SectionProps<"hero">) {
  const { cta, media, mediaMobile, loop } = entry.props;
  const choice = variantChoiceOf(entry);
  // below `full` intensity (SPEC §12.4) the hero keeps its still: no loop
  const plates = platesOf(media, intensityOf(entry) === "full" ? loop : undefined, FALLBACK_BAND.plate);
  const mobiles = platesOf(mediaMobile, undefined, FALLBACK_BAND.mobile) ?? plates;

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
  // the bracket's SSR frame (and the zoom origin, the wake band) at the
  // reference viewport, per plate side — HeroStage re-measures after mount
  const geoOf = (plate: HeroPlate): HeroGeo => {
    const g = plateGeo(plate, REFERENCE_VIEWPORT);
    const margin = marginFor(g.keep, REFERENCE_VIEWPORT.w, 16, REFERENCE_GUTTER);
    return {
      frame: settleFrame(g.lens, { ...REFERENCE_VIEWPORT, inset: 16, margin }),
      origin: g.origin,
      wake: g.wake,
      zoom: g.zoom,
    };
  };
  // the hero's scene caption (RECOGNIZABILITY S03): null when its copy may
  // not render in this build
  const cap = captionOf("cap.hero");
  const caption = cap ? <SceneCaption k="cap.hero" place="under" className="mt-0 sm:mt-0" /> : null;

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

  if (!plates || !mobiles) {
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
      boot={heroBootHtml({
        onceKey,
        failsafeMs: introTiming.failsafeMs,
        variants: prepaintVariants(choice, ["hero.aperture"]),
      })}
      onceKey={onceKey}
      choice={choice}
      plates={plates}
      mobiles={mobiles}
      frames={Object.fromEntries(VARIANTS.map((v) => [v, geoOf(plates[v])])) as Record<Variant, HeroGeo>}
      caption={caption}
      captionWorld={cap?.world ?? null}
    >
      {column}
    </HeroStage>
  );
}
