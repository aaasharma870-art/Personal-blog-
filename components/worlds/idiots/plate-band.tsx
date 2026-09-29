"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import type { CaptionKey } from "@/lib/film";
import { altOf, defaultOf, resolveMedia, type FocalBox, type MediaId } from "@/lib/media";
import { dur, ease, easeClip, springSettle } from "@/lib/motion";
import type { HeadPlate } from "@/lib/page";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { useEnterOnce, type EnterPhase } from "@/components/primitives/use-enter-once";
import { PenCase } from "@/components/worlds/idiots/chalk";

/* ============================================================================
   ACT II PLATE BANDS (M2 finish; RECOGNIZABILITY S08–S11, BLIND-1 D24/D30).
   The DroneBand pattern, generalized: a poster-first MediaFrame plate (the
   asset's focal point), an entrance that plays ONCE when it scrolls in, and
   the scene caption (MOMENT • FILM, the Kalam fan face) on the plate's calm
   corner ≥ 640 px, `under` it below. Three hosts:
     HeadBand  the work section's head (THE CORRIDORS OF ICE • 3 IDIOTS):
               full-bleed 21:9 (4:3 below 640) above the h2.
     PenInset  the kill-list's header inset (VIRUS'S ASTRONAUT PEN • 3 IDIOTS):
               16:9, ≥ 45 % of the content width at 1440, caption under.
     PlateBand the primitive both use (and the optuna machine board).
   Entrances (a DEFAULT and a meaningfully different ALT per host):
     slow-settle  the plate fades up while it settles from 1.07× to 1× (1.6 s)
     light-sweep  the plate comes up from shadow as bars of pergola light
                  rake across it once, left → right
     pats         aalIzzWell: two soft pats (y 8 → 0, then a small kick), the
                  frame .96 → 1 (IC-3I-03; non-interactive only)
     lid-lift     the frame opens from its bottom edge upward (the case lid
                  lifting) while the plate settles from 1.05×
     none         no plate entrance (a host that animates its own overlay)
   The caption fades in after the plate settles (R1). Server HTML, hydration,
   anything already in view at mount, reduced motion and Pause: the FINAL
   frame. Hiding happens only offscreen ("armed"), and the observer watches
   the OUTER wrapper, which is never clipped or transformed (ART-DIRECTOR #1);
   the clip / transform / filter live on inner elements.
   PLANNED PLATES: a head's own plate may still be "planned" (iconic-corridor,
   iconic-pen: the media lane could not fetch them). Then the band plays its
   `standInMedia` (or the registered fallback chain) and names what it
   actually shows with the stand-in caption, or (PenInset) draws its code
   stand-in: a caption never promises what the image doesn't show.
   ========================================================================== */

/* — plate choice (lib/media.ts variants) ————————————————————————————— */

/** The other side of a media pair: a DEFAULT's alt, or an ALT's default. */
export function otherSide(id: MediaId): MediaId | null {
  return altOf(id) ?? defaultOf(id);
}

/** Whether `id` is itself usable (accepted / integrated), not a fallback. */
function usable(id: MediaId): boolean {
  return resolveMedia(id)?.id === id;
}

/** The plate `variant` plays for `media`: DEFAULT → `media`; ALT → the other
 *  side of its pair when that is usable, else `media`. null = `media` itself
 *  is not usable yet (planned). */
export function platePick(media: MediaId, variant: Variant): MediaId | null {
  if (variant === "alt") {
    const other = otherSide(media);
    if (other && usable(other)) return other;
  }
  return usable(media) ? media : null;
}

/** A head's plate for `variant`: its own (ready), else its stand-in, else
 *  whatever its registered fallback chain resolves to (never a hole). */
export function headPlateOf(spec: HeadPlate, variant: Variant): { id: MediaId; ready: boolean } | null {
  const own = platePick(spec.media, variant);
  if (own) return { id: own, ready: true };
  if (spec.standInMedia) {
    const s = platePick(spec.standInMedia, variant);
    if (s) return { id: s, ready: false };
  }
  const r = resolveMedia(spec.media);
  return r ? { id: r.id, ready: false } : null;
}

/** A 0–1 rect measured on a plate (aspect `plate` = w / h) mapped into a box
 *  (aspect `box`) that shows the plate with object-fit: cover at
 *  object-position `focal` (MediaFrame's rule). Clamped to the box. */
export function coverRect(r: FocalBox, plate: number, box: number, focal: readonly [number, number] = [0.5, 0.5]): FocalBox {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  if (plate >= box) {
    const k = plate / box;
    const off = (1 - k) * focal[0];
    return { x0: clamp(r.x0 * k + off), x1: clamp(r.x1 * k + off), y0: r.y0, y1: r.y1 };
  }
  const k = box / plate;
  const off = (1 - k) * focal[1];
  return { x0: r.x0, x1: r.x1, y0: clamp(r.y0 * k + off), y1: clamp(r.y1 * k + off) };
}

/* — the entrance ——————————————————————————————————————————————————— */

export type PlateEntranceKind = "none" | "slow-settle" | "light-sweep" | "pats" | "lid-lift";

const CLIP_OPEN = "inset(0% 0% 0% 0%)";
const CLIP_SHUT = "inset(100% 0% 0% 0%)";
const LIT = "brightness(1) saturate(1)";
const SHADOW = "brightness(0.32) saturate(0.7)";

function usePlateEntrance(ref: RefObject<HTMLDivElement | null>, kind: PlateEntranceKind, amount: number) {
  const phase = useEnterOnce(ref, { amount });
  const frameOpacity = useMotionValue(1);
  const frameY = useMotionValue(0);
  const frameScale = useMotionValue(1);
  const frameClip = useMotionValue(CLIP_OPEN);
  const imageScale = useMotionValue(1);
  const imageFilter = useMotionValue(LIT);
  const sweepX = useMotionValue("-75%");
  const sweepOpacity = useMotionValue(0);
  const captionOpacity = useMotionValue(1);

  useLayoutEffect(() => {
    const final = () => {
      frameOpacity.jump(1);
      frameY.jump(0);
      frameScale.jump(1);
      frameClip.jump(CLIP_OPEN);
      imageScale.jump(1);
      imageFilter.jump(LIT);
      sweepX.jump("-75%");
      sweepOpacity.jump(0);
      captionOpacity.jump(1);
    };
    if (phase === "static" || kind === "none") {
      final();
      return;
    }
    if (phase === "armed") {
      captionOpacity.jump(0);
      if (kind === "slow-settle") {
        frameOpacity.jump(0);
        imageScale.jump(1.07);
      } else if (kind === "light-sweep") {
        imageFilter.jump(SHADOW);
        sweepX.jump("-75%");
      } else if (kind === "pats") {
        frameOpacity.jump(0);
        frameY.jump(8);
        frameScale.jump(0.96);
      } else {
        frameClip.jump(CLIP_SHUT);
        imageScale.jump(1.05);
      }
      return;
    }
    // entered: play once
    const run: { stop: () => void }[] = [];
    let timer: number | null = null;
    let capDelay = 0.6;
    if (kind === "slow-settle") {
      run.push(animate(frameOpacity, 1, { duration: dur.reveal, ease }));
      run.push(animate(imageScale, 1, { duration: 1.6, ease }));
      capDelay = 0.9;
    } else if (kind === "light-sweep") {
      run.push(animate(imageFilter, LIT, { duration: 1.4, ease }));
      run.push(animate(sweepX, "75%", { duration: 1.7, ease: [0.45, 0, 0.35, 1] }));
      run.push(animate(sweepOpacity, [0, 0.9, 0.9, 0], { duration: 1.7, times: [0, 0.2, 0.7, 1], ease: "linear" }));
      capDelay = 1.2;
    } else if (kind === "pats") {
      run.push(animate(frameOpacity, 1, { duration: dur.base, ease }));
      run.push(animate(frameScale, 1, { type: "spring", ...springSettle }));
      run.push(animate(frameY, 0, { type: "spring", ...springSettle }));
      // the second soft pat: a small downward kick that settles again
      timer = window.setTimeout(() => {
        run.push(animate(frameY, 0, { type: "spring", ...springSettle, velocity: 90 }));
      }, 180);
      capDelay = 0.5;
    } else {
      run.push(animate(frameClip, CLIP_OPEN, { duration: dur.hero, ease: easeClip }));
      run.push(animate(imageScale, 1, { duration: 1.2, ease }));
      capDelay = 0.7;
    }
    run.push(animate(captionOpacity, 1, { duration: dur.base, ease, delay: capDelay }));
    return () => {
      if (timer !== null) window.clearTimeout(timer);
      run.forEach((a) => a.stop());
    };
  }, [phase, kind, frameOpacity, frameY, frameScale, frameClip, imageScale, imageFilter, sweepX, sweepOpacity, captionOpacity]);

  return { phase, frameOpacity, frameY, frameScale, frameClip, imageScale, imageFilter, sweepX, sweepOpacity, captionOpacity };
}

/* — the primitive ————————————————————————————————————————————————————— */

type Slot = ReactNode | ((phase: EnterPhase) => ReactNode);
const renderSlot = (s: Slot, phase: EnterPhase) => (typeof s === "function" ? s(phase) : s);

/** band: 4:3 → 21:9, rounded, in the page column · bleed: 4:3 → 21:9, full
 *  width, square edges · inset: 16:9, rounded. */
export type PlateShape = "band" | "bleed" | "inset";
const SHAPE: Record<PlateShape, { frame: string; box: string }> = {
  band: { frame: "sm:overflow-hidden sm:rounded-frame", box: "aspect-[4/3] rounded-frame sm:aspect-[21/9] sm:rounded-none" },
  bleed: { frame: "", box: "aspect-[4/3] sm:aspect-[21/9]" },
  inset: { frame: "", box: "aspect-video rounded-frame" },
};

export function PlateBand({
  plate,
  art,
  entrance,
  shape = "band",
  sizes = "(min-width: 90rem) 1312px, 100vw",
  caption,
  captionClassName,
  overlay,
  after,
  className,
  amount = 0.3,
}: {
  /** The resolved plate to show (see headPlateOf / platePick). */
  plate: MediaId | null;
  /** A code-drawn stand-in instead of the plate (PenCase). */
  art?: ReactNode;
  entrance: PlateEntranceKind;
  shape?: PlateShape;
  sizes?: string;
  /** The scene caption (a <SceneCaption>); it fades in after the plate. */
  caption?: ReactNode;
  /** Classes for the caption's wrapper (e.g. to align a bleed band's
   *  caption to the page column). */
  captionClassName?: string;
  /** Painted over the plate, inside its box (chalk on the board …). */
  overlay?: Slot;
  /** In the frame after the plate box (in flow below 640). */
  after?: Slot;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const e = usePlateEntrance(ref, entrance, amount);
  const s = SHAPE[shape];
  const frameStyle =
    entrance === "lid-lift"
      ? { clipPath: e.frameClip }
      : entrance === "pats"
        ? { opacity: e.frameOpacity, y: e.frameY, scale: e.frameScale }
        : entrance === "slow-settle"
          ? { opacity: e.frameOpacity }
          : undefined;
  const imageStyle =
    entrance === "light-sweep"
      ? { filter: e.imageFilter }
      : entrance === "slow-settle" || entrance === "lid-lift"
        ? { scale: e.imageScale }
        : undefined;
  return (
    <div ref={ref} className={cn("scene-caption-host", className)} data-band={plate ?? "code"} data-entrance={entrance}>
      <motion.div className={cn("relative @container", s.frame)} style={frameStyle}>
        <div className={cn("relative overflow-hidden bg-(--world-deep)", s.box)}>
          <motion.div className="absolute inset-0" style={imageStyle}>
            {art ?? (plate ? <MediaFrame media={plate} layout="fill" sizes={sizes} /> : null)}
          </motion.div>
          {entrance === "light-sweep" ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/4 w-[150%] mix-blend-screen"
              style={{
                x: e.sweepX,
                opacity: e.sweepOpacity,
                backgroundImage:
                  "repeating-linear-gradient(112deg, transparent 0 5.5%, rgb(255 214 150 / 0.34) 6.5% 9%, transparent 10% 12%)",
              }}
            />
          ) : null}
          {renderSlot(overlay, e.phase)}
        </div>
        {renderSlot(after, e.phase)}
        {caption ? (
          <motion.div className={captionClassName} style={{ opacity: e.captionOpacity }}>
            {caption}
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}

/* — the hosts —————————————————————————————————————————————————————————— */

/**
 * HeadBand — a section's head plate (the work section: iconic-corridor, the
 * long ICE stone corridor under striped pergola sunlight; its calm, darker
 * left 40 % carries the caption). `shape="bleed"` runs it edge to edge; the
 * caption then aligns to the page column. DEFAULT entrance slow-settle, ALT
 * light-sweep (the pergola's bars of light rake across as it comes up).
 * Decorative plate (alt="" in the manifest): the caption carries the meaning.
 */
export function HeadBand({
  spec,
  choice,
  pieceKey,
  captionKey,
  standInCaptionKey,
  entrances = ["slow-settle", "light-sweep"],
  shape = "bleed",
  className,
}: {
  spec: HeadPlate;
  choice: VariantChoice;
  /** The registry piece ("work.head"). */
  pieceKey: string;
  captionKey: CaptionKey;
  /** Names the stand-in plate while `spec.media` is still planned. */
  standInCaptionKey?: CaptionKey;
  entrances?: readonly [PlateEntranceKind, PlateEntranceKind];
  shape?: PlateShape;
  className?: string;
}) {
  const variant = useVariant(choice, pieceKey);
  const pick = headPlateOf(spec, variant);
  if (!pick) return null;
  const k = pick.ready ? captionKey : (standInCaptionKey ?? captionKey);
  const bleed = shape === "bleed";
  return (
    <PlateBand
      plate={pick.id}
      entrance={variant === "alt" ? entrances[1] : entrances[0]}
      shape={shape}
      sizes={bleed ? "100vw" : undefined}
      className={className}
      caption={<SceneCaption k={k} place="bl" />}
      captionClassName={
        bleed
          ? "px-gutter sm:absolute sm:inset-y-0 sm:left-[calc(max(0px,(100%_-_var(--container-page))/2)_+_var(--spacing-gutter)_-_24px)] sm:right-[calc(max(0px,(100%_-_var(--container-page))/2)_+_var(--spacing-gutter)_-_24px)] sm:px-0"
          : undefined
      }
    />
  );
}

/**
 * PenInset — the kill-list's header plate: Virus's astronaut pen in its open
 * velvet case (iconic-pen; ALT iconic-pen-alt). 16:9 inset beside the h2
 * (≥ 45 % of the content width at 1440), the caption UNDER it so it never
 * covers the pen and never sits on a row (O-5: the film cue lives at the
 * head only). DEFAULT entrance pats (two soft pats), ALT lid-lift. While the
 * plate is planned it draws PenCase, its code stand-in (same caption: it
 * shows the same moment).
 */
export function PenInset({
  spec,
  choice,
  pieceKey,
  captionKey,
  className,
}: {
  spec: HeadPlate;
  choice: VariantChoice;
  pieceKey: string;
  captionKey: CaptionKey;
  className?: string;
}) {
  const variant = useVariant(choice, pieceKey);
  const own = platePick(spec.media, variant);
  return (
    <PlateBand
      plate={own}
      art={own ? undefined : <PenCase />}
      entrance={variant === "alt" ? "lid-lift" : "pats"}
      shape="inset"
      sizes="(min-width: 64rem) 50vw, 100vw"
      className={className}
      caption={<SceneCaption k={captionKey} place="under" />}
    />
  );
}
