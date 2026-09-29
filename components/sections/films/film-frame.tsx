"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { film, type CaptionKey, type CaptionWorld } from "@/lib/film";
import { resolveMedia, resolveVariant, type MediaId } from "@/lib/media";
import { dur, easeClip } from "@/lib/motion";
import { captionKeyFor } from "@/lib/sections";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { MediaFrame } from "@/components/primitives/media-frame";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { Finale, type FinaleMode } from "@/components/sections/films/finales";
import { FOCAL_MARK, filmMark } from "@/components/sections/films/plate-marks";

/**
 * FilmFrame — one films-chapter screen's picture (SPEC SM-9; bar
 * films-chapter §3; RECOGNIZABILITY S12): a letterboxed 2.39:1 still (3:2
 * below 640 px: letterbox off), its finale drawn over it once, and the
 * scene caption UNDER the frame ("THE BLACK PEARL BY MOONLIGHT • PIRATES OF THE
 * CARIBBEAN": the F-3I sky is too bright for a corner caption).
 *
 * Variant piece `films.screens` (lib/variants.ts):
 *   DEFAULT "clip-finales": the world's `filmsStill`; the frame opens from
 *     inset(8% round 20px) to inset(0) (easeClip / dur.hero) once ≥ 50% of
 *     it is in view, then the finale draws (finales.tsx).
 *   ALT "iris-marks": the world's alternate still (`filmsAltStill`, else
 *     the registered media alt); the frame IRISES open from the plate's
 *     focal mark (the Pearl's lantern, the scooter, the camp's fire, the
 *     ink), then the ALT finale draws.
 * Server HTML / reduced motion / Pause / no JS / already in view: the open
 * frame with the finished finale. No video, no sticky stage (bar F13).
 */
export const FILMS_CAPTION: Record<CaptionWorld, CaptionKey> = {
  pirates: "cap.films.pirates",
  idiots: "cap.films.idiots",
  rdr2: "cap.films.rdr2",
  hp: "cap.films.hp",
};

export function FilmFrame({
  world,
  choice,
  bearing,
  gates,
  className,
}: {
  world: CaptionWorld;
  choice: VariantChoice;
  /** The next act's compass bearing (the Pirates finale; derived). */
  bearing: number;
  /** gauntlet.length (the 3 Idiots finale; derived). */
  gates: number;
  className?: string;
}) {
  const variant = useVariant(choice, "films.screens");
  const media = film.worlds[world].media;
  const base = media.filmsStill;
  const stillId: MediaId | undefined =
    base === undefined
      ? undefined
      : variant === "alt"
        ? (media.filmsAltStill ?? resolveVariant(base, "alt")?.id ?? base)
        : base;
  const asset = stillId ? resolveMedia(stillId) : null;
  const aspect = asset ? asset.width / asset.height : 21 / 9;

  // The observer watches the UNCLIPPED box: IntersectionObserver clips its
  // target by the target's own clip-path in Chromium, so observing the
  // element that carries the closed iris (circle(0%): zero area) could leave
  // the ALT screens armed — shut — forever (ART-DIRECTOR #1).
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.5 });
  const mode: FinaleMode = phase === "armed" ? "hidden" : phase === "entered" ? "play" : "final";

  const focal = variant === "alt" && asset ? filmMark(asset.id, FOCAL_MARK[world]) : null;
  const ox = ((focal?.[0] ?? 0.5) * 100).toFixed(1);
  const oy = ((focal?.[1] ?? 0.5) * 100).toFixed(1);
  const closed = variant === "alt" ? `circle(0% at ${ox}% ${oy}%)` : "inset(8% round 20px)";
  const open = variant === "alt" ? `circle(150% at ${ox}% ${oy}%)` : "inset(0% round 0px)";

  return (
    <div className={className} data-variant={variant}>
      <div ref={ref} className="relative aspect-[3/2] sm:aspect-[2.39/1]" data-films-frame={world} data-finale-mode={mode}>
        <motion.div
          className="absolute inset-0 overflow-hidden bg-bg"
          initial={false}
          animate={{ clipPath: phase === "armed" ? closed : open }}
          transition={phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 }}
        >
          {stillId ? (
            <>
              <MediaFrame
                media={stillId}
                layout="fill"
                playOn="never"
                world={world}
                sizes="(min-width: 90rem) 1360px, 100vw"
              />
              <Finale
                world={world}
                variant={variant}
                mode={mode}
                aspect={aspect}
                stillId={asset?.id ?? stillId}
                bearing={bearing}
                gates={gates}
              />
            </>
          ) : null}
        </motion.div>
      </div>
      <SceneCaption k={captionKeyFor(FILMS_CAPTION[world], variant)} place="under" />
    </div>
  );
}
