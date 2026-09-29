import type { ReactNode } from "react";
import type { CaptionKey, CaptionPlace, CaptionWorld } from "@/lib/film";
import { captionOf, filmTitleOf, letteredIn } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { FilmQuote } from "@/components/site/film-quote";
import { worldFaceClass } from "@/components/primitives/world-face";

/* ============================================================================
   SCENE CAPTION — the RECOGNIZABILITY RULE (b) primitive (§4): every film
   scene names its MOMENT and its FILM in visible HTML, in the world's fan
   face (O-1): "THE LECTURE HALL AT ICE • 3 IDIOTS".

   The ONLY file (with the act-card / loader / egg slots and globals.css)
   allowed to apply a world display face outside act titles (validator
   #10): <SceneCaption>, <FilmTitle>, <Lettered> and worldFaceClass() set a
   face only on strings REGISTERED in lib/film.ts `lettering` (the subsets
   hold only their glyphs); anything else stays in house type.

   Pure (no hooks, no client APIs): usable from server AND client
   components. Real text in the SSR, hydration-safe; a <p>, never a heading
   (one h1). Static and fully visible under RM / Pause / no-JS — drive any
   entrance (R1 rise, the act cards' p-driven opacity) from the host.

   PLACEMENT (`data-place`; CSS in app/globals.css "scene captions"):
     bl / br  over the media's calm bottom corner, 24 px inset, with a
              world-deep scrim. Put the caption and the media in ONE
              `.scene-caption-host` box (position: relative) so the corner is
              the media's. NEVER over moving media (a loop, the JV scrub):
              use "under" / "head" there, or render only on the still.
     under    directly below the frame, left-aligned.
     head     the section head (right after the Meta number, or opposite
              the h2 — the host lays it out).
   Under 640 px every placement renders as `under` (static, in flow).
   ========================================================================== */

export { worldFaceClass };

type Tag = "p" | "span" | "div" | "h2" | "h3" | "h4";

/**
 * Lettered — `text` in `world`'s fan face when it is a registered lettering
 * string (exact, or its caps → text-transform: uppercase); otherwise the
 * host's own type. Use it for WANTED, film titles in the credits (O-6) …
 */
export function Lettered({
  world,
  text,
  as: T = "span",
  className,
  id,
}: {
  world: CaptionWorld;
  text: string;
  as?: Tag;
  className?: string;
  id?: string;
}) {
  const face = letteredIn(world, text);
  return (
    <T
      id={id}
      className={cn(face.lettered && worldFaceClass(world), face.upper && "uppercase", className)}
      data-lettered={face.lettered ? world : undefined}
    >
      {text}
    </T>
  );
}

/**
 * FilmTitle — the world's WORK title in its fan face ("PIRATES OF THE
 * CARIBBEAN"), for the act-card title block (§4.3: `--text-title`, above the
 * lettered h2; class "card-film"), the films chapter h3s and the loader route
 * cards. Pass `as="h3"` where it is the heading (films chapter).
 */
export function FilmTitle({
  world,
  as = "p",
  className,
  id,
}: {
  world: CaptionWorld;
  as?: Tag;
  className?: string;
  id?: string;
}) {
  const title = filmTitleOf(world);
  if (!title) return null;
  return <Lettered world={world} text={title} as={as} className={className} id={id} />;
}

/**
 * SceneCaption — one registered caption (lib/film.ts `captions`) as
 *   <p class="scene-caption world-face-…" data-caption-world data-place>
 *     <span class="scene-caption__moment">MOMENT</span>
 *     <span aria-hidden>•</span><span class="sr-only">, </span>
 *     <span class="scene-caption__film">FILM</span>
 *   </p>
 * Pick the variant's key with captionKeyFor(base, variant). Renders nothing
 * when the caption's copy may not render in this build.
 */
export function SceneCaption({
  k,
  place,
  className,
  ariaHidden,
  children,
}: {
  k: CaptionKey;
  /** Override the data's default placement. */
  place?: CaptionPlace;
  className?: string;
  /** Override the data (only the intro flight hand-off narrates a visual). */
  ariaHidden?: boolean;
  /** Extra inline content after the film span (rare; e.g. a Meta note). */
  children?: ReactNode;
}) {
  const c = captionOf(k);
  if (!c) return null;
  const hidden = ariaHidden ?? c.ariaHidden;
  const face = c.moment ? letteredIn(c.world, c.moment) : { lettered: false, upper: false };
  const filmFace = c.film ? letteredIn(c.world, c.film) : { lettered: false, upper: false };
  return (
    <p
      className={cn("scene-caption", className)}
      data-caption={c.key}
      data-caption-world={c.world}
      data-place={place ?? c.place}
      aria-hidden={hidden || undefined}
    >
      {c.quote ? (
        <FilmQuote id={c.quote} rendition="lettered" attribution="speaker" className="scene-caption__moment scene-caption__quote" />
      ) : (
        <span className={cn("scene-caption__moment", face.lettered && worldFaceClass(c.world))}>{c.moment}</span>
      )}
      {c.film ? (
        <>
          <span className="scene-caption__sep" aria-hidden="true">
            •
          </span>
          <span className="sr-only">, </span>
          <span className={cn("scene-caption__film", filmFace.lettered && worldFaceClass(c.world))}>{c.film}</span>
        </>
      ) : null}
      {children}
    </p>
  );
}
