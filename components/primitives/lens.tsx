"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { animate, motion, useMotionValue } from "motion/react";
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
 *   aperture  animates closed → open on easeClip / dur.hero: the clip opens
 *             from the slit to the whole box with a 48 px feathered edge,
 *             and each half rides its clip edge until it reaches `frame`,
 *             then rests while the plate opens beyond it. Calls
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

/** The aperture's soft leading edge (px): the plate's clip edges are
 *  feathered, so no hard media seam crosses the text beside the Lens. */
const FEATHER = 48;

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
  const anchor = (f: number): CSSProperties | undefined =>
    measured || tracking ? undefined : { left: pct(f) };
  const slit = `inset(0% ${pct(1 - o)} 0% ${pct(o)})`;

  // Everything is driven imperatively through motion values (no re-render
  // per frame). The APERTURE runs one clock u 0 → 1 (easeClip, dur.hero):
  // the plate's clip edges open from the slit to the box edges, and each
  // bracket half RIDES its clip edge until it reaches its frame edge, then
  // rests there while the plate keeps opening beyond it (hero-lens.BAR H10:
  // the halves never lag the clip). While it moves, the clip is a feathered
  // mask, so its edge is soft wherever it passes behind the h1.
  const xL = useMotionValue(0);
  const xR = useMotionValue(0);
  const yT = useMotionValue(0);
  const clipPath = useMotionValue(clip && closed ? slit : "inset(0% 0% 0% 0%)");
  const mask = useMotionValue("none");
  const settledRef = useRef(onSettled);
  useEffect(() => {
    settledRef.current = onSettled;
  });

  const tx = tracking ? target.x : 0;
  const tw = tracking ? target.width : 0;
  const ty = tracking ? target.y : 0;
  const { x0, x1 } = frame;
  useLayoutEffect(() => {
    const done = (s: "open" | "closed" | "track") => settledRef.current?.(s);
    const slitAt = `inset(0% ${pct(1 - o)} 0% ${pct(o)})`;
    const rest = (open: boolean) => {
      mask.set("none");
      clipPath.set(clip && !open ? slitAt : "inset(0% 0% 0% 0%)");
    };
    if (state === "track") {
      if (!tracking) return;
      rest(true);
      if (reduced) {
        xL.jump(tx);
        xR.jump(tx + tw);
        yT.jump(ty);
        done("track");
        return;
      }
      const a = animate(xL, tx, { type: "spring", ...springFollow });
      const b = animate(xR, tx + tw, { type: "spring", ...springFollow });
      const c = animate(yT, ty, { type: "spring", ...springFollow });
      void a.then(() => done("track"));
      return () => {
        a.stop();
        b.stop();
        c.stop();
      };
    }
    yT.jump(0);
    if (boxW === null) {
      // not measured yet: the % anchors place the halves; the clip is final
      xL.jump(0);
      xR.jump(0);
      rest(state !== "closed");
      if (state === "aperture") done("open");
      return;
    }
    const w = boxW;
    const ox = o * w;
    if (state === "closed") {
      xL.jump(ox);
      xR.jump(ox);
      rest(false);
      return;
    }
    if (state === "open" || reduced) {
      xL.jump(x0 * w);
      xR.jump(x1 * w);
      rest(true);
      if (state === "aperture") done("open");
      return;
    }
    // the aperture
    const fL = x0 * w;
    const fR = x1 * w;
    const run = animate(0, 1, {
      duration: dur.hero,
      ease: easeClip,
      onUpdate: (v) => {
        const L = ox * (1 - v);
        const R = ox + (w - ox) * v;
        // ride the clip edge; a frame edge on the far side of the slit
        // (rare) is reached by a straight interpolation instead
        xL.set(fL <= ox ? Math.max(L, fL) : ox + (fL - ox) * v);
        xR.set(fR >= ox ? Math.min(R, fR) : ox + (fR - ox) * v);
        if (clip) {
          // the feather is CENTRED on each clip edge (50 % at L and R), so
          // the visible plate edge sits right under the riding half
          const h = Math.min(FEATHER, (R - L) / 2) / 2;
          clipPath.set("none");
          mask.set(
            `linear-gradient(to right, transparent ${(L - h).toFixed(1)}px, #000 ${(L + h).toFixed(1)}px, #000 ${(R - h).toFixed(1)}px, transparent ${(R + h).toFixed(1)}px)`,
          );
        }
      },
      onComplete: () => {
        rest(true);
        done("open");
      },
    });
    return () => run.stop();
  }, [state, tracking, boxW, o, x0, x1, tx, tw, ty, clip, reduced, xL, xR, yT, clipPath, mask]);

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

  return (
    <div className={cn("relative", className)} data-lens={state}>
      {clip ? (
        // size-full: a definite box for the mask/clip reference (absolutely
        // positioned children would otherwise leave it 0 px tall)
        <motion.div className="size-full" style={{ clipPath, maskImage: mask, WebkitMaskImage: mask }}>
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
        <motion.div className="absolute inset-y-0 left-0 w-0" style={{ ...anchor(leftF), x: xL, y: yT }}>
          <Half side="left" style={halfStyle} />
        </motion.div>
        <motion.div className="absolute inset-y-0 left-0 w-0" style={{ ...anchor(rightF), x: xR, y: yT }}>
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
