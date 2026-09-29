"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, springNeedle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { WorldId } from "@/lib/worlds";
import { JacksCompass } from "@/components/primitives/loaders/compass";
import { useOneShot } from "@/components/primitives/loaders/kit";
import { LINE_D, remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * Opening card PROGRAM (SM-3, kind `opening`; M2: it sits BELOW the Black
 * Pearl frame, frames/opening-plate.tsx, on its own passage driver — see
 * CardShell `after`): the h2 "A research journal in four acts." beside the
 * program — Jack's compass (IC-PC-02) with its lid OPEN (the star chart,
 * RECOGNIZABILITY S04) heads it, and the LD-PC brass course runs from the
 * compass down through every row's waypoint: one row per act (plus the
 * Intermission). The rows stay in house type (O-4 letters only the film
 * title and the caption). ≥ 1024 two columns (the h2 | the program);
 * below, they stack; < 640 the compass and its lead-in are hidden.
 *   R2  the course IS the card's progress element (no separate progress
 *       line): it plots compass → row I → … → the last row with the card's
 *       passage p (direct), complete by p = .95; a waypoint is reached when
 *       its leg lands.
 *   R3  hovering OR focusing a row turns the needle toward it ("points to
 *       what you want most", IC-PC-03) and draws that act's Line material
 *       in a 120 px vignette (CSS only; the final state is static).
 *   settle  at p ≥ .98 the needle settles on row I's bearing (springNeedle)
 *       with ONE dur.flash moon tip flash; re-arms only below p = .9.
 * Static card: the course fully drawn, the needle on row I, no flash.
 * Rows are real anchors (≥ 44 px targets): the card's only tab stops.
 */
export type OpeningRow = {
  key: string;
  href: string;
  title: string;
  credit: string;
  bearing: number;
  /** Line material of the row's world (house = none). */
  world: WorldId;
};

const PRE_SETTLE = 150; // the needle's resting offset before the program has arrived

export function OpeningFrame({ heading, rows }: { heading: ReactNode; rows: OpeningRow[] }) {
  const { p, live } = useCard();
  const reduced = useReducedMotion();
  const home = rows[0]?.bearing ?? 0;
  const [aim, setAim] = useState<number | null>(null);
  const [settled, setSettled] = useState(() => p.get() >= 0.98);
  useMotionValueEvent(p, "change", (v) => {
    if (!settled && v >= 0.98) setSettled(true);
    else if (settled && v < 0.9) setSettled(false);
  });
  const atRest = !live || settled;

  const target = useMotionValue(home);
  const needle = useSpring(target, springNeedle);
  useEffect(() => {
    const goal = aim ?? (atRest ? home : home + PRE_SETTLE);
    if (!live || reduced) {
      target.jump(aim ?? home);
      needle.jump(aim ?? home);
      return;
    }
    // the nearest turn to the goal (no needless full spins)
    const cur = needle.get();
    target.set(goal + 360 * Math.round((cur - goal) / 360));
  }, [aim, atRest, live, reduced, home, target, needle]);

  const flash = useOneShot(live && settled && aim === null, dur.flash * 1000, !reduced);
  const n = rows.length;
  const lead = useLeg(0, n);
  // leg 0's first half: the compass → the list (its second half is row I's top half)
  const leadClip = useTransform(lead, (d) => `inset(0 0 ${((1 - remap(d, 0, 0.5)) * 100).toFixed(2)}% 0)`);

  return (
    <div
      className={cn(
        // the program below the Pearl (CardShell `after`: the stage has the
        // gutters); the lab still mounts it in a 2.39 box, so it fills one
        "grid size-full grid-cols-1 content-center items-center gap-tier-group",
        "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-tier-block",
      )}
    >
      {heading}
      <div className="flex flex-col">
        {/* the compass heads the course; the waypoints hang under its centre
            (ml = half the compass − the gutter's 16 px dot centre) */}
        <div aria-hidden="true" className="hidden sm:block">
          <JacksCompass heading={needle} flash={flash} lid="chart" className={cn("block", COMPASS)} />
        </div>
        <span aria-hidden="true" className={cn("relative hidden h-6 w-8 sm:block", HANG)}>
          <motion.span className={cn("absolute inset-y-0", LEG)} style={live ? { clipPath: leadClip } : undefined} />
        </span>
        <ol className={cn("flex flex-col justify-center", HANG)}>
          {rows.map((row, k) => (
            <Row
              key={row.key}
              row={row}
              index={k}
              count={n}
              onAim={(on) => setAim(on ? row.bearing : null)}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Jack's compass with its lid OPEN (M2, RECOGNIZABILITY S04: the dot
 *  star chart on the lid's inner face reads "Jack's compass" at a glance;
 *  the drawing is 100 × 132, so it is sized by WIDTH: 96 px ≥ 640, 112 px
 *  ≥ 1280, 120 px ≥ 1400), and the program hung under its centre:
 *  margin = half the compass − the gutter's 16 px dot centre. */
const COMPASS = "h-auto w-24 xl:w-28 min-[1400px]:w-30";
const HANG = "sm:ml-8 xl:ml-10 min-[1400px]:ml-11";
/** One dashed brass leg of the course (the gutter's centre line). */
const LEG =
  "left-[15px] w-[1.5px] bg-[repeating-linear-gradient(to_bottom,var(--w-brass)_0_6px,transparent_6px_12px)]";
/** The course is complete by p = .95 (before the needle settles at .98). */
const COURSE_END = 0.95;

/** Drawn fraction of leg `j` (0 = compass → row I; j = row j−1 → row j). */
function useLeg(j: number, count: number) {
  const { p } = useCard();
  const L = COURSE_END / Math.max(1, count);
  return useTransform(p, (v) => remap(v, j * L, (j + 1) * L));
}

function Row({
  row,
  index,
  count,
  onAim,
}: {
  row: OpeningRow;
  index: number;
  count: number;
  onAim: (on: boolean) => void;
}) {
  const { p, live } = useCard();
  // leg `index` lands on this row (the second half of leg 0 is the lead-in's
  // last stretch, row I's top half); leg `index + 1` leaves it
  const arrive = useLeg(index, count);
  const leave = useLeg(index + 1, count);
  const inClip = useTransform(arrive, (d) => `inset(0 0 ${((1 - remap(d, 0.5, 1)) * 100).toFixed(2)}% 0)`);
  const clip = useTransform(leave, (d) => `inset(0 0 ${((1 - d) * 100).toFixed(2)}% 0)`);
  const reached = useTransform(p, (v) => (v >= ((index + 1) * COURSE_END) / Math.max(1, count) - 1e-6 ? 1 : 0.3));
  const last = index === count - 1;

  return (
    <li className="relative pl-10">
      {/* the course gutter: this row's waypoint and the leg to the next row */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8">
        {index === 0 ? (
          // the lead-in from the compass lands here (≥ 640, with the compass)
          <motion.span
            className={cn("absolute top-0 hidden h-1/2 sm:block", LEG)}
            style={live ? { clipPath: inClip } : undefined}
          />
        ) : null}
        {last ? null : (
          <motion.span className={cn("absolute top-1/2 h-full", LEG)} style={live ? { clipPath: clip } : undefined} />
        )}
        {/* border colour inline: an unlayered `* { border-color }` in
            app/globals.css outranks the border-(--w-brass) utility */}
        <motion.span
          className="absolute top-1/2 left-[11px] size-2.5 -translate-y-1/2 rounded-full border-[1.5px] bg-bg"
          style={live ? { opacity: reached, borderColor: "var(--w-brass)" } : { borderColor: "var(--w-brass)" }}
        />
      </span>
      {/* two lines (the title + its vignette, then the credit): every row
          has the same height at every width, so the course's legs land on
          the waypoints (a wrapped one-line row broke the spacing) */}
      <a
        href={row.href}
        onMouseEnter={() => onAim(true)}
        onMouseLeave={() => onAim(false)}
        onFocus={() => onAim(true)}
        onBlur={() => onAim(false)}
        className={cn(
          "group flex min-h-11 flex-col justify-center gap-0.5 py-1.5 text-fg outline-none",
          "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent focus-visible:rounded-(--radius-focus)",
        )}
      >
        <span className="flex items-center gap-4">
          <span className="type-heading transition-colors duration-(--dur-micro) group-hover:text-fg">{row.title}</span>
          <Vignette world={row.world} />
        </span>
        <span className="type-meta text-fg-muted">{row.credit}</span>
      </a>
    </li>
  );
}

/** The row's act drawn in its world's Line material, on hover or focus
 *  (CSS dash draw; reduced motion / Pause show the drawn state at once).
 *  Shared by the ALT program (frames/opening-map.tsx). */
export function Vignette({ world }: { world: WorldId }) {
  const ink: Partial<Record<WorldId, { stroke: string; dash?: string }>> = {
    pirates: { stroke: "var(--w-brass)", dash: "18 18" },
    idiots: { stroke: "var(--w-bp-line)" },
    rdr2: { stroke: "var(--w-pencil)" },
    hp: { stroke: "var(--w-ink-contour)" },
  };
  const m = ink[world];
  if (!m) return null;
  return (
    <svg
      viewBox="0 120 1000 240"
      aria-hidden="true"
      focusable="false"
      className="hidden h-6 w-24 shrink-0 sm:block"
      fill="none"
    >
      <path
        d={LINE_D}
        pathLength={1}
        stroke={m.stroke}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray="1 2"
        className="opening-vignette"
      />
      {m.dash ? (
        // the course is dashed: a background-coloured dash cuts the drawn stroke
        <path d={LINE_D} stroke="var(--bg)" strokeWidth={18} strokeDasharray={m.dash} />
      ) : null}
    </svg>
  );
}
