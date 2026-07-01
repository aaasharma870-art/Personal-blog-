"use client";

import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * SpotlightCard — a tiered, physically-lit surface. A soft radial spotlight
 * follows the cursor (written to a CSS variable, so no React re-render), a
 * static edge-light rim (::before gradient border via mask-composite) plus an
 * inner top highlight and a layered rest shadow give real depth, and the border
 * warms toward the accent on hover. With `tilt` the whole card gives a subtle
 * 3D response toward the pointer. Inspired by React Bits "SpotlightCard".
 *
 * The inset highlight + layered shadow are the LOAD-BEARING depth cue so the
 * card still reads as raised if `mask-composite` no-ops (Safari). All pointer
 * motion is disabled under prefers-reduced-motion; the static depth remains.
 */
type Accent = "aqua" | "amber" | "gold" | "cyan";
type Tier = "flat" | "raised" | "showcase";

export function SpotlightCard({
  children,
  className,
  accent = "aqua",
  tier = "raised",
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: Accent;
  tier?: Tier;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const srx = useSpring(rotX, { stiffness: 150, damping: 18, mass: 0.3 });
  const sry = useSpring(rotY, { stiffness: 150, damping: 18, mass: 0.3 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    el.style.setProperty("--x", `${px}px`);
    el.style.setProperty("--y", `${py}px`);
    if (tilt && !reduce) {
      const nx = px / r.width - 0.5;
      const ny = py / r.height - 0.5;
      rotY.set(nx * 5); // max ~5deg
      rotX.set(-ny * 5);
    }
  };
  const reset = () => {
    rotX.set(0);
    rotY.set(0);
  };

  // aqua is default; amber reserved for supporting / Option-Alpha cards.
  // Legacy aliases: gold ≡ aqua, cyan ≡ amber (no hue shift).
  const isAmber = accent === "amber" || accent === "cyan";
  const glow = isAmber ? "rgba(244,183,64,0.2)" : "rgba(45,212,191,0.22)";

  // Static edge-light rim (gradient border via mask-composite). flat = none.
  const rim =
    tier === "flat"
      ? ""
      : cn(
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:p-px",
          "before:[-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
          tier === "showcase"
            ? "before:[background:linear-gradient(180deg,rgba(230,237,243,0.2),rgba(230,237,243,0.03)_38%,transparent_70%)]"
            : "before:[background:linear-gradient(180deg,rgba(230,237,243,0.16),rgba(230,237,243,0.02)_38%,transparent_70%)]",
        );

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={
        tilt && !reduce
          ? { rotateX: srx, rotateY: sry, transformPerspective: 900 }
          : undefined
      }
      className={cn(
        "card-lift group relative overflow-hidden rounded-xl border border-line bg-gradient-to-b from-elevated/80 to-surface",
        // inner top highlight + layered rest shadow, one declaration (last shadow- wins)
        "shadow-[inset_0_1px_0_0_rgba(230,237,243,0.06),0_1px_2px_-1px_rgba(0,0,0,0.5),0_16px_36px_-18px_rgba(0,0,0,0.75)]",
        rim,
        isAmber ? "hover:border-amber/50" : "hover:border-aqua/50",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background: `radial-gradient(320px circle at var(--x, 50%) var(--y, 0px), ${glow}, transparent 62%)`,
        }}
      />
      {/* showcase: faint aqua top-rim at rest, intensified by the hover hairline below */}
      {tier === "showcase" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-aqua/25 to-transparent"
        />
      ) : null}
      {/* top accent border that DRAWS in from the centre on hover */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-0 h-0.5 origin-center scale-x-0 bg-gradient-to-r from-transparent to-transparent transition-transform duration-300 group-hover:scale-x-100",
          isAmber ? "via-amber/70" : "via-aqua/70",
        )}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
