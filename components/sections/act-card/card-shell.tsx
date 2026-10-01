"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useDesktopFine, useMediaQuery, useMotionPausedAtBoot, useReducedMotion } from "@/lib/flags";
import { useVariant } from "@/lib/use-variant";
import { cn } from "@/lib/utils";
import type { Variant, VariantChoice } from "@/lib/variants";
import { planeAttrs, type ToneId, type WorldId } from "@/lib/worlds";
import { WorldProvider } from "@/components/primitives/world";
import { remap } from "@/components/primitives/loaders/line";
import { CardCaptions, type CaptionCue } from "@/components/sections/act-card/card-captions";
import { CardContext, type CardState, type PinState } from "@/components/sections/act-card/card-context";
import type { CardPinSpec } from "@/components/sections/act-card/pin-spec";
import { ProgressLine } from "@/components/sections/act-card/progress-line";

/* Phase 3 pin mode (DP-13): everything the pinned card does beyond Phase 2
   — the damped p, impacts, the GL layer, the title mask, the push-ins, the
   kraken, weather — is ONE lazy chunk, loaded on DESKTOP_FINE only. */
const CardP3 = lazy(() => import("@/components/sections/act-card/card-p3").then((m) => ({ default: m.CardP3 })));

/**
 * CardShell — the letterboxed loading-reel grammar every derived act card
 * shares (SPEC v2 §8.2, §9.3; act-cards.BAR §3–§7), with the M2
 * RECOGNIZABILITY title block (§4.3):
 *
 *   ≥ 640 px  the section is 100svh on the incoming world's DEEP ground — the
 *             ground IS the bars (no bar elements): upper bar · frame 2.39:1
 *             · lower bar. The upper bar is never shorter than the header +
 *             8rem and the lower never shorter than 8.5rem, so the film
 *             title and the Meta always sit CLEAR of the fixed header (M2
 *             ART-DIRECTOR #5); the frame is capped to what is left
 *             (100svh − header − 17rem, still 2.39:1) and centred — full
 *             bleed wherever it fits (--card-frame-w, app/globals.css), else
 *             a centred picture window (1338 px at 1440×900, 908 at
 *             1280×720) with the bars' text inset to its edges (--card-inset).
 *             Upper bar: Meta (act credit left, reel mark right) and, right
 *               above the frame, THE FILM TITLE in the world's fan face at
 *               --text-title ("3 IDIOTS"): the card is named at a glance.
 *             Lower bar, left: the act h2 (smaller than the film title) +
 *               ≤ 1 line + the world's progress line.
 *             Lower bar, right, under the frame's corner: the MOMENT
 *               caption ("THE LECTURE HALL AT ICE • 3 IDIOTS"); an OUTGOING
 *               caption (slot "frame") sits over the frame's top-right
 *               corner while live, so it is on screen as the card enters.
 *   < 640 px  letterbox off: a stacked static card (Meta → film → title →
 *             line → frame → caption), 0 travel.
 *   "flow"    (the opening card) the same bars and frame without the 100svh
 *             letterbox, and the program (`after`) below the frame.
 *
 * Smooth world changes (RECOGNIZABILITY §8, rule (d)) — never a hard edge:
 *   prevGround  the previous section's ground fades into the card's over
 *               the card's first 30vh (a static opacity mask; SSR, RM and
 *               no-JS included).
 *   nextGround  the card's ground fades into the next section's over its
 *               last 20vh.
 *   fromGround  (ignite) the whole card crossfades rd deep → hp deep over
 *               p 0–.2 (live only).
 *
 * Driver p (direct, no spring; reverses by position):
 *   passage (0-travel cards: opening, tintype, reel, title) — 0 as the card's
 *     top enters the viewport, 1 as it reaches the top: "the card has arrived".
 *   pinned — Phase 3's pin mode (below): the four authored cards' travel,
 *     reserved by CSS on the boot gate (app/p3/cards.css), so SSR already
 *     has it: CLS 0. (Phase 2's `[data-act-card-long]` rule is retired.)
 *   The opening program (`after`) runs on its OWN passage (its top entering
 *     → its bottom in view), so the course is drawn while it is on screen.
 *
 * Honesty (C11): no "loading", no %, no role=status; the progress line is
 * aria-hidden. 0 tab stops except the opening card's rows. No aqua at rest.
 *
 * Variants (lib/variants.ts; registry piece `card-<kind>.choreo`): the
 * server hands BOTH choreographies — `frame` / `after` / `captions`
 * (DEFAULT) and `altFrame` / `altAfter` / `altCaptions` (ALT, lazy chunks:
 * components/sections/act-card/alt-frames.tsx) — and this shell plays one:
 * the manifest's `variantChoice` on the server and during hydration, the
 * ?variant=… preview after mount (useVariant), or a forced `variant` (/lab).
 * The section, the bars, the film title, the h2 and every focus target are
 * the same DOM in both (the opening program's alt keeps the same row
 * anchors, in the same order).
 *
 * PHASE 3 PIN MODE (PHASE3-SPEC §7.1; PHASE3-PLAN §6.1 W2-CARDS):
 *   pinned = travel > 0 && DESKTOP_FINE && !pausedAtBoot. The four
 *   authored cards (opening, seam, tintype, ignite) pin for
 *   `film.cardTravel` (90 / 110 / 90 / 110 vh). The card stage sits in its
 *   own PIN WRAPPER (`data-act-card-pin`, the p target; the opening's
 *   program is a sibling after it, its own `stage-backdrop` block). The
 *   travel, the sticky stage, the opening's letterbox grid, the registered
 *   crops, the subtitle and the beat markers are CSS keyed ONLY on the boot
 *   gate (app/p3/cards.css): SSR paints the final layout, and a Pause or a
 *   paused reload never changes a box (P3-2 #11). A mid-session Pause keeps
 *   the pin; the card rests as its static settled frame while it passes.
 *   Below DESKTOP_FINE every card keeps the Phase-2 `long` flag, driver and
 *   `eligible` rule above, unchanged.
 *   In pin mode the frames' `p` is star (a)'s progress (0 → 1 over p 0–.45;
 *   the tintype's develop .03–.45) and `pin` carries the damped p (`t`),
 *   star (b) (`b`), the approach (`enter`) and the lazy chunk's pieces
 *   (card-p3.tsx): the damping, the push-ins, the act title mask, the
 *   subtitle phases, the impacts, the GL layer, the kraken and weather. The
 *   card goes live only once that chunk is in (never a half-built card).
 */
type Ground = { world: WorldId; tone: ToneId };

type Props = {
  id: string;
  kind: string;
  /** The plane of the card (the incoming world's deep). */
  world: WorldId;
  /** The world whose loader grammar / progress line the card uses. */
  motifWorld: WorldId;
  /** Pinned long card (seam / ignite, D-5). */
  long: boolean;
  /** Turned down (world intensity below `full`): the static title card. */
  still?: boolean;
  /** Ground the card crossfades FROM over p 0–.2 (the ignite: rd → hp). */
  fromGround?: WorldId | null;
  /** The previous section's plane (its ground fades into the card's top). */
  prevGround?: Ground | null;
  /** The next section's plane (the card's bottom fades into it). */
  nextGround?: Ground | null;
  upperLeft: string;
  upperRight?: string;
  /** The film title block (server-rendered <FilmTitle>), set above the frame. */
  film?: ReactNode;
  /** The frame (choreography): the DEFAULT variant. */
  frame: ReactNode;
  /** The ALT choreography of the same frame (null/absent: none built). */
  altFrame?: ReactNode;
  /** Content after the frame + bars (the opening program), per variant. */
  after?: ReactNode;
  altAfter?: ReactNode;
  /** The MOMENT caption cues, per variant (card-captions.tsx). An ALT
   *  without its own list (undefined) shows the default's; an explicit []
   *  means the ALT sets its caption elsewhere (the opening chart). */
  captions?: readonly CaptionCue[];
  altCaptions?: readonly CaptionCue[];
  /** The manifest's variant choice for this card (`item.variant`). */
  variantChoice?: VariantChoice | null;
  /** Force a variant (the /lab side-by-side); bypasses the URL preview. */
  variant?: Variant;
  /** "letterbox" (every card) or "flow" (the opening: no 100svh bars, the
   *  program follows the frame). */
  layout?: "letterbox" | "flow";
  /** Lower bar: the h2 and ≤ 1 line (server-rendered). The opening card
   *  sets its h2 beside the program and passes none. */
  lower?: ReactNode;
  /** Text equivalent of an aria-hidden frame ("" when the frame is itself
   *  readable, as the opening program is). */
  summary: string;
  /** The lower bar's progress line (default on). The opening card's course
   *  through its rows IS its progress element, so it passes false. */
  progress?: boolean;
  /* — Phase 3 (pin mode; all optional: /lab and the generic cards omit them) — */
  /** The card's pinned travel in vh (`item.travel`; 0 = no pin). */
  travel?: number;
  /** What the pinned card plays (server-built; pin-spec.ts). */
  pin?: CardPinSpec | null;
  /** The act logline as the lower bar's static subtitle (§8.4): server
   *  markup (<Subtitle>, components/stage/subtitle.tsx). */
  subtitle?: ReactNode;
  /** The upper bar's Meta row extra (the seam's "HERE BE MONSTERS" button,
   *  pc-kraken): server markup, bound by the pin chunk. */
  metaExtra?: ReactNode;
  /** The opening program's stage backdrop (lib/film.ts acts[0].stage): its
   *  anchor id (the stage cue's `at`) and its scrim (server markup). */
  program?: { id: string; scrim: ReactNode } | null;
};

const WIDE = "(min-width: 40rem)";

export function CardShell({
  id,
  kind,
  world,
  motifWorld,
  long,
  still = false,
  fromGround = null,
  prevGround = null,
  nextGround = null,
  upperLeft,
  upperRight,
  film,
  frame,
  altFrame = null,
  after = null,
  altAfter = null,
  captions = [],
  altCaptions,
  variantChoice = null,
  variant: forced,
  layout = "letterbox",
  lower,
  summary,
  progress = true,
  travel = 0,
  pin = null,
  subtitle = null,
  metaExtra = null,
  program = null,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const [pinEl, setPinEl] = useState<HTMLDivElement | null>(null);
  // one stable callback ref: the pin wrapper for useScroll and as a node
  const pinCb = useCallback((el: HTMLDivElement | null) => {
    pinRef.current = el;
    setPinEl(el);
  }, []);
  const reduced = useReducedMotion();
  const wide = useMediaQuery(WIDE);
  // the Phase-3 desktop gate (lib/flags.ts; ≥ 64rem, hover, fine pointer)
  const desktopFine = useDesktopFine();

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

  // The travel is reserved in CSS keyed on the boot gate alone (cards.css:
  // no JS, CLS 0): a view that STARTED paused never has it (the pre-paint
  // boot script marks <html>), and a mid-session Pause keeps it — the card
  // rests static while it passes — so the page never reflows under the
  // reader (the spacer is not motion; P3-2 #11).
  const pausedAtBoot = useMotionPausedAtBoot();
  // Phase 3 pin mode (the boot gate's JS twin: CSS reserves the travel)
  const p3 = travel > 0 && pin !== null && desktopFine && !pausedAtBoot;
  // the pin chunk's drivers (card-p3.tsx); the card goes live once they are in
  const [pinState, setPinState] = useState<PinState | null>(null);
  const pinNow = p3 ? pinState : null;
  // Phase 2 (everything below the pin mode), unchanged
  const travels = long && !pausedAtBoot;
  const eligible = p3 ? !reduced && !still : wide && !reduced && !still && (!long || desktopFine);
  const live = eligible && cleared && (!p3 || pinNow !== null);
  const pinned = !p3 && travels && eligible;

  // the pin wrapper's top is the section's: the passage is the same driver
  const passage = useScroll({ target: pinRef, offset: ["start end", "start start"] });
  const travelP = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  // pin mode: the frames run on star (a) of the DAMPED p (card-p3.tsx)
  const p = pinNow ? pinNow.a : pinned ? travelP.scrollYProgress : passage.scrollYProgress;
  const fromOpacity = useTransform(p, (v) => 1 - remap(v, 0, 0.2));

  // which choreography plays (an ALT that was not built plays the default)
  const chosen = useVariant(variantChoice, `card-${kind}.choreo`);
  const variant: Variant = (forced ?? chosen) === "alt" && altFrame != null ? "alt" : "default";

  const state = useMemo(
    () => ({ p, live, long: pinned || p3, variant, pin: pinNow }),
    [p, live, pinned, p3, variant, pinNow],
  );
  const titleId = `${id}-title`;
  const cues = variant === "alt" && altCaptions ? altCaptions : captions;
  // an outgoing caption over the frame exists only while live (≥ 640, the
  // choreography running); the static card shows the settled one alone
  const frameCues = live ? cues.filter((c) => c.slot === "frame") : [];
  const underCues = cues.filter((c) => c.slot !== "frame");
  const tail = variant === "alt" && altAfter != null ? altAfter : after;
  const flow = layout === "flow";

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      data-section={id}
      data-act-card={kind}
      data-variant={variant}
      data-live={live ? "" : undefined}
      {...planeAttrs("deep", world)}
      className="relative bg-bg text-fg"
    >
      <WorldProvider world={world} tone="deep">
        <CardContext.Provider value={state}>
          {/* — the world change, never a hard edge (static; RM / NJ too) — */}
          {prevGround ? (
            <span
              aria-hidden="true"
              {...planeAttrs(prevGround.tone, prevGround.world)}
              className="pointer-events-none absolute inset-x-0 top-0 h-[min(30vh,45%)] bg-bg [mask-image:linear-gradient(to_bottom,#000,transparent)]"
            />
          ) : null}
          {nextGround ? (
            <span
              aria-hidden="true"
              data-card-ground="next"
              {...planeAttrs(nextGround.tone, nextGround.world)}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(20vh,30%)] bg-bg [mask-image:linear-gradient(to_top,#000,transparent)]"
            />
          ) : null}

          {/* the PIN WRAPPER (the p target): the card's stage, and in pin
              mode its travel (CSS, the boot gate only) and the stars'
              markers (the pin spacer, added by the pin chunk: the beats
              probe and the spotlight measure them); a plain block
              everywhere else */}
          <div
            ref={pinCb}
            className="act-card-pin"
            data-act-card-pin={travel > 0 ? kind : undefined}
          >
            <div
              className={cn(
                "act-card-stage relative flex flex-col gap-tier-group px-gutter py-section",
                flow
                  ? "sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0 sm:px-0 sm:pt-[calc(var(--header-h)+var(--spacing-tier-group))] sm:pb-0"
                  : // the upper bar clears the fixed header (+ Meta + the film
                    // title); the lower keeps the h2 + line; the frame (capped
                    // in CSS: .act-card-letterbox) takes what is left
                    // the lower row is `auto` (not 1fr): two 1fr rows under a
                    // min-height resolve to the LARGER minimum each (196 px),
                    // which made every card 952 px at 1440×900 (critic 3 #2)
                    "act-card-letterbox sm:grid sm:min-h-svh sm:grid-cols-[minmax(0,1fr)_auto] sm:grid-rows-[minmax(calc(var(--header-h)+8rem),1fr)_auto_minmax(8.5rem,auto)] sm:gap-0 sm:px-0 sm:py-0",
              )}
              data-card-stage=""
            >
              {fromGround && live ? (
                <motion.div
                  aria-hidden="true"
                  {...planeAttrs("deep", fromGround)}
                  className="pointer-events-none absolute inset-0 bg-bg will-change-[opacity]"
                  style={{ opacity: fromOpacity }}
                />
              ) : null}

              {/* upper bar: Meta, then the film title right above the frame */}
              <div
                className={cn(
                  "act-card-upper relative order-1 flex flex-col justify-end gap-2 sm:order-none sm:col-span-2 sm:row-start-1 sm:pb-4",
                  flow ? "sm:px-gutter" : "sm:px-(--card-inset)",
                )}
              >
                <div className="flex items-end justify-between gap-tier-group">
                  <p className="type-meta text-fg-muted">{upperLeft}</p>
                  {metaExtra}
                  {upperRight ? <p className="type-meta whitespace-nowrap text-fg-muted">{upperRight}</p> : null}
                </div>
                {film}
              </div>

              {/* the frame (2.39:1 letterbox ≥ 640; 3:2 plate or free below).
                  The choreography sits in a frame-sized content box (the
                  push-ins scale it in pin mode); the pin chunk adds its
                  layers (GL, the title mask, the kraken, weather) after it */}
              <div
                ref={setFrameEl}
                data-act-card-frame=""
                className={cn(
                  "act-card-frame relative order-3 aspect-[3/2] overflow-hidden sm:order-none sm:col-span-2 sm:row-start-2 sm:aspect-(--letterbox-ratio)",
                  flow ? "sm:w-full" : "sm:w-[min(100%,var(--card-frame-w))] sm:justify-self-center",
                )}
              >
                <div ref={contentRef} className="absolute inset-0" data-card-content="">
                  {variant === "alt" ? altFrame : frame}
                </div>
                {/* the OUTGOING caption, over the corner the old world leaves
                    by (live, ≥ 640; its own world's deep scrim: CSS) */}
                {frameCues.length ? (
                  <div className="card-cap-frame pointer-events-none absolute top-[max(1.5rem,8%)] right-[max(1.5rem,8%)] z-[2] hidden w-[min(46%,36rem)] sm:block">
                    <CardCaptions cues={frameCues} align="end" />
                  </div>
                ) : null}
              </div>

              {/* lower bar, left: the h2 + ≤ 1 line + the progress element */}
              {lower || progress || summary ? (
                <div className="act-card-lower relative order-2 flex min-w-0 flex-col items-start gap-3 sm:order-none sm:col-start-1 sm:row-start-3 sm:pt-4 sm:pr-6 sm:pl-(--card-inset)">
                  {lower}
                  {progress ? <ProgressLine world={motifWorld} /> : null}
                  {/* live: screen-reader only, so the bars keep the letterbox
                      geometry; the static card shows it as a visible line
                      (pin mode: always screen-reader only, cards.css, so a
                      Pause never changes the bar's height) */}
                  {summary ? (
                    <p className={cn("act-card-summary type-small max-w-body text-fg-muted", live && "sr-only")}>{summary}</p>
                  ) : null}
                </div>
              ) : null}

              {/* lower bar, right: the MOMENT caption under the frame's corner
                  (a cell that never shrinks: the caption fills its first line,
                  ART-DIRECTOR #4) */}
              {underCues.length ? (
                <div
                  className={cn(
                    "act-card-under relative order-4 min-w-0 sm:order-none sm:row-start-3 sm:justify-self-end sm:pt-4 sm:pl-6",
                    // the opening has no lower-left block: the caption spans the
                    // row and hugs the frame's right corner
                    flow
                      ? "sm:col-span-2 sm:col-start-1 sm:w-[min(46vw,38rem)] sm:pr-gutter"
                      : "act-card-cap sm:col-start-2 sm:pr-(--card-inset)",
                  )}
                >
                  <CardCaptions cues={underCues} />
                </div>
              ) : null}

              {/* the act logline as a static subtitle (§8.4): shown in the
                  lower bar during star (b) in pin mode, screen-reader only
                  everywhere else (cards.css; absolutely placed: 0 layout) */}
              {subtitle}
            </div>
          </div>

          {tail != null ? (
            <ProgramStage live={live} variant={variant} program={program}>
              {tail}
            </ProgramStage>
          ) : null}

          {desktopFine && pin !== null && travel > 0 ? (
            <Suspense fallback={null}>
              <CardP3
                spec={pin}
                pinned={p3}
                live={live}
                raw={travelP.scrollYProgress}
                enter={passage.scrollYProgress}
                section={ref}
                pinEl={pinRef}
                pinNode={pinEl}
                content={contentRef}
                frame={frameEl}
                choreo={variant}
                choice={variantChoice}
                onPin={setPinState}
              />
            </Suspense>
          ) : null}
        </CardContext.Provider>
      </WorldProvider>
    </section>
  );
}

/** The opening program's own driver: its passage from its top entering the
 *  viewport to its bottom coming into view (so the course plots while the
 *  rows are on screen). Same `live` gate as the card. */
function ProgramStage({
  live,
  variant,
  program,
  children,
}: {
  live: boolean;
  variant: Variant;
  /** Phase 3 (spec §3.2): the block is a `stage-backdrop` — the act-1
   *  program reads over the persistent stage's plate (the opening's exit
   *  frame) behind its static scrim, where the stage is live (stage.css);
   *  opaque on the section's ground everywhere else. */
  program: { id: string; scrim: ReactNode } | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const state = useMemo<CardState>(
    () => ({ p: scrollYProgress, live, long: false, variant }),
    [scrollYProgress, live, variant],
  );
  return (
    <div
      ref={ref}
      id={program?.id}
      className={cn("relative px-gutter pt-tier-group pb-section sm:pt-tier-block", program && "stage-backdrop isolate")}
      data-beat="B06"
      data-beat-star=""
      data-beat-weight="1"
    >
      {program?.scrim}
      <CardContext.Provider value={state}>{children}</CardContext.Provider>
    </div>
  );
}
