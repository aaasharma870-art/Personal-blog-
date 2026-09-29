"use client";

import { useEffect, useId } from "react";
import { useSpring, useMotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { dur, loader as loaderTiming, springNeedle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { JacksCompass } from "@/components/primitives/loaders/compass";
import { DrawPath, SIZE_CLASS, SIZE_PX, useOneShot } from "@/components/primitives/loaders/kit";

/**
 * LD-PC "Jack's compass" (pirates; SPEC v2 §8, loaders.BAR §3). Navigation:
 * a needle hunts, then commits to a bearing, while a dashed brass course
 * plots toward a waypoint.
 *
 *   determinate    course pathLength = progress (direct). The needle heads
 *                  for the course's bearing on springNeedle.
 *   indeterminate  the needle hunts ±35° around that bearing, re-excited
 *                  every loader.needleReexciteMs; frozen when `animate`
 *                  drops (the shell's 5 s idle stop).
 *   complete       settles on the bearing, then ONE dur.flash moon tip flash.
 *   static         course drawn, needle on the bearing, no flash.
 * The course is parked at 12 % while the needle hunts (indeterminate).
 * `mini` = the compass with the course as an arc under the case.
 */

/** Course (card/route layout, viewBox 0 0 160 100): from the case rim to a
 *  waypoint up-right. Its bearing from the pivot is the needle's heading. */
const COURSE = "M97 60C114 64 131 55 150 30";
const WAYPOINT = { x: 150, y: 30 };
const PIVOT = { x: 48, y: 52 };
const BEARING = (Math.atan2(WAYPOINT.x - PIVOT.x, -(WAYPOINT.y - PIVOT.y)) * 180) / Math.PI;
/** Mini layout (viewBox 0 0 100 100): an arc under the case, left → right. */
const ARC = "M14 90C34 100 66 100 86 90";
const ARC_BEARING = 90;

export default function CourseLoader({ mode, size, progress, animate }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const bearing = mini ? ARC_BEARING : BEARING;
  const scale = SIZE_PX[size] / (mini ? 100 : 160);
  const maskId = useId();

  // needle: a target the spring chases (jumps when motion is off)
  const target = useMotionValue(bearing);
  const needle = useSpring(target, springNeedle);
  useEffect(() => {
    if (mode === "indeterminate" && animate) {
      let k = 0;
      const hunt = () => {
        k += 1;
        target.set(bearing + (k % 2 ? 35 : -35) * (0.6 + 0.4 * ((k * 7) % 5) / 4));
      };
      hunt();
      const t = window.setInterval(hunt, loaderTiming.needleReexciteMs);
      return () => window.clearInterval(t);
    }
    // determinate / complete / static / stopped: rest on the bearing. A
    // stopped hunt or motion-off FREEZES (jump): 0 animation after the stop.
    if (reduced || mode === "static" || (mode === "indeterminate" && !animate)) {
      target.jump(mode === "indeterminate" ? needle.get() : bearing);
      needle.jump(target.get());
    } else {
      target.set(bearing);
    }
  }, [mode, animate, reduced, bearing, target, needle]);

  const flash = useOneShot(mode === "complete", dur.flash * 1000, !reduced);
  const sw = (px: number) => px / scale;

  // the course: direct p while determinate; parked at 12 % while hunting;
  // fully drawn when complete / static (loaders.BAR §3 "course drawn")
  const parked = useMotionValue(0.12);
  const full = useMotionValue(1);
  const courseSource = mode === "determinate" ? "p" : mode === "indeterminate" ? "parked" : "full";
  const course = courseSource === "p" ? progress : courseSource === "parked" ? parked : full;

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg
        viewBox={mini ? "0 0 100 100" : "0 0 160 100"}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <DrawPath
              // useTransform binds one source: remount when the source changes
              key={courseSource}
              d={mini ? ARC : COURSE}
              progress={course}
              stroke="white"
              strokeWidth={sw(4)}
              strokeLinecap="butt"
            />
          </mask>
        </defs>
        {/* the dashed brass course, revealed by the drawn mask (direct p) */}
        <path
          d={mini ? ARC : COURSE}
          fill="none"
          stroke="var(--w-brass)"
          strokeWidth={sw(1.5)}
          strokeDasharray={`${sw(6)} ${sw(6)}`}
          mask={`url(#${maskId})`}
        />
        {mini ? null : (
          <circle
            cx={WAYPOINT.x}
            cy={WAYPOINT.y}
            r={3}
            fill="none"
            stroke="var(--w-brass)"
            strokeWidth={sw(1.25)}
          />
        )}
        <JacksCompass
          heading={needle}
          flash={flash}
          x={mini ? 18 : PIVOT.x - 38}
          y={mini ? 10 : PIVOT.y - 40}
          width={mini ? 64 : 76}
          height={mini ? 68 : 80.6}
        />
      </svg>
    </span>
  );
}
