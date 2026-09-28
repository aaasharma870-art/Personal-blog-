"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useScroll, type MotionValue } from "motion/react";
import { useMediaQuery, useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { Loader } from "@/components/primitives/loader";
import { WorldProvider } from "@/components/primitives/world";

/**
 * ActCard — the SHELL of the derived letterboxed act card / loading-reel
 * interstitial (SPEC §8.2, §9.3; act-cards.BAR). World art and the long-card
 * choreography (seam, ignite) plug in later as `children`; this owns the
 * grammar every card shares:
 *
 *   ≥ 640 px   letterbox 2.39:1 on the incoming world's DEEP ground — the
 *              ground IS the bars (no bar elements). The section is 100svh;
 *              frame = width / 2.39 (602.5 px at 1440×900 → 148.7 px bars).
 *              Upper bar: Meta `label` (left) + `reel` mark (right).
 *              Lower bar: the h2 act `title` (type-title), ≤ 1 `subtitle`
 *              line (type-lead), and the progress element.
 *   < 640 px   letterbox off: a stacked static card, 0 travel.
 *
 * Progress: omitted → the card's own scroll PASSAGE drives the loader motif
 * (p = 0 as the card's top enters, 1 as its bottom leaves; direct, no
 * spring; reverses exactly). A number → that fixed progress. Reduced motion,
 * Pause, < 640 px, no JS (the SSR frame) → the static COMPLETE composition,
 * with the `summary` visible (sr-only otherwise).
 *
 * Honesty (act-cards C11): an interstitial never says "loading", never shows
 * a percentage and never carries role="status" — the Loader is used in its
 * decorative scroll mode here. 0 tab stops; no aqua at rest.
 */
export type ActCardKind = "opening" | "seam" | "ignite" | "reel" | "title";

type ActCardProps = {
  /** Section id / anchor, e.g. "act-2". The h2 gets `${id}-title`. */
  id: string;
  kind: ActCardKind;
  /** The INCOMING world (its deep ground, its loader motif). */
  world: WorldId;
  /** The act title (h2). */
  title: string;
  /** One lead line (the epigraph). */
  subtitle?: string;
  /** Upper-bar Meta, e.g. "ACT II • THE WORKSHOP". */
  label?: string;
  /** Upper-bar reel mark, e.g. "II / III". */
  reel?: string;
  /** Text equivalent of the frame (sr-only; visible in the static card). */
  summary?: string;
  /** Fixed progress 0–1; omit to follow the card's scroll passage. */
  progress?: number;
  /** Frame content (the transition art). Default: the world's loader motif. */
  children?: ReactNode;
  className?: string;
};

export function ActCard({
  id,
  kind,
  world,
  title,
  subtitle,
  label,
  reel,
  summary,
  progress,
  children,
  className,
}: ActCardProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 40rem)");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Static composition: SSR / hydration (wide=false), < 640, motion off.
  const live = wide && !reduced;
  const motifProgress: number | MotionValue<number> = !live
    ? 1
    : progress ?? scrollYProgress;
  const motifMode = !live ? "complete" : "determinate";
  const titleId = `${id}-title`;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      data-act-card={kind}
      data-live={live ? "" : undefined}
      {...planeAttrs("deep", world)}
      className={cn(
        "relative bg-bg text-fg",
        // ≥ 640: 100svh letterbox — bars (1fr) · frame (2.39:1) · bars (1fr)
        "sm:grid sm:min-h-svh sm:grid-rows-[1fr_auto_1fr]",
        // < 640: stacked static card
        "flex flex-col gap-tier-group px-gutter py-section sm:gap-0 sm:p-0",
        className,
      )}
    >
      <WorldProvider world={world} tone="deep">
        {/* upper bar: Meta only */}
        <div className="flex items-end justify-between gap-tier-group sm:px-gutter sm:pb-4">
          {label ? <p className="type-meta text-fg-muted">{label}</p> : <span />}
          {reel ? <p className="type-meta text-fg-muted">{reel}</p> : null}
        </div>

        {/* frame */}
        <div
          className={cn(
            "relative grid place-items-center overflow-hidden bg-surface-1",
            "min-h-40 sm:aspect-[var(--letterbox-ratio)] sm:min-h-0 sm:w-full",
          )}
        >
          {children ?? (
            <Loader world={world} size="card" progress={motifProgress} mode={motifMode} />
          )}
        </div>

        {/* lower bar: title + ≤ 1 lead line + the progress element */}
        <div className="flex flex-col gap-3 sm:px-gutter sm:pt-4">
          <h2 id={titleId} className="type-title max-w-title">
            {title}
          </h2>
          {subtitle ? <p className="type-lead max-w-lead text-fg-muted">{subtitle}</p> : null}
          <Loader world={world} size="route" progress={motifProgress} mode={motifMode} />
          {summary ? (
            <p className={cn("type-small max-w-body text-fg-muted", live && "sr-only")}>
              {summary}
            </p>
          ) : null}
        </div>
      </WorldProvider>
    </section>
  );
}
