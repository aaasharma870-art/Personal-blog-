import type { Variants } from "motion/react";

/* ============================================================================
   MOTION TOKENS — one timing language for the whole site.
   Principle (Motion + Emil Kowalski): senior motion reads as CONSISTENCY, not
   variety. One ease-out curve, a tight duration scale, transform+opacity only,
   and a real reduced-motion path. Color/spacing tokens live in globals.css;
   timing lives here. Do not introduce per-component magic numbers.
   DESIGN v2 (build/DESIGN.md §6.1) adds exactly two scoped curves — easeClip
   (clip/inset openings) and easeDraw (stroke draw-on) — plus the named
   springs and budgets at the bottom of this file. No other eases.
   CSS mirrors: --ease-out / --ease-clip / --ease-draw and --dur-* in globals.css.
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
  /* — DESIGN v2 §6.1 additions (P1-early) — */
  /** Crossfades: preview, mono → colour, plate state swaps, poster → video. */
  preview: 0.26,
  /** A single commit flash (loader tip, contact flare). Never repeats within 1 s. */
  flash: 0.12,
  /** Stroke draw-ons (pair with `easeDraw`): chalk circle / gate derivation /
   *  schematic. All ≤ 1.5 s. */
  draw: { short: 0.7, med: 1.2, long: 1.5 },
} as const;

/** Clip and inset openings ONLY: the Lens aperture and launch, cover clips,
 *  films frames, the dome exit (DESIGN v2 §6.1, VER Obys d.css). */
export const easeClip = [0.16, 1, 0.3, 1] as const;

/** Stroke draw-on ONLY (`pathLength`): ink, chalk, blueprint, course lines,
 *  the bracket drawn-in. Never for position, opacity or UI state. */
export const easeDraw = [0.65, 0, 0.35, 1] as const;

/** R1 multi-line headings: per-line stagger, applied to at most 4 lines. */
export const stagger = { line: 0.08, maxLines: 4 } as const;

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
/** How far a masked line sits below its mask before it rises (DESIGN v2
 *  §2.3: keep 115% with a .15em descender pad). Same value as maskedLine. */
export const maskTravel = "115%" as const;

export const maskedLine: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: dur.reveal, ease } },
};

export const maskedLineReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease } },
};

/* ============================================================================
   DESIGN v2 §6.1 SPRINGS + BUDGETS (P1-early). Existing tokens above keep
   their values (springSoft and springNav already match DESIGN v2). Springs
   are {stiffness, damping, mass}; ζ / overshoot are CALC (build/tools/springs.mjs).
   Rules: time-based only (never per-frame lerps); ≤ ~800 ms to 2% settle;
   NO overshoot on anything a reader clicks.
   ========================================================================== */

/** Preview follow, lens track, magnetic pull. ζ 1.30, 0% overshoot, t63 187 ms. */
export const springFollow = { stiffness: 120, damping: 22, mass: 0.6 } as const;

/** Anything a reader clicks (nav, CTAs, tabs, Play/Skip, links).
 *  ζ 1.00 (critically damped), 0% overshoot, t63 105 ms, 2% settle 286 ms. */
export const springSnap = { stiffness: 420, damping: 41, mass: 1 } as const;

/** "The Settle": NON-interactive entrances in the idiots world only (board
 *  frame, schematic panels, gauge). ζ 0.72, 3.8% overshoot, settle 347 ms. */
export const springSettle = { stiffness: 260, damping: 22, mass: 0.9 } as const;

/** Decorative motifs only (gear-teeth nudge, waypoint tick pop). Never text,
 *  never controls. ζ 0.50, 16.4% overshoot, settle 631 ms. */
export const springPlayful = { stiffness: 180, damping: 14, mass: 1.1 } as const;

/** The instrument needle's hunt-and-settle (decorative, aria-hidden).
 *  ζ 0.54, 13.3% overshoot, settle 781 ms — the one >~800 ms-class exception. */
export const springNeedle = { stiffness: 55, damping: 8, mass: 1 } as const;

/** Prologue timing (SPEC §5). */
export const intro = {
  flightMaxS: 6.0,
  landing: 0.62,
  readyWaitMs: 4000,
  loaderDelayMs: 250,
  motesRestMs: 5000,
  failsafeMs: 3000,
  mobileFlightS: 1.6,
  mobileTotalMaxS: 2.4,
} as const;

/** Loader timing (SPEC §8). `showDelayMs` is the media/real-load delay (the
 *  intro uses `intro.loaderDelayMs`). Indeterminate motion stops after
 *  `idleStopMs` whenever it runs in parallel with readable content. */
export const loader = {
  showDelayMs: 400,
  idleStopMs: 5000,
  needleReexciteMs: 1800,
  gaugeIdleDegPerS: 30,
  inkBreatheHz: 0.5,
} as const;

/** Scroll budgets (read by the validator in a later phase). */
export const scrollBudget = {
  stickyMaxVh: 30,
  longCardMaxVh: 60,
  maxLongCards: 2,
  pageStickyMaxVh: 150,
  mobileStickyMaxVh: 0,
  maxSignature: 5,
  maxScenes: 2,
} as const;

/**
 * spanUnit — a scroll map whose input range covers ALL of 0 → 1 (M2 REPORT
 * "What went wrong" #3; M5 audit). motion 12 hands a `useTransform(progress,
 * at, to)` whose source is a `useScroll` progress straight to a scroll-
 * driven WAAPI animation (a ScrollTimeline / ViewTimeline) for opacity,
 * clipPath, filter and transform; keyframes that start after 0 or stop
 * before 1 then get implicit end keyframes at the element's UNDERLYING
 * value, so a fade mapped [.25, .55] → [1, 0] springs back to 1 after .55
 * (and one mapped [.3, .6] → [0, 1] starts visible). Holding the edge
 * values out to 0 and 1 makes the accelerated and the JS paths agree.
 * Which maps are at risk: motion only hardware-accelerates the style keys
 * it lists (opacity, clipPath, filter and the whole `transform` string —
 * NOT the x / y / scale shorthands), and never a function transformer
 * (`useTransform(p, (v) => …)` always runs in JS). So every PARTIAL-range,
 * ARRAY-form map that lands on an accelerated key must go through spanUnit.
 * Usage: `useTransform(progress, ...spanUnit([0.25, 0.55], [1, 0]))`.
 */
export function spanUnit<T>(at: readonly number[], to: readonly T[]): [number[], T[]] {
  const a = [...at];
  const t = [...to];
  if (a.length && a[0] > 0) {
    a.unshift(0);
    t.unshift(t[0]);
  }
  if (a.length && a[a.length - 1] < 1) {
    a.push(1);
    t.push(t[t.length - 1]);
  }
  return [a, t];
}
