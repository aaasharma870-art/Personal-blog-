"use client";

import { motion } from "motion/react";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/components/providers/motion-provider";

/**
 * MotionToggle — the page's Pause / Resume control for decorative motion
 * (SPEC §13: the WCAG 2.2.2 control; DESIGN v2 §6.5, §9 "waveform").
 *
 * - A native <button aria-pressed>: pressed = motion PAUSED. The accessible
 *   name is the constant `label` (state lives in aria-pressed, so the name
 *   never contradicts it). `label` is a prop so a later pass can rename it.
 * - Writes sessionStorage "motion" = "paused" (try/catch, in-memory fallback)
 *   through the MotionPreference context, which every loop, video, canvas and
 *   reveal reads — and html[data-motion="paused"] stops CSS motion.
 * - Glyph: a sine while motion runs, a flat line while it is off (paused OR
 *   OS reduced motion); the two paths share one command structure, so the
 *   swap morphs on dur.base. On hover AND keyboard focus the sine travels one
 *   period (a one-shot transform transition, never a loop).
 * - ≥ 44 × 44 px target; ink/muted colours only (it is not the viewport's
 *   aqua mark); the global aqua focus ring.
 */
type MotionToggleProps = {
  /** Accessible name (and visible text when `showLabel`). Default "Pause motion". */
  label?: string;
  /** Render the label as visible Meta text beside the glyph (default: sr-only). */
  showLabel?: boolean;
  className?: string;
};

// One wavelength = 12 units; the sine path spans 3 periods (36 units) inside
// a 24-unit window, so shifting it by one period (1/3 of its box) is seamless.
const SINE = "M0 6 C2 1.5 4 1.5 6 6 S10 10.5 12 6 S16 1.5 18 6 S22 10.5 24 6 S28 1.5 30 6 S34 10.5 36 6";
const FLAT = "M0 6 C2 6 4 6 6 6 S10 6 12 6 S16 6 18 6 S22 6 24 6 S28 6 30 6 S34 6 36 6";

export function MotionToggle({
  label = "Pause motion",
  showLabel = false,
  className,
}: MotionToggleProps) {
  const { paused, reduced, setPaused } = useMotionPreference();

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setPaused(!paused)}
      data-motion-toggle={paused ? "paused" : "running"}
      className={cn(
        "group inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-2",
        "text-fg-muted transition-colors duration-(--dur-micro) hover:text-fg focus-visible:text-fg",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 12"
        aria-hidden="true"
        focusable="false"
        className="h-3 w-6 overflow-hidden"
      >
        <motion.path
          initial={false}
          animate={{ d: reduced ? FLAT : SINE }}
          transition={{ duration: dur.base, ease }}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="transition-transform duration-(--dur-reveal) [transform-box:fill-box] group-hover:-translate-x-1/3 group-focus-visible:-translate-x-1/3"
        />
      </svg>
      <span className={showLabel ? "type-meta" : "sr-only"}>{label}</span>
    </button>
  );
}
