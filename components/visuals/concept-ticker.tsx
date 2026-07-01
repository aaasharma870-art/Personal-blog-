"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * ConceptTicker — a streaming market-panel UI shown purely as a CONCEPT. The
 * values are SIMULATED (a seeded random-walk on the client), never a live feed,
 * and the panel says so prominently. It demonstrates the front-end for a future
 * delayed feed wired through a serverless proxy (so an API key is never exposed).
 * Deterministic initial render → no hydration mismatch; the walk starts on mount.
 */
type Row = { sym: string; name: string; base: number; price: number };

const SEED: Row[] = [
  { sym: "ES", name: "S&P 500 future", base: 5430.25, price: 5430.25 },
  { sym: "NQ", name: "Nasdaq-100 future", base: 19320.5, price: 19320.5 },
  { sym: "VIX", name: "Volatility index", base: 14.62, price: 14.62 },
];

export function ConceptTicker() {
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<Row[]>(SEED);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setRows((rs) =>
        rs.map((r) => {
          const step = (Math.random() - 0.5) * r.base * 0.0009;
          return { ...r, price: Math.max(0, r.price + step) };
        }),
      );
      setTick((t) => t + 1);
    }, 1700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface/60 p-5 shadow-[inset_0_1px_0_0_rgba(230,237,243,0.06),0_1px_2px_-1px_rgba(0,0,0,0.5),0_18px_40px_-22px_rgba(0,0,0,0.7)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-stone">
            Market panel
          </span>
        </div>
        <span className="rounded-full border border-amber/40 px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-wider text-amber">
          Concept · simulated
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((r) => {
          const chg = ((r.price - r.base) / r.base) * 100;
          const up = chg >= 0;
          return (
            <div
              key={r.sym}
              className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-mono text-sm font-medium text-ink">{r.sym}</p>
                <p className="text-[0.68rem] text-muted">{r.name}</p>
              </div>
              <div className="relative text-right">
                {!reduce ? (
                  <motion.span
                    key={tick}
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-2 inset-y-0 rounded bg-aqua/10"
                    initial={{ opacity: 0, y: -1 }}
                    animate={{ opacity: [0, 0.25, 0], y: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
                <p className="tnum font-mono text-sm text-ink">
                  {r.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={cn(
                    "tnum flex items-center justify-end gap-0.5 font-mono text-[0.68rem]",
                    up ? "text-aqua" : "text-ember",
                  )}
                >
                  {up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {up ? "+" : ""}
                  {chg.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-auto pt-5 text-[0.68rem] leading-relaxed text-muted">
        UI concept — not a live feed. The markets I actually research (ES/NQ).
        A real delayed feed via a serverless proxy is planned, so an API key is
        never shipped to the browser.
      </p>
    </div>
  );
}
