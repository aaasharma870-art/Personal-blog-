"use client";

import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, easeClip, easeDraw } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { drawn, faded, useDrawPhase } from "@/components/site/world-motion";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/* ============================================================================
   HP INK — Act IV "The Light" and the credits' bookend (SPEC v2 §10.2;
   ICONS HP-07, IC-HP-03, IC-HP-11, IC-HP-15; DESIGN v3 §8.1). Our own
   constructions in ink: --w-ink-contour 1.2 px strokes (the hp `line` ink),
   --w-patronus for the ribbons (the hp `emphasis` ink). Law 1: nothing here
   glows — the candle is an ink drawing; the light belongs to MV-08 media.
   Everything draws or settles ONCE; motion off = the final state.
   ========================================================================== */

/**
 * PatronusRibbons (HP-07) — 3 silver-blue ribbons converge once into the
 * underline of a principle title: ideas condensing out of the dark. Abstract
 * (the stag form is an egg, IC-HP-13). aria-hidden; final state = drawn.
 */
export function PatronusRibbons({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.6);
  const RIBBONS = [
    "M0 3 C22 2 38 15 66 16 L240 16",
    "M4 22 C24 24 42 17 66 16 L240 16",
    "M0 11 C20 8 44 19 66 16 L240 16",
  ];
  return (
    <svg
      ref={ref}
      viewBox="0 0 240 26"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("h-[1.625rem] w-full max-w-[15rem] overflow-visible", className)}
      data-emphasis="ribbon"
    >
      {RIBBONS.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          className="stroke-(--world-emphasis)"
          strokeWidth={1.2}
          strokeOpacity={i === 0 ? 1 : 0.7}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...drawn(phase, { duration: dur.draw.med, delay: 0.1 + i * 0.12 })}
        />
      ))}
    </svg>
  );
}

/**
 * InkCandle (IC-HP-03, the contact's code stand-in for MV-08) — one floating
 * candle drawn in ink at the end of a fading trail of ink points: the light
 * someone left on. No holder, no hand, no glow (the flame is an outline; its
 * light arrives with the MV-08 plate). aria-hidden.
 */
const TRAIL_POINTS = [
  [12, 192, 0.18],
  [28, 186, 0.26],
  [44, 179, 0.34],
  [58, 171, 0.44],
  [72, 163, 0.56],
  [84, 155, 0.7],
] as const;

export function InkCandle({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.5);
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-full overflow-visible", className)}
      data-motif="ink-candle"
    >
      {TRAIL_POINTS.map(([x, y, o], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={1.6}
          className="fill-(--w-ink-contour)"
          fillOpacity={o}
          {...faded(phase, { delay: 0.1 + i * 0.09 })}
        />
      ))}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* the taper (no holder: it floats) */}
        <motion.path
          d="M94 78 L94 150 C94 154 106 154 106 150 L106 78 C106 75 94 75 94 78 Z"
          className="stroke-(--w-ink-contour)"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          {...drawn(phase, { duration: dur.draw.med, delay: 0.55 })}
        />
        {/* the wick and the steady flame, as an outline */}
        <motion.path
          d="M100 76 L100 70 M100 68 C94 60 96 52 100 44 C104 52 106 60 100 68 Z"
          className="stroke-(--w-ink-contour)"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          {...drawn(phase, { duration: dur.draw.short, delay: 1.05 })}
        />
      </g>
    </svg>
  );
}

/**
 * BracketMonogram — the contact close (SPEC SM-12, DESIGN §5.1 use ③): the
 * bracket halves travel in and close around the AS monogram once it is in
 * view, turning ghost → accent AT ARRIVAL: the viewport's one aqua mark.
 * Server HTML / motion off / already in view = resolved. aria-hidden.
 */
export function BracketMonogram({ initials, className }: { initials: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.25 });
  const [arrived, setArrived] = useState(false);
  const resolved = phase === "static" || arrived;
  const travel = phase === "armed" ? 1 : 0;
  const bracket = (side: "l" | "r") => (
    <motion.svg
      viewBox="0 0 12 64"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "h-16 w-3 overflow-visible transition-[stroke] duration-(--dur-base)",
        resolved ? "stroke-accent" : "stroke-fg-ghost",
      )}
      initial={false}
      animate={{ x: travel * (side === "l" ? -56 : 56) }}
      transition={
        phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (phase === "entered") setArrived(true);
      }}
    >
      <path
        d={side === "l" ? "M11 1 L1 1 L1 63 L11 63" : "M1 1 L11 1 L11 63 L1 63"}
        fill="none"
        strokeWidth={2}
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </motion.svg>
  );
  return (
    <div ref={ref} aria-hidden="true" className={cn("flex items-center gap-4", className)} data-motif="bracket-monogram">
      {bracket("l")}
      <span className="type-title text-fg">{initials}</span>
      {bracket("r")}
    </div>
  );
}

/**
 * HallowsMark (IC-HP-11) — the credits' 12 px end mark: three exact
 * primitives (triangle, inscribed circle, line) in ink-contour. Never a
 * brand mark; one per page; aria-hidden.
 */
export function HallowsMark({ className }: { className?: string }) {
  // equilateral triangle, side 22, base at y = 20.5; incircle r = side / (2√3)
  const r = 22 / (2 * Math.sqrt(3));
  const cy = 20.5 - r;
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} aria-hidden="true" focusable="false" className={cn("inline-block overflow-visible", className)} data-motif="hallows">
      <g fill="none" className="stroke-(--w-ink-contour)" strokeWidth={1.2} vectorEffect="non-scaling-stroke">
        <path d={`M1 20.5 L23 20.5 L12 ${(20.5 - 11 * Math.sqrt(3)).toFixed(3)} Z`} />
        <circle cx={12} cy={cy.toFixed(3)} r={r.toFixed(3)} />
        <path d={`M12 ${(20.5 - 11 * Math.sqrt(3)).toFixed(3)} L12 20.5`} />
      </g>
    </svg>
  );
}

/**
 * TimeTurnerLink (IC-HP-15) — "↑ Back to the opening": an hourglass in
 * nested rings that turns 3× in 600 ms on activation, then native scroll to
 * the target. The link text stays literal; the icon is aria-hidden; no spin
 * under reduced motion / Pause (it just scrolls). It never re-arms the intro.
 */
export function TimeTurnerLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const [turns, setTurns] = useState(0);
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduce) return; // plain anchor navigation
    e.preventDefault();
    setTurns((t) => t + 1);
    window.setTimeout(() => {
      const id = href.startsWith("#") ? href.slice(1) : "";
      const el = id ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      if (id) history.replaceState(null, "", href);
    }, 600);
  };
  return (
    <a href={href} onClick={onClick} className={cn("group inline-flex min-h-11 items-center gap-3", className)}>
      <motion.svg
        viewBox="0 0 24 24"
        width={20}
        height={20}
        aria-hidden="true"
        focusable="false"
        className="shrink-0 overflow-visible"
        initial={false}
        animate={{ rotate: turns * 1080 }}
        transition={{ duration: 0.6, ease: easeDraw }}
        data-motif="time-turner"
      >
        <g fill="none" className="stroke-(--w-ink-contour)" strokeWidth={1.2} strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <circle cx="12" cy="12" r="11" />
          <ellipse cx="12" cy="12" rx="8.5" ry="11" />
          <path d="M8.5 6 L15.5 6 L12 12 L15.5 18 L8.5 18 L12 12 Z" />
        </g>
      </motion.svg>
      <span>{children}</span>
    </a>
  );
}
