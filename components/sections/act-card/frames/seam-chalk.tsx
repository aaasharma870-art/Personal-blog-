"use client";

import { useId, useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import type { MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, hash01, useSvgAttr } from "@/components/primitives/loaders/kit";
import { GaugeDrawing } from "@/components/primitives/loaders/gauge";
import { LINE_D, LINE_FIG, LINE_VIEWBOX, remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";
import { BoardFig } from "@/components/sections/act-card/frames/board-fig";
import { registeredStorm, useRanchoCircle } from "@/components/sections/act-card/frames/seam";
import { PlateBox, plateOf } from "@/components/sections/act-card/plate";

/**
 * Card I→II, ALT choreography "duster-erase" (lib/variants.ts
 * `card-seam.choreo` alt; SM-5, D-5 long #1; RECOGNIZABILITY S07 alt). The
 * DEFAULT cuts the storm away like ice; this one wipes it off a classroom
 * board: a chalk duster erases the storm (MV-04-alt) in five boustrophedon
 * strokes (left → right, then back), and the ICE lecture hall's green board
 * (iconic-ice-alt) was underneath all along — "THE ICE BOARD, WIPED CLEAN". One pinned driver p (direct,
 * no springs; everything reverses by position):
 *   0–.08    the storm plate, still (MV-04; until it exists, MV-01 in the
 *            code storm grade).
 *   .08–.78  the duster: five strokes, .14 of p each, top band first; the
 *            erased region is a clip whose ragged leading edge rides the
 *            duster, and the wiped bands keep a faint chalk-dust streak.
 *   .5–.9    FIG. 0, the Line, is written in CHALK on the board
 *            (frames/board-fig.tsx: registered to the plate's board quad);
 *            its label carries the path's TRUE length and control-point
 *            count (computed, never literal). LD-3I in chalk: the rack
 *            x = p·L, the gears exact.
 *   ≥ .95    Rancho's chalk circle round the gauge's end tick (re-arms only
 *            below .9), as in the default.
 * No aqua seam line in this variant (C10: 0 aqua marks at any p). The
 * clip and the duster exist only while live (the storm is mounted hidden,
 * as in the default, so it has decoded before the card goes live). Static card
 * (RM, Pause, no JS, < 1024 / coarse, SSR): the wiped board — the ICE
 * hall, chalk FIG. 0, the gauge complete with its circle, the dust streaks.
 * aria-hidden art; 0 tab stops.
 */

const VB = { w: 1000, h: 418 };
const BANDS = 5;
const BAND_H = VB.h / BANDS;
const WIPE = { from: 0.08, per: 0.14 };
const OVERSHOOT = 60;

/** The wavy boundary between band k−1 and band k (k = 1…4); 0 and 5 are
 *  the frame edges. Deterministic (hash), so SSR == client. */
function boundaryY(k: number, x: number): number {
  if (k <= 0) return -2;
  if (k >= BANDS) return VB.h + 2;
  return k * BAND_H + 3.2 * Math.sin(x * 0.019 + k * 1.7) + 2.2 * Math.sin(x * 0.053 + k);
}

/** Points along boundary k from x0 to x1 (either direction). */
function along(k: number, x0: number, x1: number): string {
  const n = Math.max(2, Math.ceil(Math.abs(x1 - x0) / 25));
  const out: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    out.push(`${x.toFixed(1)} ${boundaryY(k, x).toFixed(1)}`);
  }
  return out.join("L");
}

/** The duster's ragged leading edge in band k at head x, top → bottom. */
function edgePts(k: number, hx: number, dir: 1 | -1): [number, number][] {
  const y0 = boundaryY(k, hx);
  const y1 = boundaryY(k + 1, hx);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const y = y0 + ((y1 - y0) * i) / 8;
    const jitter = (hash01(i + k * 11, 5) - 0.5) * 16;
    // the duster is held at a slant: the lower end trails
    const slant = (y - (y0 + y1) / 2) * 0.18 * -dir;
    pts.push([hx + jitter + slant, y]);
  }
  return pts;
}

type Wipe = { k: number; h: number; dir: 1 | -1; hx: number };

function wipeAt(p: number): Wipe {
  const t = (p - WIPE.from) / WIPE.per;
  const k = Math.min(BANDS - 1, Math.max(0, Math.floor(t)));
  const h = Math.min(1, Math.max(0, t - k));
  const dir: 1 | -1 = k % 2 === 0 ? 1 : -1;
  const span = VB.w + 2 * OVERSHOOT;
  const hx = dir === 1 ? -OVERSHOOT + h * span : VB.w + OVERSHOOT - h * span;
  return { k, h: t < 0 ? 0 : t >= BANDS ? 1 : h, dir, hx };
}

/** The region still under the storm (the clip of the storm layer). */
function stormPath(p: number): string {
  if (p <= WIPE.from) return `M-2 -2H${VB.w + 2}V${VB.h + 2}H-2Z`;
  if (p >= WIPE.from + WIPE.per * BANDS) return "M0 0Z";
  const { k, dir, hx } = wipeAt(p);
  const E = edgePts(k, hx, dir);
  const far = dir === 1 ? VB.w + 2 : -2;
  // the current band, from the leading edge to the far side
  const band = `M${E[0][0].toFixed(1)} ${E[0][1].toFixed(1)}L${along(k, E[0][0], far)}L${along(k + 1, far, E[8][0])}${E.slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("")}Z`;
  // every band below it, whole
  const below = k + 1 < BANDS ? `M-2 ${boundaryY(k + 1, -2).toFixed(1)}L${along(k + 1, -2, VB.w + 2)}L${VB.w + 2} ${VB.h + 2}H-2Z` : "";
  return band + below;
}

/** The wiped region (where the chalk dust streaks lie). */
function dustPath(p: number): string {
  if (p <= WIPE.from) return "M0 0Z";
  if (p >= WIPE.from + WIPE.per * BANDS) return `M-2 -2H${VB.w + 2}V${VB.h + 2}H-2Z`;
  const { k, dir, hx } = wipeAt(p);
  const E = edgePts(k, hx, dir);
  const near = dir === 1 ? -2 : VB.w + 2;
  const above = k > 0 ? `M-2 -2H${VB.w + 2}V${boundaryY(k, VB.w + 2).toFixed(1)}L${along(k, VB.w + 2, -2)}Z` : "";
  const band = `M${E[0][0].toFixed(1)} ${E[0][1].toFixed(1)}L${along(k, E[0][0], near)}L${along(k + 1, near, E[8][0])}${E.slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("")}Z`;
  return above + band;
}

/* — FIG. 0 geometry (the default's blueprint, the Line set in chalk) — */
const W = LINE_VIEWBOX.w;
const H = Math.round(W / 2.39);
const DIM_Y = LINE_VIEWBOX.h - 24;
const DIM_X0 = 40;
const DIM_X1 = 952;

export function SeamChalkFrame({
  storm: stormId,
  board: boardId = null,
  graded,
}: {
  storm: MediaId | null;
  /** The ICE board the duster uncovers (iconic-ice-alt); null → the code
   *  blueprint (the lab's old call). */
  board?: MediaId | null;
  graded: boolean;
}) {
  const { p, live } = useCard();
  const reduced = useReducedMotion();
  const ids = useId();
  const clipId = `${ids}c`;
  const dustId = `${ids}d`;
  const board = plateOf(boardId);
  const storm = registeredStorm(stormId, board);

  const fig = useTransform(p, (v) => remap(v, 0.5, 0.9));
  const { circle, spin, one } = useRanchoCircle(p, live, reduced);

  const figLabel = `FIG. 0 • THE LINE • L = ${LINE_FIG.length} • ${LINE_FIG.controlPoints} CONTROL POINTS`;

  return (
    <div aria-hidden="true" data-frame="seam-chalk" className="absolute inset-0 overflow-hidden">
      {/* the board: the ICE lecture hall's green board (iconic-ice-alt),
          with FIG. 0 written on it in chalk */}
      {board ? (
        <PlateBox plate={board}>
          <MediaFrame media={board.asset.id} layout="fill" playOn="never" sizes="100vw" />
          <BoardFig plate={board} fig={live ? fig : one} rack={live ? p : one} spin={spin} circle={circle} live={live} />
        </PlateBox>
      ) : (
        <div className="act-blueprint absolute inset-0">
          <svg
            viewBox={`0 ${-(H - LINE_VIEWBOX.h) / 2} ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            className="absolute inset-0 size-full"
            fill="none"
            strokeLinecap="round"
          >
            <path
              d={`M${DIM_X0} ${DIM_Y}H${DIM_X1}M${DIM_X0} ${DIM_Y - 8}V${DIM_Y + 8}M${DIM_X1} ${DIM_Y - 8}V${DIM_Y + 8}M${DIM_X0} 300V${DIM_Y - 12}M${DIM_X1} 214V${DIM_Y - 12}`}
              stroke="var(--w-bp-line)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeOpacity={0.7}
              strokeLinecap="square"
            />
            <ChalkLine progress={live ? fig : one} />
          </svg>
          <div className="absolute bottom-[7%] left-gutter w-[clamp(9rem,22%,15rem)]">
            <GaugeDrawing
              // useTransform binds one source: remount when static ↔ live
              key={live ? "live" : "static"}
              progress={live ? p : one}
              spin={spin}
              circle={circle}
              scale={1.5}
            />
          </div>
          <p className="type-meta absolute top-[6%] left-gutter hidden text-fg sm:block">{figLabel}</p>
        </div>
      )}

      {/* the chalk dust the duster leaves on the wiped bands */}
      <DustLayer p={live ? p : one} id={dustId} />

      {/* the storm, still under the duster's clip (mounted even while
          static, hidden, so the plate is decoded before the card goes live) */}
      {live ? <StormClip p={p} id={clipId} /> : null}
      <div
        className="absolute inset-0"
        style={live ? { clipPath: `url(#${clipId})` } : { display: "none" }}
      >
        {storm ? (
          <PlateBox plate={storm} className={cn(graded && "act-storm-grade")}>
            <MediaFrame media={storm.asset.id} layout="fill" playOn="never" sizes="100vw" />
          </PlateBox>
        ) : null}
      </div>
      {live ? <Duster p={p} /> : null}
    </div>
  );
}

/** FIG. 0 in chalk: a firm stroke and a lighter offset twin (the grain of a
 *  chalk line, without a per-frame filter). */
function ChalkLine({ progress }: { progress: MotionValue<number> }) {
  return (
    <g stroke="var(--w-chalk)">
      <DrawPath d={LINE_D} progress={progress} strokeWidth={2.4} strokeOpacity={0.92} />
      <g transform="translate(1.6 -1.2)">
        <DrawPath d={LINE_D} progress={progress} strokeWidth={1.2} strokeOpacity={0.35} />
      </g>
    </g>
  );
}

/** The storm layer's clip (objectBoundingBox; the path is in VB units). */
function StormClip({ p, id }: { p: MotionValue<number>; id: string }) {
  const ref = useRef<SVGPathElement>(null);
  const d = useSvgAttr(ref, p, "d", stormPath);
  return (
    <svg width="0" height="0" focusable="false" className="absolute">
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path ref={ref} d={d} transform={`scale(${1 / VB.w} ${1 / VB.h})`} />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Chalk-dust streaks on the wiped region: a pattern of thin horizontal
 *  chalk strokes at low opacity (a smear, never a glow). */
function DustLayer({ p, id }: { p: MotionValue<number>; id: string }) {
  const ref = useRef<SVGPathElement>(null);
  const d = useSvgAttr(ref, p, "d", dustPath);
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="none"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <defs>
        <pattern id={id} width={430} height={27} patternUnits="userSpaceOnUse">
          <path
            d="M0 4H96M128 3.4H300M340 4.6H430M34 11H150M196 10.4H262M300 11.6H404M0 18.6H58M92 19H236M268 18.2H330M60 24.4H170M232 25H390"
            stroke="var(--w-chalk)"
            strokeWidth={1.6}
            fill="none"
          />
        </pattern>
      </defs>
      <path ref={ref} d={d} fill={`url(#${id})`} opacity={0.055} />
    </svg>
  );
}

/** The duster: a felt pad on a wooden back, riding the leading edge of the
 *  current stroke (only while a stroke is in progress). */
function Duster({ p }: { p: MotionValue<number> }) {
  const ref = useRef<SVGGElement>(null);
  const place = (v: number) => {
    const { k, dir, hx, h } = wipeAt(v);
    const cy = (boundaryY(k, hx) + boundaryY(k + 1, hx)) / 2;
    return `translate(${hx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(8 * -dir).toFixed(1)}) scale(${dir} 1)${h <= 0 || h >= 1 ? " scale(0)" : ""}`;
  };
  const t = useSvgAttr(ref, p, "transform", place);
  const shown = useTransform(p, (v) => (v > WIPE.from && v < WIPE.from + WIPE.per * BANDS ? 1 : 0));
  return (
    <motion.svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="none"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full"
      style={{ opacity: shown }}
    >
      <g ref={ref} transform={t}>
        {/* felt pad (leading) and the wooden back (trailing); drawn for a
            left → right stroke and mirrored for the return */}
        <rect x={-4} y={-40} width={14} height={80} rx={3} fill="var(--bg)" stroke="var(--w-chalk)" strokeOpacity={0.7} strokeWidth={1.2} />
        <rect x={-22} y={-36} width={18} height={72} rx={4} fill="var(--w-graphite)" fillOpacity={0.55} stroke="var(--w-graphite)" strokeWidth={1.2} />
        <path d="M-17 -26V26M-11 -26V26" stroke="var(--bg)" strokeOpacity={0.5} strokeWidth={1} />
      </g>
    </motion.svg>
  );
}
