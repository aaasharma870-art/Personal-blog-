"use client";

import { useEffect, useId, useRef } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useSvgAttr, useTicker } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, fitPath, fitPoint, type Box } from "@/components/primitives/loaders/line";
import { thresholdMatrix, useDevelopNoise } from "@/components/primitives/loaders/noise";
import { FIRE0_SPRITE, FIRE1_SPRITE, FIRE2_SPRITE } from "@/components/primitives/loaders/sprites-rd";

/**
 * LD-RD "Plate & trail" (rdr2; SPEC v2 §8, STUDY §7.1 / R-2 / R-6). RDR2
 * reflects: a tintype plate DEVELOPS while a graphite trail runs to a
 * campfire — the image developing IS the progress (RD-P4, loaders L18).
 *
 *   determinate    trail pathLength = p AND the develop threshold = p
 *                  (direct); the plate never "completes" before p = 1.
 *   indeterminate  the plate breathes 10 % ↔ 22 % developed at 0.4 Hz, the
 *                  trail parked at 12 %, the pencil tip ticking every 0.6 s;
 *                  frozen when the shell's idle stop drops `animate`.
 *   complete       fully developed; the bone border draws (0.5 s); the
 *                  campfire kindles (3 sprite frames, no flash).
 *   static         developed plate, trail drawn, fire lit.
 * `mini` = the trail and the fire only. Luminous points are pre-rendered
 * sprites (L6); no person, rider or logo anywhere (L21).
 */

const PLATE: Box = { x: 6, y: 6, w: 148, h: 88 };
const TRAIL_BOX: Box = { x: 12, y: 50, w: 136, h: 42 };
const MINI_BOX: Box = { x: 2, y: 4, w: 88, h: 34 };
const trailD = (b: Box) => fitPath(LINE_D, b);
const TRAIL = trailD(TRAIL_BOX);
const TRAIL_MINI = trailD(MINI_BOX);
const END = fitPoint(LINE.at(1), TRAIL_BOX);
const END_MINI = fitPoint(LINE.at(1), MINI_BOX);
/** 6 hachure arcs along the trail (R-1 look: short strokes under the line). */
const HACHURES = Array.from({ length: 6 }, (_, k) => {
  const p = fitPoint(LINE.at((k + 0.6) / 6.6), TRAIL_BOX);
  return `M${(p.x - 5).toFixed(1)} ${(p.y + 5).toFixed(1)}q5 -3.4 10 0`;
}).join("");
/** The plate's code landscape: two ridges and a horizon (graphite hatch). */
const RIDGE_FAR = "M6 52C26 44 40 47 58 41C74 36 88 43 104 38C122 33 138 40 154 36V94H6Z";
const RIDGE_NEAR = "M6 66C30 60 52 66 74 60C96 55 120 63 154 57V94H6Z";
const BORDER = `M${PLATE.x + 6} ${PLATE.y}H${PLATE.x + PLATE.w - 6}Q${PLATE.x + PLATE.w} ${PLATE.y} ${PLATE.x + PLATE.w} ${PLATE.y + 6}V${PLATE.y + PLATE.h - 6}Q${PLATE.x + PLATE.w} ${PLATE.y + PLATE.h} ${PLATE.x + PLATE.w - 6} ${PLATE.y + PLATE.h}H${PLATE.x + 6}Q${PLATE.x} ${PLATE.y + PLATE.h} ${PLATE.x} ${PLATE.y + PLATE.h - 6}V${PLATE.y + 6}Q${PLATE.x} ${PLATE.y} ${PLATE.x + 6} ${PLATE.y}Z`;
const FIRES = [FIRE0_SPRITE, FIRE1_SPRITE, FIRE2_SPRITE];

/** The campfire point: 3 frames cycling ≤ 2 Hz (opacity .85 ↔ 1) while
 *  `flicker`; a still frame otherwise. `lit` 0–1 kindles it. */
export function Campfire({
  x,
  y,
  w,
  flicker,
  lit,
}: {
  x: number;
  y: number;
  w: number;
  flicker: boolean;
  lit: MotionValue<number> | number;
}) {
  const tick = useTicker(flicker, 500);
  const frame = flicker ? tick % 3 : 0;
  const h = w * 1.5;
  return (
    <motion.g style={{ opacity: lit }}>
      {FIRES.map((src, k) => (
        <image
          key={k}
          href={src}
          x={x - w / 2}
          y={y - h * 0.86}
          width={w}
          height={h}
          opacity={k === frame ? (flicker && tick % 2 ? 0.85 : 1) : 0}
          preserveAspectRatio="none"
        />
      ))}
    </motion.g>
  );
}

export default function PlateTrailLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <PlateTrail key={props.mode} {...props} />;
}

function PlateTrail({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const scale = SIZE_PX[size] / (mini ? 92 : 160);
  const sw = (px: number) => px / scale;
  const ids = useId();
  const maskId = `${ids}m`;
  const filterId = `${ids}f`;
  const hatchId = `${ids}h`;
  const noise = useDevelopNoise(64, 38);

  // develop threshold q and trail length t, per mode
  const breathe = useMotionValue(0.1);
  useEffect(() => {
    if (mode !== "indeterminate" || !running) return;
    const c = animate(breathe, [breathe.get(), 0.22, 0.1], {
      duration: 2.5, // 0.4 Hz
      ease: "easeInOut",
      repeat: Infinity,
    });
    return () => c.stop();
  }, [mode, running, breathe]);
  const one = useMotionValue(1);
  const parked = useMotionValue(0.12);
  const develop = mode === "determinate" ? progress : mode === "indeterminate" ? breathe : one;
  const trail = mode === "determinate" ? progress : mode === "indeterminate" ? parked : one;

  // complete: the border draws and the fire kindles over 0.5 s (motion on)
  const finish = useMotionValue(mode === "static" ? 1 : 0);
  useEffect(() => {
    if (mode === "static" || (mode === "complete" && reduced)) {
      finish.jump(1);
      return;
    }
    if (mode !== "complete") {
      finish.jump(0);
      return;
    }
    const c = animate(finish, 1, { duration: 0.5, ease: "easeOut" });
    return () => c.stop();
  }, [mode, reduced, finish]);

  // the fire burns (lit) once the trail has arrived, or whenever finished
  const fireLit = useTransform([trail, finish], ([t, f]) => Math.max((t as number) >= 0.999 ? 1 : 0, f as number));
  const tick = useTicker(mode === "indeterminate" && running, 600);

  if (mini) {
    return (
      <span className={cn("relative block", SIZE_CLASS[size])}>
        <svg viewBox="0 0 92 42" aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
          <DrawPath d={TRAIL_MINI} progress={trail} stroke="var(--w-pencil)" strokeWidth={sw(1.4)} strokeLinecap="round" />
          <Campfire x={END_MINI.x} y={END_MINI.y} w={10} flicker={false} lit={fireLit} />
        </svg>
      </span>
    );
  }

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg viewBox="0 0 160 100" aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
        <defs>
          <pattern id={hatchId} width={3} height={3} patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <path d="M0 0V3" stroke="var(--w-pencil)" strokeWidth={0.6} opacity={0.55} />
          </pattern>
          <clipPath id={`${ids}c`}>
            <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} rx={6} />
          </clipPath>
          {noise && mode !== "complete" && mode !== "static" ? (
            <>
              <filter id={filterId} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
                <DevelopMatrix q={develop} />
              </filter>
              <mask id={maskId} maskUnits="userSpaceOnUse" x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h}>
                <image
                  href={noise}
                  x={PLATE.x}
                  y={PLATE.y}
                  width={PLATE.w}
                  height={PLATE.h}
                  preserveAspectRatio="none"
                  filter={`url(#${filterId})`}
                />
              </mask>
            </>
          ) : null}
        </defs>
        {/* the plate: dark ground, bone hairline at 35 % */}
        <rect
          x={PLATE.x}
          y={PLATE.y}
          width={PLATE.w}
          height={PLATE.h}
          rx={6}
          fill="var(--bg)"
          stroke="var(--w-bone)"
          strokeOpacity={0.35}
          strokeWidth={sw(1)}
        />
        <g clipPath={`url(#${ids}c)`}>
          {/* the developed image (masked by the develop threshold) */}
          <g mask={noise && mode !== "complete" && mode !== "static" ? `url(#${maskId})` : undefined}>
            <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} fill="var(--w-bone)" opacity={0.1} />
            <path d={RIDGE_FAR} fill={`url(#${hatchId})`} />
            <path d={RIDGE_FAR} fill="none" stroke="var(--w-pencil)" strokeWidth={sw(1)} opacity={0.8} />
            <path d={RIDGE_NEAR} fill="var(--bg)" opacity={0.55} />
            <path d={RIDGE_NEAR} fill={`url(#${hatchId})`} />
          </g>
          {/* the inset vignette (a darkening frame; never glow paint) */}
          <rect
            x={PLATE.x}
            y={PLATE.y}
            width={PLATE.w}
            height={PLATE.h}
            rx={6}
            fill="none"
            stroke="var(--bg)"
            strokeWidth={14}
            opacity={0.55}
          />
          <path d={HACHURES} fill="none" stroke="var(--w-pencil)" strokeWidth={sw(0.6)} opacity={0.55} />
          <DrawPath d={TRAIL} progress={trail} stroke="var(--w-pencil)" strokeWidth={sw(1.4)} strokeLinecap="round" />
          <PencilTip progress={trail} visible={mode === "indeterminate" ? tick % 2 === 0 : mode === "determinate"} />
          <Campfire x={END.x} y={END.y} w={9} flicker={false} lit={fireLit} />
        </g>
        {/* the bone border draws at completion */}
        <DrawPath d={BORDER} progress={finish} stroke="var(--w-bone)" strokeWidth={sw(1)} />
      </svg>
    </span>
  );
}

/** The develop threshold, written to the filter per frame (no re-render). */
function DevelopMatrix({ q }: { q: MotionValue<number> }) {
  const ref = useRef<SVGFEColorMatrixElement>(null);
  const initial = useSvgAttr(ref, q, "values", thresholdMatrix);
  return <feColorMatrix ref={ref} type="matrix" values={initial} />;
}

/** The pencil-tip dot at the trail's drawn end. */
function PencilTip({ progress, visible }: { progress: MotionValue<number>; visible: boolean }) {
  const ref = useRef<SVGCircleElement>(null);
  const at = (v: number) => fitPoint(LINE.at(v), TRAIL_BOX);
  const cx = useSvgAttr(ref, progress, "cx", (v) => at(v).x.toFixed(2));
  const cy = useSvgAttr(ref, progress, "cy", (v) => at(v).y.toFixed(2));
  return <circle ref={ref} cx={cx} cy={cy} r={1.3} fill="var(--w-pencil)" opacity={visible ? 1 : 0} />;
}
