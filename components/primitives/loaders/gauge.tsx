"use client";

import { useEffect, useId, useRef } from "react";
import { animate, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { dur, easeDraw, loader as loaderTiming } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_PX, useSvgAttr } from "@/components/primitives/loaders/kit";
import { ChalkBoard } from "@/components/primitives/loaders/chalkboard";

/**
 * LD-3I "The honest gauge" (idiots; SPEC v2 §8, loaders.BAR L1;
 * RECOGNIZABILITY S20). M2: the loader is DRAWN IN CHALK ON A MINI ICE
 * CHALKBOARD (slate green, a wooden frame, a chalk ledge with a stub and a
 * duster: loaders/chalkboard.tsx), so blind it reads as the 3 Idiots
 * classroom; caption cap.loader.idiots "THE ICE CHALKBOARD". The mechanism
 * is unchanged — a gear train in the jugaad register (IC-3I-04: visible
 * bolts, a taped joint):
 * a 12T drive gear and an 8T driven gear meshing at a TRUE 3:2, a pinion on
 * the 8T driving a rack pointer along a dimension line (0/end + 10 ticks).
 *
 * Kinematics are exact (L1): rack x = p·L; θ8 = x / r_pinion; θ12 = −θ8·8/12.
 * The gears never turn while determinate progress is unchanged.
 *   indeterminate  the gears turn at loader.gaugeIdleDegPerS (30°/s) with
 *                  the rack PARKED at 0 ("working", visibly not progressing);
 *                  frozen when the shell's idle stop drops `animate`.
 *   complete       rack at the end; one chalk circle (Rancho's circle,
 *                  IC-3I-02) around the end tick, easeDraw over dur.draw.short.
 *   static         rack at the end; circle drawn.
 */

// — geometry (viewBox 0 0 160 64; module m = 2.4) —
const M = 2.4;
const C12 = { x: 22, y: 26 };
const C8 = { x: 22 + (M * (12 + 8)) / 2, y: 26 }; // centre distance = r12 + r8
const R_PINION = 4;
const DIM_Y = 50;
const D0 = 58;
/** L: the rack's full travel along the dimension line (viewBox units). */
export const GAUGE_L = 92;
const D1 = D0 + GAUGE_L;
const BAR = 24;
const RACK_Y = C8.y + R_PINION;

/** A trapezoid-tooth gear outline, tooth 0 centred at `phase` degrees. */
function gearPath(n: number, cx: number, cy: number, phase: number): string {
  const r = (M * n) / 2;
  const ra = r + M;
  const rr = r - 1.25 * M;
  const pitch = 360 / n;
  const pts: string[] = [];
  const p = (rad: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  };
  for (let k = 0; k < n; k++) {
    const c = phase + k * pitch;
    pts.push(p(rr, c - pitch * 0.34), p(ra, c - pitch * 0.16), p(ra, c + pitch * 0.16), p(rr, c + pitch * 0.34));
  }
  return `M${pts.join("L")}Z`;
}

const G12 = gearPath(12, C12.x, C12.y, 0); // a tooth points at the 8T
const G8 = gearPath(8, C8.x, C8.y, 180 + 22.5); // a gap faces the 12T
const TICKS = Array.from({ length: 11 }, (_, k) => {
  const x = D0 + (k * GAUGE_L) / 10;
  const h = k === 0 || k === 10 ? 5 : 2.5;
  return `M${x.toFixed(1)} ${DIM_Y - h}V${DIM_Y + h}`;
}).join("");
const RACK_TEETH = Array.from({ length: 12 }, (_, k) => `M${(-BAR + 1 + k * 2).toFixed(1)} ${RACK_Y}v-1.6`).join("");
const BOLTS12 = [0, 90, 180, 270]
  .map((d) => {
    const a = ((d + 45) * Math.PI) / 180;
    return `M${(C12.x + 6.5 * Math.cos(a)).toFixed(2)} ${(C12.y + 6.5 * Math.sin(a)).toFixed(2)}h.01`;
  })
  .join("");
/** Rancho's circle around the end tick. */
const CIRCLE = `M${D1 + 8} ${DIM_Y}a8 7 0 1 1 -16 0a8 7 0 1 1 16 0.6`;

type DrawingProps = {
  /** Determinate progress 0–1 (the rack). */
  progress: MotionValue<number>;
  /** Extra 12T rotation in degrees (the idle spin; 0 = none). */
  spin: MotionValue<number>;
  /** Chalk circle draw 0–1. */
  circle: MotionValue<number>;
  /** px per viewBox unit (stroke widths are given in px). */
  scale: number;
  mini?: boolean;
  /** Drawn in chalk (LD-3I on the ICE board): every stroke --w-chalk with a
   *  static chalkRough displacement that turns WITH each gear (the noise is
   *  in the gear's own space, so it never boils). Default: blueprint ink. */
  chalk?: boolean;
  className?: string;
};

/** The gear train drawing, shared by LD-3I and the Card I→II FIG. 0 gauge. */
export function GaugeDrawing({ progress, spin, circle, scale, mini = false, chalk = false, className }: DrawingProps) {
  const filterId = useId();
  const g12 = useRef<SVGGElement>(null);
  const g8 = useRef<SVGGElement>(null);
  const rack = useRef<SVGGElement>(null);
  const x = useTransform(progress, (p) => Math.min(1, Math.max(0, p)) * GAUGE_L);
  // θ8 (deg) = x / r_pinion (rad); θ12 = −θ8·8/12 — plus the idle spin on the 12T
  const theta12 = useTransform([x, spin], ([xv, s]) => -((xv as number) / R_PINION) * (180 / Math.PI) * (8 / 12) + (s as number));
  const theta8 = useTransform(theta12, (t) => (-t * 12) / 8);
  const t12 = useSvgAttr(g12, theta12, "transform", (t) => `rotate(${t.toFixed(2)} ${C12.x} ${C12.y})`);
  const t8 = useSvgAttr(g8, theta8, "transform", (t) => `rotate(${t.toFixed(2)} ${C8.x} ${C8.y})`);
  const tr = useSvgAttr(rack, x, "transform", (v) => `translate(${(D0 + v).toFixed(2)} 0)`);
  const sw = (px: number) => px / scale;
  const roughId = `${filterId}r`;
  const rough = chalk ? `url(#${roughId})` : undefined;
  const cw = chalk ? 1.2 : 1;

  return (
    <svg
      viewBox={mini ? "2 6 58 40" : "0 0 160 64"}
      aria-hidden="true"
      focusable="false"
      className={cn("block h-auto w-full overflow-visible", className)}
      fill="none"
      stroke={chalk ? "var(--w-chalk)" : "var(--w-bp-line)"}
      strokeLinejoin="round"
      strokeLinecap="round"
      data-ink={chalk ? "chalk" : "blueprint"}
    >
      <defs>
        {/* chalkRough: a static displacement (never boiled) on the circle only */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.1} />
        </filter>
        {chalk ? (
          // chalkRough for the whole drawing: one static displacement, applied
          // INSIDE each moving group (it travels with its part; never boils)
          <filter id={roughId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={0.7} />
          </filter>
        ) : null}
      </defs>
      <g ref={g12} transform={t12}>
        <g filter={rough}>
          <path d={G12} strokeWidth={sw(1.5 * cw)} />
          <circle cx={C12.x} cy={C12.y} r={2.2} strokeWidth={sw(1.25 * cw)} />
          <path d={BOLTS12} strokeWidth={sw(2.2)} />
        </g>
      </g>
      <g ref={g8} transform={t8}>
        <g filter={rough}>
          <path d={G8} strokeWidth={sw(1.5 * cw)} />
          <circle cx={C8.x} cy={C8.y} r={R_PINION} strokeWidth={sw(1.25 * cw)} />
          <path d={`M${C8.x - 2} ${C8.y}H${C8.x + 2}`} strokeWidth={sw(1.25 * cw)} />
        </g>
      </g>
      {mini ? null : (
        <>
          {/* dimension line: 0 / end + 10 ticks (bp-line) */}
          <path d={`M${D0} ${DIM_Y}H${D1}${TICKS}`} strokeWidth={sw(1 * cw)} filter={rough} />
          {/* the rack: a toothed bar that slides under the pinion, its pointer
              riding the dimension line; a taped joint mid-bar (jugaad) */}
          <g ref={rack} transform={tr}>
            <g filter={rough}>
              <path d={`M${-BAR} ${RACK_Y}H0${RACK_TEETH}`} strokeWidth={sw(1.25 * cw)} />
              <path
                d={`M${-BAR / 2 - 1.5} ${RACK_Y - 1.8}h3v3.6h-3z`}
                stroke={chalk ? "var(--w-chalk)" : "var(--w-graphite)"}
                strokeOpacity={chalk ? 0.6 : 1}
                strokeWidth={sw(1)}
              />
              <path d={`M0 ${RACK_Y}V${DIM_Y - 7}M-2.4 ${DIM_Y - 7}H2.4L0 ${DIM_Y - 2.2}Z`} strokeWidth={sw(1.25 * cw)} />
            </g>
          </g>
          <g filter={`url(#${filterId})`}>
            <DrawPath d={CIRCLE} progress={circle} stroke="var(--w-chalk)" strokeWidth={sw(2)} />
          </g>
        </>
      )}
    </svg>
  );
}

export default function GaugeLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <Gauge key={props.mode} {...props} />;
}

function Gauge({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const spin = useMotionValue(0);
  const circle = useMotionValue(mode === "static" ? 1 : 0);
  const mini = size === "mini";

  // idle spin: 30°/s with the rack parked; frozen in place when stopped
  useEffect(() => {
    if (mode !== "indeterminate" || !running) return;
    const controls = animate(spin, spin.get() + 360, {
      duration: 360 / loaderTiming.gaugeIdleDegPerS,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [mode, running, spin]);

  // the circle: drawn on at complete (motion on), present at static / RM
  useEffect(() => {
    if (mode === "static" || (mode === "complete" && reduced)) {
      circle.jump(1);
      return;
    }
    if (mode !== "complete") {
      circle.jump(0);
      return;
    }
    const controls = animate(circle, 1, { duration: dur.draw.short, ease: easeDraw });
    return () => controls.stop();
  }, [mode, reduced, circle]);

  // indeterminate parks the rack at 0; complete/static show it at the end
  const parked = useMotionValue(0);
  const full = useMotionValue(1);
  const rackP = mode === "indeterminate" ? parked : mode === "determinate" ? progress : full;

  // the drawing fills the board's content box (80 % of its width; mini 62 %)
  return (
    <ChalkBoard size={size}>
      <GaugeDrawing
        progress={rackP}
        spin={spin}
        circle={circle}
        mini={mini}
        chalk
        scale={(SIZE_PX[size] * (mini ? 0.62 : 0.8)) / (mini ? 58 : 160)}
      />
    </ChalkBoard>
  );
}
