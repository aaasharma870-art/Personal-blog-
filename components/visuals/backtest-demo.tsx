"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { animate, motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";

/**
 * BacktestDemo — an INTERACTIVE, EXPLICITLY-CONCEPTUAL visualisation of the
 * site's thesis ("guilty until proven innocent"). Toggle between a seductive
 * zero-cost / in-sample curve and the same idea after realistic costs +
 * out-of-sample testing. The data is SYNTHETIC and deterministic (SSR-safe) and
 * is labelled as such everywhere — it is NOT real performance data. When real
 * QuantConnect equity curves are exported, they can replace these series.
 */
const W = 600;
const H = 240;
const N = 60;
const PAD_T = 18;
const PAD_B = 18;

function build() {
  const naive: number[] = [];
  const real: number[] = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    naive.push(100 + 230 * Math.pow(f, 1.25) + 5 * Math.sin(f * Math.PI * 5));
    real.push(
      100 +
        45 * Math.sin(f * Math.PI * 0.85) -
        42 * Math.pow(f, 1.4) +
        6 * Math.sin(f * Math.PI * 9) * Math.exp(-f) -
        16 * Math.exp(-(((f - 0.6) / 0.07) ** 2)),
    );
  }
  return { naive, real };
}

const { naive, real } = build();
const ALL = [...naive, ...real];
const MIN = Math.min(...ALL);
const MAX = Math.max(...ALL);

const sx = (i: number) => (i / N) * W;
const sy = (v: number) =>
  PAD_T + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD_T - PAD_B);

const linePath = (vals: number[]) =>
  `M ${vals.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" L ")}`;
const areaPath = (vals: number[]) =>
  `${linePath(vals)} L ${W},${H} L 0,${H} Z`;

const PATHS = {
  naive: { line: linePath(naive), area: areaPath(naive) },
  real: { line: linePath(real), area: areaPath(real) },
};

type Mode = "naive" | "real";

export function BacktestDemo() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("naive");
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const vals = mode === "naive" ? naive : real;
  // semantic, plane-aware inks: the naive curve is the viewport's in-focus
  // mark (accent); the realistic one is the idea being killed (kill = ember)
  const strokeClass = mode === "naive" ? "stroke-accent" : "stroke-kill";
  const dotClass = mode === "naive" ? "fill-accent" : "fill-kill";
  const fillId = mode === "naive" ? "bd-aqua" : "bd-ember";
  const dur = reduce ? 0 : 0.9;

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = (e.clientX - r.left) / r.width;
    setHover(Math.max(0, Math.min(N, Math.round(frac * N))));
  };

  const hoverVal = hover === null ? undefined : vals[hover];
  const endVal = vals[N] ?? 100;

  const [endDisplay, setEndDisplay] = useState(endVal);
  const prevEnd = useRef(endVal);
  useEffect(() => {
    // Reduced motion updates instantly; otherwise tween the endpoint between
    // modes. setState stays inside animate's async onUpdate (never synchronous
    // in the effect body) to satisfy react-hooks/set-state-in-effect.
    const controls = animate(prevEnd.current, endVal, {
      duration: reduce ? 0 : 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setEndDisplay(v),
    });
    prevEnd.current = endVal;
    return () => controls.stop();
  }, [endVal, reduce]);

  return (
    <div className="surface-1 rounded-frame p-tier-group sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="type-meta text-fg-muted">
            Interactive<span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
            <span className="sr-only">, </span>conceptual
          </p>
          <h4 className="mt-tier-pair type-heading text-fg">
            Why a pretty backtest isn&rsquo;t an edge
          </h4>
        </div>
        <p className="type-meta text-fg">
          Synthetic<span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
          <span className="sr-only">, </span>illustrative
        </p>
      </div>

      {/* toggle */}
      <div className="mt-tier-group inline-flex flex-wrap rounded-control p-1 shadow-[inset_0_0_0_1px_var(--rule)]">
        {(
          [
            ["naive", "Naïve · zero-cost · in-sample"],
            ["real", "Realistic costs · out-of-sample"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "min-h-11 rounded-[9px] px-3 type-small transition-colors",
              mode === m
                ? m === "naive"
                  ? "bg-surface-2 text-fg"
                  : "bg-surface-2 text-kill"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* chart */}
      <div className="relative mt-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-60 w-full touch-pan-y"
          role="img"
          aria-label="Conceptual, synthetic equity curve illustrating how realistic costs and out-of-sample testing erode a naïve backtest."
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="bd-aqua" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="bd-ember" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--kill)", stopOpacity: 0.16 }} />
              <stop offset="100%" style={{ stopColor: "var(--kill)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={W}
              y1={H * g}
              y2={H * g}
              className="stroke-rule"
              strokeWidth="1"
            />
          ))}
          {/* baseline at the starting index (100) */}
          <line
            x1="0"
            x2={W}
            y1={sy(100)}
            y2={sy(100)}
            className="stroke-fg-ghost"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <motion.path
            d={PATHS[mode].area}
            fill={`url(#${fillId})`}
            initial={false}
            animate={{ d: PATHS[mode].area }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d={PATHS[mode].line}
            fill="none"
            className={cn(strokeClass, "transition-[stroke] duration-(--dur-base)")}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={false}
            animate={{ d: PATHS[mode].line }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* one-shot left→right scan on each mode toggle (transform-only, no loop) */}
          {!reduce ? (
            <motion.g
              key={mode}
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: W, opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <line
                x1="0"
                x2="0"
                y1={PAD_T}
                y2={H - PAD_B}
                className="stroke-fg-muted"
                strokeOpacity={0.6}
                strokeWidth="1.5"
              />
            </motion.g>
          ) : null}
          {/* hover crosshair */}
          {hover !== null && hoverVal !== undefined ? (
            <g>
              <line
                x1={sx(hover)}
                x2={sx(hover)}
                y1={PAD_T}
                y2={H - PAD_B}
                className="stroke-fg-ghost"
                strokeWidth="1"
              />
              <circle cx={sx(hover)} cy={sy(hoverVal)} r="3.5" className={dotClass} />
            </g>
          ) : null}
        </svg>

        {/* readout */}
        <div className="surface-2 pointer-events-none absolute right-2 top-1 rounded-control px-2.5 py-1 type-meta text-fg-muted">
          <span>index </span>
          <span className="tnum text-fg">
            {(hoverVal ?? endDisplay).toFixed(1)}
          </span>
          <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
          <span>start 100</span>
        </div>
      </div>

      <p className="mt-tier-group max-w-body type-small text-fg-muted">
        Synthetic illustration, not my results. Same idea every strategy meets:
        a curve that looks unbeatable with{" "}
        <span className="text-fg">no costs and in-sample tuning</span>{" "}
        often flattens or bleeds once you add{" "}
        <span className="text-fg">realistic costs and an honest holdout</span>.
        That gap is exactly what the gauntlet above is built to expose.
      </p>
    </div>
  );
}
