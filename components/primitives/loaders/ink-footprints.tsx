"use client";

import { useId, useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useSvgAttr, useTicker, type Pt } from "@/components/primitives/loaders/kit";

/**
 * LD-HP ALT "The Marauder's Map" (hp; lib/variants.ts
 * `loader-ink-light.motion` alt; M2 RECOGNIZABILITY S20, caption
 * cap.loader.hp.alt "THE MARAUDER'S MAP"). Harry Potter reveals — the
 * default lights candles; this one is the Map's own tell: a folded
 * PARCHMENT tile in three panels (creases, alternate panels shaded), its
 * notched NAME BANNER across the top (a blank ribbon — the lettering is the
 * Map's microtext, which lives only in the Map EGG, in HTML), and the
 * castle drawn in brown ink: rooms, a round tower with its spiral stair, a
 * courtyard, double-walled corridors with STAIR HATCHING across them, and
 * dotted secret passages. A pair of inked FOOTPRINTS walks the corridors,
 * each step inking in as it lands and fading behind the walker, trailed by
 * its little blank name tag, until the feet stop together in the far room.
 *
 * M2 fix (BLIND-1: 0.30–0.55, "a beige floor plan"): the banner, the fold
 * panels, the stair hatching, the tower's spiral and footprints twice the
 * size (≈ 7 px at card size) with the name tag — the Map, not a plan.
 *
 *   determinate    a dotted ink path is drawn along the corridor to
 *                  `progress` (pathLength, direct); step k (16, alternating
 *                  feet) lands when the path reaches it — the newest three
 *                  at full ink, older ones faded to 35 %; the name tag rides
 *                  the newest step.
 *   indeterminate  two steps pace in place at the entrance (one foot, then
 *                  the other, every 0.5 s), the tag beside them: someone is
 *                  there, nothing has advanced. Frozen when the shell's idle
 *                  stop drops `animate`.
 *   complete       the path drawn; every step faded; the feet side by side
 *                  in the far room, at full ink, tagged. No flash.
 *   static         the same as complete.
 * Our own floor plan and print shapes (never a traced prop map, no
 * lettering). Inks are the parchment's own (--paper, --paper-fg 12.6:1,
 * --paper-muted); 0 sprites, 0 glow, 0 text (L6, L7); tokens only (L17).
 * `mini`: the sheet, the corridors and bigger feet (no banner, no hatching).
 */

// — geometry (viewBox 0 0 160 104) —
const SHEET = { x: 4, y: 4, w: 152, h: 96 };
/** The three fold panels (the middle one shaded, as a folded sheet lies). */
const PANEL_W = SHEET.w / 3;
/** The walker's route along the corridors: entrance → up the long stair →
 *  the great hall → the tower → down → the far room. */
const ROUTE: readonly Pt[] = [
  [15, 88],
  [56, 88],
  [56, 40],
  [104, 40],
  [104, 80],
  [143, 80],
];
const ROUTE_D = ROUTE.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
const SEGS = ROUTE.slice(1).map((b, i) => {
  const a = ROUTE[i];
  return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]), ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
});
const TOTAL = SEGS.reduce((s, g) => s + g.len, 0);

/** The point and heading at fraction f of the route (by length). */
function routeAt(f: number): { x: number; y: number; a: number } {
  let d = Math.min(1, Math.max(0, f)) * TOTAL;
  for (const g of SEGS) {
    if (d <= g.len) {
      const t = g.len ? d / g.len : 0;
      return { x: g.a[0] + (g.b[0] - g.a[0]) * t, y: g.a[1] + (g.b[1] - g.a[1]) * t, a: g.ang };
    }
    d -= g.len;
  }
  const last = SEGS[SEGS.length - 1];
  return { x: last.b[0], y: last.b[1], a: last.ang };
}

/** Rooms (x, y, w, h) — the corridors break through their walls as doors. */
const ROOMS = [
  { x: 7, y: 76, w: 20, h: 21 }, // the entrance hall
  { x: 38, y: 26, w: 30, h: 22 }, // the great hall
  { x: 76, y: 58, w: 18, h: 30 }, // a side room
  { x: 118, y: 24, w: 32, h: 26 }, // the courtyard
  { x: 128, y: 68, w: 23, h: 24 }, // the far room
];
const TOWER = { x: 104, y: 40, r: 11 };
/** The tower's spiral stair (a tightening ink spiral). */
const SPIRAL = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 26; i++) {
    const a = (i / 26) * Math.PI * 3.2;
    const r = 7.6 - (i / 26) * 5.4;
    pts.push(`${i ? "L" : "M"}${(TOWER.x + r * Math.cos(a)).toFixed(2)} ${(TOWER.y + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join("");
})();
/** Stair hatching: rungs ACROSS the corridor on the long stair (x = 56,
 *  y 54–74) and on the tower's descent (x = 104, y 58–70); a stair block in
 *  the side room. */
const HATCH =
  Array.from({ length: 9 }, (_, i) => `M52 ${54 + i * 2.5}H60`).join("") +
  Array.from({ length: 6 }, (_, i) => `M100 ${58 + i * 2.4}H108`).join("") +
  Array.from({ length: 6 }, (_, i) => `M${79 + i * 2.2} 62V70`).join("") +
  "M79 62H90.8M79 70H90.8";
/** The courtyard's inner square, the great hall's long tables, and two
 *  secret passages (dotted). */
const DETAIL = "M124 30H144V44H124ZM43 31V43M49 31V43M55 31V43M61 31V43";
const SECRET = "M27 78C33 66 36 56 38 44M150 50C156 58 154 64 151 68M68 30C80 18 104 16 118 28";
/** The notched name banner (a swallowtail ribbon) and its inner rules. */
const BANNER = { x0: 50, x1: 110, y0: 7, y1: 17, notch: 4 };
const BANNER_D = `M${BANNER.x0 - 6} ${BANNER.y0}H${BANNER.x1 + 6}L${BANNER.x1 + 6 - BANNER.notch} ${(BANNER.y0 + BANNER.y1) / 2}L${BANNER.x1 + 6} ${BANNER.y1}H${BANNER.x0 - 6}L${BANNER.x0 - 6 + BANNER.notch} ${(BANNER.y0 + BANNER.y1) / 2}Z`;
const BANNER_FOLDS = `M${BANNER.x0} ${BANNER.y0}V${BANNER.y1}M${BANNER.x1} ${BANNER.y0}V${BANNER.y1}`;
const BANNER_RULES = `M${BANNER.x0 + 3} ${BANNER.y0 + 2.4}H${BANNER.x1 - 3}M${BANNER.x0 + 3} ${BANNER.y1 - 2.4}H${BANNER.x1 - 3}`;
const CREASES = `M${SHEET.x + PANEL_W} ${SHEET.y + 1}V${SHEET.y + SHEET.h - 1}M${SHEET.x + 2 * PANEL_W} ${SHEET.y + 1}V${SHEET.y + SHEET.h - 1}M${SHEET.x + 1} ${SHEET.y + SHEET.h / 2 + 4}H${SHEET.x + SHEET.w - 1}`;

const STEPS = 16;
const OFFSET = 2.4;
/** A print, toe along +x, heel at the origin (sole + heel, filled ink). */
const PRINT =
  "M13 -6.6C20 -9.4 34 -9.6 42 -6.2C48 -3.6 48 3.6 42 6.2C34 9.6 20 9.4 13 6.6C9 4.6 9 -4.6 13 -6.6Z" +
  "M0.4 -5C3.6 -7.4 8 -6.8 9 -3.4C9.8 -1 9.8 1 9 3.4C8 6.8 3.6 7.4 0.4 5C-2 3 -2 -3 0.4 -5Z";

type Step = { x: number; y: number; a: number; at: number };
const WALK: Step[] = Array.from({ length: STEPS }, (_, k) => {
  const at = 0.03 + (0.9 * k) / (STEPS - 1);
  const q = routeAt(at);
  const side = k % 2 ? 1 : -1;
  const r = (q.a * Math.PI) / 180;
  return { x: q.x - Math.sin(r) * OFFSET * side, y: q.y + Math.cos(r) * OFFSET * side, a: q.a, at };
});
/** The feet together in the far room (complete / static). */
const END = (() => {
  const q = routeAt(1);
  return [-1, 1].map((side) => ({ x: q.x + 1, y: q.y + 2.2 * side, a: 0 }));
})();

const printT = (s: { x: number; y: number; a: number }, k: number) =>
  `translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.a.toFixed(1)}) scale(${k})`;

/** Where the name tag hangs for a walk value: beside the newest landed step
 *  (the entrance before the first; the far room at the end). */
function tagAt(v: number, done: boolean): { x: number; y: number } {
  if (done) return { x: END[0].x, y: END[0].y };
  let s = WALK[0];
  for (const w of WALK) if (v >= w.at - 1e-6) s = w;
  return { x: s.x, y: s.y };
}
const tagT = (q: { x: number; y: number }) => `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)})`;

export default function InkFootprintsLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <MapTile key={props.mode} {...props} />;
}

function MapTile({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const mini = size === "mini";
  const scale = SIZE_PX[size] / 160;
  const sw = (px: number) => px / scale;
  const maskId = useId();
  const one = useMotionValue(1);
  const zero = useMotionValue(0);
  const walk = mode === "determinate" ? progress : mode === "indeterminate" ? zero : one;
  const done = mode === "complete" || mode === "static";
  // print size in user units (≈ 7 px long at card size; a mini tile bigger)
  const k = mini ? 0.26 : 0.19;
  const corridor = mini ? 14 : 9;
  const wall = sw(mini ? 1.4 : 1.1);

  // indeterminate: one foot, then the other, pacing at the entrance
  const tick = useTicker(mode === "indeterminate" && running, 500);

  // the name tag rides the newest step (a transform written to the DOM)
  const tag = useRef<SVGGElement>(null);
  const tagPos = useTransform(walk, (v) => tagAt(v, done));
  const t0 = useSvgAttr(tag, tagPos, "transform", tagT);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])} data-loader-art="marauders-map">
      <svg viewBox="0 0 160 104" aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible" fill="none">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <DrawPath d={ROUTE_D} progress={walk} stroke="white" strokeWidth={sw(6)} strokeLinecap="butt" />
          </mask>
        </defs>
        {/* the folded parchment: three panels (the middle one shaded, the
            way a folded sheet lies), its creases and an aged edge */}
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} rx={1.5} fill="var(--paper)" />
        <rect x={SHEET.x + PANEL_W} y={SHEET.y} width={PANEL_W} height={SHEET.h} fill="var(--paper-edge)" opacity={0.7} />
        <rect
          x={SHEET.x + 1.6}
          y={SHEET.y + 1.6}
          width={SHEET.w - 3.2}
          height={SHEET.h - 3.2}
          rx={1}
          stroke="var(--paper-edge-deep)"
          strokeWidth={3}
          opacity={0.45}
        />
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} rx={1.5} stroke="var(--paper-edge-deep)" strokeWidth={sw(1)} />
        <path d={CREASES} stroke="var(--paper-edge-deep)" strokeWidth={sw(0.9)} />
        {/* the castle in brown ink: rooms and the tower, then the corridors
            cut doors through them (an ink stroke with a parchment core = a
            double wall) */}
        <g stroke="var(--paper-muted)" strokeLinejoin="miter">
          {ROOMS.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="var(--paper)" fillOpacity={0.55} strokeWidth={wall} />
          ))}
          <circle cx={TOWER.x} cy={TOWER.y} r={TOWER.r} fill="var(--paper)" strokeWidth={wall} />
          <path d={ROUTE_D} strokeWidth={corridor} strokeLinecap="square" />
          <path d={ROUTE_D} stroke="var(--paper)" strokeWidth={corridor - sw(mini ? 1.2 : 2)} strokeLinecap="square" />
          {mini ? null : (
            <>
              <path d={SPIRAL} strokeWidth={sw(0.8)} strokeLinecap="round" />
              <path d={HATCH} strokeWidth={sw(0.75)} />
              <path d={DETAIL} strokeWidth={sw(0.7)} opacity={0.8} />
              <path d={SECRET} strokeWidth={sw(0.9)} strokeLinecap="round" strokeDasharray={`${sw(0.1)} ${sw(2.6)}`} />
            </>
          )}
        </g>
        {mini ? null : (
          <g stroke="var(--paper-fg)" strokeLinejoin="round">
            {/* the notched name banner (blank: no lettering in the SVG) */}
            <path d={BANNER_D} fill="var(--paper-s1)" strokeWidth={sw(1.1)} />
            <path d={BANNER_FOLDS} strokeWidth={sw(0.8)} />
            <path d={BANNER_RULES} strokeWidth={sw(0.6)} opacity={0.55} />
          </g>
        )}
        {/* the walked path: a dotted ink line (= progress) */}
        <path
          d={ROUTE_D}
          stroke="var(--paper-fg)"
          strokeWidth={sw(1.2)}
          strokeLinecap="round"
          strokeDasharray={`${sw(0.1)} ${sw(3.5)}`}
          mask={`url(#${maskId})`}
        />
        <g fill="var(--paper-fg)">
          {mode === "indeterminate"
            ? WALK.slice(0, 2).map((s, i) => <path key={i} d={PRINT} transform={printT(s, k)} opacity={tick % 2 === i ? 1 : 0.3} />)
            : WALK.map((s, i) => <Print key={i} step={s} walk={walk} done={done} k={k} />)}
          {done ? END.map((s, i) => <path key={`end${i}`} d={PRINT} transform={printT(s, k)} />) : null}
        </g>
        {mini ? null : (
          // the walker's little name tag (blank ribbon + leader), riding the
          // newest step
          <g ref={tag} transform={t0} stroke="var(--paper-fg)" strokeLinejoin="round">
            <path d="M1.5 -3.5L5 -9" strokeWidth={sw(0.7)} />
            <path d="M3 -13.5H17L15.4 -11L17 -8.5H3L4.6 -11Z" fill="var(--paper-s1)" strokeWidth={sw(0.8)} />
          </g>
        )}
      </svg>
    </span>
  );
}

/** One step: lands when the walk passes it, fades once three newer steps
 *  have landed (complete: every step faded, the end pair carries the ink). */
function Print({ step, walk, done, k }: { step: Step; walk: MotionValue<number>; done: boolean; k: number }) {
  const opacity = useTransform(walk, (v) => {
    if (v < step.at - 1e-6) return 0;
    if (done) return 0.35;
    const age = (v - step.at) * STEPS;
    return age < 2.5 ? 1 : age > 3.5 ? 0.35 : 1 - 0.65 * (age - 2.5);
  });
  return <motion.path d={PRINT} transform={printT(step, k)} style={{ opacity }} />;
}
