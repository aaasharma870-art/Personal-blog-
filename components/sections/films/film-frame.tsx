"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { beatAttrs, type BeatWeight } from "@/lib/beats";
import { film, type CaptionKey, type CaptionWorld } from "@/lib/film";
import { resolveMedia, resolveVariant, type MediaId } from "@/lib/media";
import { dur, easeClip } from "@/lib/motion";
import { captionKeyFor } from "@/lib/sections";
import { safeLazy } from "@/lib/safe-lazy";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { usePlateEngine, type CameraSpec } from "@/components/primitives/camera";
import { LivePlate } from "@/components/primitives/live-plate";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { WorldProvider } from "@/components/primitives/world";
import { Finale, type FinaleMode } from "@/components/sections/films/finales";
import { FOCAL_MARK, filmMark } from "@/components/sections/films/plate-marks";

/**
 * FilmFrame — one films-chapter screen's picture (SPEC SM-9; bar
 * films-chapter §3; RECOGNIZABILITY S12): a letterboxed 2.39:1 plate (3:2
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
 * frame with the finished finale and the still plate.
 *
 * PHASE 3 (W3-CINEMA; PHASE3-SPEC §6.1, §7.4, §8.2, §3.8, §2.3 B30–B35):
 * - THE PLATE MOVES (P3-5 #4): a <LivePlate> with the §6.1 films row, a
 *   push 1 → 1.05 over the screen's passage (the finale rides the same
 *   camera, so its marks stay registered). The loop lights up through
 *   loopFor (L14 on iconic-pearl-alt, L22 on F-3I, L21 on iconic-deadeye,
 *   L23 on the HP ALT's F-HP, L01 on the Pirates ALT's iconic-pearl); a
 *   plate with no loop (iconic-express: L13 failed; the `plates.loops` ALT)
 *   is the code path, depth on its registered line under the same push.
 *   ONE DECODER (P3-2 #5): the screens share the DecoderLock; the screen
 *   arriving takes it and the outgoing loop parks on its current frame (a
 *   still) before the incoming one plays (MediaFrame's park).
 * - THE FINALE is the screen's existing time-star signature (B31-finale …
 *   B34-finale): it asks the spotlight (useEnterOnce `star`) on desktop, so
 *   the title in character (film-screen.tsx, B31–B34) plays first and the
 *   finale after it ("title, then finale"). Phones enter as before.
 * - HOUSE LIGHTS DOWN (`lights`, the first screen; B30 / B31-bars, spec
 *   §7.4, P3-6 #8): the global letterbox bars close over 40vh as the
 *   INTERMISSION head rises (the frame's top from 125% to 85% of the
 *   viewport: closed as the first screen arrives) and open over 40vh around
 *   the moment this frame is centred (its centre from 70% to 30%); from
 *   there each screen's own 2.39 matte carries the scene. One close, one
 *   open per pass (html[data-letterbox] flips twice, rule 33). B30 is a
 *   weight-3 scroll star: its marker's box sits above the frame so its
 *   spotlight ownership ends as the close does. The B30 / B31-bars markers
 *   are the server screen's (`marks`, film-screen.tsx: no client code).
 * - The beat ids come from the server screen (`beat`, film-beats.ts), so the
 *   table stays out of the first load; without one (the lab) the finale
 *   plays on entry, unranked.
 * - THE WARM POINT (`carry`, the last screen; B35 films half): the lazy
 *   ./films-desktop.tsx lifts the HP finale's warm point off the plate and
 *   lays it on the rising tintype card's sun (DESKTOP_FINE, motion on).
 *   The house lights and the carry are that lazy chunk (DP-13); this file
 *   renders only their server-side markers.
 */
export const FILMS_CAPTION: Record<CaptionWorld, CaptionKey> = {
  pirates: "cap.films.pirates",
  idiots: "cap.films.idiots",
  rdr2: "cap.films.rdr2",
  hp: "cap.films.hp",
};

/** Spec §6.1, the films row: a push during the screen's passage. */
const PUSH: CameraSpec = { kind: "push", scale: [1, 1.05], driver: "flow" };

/** The desktop half (DP-13): the house lights and the warm-point carry. */
const FilmsDesktop = safeLazy(() => import("@/components/sections/films/films-desktop"));

export function FilmFrame({
  world,
  choice,
  bearing,
  gates,
  beat,
  marks,
  lights = false,
  carry = false,
  className,
}: {
  world: CaptionWorld;
  choice: VariantChoice;
  /** The next act's compass bearing (the Pirates finale; derived). */
  bearing: number;
  /** gauntlet.length (the 3 Idiots finale; derived). */
  gates: number;
  /** The finale's time-star (film-beats.ts FILM_BEATS[world]). */
  beat?: { finale: string; weight: BeatWeight };
  /** Server markers inside the frame's box (the first screen's B30 / B31-bars). */
  marks?: ReactNode;
  /** The first screen: the house lights go down on it (B30, B31-bars). */
  lights?: boolean;
  /** The last screen: its warm point is carried onto the tintype's sun (B35). */
  carry?: boolean;
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
  const phase = useEnterOnce(ref, { amount: 0.5, star: beat ? { id: beat.finale, weight: beat.weight } : undefined });
  const mode: FinaleMode = phase === "armed" ? "hidden" : phase === "entered" ? "play" : "final";

  // the house lights (first screen) and the warm point (last): desktop, lazy
  const engine = usePlateEngine();

  const focal = variant === "alt" && asset ? filmMark(asset.id, FOCAL_MARK[world]) : null;
  const ox = ((focal?.[0] ?? 0.5) * 100).toFixed(1);
  const oy = ((focal?.[1] ?? 0.5) * 100).toFixed(1);
  const closed = variant === "alt" ? `circle(0% at ${ox}% ${oy}%)` : "inset(8% round 20px)";
  const open = variant === "alt" ? `circle(150% at ${ox}% ${oy}%)` : "inset(0% round 0px)";

  return (
    <div className={className} data-variant={variant}>
      <div
        ref={ref}
        className="relative aspect-[3/2] sm:aspect-[2.39/1]"
        data-films-frame={world}
        data-finale-mode={mode}
        {...(beat ? beatAttrs(beat.finale, { weight: beat.weight }) : null)}
      >
        {marks}
        <motion.div
          className="absolute inset-0 overflow-hidden bg-bg"
          initial={false}
          animate={{ clipPath: phase === "armed" ? closed : open }}
          transition={phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 }}
        >
          {stillId ? (
            <WorldProvider world={world} tone="deep">
              <LivePlate media={stillId} camera={PUSH} sizes="(min-width: 90rem) 1360px, 100vw" className="size-full">
                <Finale
                  world={world}
                  variant={variant}
                  mode={mode}
                  aspect={aspect}
                  stillId={asset?.id ?? stillId}
                  bearing={bearing}
                  gates={gates}
                />
              </LivePlate>
            </WorldProvider>
          ) : null}
        </motion.div>
      </div>
      <SceneCaption k={captionKeyFor(FILMS_CAPTION[world], variant)} place="under" />
      {(lights || carry) && engine ? (
        <Suspense fallback={null}>
          <FilmsDesktop frame={ref} lights={lights} carry={carry} />
        </Suspense>
      ) : null}
    </div>
  );
}
