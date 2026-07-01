"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { CountUp } from "@/components/ui/count-up";
import { ease } from "@/lib/motion";
import type { Metric } from "@/lib/content";

/**
 * MetricTile — a flagship "instrument-panel" readout: a thin aqua tick + mono
 * micro-label frame the figure. Count-tiles (neutral magnitudes) get a one-shot
 * left->right scan as the count starts. Risk-adjusted ratios (Sharpe/PSR/PF,
 * m.count === undefined) render STATICALLY and un-counted so they read soberly
 * (honesty guardrail). Scan is transform/opacity only and off under reduced motion.
 */
export function MetricTile({ m }: { m: Metric }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const scan = Boolean(m.count) && !reduce;

  return (
    <div
      ref={ref}
      className="card-lift relative overflow-hidden rounded-lg border border-line bg-elevated/60 p-4 hover:border-aqua/40"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-aqua/60"
      />
      {scan && inView ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(45,212,191,0.14), transparent)",
          }}
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "360%", opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, ease }}
        />
      ) : null}
      <div className="relative pl-2.5">
        <div className="eyebrow mb-1 text-[0.6rem] text-muted">{m.label}</div>
        <div className="tnum font-mono text-2xl font-medium text-aqua">
          {m.count ? <CountUp value={m.value} /> : m.value}
        </div>
        {m.note ? (
          <div className="mt-0.5 text-xs text-muted">{m.note}</div>
        ) : null}
      </div>
    </div>
  );
}
