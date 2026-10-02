"use client";

import { lazy, Suspense, useRef, useState, type ReactNode } from "react";
import { useMotionValue } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { resolveVariant, type MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import type { CameraSpec } from "@/components/primitives/camera";
import { LivePlate } from "@/components/primitives/live-plate";
import { SettleFrame } from "@/components/worlds/idiots/chalk";
import type { DroneCopy, DroneSprites } from "@/components/games/shared";

/* the game and its desk load only on DESKTOP_FINE, on demand (DP-13) */
const DroneGame = lazy(() => import("@/components/games/drone/drone-game"));
const DroneDesk = lazy(() => import("@/components/games/drone/drone-desk"));

/** Spec §6.1 "iconic-drone L07 (systems): drift; still while the drone
 *  flies", 1 → 1.02 over the band's passage. L07 has no passing loop, so the
 *  plate takes <LivePlate>'s CODE path under this camera; the desk feeds the
 *  passage and holds it while the drone flies. */
const CAMERA: CameraSpec = { kind: "drift", scale: [1, 1.02], driver: "progress" };

/**
 * DroneBand — the systems section's head band (RECOGNIZABILITY S10): the
 * homemade quadcopter from 3 Idiots hovering in the college courtyard
 * (iconic-drone; the ALT plate is iconic-drone-alt), 21:9 ≥ 640, 4:3 below,
 * the focal point on the drone. The scene caption (THE HOMEMADE DRONE •
 * 3 IDIOTS) sits on its calm lower left. Sensitivity (IC-3I-08): the caption
 * names no character, the plate has no window or feed, and nothing links it
 * to Aryan's own drone work. The band settles in (non-interactive,
 * aalIzzWell) under the default; the ALT wipes it on (`systems.band`).
 * Decorative plate (alt="" in the manifest): the caption carries the meaning.
 *
 * PHASE 3 (PHASE3-SPEC §6.1, §9.2 #2; W3-GAMES):
 * - the plate is a <LivePlate> (the drift above; phones, reduced motion and
 *   no JS: today's still, identity transform);
 * - "▲ Take off" (a Meta pill, lower right, `#drone-takeoff`: the palette's
 *   "Fly the homemade drone" scrolls here and focuses it) and the small chalk
 *   drone beside it are server markup shown ONLY on DESKTOP_FINE after JS by
 *   the full media query (app/p3/games.css). A press mounts the lazy game
 *   (components/games/drone/drone-game.tsx); it never starts by itself;
 * - B26, the take-off invite: the band carries the beat; the lazy desk
 *   (DESKTOP_FINE, motion on) lifts the chalk drone 8 px once on
 *   scroll-idle through the spotlight, feeds the camera and warms the game.
 * Phones, touch tablets and no JS: exactly today's band.
 */
export function DroneBand({
  media,
  choice,
  caption,
  className,
  game,
  sprites,
}: {
  media: MediaId;
  choice: VariantChoice;
  caption?: ReactNode;
  className?: string;
  /** The game's strings (resolved on the server); null = no game. */
  game?: DroneCopy | null;
  /** The baked chalk / blueprint drone sprites (static imports, resolved on
   *  the server so this first-load file carries no image module). */
  sprites?: DroneSprites;
}) {
  const variant = useVariant(choice, "systems.band");
  const gameVariant = useVariant(choice, "systems.drone");
  const plate = resolveVariant(media, variant)?.id ?? media;
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const p = useMotionValue(0);
  const [run, setRun] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const mark = useRef<HTMLImageElement>(null);
  const sprite = sprites?.[gameVariant === "alt" ? "alt" : "default"];
  return (
    <div className={cn("scene-caption-host", className)} data-band={plate} {...beatAttrs("B26", { weight: 1 })}>
      <SettleFrame entrance={variant === "alt" ? "wipe" : "settle"} className="relative sm:overflow-hidden sm:rounded-frame">
        <div ref={box} className="relative aspect-[4/3] overflow-hidden rounded-frame sm:aspect-[21/9] sm:rounded-none">
          <LivePlate media={plate} camera={CAMERA} progress={p} depth={false} className="size-full" sizes="(min-width: 90rem) 1312px, 100vw" />
          {fine && game && sprite && run > 0 ? (
            <Suspense fallback={null}>
              <DroneGame run={run} box={box} pill={pill} copy={game} variant={gameVariant} sprite={sprite.src} />
            </Suspense>
          ) : null}
          {game && sprite ? (
            <div className="drone-pill-row">
              {/* the band's chalk drone (the B26 invite lifts it); lazy, so a
                  phone (the row is display:none there) never fetches it */}
              {/* eslint-disable-next-line @next/next/no-img-element -- a 2 KB baked chalk sprite, decorative */}
              <img ref={mark} src={sprite.src} width={sprite.width} height={sprite.height} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
              <button ref={pill} id="drone-takeoff" type="button" className="game-pill type-meta" onClick={() => setRun((n) => n + 1)}>
                {game.pill}
              </button>
            </div>
          ) : null}
        </div>
        {caption}
      </SettleFrame>
      {fine && !reduced && game && sprite ? (
        <Suspense fallback={null}>
          <DroneDesk band={box} p={p} mark={mark} />
        </Suspense>
      ) : null}
    </div>
  );
}
