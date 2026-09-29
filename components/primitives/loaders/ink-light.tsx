"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { loader as loaderTiming } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useSvgAttr } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, LINE_VIEWBOX } from "@/components/primitives/loaders/line";
import { CANDLE_SPRITE, LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";

/**
 * LD-HP "Light finds the ink" (hp; SPEC v2 §8). Harry Potter reveals: a cool
 * point of light (the wand-tip light, never the wand) travels the Line; the
 * ink behind it reaches full strength and a floating candle (IC-HP-03)
 * lights at every ⅛.
 *
 *   determinate    light at pathLength = progress (direct); ink behind it at
 *                  100 %, the rest of the Line a faint 35 % ink stroke.
 *   indeterminate  the light breathes at the Line's start (opacity .6 ↔ 1 at
 *                  0.5 Hz) and the first 12 % of ink holds drawn; frozen when
 *                  the shell's idle stop drops `animate`.
 *   complete       all candles lit; the light rests at the end.
 *   static         ink drawn, candles lit, the light at the end.
 * Luminous points are pre-rendered sprites only (L6); 0 text (L7).
 */

const CANDLES = 8;
const W = LINE_VIEWBOX.w;
const H = LINE_VIEWBOX.h;
/** Candle k hovers above the Line at fraction k/8. */
const CANDLE_AT = Array.from({ length: CANDLES }, (_, i) => LINE.at((i + 1) / CANDLES));

export default function InkLightLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <InkLight key={props.mode} {...props} />;
}

function InkLight({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const scale = SIZE_PX[size] / W;
  const sw = (px: number) => px / scale;
  const one = useMotionValue(1);
  const start = useMotionValue(0.12);
  const p = mode === "determinate" ? progress : mode === "indeterminate" ? start : one;

  // indeterminate breathing of the light at the start
  const glow = useMotionValue(1);
  useEffect(() => {
    if (mode !== "indeterminate" || !running) return;
    const half = 1 / loaderTiming.inkBreatheHz / 2;
    const c = animate(glow, [glow.get(), 0.6, 1], { duration: half * 2, ease: "easeInOut", repeat: Infinity });
    return () => c.stop();
  }, [mode, running, glow]);
  useEffect(() => {
    if (reduced) glow.jump(1);
  }, [reduced, glow]);

  // the light's position along the Line (indeterminate: resting at the start)
  const zero = useMotionValue(0);
  const lightAt: MotionValue<number> = mode === "indeterminate" ? zero : p;
  const light = useRef<SVGImageElement>(null);
  const size0 = 72;
  const xy = (v: number) => {
    const q = LINE.at(v);
    return `translate(${(q.x - size0 / 2).toFixed(1)} ${(q.y - size0 / 2).toFixed(1)})`;
  };
  const t0 = useSvgAttr(light, lightAt, "transform", xy);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg
        viewBox={`0 -60 ${W} ${H + 60}`}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
      >
        {/* the whole Line, faint (ink-contour at 35 %) */}
        <path d={LINE_D} fill="none" stroke="var(--w-ink-contour)" strokeOpacity={0.35} strokeWidth={sw(1.2)} strokeLinecap="round" />
        {/* ink behind the light at full strength (direct p) */}
        <DrawPath d={LINE_D} progress={p} stroke="var(--w-ink-contour)" strokeWidth={sw(1.2)} strokeLinecap="round" />
        {CANDLE_AT.map((q, i) => (
          <Candle key={i} x={q.x} y={q.y} lit={p} at={(i + 1) / CANDLES} />
        ))}
        <motion.g style={{ opacity: glow }}>
          <image ref={light} href={LUMOS_SPRITE} width={size0} height={size0} transform={t0} />
        </motion.g>
      </svg>
    </span>
  );
}

/** One floating candle, lit once the light has passed its fraction. */
function Candle({ x, y, lit, at }: { x: number; y: number; lit: MotionValue<number>; at: number }) {
  const opacity = useTransform(lit, (v) => (v >= at - 1e-6 ? 1 : 0));
  // hover above the Line, bobbing never (DOM sprites stay still: no loops)
  return (
    <motion.image
      href={CANDLE_SPRITE}
      x={x - 12}
      y={y - 120}
      width={24}
      height={72}
      preserveAspectRatio="none"
      style={{ opacity }}
    />
  );
}
