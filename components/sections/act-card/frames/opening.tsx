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
 * Opening card frame (SM-3, kind `opening`): the h2 "A research journal in
 * four acts." above the program — one row per act (plus the Intermission)
 * joined by the LD-PC brass course, with Jack's compass (IC-PC-02, 96 px)
 * beside it. House plane, so no display face anywhere (C8).
 *   R2  the course plots down the rows with the card's passage p (direct).
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

  return (
    <div className="grid size-full grid-cols-1 items-center gap-tier-group py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-gutter">
      <div className="flex flex-col gap-tier-group">
        {heading}
        <ol className="flex flex-col justify-center">
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
      <div aria-hidden="true" className="hidden justify-self-end sm:block">
        <JacksCompass heading={needle} flash={flash} className="size-24" />
      </div>
    </div>
  );
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
  const segs = Math.max(1, count - 1);
  const drawn = useTransform(p, (v) => remap(v, index / segs, (index + 1) / segs));
  const clip = useTransform(drawn, (d) => `inset(0 0 ${((1 - d) * 100).toFixed(2)}% 0)`);
  const reached = useTransform(p, (v) => (v >= index / segs - 1e-6 ? 1 : 0.3));
  const last = index === count - 1;

  return (
    <li className="relative pl-10">
      {/* the course gutter: this row's waypoint and the leg to the next row */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8">
        {last ? null : (
          <motion.span
            className="absolute top-1/2 left-[15px] h-full w-[1.5px] bg-[repeating-linear-gradient(to_bottom,var(--w-brass)_0_6px,transparent_6px_12px)]"
            style={live ? { clipPath: clip } : undefined}
          />
        )}
        <motion.span
          className="absolute top-1/2 left-[11px] size-2.5 -translate-y-1/2 rounded-full border-[1.5px] border-(--w-brass) bg-bg"
          style={live ? { opacity: reached } : undefined}
        />
      </span>
      <a
        href={row.href}
        onMouseEnter={() => onAim(true)}
        onMouseLeave={() => onAim(false)}
        onFocus={() => onAim(true)}
        onBlur={() => onAim(false)}
        className={cn(
          "group flex min-h-11 flex-wrap items-baseline gap-x-4 gap-y-1 py-1.5 text-fg outline-none",
          "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent focus-visible:rounded-(--radius-focus)",
        )}
      >
        <span className="type-heading transition-colors duration-(--dur-micro) group-hover:text-fg">{row.title}</span>
        <span className="type-meta text-fg-muted">{row.credit}</span>
        <Vignette world={row.world} />
      </a>
    </li>
  );
}

/** The row's act drawn in its world's Line material, on hover or focus
 *  (CSS dash draw; reduced motion / Pause show the drawn state at once). */
function Vignette({ world }: { world: WorldId }) {
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
      className="hidden h-8 w-[7.5rem] self-center sm:block"
      fill="none"
    >
      <path
        d={LINE_D}
        pathLength={1}
        stroke={m.stroke}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray="1 1"
        className="opening-vignette"
      />
      {m.dash ? (
        // the course is dashed: a background-coloured dash cuts the drawn stroke
        <path d={LINE_D} stroke="var(--bg)" strokeWidth={18} strokeDasharray={m.dash} />
      ) : null}
    </svg>
  );
}
