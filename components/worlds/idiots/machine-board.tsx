"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import type { CaptionKey } from "@/lib/film";
import { getMedia, rectOf, type MediaId } from "@/lib/media";
import { dur, easeDraw } from "@/lib/motion";
import type { HeadPlate } from "@/lib/page";
import { quotes } from "@/lib/quotes";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { FilmQuote } from "@/components/site/film-quote";
import { loopPath } from "@/components/site/idiots-chalk";
import { drawn } from "@/components/site/world-motion";
import { Lettered, SceneCaption } from "@/components/primitives/scene-caption";
import { CameraGroup, type CameraSpec } from "@/components/primitives/camera";
import type { EnterPhase } from "@/components/primitives/use-enter-once";
import { ChalkFilter, useSvgId } from "@/components/worlds/idiots/chalk";
import { PlateBand, coverRect, headPlateOf } from "@/components/worlds/idiots/plate-band";
import { BoardDrone, boardQuad } from "@/components/sections/act-card/frames/board-fig";
import { PlateBox, plateOf, type Plate } from "@/components/sections/act-card/plate";

/* ============================================================================
   WHAT IS A MACHINE? — the optuna-screener chapter's head band (ICONS
   IC-3I-05; M2 finish). The ICE lecture hall's big blank board (iconic-ice-
   alt; the ALT plays iconic-ice) with the lecture's question chalked on it
   and, under it, Rancho's answer — the registered line Q-3I-3, lettered in
   Kalam chalk through <FilmQuote> — because the automated research pipeline
   below is literally "a machine" in that sense. HTML chalk only (no text in
   the media), registered to the board rect measured on the plate
   (lib/media.ts rects.boardRect) through the band's cover crop, at 21:9 and
   at 4:3.
     DEFAULT "chalk-write": when the band scrolls in, the question writes
             itself on left → right, its underline draws, then the answer
             line writes on (once).
     ALT     "rancho-circle": both lines are already written; then Rancho's
             chalk circle (IC-3I-02) draws round the words that answer it.
   THE HOMEMADE DRONE (M5, blind D27/A27: "a stone lecture hall … without
   the drone sketch it is a generic classroom", 3I .45–.55): the film's
   quadcopter, top-down in chalk (the act-2 card's own drawing, BoardDrone),
   on the board's free upper right, clear of both lines (≥ 640; below it
   the board is too small beside the question). DEFAULT: it chalks itself
   in first, as the band enters; ALT: already drawn.
   The caption WHAT IS A MACHINE? • 3 IDIOTS sits on the benches' calm lower
   left. It is the section HEAD: it comes before the chapter's facts and
   never sits beside a metric (H4). < 640 the plate is 4:3, the question stays
   on the board and the answer + caption flow under it. Server HTML, no-JS,
   reduced motion and Pause: the final frame (the circle needs a measurement,
   so without JS it is simply absent).
   RASTER (P3-2, spec §12.1 #2, #8): the chalk that moves over the plate
   moves on its own layer, promoted only while it writes or draws — the
   lines write on by a sliding clip window (two transforms, no animated
   clip-path) and the drone chalks in on its own layer, so the photograph
   under them is never redrawn per frame.
   PHASE 3 (W3-IDIOTS; spec §6.1 row "iconic-ice-alt L16 (optuna head)",
   §2.3 B22): the plate is a LivePlate (L16 living loop; L08 on the ALT
   side) under a slow DRIFT 1.02 → 1 about the plate's focal point over the
   band's passage, and the boardRect chalk rides it: the question and the
   drone are registered overlays inside the plate's camera group, and the
   answer (on the board ≥ 640) sits in a twin CameraGroup with the same
   spec over the same box, so every chalk line stays on the board. Below
   1024 (and under RM / Pause) nothing moves. The chalk-write is the B22
   time star (through the spotlight; "skip" = written).
   ========================================================================== */

/** The board's drift (spec §6.1): 1.02 → 1 over the band's passage. */
function driftOf(focal: readonly [number, number]): CameraSpec {
  return { kind: "drift", scale: [1.02, 1], focal, driver: "flow" };
}

/** The lecture's question (a registered lettering string: lib/film.ts). */
const QUESTION = "What is a machine?";
/** The words Rancho's circle goes round (a phrase of Q-3I-3; the circle is
 *  skipped if the registry line ever stops containing it). */
const CIRCLED = "reduces human effort";

const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
/** The write's clip window reaches this far past the line's box (glyph
 *  overhang; the old clip was inset(-30% -6% -30% -2%)). */
const WRITE_MARGIN_EM = 0.4;
/** The window (and its counter-slide) at write progress k: 0 = the window a
 *  full width (+ its margins) left of the line, 1 = home. */
const windowAt = (k: number) => `translateX(calc(${((k - 1) * 100).toFixed(3)}% - ${((1 - k) * WRITE_MARGIN_EM).toFixed(4)}em))`;
const contentAt = (k: number) => `translateX(calc(${((1 - k) * 100).toFixed(3)}% + ${((1 - k) * WRITE_MARGIN_EM).toFixed(4)}em))`;

/** A line that writes itself on (a clip window sliding left → right + a
 *  quick fade), once, when `phase` enters; `write` false = already written.
 *  The window is the line's box widened by WRITE_MARGIN_EM (an overflow
 *  clip margin) and it slides in from the left while the line counter-
 *  slides: the reveal edge moves by transform only, on layers promoted for
 *  the write alone. At rest nothing clips or transforms. */
function ChalkWrite({
  phase,
  write,
  delay,
  duration,
  children,
  className,
  block = false,
}: {
  phase: EnterPhase;
  write: boolean;
  delay: number;
  duration: number;
  children: ReactNode;
  className?: string;
  /** A <div> (it holds a <p>) instead of a block <span>. */
  block?: boolean;
}) {
  const k = useMotionValue(1);
  const opacity = useMotionValue(1);
  const windowT = useTransform(k, windowAt);
  const contentT = useTransform(k, contentAt);
  const [done, setDone] = useState(false);
  useLayoutEffect(() => {
    if (!write || phase === "static") {
      k.jump(1);
      opacity.jump(1);
      return;
    }
    if (phase === "armed") {
      k.jump(0);
      opacity.jump(0);
      return;
    }
    let live = true;
    const a = animate(k, 1, { duration, delay, ease: [0.4, 0, 0.6, 1] });
    const b = animate(opacity, 1, { duration: 0.2, delay });
    Promise.all([a.finished, b.finished]).then(() => {
      if (live) setDone(true);
    });
    return () => {
      live = false;
      a.stop();
      b.stop();
    };
  }, [phase, write, delay, duration, k, opacity]);
  const writing = write && (phase === "armed" || (phase === "entered" && !done));
  const windowClass = writing ? "overflow-clip [overflow-clip-margin:0.4em] will-change-transform" : undefined;
  const contentClass = writing ? "will-change-[transform,opacity]" : undefined;
  const windowStyle = writing ? { transform: windowT } : undefined;
  const contentStyle = writing ? { transform: contentT, opacity } : { opacity };
  return block ? (
    <motion.div className={cn(className, windowClass)} style={windowStyle}>
      <motion.div className={contentClass} style={contentStyle}>
        {children}
      </motion.div>
    </motion.div>
  ) : (
    <motion.span className={cn("block", className, windowClass)} style={windowStyle}>
      <motion.span className={cn("block", contentClass)} style={contentStyle}>
        {children}
      </motion.span>
    </motion.span>
  );
}

type Box = { x: number; y: number; w: number; h: number };

/** The band's frame: 4:3 below 640, 21:9 from 640 (PlateBand "band"). */
const BAND_ASPECT = { base: 4 / 3, sm: 21 / 9 };
/** The drone's rows on the slate (board-local v): above the answer line
 *  (it starts at v .48) and clear of the ALT's circle round its phrase. */
const DRONE_V = { v0: 0.06, v1: 0.42 };
/** Its drawn aspect (w / h): the 100 × 80 drawing a little foreshortened,
 *  as a sketch on a board seen from the benches, so it can be wider in the
 *  slate's free top-right than the rows alone allow. */
const DRONE_ASPECT = 1.45;
/** Its right edge (board-local u), in from the frame. */
const DRONE_U1 = 0.97;

/** The drone's board-local box: DRONE_V tall, as wide as the drawing's
 *  DRONE_ASPECT needs ON THIS PLATE (the slate's size differs per plate),
 *  right-aligned. null when the plate has no measured board. */
function droneBoxOf(plate: Plate): { u0: number; u1: number; v0: number; v1: number } | null {
  const q = boardQuad(plate);
  if (!q) return null;
  const u = DRONE_U1 - 0.08;
  const top = q.tl[1] + (q.tr[1] - q.tl[1]) * u;
  const bot = q.bl[1] + (q.br[1] - q.bl[1]) * u;
  const hPx = (bot - top) * (DRONE_V.v1 - DRONE_V.v0);
  const span = (hPx * DRONE_ASPECT) / (q.tr[0] - q.tl[0]);
  return { u0: DRONE_U1 - span, u1: DRONE_U1, ...DRONE_V };
}

/** THE HOMEMADE DRONE on the lecture-hall board: chalks in once when the
 *  band enters (`draw`), or is simply drawn (ALT, static, reduced motion). */
function MachineDrone({ id, phase, draw }: { id: MediaId; phase: EnterPhase; draw: boolean }) {
  const plate = plateOf(id);
  const progress = useMotionValue(1);
  const live = draw && phase !== "static";
  const [drawn, setDrawn] = useState(false);
  useLayoutEffect(() => {
    if (!live) {
      progress.jump(1);
      return;
    }
    if (phase === "armed") {
      progress.jump(0);
      return;
    }
    let on = true;
    const a = animate(progress, 1, { duration: 1.1, delay: 0.1, ease: easeDraw });
    a.finished.then(() => {
      if (on) setDrawn(true);
    });
    return () => {
      on = false;
      a.stop();
    };
  }, [live, phase, progress]);
  const box = plate ? droneBoxOf(plate) : null;
  if (!plate || !box) return null;
  return (
    // its own layer while it chalks in (spec §12.1 #8): the plate under it
    // is never redrawn per frame
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 hidden sm:block", live && !drawn && "will-change-transform")}
      data-board-art="machine-drone"
    >
      <PlateBox plate={plate} aspect={BAND_ASPECT}>
        <BoardDrone plate={plate} box={box} draw={progress} live={live} />
      </PlateBox>
    </div>
  );
}

/** Rancho's circle round CIRCLED inside the host's <q>: measured with a
 *  Range (the line renders only through <FilmQuote>, so the phrase is never
 *  wrapped in markup of ours), re-measured on resize and once the fonts are
 *  in. Nothing until measured. */
function PhraseCircle({ host, phase, on }: { host: RefObject<HTMLElement | null>; phase: EnterPhase; on: boolean }) {
  const [box, setBox] = useState<Box | null>(null);
  const fid = useSvgId("machine-circle");
  useEffect(() => {
    const el = host.current;
    if (!on || !el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const q = el.querySelector("q");
      let found: Box | null = null;
      if (q) {
        const walker = document.createTreeWalker(q, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const t = n as Text;
          const i = t.data.indexOf(CIRCLED);
          if (i < 0) continue;
          const r = document.createRange();
          r.setStart(t, i);
          r.setEnd(t, i + CIRCLED.length);
          const rects = Array.from(r.getClientRects()).filter((b) => b.width > 0);
          if (!rects.length) break;
          const hb = el.getBoundingClientRect();
          const left = Math.min(...rects.map((b) => b.left));
          const right = Math.max(...rects.map((b) => b.right));
          const top = Math.min(...rects.map((b) => b.top));
          const bottom = Math.max(...rects.map((b) => b.bottom));
          found = { x: left - hb.left, y: top - hb.top, w: right - left, h: bottom - top };
          break;
        }
      }
      setBox((b) =>
        b && found && Math.abs(b.x - found.x) < 0.5 && Math.abs(b.y - found.y) < 0.5 && Math.abs(b.w - found.w) < 0.5 && Math.abs(b.h - found.h) < 0.5
          ? b
          : found,
      );
    };
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) measure();
    });
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [host, on]);
  if (!on || !box) return null;
  const loop = loopPath(box.w, box.h);
  return (
    // the SVG box is the phrase's own box; the loop overflows it visibly
    // (a box grown by the loop's margin can widen a phone's page: M5 QA)
    <svg
      aria-hidden="true"
      focusable="false"
      width={box.w}
      height={box.h}
      className="pointer-events-none absolute overflow-visible"
      style={{ left: box.x, top: box.y }}
      data-chalk="circle"
    >
      <defs>
        <ChalkFilter id={fid} />
      </defs>
      <g transform={`translate(${-loop.ox} ${-loop.oy})`}>
        <motion.path
          d={loop.d}
          fill="none"
          className="stroke-(--w-chalk)"
          strokeWidth={2.4}
          strokeLinecap="round"
          filter={`url(#${fid})`}
          {...drawn(phase, { delay: 0.45, duration: dur.draw.med })}
        />
      </g>
    </svg>
  );
}

export function MachineBoard({
  spec,
  choice,
  pieceKey,
  captionKey,
  className,
}: {
  /** The board plate (iconic-ice-alt; the ALT plays the pair's other side). */
  spec: HeadPlate;
  choice: VariantChoice;
  /** The registry piece ("optuna-screener.head"). */
  pieceKey: string;
  captionKey: CaptionKey;
  className?: string;
}) {
  const variant = useVariant(choice, pieceKey);
  const alt = variant === "alt";
  const id = headPlateOf(spec, variant);
  const answerRef = useRef<HTMLDivElement>(null);
  const fid = useSvgId("machine-u");
  const rect = id ? rectOf(id, "boardRect") : null;
  const circleOn = alt && quotes["Q-3I-3"].text.includes(CIRCLED);
  const camera = driftOf((id ? getMedia(id).focal : null) ?? [0.5, 0.5]);

  // the board rect in the band box, ≥ 640 (21:9) and below (4:3)
  let vars: CSSProperties | undefined;
  if (id && rect) {
    const a = getMedia(id);
    const ratio = a.width / a.height;
    const lg = coverRect(rect, ratio, 21 / 9, a.focal ?? [0.5, 0.5]);
    const sm = coverRect(rect, ratio, 4 / 3, a.focal ?? [0.5, 0.5]);
    const w = (b: typeof lg) => b.x1 - b.x0;
    const h = (b: typeof lg) => b.y1 - b.y0;
    vars = {
      // the question: the board's upper band (both sizes)
      "--mq-l": pct(sm.x0 + 0.06 * w(sm)),
      "--mq-t": pct(sm.y0 + 0.14 * h(sm)),
      "--mq-w": pct(0.86 * w(sm)),
      "--mq-l-lg": pct(lg.x0 + 0.045 * w(lg)),
      "--mq-t-lg": pct(lg.y0 + 0.13 * h(lg)),
      "--mq-w-lg": pct(0.88 * w(lg)),
      // the answer (≥ 640 only: on the board's lower half)
      "--ma-l-lg": pct(lg.x0 + 0.045 * w(lg)),
      "--ma-t-lg": pct(lg.y0 + 0.48 * h(lg)),
      "--ma-w-lg": pct(0.88 * w(lg)),
    } as CSSProperties;
  }

  if (!id) return null;
  return (
    <div
      style={vars}
      className={className}
      data-scene="machine"
      data-choreo={alt ? "rancho-circle" : "chalk-write"}
      {...beatAttrs("B22", { weight: 2 })}
    >
      <PlateBand
        plate={id}
        entrance="none"
        shape="band"
        amount={0.4}
        camera={camera}
        star={{ id: "B22", weight: 2 }}
        caption={<SceneCaption k={captionKey} place="bl" />}
        registered={(phase) =>
          rect ? (
            <>
              <MachineDrone id={id} phase={phase} draw={!alt} />
              {/* the question, chalked on the board (aria-hidden: the caption
                  names the same moment for assistive tech) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-(--mq-t) left-(--mq-l) w-(--mq-w) sm:top-(--mq-t-lg) sm:left-(--mq-l-lg) sm:w-(--mq-w-lg)"
              >
                <span className="relative inline-block pb-[0.28em]">
                  <ChalkWrite phase={phase} write={!alt} delay={0.25} duration={0.95}>
                    <Lettered
                      world="idiots"
                      text={QUESTION}
                      className="block text-[length:5.6cqw] leading-[1.05] tracking-[0.01em] text-(--w-chalk) sm:text-[length:3.4cqw]"
                    />
                  </ChalkWrite>
                  <svg
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                    className="absolute inset-x-0 bottom-0 h-[0.3em] w-full overflow-visible"
                  >
                    <defs>
                      <ChalkFilter id={fid} />
                    </defs>
                    <motion.path
                      d="M3 6 C55 3.5 120 7.5 197 4.5"
                      fill="none"
                      className="stroke-(--w-chalk)"
                      strokeOpacity={0.9}
                      strokeWidth={2}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      filter={`url(#${fid})`}
                      {...drawn(alt ? "static" : phase, { delay: 1.1, duration: dur.draw.short })}
                    />
                  </svg>
                </span>
              </div>
            </>
          ) : null
        }
        after={(phase) => (
          // Rancho's answer: the registered line, through <FilmQuote>. On the
          // board ≥ 640 (inside a twin of the plate's camera, over the same
          // box, so it drifts with the board); in flow under the plate
          // below. Its attribution Meta is lifted to a chalk-light grey so it
          // stays AA on the board.
          <CameraGroup spec={camera} className="relative sm:pointer-events-none sm:absolute sm:inset-0">
            <div
              ref={answerRef}
              className="relative mt-tier-pair [--fg-muted:#d6dcd5] sm:pointer-events-auto sm:absolute sm:top-(--ma-t-lg) sm:left-(--ma-l-lg) sm:mt-0 sm:w-(--ma-w-lg)"
            >
              <ChalkWrite phase={phase} write={!alt} delay={1.55} duration={1.5} block>
                <p className="text-[clamp(1.125rem,0.9rem+1vw,1.5rem)] leading-[1.25] text-(--w-chalk) sm:text-[length:1.95cqw]">
                  <FilmQuote id="Q-3I-3" rendition="lettered" attribution="speaker" />
                </p>
              </ChalkWrite>
              <PhraseCircle host={answerRef} phase={phase} on={circleOn} />
            </div>
          </CameraGroup>
        )}
      />
    </div>
  );
}
