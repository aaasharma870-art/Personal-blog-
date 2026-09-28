"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { motion } from "motion/react";
import type { Transition } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, easeClip, springFollow } from "@/lib/motion";
import { useOncePerSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/**
 * Lens — the interval bracket `[ ]` (DESIGN v2 §5.1): two aria-hidden SVG
 * half-brackets (square caps, non-scaling stroke of --lens-stroke: 2 px
 * ≥ 1024, 1.5 px below; arm clamp(8px, .12·h, 24px); inset --lens-inset:
 * 16 px desktop, 8 px mobile). `--accent` in focus, `--fg-ghost` idle — the
 * Lens group counts as the viewport's ONE aqua mark.
 *
 * States (controlled by the parent):
 *   closed    halves meet at `origin`; children clipped to a slit
 *             inset(0 (1-o)·100% 0 o·100%). Instant.
 *   aperture  animates closed → open: the clip opens to inset(0) while the
 *             halves ride out to `frame`, on easeClip / dur.hero. Calls
 *             onSettled("open") at the end.
 *   open      halves rest on `frame` (e.g. media.focalBox), children
 *             unclipped. Instant.
 *   track     halves frame `target` (px, relative to the Lens box) and follow
 *             it on springFollow — the ledger row tracker. Its height applies
 *             instantly (rows are near-equal); position is spring-followed.
 * Everything animates transform + clip-path only. Reduced motion / Pause:
 * every state is its final composition, no animation (aperture = open).
 * SSR renders exactly the `state` prop, so pass the FINAL state from the
 * server (normally "open"); `useApertureOnce` does the safe offscreen arming.
 */

export type LensState = "closed" | "aperture" | "open" | "track";
/** Fractions (0–1) of the Lens box. */
export type LensFrame = { x0: number; x1: number; y0: number; y1: number };
/** Pixels, relative to the Lens box's top-left corner. */
export type LensRect = { x: number; y: number; width: number; height: number };

const FULL: LensFrame = { x0: 0, x1: 1, y0: 0, y1: 1 };

type LensProps = {
  state: LensState;
  /** Where the halves rest when open (default: the whole box). */
  frame?: LensFrame;
  /** Aperture slit x, 0–1 of the box (default: the frame's centre). */
  origin?: number;
  /** The rect to frame in "track" state. */
  target?: LensRect | null;
  /** In focus → --accent; idle → --fg-ghost (default true). */
  focus?: boolean;
  /** Clip the children to the aperture (default true). */
  clip?: boolean;
  onSettled?: (state: "open" | "closed" | "track") => void;
  className?: string;
  children?: ReactNode;
};

const pct = (f: number) => `${(f * 100).toFixed(3)}%`;

export function Lens({
  state,
  frame = FULL,
  origin,
  target,
  focus = true,
  clip = true,
  onSettled,
  className,
  children,
}: LensProps) {
  const reduced = useReducedMotion();
  const o = origin ?? (frame.x0 + frame.x1) / 2;
  const tracking = state === "track" && target != null;
  const closed = state === "closed";

  // The halves are ZERO-WIDTH anchors moved by px transforms, so they never
  // widen the page's scrollable area (a full-width wrapper translated by a
  // percentage did). Before the box is measured (server HTML, first paint)
  // the anchors sit at the same spot via a static percentage `left`.
  const halvesRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState<number | null>(null);
  useEffect(() => {
    const el = halvesRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBoxW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const leftF = closed ? o : frame.x0;
  const rightF = closed ? o : frame.x1;
  const measured = boxW !== null;
  const leftX = tracking ? target.x : measured ? leftF * boxW : 0;
  const rightX = tracking ? target.x + target.width : measured ? rightF * boxW : 0;
  const anchor = (f: number): CSSProperties | undefined =>
    measured || tracking ? undefined : { left: pct(f) };
  const y = tracking ? target.y : 0;
  const clipPath =
    clip && closed
      ? `inset(0% ${pct(1 - o)} 0% ${pct(o)})`
      : "inset(0% 0% 0% 0%)";

  const transition: Transition = reduced
    ? { duration: 0 }
    : state === "aperture"
      ? { duration: dur.hero, ease: easeClip }
      : state === "track"
        ? { type: "spring", ...springFollow }
        : { duration: 0 };

  // Bracket height: the frame's share of the box, or the tracked rect.
  const halfStyle: CSSProperties = tracking
    ? {
        top: "calc(-1 * var(--lens-inset))",
        height: `calc(${target.height}px + 2 * var(--lens-inset))`,
        // the rect is measured geometry (px); the arm limits stay tokens
        width: `clamp(var(--lens-arm-min), ${(0.12 * target.height).toFixed(2)}px, var(--lens-arm-max))`,
      }
    : {
        top: `calc(${pct(frame.y0)} - var(--lens-inset))`,
        height: `calc(${pct(frame.y1 - frame.y0)} + 2 * var(--lens-inset))`,
        // .12 × h via container-query height units of the full-box wrapper.
        width: `clamp(var(--lens-arm-min), ${(12 * (frame.y1 - frame.y0)).toFixed(3)}cqh, var(--lens-arm-max))`,
      };

  const settle = () =>
    onSettled?.(state === "aperture" ? "open" : state === "track" ? "track" : state);

  return (
    <div className={cn("relative", className)} data-lens={state}>
      {clip ? (
        <motion.div initial={false} animate={{ clipPath }} transition={transition}>
          {children}
        </motion.div>
      ) : (
        children
      )}
      <div
        ref={halvesRef}
        aria-hidden="true"
        className={cn(
          // size container: the arms read .12 × box height in cqh units
          "pointer-events-none absolute inset-0 [container-type:size] transition-colors duration-(--dur-micro)",
          focus ? "text-accent" : "text-fg-ghost",
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-0"
          style={anchor(leftF)}
          initial={false}
          animate={{ x: leftX, y }}
          transition={transition}
          onAnimationComplete={settle}
        >
          <Half side="left" style={halfStyle} />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 left-0 w-0"
          style={anchor(rightF)}
          initial={false}
          animate={{ x: rightX, y }}
          transition={transition}
        >
          <Half side="right" style={halfStyle} />
        </motion.div>
      </div>
    </div>
  );
}

/** One half-bracket. viewBox 10×100 stretched with preserveAspectRatio=none;
 *  the non-scaling stroke keeps the line weight exact at any size. */
function Half({ side, style }: { side: "left" | "right"; style: CSSProperties }) {
  const left = side === "left";
  return (
    <svg
      viewBox="0 0 10 100"
      preserveAspectRatio="none"
      overflow="visible"
      focusable="false"
      className={cn(
        "absolute",
        // spine sits --lens-inset OUTSIDE the framed edge
        left
          ? "left-[calc(-1*var(--lens-inset))]"
          : "left-(--lens-inset) -translate-x-full",
      )}
      style={style}
    >
      <path
        d={left ? "M10 0 H0 V100 H10" : "M0 0 H10 V100 H0"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
        className="[stroke-width:var(--lens-stroke)]"
      />
    </svg>
  );
}

/**
 * useApertureOnce — the safe driver for an aperture that plays ONCE PER
 * SESSION when its Lens first scrolls into view (≥ 50%). Returns the Lens
 * `state` and the `onSettled` to pass through.
 *   - server / hydration / motion off / already run → "open" (final)
 *   - mounted offscreen → "closed" (armed, invisible to the reader)
 *   - entered → "aperture"; the run is recorded when it settles open
 * A Lens already in view at mount stays "open": closing it in front of the
 * reader would be a flash. (The hero aperture at first paint needs the
 * pre-paint head script — P1-EARLY open item.)
 */
export function useApertureOnce(
  ref: RefObject<Element | null>,
  key: string,
): { state: LensState; onSettled: (s: "open" | "closed" | "track") => void } {
  const phase = useEnterOnce(ref, { amount: 0.5 });
  const { shouldRun, markRun } = useOncePerSession(key);
  let state: LensState = "open";
  if (shouldRun) {
    if (phase === "armed") state = "closed";
    else if (phase === "entered") state = "aperture";
  }
  return {
    state,
    onSettled: (s) => {
      if (s === "open" && state === "aperture") markRun();
    },
  };
}
