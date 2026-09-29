"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";
import {
  DrawPath,
  PlanStroke,
  SIZE_CLASS,
  SIZE_PX,
  arcPts,
  cubicPts,
  planPoint,
  planStrokes,
  useSvgAttr,
  useTicker,
  type Pt,
  type StrokePlan,
} from "@/components/primitives/loaders/kit";
import { LINE, fitPoint, type Box } from "@/components/primitives/loaders/line";

/**
 * LD-RD DEFAULT "Arthur's journal" (rdr2; M2 RECOGNIZABILITY S20 SWAP: the
 * journal sketch passed the blind test as the ALT, so it is now the
 * DEFAULT; the tintype plate is retired to plate-trail.tsx and the new ALT
 * is Dead Eye, plate-deadeye.tsx; caption cap.loader.rdr2 "ARTHUR MORGAN'S
 * JOURNAL"). RDR2 reflects: a leather-bound journal, strapped, open on a
 * page where a pencil sketches the frontier stroke by stroke (horizon,
 * ridges, a pine, the trail — the site's Line in graphite — a campfire, a
 * low sun, two birds, hatching). The sketch appearing IS the progress
 * (RD-P1 kept by hand; RD-P4).
 *
 *   determinate    the pencil has drawn exactly `progress` of the total
 *                  line (each stroke owns its share of the summed length, in
 *                  drawing order: direct, no spring); its tip rides the
 *                  stroke being drawn. The sketch never "finishes" before
 *                  progress = 1.
 *   indeterminate  the page is blank; the pencil taps at the first stroke
 *                  every 0.6 s (working, visibly not progressing); frozen
 *                  when the shell's idle stop drops `animate`.
 *   complete       the sketch is whole; the journal's ONE red-pencil
 *                  underline draws under it (0.5 s) and the pencil is laid
 *                  down beside the page — no flash, no glow.
 *   static         the sketch, the underline, the pencil at rest.
 * Paper and pencil use the journal's own inks (--paper, --paper-pencil,
 * --paper-red; DESIGN v3 §1.3.2); the cover, strap and pencil body the rdr2
 * decorative inks (leather, bone, brass buckle). No person, rider, gun or
 * logo (L21); no text (L7); tokens only (L17). `mini` = the cover, page and
 * sketch, no pencil.
 */

// — geometry (viewBox 0 0 160 100; the page is tilted −1.5° about its centre) —
const PAGE = { x: 16, y: 9, w: 128, h: 82 };
/** The leather cover (a little proud of the page) and the strap across its
 *  fore-edge. */
const COVER = { x: 9, y: 4, w: 146, h: 92 };
const STRAP = { x: 147.5, w: 5 };
const LEATHER_DARK = "color-mix(in oklab, var(--w-leather) 52%, var(--rd-deep))";
const TILT = `rotate(-1.5 ${PAGE.x + PAGE.w / 2} ${PAGE.y + PAGE.h / 2})`;
const TRAIL_BOX: Box = { x: 50, y: 66, w: 80, h: 16 };

const poly = (...p: Pt[]): Pt[] => p;
const trail: Pt[] = Array.from({ length: 40 }, (_, i) => {
  const q = fitPoint(LINE.at(i / 39), TRAIL_BOX);
  return [q.x, q.y] as Pt;
});
const FIRE = fitPoint(LINE.at(1), TRAIL_BOX);

const SKETCH: Pt[][] = [
  // the horizon
  cubicPts([24, 57], [54, 55.5], [98, 58.5], [136, 56.5], 16),
  // the far ridge (left range, then right range)
  poly([25, 57], [33, 48], [37, 51], [46, 36.5], [52, 44], [57, 40.5], [66, 53], [72, 49], [79, 56]),
  poly([84, 56], [93, 45], [98, 48.5], [108, 33.5], [114, 41], [119, 37.5], [128, 49], [135, 53]),
  // the near hill
  cubicPts([24, 68], [52, 59], [86, 71], [136, 63], 16),
  // a lone pine on the near hill (outline, then trunk)
  poly([36, 49], [32.5, 55.5], [35, 55.5], [30.5, 61.5], [34, 61.5], [29, 68], [43, 68], [38, 61.5], [41.5, 61.5], [37, 55.5], [39.5, 55.5], [36, 49]),
  poly([36, 68], [36.2, 73]),
  // the trail: the site's Line, in graphite
  trail,
  // the campfire at the trail's end: two crossed logs, three licks
  poly([FIRE.x - 5, FIRE.y + 1.5], [FIRE.x + 5, FIRE.y - 1]),
  poly([FIRE.x - 5, FIRE.y - 1], [FIRE.x + 5, FIRE.y + 1.5]),
  cubicPts([FIRE.x - 2.5, FIRE.y - 1], [FIRE.x - 4, FIRE.y - 5], [FIRE.x - 1, FIRE.y - 6], [FIRE.x - 1.5, FIRE.y - 9], 6),
  cubicPts([FIRE.x, FIRE.y - 1], [FIRE.x + 2.5, FIRE.y - 6], [FIRE.x - 1, FIRE.y - 8], [FIRE.x + 0.8, FIRE.y - 12], 6),
  cubicPts([FIRE.x + 2.5, FIRE.y - 1], [FIRE.x + 4, FIRE.y - 4], [FIRE.x + 2, FIRE.y - 6], [FIRE.x + 3, FIRE.y - 8], 6),
  // the low sun between the ranges
  arcPts(82, 44, 4.2, 4.2, 180, 540, 18),
  // hatching on the shadow slopes
  ...[0, 1, 2, 3].map((k) => poly([47 + k * 2.6, 40 + k * 2.2], [49.5 + k * 2.6, 44.5 + k * 2.2])),
  ...[0, 1, 2, 3].map((k) => poly([109 + k * 2.6, 37 + k * 2.2], [111.5 + k * 2.6, 41.5 + k * 2.2])),
  // two birds
  poly([62, 24], [65, 22], [67.5, 24.5], [70, 22], [73, 24]),
  poly([76, 19.5], [78.2, 18], [80, 19.8], [81.8, 18], [84, 19.5]),
];
const PLAN: StrokePlan = planStrokes(SKETCH);
/** The journal's one red-pencil underline (complete / static). */
const UNDERLINE = "M34 84.5C60 83 96 84.8 126 83.2";
/** Where the pencil is laid down (page coords), and its angle there. */
const REST = { x: 136, y: 96, a: -8 };
const HOLD = -52;

export default function PlateJournalLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <Journal key={props.mode} {...props} />;
}

function Journal({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const scale = SIZE_PX[size] / 160;
  const sw = (px: number) => px / scale;

  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const ink = mode === "determinate" ? progress : mode === "indeterminate" ? zero : one;

  // complete: the underline draws and the pencil is laid down (0.5 s)
  const finish = useMotionValue(mode === "static" ? 1 : 0);
  useEffect(() => {
    if (mode === "static" || (mode === "complete" && reduced)) {
      finish.jump(1);
      return;
    }
    if (mode !== "complete") {
      finish.jump(0);
      return;
    }
    const c = animate(finish, 1, { duration: 0.5, ease: "easeOut" });
    return () => c.stop();
  }, [mode, reduced, finish]);

  // indeterminate: the pencil taps at the first stroke (frozen when stopped)
  const tick = useTicker(mode === "indeterminate" && running, 600);
  const lift = mode === "indeterminate" && tick % 2 === 1 ? 2 : 0;

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg
        viewBox="0 0 160 100"
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform={TILT}>
          {/* the leather cover under the page, its stitching, and the stack
              of pages showing at the fore-edge (a thick, used journal) */}
          <rect x={COVER.x} y={COVER.y} width={COVER.w} height={COVER.h} rx={3.5} style={{ fill: LEATHER_DARK }} />
          {mini ? null : (
            <rect
              x={COVER.x + 2.2}
              y={COVER.y + 2.2}
              width={COVER.w - 4.4}
              height={COVER.h - 4.4}
              rx={2.4}
              fill="none"
              stroke="var(--w-bone)"
              strokeOpacity={0.4}
              strokeWidth={sw(0.6)}
              strokeDasharray={`${sw(2)} ${sw(1.6)}`}
            />
          )}
          <path
            d={`M${PAGE.x + 2} ${PAGE.y + PAGE.h + 1.6}H${PAGE.x + PAGE.w + 1.4}V${PAGE.y + 2}M${PAGE.x + 3} ${PAGE.y + PAGE.h + 3}H${PAGE.x + PAGE.w + 2.8}V${PAGE.y + 3.4}`}
            fill="none"
            stroke="var(--paper-edge-deep)"
            strokeWidth={sw(0.8)}
          />
          {/* the page (the journal's paper), with a deeper deckle edge */}
          <rect
            x={PAGE.x}
            y={PAGE.y}
            width={PAGE.w}
            height={PAGE.h}
            rx={1.5}
            fill="var(--paper)"
            stroke="var(--paper-edge-deep)"
            strokeWidth={sw(1)}
          />
          <g stroke="var(--paper-pencil)">
            {PLAN.strokes.map((s, i) => (
              <PlanStroke key={i} d={s.d} from={s.from} to={s.to} progress={ink} strokeWidth={sw(mini ? 0.7 : 1)} />
            ))}
          </g>
          <DrawPath d={UNDERLINE} progress={finish} stroke="var(--paper-red)" strokeWidth={sw(mini ? 0.9 : 1.3)} />
          {/* the strap round the cover, and its brass buckle */}
          <rect x={STRAP.x} y={COVER.y - 1.6} width={STRAP.w} height={COVER.h + 3.2} rx={1} fill="var(--w-leather)" />
          {mini ? null : (
            <rect
              x={STRAP.x - 1.4}
              y={50 - 4.5}
              width={STRAP.w + 2.8}
              height={9}
              rx={1}
              fill="none"
              stroke="var(--w-brass)"
              strokeWidth={sw(1.2)}
            />
          )}
          {mini ? null : <Pencil progress={ink} finish={finish} lift={lift} />}
        </g>
      </svg>
    </span>
  );
}

/** The pencil: its graphite tip at the head of the drawing, laid down at
 *  completion. Local drawing: tip at the origin, the body along +x. */
function Pencil({ progress, finish, lift }: { progress: MotionValue<number>; finish: MotionValue<number>; lift: number }) {
  const ref = useRef<SVGGElement>(null);
  const place = useTransform([progress, finish], ([v, f]) => {
    const tip = planPoint(PLAN, v as number);
    const k = f as number;
    return {
      x: tip.x + (REST.x - tip.x) * k,
      y: tip.y + (REST.y - tip.y) * k,
      a: HOLD + (REST.a - HOLD) * k,
    };
  });
  const fmt = (q: { x: number; y: number; a: number }) =>
    `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)}) rotate(${q.a.toFixed(2)})`;
  const t = useSvgAttr(ref, place, "transform", fmt);
  return (
    <g transform={lift ? `translate(0 ${-lift})` : undefined}>
    <g ref={ref} transform={t}>
      {/* the sharpened cone (bare wood) and its graphite point */}
      <path d="M0 0L6.5 -2.3V2.3Z" fill="var(--w-bone)" />
      <path d="M0 0L2.2 -0.8V0.8Z" fill="var(--paper-pencil)" />
      {/* the lacquered body, the ferrule, the eraser */}
      <rect x={6.5} y={-2.3} width={27} height={4.6} fill="var(--w-leather)" />
      <path d="M6.5 0H33.5" stroke="var(--paper-pencil)" strokeWidth={0.4} opacity={0.5} />
      <rect x={33.5} y={-2.4} width={3.4} height={4.8} fill="var(--w-pencil)" />
      <path d="M36.9 -2.3H38.6Q40 -2.3 40 0Q40 2.3 38.6 2.3H36.9Z" fill="var(--w-bone)" opacity={0.85} />
    </g>
    </g>
  );
}
