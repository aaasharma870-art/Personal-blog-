import type { ReactNode } from "react";
import { beatAttrs, type BeatAttrs, type BeatWeight } from "@/lib/beats";
import { film } from "@/lib/film";
import type { Variant } from "@/lib/variants";
import type { WorldId } from "@/lib/worlds";

/* ============================================================================
   TITLE ARRIVING IN CHARACTER (spec §8.2, P3-7; plan §3.6) — OWNER: W2-WORDS.

   SERVER MARKUP ONLY (no hooks, no client JS): the real text, final from the
   first byte. The desktop enhancer's words binder
   (components/enhance/binders/words.ts) plays the world's arrival once per
   page view, as a time star through the spotlight, and only when the title
   was OFFSCREEN when it bound ("armed"). On `skip`, reduced motion, Pause,
   phones, touch and no-JS the title is simply there.

     <h2 data-words="title" data-words-world data-words-variant data-beat…>
       <span data-words-o><span data-words-i>TEXT</span></span>   ← inline at rest
       <span data-words-fx aria-hidden="true" hidden></span>      ← empty at rest
     </h2>

   The two wrappers are plain inline spans at rest (layout-identical to the
   bare text, phones untouched). While a title plays, the binder gives them
   block boxes and transforms (a clip riding a transform; the inner counter-
   moves so the letters stay put) and fills the hidden fx layer with its
   decoration (scorch, chalk dust, nib, ink duplicate); everything is put
   back when it ends.

   world × variant (lib/variants.ts `words.title-<world>`; spec §8.2):
     pirates  DEFAULT stamped/burned 420 ms   ALT branded (radial burn-in)
     idiots   DEFAULT chalked 600 ms          ALT duster-reveal (inverse wipe)
     rdr2     DEFAULT poster press 360 ms     ALT typewriter (28 ms/char ≤ 800 ms, clicks)
     hp       DEFAULT ink nib 900 ms          ALT ink bleed from the centre
   `variant` is the manifest choice (default film.defaultVariant); the
   binder applies `?variant=words…:alt` previews on top.

   HOSTS (8, spec §8.2 / D3-16; components/words/words-data.ts TITLE_BEATS):
   the About, Work, Beyond and Principles h2s through
   `<SectionHead inCharacter world beat>` (components/site/world-kit.tsx),
   and the four films-screen titles through `<FilmTitle inCharacter beat>`
   (components/primitives/scene-caption.tsx). Never on act titles, research
   data, the experiment section or any `tnum` element.

   `as="span"`: the title is the ONLY content of a block (SectionHead puts it
   inside MaskReveal's line); the binder gives it a block box while it plays.
   ========================================================================== */

export type InCharacterTitleProps = {
  world: WorldId;
  as?: "h2" | "span";
  id?: string;
  className?: string;
  /** The beat id (lib/page.ts `kind: "title"`), e.g. "B07". */
  beat?: string;
  /** The star weight of the beat (all eight titles are 1). */
  weight?: BeatWeight;
  /** The manifest's variant (default film.defaultVariant). */
  variant?: Variant;
  children: ReactNode;
};

export type InCharacterAttrs = Partial<BeatAttrs> & {
  "data-words": "title";
  "data-words-world"?: string;
  "data-words-variant": Variant;
};

/** The attributes of an in-character title's root. `world` may be omitted:
 *  the binder then reads the closest `[data-world]` plane. */
export function inCharacterAttrs({
  world,
  beat,
  weight = 1,
  variant,
}: {
  world?: WorldId;
  beat?: string;
  weight?: BeatWeight;
  variant?: Variant;
}): InCharacterAttrs {
  return {
    "data-words": "title",
    ...(world ? { "data-words-world": world } : {}),
    "data-words-variant": variant ?? film.defaultVariant,
    ...(beat ? beatAttrs(beat, { weight }) : {}),
  };
}

/** The inside of an in-character title: the two inline wrappers around the
 *  text and the empty, hidden decoration layer. */
export function InCharacterInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span data-words-o="">
        <span data-words-i="">{children}</span>
      </span>
      <span data-words-fx="" aria-hidden="true" hidden />
    </>
  );
}

export function InCharacterTitle({ world, as = "h2", id, className, beat, weight, variant, children }: InCharacterTitleProps) {
  const Tag = as;
  return (
    <Tag id={id} className={className} {...inCharacterAttrs({ world, beat, weight, variant })}>
      <InCharacterInner>{children}</InCharacterInner>
    </Tag>
  );
}
