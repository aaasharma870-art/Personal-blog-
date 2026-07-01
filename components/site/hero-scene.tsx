"use client";

import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Parallax } from "@/components/visuals/parallax";
import { HeroBloom } from "@/components/visuals/hero-bloom";
import { ScrollCue } from "@/components/visuals/scroll-cue";
import { springSoft } from "@/lib/motion";

/**
 * HeroScene — the hero's motion engine (Spec §2, Signature Moment 1).
 * Server content (the LCP h1, CTAs, panel) is passed in via slots so this
 * client leaf can own ONE shared scrollYProgress and drive the scroll-scrubbed
 * "breathe-out" exit, the 3-plane depth, and the pointer-parallax together.
 * Every transform collapses to a constant under reduced motion; the h1 never
 * hits opacity 0 on the first frame (exit opacity starts at 1 and is
 * scroll-driven, beginning only after load).
 */
export function HeroScene({
  media,
  lattice,
  panel,
  panelCaption,
  children,
}: {
  media: ReactNode;
  lattice: ReactNode;
  panel: ReactNode;
  panelCaption: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useSpring(
    useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -64]),
    springSoft,
  );
  const textOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.7], reduce ? [1, 1] : [1, 0]),
    springSoft,
  );
  const panelY = useSpring(
    useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -128]),
    springSoft,
  );
  const mediaScale = useSpring(
    useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.06]),
    springSoft,
  );
  const darken = useSpring(
    useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 0.35]),
    springSoft,
  );
  const dotOpacity = useSpring(
    useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.3]),
    springSoft,
  );
  // Cue fades out early on scroll; stays fully lit under reduced motion.
  const cueOpacity = useTransform(
    scrollYProgress,
    [0, 0.2],
    reduce ? [1, 1] : [1, 0],
  );

  const bgXraw = useMotionValue(0);
  const bgYraw = useMotionValue(0);
  const fgXraw = useMotionValue(0);
  const fgYraw = useMotionValue(0);
  const bgX = useSpring(bgXraw, springSoft);
  const bgY = useSpring(bgYraw, springSoft);
  const fgX = useSpring(fgXraw, springSoft);
  const fgY = useSpring(fgYraw, springSoft);

  const onPointerMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    bgXraw.set(nx * -12);
    bgYraw.set(ny * -12);
    fgXraw.set(nx * 6);
    fgYraw.set(ny * 6);
  };
  const onPointerLeave = () => {
    bgXraw.set(0);
    bgYraw.set(0);
    fgXraw.set(0);
    fgYraw.set(0);
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden py-24"
    >
      {/* FAR plane: ambient media — exit scale + darken + pointer drift.
          AmbientBackground's own -8% overscan covers the 1.06 scale + drift. */}
      <motion.div
        style={{ scale: mediaScale, x: bgX, y: bgY }}
        className="absolute inset-0 -z-30"
      >
        {media}
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ opacity: darken }}
        className="absolute inset-0 -z-[25] bg-canvas"
      />

      {/* Aqua bloom ignition — SIBLING behind the h1, never a parent wrapper. */}
      <HeroBloom className="absolute left-1/2 top-[38%] -z-20 h-[820px] w-[820px]" />

      {/* Masked structural grid (aceternity masked-grid half; animated beams
          rejected). Static, low-alpha, feathered by bg-grid-fade so it dissolves
          toward the edges — never a hard rectangle. Sits BELOW the dot lattice +
          grain (-z-10) so the h1 keeps AA contrast and LCP is untouched. */}
      <div
        className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 -z-[15] opacity-60"
        aria-hidden="true"
      />

      {/* MID plane: dot lattice — scroll parallax drift + exit opacity. */}
      <motion.div
        style={{ opacity: dotOpacity }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <Parallax amount={16} className="absolute inset-0 h-full w-full">
          {lattice}
        </Parallax>
      </motion.div>
      <div
        className="grain grain-drift pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container-edge grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="lg:col-span-7"
        >
          {children}
        </motion.div>

        {/* NEAR plane: QuantPanel column — exit y, counter-parallax, pointer drift.
            panelY (exit) and fg pointer live on separate wrappers so the two
            translations compose instead of overwriting each other. */}
        <motion.div style={{ y: panelY }} className="lg:col-span-5">
          <motion.div style={{ x: fgX, y: fgY }}>
            <Parallax amount={22} sign={-1}>
              {panel}
              {panelCaption}
            </Parallax>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue (fades on scroll; static + lit under reduced motion). */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
      >
        <ScrollCue />
      </motion.div>
    </section>
  );
}
