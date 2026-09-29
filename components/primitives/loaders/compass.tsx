"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

/**
 * JacksCompass — our own recreation of Jack's compass (IC-PC-02; SPEC v2 §8
 * LD-PC; DESIGN v3 §8.1 "instrument-grade"): a lidded octagonal brass case,
 * a 32-point dial (4 long cardinals, a fleur-de-lis north) and THE RED ARROW
 * (--pir-compass-red, a darker red than ember: it never reads as "killed")
 * on a brass pivot. Built from public-domain compass conventions — a true
 * octagon, a true 11.25° tick ring — never traced from a prop photo (H2).
 *
 * Pure drawing: the parent owns the needle (`heading`, degrees clockwise
 * from north, usually a springNeedle-sprung MotionValue) and the one-shot
 * tip flash (IC-PC-09, the green-flash wink: dur.flash, area < 0.1 % of the
 * viewport). aria-hidden, focusable=false, no text inside (loaders L7).
 * Colours are tokens only (L17); strokes are non-scaling hairlines.
 */
type Props = {
  heading: MotionValue<number>;
  /** The IC-PC-09 tip flash is showing (the parent times it). */
  flash?: boolean;
  /** The lid is open (the Journey's hover/focus star chart; default shut):
   *  a thin leaf above the hinge that stays inside the default box. */
  lidOpen?: boolean;
  /** "chart" (M2, RECOGNIZABILITY S04/S05/S20): the lid stands OPEN, tilted
   *  back above the hinge, its inner face a dot star chart — the compass
   *  read at a glance. It changes the drawing's box to COMPASS_CHART_VIEWBOX
   *  (100 × 132 user units, the pivot 82 units below the top): place it
   *  with that aspect. Takes precedence over `lidOpen`. */
  lid?: "chart";
  className?: string;
  /** Placement when nested inside another SVG (user units of the parent). */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

const R_CASE = 46;
const R_DIAL = 35;

/** A regular octagon, flat top (vertices at 22.5° + k·45°). */
function octagon(r: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + 45 * k) * Math.PI) / 180;
    pts.push(`${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** 32 ticks every 11.25°: cardinals long, intercardinals medium, rest short. */
const TICKS = Array.from({ length: 32 }, (_, i) => {
  const a = (i * 11.25 * Math.PI) / 180;
  const len = i % 8 === 0 ? 8.5 : i % 4 === 0 ? 5.5 : 2.8;
  const r0 = R_DIAL;
  const r1 = R_DIAL - len;
  const f = (r: number) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
  return `M${f(r0)}L${f(r1)}`;
}).join("");

const CASE_OUTER = octagon(R_CASE);
const CASE_INNER = octagon(R_CASE - 4);

/** Fleur-de-lis north (our own three-lobe mark, ≤ 40 nodes). */
const FLEUR =
  "M0 -33.5C1.9 -31 1.9 -28.4 0 -25.6C-1.9 -28.4 -1.9 -31 0 -33.5Z" +
  "M-0.8 -26.4C-3.6 -29.2 -6.4 -27.4 -5 -25C-4.2 -23.8 -2.6 -24.4 -1.6 -25.4" +
  "M0.8 -26.4C3.6 -29.2 6.4 -27.4 5 -25C4.2 -23.8 2.6 -24.4 1.6 -25.4" +
  "M-3.4 -24.2H3.4";

/** The open lid, tilted back (foreshortened ×0.36) above the hinge: its rim
 *  octagons and the star chart on its inner face (our own dots and lines,
 *  never a traced prop). */
const SQUASH = 0.36;
const HINGE_TOP = -49.4;
const LID_CY = HINGE_TOP - R_CASE * Math.cos(Math.PI / 8) * SQUASH - 1.2;
function lidOctagon(r: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + 45 * k) * Math.PI) / 180;
    pts.push(`${(r * Math.sin(a)).toFixed(2)},${(LID_CY - r * Math.cos(a) * SQUASH).toFixed(2)}`);
  }
  return pts.join(" ");
}
const LID_OUTER = lidOctagon(R_CASE);
const LID_INNER = lidOctagon(R_CASE - 5);
/** Stars of the chart (x, y on the unforeshortened lid face; r). */
const STARS: readonly (readonly [number, number, number])[] = [
  [-24, -8, 1.5], [-13, -18, 1.2], [-3, -10, 1.8], [8, -21, 1.2], [19, -12, 1.5],
  [27, 3, 1.1], [12, 6, 1.4], [-6, 14, 1.2], [-21, 9, 1.1], [2, 24, 1], [-30, -1, 0.9], [30, -20, 0.9],
];
const starY = (y: number) => LID_CY + y * SQUASH;
const CHART_DOTS = STARS.map(([x, y, r]) => ({ cx: x, cy: starY(y), r }));
/** Two constellations joined by hairlines, and the ecliptic arc. */
const CHART_LINES =
  [[0, 1, 2, 3, 4], [4, 5, 6, 7, 8]]
    .map((idx) => idx.map((i, k) => `${k ? "L" : "M"}${STARS[i][0]} ${starY(STARS[i][1]).toFixed(2)}`).join(""))
    .join("") + `M-36 ${starY(-2).toFixed(2)}Q0 ${starY(-40).toFixed(2)} 36 ${starY(-2).toFixed(2)}`;
/** The chart lid's box: the lid top (≈ −80) to the case bottom (≈ +50). */
export const COMPASS_CHART_VIEWBOX = "-50 -82 100 132";
/** Where the pivot sits in that box, as a fraction of its height (for
 *  aligning a needle bearing from the parent). */
export const COMPASS_CHART_PIVOT_Y = 82 / 132;

/** The red arrow (north half) and its brass tail. */
const ARROW = "M0 -29L3.1 -5.5L0 -8.4L-3.1 -5.5Z";
const ARROW_TIP = "M0 -29L1.35 -18.6H-1.35Z";
const TAIL = "M-1.7 6L0 24L1.7 6";

export function JacksCompass({
  heading,
  flash = false,
  lidOpen = false,
  lid,
  className,
  ...box
}: Props) {
  const chart = lid === "chart";
  // The needle turns by its SVG transform attribute (rotation about the
  // pivot at the user-space origin: no CSS transform-box ambiguity), written
  // straight to the DOM — no React render per frame.
  const needle = useRef<SVGGElement>(null);
  const [initial] = useState(() => heading.get());
  useMotionValueEvent(heading, "change", (v) => {
    needle.current?.setAttribute("transform", `rotate(${v.toFixed(2)})`);
  });
  return (
    <svg
      {...box}
      viewBox={chart ? COMPASS_CHART_VIEWBOX : "-50 -56 100 106"}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {/* hinge knuckle of the lid (the case is a lidded box) */}
      <path
        d="M-9 -44.6V-49.4H9V-44.6"
        stroke="var(--w-brass)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {/* the lid, open and tilted back: its rim and the star chart inside */}
      {chart ? (
        <g data-compass-lid="chart">
          <polygon points={LID_OUTER} fill="var(--bg)" stroke="var(--w-brass)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <polygon
            points={LID_INNER}
            stroke="var(--w-brass)"
            strokeWidth={0.75}
            strokeOpacity={0.55}
            vectorEffect="non-scaling-stroke"
          />
          <path d={CHART_LINES} stroke="var(--w-moon)" strokeWidth={0.6} strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
          {CHART_DOTS.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy.toFixed(2)} r={d.r} fill="var(--w-moon)" stroke="none" />
          ))}
        </g>
      ) : null}
      {/* lid (open: a thin star-chart leaf above the hinge; shut: nothing) */}
      {lidOpen && !chart ? (
        <g stroke="var(--w-moon)" strokeWidth={0.75} vectorEffect="non-scaling-stroke">
          <path d="M-16 -50L-12 -54.6H12L16 -50" stroke="var(--w-brass)" strokeWidth={1} />
          <path d="M-7 -52.4h.01M-1 -53.4h.01M5 -52h.01M9 -53.1h.01M2 -51.4h.01" strokeLinecap="round" strokeWidth={1.6} />
        </g>
      ) : null}
      <polygon
        points={CASE_OUTER}
        stroke="var(--w-brass)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={CASE_INNER}
        stroke="var(--w-brass)"
        strokeWidth={0.75}
        strokeOpacity={0.55}
        vectorEffect="non-scaling-stroke"
      />
      <circle r={R_DIAL + 1.5} stroke="var(--w-moon)" strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
      <path d={TICKS} stroke="var(--w-moon)" strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
      <path d={FLEUR} stroke="var(--w-brass)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <g ref={needle} transform={`rotate(${initial.toFixed(2)})`}>
        <path d={TAIL} stroke="var(--w-brass)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        <path d={ARROW} fill="var(--pir-compass-red)" />
        <path
          d={ARROW_TIP}
          fill="var(--w-moon)"
          opacity={flash ? 1 : 0}
          data-compass-flash={flash ? "" : undefined}
        />
      </g>
      <circle r={3.2} fill="var(--bg)" stroke="var(--w-brass)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
