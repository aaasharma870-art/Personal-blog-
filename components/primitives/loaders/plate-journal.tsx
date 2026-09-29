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
 * page where a pencil sketches the frontier stroke by stroke. M2 fix
 * (BLIND-1: 0.50–0.55, "mountains, could be any sketchbook"): the page now
 * carries unmistakable frontier subjects, big — rolling hills with a mesa
 * and the SUN (rayed) going down over them, two pines, a split-rail fence
 * whose post wears a COWBOY HAT, and a HORSE'S HEAD in profile (bridled; no
 * rider, no person), then the trail (the site's Line in graphite), a little
 * hatching and two birds. The sketch appearing IS the progress (RD-P1 kept
 * by hand; RD-P4).
 *
 *   determinate    the pencil has drawn exactly `progress` of the total
 *                  line (each stroke owns its share of the summed length, in
 *                  drawing order: direct, no spring); its tip rides the
 *                  stroke being drawn. The sketch never "finishes" before
 *                  progress = 1.
 *   indeterminate  the sketch is PARKED MID-DRAW (never a blank page): the
 *                  hills, sun, pines, the hat on its post and the horse are
 *                  down; the trail, hatching and birds are not. The pencil
 *                  taps at the head of the drawing every 0.6 s (working,
 *                  visibly not progressing); frozen when the shell's idle
 *                  stop drops `animate`.
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
/** The trail: the site's Line, small, on the ground between the post and
 *  the horse. */
const TRAIL_BOX: Box = { x: 64, y: 76, w: 32, h: 11 };

const poly = (...p: Pt[]): Pt[] => p;
/** A smooth stroke through `pts` (Catmull-Rom, sampled; module scope, so
 *  the server and the client agree). */
function smooth(pts: readonly Pt[], n = 5): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}
const trail: Pt[] = Array.from({ length: 30 }, (_, i) => {
  const q = fitPoint(LINE.at(i / 29), TRAIL_BOX);
  return [q.x, q.y] as Pt;
});
const pine = (x: number, base: number, h: number): Pt[][] => {
  const w = h * 0.36;
  const y = (f: number) => base - h * f;
  return [
    poly([x, y(1)], [x - w * 0.45, y(0.66)], [x - w * 0.2, y(0.66)], [x - w * 0.75, y(0.33)], [x - w * 0.35, y(0.33)], [x - w, y(0.04)], [x + w, y(0.04)], [x + w * 0.35, y(0.33)], [x + w * 0.75, y(0.33)], [x + w * 0.2, y(0.66)], [x + w * 0.45, y(0.66)], [x, y(1)]),
    poly([x, y(0.04)], [x + 0.2, base + 3]),
  ];
};
/** The sun going down over the hills, and its rays (none below the ridge). */
const SUN = { x: 80, y: 41, r: 5.2 };
const RAYS: Pt[][] = [-160, -130, -100, -70, -40, -10, 20, 160].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return poly([SUN.x + 7.4 * Math.cos(a), SUN.y + 7.4 * Math.sin(a)], [SUN.x + 11 * Math.cos(a), SUN.y + 11 * Math.sin(a)]);
});

/** The ICONIC strokes, in drawing order — the land, the sun, the pines, the
 *  fence, the hat, the horse. The indeterminate sketch parks right after
 *  them. */
const ICONIC: Pt[][] = [
  // the far hills: a mesa on the left, two rolling hills with a dip for the sun
  poly([22, 57], [26, 48.5], [37, 48], [40.5, 56]),
  cubicPts([38, 57], [50, 41], [66, 43], [80, 53], 14),
  cubicPts([77, 52], [94, 39], [118, 40], [138, 55], 14),
  cubicPts([20, 58], [60, 55.5], [100, 58.5], [140, 56.5], 16),
  // the sun, low between the hills, and its rays
  arcPts(SUN.x, SUN.y, SUN.r, SUN.r, 180, 540, 18),
  ...RAYS,
  // the near ground
  cubicPts([19, 70], [50, 66], [92, 72.5], [100, 70.5], 14),
  // two pines on the left
  ...pine(29, 70, 19),
  ...pine(37.5, 69, 14),
  // the split-rail fence: a short post, THE post, and the rails between
  poly([43.2, 81], [43.5, 64]),
  poly([45.8, 81], [45.6, 64]),
  poly([58.4, 84], [58.8, 61.5]),
  poly([61.6, 84], [61.3, 61.5]),
  poly([45.8, 67], [58.4, 66]),
  poly([45.8, 75], [58.4, 74]),
  poly([61.6, 66], [76, 67.5]),
  poly([61.6, 74], [76, 75.5]),
  // THE COWBOY HAT hung on the post: brim (curled up at both ends), the
  // pinched crown, its band
  smooth([[46.5, 55.2], [50, 58.6], [55, 60.4], [60, 60.8], [65, 60.4], [70, 58.6], [73.5, 55.2]], 4),
  smooth([[46.5, 55.2], [52, 57.4], [60, 58.2], [68, 57.4], [73.5, 55.2]], 4),
  smooth([[53.6, 57.6], [53.4, 52], [54.6, 48.2], [57, 47], [59, 48.4], [60, 47.9], [61, 48.4], [63, 47], [65.4, 48.2], [66.6, 52], [66.4, 57.6]], 3),
  cubicPts([53.6, 54.6], [57, 55.6], [63, 55.6], [66.4, 54.6], 8),
  // THE HORSE'S HEAD in profile, facing left: the neck front, throat, jaw,
  // chin and muzzle, up the face to the forelock; the two ears; the crest
  // and neck; the cheek, the eye, the nostril and mouth; the bridle; the mane
  smooth([[125.5, 90.5], [122.5, 82], [119, 76.5], [113, 73.6], [107.5, 77.6], [102.5, 79.4], [99.6, 77.2], [99, 73.6], [100.6, 69.8], [104, 60], [107.6, 52], [111, 46.6], [113.2, 45]], 4),
  poly([113.2, 45], [115.8, 37.4], [118.4, 44]),
  poly([119.4, 43.2], [122.6, 36.6], [124.2, 43.4]),
  smooth([[124.2, 43.4], [129, 48], [134, 56], [138, 66], [140.4, 78], [141.4, 90.5]], 4),
  cubicPts([108.4, 59], [118, 56.6], [121.4, 70], [113.4, 73.6], 10),
  cubicPts([109.8, 52.4], [111.2, 50.8], [113.2, 50.8], [114.4, 52.2], 5),
  arcPts(102.8, 71.6, 1.3, 1.1, 200, 470, 8),
  poly([100.2, 76.6], [104, 77.2]),
  poly([103.2, 63.4], [113.4, 67]),
  poly([113.8, 47.8], [113.6, 67.2]),
  ...[0, 1, 2, 3, 4].map((k) => poly([125 + k * 3, 45.5 + k * 5.2], [129.6 + k * 3, 49 + k * 5.6])),
];
/** Then the trail, hatching and the birds (drawn after the park point). */
const FINISH: Pt[][] = [
  trail,
  ...[0, 1, 2, 3].map((k) => poly([67 + k * 2.6, 45 + k * 1.6], [69.2 + k * 2.6, 49.6 + k * 1.6])),
  ...[0, 1, 2, 3].map((k) => poly([122 + k * 2.6, 45 + k * 1.8], [124.4 + k * 2.6, 49.8 + k * 1.8])),
  ...[0, 1, 2].map((k) => poly([63 + k * 2.4, 84], [65.8 + k * 2.4, 81.4])),
  poly([34, 26], [37, 24], [39.5, 26.5], [42, 24], [45, 26]),
  poly([48, 20.5], [50.2, 19], [52, 20.8], [53.8, 19], [56, 20.5]),
];
const PLAN: StrokePlan = planStrokes([...ICONIC, ...FINISH]);
/** Indeterminate: the sketch parks here (the iconic subjects drawn). */
const PARK = PLAN.strokes[ICONIC.length - 1].to;
/** The journal's one red-pencil underline (complete / static). */
const UNDERLINE = "M22 88.2C42 87.2 66 88.8 94 87.6";
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

  const parked = useMotionValue(PARK);
  const one = useMotionValue(1);
  const ink = mode === "determinate" ? progress : mode === "indeterminate" ? parked : one;

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

  // indeterminate: the pencil taps at the head of the parked sketch (frozen
  // when stopped)
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
              <PlanStroke key={i} d={s.d} from={s.from} to={s.to} progress={ink} strokeWidth={sw(mini ? 0.7 : 1.05)} />
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
