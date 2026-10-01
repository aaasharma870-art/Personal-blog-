"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { useReducedMotion } from "@/lib/flags";
import { resolveVariant, type MediaId } from "@/lib/media";
import { dur, ease, easeDraw } from "@/lib/motion";
import type { Variant } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { maskIntersect } from "@/components/primitives/mask-style";
import { MediaFrame } from "@/components/primitives/media-frame";
import { ChalkFilter, ChalkLoop, ChalkQuadcopter, SettleFrame, useSvgId } from "@/components/worlds/idiots/chalk";

/* ============================================================================
   THE GAUNTLET ON THE DAWN BOARD (SPEC v2 SM-6, noise-order-seam.BAR §3B,
   RECOGNIZABILITY S08). The MV-06 plate IS the board: the ICE chalkboard
   under stone colonnade windows at first light. Over its even, dark left
   60 % (measured: mean rgb 13/22/19, p95 L .014 — the idiots canvas, so
   every Act II ink passes on it) sit, in chalk:
     - the board header (Q-3I-2, lettered in Kalam chalk, one underline),
     - the real gates (count = content.ts `gauntlet.length`), where the
       chosen gate DERIVES and is the viewport's one aqua mark,
     - the illustrative Run: seeded hypotheses through the gates,
     - the tally (HTML) with Rancho's circle once a Run settles, and
       SYNTHETIC • ILLUSTRATIVE inside the same <figure>,
     - the quadcopter doodle (IC-3I-08), which lifts only on a Run that
       cleared every gate,
     - the caption THE ICE CHALKBOARD • 3 IDIOTS UNDER the board (M2 finish:
       no scrim over the board, its frame or the ledge; the board's black is
       lifted to slate green and carries a half-erased ghost of chalk).
   Two choreographies (lib/variants.ts `work.board`):
     default "rail-run"      the board settles in two soft pats (aalIzzWell);
                             dots run a chalk rail through gate frames and
                             the ones that fail stop at their gate.
     alt     "marking-sheet" a duster wipes the board on; the gates are the
                             columns of a chalk marking sheet and the Run
                             ticks each hypothesis gate by gate, crossing
                             out and striking through the ones that fail.
   Honesty (HO2–HO4): the Run is labelled illustrative everywhere, its dot
   counts never equal a content.ts count, and gate 2 is the plurality
   killer ("This gate killed most ideas"). Deterministic (N19).
   RASTER (P3-2, spec §12.1 #8): what the Run moves or draws (the dots, the
   ticks and strikes) lies on its own promoted SVG over the static chalk
   figure, so a Run step never redraws the plate, its slate lift or the
   chalk filter under it; the board frame moves only as a promoted layer
   (SettleFrame) and the quadcopter lifts its own wrapper.
   ========================================================================== */

/** Seeded, fixed run data: where each illustrative hypothesis stops (a gate
 *  index), or ≥ the gate count = cleared every gate. 12 hypotheses; 4 stop
 *  at gate 2 (the plurality), 2 clear all 7. No count here equals a
 *  content.ts figure (3, 5, 6, 9, 15, 470, 3,000+). */
const STOP_AT: readonly number[] = [1, 99, 1, 0, 2, 1, 3, 1, 4, 2, 5, 99];
export const RUN_HYPOTHESES = STOP_AT.length;

export type RunPhase = "idle" | "anticipate" | "running" | "settled";
export type RunState = { phase: RunPhase; step: number; runs: number };

/** Cleared-all count for `gates` gates. */
export function clearedOf(gates: number): number {
  return STOP_AT.filter((s) => s >= gates).length;
}

/**
 * useGauntletRun — the Run's clock (D3): anticipate on dur.micro, then one
 * step per gate at dur.base, then one more step to the finish. Timers only
 * while a run is live (0 work at rest; N20). `settle()` shows the settled
 * frame without a run (reduced motion).
 */
export function useGauntletRun(gates: number) {
  const [state, setState] = useState<RunState>({ phase: "idle", step: -1, runs: 0 });
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setState((s) => ({ phase: "anticipate", step: -1, runs: s.runs }));
    const tick = (step: number) => {
      if (step > gates) {
        setState((s) => ({ phase: "settled", step: gates, runs: s.runs + 1 }));
        timer.current = null;
        return;
      }
      setState((s) => ({ ...s, phase: "running", step }));
      timer.current = window.setTimeout(() => tick(step + 1), dur.base * 1000);
    };
    timer.current = window.setTimeout(() => tick(0), dur.micro * 1000);
  }, [gates]);

  return { state, start };
}

/* — the board dressing (M2 finish, BLIND-1 D25) ————————————————————— */
/** The board interior on MV-06 (both crops): left of the beam (fades 60 → 80 %
 *  of the frame's width) and above the chalk ledge (fades 86 → 93 %). */
const BOARD_MASK = maskIntersect(
  "linear-gradient(to right, #000 0 60%, transparent 80%)",
  "linear-gradient(to bottom, #000 0 86%, transparent 93%)",
);
/** Half-erased chalk: two eraser swipes and a smudge, ≤ 7 % chalk. */
const BOARD_GHOST = [
  "radial-gradient(ellipse 24% 4.5% at 26% 85%, rgb(242 239 230 / 0.07), transparent 72%)",
  "radial-gradient(ellipse 14% 3.5% at 47% 88%, rgb(242 239 230 / 0.05), transparent 72%)",
  "radial-gradient(ellipse 11% 13% at 67% 66%, rgb(242 239 230 / 0.05), transparent 70%)",
].join(", ");

/* — geometry (viewBox units) ———————————————————————————————————————— */
const VB = { w: 600, h: 190 };

/** DEFAULT: gate centres along the rail; lanes for the hypotheses. */
function railGeometry(gates: number) {
  const x0 = 104;
  const x1 = 500;
  const gx = (g: number) => (gates <= 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * g) / (gates - 1));
  const laneY = (i: number) => 64 + i * ((162 - 64) / Math.max(1, RUN_HYPOTHESES - 1));
  return { gx, laneY, startX: 28, pullX: 22, finishX: 562, railY: 176, topY: 50 };
}

/** ALT: the marking sheet's column centres and row lines. */
function sheetGeometry(gates: number) {
  const left = 96;
  const right = 588;
  const cw = (right - left) / gates;
  const cx = (g: number) => left + cw * (g + 0.5);
  const rowY = (i: number) => 44 + i * ((178 - 44) / Math.max(1, RUN_HYPOTHESES - 1));
  return { left, right, cw, cx, rowY, headY: 24 };
}

/** Where dot i sits at run step `step` (DEFAULT). */
function dotX(i: number, step: number, phase: RunPhase, g: ReturnType<typeof railGeometry>, gates: number) {
  const stop = Math.min(STOP_AT[i] ?? 0, gates);
  if (phase === "idle") return g.startX;
  if (phase === "anticipate") return g.pullX;
  if (step < 0) return g.startX;
  if (stop >= gates && step >= gates) return g.finishX;
  const at = Math.min(step, stop, gates - 1);
  return g.gx(at) - 22;
}

type DotLook = "live" | "stopping" | "stopped" | "cleared";
function dotLook(i: number, step: number, phase: RunPhase, gates: number): DotLook {
  const stop = Math.min(STOP_AT[i] ?? 0, gates);
  if (phase === "idle" || phase === "anticipate") return "live";
  if (stop >= gates) return step >= gates ? "cleared" : "live";
  if (step < stop) return "live";
  if (step === stop && phase === "running") return "stopping";
  return "stopped";
}

/* — the diagrams ——————————————————————————————————————————————————— */

function GateStroke({
  d,
  active,
  derive,
  delay,
  opacity,
}: {
  d: string;
  active: boolean;
  derive: boolean;
  delay: number;
  opacity: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      className={active ? "stroke-accent" : "stroke-(--w-chalk)"}
      strokeOpacity={opacity}
      strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round"
      initial={derive ? { pathLength: 0 } : false}
      animate={{ pathLength: 1 }}
      transition={derive ? { duration: dur.draw.short * 0.55, ease: easeDraw, delay } : { duration: 0 }}
    />
  );
}

function RailRun({
  gates,
  active,
  derive,
  run,
  reduced,
}: {
  gates: number;
  active: number;
  derive: boolean;
  run: RunState;
  reduced: boolean;
}) {
  const fid = useSvgId("gate-chalk");
  const g = railGeometry(gates);
  const moveT = run.phase === "anticipate" ? dur.micro : dur.base;
  return (
    <>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true" focusable="false" className="h-auto w-full overflow-visible" data-figure="gates" data-choreo="rail-run">
        <defs>
          <ChalkFilter id={fid} />
        </defs>
        <g filter={`url(#${fid})`} strokeLinecap="round">
          {/* the rail, the start line and the finish */}
          <path d={`M8 ${g.railY} L${VB.w - 8} ${g.railY}`} fill="none" className="stroke-(--w-chalk)" strokeOpacity={0.55} strokeWidth={2} />
          <path d={`M${g.startX + 10} ${g.topY + 8} L${g.startX + 10} ${g.railY}`} fill="none" className="stroke-(--w-chalk)" strokeOpacity={0.4} strokeWidth={1.6} strokeDasharray="4 6" />
          <path
            d={`M${g.finishX + 12} ${g.topY} L${g.finishX + 12} ${g.railY} M${g.finishX + 18} ${g.topY} L${g.finishX + 18} ${g.railY}`}
            fill="none"
            className="stroke-(--w-chalk)"
            strokeOpacity={0.55}
            strokeWidth={1.8}
          />
          {/* the gates: posts + lintel; the chosen one derives (post, post, lintel) */}
          {Array.from({ length: gates }, (_, i) => {
            const x = g.gx(i);
            const isActive = i === active;
            const op = isActive ? 1 : i < active ? 0.9 : 0.38;
            const d0 = isActive && derive;
            return (
              <g key={isActive ? `a-${active}-${i}` : `g-${i}`}>
                <GateStroke d={`M${x - 14} ${g.railY} L${x - 14} ${g.topY}`} active={isActive} derive={d0} delay={0} opacity={op} />
                <GateStroke d={`M${x + 14} ${g.railY} L${x + 14} ${g.topY}`} active={isActive} derive={d0} delay={0.3} opacity={op} />
                <GateStroke d={`M${x - 22} ${g.topY} L${x + 22} ${g.topY}`} active={isActive} derive={d0} delay={0.6} opacity={op} />
              </g>
            );
          })}
        </g>
      </svg>
      {/* the hypotheses (not filtered: dots stay round), on their own layer
          over the chalk: a Run step moves only this layer's dots */}
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        aria-hidden="true"
        focusable="false"
        // top-aligned: registers with the chalk SVG above whatever line gap
        // its host's box adds under it
        preserveAspectRatio="xMidYMin meet"
        className="pointer-events-none absolute inset-0 size-full overflow-visible will-change-transform"
        data-figure="run"
      >
        {Array.from({ length: RUN_HYPOTHESES }, (_, i) => {
          const look = dotLook(i, run.step, run.phase, gates);
          const x = dotX(i, run.step, run.phase, g, gates);
          return (
            <motion.circle
              key={i}
              cy={g.laneY(i)}
              r={3.2}
              initial={false}
              animate={{ cx: x }}
              transition={reduced ? { duration: 0 } : { duration: moveT, ease }}
              className={cn(
                "transition-[fill,stroke] duration-(--dur-micro)",
                look === "stopping" && "fill-kill stroke-kill",
                look === "stopped" && "fill-transparent stroke-fg-ghost",
                look === "cleared" && "fill-fg stroke-fg",
                look === "live" && "fill-(--w-chalk) stroke-(--w-chalk)",
              )}
              strokeWidth={1.4}
            />
          );
        })}
      </svg>
    </>
  );
}

function MarkingSheet({
  gates,
  active,
  derive,
  run,
  reduced,
}: {
  gates: number;
  active: number;
  derive: boolean;
  run: RunState;
  reduced: boolean;
}) {
  const fid = useSvgId("sheet-chalk");
  const mid = useSvgId("sheet-marks");
  const s = sheetGeometry(gates);
  const showMarks = run.phase === "running" || run.phase === "settled";
  const t = (delay = 0) => (reduced ? { duration: 0 } : { duration: dur.base * 0.8, ease: easeDraw, delay });
  return (
    <>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true" focusable="false" className="h-auto w-full overflow-visible" data-figure="gates" data-choreo="marking-sheet">
        <defs>
          <ChalkFilter id={fid} />
        </defs>
        <g filter={`url(#${fid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* the ruled sheet: head rule, column rules, a name stub per row */}
          <path d={`M12 ${s.headY + 8} L${s.right} ${s.headY + 8}`} className="stroke-(--w-chalk)" strokeOpacity={0.6} strokeWidth={2} />
          {Array.from({ length: gates + 1 }, (_, g) => (
            <path key={`c${g}`} d={`M${s.left + s.cw * g} ${s.headY - 10} L${s.left + s.cw * g} ${s.rowY(RUN_HYPOTHESES - 1) + 10}`} className="stroke-(--w-chalk)" strokeOpacity={0.28} strokeWidth={1.4} />
          ))}
          {Array.from({ length: RUN_HYPOTHESES }, (_, i) => (
            <path key={`n${i}`} d={`M20 ${s.rowY(i)} l${34 + ((i * 7) % 18)} ${((i % 3) - 1) * 0.8}`} className="stroke-(--w-chalk)" strokeOpacity={0.55} strokeWidth={1.6} />
          ))}
          {/* the chosen gate's column: framed in aqua, drawn on selection */}
          <motion.rect
            key={`col-${active}`}
            x={s.cx(active) - s.cw / 2 + 4}
            y={s.headY - 14}
            width={s.cw - 8}
            height={s.rowY(RUN_HYPOTHESES - 1) - s.headY + 28}
            rx={6}
            className="stroke-accent"
            strokeWidth={2.2}
            initial={derive ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={derive ? { duration: dur.draw.short, ease: easeDraw } : { duration: 0 }}
          />
        </g>
      </svg>
      {/* the Run's marks, in the same chalk, on their own layer over the
          sheet: a mark drawing on redraws only this layer */}
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        aria-hidden="true"
        focusable="false"
        // top-aligned: registers with the chalk SVG above whatever line gap
        // its host's box adds under it
        preserveAspectRatio="xMidYMin meet"
        className="pointer-events-none absolute inset-0 size-full overflow-visible will-change-transform"
        data-figure="run"
      >
        <defs>
          <ChalkFilter id={mid} />
        </defs>
        <g filter={`url(#${mid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {showMarks
            ? Array.from({ length: RUN_HYPOTHESES }, (_, i) => {
                const stop = Math.min(STOP_AT[i] ?? 0, gates);
                const y = s.rowY(i);
                const marks: ReactNode[] = [];
                for (let c = 0; c < gates; c++) {
                  if (c > run.step || c > stop) break;
                  const x = s.cx(c);
                  if (c < stop) {
                    marks.push(
                      <motion.path
                        key={`t${i}-${c}`}
                        d={`M${x - 5} ${y} L${x - 1.2} ${y + 4} L${x + 6} ${y - 5}`}
                        className="stroke-(--w-chalk)"
                        strokeWidth={1.8}
                        initial={reduced || run.phase === "settled" ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={t()}
                      />,
                    );
                  } else {
                    const stopping = run.phase === "running" && run.step === c;
                    marks.push(
                      <motion.path
                        key={`x${i}-${c}`}
                        d={`M${x - 5} ${y - 4.5} L${x + 5} ${y + 4.5} M${x + 5} ${y - 4.5} L${x - 5} ${y + 4.5}`}
                        className={cn("transition-[stroke] duration-(--dur-micro)", stopping ? "stroke-kill" : "stroke-fg-ghost")}
                        strokeWidth={2}
                        initial={reduced || run.phase === "settled" ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={t()}
                      />,
                      <motion.path
                        key={`s${i}-${c}`}
                        d={`M${x + 12} ${y} L${s.right - 6} ${y}`}
                        className="stroke-fg-ghost"
                        strokeOpacity={0.7}
                        strokeWidth={1.4}
                        initial={reduced || run.phase === "settled" ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={t(dur.base * 0.4)}
                      />,
                    );
                  }
                }
                return <g key={`row-${i}`}>{marks}</g>;
              })
            : null}
        </g>
      </svg>
    </>
  );
}

/* — the board ————————————————————————————————————————————————————————— */

export function GauntletBoard({
  board,
  gates,
  active,
  derive,
  run,
  variant,
  header,
  caption,
  labelId,
  tallyText,
  quadcopter = true,
  className,
}: {
  board: MediaId;
  gates: number;
  active: number;
  derive: boolean;
  run: RunState;
  variant: Variant;
  /** The board header: the lettered Q-3I-2 (server-rendered FilmQuote). */
  header?: ReactNode;
  /** The scene caption (server-rendered SceneCaption, place "under"). */
  caption?: ReactNode;
  /** id of the SYNTHETIC • ILLUSTRATIVE label (the Run's description). */
  labelId: string;
  tallyText: string;
  quadcopter?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  // the ALT plays MV-06-alt only once Aryan accepts it (status "received"
  // today, so resolveVariant falls back to the DEFAULT board)
  const plate = resolveVariant(board, variant)?.id ?? board;
  const alt = variant === "alt";
  const lifted = run.phase === "settled" && clearedOf(gates) > 0 && run.runs > 0 ? run.runs : 0;
  const choreo = alt ? "marking-sheet" : "rail-run";

  return (
    <figure className={cn("scene-caption-host", className)} data-board={plate} data-choreo={choreo} {...beatAttrs("B17", { weight: 2 })}>
      {/* the caption sits UNDER the board (M2 finish, BLIND-1 D25): no scrim
          darkens the board, its wooden frame or the chalk ledge */}
      <SettleFrame entrance={alt ? "wipe" : "settle"} className="relative sm:overflow-hidden sm:rounded-frame">
        {/* the plate: 1:1 below 640 (the board's dark left side stays in
            frame), 16:9 above */}
        <div className="relative aspect-square overflow-hidden rounded-frame sm:aspect-video sm:rounded-none">
          <MediaFrame media={plate} layout="fill" sizes="(min-width: 64rem) 60vw, 100vw" />
          {/* the board reads as the ICE chalkboard at a glance (D25): its
              near-black interior (mean rgb 12/22/18) is lifted to slate green
              by a screen blend, masked to the board left of the beam and
              above the chalk ledge (worst board pixel after the lift: L .042,
              so --fg-muted stays ≥ 4.99:1 and chalk ≥ 9:1) … */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{ backgroundColor: "rgb(14 38 29)", ...BOARD_MASK }}
          />
          {/* … with the ghost of yesterday's lesson half-erased on it (kept
              off the label zones: under the tally and in the open right) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: BOARD_GHOST }} />

        {/* the chalk layer over the board's even, dark left side */}
        {/* (< 640 it ends at 86 %: the labels stay on the board, above the
            bright chalk ledge, so they keep their contrast) */}
        <div className="absolute left-[4%] top-[4%] flex h-[82%] w-[66%] flex-col sm:left-[3.5%] sm:top-[5%] sm:h-[73%] sm:w-[55%]">
          {header ? <div className="shrink-0">{header}</div> : null}
          <div className="relative mt-[3%] flex min-h-0 flex-1 items-center">
            <div className="relative w-full">
              {alt ? (
                <MarkingSheet gates={gates} active={active} derive={derive} run={run} reduced={reduced} />
              ) : (
                <RailRun gates={gates} active={active} derive={derive} run={run} reduced={reduced} />
              )}
              {/* gate ordinals (HTML, never SVG text), aria-hidden: the
                  tablist carries the meaning */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {Array.from({ length: gates }, (_, i) => {
                  const cx = alt ? sheetGeometry(gates).cx(i) : railGeometry(gates).gx(i);
                  // above the column head (ALT) or above each gate's lintel
                  const top = alt ? ((sheetGeometry(gates).headY - 2) / VB.h) * 100 : ((railGeometry(gates).topY - 6) / VB.h) * 100;
                  return (
                    <span
                      key={i}
                      className={cn(
                        "tnum absolute -translate-x-1/2 -translate-y-full type-meta leading-none",
                        i === active ? "text-fg" : "text-fg-muted",
                      )}
                      style={{ left: `${(cx / VB.w) * 100}%`, top: `${top}%` }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          {/* the tally (HTML) and the label, inside the same figure */}
          <div className="mt-[3%] shrink-0">
            <p className="type-small text-fg">
              <ChalkLoop on={run.phase === "settled"}>
                <span className="tnum">{tallyText}</span>
              </ChalkLoop>
            </p>
            <p id={labelId} className="mt-2 type-meta text-fg-muted">
              Synthetic<span aria-hidden="true" className="text-fg-muted">{" • "}</span>
              <span className="sr-only">, </span>illustrative
            </p>
          </div>
        </div>

        {/* IC-3I-08: the quadcopter doodle on the open board, right of the
            chalk (M2 finish: ≥ 14 % of the board's width, D25); unlabelled,
            it lifts 8 px only on a Run that clears every gate */}
        {quadcopter ? (
          <ChalkQuadcopter
            liftKey={lifted}
            className="pointer-events-none absolute left-[73%] top-[57%] w-[22%] sm:left-[60%] sm:top-[19%] sm:w-[14.5%]"
          />
        ) : null}
        </div>
      </SettleFrame>
      {caption}
    </figure>
  );
}
