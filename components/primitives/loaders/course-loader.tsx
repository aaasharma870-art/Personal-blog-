"use client";

import { useEffect, useId, useRef } from "react";
import { animate, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { dur, loader as loaderTiming, springNeedle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { COMPASS_CHART_PIVOT_Y, JacksCompass } from "@/components/primitives/loaders/compass";
import { DrawPath, SIZE_CLASS, SIZE_PX, useOneShot, useSvgAttr } from "@/components/primitives/loaders/kit";
import { measurePath } from "@/components/primitives/loaders/line";
import { BlackPearl } from "@/components/primitives/loaders/pearl";

/**
 * LD-PC "Jack's compass" (pirates; SPEC v2 §8, loaders.BAR §3;
 * RECOGNIZABILITY S20). Navigation: Jack's compass stands OPEN — the lid
 * tilted back on its star chart, the red arrow hunting, then committing to
 * a bearing — while the Black Pearl (black, tattered sails) sails a dashed
 * brass course to a brass X. Blind, it reads as Pirates in one look: the
 * compass, the ship, the X.
 *
 *   determinate    course pathLength = progress (direct, loaders L2); the
 *                  Pearl is the course's head (its bow on the drawn end).
 *                  The arrow heads for the X on springNeedle.
 *   indeterminate  the arrow hunts ±35° around that bearing, re-excited
 *                  every loader.needleReexciteMs; the course is parked at
 *                  12 % and the Pearl rides at anchor there, rocking ±2.5°
 *                  (0.5 Hz). Frozen when `animate` drops (the 5 s idle stop).
 *   complete       the Pearl reaches the X, the arrow settles on it, then ONE
 *                  dur.flash moon tip flash (area < 0.1 % of the viewport).
 *   static         course drawn, the Pearl at the X, arrow on the bearing.
 * `mini` = the shut compass with the course as an arc under the case (no
 * ship: at 48 px it would be a smudge).
 */

/* — card / route / stage (viewBox 0 0 160 156) — */
const VB_H = 156;
const COMPASS = { x: 34, y: 0, w: 92 };
const COMPASS_H = (COMPASS.w * 132) / 100;
const PIVOT = { x: COMPASS.x + COMPASS.w / 2, y: COMPASS.y + COMPASS_H * COMPASS_CHART_PIVOT_Y };
/** The course: from the lower left, under the case, to the X. */
const COURSE = "M16 140C38 151 64 152 88 146C103 142 114 138 124 134";
const COURSE_M = measurePath(COURSE);
const X_AT = { x: 152, y: 128 };
const X_MARK = `M${X_AT.x - 5} ${X_AT.y - 5}L${X_AT.x + 5} ${X_AT.y + 5}M${X_AT.x + 5} ${X_AT.y - 5}L${X_AT.x - 5} ${X_AT.y + 5}`;
const SWELLS = "M14 153q5 -2.6 10 0M44 155q5 -2.6 10 0M98 151q5 -2.6 10 0M126 145q5 -2.6 10 0";
const BEARING = (Math.atan2(X_AT.x - PIVOT.x, -(X_AT.y - PIVOT.y)) * 180) / Math.PI;
const SHIP_SCALE = 0.95;

/* — mini (viewBox 0 0 100 100): an arc under the shut case, left → right — */
const ARC = "M14 90C34 100 66 100 86 90";
const ARC_BEARING = 90;

export default function CourseLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <Course key={props.mode} {...props} />;
}

function Course({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const bearing = mini ? ARC_BEARING : BEARING;
  const scale = SIZE_PX[size] / (mini ? 100 : 160);
  const maskId = useId();

  // needle: a target the spring chases (jumps when motion is off)
  const target = useMotionValue(bearing);
  const needle = useSpring(target, springNeedle);
  useEffect(() => {
    if (mode === "indeterminate" && running) {
      let k = 0;
      const hunt = () => {
        k += 1;
        target.set(bearing + (k % 2 ? 35 : -35) * (0.6 + (0.4 * ((k * 7) % 5)) / 4));
      };
      hunt();
      const t = window.setInterval(hunt, loaderTiming.needleReexciteMs);
      return () => window.clearInterval(t);
    }
    // determinate / complete / static / stopped: rest on the bearing. A
    // stopped hunt or motion-off FREEZES (jump): 0 animation after the stop.
    if (reduced || mode === "static" || (mode === "indeterminate" && !running)) {
      target.jump(mode === "indeterminate" ? needle.get() : bearing);
      needle.jump(target.get());
    } else {
      target.set(bearing);
    }
  }, [mode, running, reduced, bearing, target, needle]);

  const flash = useOneShot(mode === "complete", dur.flash * 1000, !reduced);
  const sw = (px: number) => px / scale;

  // the course: direct p while determinate; parked at 12 % while hunting;
  // fully drawn when complete / static (loaders.BAR §3 "course drawn")
  const parked = useMotionValue(0.12);
  const full = useMotionValue(1);
  const course = mode === "determinate" ? progress : mode === "indeterminate" ? parked : full;

  // at anchor: the Pearl rocks while the needle hunts (frozen when stopped)
  const rock = useMotionValue(0);
  useEffect(() => {
    if (mode !== "indeterminate" || !running || reduced) return;
    const c = animate(rock, [rock.get(), 2.5, 0, -2.5, 0], { duration: 2, ease: "easeInOut", repeat: Infinity });
    return () => c.stop();
  }, [mode, running, reduced, rock]);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])} data-loader-art="jacks-compass">
      <svg
        viewBox={mini ? "0 0 100 100" : `0 0 160 ${VB_H}`}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <DrawPath d={mini ? ARC : COURSE} progress={course} stroke="white" strokeWidth={sw(5)} strokeLinecap="butt" />
          </mask>
        </defs>
        {mini ? null : (
          <>
            {/* the sea: a few swells, and the course still to sail (faint) */}
            <path d={SWELLS} fill="none" stroke="var(--w-moon)" strokeWidth={sw(0.9)} strokeOpacity={0.45} strokeLinecap="round" />
            <path
              d={COURSE}
              fill="none"
              stroke="var(--w-brass)"
              strokeOpacity={0.28}
              strokeWidth={sw(1.25)}
              strokeDasharray={`${sw(4)} ${sw(5)}`}
            />
            {/* X marks the spot (brass, never ember) */}
            <path d={X_MARK} fill="none" stroke="var(--w-brass)" strokeWidth={sw(2)} strokeLinecap="round" />
          </>
        )}
        {/* the dashed brass course, revealed by the drawn mask (direct p) */}
        <path
          d={mini ? ARC : COURSE}
          fill="none"
          stroke="var(--w-brass)"
          strokeWidth={sw(1.75)}
          strokeDasharray={`${sw(6)} ${sw(5)}`}
          mask={`url(#${maskId})`}
        />
        {mini ? (
          <JacksCompass heading={needle} flash={flash} x={18} y={10} width={64} height={68} />
        ) : (
          <>
            <JacksCompass
              heading={needle}
              flash={flash}
              lid="chart"
              x={COMPASS.x}
              y={COMPASS.y}
              width={COMPASS.w}
              height={COMPASS_H}
            />
            <Ship at={course} rock={rock} sw={sw} />
          </>
        )}
      </svg>
    </span>
  );
}

/** The Pearl at the course's drawn end, heeling along its tangent. */
function Ship({ at, rock, sw }: { at: MotionValue<number>; rock: MotionValue<number>; sw: (px: number) => number }) {
  const ref = useRef<SVGGElement>(null);
  const place = useTransform([at, rock], ([v, r]) => {
    const f = Math.min(1, Math.max(0, v as number));
    const q = COURSE_M.at(f);
    const a = COURSE_M.angleAt(f) * 0.55 + (r as number);
    return `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)}) rotate(${a.toFixed(2)}) scale(${SHIP_SCALE})`;
  });
  const t = useSvgAttr(ref, place, "transform", (s) => s);
  return (
    <g ref={ref} transform={t}>
      <BlackPearl sw={(px) => sw(px) / SHIP_SCALE} />
    </g>
  );
}
