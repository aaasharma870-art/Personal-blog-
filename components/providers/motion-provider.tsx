"use client";

import { Fragment } from "react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/flags";

/**
 * App-wide reduced-motion handling. `reducedMotion="user"` makes Motion honor
 * the OS preference automatically (disables transform/layout animation, keeps
 * opacity), complementing the per-component useReducedMotion() guards.
 *
 * Hydration: the server can't know the preference, so every component
 * hydrates as motion-on (lib/flags.ts `useReducedMotion` is false on the
 * server and during hydration). When the real value turns out to be
 * "reduce", the keyed Fragment remounts the app ONCE so each component mounts
 * fresh in its reduced form. Many components pick reduced values through
 * mount-only props (`initial`, `useState` seeds), which a plain re-render
 * would not apply. Motion-on visitors never remount.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <Fragment key={reduce ? "reduced" : "full"}>{children}</Fragment>
    </MotionConfig>
  );
}
