"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { springNeedle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { nearestTurn } from "@/components/worlds/pirates/voyage-chart";

/* ============================================================================
   JACK'S COMPASS — the Act I instrument (ICONS IC-PC-02/03, SPEC v2 SM-4,
   RECOGNIZABILITY S05/S06: "Jack's compass with its lid open").

   Our own construction from public-domain compass conventions, never traced
   from a prop photo or still (H2):
     - the case: a REGULAR octagon (flat top, vertices at 22.5° + k·45°),
       brass 1.5 px, an inner octagon, the dial ring;
     - a 32-point tick ring (every 11.25°; 4 long cardinals, 4 medium
       intercardinals), an 8-point star, a fleur-de-lis north;
     - THE RED ARROW in --pir-compass-red (a darker red than ember, so it
       never reads as "killed"; only ever on pirates canvas / deep) with a
       brass tail, pivoting at the case centre (the SVG origin);
     - THE LID, hinged on the case's top flat, swung back: its inner face is
       a dot STAR CHART (our own scatter + one constellation line). The lid
       is drawn foreshortened (scaleY about the hinge): "shut" = folded flat
       behind the case (a sliver), "ajar" = the rest state on the Journey
       chart, "open" = the star chart shown (hover / focus, About).
   STATE-driven, never scroll-mapped: give it a `heading` (a real bearing on
   the chart it sits on) and the arrow hunts, then settles (springNeedle,
   underdamped: ~13 % overshoot), taking the nearest turn. `huntOnEnter`:
   the first time it scrolls into view it spins a full turn and settles —
   the compass finding its bearing (pre-set offscreen, never in front of the
   reader). Reduced motion / Pause: it simply points, the lid simply is.
   Transforms are written to the DOM by motion values (no render per frame);
   the SSR markup is the final state. aria-hidden: the facts it points at
   live in the DOM as text.

   Size: pass a width class (`w-[72px]`); the height follows the viewBox
   (100 × 144). The CASE centre sits at CASE_CENTER of the box, so centre it
   on a point with `translate(-50%, -CASE_CENTER_PCT)`.
   ========================================================================== */

export type CompassLid = "open" | "ajar" | "shut";

/** The lid's foreshortening (scaleY about the hinge) per state. */
const LID_SCALE: Record<CompassLid, number> = { open: 0.5, ajar: 0.24, shut: 0.07 };

/** viewBox: x −50…50, y −92…52 (the lid rises above the case). */
const VB = { x: -50, y: -92, w: 100, h: 144 } as const;
/** The case centre as a fraction of the box height (from the top). */
export const CASE_CENTER = -VB.y / VB.h; // 0.639
export const CASE_CENTER_PCT = `${(CASE_CENTER * 100).toFixed(2)}%`;

const R = (deg: number) => (deg * Math.PI) / 180;
const f = (n: number) => n.toFixed(2);
const at = (cx: number, cy: number, r: number, deg: number) =>
  [cx + r * Math.sin(R(deg)), cy - r * Math.cos(R(deg))] as const;

/** A regular octagon, flat top/bottom, circumradius r, centred (cx, cy). */
function octagon(cx: number, cy: number, r: number): string {
  return (
    Array.from({ length: 8 }, (_, k) => at(cx, cy, r, 22.5 + k * 45))
      .map(([x, y], k) => `${k ? "L" : "M"}${f(x)} ${f(y)}`)
      .join(" ") + " Z"
  );
}

const R_CASE = 46;
/** The flat top of the case: the hinge line (apothem). */
const HINGE_Y = -R_CASE * Math.cos(R(22.5)); // −42.50
/** The lid, laid flat (before foreshortening): mirrored about the hinge. */
const LID_CY = 2 * HINGE_Y; // −85

const CASE = octagon(0, 0, R_CASE);
const CASE_INNER = octagon(0, 0, R_CASE - 4.5);
const LID = octagon(0, LID_CY, R_CASE);
const LID_INNER = octagon(0, LID_CY, R_CASE - 4.5);

/** 32 ticks: cardinals long, intercardinals medium, the rest short. */
const TICKS = Array.from({ length: 32 }, (_, k) => {
  const deg = k * 11.25;
  const inner = k % 8 === 0 ? 27 : k % 4 === 0 ? 30.5 : 33;
  const [x1, y1] = at(0, 0, inner, deg);
  const [x2, y2] = at(0, 0, 36, deg);
  return `M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}`;
}).join(" ");

/** The 8-point star under the needle (hairline). */
const STAR = Array.from({ length: 8 }, (_, k) => {
  const deg = k * 45;
  const [tx, ty] = at(0, 0, k % 2 === 0 ? 24 : 15, deg);
  const [lx, ly] = at(0, 0, 4.2, deg - 45);
  const [rx, ry] = at(0, 0, 4.2, deg + 45);
  return `M${f(lx)} ${f(ly)} L${f(tx)} ${f(ty)} L${f(rx)} ${f(ry)}`;
}).join(" ");

/** Fleur-de-lis at north (our own three-lobe mark). */
const FLEUR =
  "M0 -34.5 C2.1 -32 2.1 -29.2 0 -26.4 C-2.1 -29.2 -2.1 -32 0 -34.5 Z " +
  "M-0.8 -27.2 C-3.8 -30 -6.6 -28 -5.2 -25.6 C-4.4 -24.4 -2.8 -25 -1.7 -26 " +
  "M0.8 -27.2 C3.8 -30 6.6 -28 5.2 -25.6 C4.4 -24.4 2.8 -25 1.7 -26 " +
  "M-3.6 -24.8 H3.6";

/** The red arrow (north half) and its brass tail; the tip (moon) flashes. */
const ARROW = "M0 -31 L3.6 -4.5 L0 -7.6 L-3.6 -4.5 Z";
const ARROW_TIP = "M0 -31 L1.55 -19.6 H-1.55 Z";
const TAIL = "M-1.9 5 L0 26 L1.9 5";

/* The star chart inside the lid (flat coordinates, centred on the lid). */
const STARS: readonly (readonly [x: number, y: number, r: number])[] = [
  [-22, -8, 1.5], [-12, -18, 1.1], [-3, -11, 1.7], [9, -19, 1.2], [20, -10, 1.4],
  [15, 4, 1.1], [3, 9, 1.5], [-10, 5, 1.1], [-19, 14, 1.3], [24, 13, 1.0], [-2, 22, 1.2],
];
/** One constellation line through five of the stars (our own figure). */
const CONSTELLATION = "M-22 -8 L-12 -18 L-3 -11 L9 -19 L20 -10";

/** The lid's transform: fold the flat lid about the hinge by scaleY `s`. */
function lidTransform(s: number): string {
  return `translate(0 ${f(HINGE_Y)}) scale(1 ${s.toFixed(3)}) translate(0 ${f(-HINGE_Y)})`;
}

export function JackCompass({
  heading,
  lid = "ajar",
  huntOnEnter = false,
  flash = false,
  className,
}: {
  /** Target bearing (° clockwise from north) on the chart it sits on. */
  heading: number;
  lid?: CompassLid;
  /** Spin one full turn and settle the first time it enters the viewport. */
  huntOnEnter?: boolean;
  /** The IC-PC-09 moon tip flash (the parent times it). */
  flash?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const lidRef = useRef<SVGGElement>(null);
  const phase = useEnterOnce(svgRef, { amount: 0.6 });

  const target = useMotionValue(heading);
  const needle = useSpring(target, springNeedle);
  const lidTarget = useMotionValue(LID_SCALE[lid]);
  const lidScale = useSpring(lidTarget, { stiffness: 170, damping: 22, mass: 0.8 });

  // The SSR / first-render attributes (never re-rendered: motion values own
  // them after mount, so a prop change never snaps the drawing).
  const [initialNeedle] = useState(() => `rotate(${f(heading)})`);
  const [initialLid] = useState(() => lidTransform(LID_SCALE[lid]));

  useMotionValueEvent(needle, "change", (v) => {
    const g = needleRef.current;
    if (!g) return;
    g.setAttribute("transform", `rotate(${f(v)})`);
    svgRef.current?.setAttribute("data-needle", (((v % 360) + 360) % 360).toFixed(1));
  });
  useMotionValueEvent(lidScale, "change", (v) => {
    lidRef.current?.setAttribute("transform", lidTransform(v));
  });

  // The needle: hunt → settle on `heading` (nearest turn); the entry spin.
  const lastPhase = useRef(phase);
  useEffect(() => {
    const was = lastPhase.current;
    lastPhase.current = phase;
    if (reduced) {
      target.jump(heading);
      needle.jump(heading);
      return;
    }
    if (huntOnEnter && phase === "armed") {
      // offscreen: pre-set a full turn back, so the entry is a real spin
      const off = heading - 400;
      target.jump(off);
      needle.jump(off);
      return;
    }
    const goal = nearestTurn(needle.get(), heading);
    target.set(huntOnEnter && was === "armed" && phase === "entered" ? goal + 360 : goal);
  }, [heading, phase, huntOnEnter, reduced, target, needle]);

  // The lid.
  useEffect(() => {
    const s = LID_SCALE[lid];
    if (reduced) {
      lidTarget.jump(s);
      lidScale.jump(s);
    } else {
      lidTarget.set(s);
    }
  }, [lid, reduced, lidTarget, lidScale]);

  return (
    <svg
      ref={svgRef}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      aria-hidden="true"
      focusable="false"
      className={cn("block h-auto overflow-visible", className)}
      data-instrument="jack-compass"
      data-lid={lid}
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {/* THE LID (behind the case): its inner face is the star chart */}
      <g ref={lidRef} transform={initialLid}>
        <path d={LID} className="fill-bg stroke-(--w-brass)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        <path d={LID_INNER} className="stroke-(--w-brass)" strokeOpacity={0.55} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
        <circle cx={0} cy={LID_CY} r={34} className="stroke-(--w-moon)" strokeOpacity={0.5} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
        <path
          d={CONSTELLATION}
          transform={`translate(0 ${LID_CY})`}
          className="stroke-(--w-moon)"
          strokeOpacity={0.7}
          strokeWidth={0.6}
          vectorEffect="non-scaling-stroke"
        />
        {STARS.map(([x, y, r]) => (
          <circle key={`${x},${y}`} cx={x} cy={LID_CY + y} r={r} className="fill-(--w-moon)" />
        ))}
        {/* the lid's own north star (brass) */}
        <path
          d={`M0 ${f(LID_CY - 29)} L1.6 ${f(LID_CY - 24.6)} L0 ${f(LID_CY - 20.2)} L-1.6 ${f(LID_CY - 24.6)} Z`}
          className="fill-(--w-brass)"
        />
      </g>

      {/* the hinge: two knuckles on the case's top flat */}
      <path
        d={`M-19 ${f(HINGE_Y - 1.8)} H-8 M8 ${f(HINGE_Y - 1.8)} H19`}
        className="stroke-(--w-brass)"
        strokeWidth={2.4}
        vectorEffect="non-scaling-stroke"
      />

      {/* THE CASE */}
      <path d={CASE} className="fill-bg stroke-(--w-brass)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <path d={CASE_INNER} className="stroke-(--w-brass)" strokeOpacity={0.55} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
      <circle r={37.5} className="stroke-(--w-moon)" strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
      <path d={TICKS} className="stroke-(--w-moon)" strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
      <path d={STAR} className="stroke-(--w-storm)" strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
      <path d={FLEUR} className="stroke-(--w-brass)" strokeWidth={1.1} strokeLinecap="round" vectorEffect="non-scaling-stroke" />

      {/* THE RED ARROW (pivots at the origin = the case centre) */}
      <g ref={needleRef} transform={initialNeedle} data-needle-group="">
        <path d={TAIL} className="stroke-(--w-brass)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        <path d={ARROW} className="fill-(--pir-compass-red)" />
        <path
          d={ARROW_TIP}
          className={cn("fill-(--w-moon) transition-opacity duration-(--dur-micro)", flash ? "opacity-100" : "opacity-0")}
        />
      </g>
      <circle r={3.2} className="fill-bg stroke-(--w-brass)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
