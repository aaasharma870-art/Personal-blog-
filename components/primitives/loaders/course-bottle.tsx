"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import { useReducedMotion } from "@/lib/flags";
import { dur } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DrawPath, SIZE_CLASS, SIZE_PX, useOneShot, useSvgAttr } from "@/components/primitives/loaders/kit";
import { remap } from "@/components/primitives/loaders/line";

/**
 * LD-PC ALT "The ship in the bottle" (pirates; lib/variants.ts
 * `loader-course.motion` alt). The same verb as the compass — navigation,
 * committed — told by the other great Pirates object: a ship sealed in a
 * bottle. The old trick is honest by construction: the masts lie folded on
 * the deck and are raised by a line pulled out through the neck, so the
 * line that has come out IS the work done.
 *
 *   determinate    the rigging line outside the neck: pathLength = progress
 *                  (direct; a brass thread). The masts rise in turn
 *                  with it — fore over p 0–⅓, main ⅓–⅔, mizzen ⅔–1 — a
 *                  pure function of p (no spring on the progress value).
 *   indeterminate  the bottle rocks on its cradle (±2.5°, 0.5 Hz) with the
 *                  masts down and the line parked at 12 %: working, visibly
 *                  not progressing. Frozen when the shell's idle stop drops
 *                  `animate` (5 s in parallel contexts).
 *   complete       masts up; the cork seats in the neck (0.45 s), the line
 *                  is trimmed, then ONE dur.flash moon glint on the glass
 *                  (area < 0.1 % of the viewport; never repeated).
 *   static         masts up, cork in, no line, no glint.
 * Our own drawing from ship-in-a-bottle conventions (a bottle on a cradle, a
 * square-rigger, a cork) — no film prop, no lettering, no flag device.
 * aria-hidden, focusable=false, no text (L7); tokens only (L17).
 * `mini` crops to the bottle (the line and the loose cork are left out).
 */

// — geometry (viewBox 0 0 160 100) —
const BOTTLE =
  "M26 26H100C112 26 119 34 125 43H141V41H146V63H141V61H125C119 70 112 78 100 78H26C17 78 12 71 12 62V42C12 33 17 26 26 26Z";
const SHEEN = "M28 31.5H74";
const GLINT = "M84 31.5H95";
const PUTTY = "M15 69C28 65 38 71 52 67C66 63 78 70 92 66C104 63 114 68 121 64";
const PUTTY_LOW = "M17 73.5C34 71 52 74.5 70 72C88 69.5 104 73 118 70.5";
const HULL = "M34 58H96L90 66.5C74 69.5 52 69.5 38 67Z";
const STERN = "M34 58V53.5H47V58";
const BOWSPRIT = "M96 58L107 52.5";
/** The rigging line inside, from the bowsprit through the neck. */
const LINE_IN = "M107 52.5L141 52";
/** The line pulled out of the neck, dangling to the cradle — the progress. */
const LINE_OUT = "M146 52C156 52 161 62 157 72C153 81 143 87 131 88";
const CRADLES = "M30 88V83.5Q37 77.5 44 83.5V88M86 88V83.5Q93 77.5 100 83.5V88M22 88H108";
/** Rocking pivot (the cradles' saddle). */
const PIVOT = { x: 65, y: 82 };

type Mast = { x: number; y: number; h: number; w: number; from: number; to: number };
const MASTS: Mast[] = [
  { x: 82, y: 58, h: 22, w: 12, from: 0, to: 1 / 3 },
  { x: 64, y: 58, h: 26, w: 14, from: 1 / 3, to: 2 / 3 },
  { x: 41, y: 53.5, h: 19, w: 10, from: 2 / 3, to: 1 },
];
/** A folded mast lies aft along the deck. */
const DOWN = -84;

/** A square sail bellied forward (toward the bow), between yards ya and yb. */
function sail(w: number, ya: number, yb: number): string {
  const h = w / 2;
  const my = (ya + yb) / 2;
  return `M${-h} ${ya}H${h}Q${h + 2.2} ${my} ${h} ${yb}H${-h}Q${-h + 2.2} ${my} ${-h} ${ya}Z`;
}

const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

export default function CourseBottleLoader(props: LoaderRendererProps) {
  // one MotionValue source per mode (useTransform binds once): remount on mode
  return <Bottle key={props.mode} {...props} />;
}

function Bottle({ mode, size, progress, animate: running }: LoaderRendererProps) {
  const reduced = useReducedMotion();
  const mini = size === "mini";
  const vbW = mini ? 144 : 160;
  const scale = SIZE_PX[size] / vbW;
  const sw = (px: number) => px / scale;

  // the source of the masts and the line, per mode
  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const parked = useMotionValue(0.12);
  const masts = mode === "determinate" ? progress : mode === "indeterminate" ? zero : one;
  const line = mode === "determinate" ? progress : mode === "indeterminate" ? parked : one;

  // indeterminate: the bottle rocks on its cradle; frozen when stopped
  const rock = useMotionValue(0);
  useEffect(() => {
    if (mode !== "indeterminate" || !running || reduced) return;
    const c = animate(rock, [rock.get(), 2.5, 0, -2.5, 0], { duration: 2, ease: "easeInOut", repeat: Infinity });
    return () => c.stop();
  }, [mode, running, reduced, rock]);
  const rockRef = useRef<SVGGElement>(null);
  const rockT = useSvgAttr(rockRef, rock, "transform", (a) => `rotate(${a.toFixed(3)} ${PIVOT.x} ${PIVOT.y})`);

  // complete: the cork seats (0.45 s), the line is trimmed, then one glint
  const cork = useMotionValue(mode === "static" ? 1 : 0);
  const [sealed, setSealed] = useState(mode === "static");
  useEffect(() => {
    if (mode === "static" || (mode === "complete" && reduced)) {
      cork.jump(1);
      return;
    }
    if (mode !== "complete") {
      cork.jump(0);
      return;
    }
    const c = animate(cork, 1, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => setSealed(true),
    });
    return () => c.stop();
  }, [mode, reduced, cork]);
  const glint = useOneShot(mode === "complete" && sealed, dur.flash * 1000, !reduced);
  const lineOpacity = useTransform(cork, (k) => 1 - k);

  return (
    <span className={cn("relative block", SIZE_CLASS[size])}>
      <svg
        viewBox={mini ? "8 20 144 74" : "0 0 160 100"}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full overflow-visible"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* the cradle (fixed) */}
        <path d={CRADLES} stroke="var(--w-brass)" strokeWidth={sw(1.25)} />

        <g ref={rockRef} transform={rockT}>
          {/* the sea of putty, the hull, the masts (inside the glass) */}
          <path d={PUTTY} stroke="var(--w-moon)" strokeWidth={sw(0.75)} opacity={0.7} />
          <path d={PUTTY_LOW} stroke="var(--w-moon)" strokeWidth={sw(0.6)} opacity={0.35} />
          {MASTS.map((m, i) => (
            <MastGroup key={i} mast={m} source={masts} sw={sw} />
          ))}
          <path d={HULL} fill="var(--bg)" stroke="var(--w-brass)" strokeWidth={sw(1.25)} />
          <path d={STERN} fill="var(--bg)" stroke="var(--w-brass)" strokeWidth={sw(1)} />
          <path d={BOWSPRIT} stroke="var(--w-brass)" strokeWidth={sw(1)} />
          <path d={LINE_IN} stroke="var(--w-brass)" strokeWidth={sw(0.6)} opacity={0.8} />

          {/* the glass: outline, a still sheen, the one completion glint */}
          <path d={BOTTLE} stroke="var(--w-moon)" strokeWidth={sw(1)} />
          <path d={SHEEN} stroke="var(--w-moon)" strokeWidth={sw(0.75)} opacity={0.45} />
          <path d={GLINT} stroke="var(--w-moon)" strokeWidth={sw(1.6)} opacity={glint ? 1 : 0} data-bottle-glint={glint ? "" : undefined} />

          {mini ? null : (
            // the rigging line pulled out through the neck (= progress, direct)
            <motion.g style={{ opacity: lineOpacity }}>
              <DrawPath d={LINE_OUT} progress={line} stroke="var(--w-brass)" strokeWidth={sw(1.25)} />
            </motion.g>
          )}
        </g>
        {/* the cork rests on the table (never rocks); it seats at completion */}
        <Cork k={cork} sw={sw} hideLoose={mini} />
      </svg>
    </span>
  );
}

/** One mast with its yards and two square sails, hinged at the deck. */
function MastGroup({ mast, source, sw }: { mast: Mast; source: MotionValue<number>; sw: (px: number) => number }) {
  const ref = useRef<SVGGElement>(null);
  const angle = useTransform(source, (v) => DOWN * (1 - easeOut(remap(v, mast.from, mast.to))));
  const t = useSvgAttr(ref, angle, "transform", (a) => `translate(${mast.x} ${mast.y}) rotate(${a.toFixed(2)})`);
  // furled while folded: the canvas fills out as the mast comes upright
  const canvas = useTransform(source, (v) => 0.35 + 0.65 * remap(v, mast.from, mast.to));
  const { h, w } = mast;
  const ya = -h + 3;
  const yb = -h * 0.58;
  const yc = -h * 0.54;
  const yd = -h * 0.14;
  return (
    <g ref={ref} transform={t}>
      <motion.path
        d={`${sail(w, ya, yb)}${sail(w + 2, yc, yd)}`}
        fill="var(--w-moon)"
        fillOpacity={0.12}
        stroke="var(--w-moon)"
        strokeWidth={sw(0.75)}
        style={{ opacity: canvas }}
      />
      <path
        d={`M0 0V${-h}M${-w / 2 - 1.5} ${ya}H${w / 2 + 1.5}M${-w / 2 - 2.5} ${yc}H${w / 2 + 2.5}`}
        stroke="var(--w-brass)"
        strokeWidth={sw(1.1)}
      />
      {/* a plain pennant at the truck (no device) */}
      <path d={`M0 ${-h}L5.5 ${-h + 1.6}L0 ${-h + 3.2}`} stroke="var(--w-moon)" strokeWidth={sw(0.75)} />
    </g>
  );
}

/** The cork: lying loose beside the cradle (k = 0) → seated in the neck (1). */
function Cork({ k, sw, hideLoose }: { k: MotionValue<number>; sw: (px: number) => number; hideLoose: boolean }) {
  const ref = useRef<SVGGElement>(null);
  const loose = { x: 150, y: 83.5, r: 90 };
  const seated = { x: 146.5, y: 52, r: 0 };
  const fmt = (v: number) => {
    const x = loose.x + (seated.x - loose.x) * v;
    const y = loose.y + (seated.y - loose.y) * v - Math.sin(Math.PI * v) * 10;
    const r = loose.r + (seated.r - loose.r) * v;
    return `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)})`;
  };
  const t = useSvgAttr(ref, k, "transform", fmt);
  const opacity = useTransform(k, (v) => (hideLoose && v < 1 ? 0 : 1));
  return (
    <g ref={ref} transform={t}>
      <motion.g style={{ opacity }}>
        <rect x={-5} y={-7.5} width={10} height={15} rx={1.6} fill="var(--bg)" stroke="var(--w-brass)" strokeWidth={sw(1.1)} />
        <path d="M-3 -3.5H3M-3 0.5H2M-2.5 4H2.5" stroke="var(--w-brass)" strokeWidth={sw(0.6)} opacity={0.6} />
      </motion.g>
    </g>
  );
}
