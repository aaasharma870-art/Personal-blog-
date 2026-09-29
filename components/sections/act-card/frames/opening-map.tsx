"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion, useMotionValueEvent, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { remap } from "@/components/primitives/loaders/line";
import { CardReveal } from "@/components/sections/act-card/card-reveal";
import { useCard } from "@/components/sections/act-card/card-context";
import { Vignette, type OpeningRow } from "@/components/sections/act-card/frames/opening";

/**
 * Opening card, ALT choreography "chart-unfold" (lib/variants.ts
 * `card-opening.choreo` alt; SM-3). The DEFAULT steers by Jack's compass;
 * this one reads a treasure chart. Same h2, same rows, same anchors, same
 * focus order — only the drawing around them changes:
 *   0–.15   a folded chart opens DOWN from its middle crease (the centre
 *           panel), then
 *   .15–.3  OUT to both sides (the outer panels swing open, shaded until
 *           they lie flat): a brass neatline, three folds, a compass rose
 *           and (≥ 1024) an island charted in the empty east.
 *   .3–.9   a dotted trail makes landfall at the chart's lower edge and
 *           climbs the program BOTTOM-UP, leg by leg, lighting each waypoint
 *           as it arrives (direct p; it reverses by position) — every route
 *           on this chart leads to Act I.
 *   ≥ .95   an X is inked on Act I (two brass strokes, the pirates
 *           emphasis "X-stamp", never ember); re-arms only below p = .9.
 * Hovering OR focusing a row rings its waypoint on the chart and draws that
 * act's Line vignette (as the default does). Static card (SSR, no JS, RM,
 * Pause, < 640): the chart open, the trail drawn, every waypoint lit, the X
 * on Act I. The chart art is aria-hidden; the rows are the only tab stops.
 * House plane, no display face, no aqua; the X is brass (C8, C10).
 * `caption` (the card's ALT moment caption, "THE CHART TO ISLA DE MUERTA •
 * PIRATES OF THE CARIBBEAN") is set directly UNDER the chart box — the
 * thing it names (M2 ART-DIRECTOR #9) — and rises once the chart has
 * opened; static (SSR, RM, Pause, no JS): shown.
 */

const TRAIL = { from: 0.3, to: 0.9 };
/** A dotted leg in a 32 px gutter, stretched to the row's height. */
const LEGS = ["M16 100C29 74 3 28 16 0", "M16 100C3 74 29 28 16 0"];

export function OpeningMapFrame({
  heading,
  rows,
  caption = null,
}: {
  heading: ReactNode;
  rows: OpeningRow[];
  /** The ALT moment caption (server-rendered <SceneCaption>), under the chart. */
  caption?: ReactNode;
}) {
  const { p, live } = useCard();
  const reduced = useReducedMotion();
  const [aim, setAim] = useState<number | null>(null);
  const [marked, setMarked] = useState(() => p.get() >= 0.95);
  useMotionValueEvent(p, "change", (v) => {
    if (!marked && v >= 0.95) setMarked(true);
    else if (marked && v < 0.9) setMarked(false);
  });
  const n = rows.length;

  // the unfold: down from the middle crease, then out to both sides
  const clip = useTransform(p, (v) => {
    const a = easeOut(remap(v, 0, 0.15));
    const b = easeOut(remap(v, 0.15, 0.3));
    const y = (50 * (1 - a)).toFixed(2);
    const x = ((100 / 3) * (1 - b)).toFixed(2);
    return `inset(${y}% ${x}% ${y}% ${x}%)`;
  });
  const shade = useTransform(p, (v) => 0.7 * (1 - remap(v, 0.15, 0.3)));

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
      <div>
        <div className="relative">
          {/* the chart (decorative; ≥ 640) */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden sm:block"
            style={live ? { clipPath: clip } : undefined}
          >
            {/* border colours inline: an unlayered `* { border-color }` in
                app/globals.css outranks every Tailwind border-colour utility */}
            <div
              // no fill: the row vignettes cut their dashes with --bg
              className="absolute inset-0 border-[1.5px]"
              style={{ borderColor: "var(--w-brass)" }}
            />
            <div
              className="absolute inset-1.5 border"
              style={{ borderColor: "color-mix(in oklab, var(--w-brass) 45%, transparent)" }}
            />
            {/* the folds: full creases only where no text runs (east of the
                program); where they would cross the rows, fold marks at the
                neatline instead (no rule under text) */}
            <span className="absolute top-1.5 left-1/3 h-3 w-px bg-(--w-brass)/40" />
            <span className="absolute bottom-1.5 left-1/3 h-3 w-px bg-(--w-brass)/40" />
            <span className="absolute inset-y-1.5 left-2/3 w-px bg-(--w-brass)/15" />
            <span className="absolute top-1/2 left-1.5 h-px w-3 bg-(--w-brass)/40" />
            <span className="absolute top-1/2 right-1.5 left-2/3 h-px bg-(--w-brass)/12" />
            {live ? (
              <>
                <motion.span className="absolute inset-y-0 left-0 w-1/3 bg-bg" style={{ opacity: shade }} />
                <motion.span className="absolute inset-y-0 right-0 w-1/3 bg-bg" style={{ opacity: shade }} />
              </>
            ) : null}
            <Island className="absolute top-[16%] right-[9%] hidden w-[30%] lg:block" />
            <Rose className="absolute right-3 bottom-3 size-11" />
          </motion.div>

          <ol className="relative flex flex-col justify-center px-3 py-5 sm:px-6">
            {rows.map((row, k) => (
              <MapRow
                key={row.key}
                row={row}
                index={k}
                count={n}
                aimed={aim === k}
                x={k === 0 && (!live || marked)}
                instant={!live || reduced}
                onAim={(on) => setAim(on ? k : null)}
              />
            ))}
          </ol>
        </div>
        {caption ? (
          <CardReveal as="div" at={0.3}>
            {caption}
          </CardReveal>
        ) : null}
      </div>
    </div>
  );
}

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/** Drawn fraction of trail leg `j` (0 = landfall → the last row; the legs
 *  climb, so leg n−1 lands on row I). */
function useTrailLeg(j: number, count: number) {
  const { p } = useCard();
  const L = (TRAIL.to - TRAIL.from) / Math.max(1, count);
  return useTransform(p, (v) => remap(v, TRAIL.from + j * L, TRAIL.from + (j + 1) * L));
}

function MapRow({
  row,
  index,
  count,
  aimed,
  x,
  instant,
  onAim,
}: {
  row: OpeningRow;
  index: number;
  count: number;
  aimed: boolean;
  x: boolean;
  instant: boolean;
  onAim: (on: boolean) => void;
}) {
  const { live } = useCard();
  const last = index === count - 1;
  // the leg that climbs INTO this row from below (the landfall for the last
  // row), and whether this row's waypoint has been reached
  const arriving = useTrailLeg(count - 1 - index, count);
  const inClip = useTransform(arriving, (d) => `inset(${((1 - d) * 100).toFixed(2)}% 0 0 0)`);
  const reached = useTransform(arriving, (d) => (d >= 1 - 1e-6 ? 1 : 0.3));

  return (
    <li className="relative pl-10">
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8">
        {/* the dotted leg arriving from below: from the row beneath (its
            centre) or, for the last row, from the chart's lower edge */}
        <motion.span
          className={cn("absolute inset-x-0", last ? "top-1/2 -bottom-5" : "top-1/2 h-full")}
          style={live ? { clipPath: inClip } : undefined}
        >
          <svg viewBox="0 0 32 100" preserveAspectRatio="none" focusable="false" className="absolute inset-0 size-full overflow-visible" fill="none">
            <path
              d={LEGS[index % 2]}
              stroke="var(--w-brass)"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeDasharray="0.1 5.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.span>
        {/* the waypoint, lit when the trail reaches it */}
        <motion.span
          className="absolute top-1/2 left-[11px] size-2.5 -translate-y-1/2 rounded-full border-[1.5px] bg-bg"
          style={live ? { opacity: reached, borderColor: "var(--w-brass)" } : { borderColor: "var(--w-brass)" }}
        />
        {/* hover / focus: the waypoint is ringed on the chart */}
        <span
          className={cn(
            "absolute top-1/2 left-[5px] size-[22px] -translate-y-1/2 rounded-full border border-dashed",
            "transition-opacity duration-(--dur-micro) motion-off:transition-none",
            aimed ? "opacity-100" : "opacity-0",
          )}
          style={{ borderColor: "var(--w-brass)" }}
        />
        {index === 0 ? <XMark on={x} instant={instant} /> : null}
      </span>
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

/** The X on Act I: two brass strokes inked in turn (instant when static). */
function XMark({ on, instant }: { on: boolean; instant: boolean }) {
  const stroke = (delay: number) => ({
    strokeDashoffset: on ? 0 : 1,
    transition: instant ? "none" : `stroke-dashoffset 0.2s var(--ease-draw) ${on ? delay : 0}s`,
  });
  return (
    <svg
      viewBox="-10 -10 20 20"
      focusable="false"
      className="absolute top-1/2 left-[4px] size-6 -translate-y-1/2 overflow-visible"
      fill="none"
      stroke="var(--w-brass)"
      strokeWidth={2.4}
      strokeLinecap="round"
      data-map-x={on ? "" : undefined}
    >
      <path d="M-7 -6.5L7 7" pathLength={1} strokeDasharray="1 2" style={stroke(0)} />
      <path d="M6.5 -7L-6.5 6.5" pathLength={1} strokeDasharray="1 2" style={stroke(0.18)} />
    </svg>
  );
}

/** A plain 8-point compass rose (our own geometry; no dial, no arrow). */
function Rose({ className }: { className?: string }) {
  const pts: string[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k * 22.5 * Math.PI) / 180;
    const r = k % 4 === 0 ? 20 : k % 2 === 0 ? 11 : 4.2;
    pts.push(`${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`);
  }
  return (
    <svg viewBox="-22 -22 44 44" focusable="false" className={className} fill="none">
      <polygon points={pts.join(" ")} stroke="var(--w-brass)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle r={6.5} stroke="var(--w-brass)" strokeWidth={0.75} vectorEffect="non-scaling-stroke" opacity={0.6} />
      <path d="M0 -20V20M-20 0H20" stroke="var(--w-brass)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" opacity={0.45} />
    </svg>
  );
}

/** An island in the chart's empty east: our own coastline, one inner
 *  contour, a few offshore hatches (no names, no numbers: texture only). */
const COAST =
  "M18 52C14 40 22 27 36 24C44 22 48 14 60 13C74 12 80 22 90 26C102 31 110 40 106 52C103 61 94 64 88 72C80 82 64 84 52 80C42 77 36 70 28 67C21 64 20 58 18 52Z";
const CONTOUR =
  "M32 52C30 44 36 36 45 34C51 33 55 27 63 27C72 27 76 34 83 37C91 40 94 47 91 54C89 59 83 61 78 66C72 72 62 73 54 70C47 68 43 63 38 61C34 59 33 56 32 52Z";
function Island({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 124 96" focusable="false" className={className} fill="none" stroke="var(--w-brass)" strokeLinecap="round">
      <path d={COAST} strokeWidth={1.1} vectorEffect="non-scaling-stroke" opacity={0.75} />
      <path d={CONTOUR} strokeWidth={0.75} vectorEffect="non-scaling-stroke" strokeDasharray="3 3" opacity={0.4} />
      <path
        d="M6 30h7M3 36h6M110 20h8M114 26h6M112 74h7M116 80h5M8 76h6M12 82h5"
        strokeWidth={0.75}
        vectorEffect="non-scaling-stroke"
        opacity={0.45}
      />
    </svg>
  );
}
