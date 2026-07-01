import type { Variants } from "motion/react";

/* ============================================================================
   MOTION TOKENS — one timing language for the whole site.
   Principle (Motion + Emil Kowalski): senior motion reads as CONSISTENCY, not
   variety. One ease-out curve, a tight duration scale, transform+opacity only,
   and a real reduced-motion path. Color/spacing tokens live in globals.css;
   timing lives here. Do not introduce per-component magic numbers.
   ========================================================================== */

/** Near-universal ease-out (used for entrances + most micro-interactions). */
export const ease = [0.22, 1, 0.36, 1] as const;

/** Duration scale (seconds). reveal/hero reserved for signature moments only.
 *  Amplified pass: entrances run a touch longer + travel further so the
 *  scroll-reveal is unmistakable (per Aryan's "make it dramatic" direction). */
export const dur = {
  micro: 0.18,
  base: 0.34,
  reveal: 0.62,
  hero: 0.85,
} as const;

/* — Replay grammar (Spec §5). Two named viewport configs; replay is a
     deliberate opt-in, not the global default. —
     viewportOnce      = new DEFAULT for body content: settles ONCE, no
                         mid-scroll re-trigger flicker.
     viewportSignature = re-fires only on a full deliberate re-entry; applied
                         to the ~6 signature beats (Hero, the two MediaBands,
                         Projects header) via <Reveal replay />, and to the
                         SectionSeam transition marker. */
export const viewportOnce = { once: true, amount: 0.25 } as const;
export const viewportSignature = {
  once: false,
  amount: 0.55,
  margin: "-8% 0px -8% 0px",
} as const;

/* — Standard reveal: a precise "settle" (opacity + a small upward drift + a
     hair of scale), NOT a jump. Tightened y:38→24 + scale:0.99 for the
     once-settle grammar (Spec §5). Transform + opacity only. — */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: dur.reveal, ease },
  },
};

/* — Parent that orchestrates a visible stagger over children carrying `item` — */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: dur.reveal, ease } },
};

/* — Directional / scale reveal variants for per-section variety — */
export const revealLeft: Variants = {
  hidden: { opacity: 0, x: -56 },
  show: { opacity: 1, x: 0, transition: { duration: dur.reveal, ease } },
};
export const revealRight: Variants = {
  hidden: { opacity: 0, x: 56 },
  show: { opacity: 1, x: 0, transition: { duration: dur.reveal, ease } },
};
export const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 24 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: dur.reveal, ease } },
};

export type RevealVariant = "up" | "left" | "right" | "scale";
export const revealByName: Record<RevealVariant, Variants> = {
  up: reveal,
  left: revealLeft,
  right: revealRight,
  scale: revealScale,
};

/* — Reduced-motion fallbacks: gentle opacity only, no transform (per Emil) — */
export const revealReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease } },
};

export const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease } },
};

/* ============================================================================
   SPRING TOKENS — one physics language shared by ScrollProgress,
   ScrollVelocity, Parallax(Layer), and every scrub. Passed straight to
   motion/react's useSpring(). Do not inline per-component spring configs.
   ========================================================================== */

/** Parallax / progress / scrub — buttery, weighted, no visible overshoot. */
export const springSoft = { stiffness: 120, damping: 30, mass: 0.4 } as const;

/** Velocity edge-glow — fast, light, snaps in on a genuine flick. */
export const springSnappy = {
  stiffness: 500,
  damping: 16,
  mass: 0.15,
} as const;

/** Finale Ken-Burns — slow, heavy, deliberate. */
export const springWeighted = { stiffness: 60, damping: 20 } as const;

/** Nav glide (layoutId active indicator) — crisp but not twitchy. */
export const springNav = { stiffness: 380, damping: 30 } as const;

/* — Masked line reveal (Spec §5): the default h2 / MediaBand-statement
     entrance. The MASK is the consumer's `overflow-hidden` wrapper; this
     variant only slides the inner line up from below its own box. `115%`
     (not 100%) clears ~0.15em descender padding the consumer adds inside the
     mask so g/y/p aren't shaved. Transform-only (no clip-path, no
     background-clip). Reduced-motion swaps to opacity-only. — */
export const maskedLine: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: dur.reveal, ease } },
};

export const maskedLineReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease } },
};
