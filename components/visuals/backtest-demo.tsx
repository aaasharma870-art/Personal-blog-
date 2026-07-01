"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
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
  const stroke = mode === "naive" ? "#2dd4bf" : "#ef6f6c";
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
    <div className="rounded-xl border border-line bg-surface/60 p-5 shadow-[inset_0_1px_0_0_rgba(230,237,243,0.06),0_1px_2px_-1px_rgba(0,0,0,0.5),0_18px_40px_-22px_rgba(0,0,0,0.7)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-gold/80">Interactive · conceptual</p>
          <h4 className="mt-2 font-serif text-xl font-medium text-ink">
            Why a pretty backtest isn&rsquo;t an edge
          </h4>
        </div>
        <span className="rounded-full border border-line bg-elevated/60 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-wider text-muted">
          Synthetic · illustrative
        </span>
      </div>

      {/* toggle */}
      <div className="mt-4 inline-flex rounded-lg border border-line bg-canvas/40 p-1">
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
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === m
                ? m === "naive"
                  ? "bg-aqua/15 text-aqua"
                  : "bg-ember/15 text-ember"
                : "text-stone hover:text-ink",
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
          className="h-60 w-full touch-none"
          role="img"
          aria-label="Conceptual, synthetic equity curve illustrating how realistic costs and out-of-sample testing erode a naïve backtest."
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="bd-aqua" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="bd-ember" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef6f6c" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef6f6c" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={W}
              y1={H * g}
              y2={H * g}
              stroke="rgba(230,237,243,0.06)"
              strokeWidth="1"
            />
          ))}
          {/* baseline at the starting index (100) */}
          <line
            x1="0"
            x2={W}
            y1={sy(100)}
            y2={sy(100)}
            stroke="rgba(230,237,243,0.18)"
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
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={false}
            animate={{ d: PATHS[mode].line, stroke }}
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
                stroke="rgba(45,212,191,0.55)"
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
                stroke="rgba(230,237,243,0.25)"
                strokeWidth="1"
              />
              <circle cx={sx(hover)} cy={sy(hoverVal)} r="3.5" fill={stroke} />
            </g>
          ) : null}
        </svg>

        {/* readout */}
        <div className="pointer-events-none absolute right-2 top-1 rounded-md border border-line bg-canvas/80 px-2.5 py-1 font-mono text-[0.66rem] text-stone backdrop-blur-sm">
          <span className="text-muted">index </span>
          <span className="tnum text-ink">
            {(hoverVal ?? endDisplay).toFixed(1)}
          </span>
          <span className="text-muted"> · start 100</span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Synthetic illustration, not my results. Same idea every strategy meets:
        a curve that looks unbeatable with{" "}
        <span className="text-aqua/90">no costs and in-sample tuning</span>{" "}
        often flattens or bleeds once you add{" "}
        <span className="text-ember/90">realistic costs and an honest holdout</span>.
        That gap is exactly what the gauntlet above is built to expose.
      </p>
    </div>
  );
}
