"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, easeDraw } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, hash01 } from "@/components/primitives/loaders/kit";
import { GaugeDrawing } from "@/components/primitives/loaders/gauge";
import { LINE_D, LINE_FIG, LINE_VIEWBOX, remap, smooth01 } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";
import { BoardFig, boardQuad } from "@/components/sections/act-card/frames/board-fig";
import { EDGE_MASK_PNG } from "@/components/sections/act-card/frames/seam-edge-mask";
import {
  FRAME_ASPECT,
  PlateBox,
  anchor,
  coverBox,
  inBox,
  plateOf,
  registerY,
  type Box,
  type Plate,
} from "@/components/sections/act-card/plate";

/**
 * Card I→II "Storm → the ICE lecture hall" (SM-5, kind `seam`, D-5 long #1;
 * noise-order-seam.BAR §3A, RECOGNIZABILITY S07 / T3). One driver p (pinned
 * ≤ 60vh on a desktop fine pointer, direct, no springs; reverses exactly):
 *   0–.15   the frame opens inset(8%) → 0 on the STORM (MV-04: the hero's
 *           sea in a squall, NO ship — the kraken is a swell under the
 *           foam). Its horizon is REGISTERED to the ICE board's chalk ledge
 *           (the crop puts MV-04 `horizon` on the ledge's mid-line), so the
 *           sea's horizon becomes the ledge.
 *   .12–.66 the IceCut: a ragged-diagonal mask wipes the storm into the ICE
 *           lecture hall (iconic-ice: the huge blank green board, the tiered
 *           wooden benches, the pergola's striped sun), order rising from
 *           below; opposing parallax (outgoing −.4·p²·H, incoming
 *           +.4·(1−p)²·H); the teal foam DESATURATES to chalk white as the
 *           cut rises. At the MIDDLE (p .5) the hall and most of the board
 *           are up, FIG. 0 half-chalked, the storm still over the top
 *           quarter — both worlds, the new one leading (M2 ART-DIRECTOR #6).
 *           The cut is FEATHERED (~24 px, a blurred mask that sits just
 *           above the edge, so nothing of the storm — no rain — shows below
 *           it); a chalk-dust haze and ≤ 24 chalk specks ride it; the aqua
 *           seam line rides it (a 1.5 px core in a soft glow) for .1 < p
 *           < .66 only (the viewport's one aqua). FIG. 0 — the Line — is
 *           CHALKED ON THE BOARD (frames/board-fig.tsx) with pathLength =
 *           remap(p, .3, .8), labelled with its TRUE length and
 *           control-point count. The chalk gauge (LD-3I): rack x = p·L,
 *           the gears exact.
 *   ≥ .95   Rancho's chalk circle round the gauge's end tick.
 * Captions (CardShell): "THE KRAKEN'S STORM • PIRATES OF THE CARIBBEAN"
 * over the frame's top-right corner (where the storm leaves by) from the
 * card's entry through the middle (p .5), gone by .58; "THE LECTURE HALL
 * AT ICE • 3 IDIOTS" under the frame from .42, fully up at .5.
 * Static card (RM, Pause, no JS, < 1024 / coarse, SSR): the ICE hall with
 * FIG. 0 chalked on the board and the gauge complete with its circle.
 * aria-hidden art.
 *
 * No `board` (the lab's old call, or the plate missing): the M1 code
 * blueprint ground stands in (the same FIG in blueprint line).
 *
 * Phase 3 PIN MODE (PHASE3-SPEC §7.1–§7.2; CardShell): this choreography is
 * the css tier, run over star (a) (p 0–.45). Both plates take their
 * REGISTERED crops under the boot gate (`reg`: the storm's horizon and the
 * board's ledge on MATCH_ROW, the carried line), push-in #2 is the frame's
 * code camera (CardShell's content box, FIG. 0 inside it) with the L08 loop
 * from p .50 under the FIG (PlateLayers).
 */

const W = LINE_VIEWBOX.w;
const H = Math.round(W / 2.39);
/** The FIG's dimension line under the Line (Line space; blueprint fallback). */
const DIM_Y = LINE_VIEWBOX.h - 24;
const DIM_X0 = 40;
const DIM_X1 = 952;

/* — The IceCut edge: a ragged diagonal in a 100 × 300 box (the mask image
     is three frames tall; the edge sits in the middle third). Deterministic
     jitter (a hash, never Math.random: SSR == client). The MASK is the
     edge's fill lifted 1.6 units and blurred (σ ≈ 1 unit ≈ 6 px of a
     560–600 px frame): a ~24 px feather that is fully opaque just below the
     line, so the feather eats into the storm, never the hall. — */
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
/* The mask is BAKED (tools/bake/textures.js renders this very edge, blurred,
   to a PNG once): no feGaussianBlur is re-run while the card scrubs. */
const EDGE_MASK = `url("${EDGE_MASK_PNG}")`;
/** The wipe's position c (0–1) for the wipe fraction w (see the M1 note:
 *  c = .1 puts all of the edge below the frame, c = .84 all of it above).
 *  The masked layer is three frames tall and rides UP by 2c frames (a
 *  transform, composited, like the seam line), its plate counter-moved
 *  down by the same amount: the ragged edge sweeps, the hall stays put. */
const cutAt = (w: number) => 0.1 + 0.74 * w;
/** The seam line's glow as stacked strokes [width px, opacity]: together
 *  they approximate the old 20 px chalk at .24 and 6 px aqua at .4 under a
 *  5 px blur (a soft falloff, no filter). */
const GLOW_CHALK: readonly (readonly [number, number])[] = [
  [34, 0.05],
  [26, 0.06],
  [18, 0.07],
  [10, 0.08],
];
const GLOW_ACCENT: readonly (readonly [number, number])[] = [
  [18, 0.07],
  [12, 0.1],
  [7, 0.13],
  [3, 0.16],
];
/** The wipe's window of p. */
const CUT = { from: 0.12, to: 0.66 };
/** How far (frame heights) the storm is lifted at p 0 (≤ .19: the plate's
 *  box still covers the frame under the 8 % opening inset). */
const STORM_ENTRY = 0.18;

/** Chalk dust along the cut: ≤ 24 specks at the edge (the edge box's
 *  units: x 0–100, y of 300), deterministic; most settle just BELOW the
 *  line, on the board side. */
const DUST = Array.from({ length: 24 }, (_, k) => {
  const f = (k + hash01(k, 3)) / 24;
  const i = Math.min(EDGE_POINTS.length - 2, Math.floor(f * (EDGE_POINTS.length - 1)));
  const t = f * (EDGE_POINTS.length - 1) - i;
  const [x0, y0] = EDGE_POINTS[i];
  const [x1, y1] = EDGE_POINTS[i + 1];
  return {
    x: x0 + (x1 - x0) * t,
    y: y0 + (y1 - y0) * t + (hash01(k, 7) - 0.3) * 3.6,
    s: 2 + Math.round(hash01(k, 11) * 4),
    o: 0.35 + 0.5 * hash01(k, 13),
  };
});

/** The storm's crop: its horizon on the board's ledge mid-line (2.39). */
export function registeredStorm(stormId: MediaId | null, board: Plate | null): Plate | null {
  const storm = plateOf(stormId);
  if (!storm) return null;
  const q = board ? boardQuad(board) : null;
  const hz = anchor(storm, "horizon")?.[1];
  if (!board || !q || hz === undefined) return storm;
  const bb = coverBox(FRAME_ASPECT.sm, board.ratio, board.pos);
  const midY = (q.bl[1] + q.br[1]) / 2 / board.asset.height;
  const ledge = inBox(bb, [0.5, midY])[1];
  return { ...storm, pos: [storm.pos[0], registerY(FRAME_ASPECT.sm, storm.ratio, hz, ledge)] };
}

export function SeamFrame({
  storm: stormId,
  board: boardId = null,
  graded,
  reg,
}: {
  storm: MediaId | null;
  /** The incoming ICE lecture hall (iconic-ice); null → the code blueprint. */
  board?: MediaId | null;
  /** The storm is a fallback plate (MV-01): give it the code storm grade. */
  graded: boolean;
  /** Phase 3: the registered crops (the carried line; boot gate only). */
  reg?: { storm?: Box | null; board?: Box | null } | null;
}) {
  const { p, live, pin } = useCard();
  const PlateLayers = pin?.ui?.PlateLayers;
  const reduced = useReducedMotion();
  const board = plateOf(boardId);
  const storm = registeredStorm(stormId, board);

  const open = useTransform(p, (v) => `inset(${(8 * (1 - remap(v, 0, 0.15))).toFixed(2)}%)`);
  // the storm ENTERS tilted up (its glowing crest in the frame's top half,
  // where the card is first seen with the outgoing caption over it) and
  // settles onto its registration (horizon on the ledge) by the time the
  // cut starts (M2 critic 3 #3: at p 0 the top half was only night sky)
  const outY = useTransform(p, (v) => `${(-100 * STORM_ENTRY * (1 - smooth01(remap(v, 0, CUT.from))) - 40 * v * v).toFixed(3)}%`);
  const cut = useTransform(p, (v) => cutAt(remap(v, CUT.from, CUT.to)));
  // belt and braces: once the wipe is complete the incoming is unmasked
  const mask = useTransform(p, (v) => (remap(v, CUT.from, CUT.to) >= 1 ? "none" : EDGE_MASK));
  const lineY = useTransform(cut, (c) => `${((-2 * c) / 3) * 100}%`);
  // the hall, counter-moved inside the rising mask layer (+2c frames), plus
  // its own opposing parallax (+.4·(1−p)² frames)
  const hallY = useTransform(p, (v) => {
    const c = cutAt(remap(v, CUT.from, CUT.to));
    return `${(200 * c + 40 * (1 - v) * (1 - v)).toFixed(3)}%`;
  });
  const lineOn = useTransform(p, (v) => (v > 0.1 && v < CUT.to ? 1 : 0));
  const dustOn = useTransform(p, (v) => Math.min(remap(v, 0.1, 0.18), 1 - remap(v, CUT.to - 0.08, CUT.to)));
  const grey = useTransform(p, (v) => 0.85 * remap(v, CUT.from, CUT.to));
  const fig = useTransform(p, (v) => remap(v, 0.3, 0.8));

  const { circle, spin, one } = useRanchoCircle(p, live, reduced);

  return (
    <motion.div
      aria-hidden="true"
      data-frame="seam"
      className="absolute inset-0 overflow-hidden"
      style={live ? { clipPath: open } : undefined}
    >
      {/* outgoing: the storm (mounted hidden while static, so it has
          decoded before the card goes live) */}
      <motion.div
        className={cn("absolute inset-0", live && "will-change-transform")}
        style={live ? { y: outY } : { display: "none" }}
      >
        {storm ? (
          <PlateBox plate={storm} reg={reg?.storm} className={cn(graded && "act-storm-grade")}>
            <MediaFrame media={storm.asset.id} layout="fill" playOn="never" sizes="100vw" />
          </PlateBox>
        ) : null}
        {/* the teal foam desaturates toward chalk white as the cut rises: a
            grey copy of the storm (drawn once) faded in over it — opacity
            only, no blend mode re-drawn per frame */}
        {storm && live ? (
          <motion.div className="absolute inset-0 grayscale will-change-[opacity]" style={{ opacity: grey }}>
            <PlateBox plate={storm} reg={reg?.storm} className={cn(graded && "act-storm-grade")}>
              <MediaFrame media={storm.asset.id} layout="fill" playOn="never" sizes="100vw" loader={false} />
            </PlateBox>
          </motion.div>
        ) : null}
      </motion.div>

      {/* incoming: the ICE lecture hall (or the code blueprint), revealed by
          the ragged cut */}
      <motion.div
        className={live ? "absolute inset-x-0 top-0 h-[300%] will-change-transform" : "absolute inset-0"}
        style={
          live
            ? {
                y: lineY,
                maskImage: mask,
                WebkitMaskImage: mask,
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }
            : undefined
        }
      >
        <motion.div
          className={live ? "absolute inset-x-0 top-0 h-1/3 will-change-transform" : "absolute inset-0"}
          style={live ? { y: hallY } : undefined}
        >
          {board ? (
            <PlateBox plate={board} reg={reg?.board}>
              <MediaFrame media={board.asset.id} layout="fill" playOn="never" sizes="100vw" />
              {PlateLayers ? <PlateLayers plate={board.asset.id} /> : null}
              <BoardFig
                plate={board}
                fig={live ? fig : one}
                rack={live ? p : one}
                spin={spin}
                circle={circle}
                live={live}
              />
            </PlateBox>
          ) : (
            <BlueprintFig live={live} fig={fig} p={p} one={one} spin={spin} circle={circle} />
          )}
        </motion.div>
      </motion.div>

      {/* the aqua seam line (a soft glow round a 1.5 px core), a chalk-dust
          haze and the chalk specks, riding the cut — never a razor edge */}
      {live ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-[300%] will-change-transform"
          style={{ y: lineY }}
        >
          {/* the soft glow, PRE-BLURRED: stacked strokes, widest faintest
              (the old 5 px CSS blur on a three-frame layer re-ran per frame) */}
          <motion.svg
            viewBox="0 0 100 300"
            preserveAspectRatio="none"
            focusable="false"
            className="absolute inset-0 size-full"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: lineOn }}
          >
            <g transform="translate(0 1.2)" stroke="var(--w-chalk)">
              {GLOW_CHALK.map(([w, o]) => (
                <path key={w} d={EDGE_LINE} strokeOpacity={o} strokeWidth={w} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            <g stroke="var(--accent)">
              {GLOW_ACCENT.map(([w, o]) => (
                <path key={w} d={EDGE_LINE} strokeOpacity={o} strokeWidth={w} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          </motion.svg>
          <motion.svg
            viewBox="0 0 100 300"
            preserveAspectRatio="none"
            focusable="false"
            className="absolute inset-0 size-full"
            fill="none"
            style={{ opacity: lineOn }}
          >
            <path d={EDGE_LINE} stroke="var(--accent)" strokeOpacity={0.85} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </motion.svg>
          <motion.div className="absolute inset-0" style={{ opacity: dustOn }}>
            {DUST.map((d, k) => (
              <span
                key={k}
                className="absolute block rounded-full bg-(--w-chalk)"
                style={{
                  left: `${d.x.toFixed(2)}%`,
                  top: `${((d.y / 300) * 100).toFixed(3)}%`,
                  width: d.s,
                  height: d.s,
                  opacity: d.o,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

/** Rancho's circle at p ≥ .95 (state-driven; re-arms only below .9). The
 *  static card always shows it; live, it follows p from the first frame.
 *  Shared with the ALT (frames/seam-chalk.tsx). */
export function useRanchoCircle(p: MotionValue<number>, live: boolean, reduced: boolean) {
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
  return { circle, spin, one };
}

/** The M1 code blueprint ground with FIG. 0 in blueprint line: the
 *  fallback when the ICE plate is missing. */
function BlueprintFig({
  live,
  fig,
  p,
  one,
  spin,
  circle,
}: {
  live: boolean;
  fig: MotionValue<number>;
  p: MotionValue<number>;
  one: MotionValue<number>;
  spin: MotionValue<number>;
  circle: MotionValue<number>;
}) {
  const figLabel = `FIG. 0 • THE LINE • L = ${LINE_FIG.length} • ${LINE_FIG.controlPoints} CONTROL POINTS`;
  return (
    <div className="act-blueprint absolute inset-0">
      <svg
        viewBox={`0 ${-(H - LINE_VIEWBOX.h) / 2} ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        className="absolute inset-0 size-full"
        fill="none"
        stroke="var(--w-bp-line)"
        strokeLinecap="square"
      >
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
        <GaugeDrawing key={live ? "live" : "static"} progress={live ? p : one} spin={spin} circle={circle} scale={1.5} />
      </div>
      <p className="type-meta absolute top-[6%] left-gutter hidden text-fg sm:block">{figLabel}</p>
    </div>
  );
}
