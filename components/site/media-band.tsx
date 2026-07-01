"use client";

import { useRef, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Reveal } from "@/components/ui/reveal";
import { SectionSeam } from "@/components/ui/section-seam";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Coarse-vs-fine pointer, SSR-safe (mirrors ambient-background's media-query hook). */
function usePointerFine(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(pointer: fine)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}

const STATEMENT_CLASS =
  "mt-5 font-serif text-3xl font-medium leading-[1.15] text-ink text-balance sm:text-4xl lg:text-[3.25rem]";
const OVERLAY_CLASS = "bg-gradient-to-b from-canvas/45 via-canvas/35 to-canvas/55";

/**
 * Deterministic per-word vertical jitter (px), seeded from the word index so it
 * is identical on server and client (no Math.random at render → hydration-safe).
 * Range ≈ [-13, 13]; resolves to 0 as the word "locks in". Transform-only.
 */
export function convergenceJitter(i: number): number {
  const s = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 26;
}

/** One word of the converging statement — owns its own opacity + y transform. */
function ConvergingWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: import("motion/react").MotionValue<number>;
}) {
  const from = index / total;
  const to = (index + 1) / total;
  // Resting floor 0.30 (never invisible). Raised from 0.18 → 0.30 (the plan's
  // ceiling) for legibility: over the darkest composited frame (vignette pools
  // rgba(11,15,18,1)@0.85 → backing ≈ #0b0f12) a floored ink word measures
  // ~2.4:1 at 0.30 vs ~1.6:1 at 0.18. Strict AA (4.5:1) at the floor is physically
  // unreachable within ≤0.30 (would need α≈0.49, which erases the noise→signal
  // read); 0.30 is the max-legibility choice within the concept. The word
  // converges to full ink #e6edf3 (~16:1, AA/AAA) — the state a reader actually
  // reads — and the accessible sentence is always exposed via the parent's
  // aria-label plus the reduced-motion / coarse-pointer plain-string fallback.
  const opacity = useTransform(progress, [from, to], [0.3, 1]);
  const y = useTransform(progress, [from, to], [convergenceJitter(index), 0]);
  return (
    <>
      <motion.span
        className="inline-block will-change-transform"
        style={{ opacity, y }}
      >
        {word}
      </motion.span>{" "}
    </>
  );
}

/**
 * ConvergingStatement — the serif line assembles from a scattered, low-opacity
 * "noise" field into a locked line as the band scrubs to center (spec §7,
 * signature moment 2). Words light up left→right over a tight scroll window.
 * Only mounted when converge && scrub; the plain string is the fallback.
 */
function ConvergingStatement({
  statement,
  className,
}: {
  statement: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });
  const words = statement.split(" ");
  const total = words.length;
  return (
    <p ref={ref} className={className} aria-label={statement}>
      {words.map((word, i) => (
        <ConvergingWord
          key={`${i}-${word}`}
          word={word}
          index={i}
          total={total}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

/**
 * MediaBand — a full-bleed cinematic cut (spec §4 / §7). The generative media
 * IS the spotlight (high opacity, light scrim), carrying a short statement
 * across the transition between key sections. On desktop with motion enabled the
 * frame performs a scroll-linked Ken-Burns push-in (scale 1.12 → 1 → 1.06) with a
 * gentle y drift and a vignette that deepens as the band centers, then eases as
 * it leaves. Touch / coarse-pointer / reduced-motion get the static composition
 * (AmbientBackground parallax={false} → StaticMedia) with no scrub.
 */
export function MediaBand({
  image,
  video,
  kicker,
  statement,
  attribution,
  converge = false,
  className,
}: {
  converge?: boolean;
  image: string;
  video?: string;
  kicker?: string;
  statement: string;
  attribution?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const pointerFine = usePointerFine();
  const scrub = !reduce && pointerFine;

  // Always called (never conditional) — only the rendered branch below changes.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleRaw = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.06]);
  const scale = useSpring(scaleRaw, springSoft);
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const vignetteOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.35, 0.85, 0.35],
  );

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "group relative isolate flex min-h-[70svh] items-center justify-center overflow-hidden border-t border-line py-20 lg:min-h-[80svh]",
        className,
      )}
    >
      <SectionSeam />

      {/* Ambient media (parallax={false} — Ken-Burns owns the transform here). */}
      {scrub ? (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale, y }}
        >
          <AmbientBackground
            image={image}
            video={video}
            parallax={false}
            opacity={0.85}
            featherMask
            overlayClassName={OVERLAY_CLASS}
          />
        </motion.div>
      ) : (
        <AmbientBackground
          image={image}
          video={video}
          parallax={false}
          opacity={0.85}
          featherMask
          overlayClassName={OVERLAY_CLASS}
        />
      )}

      {/* cursor-tracking aqua highlight — media adapts to interaction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(45,212,191,0.14), transparent 62%)",
        }}
      />

      {/* Centered vignette — dark backing pooled under the statement. When
          scrubbing, its opacity deepens toward the band's center and eases at the
          edges (0.35 → 0.85 → 0.35); static otherwise. */}
      {scrub ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(11,15,18,1), rgba(11,15,18,0.41) 60%, transparent 100%)",
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(11,15,18,0.78), rgba(11,15,18,0.32) 60%, transparent 100%)",
          }}
        />
      )}

      <div className="container-edge relative z-10">
        <Reveal replay variant="scale" className="mx-auto max-w-4xl text-center">
          {kicker ? <p className="eyebrow text-aqua/80">{kicker}</p> : null}
          {converge && scrub ? (
            <ConvergingStatement statement={statement} className={STATEMENT_CLASS} />
          ) : (
            <p className={STATEMENT_CLASS}>{statement}</p>
          )}
          {attribution ? (
            <p className="eyebrow mt-5 text-muted">{attribution}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
