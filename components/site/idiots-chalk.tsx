"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { dur, easeDraw } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { drawn, faded, useDrawPhase } from "@/components/site/world-motion";

/* ============================================================================
   IDIOTS CHALK + BLUEPRINT — Act II "The Workshop" (SPEC v2 SM-6, SM-7;
   ICONS IC-3I-01/02/04; DESIGN v3 §8.1). Chalk is 2 px with a shared
   `chalkRough` displacement (our own filter); blueprint strokes are bp-line
   1.5 px on the --bp-panel figure ground. Every mark draws ONCE (easeDraw)
   when it enters; motion off / already in view = drawn. Rancho's circle
   marks a CAVEAT, never a metric (H4); ≤ 3 chalk marks per section.
   ========================================================================== */

/** The shared chalk roughness filter (one per SVG; ids are unique). */
function ChalkFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-20%" width="110%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
    </filter>
  );
}

/** Measure an element's box (null until measured: SSR renders the static,
 *  scale-to-fit mark, which is also the no-JS / reduced-motion final state). */
function useBox(ref: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      if (!e) return;
      const w = Math.round(e.contentRect.width);
      const h = Math.round(e.contentRect.height);
      setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

/** A hand-drawn loop (a superellipse, n = 6, that contains the box's corners)
 *  starting at ~10 o'clock and overshooting its start, as a chalk hand does. */
export function loopPath(w: number, h: number): { d: string; vw: number; vh: number; ox: number; oy: number } {
  const px = Math.min(18, 12 + 0.04 * w); // stays inside the page gutter at 320
  const py = 8 + 0.18 * h;
  const a = w / 2 + px;
  const b = h / 2 + py;
  const vw = w + 2 * px + 8;
  const vh = h + 2 * py + 8;
  const cx = vw / 2;
  const cy = vh / 2;
  const n = 6;
  const pts: string[] = [];
  const steps = 72;
  const start = -2.6; // radians, upper left
  const sweep = Math.PI * 2 + 0.55; // overshoot
  for (let i = 0; i <= steps; i++) {
    const t = start + (sweep * i) / steps;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const wob = 1 + 0.025 * Math.sin(3 * t + 0.8) + (i / steps) * 0.03; // the hand drifts outward
    const x = cx + a * wob * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = cy + b * wob * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return { d: pts.join(" "), vw, vh, ox: px + 4, oy: py + 4 };
}

/**
 * RanchoCircle (IC-3I-02) — one chalk loop around real HTML text (the text is
 * never restyled). `block` for a paragraph, inline for a phrase.
 */
export function RanchoCircle({
  children,
  block = false,
  className,
}: {
  children: ReactNode;
  block?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const box = useBox(ref);
  const phase = useDrawPhase(ref, 0.6);
  const fid = useId().replace(/:/g, "");
  const Wrap = block ? "div" : "span";
  const loop = box ? loopPath(box.w, box.h) : null;
  return (
    <Wrap ref={ref as React.RefObject<never>} className={cn("relative", block ? "block" : "inline-block", className)}>
      {children}
      {loop ? (
        <svg
          aria-hidden="true"
          focusable="false"
          width={loop.vw}
          height={loop.vh}
          viewBox={`0 0 ${loop.vw} ${loop.vh}`}
          className="pointer-events-none absolute overflow-visible"
          style={{ left: -loop.ox, top: -loop.oy }}
          data-chalk="circle"
        >
          <defs>
            <ChalkFilter id={`chalk-${fid}`} />
          </defs>
          <motion.path
            d={loop.d}
            fill="none"
            className="stroke-(--w-chalk)"
            strokeWidth={2}
            strokeLinecap="round"
            filter={`url(#chalk-${fid})`}
            {...drawn(phase, { duration: dur.draw.short, delay: 0.2 })}
          />
        </svg>
      ) : null}
    </Wrap>
  );
}

/** A chalk underline under real text (the board's one margin line). */
export function ChalkUnderline({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useDrawPhase(ref, 0.6);
  const fid = useId().replace(/:/g, "");
  return (
    <div ref={ref} className={cn("relative inline-block pb-3", className)}>
      {children}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3 w-full overflow-visible"
        data-chalk="underline"
      >
        <defs>
          <ChalkFilter id={`chalk-u-${fid}`} />
        </defs>
        <motion.path
          d="M2 7 C80 4 160 9 240 6 S360 4 398 7"
          fill="none"
          className="stroke-(--w-chalk)"
          strokeWidth={2}
          strokeLinecap="round"
          filter={`url(#chalk-u-${fid})`}
          {...drawn(phase, { duration: dur.draw.short })}
        />
      </svg>
    </div>
  );
}

/**
 * GateDiagram — the seven real gates drawn in chalk across the board
 * (SM-6): a chalk rail with seven gate frames. Gates before the selected one
 * are drawn; the selected gate DERIVES (its strokes draw in build order) and
 * is the viewport's one aqua mark; later gates are ghosted chalk. The gate
 * labels are the tablist (HTML); the figure is aria-hidden.
 */
export function GateDiagram({
  count,
  active,
  derive = false,
}: {
  count: number;
  active: number;
  /** true once the reader has chosen a gate: the chosen gate re-derives. */
  derive?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.4);
  const fid = useId().replace(/:/g, "");
  const W = 700;
  const x0 = 34;
  const step = (W - 2 * x0) / Math.max(1, count - 1);
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} 84`}
      aria-hidden="true"
      focusable="false"
      className="h-auto w-full overflow-visible"
      data-figure="gates"
    >
      <defs>
        <ChalkFilter id={`chalk-g-${fid}`} />
      </defs>
      <g filter={`url(#chalk-g-${fid})`}>
        <motion.path
          d={`M8 62 L${W - 8} 62`}
          fill="none"
          className="stroke-(--w-chalk)"
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeLinecap="round"
          {...drawn(phase, { duration: dur.draw.med })}
        />
        {Array.from({ length: count }, (_, i) => {
          const x = x0 + i * step;
          const d = `M${x - 16} 62 L${x - 16} 26 M${x + 16} 62 L${x + 16} 26 M${x - 24} 26 L${x + 24} 26`;
          const isActive = i === active;
          return (
            <motion.path
              key={isActive ? `active-${active}` : `gate-${i}`}
              d={d}
              fill="none"
              className={isActive ? "stroke-accent" : "stroke-(--w-chalk)"}
              strokeOpacity={isActive ? 1 : i < active ? 0.9 : 0.35}
              strokeWidth={isActive ? 2.5 : 2}
              strokeLinecap="round"
              {...(isActive && derive
                ? {
                    initial: { pathLength: 0 },
                    animate: { pathLength: 1 },
                    transition: { duration: dur.draw.short, ease: easeDraw },
                  }
                : drawn(phase, { duration: dur.draw.short, delay: 0.1 + i * 0.06 }))}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* — The blueprint schematic (3I-01/3I-03, jugaad register IC-3I-04) ——— */

export type SchematicNode = { label: string; note?: string };

/**
 * Schematic — a TRUE drawing of a real system (every node is from
 * content.ts; "machine for show" is banned, H4), drawn once in bp-line on the
 * blueprint panel, in the jugaad register: visible bolts at every housing
 * corner and a strip of tape across every joint. Labels are HTML Meta over
 * the figure (never SVG text). A figure ground, not a surface: no controls,
 * no verdicts, ink and stone text only (muted fails on the panel, 4.13 — so
 * the panel remaps --fg-ghost to stone for any separator inside it).
 */
export function Schematic({
  fig,
  nodes,
  fork,
  caption,
  className,
}: {
  /** The Meta FIG label (true values), e.g. "FIG. 1 • TRADING_ALGOS- • 4 STAGES". */
  fig: string;
  nodes: readonly SchematicNode[];
  /** Two terminal nodes the chain splits into (e.g. survivors | kill-list). */
  fork?: readonly [SchematicNode, SchematicNode];
  /** Rendered under the figure (e.g. a registry caption). */
  caption?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useDrawPhase(ref, 0.35);
  const W = 360;
  const NH = 64;
  const GAP = 30;
  const rows = nodes.length + (fork ? 1 : 0);
  const H = 24 + rows * NH + (rows - 1) * GAP + 24;
  const yOf = (i: number) => 24 + i * (NH + GAP);
  type Box = { x: number; y: number; w: number; node: SchematicNode; key: string };
  const boxes: Box[] = nodes.map((node, i) => ({ x: 36, y: yOf(i), w: W - 72, node, key: `n${i}` }));
  if (fork) {
    const y = yOf(nodes.length);
    boxes.push({ x: 20, y, w: 150, node: fork[0], key: "f0" });
    boxes.push({ x: W - 170, y, w: 150, node: fork[1], key: "f1" });
  }
  const joints: string[] = [];
  const tapes: { x: number; y: number }[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const y1 = yOf(i) + NH;
    const y2 = yOf(i + 1);
    joints.push(`M${W / 2} ${y1} L${W / 2} ${y2}`);
    tapes.push({ x: W / 2, y: (y1 + y2) / 2 });
  }
  if (fork && nodes.length) {
    const y1 = yOf(nodes.length - 1) + NH;
    const y2 = yOf(nodes.length);
    const ym = (y1 + y2) / 2;
    joints.push(`M${W / 2} ${y1} L${W / 2} ${ym} M95 ${ym} L${W - 95} ${ym} M95 ${ym} L95 ${y2} M${W - 95} ${ym} L${W - 95} ${y2}`);
    tapes.push({ x: W / 2, y: ym });
  }

  return (
    <figure ref={ref} className={cn("rounded-frame bg-(--bp-panel) p-tier-group [--fg-ghost:var(--fg-muted)] sm:p-8", className)} data-figure="schematic">
      <figcaption className="type-meta text-fg-muted">{fig}</figcaption>
      <div className="relative mx-auto mt-tier-group w-full max-w-[26rem]" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false" className="absolute inset-0 size-full">
          {joints.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              className="stroke-(--w-bp-line)"
              strokeWidth={1.5}
              {...drawn(phase, { duration: dur.draw.short, delay: 0.25 + i * 0.12 })}
            />
          ))}
          {tapes.map((t, i) => (
            <motion.rect
              key={`tape-${i}`}
              x={t.x - 9}
              y={t.y - 3.5}
              width={18}
              height={7}
              rx={1}
              transform={`rotate(-14 ${t.x} ${t.y})`}
              fill="none"
              className="stroke-(--w-bp-line)"
              strokeWidth={1}
              strokeOpacity={0.7}
              {...faded(phase, { delay: 0.5 + i * 0.12 })}
            />
          ))}
          {boxes.map((b, i) => (
            <g key={b.key}>
              <motion.rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={NH}
                rx={6}
                fill="none"
                className="stroke-(--w-bp-line)"
                strokeWidth={1.5}
                {...drawn(phase, { duration: dur.draw.med, delay: i * 0.12 })}
              />
              {[
                [b.x + 7, b.y + 7],
                [b.x + b.w - 7, b.y + 7],
                [b.x + 7, b.y + NH - 7],
                [b.x + b.w - 7, b.y + NH - 7],
              ].map(([cx, cy], k) => (
                <motion.circle
                  key={k}
                  cx={cx}
                  cy={cy}
                  r={2.1}
                  fill="none"
                  className="stroke-(--w-bp-line)"
                  strokeWidth={1}
                  {...faded(phase, { delay: 0.3 + i * 0.12 })}
                />
              ))}
            </g>
          ))}
        </svg>
        {boxes.map((b) => (
          <div
            key={b.key}
            className="absolute flex flex-col items-center justify-center px-3 text-center"
            style={{
              left: `${(b.x / W) * 100}%`,
              top: `${(b.y / H) * 100}%`,
              width: `${(b.w / W) * 100}%`,
              height: `${(NH / H) * 100}%`,
            }}
          >
            <span className="type-meta leading-tight text-fg">{b.node.label}</span>
            {b.node.note ? <span className="type-meta leading-tight text-fg-muted">{b.node.note}</span> : null}
          </div>
        ))}
      </div>
      {caption ? <div className="mt-tier-group">{caption}</div> : null}
    </figure>
  );
}
