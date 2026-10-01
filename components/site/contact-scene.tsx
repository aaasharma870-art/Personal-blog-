"use client";

import { useCallback, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { getMedia, markOf, resolveVariant, type MediaId } from "@/lib/media";
import { dur, easeClip, easeDraw } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { maskIntersect, maskStyle } from "@/components/primitives/mask-style";
import { MediaFrame } from "@/components/primitives/media-frame";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { useEnterOnce, type EnterPhase } from "@/components/primitives/use-enter-once";
import { ContactFinale } from "@/components/site/contact-finale";
import { Footprint, PrintAt, walkBetween } from "@/components/worlds/hp/footprints";
import {
  CandleField,
  CeilingClouds,
  NightSky,
  StarField,
  spotsIn,
  type CandleSpot,
} from "@/components/worlds/hp/hall-ceiling";

/* ============================================================================
   CONTACT SCENE — the last light's plate, the bracket over the flame, the
   copy flare, and the variant (lib/variants.ts piece `contact.lastlight`).

   THE PLATE is a feathered WINDOW onto MV-08 (the default plate; both
   loops, MV-09 and MV-09-alt, start and end on it): the box shows the
   plate's right part (CROP) — the last candles of the trail and the one
   floating candle — every edge dissolving into the dark (a radial mask,
   never a scrim over text; no text ever sits on it). Around it, the Great
   Hall's enchanted ceiling (HallField) and, under it, the caption; below
   the column the trail runs on to the credits (LastLightTrail, T12). The loop
   plays in the same box (MediaFrame: desktop + fine pointer only, in view,
   holding the one DecoderLock; reduced motion / Pause / Save-Data = the
   poster, 0 video bytes).

   THE MONOGRAM sits exactly on the flame: [ A · flame · S ], its centre =
   the flame (measured on the plate, see FLAME). The bracket is the one
   aqua mark once it resolves (DESIGN §5.1 use ③: the bracket that opened
   on Play closes here).
     DEFAULT "bracket-close": the halves travel in from either side once
       the plate is in view (easeClip / dur.hero) and turn ghost → aqua AT
       ARRIVAL.
     ALT "map-walk": Marauder's-Map footprints (ink) walk out of the dark
       along the plate's floor to the foot of the candle, fading behind;
       then the bracket is INKED closed around the monogram (easeDraw) and
       turns aqua when the stroke completes. Loop: MV-09-alt (the calmer
       flame), registered to the same plate.
   THE FLARE (bar H22): a successful copy brightens the flame region once —
   a masked backdrop layer inside the plate (brightness 1.2, 120 ms, area
   < 1 % of the viewport), never within 1 s of the last, never on a
   rejected copy, never under reduced motion / Pause. Media light, not DOM
   glow.
   Static (server HTML, reduced motion, no JS, in view at mount): resolved
   bracket, the ALT's trail laid down, no flare.
   ========================================================================== */

/** The flame's centre on each plate (0–1), measured on the accepted file
 *  (sharp, 2026-09-29: the > 200 luminance centroid of the flame; x .860–
 *  .875, y .399–.455). lib/media.ts `marks.flame` wins when registered. */
const MEASURED_FLAME: Partial<Record<MediaId, readonly [number, number]>> = {
  "MV-08": [0.868, 0.428],
};

function flameOf(plate: MediaId): readonly [number, number] {
  return markOf(plate, "flame") ?? MEASURED_FLAME[plate] ?? getMedia(plate).focal ?? [0.85, 0.5];
}

/** The part of the plate the window shows (0–1): the trail's last three
 *  candles and the floating candle, close enough that the taper reads as a
 *  candle (≈ 19 × 105 px in a 500 px window), with its calm surround. */
const CROP = { x0: 0.6, x1: 1, y0: 0.2, y1: 0.72 } as const;

/** A radial feather (ART-DIRECTOR #13): the window dissolves into the dark
 *  on every side — no rectangular edge on hp deep or on the hall's ceiling
 *  around it. Full at the flame and the trail's last candles; the walk
 *  (ALT) comes out of the dark at the lower left. */
const FEATHER = maskStyle("radial-gradient(ellipse 52% 50% at 52% 50%, #000 52%, rgb(0 0 0 / 0.62) 76%, transparent 100%)");

/* — the Great Hall around the last light (the ceiling, S19; ≥ lg around
     the plate, < lg a band above it). Field coordinates: % of a box from
     28 % of the column's width left of it to the page edge, one viewport
     tall, centred on the column (= the section's middle). The plate's core
     (x ≥ 22 %, y 27–82 %: the window and its caption) stays clear. — */
const HALL: readonly CandleSpot[] = [
  ...spotsIn(12, 81, { x0: 26, x1: 98, y0: 9, y1: 17 }, { w0: 5, w1: 8, o0: 0.4, o1: 0.62 }),
  ...spotsIn(8, 83, { x0: 28, x1: 97, y0: 13, y1: 21 }, { w0: 9, w1: 13, o0: 0.62, o1: 0.85 }),
  ...spotsIn(4, 85, { x0: 36, x1: 96, y0: 16, y1: 21 }, { w0: 15, w1: 19, o0: 0.88, o1: 1 }),
  ...spotsIn(5, 87, { x0: 8, x1: 20, y0: 30, y1: 60 }, { w0: 7, w1: 12, o0: 0.6, o1: 0.85 }, "xl"),
].sort((a, b) => a.w - b.w);
/** The band above the plate below lg (phones, tablets). */
const HALL_BAND = spotsIn(9, 91, { x0: 4, x1: 96, y0: 10, y1: 42 }, { w0: 6, w1: 16, o0: 0.5, o1: 1 });
/** Eased in (no ramp-start band): the ceiling rises out of the dark. */
const LEFT_FADE =
  "linear-gradient(to right, transparent, rgb(0 0 0 / 0.04) 6%, rgb(0 0 0 / 0.16) 13%, rgb(0 0 0 / 0.38) 21%, rgb(0 0 0 / 0.68) 29%, rgb(0 0 0 / 0.9) 36%, #000 42%)";
const X_FADE = "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)";

/** The hall's night ceiling and its candles, behind and around the plate. */
function HallField() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 hidden lg:block"
        style={{ left: "-28%", right: 0, top: "calc(50% - 50svh)", height: "100svh" }}
        data-motif="great-hall-ceiling"
      >
        {/* ends at 70 %: the section's own fade to the credits' deep starts there (T12) */}
        <NightSky
          className="inset-x-0 top-0 h-[70%]"
          cover="left"
          stops={[[0, "0%"], [0.9, "17%"], [0.72, "57%"], [0.3, "85%"], [0, "100%"]]}
        />
        <CeilingClouds
          className="inset-x-0 top-[4%] h-[52%]"
          style={maskIntersect(LEFT_FADE, "linear-gradient(to bottom, transparent, #000 25%, #000 60%, transparent)")}
        />
        <StarField
          className="inset-x-0 top-0 h-[72%]"
          style={maskIntersect(LEFT_FADE, "linear-gradient(to bottom, transparent 4%, #000 14%, #000 58%, transparent)")}
        />
        <CandleField spots={HALL} className="inset-0" />
      </div>
      <div aria-hidden="true" className="relative -mx-gutter h-32 sm:h-40 lg:hidden" data-motif="great-hall-ceiling">
        <NightSky className="inset-0" stops={[[0, "0%"], [0.85, "30%"], [0.6, "75%"], [0, "100%"]]} />
        <StarField className="inset-0" style={maskIntersect(X_FADE, "linear-gradient(to bottom, transparent, #000 25%, #000 60%, transparent)")} />
        <CandleField spots={HALL_BAND} className="inset-x-gutter inset-y-0" />
      </div>
    </>
  );
}

/* — T12: the last light's trail runs on down to the credits (≥ lg). From
     under the plate's flame to the section's bottom centre (the credits'
     head), fading: DEFAULT a dotted trail of ink points, the candles' trail
     continuing as ink (the credits close it with the Map's closing ink
     fold); ALT the Map's footprints walking on. Static (no motion). — */
const TRAIL_N = 13;
const TRAIL = Array.from({ length: TRAIL_N }, (_, i) => {
  const t = (i + 0.5) / TRAIL_N;
  const e = Math.pow(t, 2.2);
  const x = 79 - 71 * e;
  // heading in px for a ≈ 800 × 270 box: dx/dt, dy/dt
  const dx = -0.71 * 2.2 * Math.pow(t, 1.2) * 800;
  const dy = 270;
  return { x, y: t * 100, o: 0.62 - 0.4 * t, deg: (Math.atan2(dy, dx) * 180) / Math.PI + 90 };
});

function LastLightTrail({ variant }: { variant: Variant }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-full hidden lg:block"
      style={{ left: "-60%", right: 0, height: "calc(50svh - 50%)" }}
      data-motif="last-light-trail"
      data-variant={variant}
    >
      {TRAIL.map((p, i) =>
        variant === "alt" ? (
          <span
            key={i}
            className="absolute"
            style={{ left: `${p.x.toFixed(2)}%`, top: `${p.y.toFixed(2)}%`, opacity: p.o, transform: `translate(-50%, -50%) rotate(${p.deg.toFixed(1)}deg)` }}
          >
            <Footprint side={i % 2 ? "right" : "left"} size={12} fill="var(--w-ink-contour)" />
          </span>
        ) : (
          <span
            key={i}
            className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--w-ink-contour)"
            style={{ left: `${p.x.toFixed(2)}%`, top: `${p.y.toFixed(2)}%`, opacity: p.o }}
          />
        ),
      )}
    </div>
  );
}

export function ContactScene({
  choice,
  plate,
  loop,
  email,
  github,
  initials,
  text,
}: {
  choice: VariantChoice;
  plate: MediaId;
  loop: MediaId;
  email: string;
  github: string;
  initials: string;
  /** The server-rendered head: Meta, the desktop caption, the h2, the lede. */
  text: ReactNode;
}) {
  const variant = useVariant(choice, "contact.lastlight");
  const loopAsset = resolveVariant(loop, variant);
  const loopId: MediaId = loopAsset?.id ?? loop;
  // The plate the loop is registered to (its poster) — the monogram and the
  // flare register to that plate's flame.
  const plateId: MediaId = (loopAsset?.kind === "video" ? loopAsset.poster : undefined) ?? plate;

  const reduced = useReducedMotion();
  const [flare, setFlare] = useState(0);
  const lastFlare = useRef(Number.NEGATIVE_INFINITY);
  const onCopied = useCallback(() => {
    if (reduced) return;
    const now = performance.now();
    if (now - lastFlare.current < 1000) return;
    lastFlare.current = now;
    setFlare((n) => n + 1);
  }, [reduced]);

  return (
    <div
      className="grid w-full grid-cols-1 gap-tier-block lg:grid-cols-12 lg:items-center lg:gap-x-6"
      data-variant={variant}
    >
      <div className="lg:col-span-8">
        {text}
        <ContactFinale email={email} github={github} onCopied={onCopied} />
      </div>
      <div className="relative lg:col-span-4 lg:col-start-9 lg:mr-[calc(-1*var(--spacing-gutter))]">
        <HallField />
        <LastLightPlate
          loopId={loopId}
          plateId={plateId}
          variant={variant}
          flare={flare}
          initials={initials}
        />
        {/* the caption belongs to the plate, under it (never stacked on the h2) */}
        <SceneCaption k="cap.contact" place="under" className="lg:pr-gutter" />
        <LastLightTrail variant={variant} />
      </div>
    </div>
  );
}

function LastLightPlate({
  loopId,
  plateId,
  variant,
  flare,
  initials,
}: {
  loopId: MediaId;
  plateId: MediaId;
  variant: Variant;
  flare: number;
  initials: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.4 });
  const asset = getMedia(plateId);
  const cw = CROP.x1 - CROP.x0;
  const ch = CROP.y1 - CROP.y0;
  const boxAspect = (cw * (asset.width / asset.height)) / ch;
  const [fx, fy] = flameOf(plateId);
  const bx = (fx - CROP.x0) / cw;
  const by = (fy - CROP.y0) / ch;
  const inner: CSSProperties = {
    position: "absolute",
    width: `${(100 / cw).toFixed(3)}%`,
    height: `${(100 / ch).toFixed(3)}%`,
    left: `${((-CROP.x0 / cw) * 100).toFixed(3)}%`,
    top: `${((-CROP.y0 / ch) * 100).toFixed(3)}%`,
  };
  const at: CSSProperties = { left: `${(bx * 100).toFixed(3)}%`, top: `${(by * 100).toFixed(3)}%` };

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: boxAspect.toFixed(4), ...FEATHER }}
      data-plate={plateId}
      data-motif="last-light"
    >
      <div style={inner}>
        <MediaFrame
          media={loopId}
          poster={plateId}
          layout="fill"
          playOn="desktop"
          loop
          sizes="(min-width: 64rem) 90vw, 250vw"
        />
      </div>

      {flare > 0 ? (
        <motion.span
          key={flare}
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            ...at,
            width: "9%",
            height: "22%",
            backdropFilter: "brightness(1.2)",
            WebkitBackdropFilter: "brightness(1.2)",
            ...maskStyle("radial-gradient(closest-side, #000 35%, transparent 100%)"),
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: dur.flash, times: [0, 0.2, 0.75, 1], ease: "linear" }}
          data-flare={flare}
        />
      ) : null}

      {variant === "alt" ? <MapWalk phase={phase} to={[bx - 0.035, by + 0.4]} aspect={boxAspect} /> : null}

      <div className="absolute" style={at}>
        <Monogram phase={phase} variant={variant} initials={initials} />
      </div>
    </div>
  );
}

/* — the bracket around [ A · flame · S ] ————————————————————————————— */

const WALK_S = 0.25 + 8 * 0.17 + 0.3; // the ALT walk's length (s) before the bracket inks

function Monogram({ phase, variant, initials }: { phase: EnterPhase; variant: Variant; initials: string }) {
  const [arrived, setArrived] = useState(false);
  const resolved = phase === "static" || arrived;
  const first = initials.slice(0, 1);
  const rest = initials.slice(1);

  const bracket = (side: "l" | "r") => {
    const d = side === "l" ? "M11 1 L1 1 L1 63 L11 63" : "M1 1 L11 1 L11 63 L1 63";
    if (variant === "alt") {
      // ALT: the bracket is inked closed after the walk
      return (
        <svg
          viewBox="0 0 12 64"
          aria-hidden="true"
          focusable="false"
          className={cn(
            "h-12 w-2.5 overflow-visible transition-[stroke] duration-(--dur-base) sm:h-14 sm:w-3",
            resolved ? "stroke-accent" : "stroke-(--w-ink-contour)",
          )}
        >
          <motion.path
            d={d}
            fill="none"
            strokeWidth={2}
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
            initial={false}
            animate={{ pathLength: phase === "armed" ? 0 : 1 }}
            transition={
              phase === "entered"
                ? { duration: dur.draw.short, ease: easeDraw, delay: WALK_S }
                : { duration: 0 }
            }
            onAnimationComplete={() => {
              if (phase === "entered" && side === "r") setArrived(true);
            }}
          />
        </svg>
      );
    }
    // DEFAULT: the halves travel in and close
    return (
      <motion.svg
        viewBox="0 0 12 64"
        aria-hidden="true"
        focusable="false"
        className={cn(
          "h-12 w-2.5 overflow-visible transition-[stroke] duration-(--dur-base) sm:h-14 sm:w-3",
          resolved ? "stroke-accent" : "stroke-fg-ghost",
        )}
        initial={false}
        animate={{ x: phase === "armed" ? (side === "l" ? -44 : 44) : 0 }}
        transition={phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 }}
        onAnimationComplete={() => {
          if (phase === "entered" && side === "r") setArrived(true);
        }}
      >
        <path d={d} fill="none" strokeWidth={2} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
      </motion.svg>
    );
  };

  const letter = "inline-block w-[0.8em] text-center font-serif text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none text-fg";
  return (
    <div
      aria-hidden="true"
      className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 sm:gap-3"
      data-motif="bracket-monogram"
      data-resolved={resolved ? "" : undefined}
      data-beat="B56"
      data-beat-star=""
      data-beat-weight="2"
    >
      {bracket("l")}
      <span className={letter}>{first}</span>
      {/* the flame stands here, between the initials */}
      <span className="block w-9 sm:w-11" />
      <span className={letter}>{rest}</span>
      {bracket("r")}
    </div>
  );
}

/* — ALT: the Marauder's-Map walk to the light ———————————————————————— */

const WALK_STEPS = 9;

function MapWalk({
  phase,
  to,
  aspect,
}: {
  phase: EnterPhase;
  to: readonly [number, number];
  aspect: number;
}) {
  const W = 1000 * aspect;
  const H = 1000;
  const steps = walkBetween({ x: 0.04 * W, y: 0.9 * H }, { x: to[0] * W, y: Math.min(0.86, to[1]) * H }, WALK_STEPS, 11);
  return (
    <svg
      viewBox={`0 0 ${W.toFixed(0)} ${H}`}
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full"
      data-motif="map-walk"
    >
      {steps.map((s, k) => {
        const last = k >= WALK_STEPS - 2;
        const rest = last ? 1 : 0.35;
        return (
          <motion.g
            key={k}
            initial={false}
            animate={{ opacity: phase === "armed" ? 0 : last ? 1 : [0, 1, rest] }}
            transition={
              phase === "entered"
                ? { duration: last ? dur.base : 0.9, delay: 0.25 + k * 0.17, times: last ? undefined : [0, 0.2, 1] }
                : { duration: 0 }
            }
          >
            <PrintAt x={s.x} y={s.y} deg={s.deg} w={30} side={s.side} fill="var(--w-ink-contour)" />
          </motion.g>
        );
      })}
    </svg>
  );
}
