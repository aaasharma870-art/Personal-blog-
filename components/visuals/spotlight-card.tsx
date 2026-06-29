"use client";

import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * SpotlightCard — a soft radial spotlight follows the cursor (written to a CSS
 * variable, so no React re-render), the hairline border warms toward the accent,
 * and with `tilt` the whole card gives a subtle 3D response toward the pointer.
 * Reimplemented by hand, inspired by React Bits "SpotlightCard" (reactbits.dev).
 * All pointer motion is disabled under prefers-reduced-motion; the static
 * border-warm-on-hover remains.
 */
export function SpotlightCard({
  children,
  className,
  accent = "gold",
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: "gold" | "cyan";
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

  const glow =
    accent === "cyan" ? "rgba(244,183,64,0.2)" : "rgba(45,212,191,0.22)";

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
        accent === "cyan" ? "hover:border-cyan/50" : "hover:border-gold/50",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background: `radial-gradient(320px circle at var(--x, 50%) var(--y, 0px), ${glow}, transparent 62%)`,
        }}
      />
      {/* top accent border that DRAWS in from the centre on hover */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-center scale-x-0 bg-gradient-to-r from-transparent to-transparent transition-transform duration-300 group-hover:scale-x-100",
          accent === "cyan" ? "via-cyan/70" : "via-gold/70",
        )}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
