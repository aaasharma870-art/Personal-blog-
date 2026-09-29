"use client";

import { useId, useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, useSvgAttr } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, fitPath, fitPoint, remap, type Box } from "@/components/primitives/loaders/line";
import { useDevelopNoise } from "@/components/primitives/loaders/noise";
import { SUN_SPRITE } from "@/components/primitives/loaders/sprites-rd";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * Card II→III "The tintype" (SM-14, kind `tintype`, reel-class, 0 travel;
 * rdr2-act.BAR §A). RDR2's own signature is a loading screen, so its card
 * is one — "develop, don't load" (RD-P4). Driven by the card's passage p
 * (no pin); scrolling back reverses it exactly.
 *   0–.3   the Intermission's warm point sinks and becomes a low sun (a
 *          --w-dusk sprite: media, never DOM glow); the Line is re-traced
 *          as a graphite trail across 6 hachure arcs, pathLength =
 *          remap(p, 0, .3).
 *   .3–.8  the frame darkens into a tintype plate (R-2: 6 px radius,
 *          grayscale + .45 sepia, an inset darkening vignette) that DEVELOPS
 *          into the frontier: our own procedural ink-bleed mask whose
 *          threshold = remap(p, .3, .8) (never Lee Martin's sprite sheet).
 *   .8–1   the --w-bone plate border draws.
 * The progress element IS the pencil trail: no "loading", no %, no status.
 * Static card (RM, Pause, no JS, < 640, SSR): the developed plate, the
 * trail drawn, the sun low, the border drawn. aria-hidden art.
 */

const VB = { w: 1000, h: 418 };
/** Plate inset inside the frame (viewBox units) and its corner radius. */
const PLATE = { x: 40, y: 22, w: 920, h: 374, r: 6 };
/** The graphite trail across the plate's lower third (the Line, re-traced). */
const TRAIL_BOX: Box = { x: 90, y: 250, w: 820, h: 120 };
const TRAIL = fitPath(LINE_D, TRAIL_BOX);
const HACHURES = Array.from({ length: 6 }, (_, k) => {
  const q = fitPoint(LINE.at((k + 0.55) / 6.3), TRAIL_BOX);
  return `M${(q.x - 26).toFixed(1)} ${(q.y + 20).toFixed(1)}q26 -15 52 0`;
}).join("");
/** The low sun: from above the horizon (the warm point) down to it. */
const SUN = { x: 0.78, from: 0.12, to: 0.36, size: 0.075 };

/** feColorMatrix mapping grey noise to "NOT yet developed" (white) for a
 *  developed fraction ≈ q (the inverse of noise.ts thresholdMatrix). */
function undevelopedMatrix(q: number): string {
  const c = (7 - 7 * Math.min(1, Math.max(0, q))).toFixed(3);
  return `-6 0 0 0 ${c} 0 -6 0 0 ${c} 0 0 -6 0 ${c} 0 0 0 1 0`;
}

export function TintypeFrame({ plate }: { plate: MediaId }) {
  const { p, live } = useCard();
  const ids = useId();
  const noise = useDevelopNoise(64, 26);

  const trail = useTransform(p, (v) => remap(v, 0, 0.3));
  const develop = useTransform(p, (v) => remap(v, 0.3, 0.8));
  const border = useTransform(p, (v) => remap(v, 0.8, 1));
  // the sun sinks by transform (the wrapper is frame-sized, so % = frame)
  const sunY = useTransform(p, (v) => `${((SUN.from - SUN.to) * (1 - remap(v, 0, 0.3)) * 100).toFixed(3)}%`);
  const coverOpacity = useTransform(develop, (d) => (d >= 1 ? 0 : 1));

  const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
  const plateBox = {
    left: pct(PLATE.x / VB.w),
    top: pct(PLATE.y / VB.h),
    width: pct(PLATE.w / VB.w),
    height: pct(PLATE.h / VB.h),
  };

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* the plate: the frontier, as a tintype (R-2) */}
      <div className="act-tintype absolute overflow-hidden" style={plateBox}>
        <MediaFrame media={plate} layout="fill" playOn="never" sizes="(max-width: 639px) 100vw, 92vw" />
        {/* not yet developed: an rd-deep cover with holes where the plate has
            developed (our procedural ink-bleed mask; live only) */}
        {live && noise ? (
          <motion.svg
            viewBox={`0 0 ${PLATE.w} ${PLATE.h}`}
            preserveAspectRatio="none"
            focusable="false"
            className="absolute inset-0 size-full"
            style={{ opacity: coverOpacity }}
          >
            <defs>
              <filter id={`${ids}f`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
                <Matrix q={develop} />
              </filter>
              <mask id={`${ids}m`} maskUnits="userSpaceOnUse" x="0" y="0" width={PLATE.w} height={PLATE.h}>
                <image
                  href={noise}
                  x="0"
                  y="0"
                  width={PLATE.w}
                  height={PLATE.h}
                  preserveAspectRatio="none"
                  filter={`url(#${ids}f)`}
                />
              </mask>
            </defs>
            <rect width={PLATE.w} height={PLATE.h} fill="var(--bg)" mask={`url(#${ids}m)`} />
          </motion.svg>
        ) : null}
        <span className="act-tintype-vignette pointer-events-none absolute inset-0" />
      </div>

      {/* the low sun (a pre-rendered --w-dusk sprite: world media) */}
      <motion.div className="pointer-events-none absolute inset-0" style={live ? { y: sunY } : undefined}>
        <span
          className="absolute block -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(SUN.x), top: pct(SUN.to), width: pct(SUN.size), aspectRatio: "1" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB inline sprite (world media), not content */}
          <img src={SUN_SPRITE} alt="" width={40} height={40} className="size-full max-w-none" />
        </span>
      </motion.div>

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
        <path d={HACHURES} stroke="var(--w-pencil)" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.6} />
        {live ? (
          <>
            <DrawPath d={TRAIL} progress={trail} stroke="var(--w-pencil)" strokeWidth={1.3} />
            <DrawPath
              d={`M${PLATE.x + PLATE.r} ${PLATE.y}H${PLATE.x + PLATE.w - PLATE.r}Q${PLATE.x + PLATE.w} ${PLATE.y} ${PLATE.x + PLATE.w} ${PLATE.y + PLATE.r}V${PLATE.y + PLATE.h - PLATE.r}Q${PLATE.x + PLATE.w} ${PLATE.y + PLATE.h} ${PLATE.x + PLATE.w - PLATE.r} ${PLATE.y + PLATE.h}H${PLATE.x + PLATE.r}Q${PLATE.x} ${PLATE.y + PLATE.h} ${PLATE.x} ${PLATE.y + PLATE.h - PLATE.r}V${PLATE.y + PLATE.r}Q${PLATE.x} ${PLATE.y} ${PLATE.x + PLATE.r} ${PLATE.y}Z`}
              progress={border}
              stroke="var(--w-bone)"
              strokeWidth={0.9}
            />
          </>
        ) : (
          <>
            <path d={TRAIL} stroke="var(--w-pencil)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
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

/** The develop threshold, written to the filter per frame (no re-render). */
function Matrix({ q }: { q: MotionValue<number> }) {
  const ref = useRef<SVGFEColorMatrixElement>(null);
  const initial = useSvgAttr(ref, q, "values", undevelopedMatrix);
  return <feColorMatrix ref={ref} type="matrix" values={initial} />;
}
