"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMediaQuery, useMotionPausedAtBoot, useReducedMotion } from "@/lib/flags";
import { useVariant } from "@/lib/use-variant";
import { cn } from "@/lib/utils";
import type { Variant, VariantChoice } from "@/lib/variants";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { WorldProvider } from "@/components/primitives/world";
import { remap } from "@/components/primitives/loaders/line";
import { CardContext } from "@/components/sections/act-card/card-context";
import { ProgressLine } from "@/components/sections/act-card/progress-line";

/**
 * CardShell — the letterboxed loading-reel grammar every derived act card
 * shares (SPEC v2 §8.2, §9.3; act-cards.BAR §3–§7).
 *
 *   ≥ 640 px  the section is 100svh on the incoming world's DEEP ground — the
 *             ground IS the bars (no bar elements): 1fr · frame 2.39:1 · 1fr
 *             (602.5 px frame, 148.7 px bars at 1440×900).
 *             Upper bar: Meta only (act credit left, reel mark right).
 *             Lower bar: the h2 + ≤ 1 line + the world's progress line.
 *   < 640 px  letterbox off: a stacked static card (Meta → title → line →
 *             frame), 0 travel.
 *
 * Driver p (direct, no spring; reverses by position):
 *   passage (0-travel cards: opening, tintype, reel, title) — 0 as the card's
 *     top enters the viewport, 1 as it reaches the top: "the card has arrived".
 *   pinned (long cards: seam, ignite) — the card's own ≤ 60vh of travel
 *     (the extra height is CSS: [data-act-card-long] in app/globals.css, only
 *     ≥ 1024 + fine pointer + motion on, so SSR already reserves it: CLS 0).
 *
 * Honesty (C11): no "loading", no %, no role=status; the progress line is
 * aria-hidden. 0 tab stops except the opening card's rows. No aqua at rest.
 *
 * Variants (lib/variants.ts; registry piece `card-<kind>.choreo`): the
 * server hands BOTH choreographies — `frame` (DEFAULT) and `altFrame` (ALT,
 * lazy: components/sections/act-card/alt-frames.tsx) — and this shell plays
 * one: the manifest's `variantChoice` on the server and during hydration,
 * the ?variant=… preview after mount (useVariant), or a forced `variant`
 * (/lab). Only the frame changes: the section, the bars, the h2 and every
 * focus target are the same DOM in both (the opening card's alt keeps the
 * same heading node and the same row anchors, in the same order).
 */
type Props = {
  id: string;
  kind: string;
  /** The plane of the card (the incoming world's deep; house for opening). */
  world: WorldId;
  /** The world whose loader grammar / progress line the card uses. */
  motifWorld: WorldId;
  /** Pinned long card (seam / ignite, D-5). */
  long: boolean;
  /** Turned down (world intensity below `full`): the static title card. */
  still?: boolean;
  /** Ground the card crossfades FROM over p 0–.2 (the ignite: rd → hp). */
  fromGround?: WorldId | null;
  upperLeft: string;
  upperRight?: string;
  /** The frame (choreography): the DEFAULT variant. */
  frame: ReactNode;
  /** The ALT choreography of the same frame (null/absent: none built). */
  altFrame?: ReactNode;
  /** The manifest's variant choice for this card (`item.variant`). */
  variantChoice?: VariantChoice | null;
  /** Force a variant (the /lab side-by-side); bypasses the URL preview. */
  variant?: Variant;
  /** A 3:2 image plate below 640 (2.39:1 from 640), or free content (the
   *  opening rows: 2.39:1 from 1024, its own height below). */
  frameShape?: "plate" | "free";
  /** Lower bar: the h2 and ≤ 1 line (server-rendered). The opening card
   *  sets its h2 above the program, in the frame, and passes none. */
  lower?: ReactNode;
  /** Text equivalent of an aria-hidden frame ("" when the frame is itself
   *  readable, as the opening program is). */
  summary: string;
  /** The lower bar's progress line (default on). The opening card's course
   *  through its rows IS its progress element, so it passes false. */
  progress?: boolean;
};

const WIDE = "(min-width: 40rem)";
const DESKTOP_FINE = "(min-width: 64rem) and (pointer: fine)";

export function CardShell({
  id,
  kind,
  world,
  motifWorld,
  long,
  still = false,
  fromGround = null,
  upperLeft,
  upperRight,
  frame,
  altFrame = null,
  variantChoice = null,
  variant: forced,
  frameShape = "plate",
  lower,
  summary,
  progress = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const wide = useMediaQuery(WIDE);
  const desktopFine = useMediaQuery(DESKTOP_FINE);

  // Offscreen gate: a card already in view at hydration keeps its static
  // composition until it has left the viewport once (never swap in front of
  // the reader). IntersectionObserver reports the first state at once. An
  // EDGE-ADJACENT card (its top exactly at the fold: Act I at 1440×900)
  // reports isIntersecting with ratio 0 — nothing of it is visible, so it is
  // clear too (else the opening card never went live at the commonest size).
  const [cleared, setCleared] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || cleared || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e && (!e.isIntersecting || e.intersectionRatio === 0)) {
          setCleared(true);
          io.disconnect();
        }
      },
      { threshold: [0, 0.01] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cleared]);

  // The travel is reserved in CSS (no JS needed, CLS 0) wherever it can
  // run; a view that STARTED paused drops it. A mid-session Pause keeps it —
  // the card rests static while it passes — so the page never reflows under
  // the reader (the spacer is not motion).
  const pausedAtBoot = useMotionPausedAtBoot();
  const travels = long && !pausedAtBoot;
  const eligible = wide && !reduced && !still && (!long || desktopFine);
  const live = eligible && cleared;
  const pinned = travels && eligible;

  const passage = useScroll({ target: ref, offset: ["start end", "start start"] });
  const travel = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = pinned ? travel.scrollYProgress : passage.scrollYProgress;
  const fromOpacity = useTransform(p, (v) => 1 - remap(v, 0, 0.2));

  // which choreography plays (an ALT that was not built plays the default)
  const chosen = useVariant(variantChoice, `card-${kind}.choreo`);
  const variant: Variant = (forced ?? chosen) === "alt" && altFrame != null ? "alt" : "default";

  const state = useMemo(() => ({ p, live, long: pinned, variant }), [p, live, pinned, variant]);
  const titleId = `${id}-title`;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      data-section={id}
      data-act-card={kind}
      data-variant={variant}
      data-act-card-long={travels ? "" : undefined}
      data-live={live ? "" : undefined}
      {...planeAttrs("deep", world)}
      className="relative bg-bg text-fg"
    >
      <WorldProvider world={world} tone="deep">
        <CardContext.Provider value={state}>
          <div
            className={cn(
              "relative flex flex-col gap-tier-group px-gutter py-section",
              "sm:grid sm:min-h-svh sm:grid-rows-[1fr_auto_1fr] sm:gap-0 sm:px-0 sm:py-0",
              travels && "act-card-stage",
            )}
          >
            {fromGround && live ? (
              <motion.div
                aria-hidden="true"
                {...planeAttrs("deep", fromGround)}
                className="pointer-events-none absolute inset-0 bg-bg"
                style={{ opacity: fromOpacity }}
              />
            ) : null}

            {/* upper bar: Meta only */}
            <div className="relative order-1 flex items-end justify-between gap-tier-group sm:order-none sm:px-gutter sm:pb-4">
              <p className="type-meta text-fg-muted">{upperLeft}</p>
              {upperRight ? <p className="type-meta text-fg-muted">{upperRight}</p> : null}
            </div>

            {/* the frame (2.39:1 letterbox ≥ 640; 3:2 plate or free below) */}
            <div
              className={cn(
                "relative order-3 overflow-hidden sm:order-none sm:w-full",
                // a plate letterboxes from 640; free content (the opening
                // program) needs the 2.39:1 frame's height, so only from 1024
                frameShape === "plate"
                  ? "aspect-[3/2] sm:aspect-(--letterbox-ratio)"
                  : "lg:aspect-(--letterbox-ratio)",
              )}
            >
              {variant === "alt" ? altFrame : frame}
            </div>

            {/* lower bar: the h2 + ≤ 1 line + the progress element */}
            <div className="relative order-2 flex flex-col items-start gap-3 sm:order-none sm:px-gutter sm:pt-4">
              {lower}
              {progress ? <ProgressLine world={motifWorld} /> : null}
              {/* live: screen-reader only, so the bars keep the letterbox
                  geometry; the static card shows it as a visible line */}
              {summary ? (
                <p className={cn("type-small max-w-body text-fg-muted", live && "sr-only")}>
                  {summary}
                </p>
              ) : null}
            </div>
          </div>
        </CardContext.Provider>
      </WorldProvider>
    </section>
  );
}
