"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

/**
 * ScrollVelocity — faint aqua "speed lines" down the left/right edges that fade
 * in proportionally to how fast you're scrolling (either direction) and vanish
 * at rest. Makes fast scrolling feel kinetic and rewarding. Transform/opacity
 * only, pointer-events-none, and disabled under reduced motion.
 */
export function ScrollVelocity() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  // Light, fast spring (low mass, ζ≈0.9): rises within a few frames of a normal
  // scroll and settles back to 0 in ~120ms. (Heavy damping/mass = sluggish, not
  // snappy — it would never leave 0 during a short scroll burst.)
  const smooth = useSpring(velocity, { stiffness: 500, damping: 16, mass: 0.15 });
  // map |velocity| (px/s) → glow opacity; threshold low enough that an ordinary
  // scroll already shows it, full glow on a fast flick. Symmetric up/down.
  const opacity = useTransform(
    smooth,
    [-1800, -250, 0, 250, 1800],
    [0.5, 0, 0, 0, 0.5],
  );

  if (reduce) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          opacity,
          background:
            "linear-gradient(to right, rgba(45,212,191,0.18), transparent)",
        }}
        className="pointer-events-none fixed inset-y-0 left-0 z-[55] w-24 mix-blend-screen"
      />
      <motion.div
        aria-hidden="true"
        style={{
          opacity,
          background:
            "linear-gradient(to left, rgba(45,212,191,0.18), transparent)",
        }}
        className="pointer-events-none fixed inset-y-0 right-0 z-[55] w-24 mix-blend-screen"
      />
    </>
  );
}
