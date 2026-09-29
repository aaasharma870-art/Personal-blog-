"use client";

import type { CSSProperties } from "react";
import type { MotionValue } from "motion/react";
import { DrawPath } from "@/components/primitives/loaders/kit";
import { GaugeDrawing } from "@/components/primitives/loaders/gauge";
import { LINE, LINE_FIG, LINE_VIEWBOX } from "@/components/primitives/loaders/line";
import { anchor, anchorRect, plateViewBox, type Plate } from "@/components/sections/act-card/plate";

/**
 * FIG. 0 CHALKED ON THE ICE BOARD (Card I→II, both variants; RECOGNIZABILITY
 * S07: "FIG. 0, the Line, is drawn in chalk on the board region, measured
 * from the plate, with the chalk gear gauge at its left end; Rancho's chalk
 * circle closes the end tick; the FIG labels stay HTML Meta").
 *
 * The board is a quadrilateral on the plate (lib/media.ts anchors of the
 * plate ACTUALLY rendered: `rects.boardRect` for the top edge and the
 * sides, `marks.ledgeL` / `ledgeR` for the chalk ledge, which slants in
 * perspective). Everything here is drawn in plate pixels inside a PlateBox
 * and mapped onto that quad BILINEARLY (a mild trapezoid: straight rows
 * and columns stay straight), so the chalk sits on the slate at 3:2 and
 * 2.39:1 alike. The labels and the gauge (HTML/SVG boxes) take the
 * ledge's slant as a skewY. Its numbers are the drawn path's TRUE length
 * and control-point count (LINE_FIG, computed; never literal).
 *
 * `fig` 0–1 draws the Line (DrawPath; static → drawn with non-scaling
 * strokes), `rack` drives the gauge (the card's p: L1 exact kinematics),
 * `circle` draws Rancho's circle. aria-hidden (the card is labelled).
 */

type Q = { tl: [number, number]; tr: [number, number]; bl: [number, number]; br: [number, number] };

/** The slate quad in plate PIXELS, or null when the plate has no board. */
export function boardQuad(p: Plate): Q | null {
  const r = anchorRect(p, "boardRect");
  if (!r) return null;
  const W = p.asset.width;
  const H = p.asset.height;
  const l = anchor(p, "ledgeL", [r.x0, r.y1]) ?? [r.x0, r.y1];
  const rr = anchor(p, "ledgeR", [r.x1, r.y1]) ?? [r.x1, r.y1];
  return {
    tl: [r.x0 * W, r.y0 * H],
    tr: [r.x1 * W, r.y0 * H],
    bl: [l[0] * W, l[1] * H],
    br: [rr[0] * W, rr[1] * H],
  };
}

/** Bilinear map of board-local (u, v) ∈ [0, 1]² onto the quad. */
function onBoard(q: Q, u: number, v: number): [number, number] {
  const top = [q.tl[0] + (q.tr[0] - q.tl[0]) * u, q.tl[1] + (q.tr[1] - q.tl[1]) * u];
  const bot = [q.bl[0] + (q.br[0] - q.bl[0]) * u, q.bl[1] + (q.br[1] - q.bl[1]) * u];
  return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
}

/** Where the FIG sits on the slate (board-local u / v; the ledge is v = 1). */
const FIG = { u0: 0.24, u1: 0.95, v0: 0.12, v1: 0.8 };
/** The gauge's box on the slate (the FIG's left end, bottom-left). */
const GAUGE = { u0: 0.04, u1: 0.22, v0: 0.56, v1: 0.93 };
/** The label (FIG. 0 • …) at the slate's top-left. */
const LABEL = { u: 0.04, v: 0.07 };
/** The dimension line under the Line (Line space). */
const DIM_Y = LINE_VIEWBOX.h - 24;
const DIM_X0 = 40;
const DIM_X1 = 952;

/** A Line-space point on the board. */
function figPoint(q: Q, x: number, y: number): [number, number] {
  const u = FIG.u0 + (FIG.u1 - FIG.u0) * (x / LINE_VIEWBOX.w);
  const v = FIG.v0 + (FIG.v1 - FIG.v0) * (y / LINE_VIEWBOX.h);
  return onBoard(q, u, v);
}

const f1 = (n: number) => n.toFixed(1);

function poly(pts: [number, number][]): string {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join("");
}

/** The projected Line and its dimension furniture, cached per quad key. */
const cache = new Map<string, { line: string; dims: string; angle: number }>();
function figPaths(q: Q) {
  const key = [q.tl, q.tr, q.bl, q.br].flat().map(f1).join(",");
  const hit = cache.get(key);
  if (hit) return hit;
  const line = poly(Array.from({ length: 161 }, (_, k) => {
    const pt = LINE.at(k / 160);
    return figPoint(q, pt.x, pt.y);
  }));
  const seg = (x0: number, y0: number, x1: number, y1: number) => poly([figPoint(q, x0, y0), figPoint(q, x1, y1)]);
  const a = LINE.at(0);
  const b = LINE.at(1);
  const dims = [
    seg(DIM_X0, DIM_Y, DIM_X1, DIM_Y),
    seg(DIM_X0, DIM_Y - 8, DIM_X0, DIM_Y + 8),
    seg(DIM_X1, DIM_Y - 8, DIM_X1, DIM_Y + 8),
    seg(a.x, a.y + 10, a.x, DIM_Y - 12),
    seg(Math.max(b.x, 952), 214, Math.max(b.x, 952), DIM_Y - 12),
  ].join("");
  // the ledge's slant (the board's horizontal in perspective), in degrees
  const angle = (Math.atan2(q.br[1] - q.bl[1], q.br[0] - q.bl[0]) * 180) / Math.PI;
  const out = { line, dims, angle };
  cache.set(key, out);
  return out;
}

export function BoardFig({
  plate,
  fig,
  rack,
  spin,
  circle,
  live,
  dimOpacity = 0.75,
}: {
  plate: Plate;
  fig: MotionValue<number>;
  rack: MotionValue<number>;
  spin: MotionValue<number>;
  circle: MotionValue<number>;
  /** false → the static composition (drawn, non-scaling strokes). */
  live: boolean;
  dimOpacity?: number;
}) {
  const q = boardQuad(plate);
  if (!q) return null;
  const { line, dims, angle } = figPaths(q);
  const W = plate.asset.width;
  const H = plate.asset.height;
  const pct = (x: number, y: number) => ({ left: `${((x / W) * 100).toFixed(3)}%`, top: `${((y / H) * 100).toFixed(3)}%` });
  const g0 = onBoard(q, GAUGE.u0, GAUGE.v0);
  const g1 = onBoard(q, GAUGE.u1, GAUGE.v0);
  const gw = Math.hypot(g1[0] - g0[0], g1[1] - g0[1]);
  const lab = onBoard(q, LABEL.u, LABEL.v);
  const skew = `skewY(${angle.toFixed(2)}deg)`;
  // px per plate unit at 1440 wide (the live card): chalk ~2.5 px on screen
  const chalk = W * 0.0018;
  const figLabel = `FIG. 0 • THE LINE • L = ${LINE_FIG.length} • ${LINE_FIG.controlPoints} CONTROL POINTS`;

  return (
    <>
      <svg
        viewBox={plateViewBox(plate)}
        preserveAspectRatio="none"
        focusable="false"
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* dimension line, end ticks, extension lines: thin chalk */}
        <path
          d={dims}
          stroke="var(--w-chalk)"
          strokeOpacity={dimOpacity}
          strokeWidth={live ? chalk * 0.45 : 1}
          vectorEffect={live ? undefined : "non-scaling-stroke"}
        />
        {/* the Line in chalk: a firm stroke and a lighter offset twin (the
            grain of a chalk line, without a per-frame filter) */}
        {live ? (
          <g stroke="var(--w-chalk)">
            <DrawPath d={line} progress={fig} strokeWidth={chalk} strokeOpacity={0.93} />
            <g transform={`translate(${f1(chalk * 0.6)} ${f1(-chalk * 0.45)})`}>
              <DrawPath d={line} progress={fig} strokeWidth={chalk * 0.45} strokeOpacity={0.35} />
            </g>
          </g>
        ) : (
          <g stroke="var(--w-chalk)" vectorEffect="non-scaling-stroke">
            <path d={line} strokeWidth={2.2} strokeOpacity={0.93} vectorEffect="non-scaling-stroke" />
            <path
              d={line}
              transform={`translate(${f1(chalk * 0.6)} ${f1(-chalk * 0.45)})`}
              strokeWidth={1}
              strokeOpacity={0.35}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>

      {/* the chalk gear gauge (LD-3I, exact kinematics), on the slate */}
      <div
        className="pointer-events-none absolute origin-top-left"
        style={
          {
            ...pct(g0[0], g0[1]),
            width: `${((gw / W) * 100).toFixed(3)}%`,
            transform: skew,
            "--w-bp-line": "var(--w-chalk)",
          } as CSSProperties
        }
      >
        <GaugeDrawing
          // useTransform binds one source: remount when static ↔ live
          key={live ? "live" : "static"}
          progress={rack}
          spin={spin}
          circle={circle}
          scale={1}
        />
      </div>

      {/* FIG. 0's label: HTML Meta, chalk-white on the slate (≥ 640) */}
      <p
        className="type-meta pointer-events-none absolute hidden origin-top-left whitespace-nowrap text-(--w-chalk) sm:block"
        style={{ ...pct(lab[0], lab[1]), transform: skew }}
      >
        {figLabel}
      </p>
    </>
  );
}
