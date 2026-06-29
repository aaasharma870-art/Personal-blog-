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

/** Reveal config — `once: false` so reveals REPLAY (reset + re-animate when a
 *  block re-enters). CRITICAL: amount is tiny (0.04) so a block counts as
 *  "in view" while ANY part is on screen and only resets once it is FULLY gone.
 *  This keeps the replay/reset behaviour but prevents the dead "black void" at
 *  section boundaries that amount:0.2 caused (content fading out while still
 *  partly visible, before the next section triggered). */
export const viewportReplay = { once: false, amount: 0.04 } as const;

/* — Standard reveal: opacity + a clearly-visible upward drift — */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 38 },
  show: { opacity: 1, y: 0, transition: { duration: dur.reveal, ease } },
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
