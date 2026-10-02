"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { dur, ease, easeDraw, springPlayful, springSettle } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import type { BeatWeight } from "@/lib/beats";
import { useEnterOnce, type EnterPhase } from "@/components/primitives/use-enter-once";

/* ============================================================================
   BLUEPRINT SCHEMATIC (SPEC v2 SM-7, IC-3I-04 jugaad register, IC-3I-11
   cyanotype; RECOGNIZABILITY S09/S10). A TRUE drawing of a real system:
   every node comes from content.ts (`approach`, `stack`) or the live
   manifest — "machine for show" is banned (H4). Rancho-style: visible bolts
   at every housing corner, a strip of tape across every joint, parts
   labelled as found. Labels are HTML Meta over the figure (never SVG text);
   the figure ground is --bp-panel, where only ink, stone and bp-line may be
   text (muted fails there, 4.13 — so --fg-ghost remaps to stone inside).
   Two orientations from one data set: a left→right machine ≥ 1024 (it
   spans the chalkboard), a top→bottom stack below.
   Two choreographies (the host's `<host>.schematic` piece):
     default "draw"      bp-line housings draw on (easeDraw), joints follow,
                         tape and bolts fade in — the drawing is inked.
     alt     "assemble"  the housings drop into place one by one (the
                         Settle), the joints run, the tape slaps on and the
                         bolts pop — the machine is put together.
   Both draw ONCE when 35 % is in view; server / motion off = drawn.
   ========================================================================== */

export type SchematicNode = { label: string; note?: string };
export type SchematicSpec = {
  /** The main chain, in order. */
  chain: readonly SchematicNode[];
  /** Two terminal nodes the chain splits into (survivors | kill-list). */
  fork?: readonly [SchematicNode, SchematicNode];
  /** A parallel route from the first node into the last (dashed). */
  branch?: SchematicNode;
};

type Box = { key: string; x: number; y: number; w: number; h: number; node: SchematicNode; order: number };
type Joint = { d: string; dashed?: boolean; order: number };
type Layout = { W: number; H: number; boxes: Box[]; joints: Joint[]; tapes: { x: number; y: number; order: number }[] };

/** ≥ 1024: left → right. */
function horizontal(spec: SchematicSpec): Layout {
  const W = 1000;
  const n = spec.chain.length;
  const boxes: Box[] = [];
  const joints: Joint[] = [];
  const tapes: Layout["tapes"] = [];
  const NH = 76;
  if (spec.fork) {
    const cw = 200;
    const gap = n > 1 ? (740 - 20 - n * cw) / Math.max(1, n - 1) : 0;
    const cy = 130;
    spec.chain.forEach((node, i) => {
      boxes.push({ key: `c${i}`, x: 20 + i * (cw + gap), y: cy - NH / 2, w: cw, h: NH, node, order: i });
      if (i > 0) {
        const x1 = 20 + (i - 1) * (cw + gap) + cw;
        const x2 = 20 + i * (cw + gap);
        joints.push({ d: `M${x1} ${cy} L${x2} ${cy}`, order: i - 1 });
        tapes.push({ x: (x1 + x2) / 2, y: cy, order: i - 1 });
      }
    });
    const endX = 20 + (n - 1) * (cw + gap) + cw;
    const fx = 790;
    const [a, b] = spec.fork;
    boxes.push({ key: "f0", x: fx, y: 24, w: 190, h: NH, node: a, order: n });
    boxes.push({ key: "f1", x: fx, y: 160, w: 190, h: NH, node: b, order: n });
    const mx = (endX + fx) / 2;
    joints.push({ d: `M${endX} ${cy} L${mx} ${cy} M${mx} ${24 + NH / 2} L${mx} ${160 + NH / 2} M${mx} ${24 + NH / 2} L${fx} ${24 + NH / 2} M${mx} ${160 + NH / 2} L${fx} ${160 + NH / 2}`, order: n - 1 });
    tapes.push({ x: mx, y: cy, order: n - 1 });
    return { W, H: 260, boxes, joints, tapes };
  }
  const cw = n > 5 ? 138 : 170;
  const gap = n > 1 ? (W - 24 - n * cw) / (n - 1) : 0;
  const top = 24;
  const xOf = (i: number) => 12 + i * (cw + gap);
  spec.chain.forEach((node, i) => {
    boxes.push({ key: `c${i}`, x: xOf(i), y: top, w: cw, h: NH, node, order: i });
    if (i > 0) {
      const x1 = xOf(i - 1) + cw;
      const x2 = xOf(i);
      joints.push({ d: `M${x1} ${top + NH / 2} L${x2} ${top + NH / 2}`, order: i - 1 });
      tapes.push({ x: (x1 + x2) / 2, y: top + NH / 2, order: i - 1 });
    }
  });
  let H = top + NH + 24;
  if (spec.branch && n >= 3) {
    const by = top + NH + 50;
    const bh = 62;
    const bx = xOf(1);
    const bw = xOf(n - 2) + cw - bx;
    boxes.push({ key: "b", x: bx, y: by, w: bw, h: bh, node: spec.branch, order: n });
    const c0 = xOf(0) + cw / 2;
    const cN = xOf(n - 1) + cw / 2;
    joints.push({ d: `M${c0} ${top + NH} L${c0} ${by + bh / 2} L${bx} ${by + bh / 2}`, dashed: true, order: n });
    joints.push({ d: `M${bx + bw} ${by + bh / 2} L${cN} ${by + bh / 2} L${cN} ${top + NH}`, dashed: true, order: n });
    H = by + bh + 24;
  }
  return { W, H, boxes, joints, tapes };
}

/** < 1024: top → bottom (the M1 stack, plus the fork / branch). */
function vertical(spec: SchematicSpec): Layout {
  const W = 360;
  const NH = 64;
  const GAP = 30;
  const n = spec.chain.length;
  const yOf = (i: number) => 24 + i * (NH + GAP);
  const boxes: Box[] = [];
  const joints: Joint[] = [];
  const tapes: Layout["tapes"] = [];
  spec.chain.forEach((node, i) => {
    boxes.push({ key: `c${i}`, x: 36, y: yOf(i), w: W - 72, h: NH, node, order: i });
    if (i > 0) {
      const y1 = yOf(i - 1) + NH;
      const y2 = yOf(i);
      joints.push({ d: `M${W / 2} ${y1} L${W / 2} ${y2}`, order: i - 1 });
      tapes.push({ x: W / 2, y: (y1 + y2) / 2, order: i - 1 });
    }
  });
  let rows = n;
  if (spec.fork) {
    const y = yOf(n);
    const [a, b] = spec.fork;
    boxes.push({ key: "f0", x: 20, y, w: 150, h: NH, node: a, order: n });
    boxes.push({ key: "f1", x: W - 170, y, w: 150, h: NH, node: b, order: n });
    const y1 = yOf(n - 1) + NH;
    const ym = (y1 + y) / 2;
    joints.push({ d: `M${W / 2} ${y1} L${W / 2} ${ym} M95 ${ym} L${W - 95} ${ym} M95 ${ym} L95 ${y} M${W - 95} ${ym} L${W - 95} ${y}`, order: n - 1 });
    tapes.push({ x: W / 2, y: ym, order: n - 1 });
    rows += 1;
  } else if (spec.branch && n >= 2) {
    const y = yOf(n);
    boxes.push({ key: "b", x: 36, y, w: W - 72, h: NH, node: spec.branch, order: n });
    joints.push({ d: `M36 ${yOf(0) + NH / 2} L14 ${yOf(0) + NH / 2} L14 ${y + NH / 2} L36 ${y + NH / 2}`, dashed: true, order: n });
    joints.push({ d: `M${W - 36} ${y + NH / 2} L${W - 14} ${y + NH / 2} L${W - 14} ${yOf(n - 1) + NH / 2} L${W - 36} ${yOf(n - 1) + NH / 2}`, dashed: true, order: n });
    rows += 1;
  }
  return { W, H: 24 + rows * NH + (rows - 1) * GAP + 24, boxes, joints, tapes };
}

function Drawing({ layout, phase, alt, className }: { layout: Layout; phase: EnterPhase; alt: boolean; className?: string }) {
  const { W, H, boxes, joints, tapes } = layout;
  const armed = phase === "armed";
  const live = phase === "entered";
  const step = 0.12;
  // DEFAULT: ink draws. ALT: parts drop in, then the joints run.
  const boxAnim = (b: Box) =>
    alt
      ? {
          initial: false as const,
          animate: armed ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 },
          transition: live ? { type: "spring" as const, ...springSettle, delay: b.order * step } : { duration: 0 },
        }
      : {
          initial: false as const,
          animate: { pathLength: armed ? 0 : 1 },
          transition: live ? { duration: dur.draw.med, ease: easeDraw, delay: b.order * step } : { duration: 0 },
        };
  const jointDelay = (o: number) => (alt ? 0.45 + o * step * 0.8 : 0.25 + o * step);
  return (
    <div className={cn("relative mx-auto w-full", className)} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false" className="absolute inset-0 size-full overflow-visible">
        {joints.map((j, i) =>
          j.dashed ? (
            <motion.path
              key={`j${i}`}
              d={j.d}
              fill="none"
              className="stroke-(--w-bp-line)"
              strokeWidth={1.5}
              strokeDasharray="6 6"
              strokeOpacity={0.8}
              initial={false}
              animate={{ opacity: armed ? 0 : 1 }}
              transition={live ? { duration: dur.base, ease, delay: jointDelay(j.order) } : { duration: 0 }}
            />
          ) : (
            <motion.path
              key={`j${i}`}
              d={j.d}
              fill="none"
              className="stroke-(--w-bp-line)"
              strokeWidth={1.5}
              initial={false}
              animate={{ pathLength: armed ? 0 : 1 }}
              transition={live ? { duration: alt ? dur.base : dur.draw.short, ease: easeDraw, delay: jointDelay(j.order) } : { duration: 0 }}
            />
          ),
        )}
        {tapes.map((t, i) => (
          // the rotation lives on the <g>: motion writes the rect's own
          // transform (the slap's scale), which would drop an attribute
          <g key={`tape${i}`} transform={`rotate(-14 ${t.x} ${t.y})`}>
            <motion.rect
              x={t.x - 10}
              y={t.y - 4}
              width={20}
              height={8}
              rx={1}
              className="fill-(--bp-panel) stroke-(--w-bp-line)"
              strokeWidth={1}
              strokeOpacity={0.75}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={false}
              animate={armed ? { opacity: 0, scale: alt ? 1.6 : 1 } : { opacity: 1, scale: 1 }}
              transition={
                live
                  ? alt
                    ? { type: "spring", ...springPlayful, delay: jointDelay(t.order) + 0.2 }
                    : { duration: dur.base, ease, delay: 0.5 + t.order * step }
                  : { duration: 0 }
              }
            />
          </g>
        ))}
        {boxes.map((b) => (
          <motion.g key={b.key} {...(alt ? boxAnim(b) : {})}>
            <motion.rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={6}
              fill="none"
              className="stroke-(--w-bp-line)"
              strokeWidth={1.5}
              {...(alt ? {} : boxAnim(b))}
            />
            {[
              [b.x + 7, b.y + 7],
              [b.x + b.w - 7, b.y + 7],
              [b.x + 7, b.y + b.h - 7],
              [b.x + b.w - 7, b.y + b.h - 7],
            ].map(([cx, cy], k) => (
              <motion.circle
                key={k}
                cx={cx}
                cy={cy}
                r={2.2}
                fill="none"
                className="stroke-(--w-bp-line)"
                strokeWidth={1}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                initial={false}
                animate={armed ? { opacity: 0, scale: alt ? 0.2 : 1 } : { opacity: 1, scale: 1 }}
                transition={
                  live
                    ? alt
                      ? { type: "spring", ...springPlayful, delay: 0.3 + b.order * step + k * 0.04 }
                      : { duration: dur.base, ease, delay: 0.3 + b.order * step }
                    : { duration: 0 }
                }
              />
            ))}
          </motion.g>
        ))}
      </svg>
      {boxes.map((b) => (
        <motion.div
          key={b.key}
          className="absolute flex flex-col items-center justify-center px-2 text-center"
          style={{
            left: `${(b.x / W) * 100}%`,
            top: `${(b.y / H) * 100}%`,
            width: `${(b.w / W) * 100}%`,
            height: `${(b.h / H) * 100}%`,
          }}
          initial={false}
          animate={alt && armed ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
          transition={alt && live ? { type: "spring", ...springSettle, delay: b.order * step } : { duration: 0 }}
        >
          <span className="type-meta leading-tight text-fg">{b.node.label}</span>
          {b.node.note ? <span className="type-meta leading-tight text-fg-muted">{b.node.note}</span> : null}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * BlueprintSchematic — the <figure> on the blueprint panel: the Meta FIG
 * label (true values) as its caption, the drawing (horizontal ≥ 1024,
 * vertical below), and an optional `after` slot inside the figure.
 * `star` (PHASE3-SPEC §3.8): the ink-on is a time star of the beat map
 * (trading-algos' FIG. 1, B20): on DESKTOP_FINE it waits for the spotlight;
 * "skip" = drawn. The host carries `beatAttrs(star.id)`.
 */
export function BlueprintSchematic({
  fig,
  spec,
  choice,
  pieceKey,
  after,
  className,
  compact = false,
  star,
}: {
  /** The Meta FIG label, e.g. "FIG. 1 • Trading_Algos- • 4 stages". */
  fig: string;
  spec: SchematicSpec;
  /** The host section's variant choice, and the registry piece key. */
  choice?: VariantChoice;
  pieceKey: string;
  after?: ReactNode;
  className?: string;
  /** Always the vertical stack (a narrow column, e.g. systems). */
  compact?: boolean;
  /** The draw is this time star (through the spotlight). */
  star?: { id: string; weight: BeatWeight };
}) {
  const ref = useRef<HTMLElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.35, star });
  const variant = useVariant(choice, pieceKey);
  const alt = variant === "alt";
  return (
    <figure
      ref={ref}
      className={cn("rounded-[6px] bg-(--bp-panel) p-tier-group [--fg-ghost:var(--fg-muted)] sm:p-6", className)}
      data-figure="schematic"
      data-choreo={alt ? "assemble" : "draw"}
    >
      <figcaption className="type-meta text-fg-muted">{fig}</figcaption>
      {compact ? (
        <Drawing layout={vertical(spec)} phase={phase} alt={alt} className="mt-tier-group max-w-[26rem]" />
      ) : (
        <>
          <Drawing layout={vertical(spec)} phase={phase} alt={alt} className="mt-tier-group max-w-[26rem] lg:hidden" />
          <Drawing layout={horizontal(spec)} phase={phase} alt={alt} className="mt-tier-group hidden lg:block" />
        </>
      )}
      {after ? <div className="mt-tier-group">{after}</div> : null}
    </figure>
  );
}
