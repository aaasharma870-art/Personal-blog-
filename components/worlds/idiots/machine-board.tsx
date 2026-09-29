"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { animate, motion, useMotionValue } from "motion/react";
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
import { Lettered, SceneCaption } from "@/components/primitives/scene-caption";
import type { EnterPhase } from "@/components/primitives/use-enter-once";
import { ChalkFilter, useSvgId } from "@/components/worlds/idiots/chalk";
import { PlateBand, coverRect, headPlateOf } from "@/components/worlds/idiots/plate-band";

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
   The caption WHAT IS A MACHINE? • 3 IDIOTS sits on the benches' calm lower
   left. It is the section HEAD: it comes before the chapter's facts and
   never sits beside a metric (H4). < 640 the plate is 4:3, the question stays
   on the board and the answer + caption flow under it. Server HTML, no-JS,
   reduced motion and Pause: the final frame (the circle needs a measurement,
   so without JS it is simply absent).
   ========================================================================== */

/** The lecture's question (a registered lettering string: lib/film.ts). */
const QUESTION = "What is a machine?";
/** The words Rancho's circle goes round (a phrase of Q-3I-3; the circle is
 *  skipped if the registry line ever stops containing it). */
const CIRCLED = "reduces human effort";

const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
const WRITE_OPEN = "inset(-30% -6% -30% -2%)";
const WRITE_SHUT = "inset(-30% 100% -30% -2%)";

/** A line that writes itself on (clip left → right + a quick fade), once,
 *  when `phase` enters; `write` false = already written. */
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
  const clipPath = useMotionValue(WRITE_OPEN);
  const opacity = useMotionValue(1);
  useLayoutEffect(() => {
    if (!write || phase === "static") {
      clipPath.jump(WRITE_OPEN);
      opacity.jump(1);
      return;
    }
    if (phase === "armed") {
      clipPath.jump(WRITE_SHUT);
      opacity.jump(0);
      return;
    }
    const a = animate(clipPath, WRITE_OPEN, { duration, delay, ease: [0.4, 0, 0.6, 1] });
    const b = animate(opacity, 1, { duration: 0.2, delay });
    return () => {
      a.stop();
      b.stop();
    };
  }, [phase, write, delay, duration, clipPath, opacity]);
  return block ? (
    <motion.div className={className} style={{ clipPath, opacity }}>
      {children}
    </motion.div>
  ) : (
    <motion.span className={cn("block", className)} style={{ clipPath, opacity }}>
      {children}
    </motion.span>
  );
}

/** pathLength for a chalk stroke that draws once at `delay` (or is drawn). */
function strokeProps(phase: EnterPhase, draw: boolean, delay: number, duration: number) {
  return {
    initial: false as const,
    animate: { pathLength: draw && phase === "armed" ? 0 : 1 },
    transition: draw && phase === "entered" ? { duration, ease: easeDraw, delay } : { duration: 0 },
  };
}

type Box = { x: number; y: number; w: number; h: number };

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
    <svg
      aria-hidden="true"
      focusable="false"
      width={loop.vw}
      height={loop.vh}
      viewBox={`0 0 ${loop.vw} ${loop.vh}`}
      className="pointer-events-none absolute overflow-visible"
      style={{ left: box.x - loop.ox, top: box.y - loop.oy }}
      data-chalk="circle"
    >
      <defs>
        <ChalkFilter id={fid} />
      </defs>
      <motion.path
        d={loop.d}
        fill="none"
        className="stroke-(--w-chalk)"
        strokeWidth={2.4}
        strokeLinecap="round"
        filter={`url(#${fid})`}
        {...strokeProps(phase, true, 0.45, dur.draw.med)}
      />
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
  const pick = headPlateOf(spec, variant);
  const answerRef = useRef<HTMLDivElement>(null);
  const fid = useSvgId("machine-u");
  const id: MediaId | null = pick?.id ?? null;
  const rect = id ? rectOf(id, "boardRect") : null;
  const circleOn = alt && quotes["Q-3I-3"].text.includes(CIRCLED);

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
    <div style={vars} className={className} data-scene="machine" data-choreo={alt ? "rancho-circle" : "chalk-write"}>
      <PlateBand
        plate={id}
        entrance="none"
        shape="band"
        amount={0.4}
        caption={<SceneCaption k={captionKey} place="bl" />}
        overlay={(phase) =>
          rect ? (
            // the question, chalked on the board (aria-hidden: the caption
            // names the same moment for assistive tech)
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
                    {...strokeProps(phase, !alt, 1.1, dur.draw.short)}
                  />
                </svg>
              </span>
            </div>
          ) : null
        }
        after={(phase) => (
          // Rancho's answer: the registered line, through <FilmQuote>. On the
          // board ≥ 640; in flow under the plate below. Its attribution Meta
          // is lifted to a chalk-light grey so it stays AA on the board.
          <div
            ref={answerRef}
            className="relative mt-tier-pair [--fg-muted:#d6dcd5] sm:absolute sm:top-(--ma-t-lg) sm:left-(--ma-l-lg) sm:mt-0 sm:w-(--ma-w-lg)"
          >
            <ChalkWrite phase={phase} write={!alt} delay={1.55} duration={1.5} block>
              <p className="text-[clamp(1.125rem,0.9rem+1vw,1.5rem)] leading-[1.25] text-(--w-chalk) sm:text-[length:1.95cqw]">
                <FilmQuote id="Q-3I-3" rendition="lettered" attribution="speaker" />
              </p>
            </ChalkWrite>
            <PhraseCircle host={answerRef} phase={phase} on={circleOn} />
          </div>
        )}
      />
    </div>
  );
}
