"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";
import { Check } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { Variants } from "motion/react";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * QuantPanel — an editorial "research terminal" motif for the hero.
 * Intentionally NOT a performance chart: the line is an abstract, deterministic
 * signal converging under validation, and the log lines describe the *process*
 * (which is real), never fabricated returns. Honors the no-fake-data guardrail.
 *
 * Animated: the signal path draws itself and each process step "checks in" with
 * a staggered slide — the strongest honest metaphor on the page, made alive.
 * Reduced motion renders everything statically.
 */
export function QuantPanel({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  // Spec §3: ≤5° tilt, snappy-ish spring (stiffness 150 / damping 20).
  const rotateX = useSpring(tiltX, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(tiltY, { stiffness: 150, damping: 20 });

  const onTilt = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2); // -1..1
    const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2); // -1..1
    tiltY.set(Math.max(-5, Math.min(5, px * 5)));
    tiltX.set(Math.max(-5, Math.min(5, -py * 5)));
  };
  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const W = 340;
  const H = 150;
  const mid = H * 0.52;
  const N = 90;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const damp = Math.exp(-f * 2.6);
    const y = mid - Math.sin(f * Math.PI * 5) * 30 * damp - 14 * f;
    pts.push(`${(f * W).toFixed(1)},${y.toFixed(1)}`);
  }
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  const log = [
    { k: "pre-register", v: "committed" },
    { k: "blind holdout", v: "spent once" },
    { k: "deflated sharpe", v: "applied" },
    { k: "look-ahead audit", v: "clean" },
  ];

  const list: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.45 } },
  };
  const row: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: -12 },
        show: { opacity: 1, x: 0, transition: { duration: dur.base, ease } },
      };
  const viewport = { once: true, amount: 0.5 } as const;

  return (
    <div className={cn("[perspective:900px]", className)}>
      <motion.div
        ref={cardRef}
        onMouseMove={onTilt}
        onMouseLeave={resetTilt}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-xl border border-line bg-elevated/80 p-4 ring-1 ring-aqua/10 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.9),0_8px_24px_-12px_rgba(0,0,0,0.7)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-gradient-to-b before:from-white/[0.04] before:to-transparent before:content-['']"
      >
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ember/70" />
          <span className="h-2 w-2 rounded-full bg-gold/70" />
          <span className="h-2 w-2 rounded-full bg-cyan/70" />
        </div>
        <span className="eyebrow text-muted">validation.log</span>
      </div>

      {/* abstract signal */}
      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[150px] w-full"
          role="img"
          aria-label="Abstract signal converging under validation — illustrative, not performance data."
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="qp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* faint baseline grid */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={W}
              y1={H * g}
              y2={H * g}
              stroke="rgba(230,237,243,0.07)"
              strokeWidth="1"
            />
          ))}
          <motion.path
            d={areaPath}
            fill="url(#qp-fill)"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease, delay: 0.35 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={reduce ? undefined : { pathLength: 1 }}
            viewport={viewport}
            transition={{ duration: 1.4, ease }}
          />
        </svg>
        <span className="eyebrow absolute right-1 top-1 text-[0.6rem] text-stone">
          signal / noise · illustrative
        </span>
      </div>

      {/* process log — each step checks in on a stagger */}
      <motion.dl
        className="mt-3 space-y-1.5 font-mono text-[0.72rem]"
        variants={list}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {log.map((r) => (
          <motion.div
            key={r.k}
            variants={row}
            className="flex items-center gap-2 text-muted"
          >
            <dt className="text-stone">{r.k}</dt>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <dd className="tnum flex items-center gap-1 text-gold/90">
              <Check className="h-3 w-3 text-gold" aria-hidden="true" />
              {r.v}
            </dd>
          </motion.div>
        ))}
      </motion.dl>
      <motion.p
        className="mt-1.5 flex items-center gap-1.5 pt-1 font-mono text-[0.72rem] text-stone"
        initial={reduce ? false : { opacity: 0, y: 4 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: dur.base, ease, delay: 0.45 + 0.18 * log.length }}
      >
        <span className="text-gold">{"›"}</span>
        <span>verdict: survives blind test</span>
        <span className="cursor-blink ml-0.5 inline-block h-3.5 w-[7px] bg-gold/80" />
      </motion.p>
      </motion.div>
    </div>
  );
}
