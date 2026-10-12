"use client";

import { motion, useTransform } from "motion/react";
import type { Pt } from "@/components/primitives/loaders/kit";
import { remap, smooth01 } from "@/components/primitives/loaders/line";
import { MediaFrame } from "@/components/primitives/media-frame";
import { useCard } from "@/components/sections/act-card/card-context";
import { boardQuad, onBoard, poly, type BoardQuad } from "@/components/sections/act-card/frames/board-fig";
import { PLATE, VB } from "@/components/sections/act-card/frames/tintype-geo";
import { PlateBox, plateViewBox, type Box, type Plate } from "@/components/sections/act-card/plate";

/* ============================================================================
   PIN EXTRAS (P3-11 r3) — pin-mode pieces the frames place through
   `pin.ui` (card-context.ts), so their code loads with the lazy pin chunk
   (card-p3.tsx), never with the page (first-load JS budget): the opening's
   sea under the iris, the tintype's develop front, the ICE board's motto
   (through PlateLayers).
   Desktop-fine pin mode only; aria-hidden art.
   ========================================================================== */

/** The opening, css tier (hooks: css-opening 0/3, "a porthole on flat black,
 *  still loading"): the night sea the iris opens out of lies UNDER the disc
 *  — the hero's own sea in the crop the GL iris uses (its horizon on the
 *  disc's row: pin-build.ts) at this share of its light (≈ the GL iris'
 *  outside, lib/gl/shaders.ts `o2`; the brass rim glows, cards-pin.css) — a
 *  spyglass on a sea, never on a void; out of paint once the disc has taken
 *  the frame (star (a) 1). GL draws its own (data-gl-replaced). */
const SEA = 0.4;
export function IrisSea({ plate, reg }: { plate: Plate; reg: Box | null }) {
  const { p } = useCard();
  const opacity = useTransform(p, (v) => (v >= 1 ? 0 : SEA));
  const visibility = useTransform(p, (v) => (v >= 1 ? "hidden" : "visible"));
  return (
    <motion.div className="absolute inset-0" data-gl-replaced="" style={{ opacity, visibility }}>
      <PlateBox plate={plate} reg={reg}>
        <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="100vw" loader={false} />
      </PlateBox>
    </motion.div>
  );
}

/** The tintype, css tier (hooks 2/3: "static, nothing suggests a reveal"):
 *  the DEVELOP FRONT — a warm band of developer light on the frame's carried
 *  row, already under way at the hook, widening over the print and spent by
 *  star (a) .6, as the GL develop's golden band (cards-pin.css). Transform /
 *  opacity only. */
const FRONT_END = 0.6;
/** The frame's carried row (MATCH_ROW .47) in the inset plate box. */
const FRONT_TOP = `${(((0.47 * VB.h - PLATE.y) / PLATE.h) * 100).toFixed(3)}%`;
export function DevelopFront() {
  const { p } = useCard();
  const scaleY = useTransform(p, (v) => 0.55 + 3.2 * smooth01(remap(v, 0, FRONT_END)));
  const opacity = useTransform(p, (v) => 1 - smooth01(remap(v, 0.18, FRONT_END)));
  return <motion.span className="act-tintype-front" data-gl-replaced="" style={{ top: FRONT_TOP, scaleY, opacity }} />;
}

/* — C9 (P3-11 r3; blind: the settled ICE board read 3 Idiots at only
     .50–.60, "could be a generic classroom"): the film's catch-phrase AAL
     IZZ WELL chalked on the slate in a student's hand (RECOGNIZABILITY rule
     (c): "All Izz Well" is on the 3 Idiots list; the egg command's words,
     `egg.cmd.aal`). Strokes, not text: it is part of the picture, like the
     drone — art string, listed for Aryan's sign-off. Single-stroke capitals
     in a 1-high local box (y down), advances in the same unit. — */
type Glyph = { w: number; strokes: Pt[][] };
type At = { u0: number; v0: number; h: number };
const GLYPHS: Record<string, Glyph> = {
  A: { w: 0.78, strokes: [[[0, 1], [0.39, 0], [0.78, 1]], [[0.17, 0.6], [0.62, 0.6]]] },
  L: { w: 0.58, strokes: [[[0.02, 0], [0, 1], [0.58, 0.98]]] },
  I: { w: 0.42, strokes: [[[0.21, 0], [0.21, 1]], [[0, 0.02], [0.42, 0]], [[0, 1], [0.42, 0.98]]] },
  Z: { w: 0.66, strokes: [[[0, 0.02], [0.66, 0], [0, 1], [0.68, 0.97]]] },
  W: { w: 1, strokes: [[[0, 0], [0.24, 1], [0.5, 0.32], [0.76, 1], [1, 0]]] },
  E: { w: 0.58, strokes: [[[0.58, 0], [0, 0.02], [0, 1], [0.6, 0.98]], [[0, 0.5], [0.46, 0.49]]] },
};
const MOTTO = "AAL IZZ WELL";
/** Where it is chalked (board-local u / v): DEFAULT under the FIG's
 *  dimension line, right of the gauge; the ALT right of its centred drone. */
const ON_BOARD: At = { u0: 0.56, v0: 0.835, h: 0.105 };
const ON_BOARD_ALT: At = { u0: 0.67, v0: 0.42, h: 0.1 };
/** A deterministic hand: each vertex nudged by ≤ ±.035 of the letter
 *  height, the line rising 2.5 % across (never Math.random: SSR == client). */
function jit(i: number): number {
  let h = Math.imul(i + 17, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca77);
  return ((((h ^ (h >>> 13)) >>> 0) % 1000) / 1000 - 0.5) * 0.07;
}
const mottoCache = new Map<string, string>();
function mottoPath(q: BoardQuad, at: At): string {
  const key = [...[q.tl, q.tr, q.bl, q.br].flat(), at.u0, at.v0, at.h].join(",");
  const hit = mottoCache.get(key);
  if (hit !== undefined) return hit;
  // one letter-height in u: the slate's height over its width (local), so
  // the letters keep their shape on the quad
  const bw = Math.hypot(q.tr[0] - q.tl[0], q.tr[1] - q.tl[1]);
  const bh = Math.hypot(q.br[0] - q.tr[0], q.br[1] - q.tr[1]);
  const unit = (at.h * bh) / bw;
  let x = 0;
  let n = 0;
  const polys: Pt[][] = [];
  for (const ch of MOTTO) {
    const g = GLYPHS[ch];
    if (!g) {
      x += 0.5;
      continue;
    }
    for (const st of g.strokes) {
      polys.push(
        st.map(([gx, gy]) => {
          const lx = x + gx + jit(n++);
          const ly = gy + jit(n++);
          return onBoard(q, at.u0 + lx * unit, at.v0 + (ly - lx * 0.025) * at.h);
        }),
      );
    }
    x += g.w + 0.24;
  }
  const d = polys.map((pts) => poly(pts)).join("");
  mottoCache.set(key, d);
  return d;
}

/** AAL IZZ WELL in chalk on the ICE board (both variants; drawn by the pin
 *  chunk's PlateLayers inside the board's PlateBox, so phones, tablets and
 *  a paused / reduced-motion boot keep today's board). Static chalk. */
const MOTTO_AT: Record<string, At> = { "iconic-ice": ON_BOARD, "iconic-ice-alt": ON_BOARD_ALT };
export function BoardMotto({ plate }: { plate: Plate }) {
  const at = MOTTO_AT[plate.asset.id];
  const q = at ? boardQuad(plate) : null;
  if (!at || !q) return null;
  return (
    <svg
      viewBox={plateViewBox(plate)}
      preserveAspectRatio="none"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full"
      fill="none"
      stroke="var(--w-chalk)"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-board-art="motto"
    >
      <path d={mottoPath(q, at)} strokeWidth={2.2} strokeOpacity={0.9} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
