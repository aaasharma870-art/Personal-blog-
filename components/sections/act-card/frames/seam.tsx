"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, easeDraw } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath } from "@/components/primitives/loaders/kit";
import { GaugeDrawing } from "@/components/primitives/loaders/gauge";
import { LINE_D, LINE_FIG, LINE_VIEWBOX, remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * Card I→II "Storm → Blueprint" (SM-5, kind `seam`, D-5 long #1;
 * noise-order-seam.BAR §3A). One driver p (pinned ≤ 60vh on a desktop fine
 * pointer, direct, no springs):
 *   0–.15   the frame opens inset(8%) → 0 on the storm plate (MV-04; until it
 *           exists, MV-01 in a code "storm grade").
 *   .15–.75 the IceCut: a ragged-diagonal mask wipes the storm into the code
 *           blueprint ground (--bp-panel + a 24 px grid at 6%), order rising
 *           from below; opposing parallax (outgoing −.4·p²·H, incoming
 *           +.4·(1−p)²·H); the 3 px aqua seam line rides the cut for
 *           .1 < p < .9 only (the viewport's one aqua). FIG. 0 — the Line in
 *           blueprint — draws with pathLength = remap(p, .2, .75), labelled
 *           with its TRUE length and control-point count (computed from the
 *           path, never literal). LD-3I: the rack x = p·L, the gears exact.
 *   ≥ .95   one chalk circle (Rancho's circle) around the gauge's end tick.
 * Static card (RM, Pause, no JS, < 1024 / coarse, SSR): the blueprint with
 * FIG. 0 drawn and the gauge complete with its circle. aria-hidden art.
 */

const W = LINE_VIEWBOX.w;
const H = Math.round(W / 2.39);
/** The FIG's dimension line under the Line (Line space). */
const DIM_Y = LINE_VIEWBOX.h - 24;
const DIM_X0 = 40;
const DIM_X1 = 952;

/* — The IceCut edge: a ragged diagonal in a 100 × 300 box (the mask image
     is three frames tall; the edge sits in the middle third). Deterministic
     jitter (a hash, never Math.random: SSR == client). — */
const EDGE_POINTS = (() => {
  const pts: [number, number][] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    let h = Math.imul(i + 17, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca77);
    const j = (((h ^ (h >>> 13)) >>> 0) % 1000) / 1000 - 0.5;
    const y = 162 - (i / n) * 24 + j * (i % 3 === 0 ? 7 : 3.5);
    pts.push([x, y]);
  }
  return pts;
})();
const EDGE_LINE = EDGE_POINTS.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
const EDGE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 300' preserveAspectRatio='none'><path d='${EDGE_LINE}L100 300L0 300Z' fill='#fff'/></svg>`,
)}")`;
/** mask-position-y (0–1) for the wipe fraction w: the edge rises from just
 *  below the frame (w = 0) to just above it (w = 1). */
const cutAt = (w: number) => 0.2 + 0.6 * w;

export function SeamFrame({ storm, graded }: { storm: MediaId; graded: boolean }) {
  const { p, live } = useCard();
  const reduced = useReducedMotion();

  const open = useTransform(p, (v) => `inset(${(8 * (1 - remap(v, 0, 0.15))).toFixed(2)}%)`);
  const outY = useTransform(p, (v) => `${(-40 * v * v).toFixed(3)}%`);
  const inY = useTransform(p, (v) => `${(40 * (1 - v) * (1 - v)).toFixed(3)}%`);
  const cut = useTransform(p, (v) => cutAt(remap(v, 0.15, 0.75)));
  const maskY = useTransform(cut, (c) => `0% ${(c * 100).toFixed(3)}%`);
  const lineY = useTransform(cut, (c) => `${((-2 * c) / 3) * 100}%`);
  const lineOn = useTransform(p, (v) => (v > 0.1 && v < 0.9 ? 1 : 0));
  const fig = useTransform(p, (v) => remap(v, 0.2, 0.75));

  // Rancho's circle at p ≥ .95 (state-driven; re-arms only below .9). The
  // static card always shows it; live, it follows p from the first frame.
  const circle = useMotionValue(1);
  const spin = useMotionValue(0);
  const one = useMotionValue(1);
  const [ringed, setRinged] = useState(() => p.get() >= 0.95);
  useMotionValueEvent(p, "change", (v) => {
    if (!ringed && v >= 0.95) setRinged(true);
    else if (ringed && v < 0.9) setRinged(false);
  });
  useEffect(() => {
    if (!live || reduced) {
      circle.jump(1);
      return;
    }
    if (!ringed) {
      circle.jump(0);
      return;
    }
    const c = animate(circle, 1, { duration: dur.draw.short, ease: easeDraw });
    return () => c.stop();
  }, [live, reduced, ringed, circle]);

  const figLabel = `FIG. 0 • THE LINE • L = ${LINE_FIG.length} • ${LINE_FIG.controlPoints} CONTROL POINTS`;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={live ? { clipPath: open } : undefined}
    >
      {/* outgoing: the storm */}
      <motion.div
        className={cn("absolute inset-0", graded && "act-storm-grade")}
        style={live ? { y: outY } : { display: "none" }}
      >
        <MediaFrame media={storm} layout="fill" playOn="never" sizes="100vw" />
      </motion.div>

      {/* incoming: the blueprint, revealed by the ragged cut */}
      <motion.div
        className="absolute inset-0"
        style={
          live
            ? {
                maskImage: EDGE_MASK,
                WebkitMaskImage: EDGE_MASK,
                maskSize: "100% 300%",
                WebkitMaskSize: "100% 300%",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: maskY,
                WebkitMaskPosition: maskY,
              }
            : undefined
        }
      >
        <motion.div className="act-blueprint absolute inset-0" style={live ? { y: inY } : undefined}>
          <svg
            viewBox={`0 ${-(H - LINE_VIEWBOX.h) / 2} ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            className="absolute inset-0 size-full"
            fill="none"
            stroke="var(--w-bp-line)"
            strokeLinecap="square"
          >
            {/* dimension line, extension lines and end ticks (static) */}
            <path
              d={`M${DIM_X0} ${DIM_Y}H${DIM_X1}M${DIM_X0} ${DIM_Y - 8}V${DIM_Y + 8}M${DIM_X1} ${DIM_Y - 8}V${DIM_Y + 8}M${DIM_X0} 300V${DIM_Y - 12}M${DIM_X1} 214V${DIM_Y - 12}`}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeOpacity={0.7}
            />
            {live ? (
              <DrawPath d={LINE_D} progress={fig} stroke="var(--w-bp-line)" strokeWidth={2} />
            ) : (
              <path d={LINE_D} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            )}
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
        </motion.div>
      </motion.div>

      {/* the 3 px aqua seam line, riding the cut (.1 < p < .9 only) */}
      {live ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-[300%]"
          style={{ y: lineY, opacity: lineOn }}
        >
          <svg viewBox="0 0 100 300" preserveAspectRatio="none" focusable="false" className="size-full" fill="none">
            <path d={EDGE_LINE} stroke="var(--accent)" strokeWidth={3} vectorEffect="non-scaling-stroke" />
          </svg>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
