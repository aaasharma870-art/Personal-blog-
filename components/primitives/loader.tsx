"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { ComponentType, RefObject } from "react";
import {
  isMotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { loader as loaderTiming } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { worlds, type LoaderKind, type WorldId } from "@/lib/worlds";
import { useWorld } from "@/components/primitives/world";
import { worldLoaderRenderers } from "@/components/primitives/loaders";

/**
 * Loader — the shell of the world loader system (SPEC §8, loaders.BAR).
 * One component, two honest uses:
 *
 * (a) REAL LOADING — pass `status` (e.g. "Loading essay…"). Renders a visible
 *     Meta status line inside role="status" (polite) next to the aria-hidden
 *     motif. `progress` is a real fraction (determinate) or omitted
 *     (indeterminate). Appears only after `delayMs` (default 400 ms: never
 *     flashes on fast loads). Never shows a percentage.
 * (b) SCROLL PROGRESS — pass `progress` as a MotionValue (e.g. a card's
 *     scroll passage). Non-blocking and decorative: aria-hidden, NO status,
 *     never the word "loading", no delay. The motif maps p directly (no
 *     spring on the progress value). Scrolling back reverses it exactly.
 *
 * Modes: indeterminate · determinate · complete · static. Indeterminate
 * motion stops after loader.idleStopMs (5 s) whenever it runs beside
 * readable content (`parallel`, default true), then holds a static frame
 * (WCAG 2.2.2). Reduced motion / Pause: every mode renders static/complete
 * (functional progress still updates, without animation).
 *
 * Worlds are data: the world (prop, else the nearest WorldProvider) names a
 * LoaderKind (lib/worlds.ts); `loaderRenderers` maps kinds to renderers.
 * Only the neutral `plain` renderer exists in P1-early — the world motifs
 * (course / gauge / ink-light) register here later and inherit this shell's
 * timing, delay, status and reduced-motion contract for free.
 */

export type LoaderMode = "indeterminate" | "determinate" | "complete" | "static";
export type LoaderSize = "mini" | "card" | "route";

/** What every world renderer receives. `progress` is always a MotionValue
 *  (0–1); `animate` is false when idle motion must not run (motion off,
 *  idle-stopped, or a non-indeterminate mode). */
export type LoaderRendererProps = {
  mode: LoaderMode;
  size: LoaderSize;
  progress: MotionValue<number>;
  animate: boolean;
};

/** The neutral placeholder motif: a hairline track with a --fg-muted fill.
 *  determinate = scaleX(p); indeterminate = a short segment sweeping (CSS,
 *  compositor-only, removed when `animate` is false); complete/static = full. */
function PlainLoader({ mode, size, progress, animate }: LoaderRendererProps) {
  const scaleX = useTransform(progress, (p) => Math.min(1, Math.max(0, p)));
  const full = mode === "complete" || mode === "static";
  return (
    <span
      className={cn(
        "relative block h-0.5 overflow-hidden bg-rule",
        size === "mini" && "w-(--loader-mini)",
        size === "card" && "w-(--loader-card)",
        size === "route" && "w-(--loader-route)",
      )}
    >
      {mode === "indeterminate" ? (
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-1/3 bg-fg-muted",
            animate ? "animate-loader-sweep" : "translate-x-0",
          )}
        />
      ) : (
        <motion.span
          className="absolute inset-0 origin-left bg-fg-muted"
          style={full ? undefined : { scaleX }}
        />
      )}
    </span>
  );
}

/** Kind → renderer. Kinds missing here fall back to `plain`. The world
 *  motifs (course / gauge / plate-trail / ink-light) live in
 *  components/primitives/loaders/, one code-split chunk per world. */
export const loaderRenderers: Partial<Record<LoaderKind, ComponentType<LoaderRendererProps>>> = {
  plain: PlainLoader,
  ...worldLoaderRenderers,
};

export function rendererFor(kind: LoaderKind): ComponentType<LoaderRendererProps> {
  return loaderRenderers[kind] ?? PlainLoader;
}

type CommonProps = {
  world?: WorldId;
  size?: LoaderSize;
  /** Indeterminate stops after 5 s beside readable content (default true). */
  parallel?: boolean;
  className?: string;
};

type RealLoadProps = CommonProps & {
  /** Visible status text for a REAL load, announced politely. */
  status: string;
  /** Real fraction 0–1; omit when unknown (indeterminate). */
  progress?: number;
  mode?: LoaderMode;
  /** Show delay (default loader.showDelayMs = 400). */
  delayMs?: number;
};

type DecorativeProps = CommonProps & {
  status?: undefined;
  /** A number (0–1) or a MotionValue (scroll-progress mode). */
  progress?: number | MotionValue<number>;
  mode?: LoaderMode;
  delayMs?: number;
};

export type LoaderProps = RealLoadProps | DecorativeProps;

export function Loader(props: LoaderProps) {
  const { world: worldProp, size = "mini", parallel = true, className, status } = props;
  const plane = useWorld();
  const world = worldProp ?? plane.world;
  const reduced = useReducedMotion();

  // Progress as a MotionValue in every case (a number is mirrored into one).
  const fallback = useMotionValue(typeof props.progress === "number" ? props.progress : 0);
  const external = isMotionValue(props.progress) ? props.progress : null;
  const progress = external ?? fallback;
  useEffect(() => {
    if (typeof props.progress === "number") fallback.set(props.progress);
  }, [props.progress, fallback]);

  const requested: LoaderMode =
    props.mode ?? (props.progress === undefined ? "indeterminate" : "determinate");
  const mode: LoaderMode =
    reduced && requested === "indeterminate" ? "static" : requested;

  // Show delay (real loads default to 400 ms; decorative uses default 0).
  const delayMs = props.delayMs ?? (status ? loaderTiming.showDelayMs : 0);
  const [shown, setShown] = useState(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) return;
    const t = window.setTimeout(() => setShown(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  // Idle stop: indeterminate motion ends after 5 s in parallel contexts.
  const [idleStopped, setIdleStopped] = useState(false);
  useEffect(() => {
    if (!parallel || mode !== "indeterminate" || !shown) return;
    const t = window.setTimeout(() => setIdleStopped(true), loaderTiming.idleStopMs);
    return () => window.clearTimeout(t);
  }, [parallel, mode, shown]);

  // Expose the live progress for tests / the lab as data-progress (never
  // rendered as text), written straight to the DOM: no re-render per frame.
  const rootRef = useRef<HTMLElement>(null);
  const [initialP] = useState(() => progress.get());
  useMotionValueEvent(progress, "change", (v) => {
    rootRef.current?.setAttribute("data-progress", v.toFixed(3));
  });
  useEffect(() => {
    // the progress SOURCE changed (e.g. static 1 → scroll passage): resync
    rootRef.current?.setAttribute("data-progress", progress.get().toFixed(3));
  }, [progress, shown]);

  // A real load keeps its (empty) live region mounted from the first render,
  // so screen readers register it before the status text arrives.
  if (!shown) return status ? <div role="status" className={className} /> : null;

  const animate = mode === "indeterminate" && !reduced && !idleStopped;
  // Registry lookup → createElement: renderers are module-level components
  // (never created in render); the key re-mounts the renderer when the
  // progress source changes, because a useTransform binds to one MotionValue.
  const motif = (
    <span aria-hidden="true" className="inline-flex items-center">
      {createElement(rendererFor(worlds[world].loader), {
        key: external ? "motion-value" : "number",
        mode,
        size,
        progress,
        animate,
      })}
    </span>
  );

  const data = {
    "data-loader": worlds[world].loader,
    "data-mode": mode,
    "data-progress": initialP.toFixed(3),
  };

  if (status) {
    return (
      <div
        ref={rootRef as RefObject<HTMLDivElement>}
        role="status"
        className={cn("inline-flex items-center gap-3", className)}
        {...data}
      >
        {motif}
        <span className="type-meta text-fg-muted">{status}</span>
      </div>
    );
  }
  return (
    <span
      ref={rootRef as RefObject<HTMLSpanElement>}
      aria-hidden="true"
      className={cn("inline-flex", className)}
      {...data}
    >
      {motif}
    </span>
  );
}
