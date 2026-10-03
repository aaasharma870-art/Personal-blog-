"use client";

import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { journey } from "@/lib/content";
import { useReducedMotion } from "@/lib/flags";
import { easeDraw } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AztecMedallion } from "@/components/worlds/pirates/aztec-medallion";
import { CASE_CENTER_PCT, JackCompass, type CompassLid } from "@/components/worlds/pirates/jack-compass";
import {
  BREAK_INDEX,
  COURSE,
  LABEL_SIDE,
  LEGS,
  MEDALLION_AT,
  NOW_INDEX,
  ROSE,
  STRIP,
  WAYPOINTS,
  pct,
} from "@/components/worlds/pirates/voyage-chart";

/* ============================================================================
   THE VOYAGE CHART STRIP (SPEC v2 SM-4; journey-voyage.BAR §3, J5–J8, J18–
   J20; ICONS IC-PC-02/03/04/06/07; RECOGNIZABILITY S06). One portolan strip
   for every mode — the desktop voyage (waypoint LINKS), the carousel (the
   waypoints ARE its tabs) and the no-JS stack (plain anchors) — so the
   needle points the same way everywhere:
     - a double neat line and rhumb hairlines from the rose (portolan grammar);
     - the course: DEFAULT "full" = the whole dashed brass course; ALT "legs"
       = an uncharted storm hairline that the brass course PLOTS leg by leg
       up to the reached waypoint (and the X inks itself at Now);
     - waypoint dots (filled once reached), the break's kink with its ONE
       ember tick (killed: those patterns are on the kill-list), the brass X
       at Now (one per page; brass, never ember);
     - Jack's compass at the rose (heading / lid from the host);
     - the cursed Aztec medallion by waypoint 3 (moonlit once the break is
       reached).
   The interactive layer (links / tabs) is the host's `children`, positioned
   with <Waypoint>. Everything drawn here is aria-hidden; the facts are text.

   PHASE 3 (W3-PIRATES; PHASE3-SPEC §9.1 #4–#5, spec §2.3 B11):
   - `coin`: the `pc-coin` hotspot (server <EggHotspot>, a ≥ 44 px button
     over the medallion, DESKTOP_FINE only by CSS). Its `aztec-coin` egg
     shows the lazy moon sweep (coin-moon.tsx, plain DOM) over the chart's
     brass layer (never text): 1.2 s; under reduced motion / Pause an
     instant swap held until the next press or Esc. The wiring lives in the
     lazy desktop chunk (components/enhance/binders/hotspots.ts, the binder
     that makes the hotspot fire at all), not here: the layer goes right
     after `[data-chart-medallion]` (W3 budget: no first-load JS for an egg).
   - `marginal`: the faint "parley?" hint by the brass X (server, inside
     <EggHint egg="parley">; aria-hidden, desktop only).
   ========================================================================== */

/** Rhumb lines radiating from the rose, clipped to the chart. */
const RHUMBS = Array.from({ length: 16 }, (_, k) => {
  const a = (k * 22.5 * Math.PI) / 180;
  const [cx, cy] = ROSE;
  return `M${cx} ${cy} L${(cx + 900 * Math.sin(a)).toFixed(1)} ${(cy - 900 * Math.cos(a)).toFixed(1)}`;
}).join(" ");

const [BX, BY] = WAYPOINTS[BREAK_INDEX] ?? [0, 0];
const [XX, XY] = WAYPOINTS[NOW_INDEX] ?? [0, 0];
const X_STROKES = [
  `M${XX - 10} ${XY - 10} L${XX + 10} ${XY + 10}`,
  `M${XX + 10} ${XY - 10} L${XX - 10} ${XY + 10}`,
];

export type ChartPlot = "full" | "legs";

export function JourneyChart({
  heading,
  lid,
  active,
  reached,
  plot = "full",
  cursed,
  xInked = true,
  hunt = false,
  compassClassName,
  medallionClassName,
  className,
  children,
  coin = null,
  marginal = null,
}: {
  /** The needle's target bearing. */
  heading: number;
  lid: CompassLid;
  /** The active step (its dot is larger); -1 = none. */
  active: number;
  /** The furthest step reached (filled dots; the ALT plots legs up to it). */
  reached: number;
  plot?: ChartPlot;
  /** The medallion shows its moonlit skull. */
  cursed: boolean;
  /** ALT: the X has inked itself (the DEFAULT's X is always there). */
  xInked?: boolean;
  /** The compass spins once and settles when it first enters. */
  hunt?: boolean;
  compassClassName: string;
  medallionClassName: string;
  className?: string;
  /** The waypoint layer (links or tabs), positioned with <Waypoint>. */
  children?: ReactNode;
  /** The `pc-coin` hotspot (server-rendered <EggHotspot>). */
  coin?: ReactNode;
  /** The "parley?" marginal by the X (server-rendered, in <EggHint>). */
  marginal?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const draw = reduced ? { duration: 0 } : { duration: 0.9, ease: easeDraw };
  const clip = `journey-chart-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className={cn("relative", className)} data-chart-plot={plot}>
      <div className="relative" style={{ aspectRatio: `${STRIP.w} / ${STRIP.h}` }}>
        <svg
          viewBox={`0 0 ${STRIP.w} ${STRIP.h}`}
          aria-hidden="true"
          focusable="false"
          className="absolute inset-0 size-full overflow-visible"
          fill="none"
          strokeLinecap="square"
        >
          <defs>
            <clipPath id={clip}>
              <rect x={4} y={4} width={STRIP.w - 8} height={STRIP.h - 8} />
            </clipPath>
          </defs>
          {/* the double neat line of an old chart */}
          <rect x={0.5} y={0.5} width={STRIP.w - 1} height={STRIP.h - 1} className="stroke-(--w-storm)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <rect x={4.5} y={4.5} width={STRIP.w - 9} height={STRIP.h - 9} className="stroke-(--w-storm)" strokeOpacity={0.6} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
          <path d={RHUMBS} clipPath={`url(#${clip})`} className="stroke-(--w-storm)" strokeOpacity={0.4} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />

          {/* the course */}
          {plot === "full" ? (
            <path d={COURSE} className="stroke-(--w-brass)" strokeWidth={1.5} strokeDasharray="7 6" vectorEffect="non-scaling-stroke" />
          ) : (
            <>
              {/* uncharted water: the whole course as a storm hairline */}
              <path d={COURSE} className="stroke-(--w-storm)" strokeWidth={1} strokeDasharray="3 6" vectorEffect="non-scaling-stroke" />
              {/* the plotted legs, drawn in brass as each waypoint is reached */}
              {LEGS.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  className="stroke-(--w-brass)"
                  strokeWidth={1.75}
                  initial={false}
                  animate={{ pathLength: i <= reached ? 1 : 0, opacity: i <= reached ? 1 : 0 }}
                  transition={draw}
                  data-leg={i}
                />
              ))}
            </>
          )}

          {/* The break: ONE ember tick across the kink (killed) */}
          <path d={`M${BX - 10} ${BY - 8} L${BX + 10} ${BY + 8}`} className="stroke-kill" strokeWidth={2} vectorEffect="non-scaling-stroke" data-ember="break" />

          {/* waypoint dots (the X stands in for the last) */}
          {WAYPOINTS.map(([x, y], i) =>
            i === NOW_INDEX ? null : (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === active ? 5.5 : 4.5}
                className={cn(
                  "stroke-(--w-brass) transition-[r] duration-(--dur-micro) motion-off:transition-none",
                  i <= reached ? "fill-(--w-brass)" : "fill-bg",
                )}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            ),
          )}

          {/* Now: the brass X (one per page; never ember) */}
          {X_STROKES.map((d, k) => (
            <motion.path
              key={d}
              d={d}
              className="stroke-(--w-brass)"
              strokeWidth={2.5}
              initial={false}
              animate={{ pathLength: xInked ? 1 : 0, opacity: xInked ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.35, delay: k * 0.3, ease: easeDraw }}
              data-x-mark={k === 0 ? "" : undefined}
            />
          ))}
        </svg>

        {/* the cursed medallion by the break (pc-coin's moon layer goes
            right after it, with a moonlit copy of it: coin-moon.tsx) */}
        <div
          className="pointer-events-none absolute"
          style={{ ...pct(MEDALLION_AT), transform: "translate(-50%, -50%)" }}
          data-chart-medallion=""
        >
          <AztecMedallion cursed={cursed} className={medallionClassName} />
        </div>

        {/* Jack's compass at the rose (the harbour) */}
        <div
          className="pointer-events-none absolute"
          style={{ ...pct(ROSE), transform: `translate(-50%, -${CASE_CENTER_PCT})` }}
        >
          <JackCompass heading={heading} lid={lid} huntOnEnter={hunt} className={compassClassName} />
        </div>

        {children}

        {/* the coin's hotspot, over the medallion */}
        {coin ? (
          <div className="absolute" style={{ ...pct(MEDALLION_AT), transform: "translate(-50%, -50%)" }}>
            {coin}
          </div>
        ) : null}

        {/* "parley?" in the margin above the brass X */}
        {marginal ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ ...pct(WAYPOINTS[NOW_INDEX] ?? [0, 0]), transform: "translate(-62%, -190%) rotate(-7deg)" }}
          >
            {marginal}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Waypoint — positions one interactive waypoint element (a link or a tab)
 * on the strip: a zero-size anchor at the waypoint, and the element hung
 * above or below the course (LABEL_SIDE) and centred on it.
 */
export function Waypoint({
  index,
  as: Tag = "li",
  children,
}: {
  index: number;
  /** "li" inside a list of links; "div" inside a tablist (tabs must be
   *  owned by the tablist without a listitem in between). */
  as?: "li" | "div";
  children: ReactNode;
}) {
  const p = WAYPOINTS[index];
  if (!p) return null;
  const style: CSSProperties = pct(p);
  return (
    <Tag className="absolute size-0" style={style} data-waypoint={index + 1}>
      <span
        className={cn(
          "absolute left-0 flex -translate-x-1/2 justify-center",
          LABEL_SIDE[index] === "above" ? "bottom-2" : "top-2",
        )}
      >
        {children}
      </span>
    </Tag>
  );
}

/** The waypoint label: its sounding (01–04) and the step's marker, both
 *  verbatim Meta (content.ts `journey[].marker`; data never takes a display
 *  face). `compact` (< 640 px carousel/stack) shows only the sounding and
 *  keeps the marker for assistive tech. */
export function WaypointLabel({ index, compact = false }: { index: number; compact?: boolean }) {
  const s = journey[index];
  if (!s) return null;
  return (
    <span className="flex flex-col items-center text-center leading-tight">
      <span className="tnum">{String(index + 1).padStart(2, "0")}</span>
      <span className={cn("max-w-[4.5rem]", compact && "sr-only sm:not-sr-only")}>{s.marker}</span>
    </span>
  );
}
