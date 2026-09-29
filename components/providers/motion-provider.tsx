"use client";

import { createContext, Fragment, useContext, useEffect, useMemo } from "react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import {
  setMotionPaused,
  syncMotionAttribute,
  useMotionPaused,
  useMotionPausedAtBoot,
  useOsReducedMotion,
} from "@/lib/flags";

/**
 * App-wide motion preference: OS reduced motion + the session Pause toggle.
 *
 * `reducedMotion="user"` makes Motion honour the OS preference automatically
 * (disables transform/layout animation, keeps opacity); while the Pause
 * toggle is on it becomes "always", so Motion treats a paused visitor exactly
 * like a reduced-motion one. Per-component guards read `useReducedMotion()`
 * (lib/flags.ts), which is true for EITHER cause.
 *
 * Hydration: the server can't know either preference, so every component
 * hydrates as motion-on (the flags hooks are false on the server and during
 * hydration). When the real value turns out to be "reduce" — or the page
 * view STARTED paused — the keyed Fragment remounts the app ONCE so each
 * component mounts fresh in its reduced form (many pick reduced values
 * through mount-only props such as Motion's `initial` or `useState` seeds).
 * Toggling Pause mid-session never remounts (that would drop focus from the
 * toggle); consumers re-render and stop their loops instead.
 */

export type MotionPreference = {
  /** Motion is off: OS reduced motion OR paused. Gate every loop on this. */
  reduced: boolean;
  /** The raw OS prefers-reduced-motion preference. */
  osReduced: boolean;
  /** The session Pause toggle. */
  paused: boolean;
  setPaused: (paused: boolean) => void;
};

const MotionPreferenceContext = createContext<MotionPreference | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const osReduced = useOsReducedMotion();
  const paused = useMotionPaused();
  const pausedAtBoot = useMotionPausedAtBoot();

  // CSS mirror (html[data-motion="paused"]) — after hydration, never in render.
  useEffect(() => {
    syncMotionAttribute(paused);
  }, [paused]);

  const value = useMemo<MotionPreference>(
    () => ({
      reduced: osReduced || paused,
      osReduced,
      paused,
      setPaused: setMotionPaused,
    }),
    [osReduced, paused],
  );

  return (
    <MotionConfig reducedMotion={paused ? "always" : "user"}>
      <MotionPreferenceContext.Provider value={value}>
        <Fragment key={osReduced || pausedAtBoot ? "reduced" : "full"}>
          {children}
        </Fragment>
      </MotionPreferenceContext.Provider>
    </MotionConfig>
  );
}

/**
 * The motion preference every loop, video and canvas reads. Inside
 * MotionProvider (the whole app) it is the shared context value; outside it
 * falls back to the same hydration-safe stores, so it is always correct.
 */
export function useMotionPreference(): MotionPreference {
  const ctx = useContext(MotionPreferenceContext);
  const osReduced = useOsReducedMotion();
  const paused = useMotionPaused();
  return (
    ctx ?? {
      reduced: osReduced || paused,
      osReduced,
      paused,
      setPaused: setMotionPaused,
    }
  );
}
