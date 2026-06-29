"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide reduced-motion handling. `reducedMotion="user"` makes Motion honor
 * the OS preference automatically (disables transform/layout animation, keeps
 * opacity), complementing the per-component useReducedMotion() guards.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
