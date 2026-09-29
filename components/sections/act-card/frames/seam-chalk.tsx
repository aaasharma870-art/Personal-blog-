"use client";

import { useMemo, useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import type { MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, hash01, useSvgAttr } from "@/components/primitives/loaders/kit";
import { GaugeDrawing } from "@/components/primitives/loaders/gauge";
import { LINE_D, LINE_FIG, LINE_VIEWBOX, remap, smooth01 } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";
import { BoardDrone, boardQuad, onBoard, poly, type BoardQuad } from "@/components/sections/act-card/frames/board-fig";
import { registeredStorm, useRanchoCircle } from "@/components/sections/act-card/frames/seam";
import { PlateBox, plateOf, plateViewBox, type Plate } from "@/components/sections/act-card/plate";

/**
 * Card I→II, ALT choreography "duster-erase" (lib/variants.ts
 * `card-seam.choreo` alt; SM-5, D-5 long #1; RECOGNIZABILITY S07 alt). The
 * DEFAULT cuts the storm away like ice and chalks FIG. 0 on the board; this
 * one WIPES the storm off a classroom board, and leaves the board clean —
 * "THE ICE BOARD, WIPED CLEAN". One pinned driver p (direct, no springs;
 * everything reverses by position):
 *   0–.06    the storm plate (MV-04-alt), still.
 *   .06–.66  ONE sweep, left → right: the storm's leading edge is a soft
 *            DIAGONAL (a 110° linear mask, ~16 % of the frame feathered —
 *            never a torn strip, M2 ART-DIRECTOR #7) and a chalk duster,
 *            held at the edge's slant, rides it, scrubbing up and down
 *            along it. The ICE lecture hall (iconic-ice-alt) was underneath
 *            all along. At the middle (p .5) the hall and most of the board
 *            are wiped, the storm still over the right quarter — both
 *            worlds, the new one leading (ART-DIRECTOR #6).
 *   ≥ .66    the storm is WIPED OFF the board, and under it is THE
 *            HOMEMADE DRONE, chalked big in the middle of the slate (M2
 *            critic 3 / blind: the bare hall scored 3I .55), among the
 *            duster's soft arcs of chalk dust — all drawn inside the board
 *            quad of the plate (frames/board-fig.tsx), never across the walls
 *            or the benches (ART-DIRECTOR #15). No FIG. 0 here; the caption
 *            names what is on the board (cap.act-2.alt, ART-DIRECTOR #9).
 * No aqua in this variant (C10: 0 aqua marks at any p). The sweep and the
 * duster exist only while live (the storm is mounted hidden, as in the
 * default, so it has decoded before the card goes live). Static card (RM,
 * Pause, no JS, < 1024 / coarse, SSR): the wiped board — the ICE hall, the
 * clean slate with its dust arcs. aria-hidden art; 0 tab stops.
 *
 * No `board` (the lab's old call, or the plate missing): the code blueprint
 * with FIG. 0 in chalk and the chalk gauge (Rancho's circle at ≥ .95).
 */

const VB = { w: 1000, h: 418 };
/** The sweep's window of p. */
const SWEEP = { from: 0.06, to: 0.66 };
/** The drone, centred on the ALT board's visible slate (board-local u / v;
 *  u-width chosen so the sketch keeps its own aspect on this quad). */
const DRONE_ALT = { u0: 0.37, u1: 0.63, v0: 0.06, v1: 0.95 };

/* — The feathered diagonal edge (CSS mask, geometry for 2.39:1: the sweep
     runs only live, and live is ≥ 1024). A 110° gradient in a mask three
     frames wide: at mask-position-x = px the edge's centre (t = .5) crosses
     the frame's middle row at u = 1.5 − 2·px (frame widths); the 5 %
     feather is ±.079 frame widths, the slant ±.076 top to bottom. px .83
     keeps the whole frame under the storm, .17 has wiped all of it. — */
const ANGLE = 110;
const MASK = `linear-gradient(${ANGLE}deg, transparent 47.5%, #000 52.5%)`;
const pxAt = (w: number) => 0.83 - 0.66 * w;
/** The edge's x (frame widths) at frame row y (0–1) for mask position px. */
const SLOPE = (Math.cos((ANGLE * Math.PI) / 180) / Math.sin((ANGLE * Math.PI) / 180)) * (VB.h / VB.w);
const edgeX = (px: number, y: number) => 1.5 - 2 * px + SLOPE * (y - 0.5);

/** The duster scrubs up and down the edge as it crosses (3 passes). */
const scrubY = (w: number) => 0.5 + 0.32 * Math.sin(w * Math.PI * 6);

/* — FIG. 0 geometry for the code blueprint fallback (the Line in chalk) — */
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
  const board = plateOf(boardId);
  const storm = registeredStorm(stormId, board);

  const w = useTransform(p, (v) => remap(v, SWEEP.from, SWEEP.to));
  // the storm enters tilted up (its crest in the frame's top half, under the
  // outgoing caption) and settles onto its registration as the sweep starts
  // (M2 critic 3 #3); ≤ .11 keeps its box over the whole frame (no inset here)
  const stormY = useTransform(p, (v) => `${(-11 * (1 - smooth01(remap(v, 0, 0.1)))).toFixed(3)}%`);
  // the masked layer is three frames wide with its mask fixed, and slides
  // left by 2·px frames (a composited transform, never a mask-position
  // re-draw); the storm inside is counter-moved, so only the edge travels
  const maskX = useTransform(w, (x) => `${((-2 * pxAt(x)) / 3) * 100}%`);
  const stormX = useTransform(w, (x) => `${(200 * pxAt(x)).toFixed(3)}%`);
  // belt and braces: a finished sweep hides the storm outright
  const stormOn = useTransform(w, (x) => (x >= 1 ? 0 : 1));

  return (
    <div aria-hidden="true" data-frame="seam-chalk" className="absolute inset-0 overflow-hidden">
      {/* the board: the ICE lecture hall's green board (iconic-ice-alt),
          wiped clean — the duster's dust arcs on the slate only */}
      {board ? (
        <PlateBox plate={board}>
          <MediaFrame media={board.asset.id} layout="fill" playOn="never" sizes="100vw" />
          <DustArcs plate={board} />
          <BoardDrone plate={board} box={DRONE_ALT} live={false} />
        </PlateBox>
      ) : (
        <ChalkBlueprint p={p} live={live} reduced={reduced} />
      )}

      {/* the storm, under the duster's feathered diagonal edge (mounted even
          while static, hidden, so the plate is decoded before the card goes
          live) */}
      <motion.div
        className={live ? "absolute inset-y-0 left-0 w-[300%] will-change-transform" : "absolute inset-0"}
        style={
          live
            ? {
                x: maskX,
                opacity: stormOn,
                maskImage: MASK,
                WebkitMaskImage: MASK,
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }
            : { display: "none" }
        }
      >
        {storm ? (
          <motion.div
            className={live ? "absolute inset-y-0 left-0 w-1/3 will-change-transform" : "absolute inset-0"}
            style={live ? { x: stormX, y: stormY } : undefined}
          >
            <PlateBox plate={storm} className={cn(graded && "act-storm-grade")}>
              <MediaFrame media={storm.asset.id} layout="fill" playOn="never" sizes="100vw" />
            </PlateBox>
          </motion.div>
        ) : null}
      </motion.div>
      {live ? <Duster w={w} /> : null}
    </div>
  );
}

/** No `board`: the code blueprint with FIG. 0 in chalk and the chalk gauge
 *  (Rancho's circle at ≥ .95). Its drivers live here, so the board path
 *  (production) never runs them. */
function ChalkBlueprint({ p, live, reduced }: { p: MotionValue<number>; live: boolean; reduced: boolean }) {
  const fig = useTransform(p, (v) => remap(v, 0.5, 0.9));
  const { circle, spin, one } = useRanchoCircle(p, live, reduced);
  const figLabel = `FIG. 0 • THE LINE • L = ${LINE_FIG.length} • ${LINE_FIG.controlPoints} CONTROL POINTS`;
  return (
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
  );
}

/** FIG. 0 in chalk: a firm stroke and a lighter offset twin (the grain of a
 *  chalk line, without a per-frame filter). The blueprint fallback only. */
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

/* — The duster's dust on the wiped slate: three soft, broad arcs (the pad's
     scrubbing path), in board-local (u, v) mapped onto the plate's board
     quad — so they lie ON the slate at 3:2 and 2.39:1 alike, and nowhere
     else. A smear, never a glow: chalk at ≤ 9 %, softened by a static blur. — */
const ARCS = [0, 1, 2].map((k) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const u = 0.03 + (0.94 * i) / 40;
    const v = 0.22 + 0.28 * k + 0.09 * Math.sin(u * Math.PI * 3 + k * 1.3) + (hash01(i + 7 * k, 9) - 0.5) * 0.015;
    pts.push([u, v]);
  }
  return { pts, o: 0.06 + 0.03 * hash01(k, 2) };
});

function arcPath(q: BoardQuad, pts: [number, number][]): string {
  return poly(pts.map(([u, v]) => onBoard(q, u, v)));
}

/** The arcs on a plate's board quad (null: no board): their paths and the
 *  pad's width (~a fifth of the slate's height, in plate pixels). The quad
 *  is a function of the asset alone, so this keys on the plate's id. */
function dustArt(id: MediaId): { paths: string[]; slateH: number } | null {
  const plate = plateOf(id);
  const q = plate ? boardQuad(plate) : null;
  if (!q) return null;
  const slateH = (q.bl[1] - q.tl[1] + (q.br[1] - q.tr[1])) / 2;
  return { paths: ARCS.map((a) => arcPath(q, a.pts)), slateH };
}

function DustArcs({ plate }: { plate: Plate }) {
  const id = plate.asset.id;
  const art = useMemo(() => dustArt(id), [id]);
  if (!art) return null;
  const { paths, slateH } = art;
  return (
    <svg
      viewBox={plateViewBox(plate)}
      preserveAspectRatio="none"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full blur-[2px]"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ARCS.map((a, k) => (
        <path key={k} d={paths[k]} stroke="var(--w-chalk)" strokeOpacity={a.o} strokeWidth={slateH * 0.2} />
      ))}
    </svg>
  );
}

/** The duster: a felt pad on a wooden back, held at the edge's slant and
 *  riding its centre line left → right (only while the sweep runs). */
function Duster({ w }: { w: MotionValue<number> }) {
  const ref = useRef<SVGGElement>(null);
  const tilt = (Math.atan(-SLOPE * (VB.w / VB.h)) * 180) / Math.PI;
  const place = (x: number) => {
    const y = scrubY(x);
    const u = edgeX(pxAt(x), y);
    return `translate(${(u * VB.w).toFixed(1)} ${(y * VB.h).toFixed(1)}) rotate(${tilt.toFixed(2)})`;
  };
  const t = useSvgAttr(ref, w, "transform", place);
  const shown = useTransform(w, (x) => Math.min(remap(x, 0, 0.04), 1 - remap(x, 0.96, 1)));
  return (
    <motion.svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="none"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full will-change-[opacity]"
      style={{ opacity: shown }}
    >
      <g ref={ref} transform={t}>
        {/* felt pad (leading, toward the storm) and the wooden back */}
        <rect x={-4} y={-40} width={14} height={80} rx={3} fill="var(--bg)" stroke="var(--w-chalk)" strokeOpacity={0.7} strokeWidth={1.2} />
        <rect x={-22} y={-36} width={18} height={72} rx={4} fill="var(--w-graphite)" fillOpacity={0.55} stroke="var(--w-graphite)" strokeWidth={1.2} />
        <path d="M-17 -26V26M-11 -26V26" stroke="var(--bg)" strokeOpacity={0.5} strokeWidth={1} />
      </g>
    </motion.svg>
  );
}
