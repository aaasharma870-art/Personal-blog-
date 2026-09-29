"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { springNeedle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { drawn, useDrawPhase } from "@/components/site/world-motion";

/* ============================================================================
   PIRATES INSTRUMENTS — Act I "The Crossing" (SPEC v2 §10.2; ICONS IC-PC-02,
   TA-06). Our own constructions from public-domain compass conventions, never
   traced from a prop photo (H2). Brass 1.5 px strokes, square caps, the red
   arrow in --pir-compass-red (only ever on pirates canvas/deep: 3.15/3.37;
   never on raised, never beside ember). aria-hidden: instruments are world
   TEXTURE/HERO, the facts they point at live in the DOM.
   ========================================================================== */

const R = (deg: number) => (deg * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number) =>
  [cx + r * Math.sin(R(deg)), cy - r * Math.cos(R(deg))] as const;
const f = (n: number) => n.toFixed(2);

/* The case: a true octagon (flat top), and a 32-point tick ring. */
const OCTAGON = Array.from({ length: 8 }, (_, k) => pt(50, 50, 47, 22.5 + k * 45))
  .map(([x, y], k) => `${k ? "L" : "M"}${f(x)} ${f(y)}`)
  .join(" ")
  .concat(" Z");

const TICKS = Array.from({ length: 32 }, (_, k) => {
  const deg = k * 11.25;
  const inner = k % 8 === 0 ? 30.5 : k % 4 === 0 ? 32.5 : 34.5;
  const [x1, y1] = pt(50, 50, inner, deg);
  const [x2, y2] = pt(50, 50, 38, deg);
  return `M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}`;
}).join(" ");

/* An 8-point star under the needle (hairline, moon). */
const STAR = Array.from({ length: 8 }, (_, k) => {
  const deg = k * 45;
  const long = k % 2 === 0 ? 26 : 16;
  const [tx, ty] = pt(50, 50, long, deg);
  const [lx, ly] = pt(50, 50, 4.5, deg - 45);
  const [rx, ry] = pt(50, 50, 4.5, deg + 45);
  return `M${f(lx)} ${f(ly)} L${f(tx)} ${f(ty)} L${f(rx)} ${f(ry)}`;
}).join(" ");

/* Fleur-de-lis at north: a central petal, two curled side petals, a band. */
const FLEUR =
  "M50 15.5 C52.4 18.4 52.6 21.6 50 25 C47.4 21.6 47.6 18.4 50 15.5 Z " +
  "M49.2 24.4 C47.6 21.2 44.4 20.8 44 23.2 C43.8 24.8 45.6 25.6 47 24.8 " +
  "M50.8 24.4 C52.4 21.2 55.6 20.8 56 23.2 C56.2 24.8 54.4 25.6 53 24.8 " +
  "M46.4 26 L53.6 26";

/**
 * Jack's compass (IC-PC-02): the octagonal brass case, a 32-point dial, a
 * fleur-de-lis north and the red arrow. The arrow is STATE-driven: give it a
 * `heading` (degrees clockwise from north, a real bearing on the chart it
 * sits on) and it hunts, then settles on springNeedle (underdamped). Motion
 * off: it simply points. The needle group is symmetric about the pivot, so
 * its box centre IS the pivot.
 */
export function JackCompass({
  heading,
  size = 120,
  className,
}: {
  heading: number;
  size?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 overflow-visible", className)}
      data-instrument="jack-compass"
    >
      <path d={OCTAGON} className="fill-bg stroke-(--w-brass)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="miter" />
      <circle cx="50" cy="50" r="40.5" className="fill-none stroke-(--w-brass)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={TICKS} className="fill-none stroke-(--w-moon)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinecap="square" />
      <path d={STAR} className="fill-none stroke-(--w-storm)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="miter" />
      <path d={FLEUR} className="fill-none stroke-(--w-brass)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <motion.g
        initial={false}
        animate={{ rotate: heading }}
        transition={reduced ? { duration: 0 } : { type: "spring", ...springNeedle }}
      >
        {/* the red arrow (north end) and its brass counterweight (south end) */}
        <path d="M50 19 L53 50 L47 50 Z" className="fill-(--pir-compass-red)" />
        <path d="M50 81 L52.2 50 L47.8 50 Z" className="fill-none stroke-(--w-brass)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </motion.g>
      <circle cx="50" cy="50" r="2.6" className="fill-(--w-brass)" />
    </svg>
  );
}

/** Bearing (degrees clockwise from north) from point a to point b in a
 *  y-down SVG space: the needle's true heading toward a waypoint. */
export function bearingFrom(a: readonly [number, number], b: readonly [number, number]): number {
  const deg = (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/* A 16-point rhumb rose: 16 hairline rays, an 8-point star, a ring. */
const ROSE_RAYS = Array.from({ length: 16 }, (_, k) => {
  const [x, y] = pt(80, 80, k % 4 === 0 ? 78 : k % 2 === 0 ? 64 : 52, k * 22.5);
  return `M80 80 L${f(x)} ${f(y)}`;
});
const ROSE_STAR = Array.from({ length: 8 }, (_, k) => {
  const deg = k * 45;
  const long = k % 2 === 0 ? 46 : 30;
  const [tx, ty] = pt(80, 80, long, deg);
  const [lx, ly] = pt(80, 80, 7, deg - 45);
  const [rx, ry] = pt(80, 80, 7, deg + 45);
  return `M${f(lx)} ${f(ly)} L${f(tx)} ${f(ty)} L${f(rx)} ${f(ry)}`;
});

/**
 * RhumbRose (TA-06): the original 16-point rose the four pillars sit on as
 * four bearings (About). Drawn in brass ONCE on entry (easeDraw); motion off
 * or already in view: drawn. The four long cardinal rays are the pillars'
 * bearings; they carry no data.
 */
export function RhumbRose({ size = 160, className }: { size?: number; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.5);
  return (
    <svg
      ref={ref}
      viewBox="0 0 160 160"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("overflow-visible", className)}
      data-motif="rhumb-rose"
    >
      <motion.circle cx="80" cy="80" r="40" className="fill-none stroke-(--w-brass)" strokeWidth={0.9} {...drawn(phase, { duration: 1.2 })} />
      {ROSE_RAYS.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          className={i % 4 === 0 ? "stroke-(--w-brass)" : "stroke-(--w-storm)"}
          strokeWidth={i % 4 === 0 ? 1 : 0.6}
          fill="none"
          {...drawn(phase, { delay: 0.1 + (i % 4) * 0.08, duration: 0.9 })}
        />
      ))}
      {ROSE_STAR.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          className="fill-none stroke-(--w-brass)"
          strokeWidth={1}
          strokeLinejoin="miter"
          {...drawn(phase, { delay: 0.35 + (i % 2) * 0.12, duration: 0.9 })}
        />
      ))}
      <circle cx="80" cy="80" r="2.4" className="fill-(--w-brass)" />
    </svg>
  );
}
