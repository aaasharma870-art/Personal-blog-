"use client";

import { useId } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useTicker, type Pt } from "@/components/primitives/loaders/kit";

/**
 * LD-HP ALT "The Marauder's Map" (hp; lib/variants.ts
 * `loader-ink-light.motion` alt; M2 RECOGNIZABILITY S20, caption
 * cap.loader.hp.alt "THE MARAUDER'S MAP"). Harry Potter reveals — the
 * default lights candles; this one is the Map's own tell: a folded
 * PARCHMENT tile, its creases showing, drawn in ink with a castle's rooms,
 * a round tower and the corridors between them, and a pair of inked
 * FOOTPRINTS walking the corridors, each step inking in as it lands and
 * fading behind the walker, until the feet stop together in the far room.
 *
 *   determinate    a dotted ink path is drawn along the corridor to
 *                  `progress` (pathLength, direct); step k (16, alternating
 *                  feet) lands when the path reaches it — the newest three
 *                  at full ink, older ones faded to 35 %.
 *   indeterminate  two steps pace in place at the entrance (one foot, then
 *                  the other, every 0.5 s): someone is there, nothing has
 *                  advanced. Frozen when the shell's idle stop drops
 *                  `animate`.
 *   complete       the path drawn; every step faded; the feet side by side
 *                  in the far room, at full ink. No flash.
 *   static         the same as complete.
 * Our own floor plan and print shapes (never a traced prop map, no
 * lettering: the Map's microtext lives only in the Map EGG, in HTML). Inks
 * are the parchment's own (--paper, --paper-fg 12.6:1, --paper-muted);
 * 0 sprites, 0 glow, 0 text (L6, L7); tokens only (L17).
 */

// — geometry (viewBox 0 0 160 104) —
const SHEET = { x: 4, y: 4, w: 152, h: 96 };
/** The walker's route along the corridors: entrance → great room → tower →
 *  the far room. */
const ROUTE: readonly Pt[] = [
  [18, 84],
  [62, 84],
  [62, 31],
  [108, 31],
  [108, 72],
  [140, 72],
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
  { x: 8, y: 74, w: 22, h: 20 },
  { x: 46, y: 16, w: 30, h: 26 },
  { x: 128, y: 60, w: 24, h: 24 },
  { x: 80, y: 60, w: 18, h: 30 },
];
const TOWER = { x: 108, y: 31, r: 11 };
/** Stair hatching in the great room, and a secret passage (dotted). */
const STAIRS = Array.from({ length: 5 }, (_, i) => `M${50 + i * 2.6} 38V${33 - i * 0.2}`).join("");
const SECRET = "M30 60C40 58 44 52 46 46M120 24C130 22 140 26 146 34";
const CREASES = `M${SHEET.x + SHEET.w / 3} ${SHEET.y + 1}V${SHEET.y + SHEET.h - 1}M${SHEET.x + (2 * SHEET.w) / 3} ${SHEET.y + 1}V${SHEET.y + SHEET.h - 1}M${SHEET.x + 1} ${SHEET.y + SHEET.h / 2}H${SHEET.x + SHEET.w - 1}`;

const STEPS = 16;
const OFFSET = 2.6;
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
  return [-1, 1].map((side) => ({ x: q.x + 2, y: q.y + 2.3 * side, a: 0 }));
})();

const printT = (s: { x: number; y: number; a: number }, k: number) =>
  `translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.a.toFixed(1)}) scale(${k})`;

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
  // print size in user units (a mini tile needs bigger feet)
  const k = mini ? 0.2 : 0.11;
  const corridor = mini ? 14 : 9;

  // indeterminate: one foot, then the other, pacing at the entrance
  const tick = useTicker(mode === "indeterminate" && running, 500);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])} data-loader-art="marauders-map">
      <svg viewBox="0 0 160 104" aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible" fill="none">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <DrawPath d={ROUTE_D} progress={walk} stroke="white" strokeWidth={sw(6)} strokeLinecap="butt" />
          </mask>
        </defs>
        {/* the folded parchment and its creases */}
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} rx={1.5} fill="var(--paper)" stroke="var(--paper-edge-deep)" strokeWidth={sw(1)} />
        <path d={CREASES} stroke="var(--paper-edge-deep)" strokeWidth={sw(0.8)} opacity={0.8} />
        {/* the castle in ink: rooms, then the corridors cut doors through
            them (an ink stroke with a parchment core = a double wall) */}
        <g stroke="var(--paper-muted)" strokeLinejoin="miter">
          {ROOMS.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="var(--paper)" strokeWidth={sw(mini ? 1.4 : 1.1)} />
          ))}
          <circle cx={TOWER.x} cy={TOWER.y} r={TOWER.r} fill="var(--paper)" strokeWidth={sw(mini ? 1.4 : 1.1)} />
          <path d={ROUTE_D} strokeWidth={corridor} strokeLinecap="square" />
          <path d={ROUTE_D} stroke="var(--paper)" strokeWidth={corridor - sw(mini ? 1.2 : 2)} strokeLinecap="square" />
          {mini ? null : (
            <>
              <circle cx={TOWER.x} cy={TOWER.y} r={TOWER.r - 3.2} strokeWidth={sw(0.6)} opacity={0.6} />
              <path d={STAIRS} strokeWidth={sw(0.7)} />
              <path d={SECRET} strokeWidth={sw(0.8)} strokeDasharray={`${sw(1.5)} ${sw(2.5)}`} opacity={0.75} />
            </>
          )}
        </g>
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
            ? WALK.slice(0, 2).map((s, i) => <path key={i} d={PRINT} transform={printT(s, k)} opacity={tick % 2 === i ? 1 : 0.25} />)
            : WALK.map((s, i) => <Print key={i} step={s} walk={walk} done={done} k={k} />)}
          {done ? END.map((s, i) => <path key={`end${i}`} d={PRINT} transform={printT(s, k)} />) : null}
        </g>
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
