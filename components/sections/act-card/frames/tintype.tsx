"use client";

import { useId } from "react";
import { motion, useTransform } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, fitPath, fitPoint, remap, type Box as LineBox } from "@/components/primitives/loaders/line";
import { SUN_SPRITE } from "@/components/primitives/loaders/sprites-rd";
import { useCard } from "@/components/sections/act-card/card-context";
import {
  FRAME_ASPECT,
  PlateBox,
  anchor,
  coverBox,
  inBox,
  plateOf,
  type Aspects,
  type Plate,
  type Pos,
} from "@/components/sections/act-card/plate";

/**
 * Card II→III "The tintype" (SM-14, kind `tintype`, reel-class, 0 travel;
 * rdr2-act.BAR §A, RECOGNIZABILITY S13 / T7). RDR2's own signature is a
 * loading screen, so its card is one — "develop, don't load" (RD-P4).
 * Driven by the card's passage p (no pin); scrolling back reverses it.
 * (p = .5 is the card's top at mid-viewport — the transition's MIDDLE,
 * where both worlds must show: M2 ART-DIRECTOR #6 / BLIND-1 "act-3-enter".)
 *   0–.22   the Intermission's warm point sinks and becomes a LOW SUN (a
 *           --w-dusk sprite: media, never DOM glow) that comes to rest ON
 *           THE PLATE'S OWN SUN (the plate's `sun` anchor); the Line is
 *           re-traced as a graphite trail across 6 hachure arcs,
 *           pathLength = remap(p, 0, .25).
 *   .25–.82 the frame is a tintype plate (R-2: 6 px radius, grayscale +
 *           .45 sepia, an inset darkening vignette) that DEVELOPS into the
 *           frontier: MV-10, the Heartlands at golden hour — a riderless
 *           horse, the river, the ridges under the low sun. The plate is a
 *           LATENT print under an rd-deep cover that clears evenly (M2
 *           critic 3 #4: the old procedural ink-bleed blobs read as dirt;
 *           never Lee Martin's sprite sheet), while the frame comes into
 *           view. The sun sprite hands over to the photograph's sun as it
 *           develops (.45–.72); the hachure arcs (pencil scaffolding) fade
 *           as the photograph takes their place.
 *   .45–.88 the plate FIXES: the sepia lifts into golden-hour colour
 *           (opacity only: the sepia print lies over the colour print), and
 *           the --w-bone plate border draws (.7–.95).
 * The settled / static card IS the Heartlands in colour — blind, a
 * stranger reads "RDR2's Heartlands" — and the Beyond band below is the
 * same plate (a declared reuse: T8, 0 cut).
 * The progress element is the lower bar's pencil line: no "loading", no %,
 * no status. Static card (RM, Pause, no JS, < 640, SSR): the developed
 * colour plate, the trail drawn, the border drawn (no hachures).
 * aria-hidden art.
 *
 * MV-10 missing (`plate` null): the plate that develops is its MEDIA-PLAN
 * code alternative, a golden-hour frontier drawn in SVG gradients (sky haze
 * brightest at the far ridge under the low sun, two ridges, a dark grass
 * foreground where the graphite trail runs), tintyped like the photograph.
 * Never a legacy still (the validator forbids it on a film card).
 */

const VB = { w: 1000, h: 418 };
/** Plate inset inside the frame (viewBox units) and its corner radius. */
const PLATE = { x: 40, y: 22, w: 920, h: 374, r: 6 };
/** The graphite trail across the plate's lower third (the Line, re-traced). */
const TRAIL_BOX: LineBox = { x: 90, y: 250, w: 820, h: 120 };
/** The PLATE box's aspect inside the card frame (3:2 / 2.39:1). */
export const PLATE_ASPECT: Aspects = {
  base: (FRAME_ASPECT.base * PLATE.w) / VB.w / (PLATE.h / VB.h),
  sm: (FRAME_ASPECT.sm * PLATE.w) / VB.w / (PLATE.h / VB.h),
};
/** The card's geometry, shared with the ALT (frames/tintype-deadeye.tsx). */
export const TINTYPE = { VB, PLATE, TRAIL_BOX } as const;
const TRAIL = fitPath(LINE_D, TRAIL_BOX);
const HACHURES = Array.from({ length: 6 }, (_, k) => {
  const q = fitPoint(LINE.at((k + 0.55) / 6.3), TRAIL_BOX);
  return `M${(q.x - 26).toFixed(1)} ${(q.y + 20).toFixed(1)}q26 -15 52 0`;
}).join("");
/** The develop window (p): it runs while the FRAME comes into view — the
 *  frame's top enters at p ≈ .22 and it is whole on screen from p ≈ .84 —
 *  so the reader watches it develop (M2 critic 3 #4: at .15–.7 most of it
 *  played below the fold). Act III stays a 0-travel card: the pinned-card
 *  budget is spent (validator #3, SPEC D-5: ≤ 2 long cards). */
const DEVELOP = { from: 0.25, to: 0.82 };
/** The undeveloped plate is a LATENT image under the cover (never solid
 *  black): the cover's opacity where the plate has not developed yet. */
const LATENT_COVER = 0.8;
/** The low sun with no plate (the code frontier): from above the horizon
 *  (the warm point) down to it, in frame fractions. */
export const SUN = { x: 0.78, from: 0.12, to: 0.36, size: 0.075 };
/** MV-10's sun (0–1 of the plate), measured by the cards builder on the
 *  2560 px file (09-29); the plate's own `sun` mark wins when present. */
const PLATE_SUN: Partial<Record<MediaId, Pos>> = { "MV-10": [0.8125, 0.2185], "MV-10-alt": [0.8125, 0.2185] };

/** The plate's sun in FRAME fractions (2.39), or the code sun's rest. */
export function sunInFrame(plate: Plate | null): Pos {
  const s = plate ? anchor(plate, "sun", PLATE_SUN[plate.asset.id] ?? null) : null;
  if (!plate || !s) return [SUN.x, SUN.to];
  const q = inBox(coverBox(PLATE_ASPECT.sm, plate.ratio, plate.pos), s);
  return [(PLATE.x + q[0] * PLATE.w) / VB.w, (PLATE.y + q[1] * PLATE.h) / VB.h];
}


const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
export const PLATE_STYLE = {
  left: pct(PLATE.x / VB.w),
  top: pct(PLATE.y / VB.h),
  width: pct(PLATE.w / VB.w),
  height: pct(PLATE.h / VB.h),
};
export const BORDER_D = `M${PLATE.x + PLATE.r} ${PLATE.y}H${PLATE.x + PLATE.w - PLATE.r}Q${PLATE.x + PLATE.w} ${PLATE.y} ${PLATE.x + PLATE.w} ${PLATE.y + PLATE.r}V${PLATE.y + PLATE.h - PLATE.r}Q${PLATE.x + PLATE.w} ${PLATE.y + PLATE.h} ${PLATE.x + PLATE.w - PLATE.r} ${PLATE.y + PLATE.h}H${PLATE.x + PLATE.r}Q${PLATE.x} ${PLATE.y + PLATE.h} ${PLATE.x} ${PLATE.y + PLATE.h - PLATE.r}V${PLATE.y + PLATE.r}Q${PLATE.x} ${PLATE.y} ${PLATE.x + PLATE.r} ${PLATE.y}Z`;

export function TintypeFrame({ plate: id }: { plate: MediaId | null }) {
  const { p, live } = useCard();
  const ids = useId();
  const plate = plateOf(id);
  const sun = sunInFrame(plate);
  const sunFrom = Math.max(-0.08, sun[1] - 0.24);

  const trail = useTransform(p, (v) => remap(v, 0, 0.25));
  const develop = useTransform(p, (v) => remap(v, DEVELOP.from, DEVELOP.to));
  const border = useTransform(p, (v) => remap(v, 0.78, 0.97));
  // the sun sinks by transform (the wrapper is frame-sized, so % = frame)
  const sunY = useTransform(p, (v) => `${((sunFrom - sun[1]) * (1 - remap(v, 0, 0.22)) * 100).toFixed(3)}%`);
  // …and hands over to the photograph's own sun as the plate develops
  const sunOpacity = useTransform(p, (v) => (plate ? 1 - remap(v, 0.45, 0.72) : 1));
  const cover = useTransform(develop, (d) => LATENT_COVER * (1 - d * d * (3 - 2 * d)));
  // fixed: the sepia print lifts off the colour print
  const sepia = useTransform(p, (v) => 1 - remap(v, 0.45, 0.88));
  // the pencil scaffolding gives way to the photograph
  const hachures = useTransform(p, (v) => 0.6 * (1 - remap(v, 0.3, 0.55)));
  // the graphite trail recedes once the print is fixed: a faint thread on
  // the grass, not a bright swoosh across it (M2 critic 3 #6)
  const trailOpacity = useTransform(p, (v) => 1 - 0.72 * remap(v, 0.6, 0.9));

  return (
    <div aria-hidden="true" data-frame="tintype" className="absolute inset-0">
      {/* the plate: the frontier. Colour below (the settled golden hour);
          the tintype (R-2 sepia, .act-tintype) above it while developing */}
      <div className="absolute overflow-hidden rounded-[6px]" style={PLATE_STYLE}>
        {plate ? (
          <PlateBox plate={plate} aspect={PLATE_ASPECT}>
            <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="(max-width: 639px) 100vw, 92vw" />
          </PlateBox>
        ) : (
          <div className="act-tintype absolute inset-0">
            <FrontierGround id={`${ids}g`} />
          </div>
        )}
      </div>
      {plate && live ? (
        <motion.div className="act-tintype absolute overflow-hidden" style={{ ...PLATE_STYLE, opacity: sepia }}>
          <PlateBox plate={plate} aspect={PLATE_ASPECT}>
            <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="(max-width: 639px) 100vw, 92vw" />
          </PlateBox>
        </motion.div>
      ) : null}
      <div className="absolute overflow-hidden rounded-[6px]" style={PLATE_STYLE}>
        {/* not yet developed: the plate is a LATENT print under an rd-deep
            cover that clears as it develops — evenly, never a few solid blobs
            that read as dirt (M2 critic 3 #4; the procedural ink-bleed mask
            was retired). Live only. */}
        {live ? <motion.div className="absolute inset-0 bg-bg" style={{ opacity: cover }} /> : null}
        <span className="act-tintype-vignette pointer-events-none absolute inset-0 opacity-70" />
      </div>

      {/* the low sun (a pre-rendered --w-dusk sprite: world media), sinking
          onto the photograph's sun; with no plate it stays (the code sun) */}
      {live || !plate ? (
        <motion.div className="pointer-events-none absolute inset-0" style={live ? { y: sunY, opacity: sunOpacity } : undefined}>
          <span
            className="absolute block -translate-x-1/2 -translate-y-1/2"
            style={{ left: pct(sun[0]), top: pct(sun[1]), width: pct(SUN.size), aspectRatio: "1" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB inline sprite (world media), not content */}
            <img src={SUN_SPRITE} alt="" width={40} height={40} className="size-full max-w-none" />
          </span>
        </motion.div>
      ) : null}

      {/* the graphite trail over 6 hachures, and the plate's bone border */}
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        // stretched with the frame, so it registers with the %-placed plate
        // (the 2.39:1 letterbox is this viewBox's own ratio; the < 640 stack
        // is static, with non-scaling strokes)
        preserveAspectRatio="none"
        focusable="false"
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
        strokeLinecap="round"
      >
        {live ? (
          <>
            <motion.path
              d={HACHURES}
              stroke="var(--w-pencil)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              style={{ opacity: hachures }}
            />
            <motion.g style={{ opacity: trailOpacity }}>
              <DrawPath d={TRAIL} progress={trail} stroke="var(--w-pencil)" strokeWidth={1.3} />
            </motion.g>
            <DrawPath d={BORDER_D} progress={border} stroke="var(--w-bone)" strokeWidth={0.9} />
          </>
        ) : (
          <>
            <path d={TRAIL} stroke="var(--w-pencil)" strokeOpacity={0.28} strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
            <rect
              x={PLATE.x}
              y={PLATE.y}
              width={PLATE.w}
              height={PLATE.h}
              rx={PLATE.r}
              stroke="var(--w-bone)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
    </div>
  );
}

/* — The code frontier (MV-10's code alternative), in plate units. The low
     sun sprite sits at x .78 of the frame, y .36 (≈ .34 of the plate): the
     far ridge runs just under it, and the haze is brightest there. — */
const RIDGE_FAR =
  "M0 176C60 168 120 172 190 162C260 152 320 160 390 154C460 148 520 158 590 150C650 144 690 152 720 150C760 147 800 140 850 146C880 149 900 144 920 146V374H0Z";
const RIDGE_NEAR =
  "M0 214C80 204 150 210 230 198C300 188 360 196 430 190C520 182 600 196 680 186C760 176 840 190 920 182V374H0Z";
/** The grass: a low rolling foreground whose top edge is frayed by fine,
 *  irregular blades (a hashed jitter: deterministic, never Math.random, so
 *  SSR == client; never a regular zigzag). */
const GRASS = (() => {
  const n = 184;
  let d = "M0 244";
  for (let i = 1; i <= n; i++) {
    const x = (i / n) * 920;
    let h = Math.imul(i + 31, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca77);
    const j = (((h ^ (h >>> 13)) >>> 0) % 1000) / 1000; // 0–1
    const base = 244 - 14 * Math.sin((i / n) * Math.PI * 0.85) + 3 * Math.sin(i * 0.23);
    const blade = i % 2 ? -(1 + 4.5 * j * j) : 0.6 * j;
    d += `L${x.toFixed(1)} ${(base + blade).toFixed(1)}`;
  }
  return `${d}V374H0Z`;
})();

export function FrontierGround({ id }: { id: string }) {
  return (
    <svg
      viewBox={`0 0 ${PLATE.w} ${PLATE.h}`}
      preserveAspectRatio="none"
      focusable="false"
      className="act-tintype-code absolute inset-0 size-full"
    >
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1611" />
          <stop offset="0.28" stopColor="#4a3b2c" />
          <stop offset="0.42" stopColor="#9c8262" />
          <stop offset="0.47" stopColor="#c7ad86" />
          <stop offset="0.6" stopColor="#5e4a37" />
          <stop offset="1" stopColor="#1a130e" />
        </linearGradient>
        {/* the light side: haze toward the sun (x .78), never a glow */}
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d0907" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#0d0907" stopOpacity="0.15" />
          <stop offset="0.78" stopColor="#0d0907" stopOpacity="0" />
          <stop offset="1" stopColor="#0d0907" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b5842" />
          <stop offset="0.3" stopColor="#3e3226" />
        </linearGradient>
      </defs>
      <rect width={PLATE.w} height={PLATE.h} fill={`url(#${id}s)`} />
      <path d={RIDGE_FAR} fill={`url(#${id}r)`} />
      <path d={RIDGE_NEAR} fill="#2a2119" />
      <path d={GRASS} fill="#110c09" />
      <rect width={PLATE.w} height={PLATE.h} fill={`url(#${id}h)`} />
    </svg>
  );
}

