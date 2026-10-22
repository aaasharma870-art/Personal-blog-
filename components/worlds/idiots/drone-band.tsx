"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { useMotionValue } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { resolveVariant, type MediaId } from "@/lib/media";
import { safeLazy } from "@/lib/safe-lazy";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import type { CameraSpec } from "@/components/primitives/camera";
import { LivePlate } from "@/components/primitives/live-plate";
import { SettleFrame } from "@/components/worlds/idiots/chalk-motion";
import type { DroneCopy, DroneSprites, GameKeyCopy } from "@/components/games/shared";

/* the desk loads only on DESKTOP_FINE with motion on (DP-13); the game
   itself is mounted by the desktop enhancer's games binder on a press */
const DroneDesk = safeLazy(() => import("@/components/games/drone/drone-desk"));

/** Spec §6.1 "iconic-drone L07 (systems): drift; still while the drone
 *  flies", 1 → 1.02 over the band's passage. L07 has no passing loop, so the
 *  plate takes <LivePlate>'s CODE path under this camera; the desk feeds the
 *  passage and holds it while the drone flies. */
const CAMERA: CameraSpec = { kind: "drift", scale: [1, 1.02], driver: "progress" };

/**
 * DroneBand — the systems section's head band (RECOGNIZABILITY S10): the
 * homemade quadcopter from 3 Idiots hovering in the college courtyard
 * (iconic-drone; the ALT plate is iconic-drone-alt), 3:1 ≥ 640, 4:3 below,
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
 * - "Take off" (the game's ARCADE KEY, app/p3/arcade.css; lower right,
 *   `#drone-takeoff`: the palette's "Fly the homemade drone" scrolls here and
 *   focuses it) sits in a small plate with the small chalk drone and a one-line
 *   "Mini-game" note about what you do (Oct 22: it was a 100 px pill that
 *   looked like the header's buttons). All of it is plain markup shown ONLY on
 *   DESKTOP_FINE after JS by the full media query (app/p3/games.css); the
 *   key's lamp and Ready / Live word follow its `aria-pressed`, which the
 *   games binder sets while the drone flies. The key carries no handler
 *   here (first-load budget): the desktop enhancer's games binder
 *   (components/enhance/binders/games.ts) mounts the lazy game
 *   (components/games/drone/drone-game.tsx) on a press, reading the strings
 *   (`data-copy`), the `systems.drone` variant (`data-variant`) and the
 *   sprite (the chalk drone's src) from this markup; a press before the
 *   binder ran is recorded by the boot script (`data-enhance-queue`) and
 *   replayed. It never starts by itself;
 * - B26, the take-off invite: the band carries the beat; the lazy desk
 *   (DESKTOP_FINE, motion on) lifts the chalk drone 8 px once on
 *   scroll-idle through the spotlight, feeds the camera and warms the game.
 *   The key is visible at rest; the invite is only an extra.
 * Phones, touch tablets and no JS: exactly today's band.
 */
export function DroneBand({
  media,
  choice,
  caption,
  className,
  game,
  sprites,
  keys,
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
  /** The "Mini-game" tag, the one plain line and the Ready / Live words
   *  (resolved on the server); null = the key alone. */
  keys?: GameKeyCopy | null;
}) {
  const variant = useVariant(choice, "systems.band");
  const gameVariant = useVariant(choice, "systems.drone");
  const plate = resolveVariant(media, variant)?.id ?? media;
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const p = useMotionValue(0);
  const box = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLImageElement>(null);
  const sprite = sprites?.[gameVariant === "alt" ? "alt" : "default"];
  return (
    <div className={cn("scene-caption-host", className)} data-band={plate} {...beatAttrs("B26", { weight: 1 })}>
      <SettleFrame entrance={variant === "alt" ? "wipe" : "settle"} className="relative sm:overflow-hidden sm:rounded-frame">
        <div ref={box} className="relative aspect-[4/3] overflow-hidden rounded-frame sm:aspect-[3/1] sm:rounded-none">
          <LivePlate media={plate} camera={CAMERA} progress={p} depth={false} className="size-full" sizes="(min-width: 90rem) 1312px, 100vw" />
          {game && sprite ? (
            <div className="drone-pill-row arcade-plaque arcade-plaque--panel">
              {/* the band's chalk drone (the B26 invite lifts it; the game
                  flies its src); lazy, so a phone (the row is display:none
                  there) never fetches it */}
              {/* eslint-disable-next-line @next/next/no-img-element -- a 2 KB baked chalk sprite, decorative */}
              <img ref={mark} src={sprite.src} width={sprite.width} height={sprite.height} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
              {keys ? (
                <p id="drone-what" className="arcade-what">
                  <span className="arcade-what-tag">{keys.tag}</span>
                  {keys.what}
                </p>
              ) : null}
              <button
                id="drone-takeoff"
                type="button"
                className="arcade-key arcade-key--big"
                aria-pressed="false"
                aria-describedby={keys ? "drone-what" : undefined}
                data-enhance-queue=""
                data-variant={gameVariant}
                data-copy={JSON.stringify(game)}
              >
                <span className="arcade-key-face">
                  <svg className="arcade-key-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 4 21 20H3z" fill="currentColor" />
                  </svg>
                  {/* the copy's leading ▲ is the icon above */}
                  <span className="arcade-key-name">{game.pill.replace(/^▲\s*/u, "")}</span>
                  {keys ? (
                    <span className="arcade-key-win" aria-hidden="true">
                      <i className="arcade-lamp" />
                      <span className="arcade-key-word">
                        <span className="ak-off">{keys.ready}</span>
                        <span className="ak-on">{keys.live}</span>
                      </span>
                    </span>
                  ) : null}
                </span>
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
