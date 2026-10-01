import { beatAttrs, type BeatWeight } from "@/lib/beats";
import { film } from "@/lib/film";
import type { Variant } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { HORSE_VIEWBOX } from "@/components/words/words-data";

/* ============================================================================
   FLY-THROUGH (spec §3.8, §2.5, P3-7; plan §3.6) — OWNER: W2-WORDS.

   SERVER MARKUP ONLY: an aria-hidden, pointer-less, clipped layer that fills
   the host's IMAGE ZONE (`absolute inset-0`: put it inside the positioned
   box of the picture or margin it may cross, never over a text column).
   The sprite inside is `hidden`: nothing shows at rest, with no JS, under
   reduced motion or Pause, on phones and on touch.

   On DESKTOP_FINE with motion on, the words binder asks the spotlight for a
   `needsIdle` TIME star once the zone is half in view; it plays once per
   page view after the reader has been idle (< 300 px/s for 600 ms), and is
   dropped when the zone leaves the viewport first (spec §3.8). The sprite
   then follows `path` across the zone and is hidden again: the end state is
   the start state.

     kind "gull"   Act I (B12): a gull glides through the voyage window's sky.
                   Drawn here as code (three wing frames). `frames` is ignored.
     kind "horse"  Act III (B45): the graphite horse gallops along the
                   journal's bottom edge. `frames` = the Muybridge gallop as
                   SVG path `d` strings in HORSE_VIEWBOX (0 0 183.5 100, ground
                   at y 100, facing right), from the registered
                   components/words/sprites/horse-frames.ts (the W3 assembler
                   writes it from the staged frames.json). No frames → no
                   fly-through (renders nothing).

   PATH: `points` are fractions of the zone ([0,0] top-left, [1,1] bottom-
   right; values outside 0…1 start or end beyond the clipped edge), joined by
   a smooth curve at constant speed over `ms`. The point is the sprite's
   centre for the gull and its hooves (bottom centre) for the horse.
     gull e.g.  { points: [[-0.08, 0.34], [0.35, 0.24], [0.7, 0.3], [1.08, 0.2]], ms: 4200 }
     horse e.g. { points: [[-0.12, 0.97], [1.12, 0.97]], ms: 3600 }
   VARIANT words.flythrough: DEFAULT glide-gallop (the sprite) · ALT
   shadow-pass (only its flattened shadow crosses the zone).
   ========================================================================== */

export type FlyThroughProps = {
  kind: "gull" | "horse";
  path: { points: readonly (readonly [number, number])[]; ms: number };
  frames?: readonly string[];
  /** The beat id (lib/page.ts `kind: "fly-through"`), e.g. "B12". */
  beat: string;
  /** The star weight (both are 2). */
  weight?: BeatWeight;
  /** The manifest's variant (default film.defaultVariant). */
  variant?: Variant;
  /** Extra classes for the zone layer (default `absolute inset-0`). */
  className?: string;
  /** The frames' viewBox (horse; default HORSE_VIEWBOX). */
  viewBox?: string;
};

/** The gull, drawn as code: glide, wings up, wings down (stroked arcs). */
const GULL = {
  viewBox: "0 0 40 16",
  frames: ["M2 9.5Q11 4 20 9Q29 4 38 9.5", "M3 2.5Q12 3 20 9Q28 3 37 2.5", "M3 14.5Q12 7.5 20 9Q28 7.5 37 14.5"],
} as const;

/** `hidden` on the <svg> (React renders it; SVGProps does not type it). */
const HIDDEN = { hidden: true } as Record<string, unknown>;

export function FlyThrough({ kind, path, frames, beat, weight = 2, variant, className, viewBox }: FlyThroughProps) {
  const sprite = kind === "gull" ? GULL.frames : frames;
  if (!sprite || sprite.length === 0) return null;
  const points = path.points.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (points.length < 2 || !(path.ms > 0)) return null;
  const gull = kind === "gull";
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      data-words="fly"
      data-words-kind={kind}
      data-words-path={JSON.stringify(points)}
      data-words-ms={Math.round(path.ms)}
      data-words-variant={variant ?? film.defaultVariant}
      {...beatAttrs(beat, { weight })}
    >
      <svg
        data-words-sprite=""
        viewBox={gull ? GULL.viewBox : (viewBox ?? HORSE_VIEWBOX)}
        {...HIDDEN}
        focusable="false"
        {...(gull
          ? { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
          : { fill: "currentColor", fillRule: "evenodd" as const })}
      >
        {sprite.map((d, i) => (
          <path key={i} d={d} data-f={i} opacity={i === 0 ? 1 : 0} />
        ))}
      </svg>
    </div>
  );
}
