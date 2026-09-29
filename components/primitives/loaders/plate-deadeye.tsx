"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { dur } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useOneShot } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, fitPath, fitPoint, type Box } from "@/components/primitives/loaders/line";

/**
 * LD-RD ALT "Dead Eye" (rdr2; M2 RECOGNIZABILITY S20; caption
 * cap.loader.rdr2.alt "DEAD EYE"). RDR2's most recognisable screen grammar,
 * told honestly: time slows, the frontier goes red-sepia, and the marks go
 * down FIRST — mark first, fire once (RD-P2). A lone oak, a split-rail
 * fence, a homestead and two frozen birds stand in silhouette against a red
 * sky; the trail (the site's Line, in bone) crosses the dark near hill, and
 * an ember X locks onto it at each quarter of the real progress.
 *
 *   determinate    trail pathLength = progress (direct, L2/L18); X k locks
 *                  (two 1.5 px strokes, 90 ms each, 160 ms apart) the moment
 *                  progress passes k/4 — never before (L18: the plate never
 *                  "completes" early).
 *   indeterminate  no marks; the trail parked at 12 %; the grade breathes
 *                  (0.8 ↔ 1, 0.4 Hz) — time slowed, nothing marked yet.
 *                  Frozen when the shell's idle stop drops `animate`.
 *   complete       all four marked, then FIRE ONCE: the X's flash bone for
 *                  dur.flash (120 ms, four small marks: far under the WCAG
 *                  2.3.1 area) and settle at 60 %; the grade eases back.
 *   static         the settled composition (marks at 60 %, grade eased).
 * NEVER a reticle, a crosshair, a gun, a rider or a person (L21, SM-17);
 * the marks sit on the trail, not on anything alive. The red is a MEDIA
 * grade inside the plate (--w-deadeye, as the Card II→III alt); the X's are
 * ember (= marked, the site's KILLED ink) and never touch it. 0 text (L7);
 * tokens only (L17). `mini` = the plate, the trail and the marks.
 */

const PLATE: Box = { x: 6, y: 6, w: 148, h: 88 };
const TRAIL_BOX: Box = { x: 14, y: 60, w: 132, h: 28 };
const TRAIL = fitPath(LINE_D, TRAIL_BOX);
const MARKS = [1, 2, 3, 4].map((k) => {
  const q = fitPoint(LINE.at(k / 4 - (k === 4 ? 0.02 : 0)), TRAIL_BOX);
  return { at: k / 4, x: q.x, y: q.y };
});
const FAR = "M6 50C22 43 38 46 54 40C68 35 84 42 100 37C118 32 136 39 154 35V94H6Z";
const NEAR = "M6 66C30 60 52 65 74 61C96 57 122 63 154 58V94H6Z";
const OAK_CANOPY =
  "M20 50C18 44 23 39 28 40C29 35 36 34 39 38C44 36 48 41 46 45C50 48 47 53 42 52C39 55 33 55 30 52C25 55 20 54 20 50Z";
const OAK_TRUNK = "M31.4 64L31.9 51.5H33.9L34.6 64Z";
const HOUSE = "M107 60V51.5L114 45.5L121 51.5V60ZM117.5 48.4V44.6H119.4V50.1";
const FENCE = "M58 62.5V56.2M67 62V55.8M76 61.6V55.4M85 61.2V55M56.5 57.6L86.5 56.6M56.5 60.2L86.5 59.2";
const BIRDS = "M66 22l3 -2.2l3 2.2M79 16.5l2.4 -1.7l2.4 1.7";
const PLATE_PATH = `M${PLATE.x + 6} ${PLATE.y}H${PLATE.x + PLATE.w - 6}Q${PLATE.x + PLATE.w} ${PLATE.y} ${PLATE.x + PLATE.w} ${PLATE.y + 6}V${PLATE.y + PLATE.h - 6}Q${PLATE.x + PLATE.w} ${PLATE.y + PLATE.h} ${PLATE.x + PLATE.w - 6} ${PLATE.y + PLATE.h}H${PLATE.x + 6}Q${PLATE.x} ${PLATE.y + PLATE.h} ${PLATE.x} ${PLATE.y + PLATE.h - 6}V${PLATE.y + 6}Q${PLATE.x} ${PLATE.y} ${PLATE.x + 6} ${PLATE.y}Z`;

export default function PlateDeadEyeLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <DeadEye key={props.mode} {...props} />;
}

function DeadEye({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const scale = SIZE_PX[size] / 160;
  const sw = (px: number) => px / scale;
  const ids = useId();
  const skyId = `${ids}s`;
  const edgeId = `${ids}e`;
  const clipId = `${ids}c`;

  const zero = useMotionValue(0);
  const parked = useMotionValue(0.12);
  const one = useMotionValue(1);
  const trail = mode === "determinate" ? progress : mode === "indeterminate" ? parked : one;
  const marksAt = mode === "determinate" ? progress : mode === "indeterminate" ? zero : one;

  // the grade: breathes while waiting; eases back once fired
  const grade = useMotionValue(mode === "static" ? 0.78 : 1);
  useEffect(() => {
    if (mode === "indeterminate" && running && !reduced) {
      const c = animate(grade, [grade.get(), 0.8, 1], { duration: 2.5, ease: "easeInOut", repeat: Infinity });
      return () => c.stop();
    }
    if (mode === "static" || (mode === "complete" && reduced)) {
      grade.jump(0.78);
      return;
    }
    if (mode === "complete") {
      const c = animate(grade, 0.78, { duration: 0.3, delay: 0.5, ease: "easeOut" });
      return () => c.stop();
    }
  }, [mode, running, reduced, grade]);

  // fire once: 120 ms after the last mark has locked (motion on only)
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (mode !== "complete") return;
    const t = window.setTimeout(() => setArmed(true), reduced ? 0 : 420);
    return () => window.clearTimeout(t);
  }, [mode, reduced]);
  const fired = useOneShot(mode === "complete" && armed, dur.flash * 1000, !reduced);
  const settled = mode === "static" || (mode === "complete" && armed);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])} data-loader-art="dead-eye">
      <svg viewBox="0 0 160 100" aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
        <defs>
          <clipPath id={clipId}>
            <path d={PLATE_PATH} />
          </clipPath>
          {/* the Dead Eye sky: red-sepia, deepest at the horizon (MEDIA grade) */}
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--w-deadeye)" stopOpacity={0.3} />
            <stop offset="0.55" stopColor="var(--w-deadeye)" stopOpacity={0.78} />
            <stop offset="1" stopColor="var(--w-deadeye)" stopOpacity={0.5} />
          </linearGradient>
          {/* the edge vignette (darkening, never glow) */}
          <linearGradient id={edgeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--rd-deep)" stopOpacity={0.75} />
            <stop offset="0.2" stopColor="var(--rd-deep)" stopOpacity={0} />
            <stop offset="0.8" stopColor="var(--rd-deep)" stopOpacity={0} />
            <stop offset="1" stopColor="var(--rd-deep)" stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} fill="var(--rd-deadeye-bg)" />
          <motion.rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={62} fill={`url(#${skyId})`} style={{ opacity: grade }} />
          {mini ? null : (
            <g fill="var(--rd-deep)">
              <path d={FAR} opacity={0.62} />
              <path d={BIRDS} fill="none" stroke="var(--rd-deep)" strokeWidth={sw(1.1)} strokeLinecap="round" />
              <path d={OAK_TRUNK} />
              <path d={OAK_CANOPY} />
              <path d={HOUSE} />
              <path d={FENCE} fill="none" stroke="var(--rd-deep)" strokeWidth={sw(1.3)} strokeLinecap="round" />
            </g>
          )}
          <path d={NEAR} fill="var(--rd-deep)" opacity={mini ? 0.9 : 0.94} />
          <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} fill={`url(#${edgeId})`} />
          {/* the trail across the near hill (the Line in bone), = progress */}
          <DrawPath d={TRAIL} progress={trail} stroke="var(--w-bone)" strokeOpacity={0.85} strokeWidth={sw(mini ? 1.6 : 1.3)} strokeLinecap="round" />
          {MARKS.map((m, i) => (
            <Mark key={i} x={m.x} y={m.y} at={m.at} source={marksAt} reduced={reduced} sw={sw} fired={fired} settled={settled} r={mini ? 6 : 4.2} />
          ))}
        </g>
        <path d={PLATE_PATH} fill="none" stroke="var(--w-bone)" strokeOpacity={0.35} strokeWidth={sw(1)} />
      </svg>
    </span>
  );
}

/** One ember X: it locks (two strokes, 90 ms each, 160 ms apart) when the
 *  source passes `at`; bone for the one fire flash; 60 % once settled. */
function Mark({
  x,
  y,
  at,
  source,
  reduced,
  sw,
  fired,
  settled,
  r,
}: {
  x: number;
  y: number;
  at: number;
  source: MotionValue<number>;
  reduced: boolean;
  sw: (px: number) => number;
  fired: boolean;
  settled: boolean;
  r: number;
}) {
  const [locked, setLocked] = useState(() => source.get() >= at - 1e-6);
  useMotionValueEvent(source, "change", (v) => {
    const next = v >= at - 1e-6;
    if (next !== locked) setLocked(next);
  });
  const a = useMotionValue(locked ? 1 : 0);
  const b = useMotionValue(locked ? 1 : 0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!locked || reduced) {
      a.jump(locked ? 1 : 0);
      b.jump(locked ? 1 : 0);
      return;
    }
    const c1 = animate(a, 1, { duration: 0.09, ease: "linear" });
    const c2 = animate(b, 1, { duration: 0.09, delay: 0.16, ease: "linear" });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [locked, reduced, a, b]);
  const opacity = useTransform(a, (v) => (v > 0 ? 1 : 0));
  const stroke = fired ? "var(--w-bone)" : "var(--color-ember)";
  return (
    <motion.g style={{ opacity }} data-deadeye-mark={locked ? "" : undefined}>
      <g opacity={settled && !fired ? 0.6 : 1}>
        <DrawPath d={`M${x - r} ${y - r}L${x + r} ${y + r}`} progress={a} stroke={stroke} strokeWidth={sw(1.5)} strokeLinecap="round" />
        <DrawPath d={`M${x + r} ${y - r}L${x - r} ${y + r}`} progress={b} stroke={stroke} strokeWidth={sw(1.5)} strokeLinecap="round" />
      </g>
    </motion.g>
  );
}
