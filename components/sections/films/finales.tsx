"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import type { CaptionWorld } from "@/lib/film";
import type { MediaId } from "@/lib/media";
import { dur, ease, easeDraw, springNeedle } from "@/lib/motion";
import type { Variant } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { JacksCompass } from "@/components/primitives/loaders/compass";
import { LINE, LINE_D, fitPath, fitPoint, measurePath, type Box } from "@/components/primitives/loaders/line";
import { FLAME_SPRITE, LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { PrintAt, walkBetween } from "@/components/worlds/hp/footprints";
import { DEAD_EYE_TARGETS, filmMark } from "@/components/sections/films/plate-marks";

/* ============================================================================
   FILMS FINALES (SPEC SM-9 "finale", bar films-chapter §3; RECOGNIZABILITY
   S12). One code motif draws over each screen's still, ONCE, after the
   frame opens — state-driven, aria-hidden, strokes and pre-rendered sprites
   only (Law 1: no DOM glow). Coordinates are PLATE space: 1000 units = the
   still's height, preserveAspectRatio "xMidYMid slice" = the still's own
   object-fit: cover, so marks stay on the plate at 2.39:1 and at the 3:2
   mobile crop.

   mode: "hidden" (armed offscreen) → "play" (entered: animate once) →
   "final" (server HTML, reduced motion / Pause, no JS, already in view: the
   finished drawing, no motion).

   DEFAULT (piece films.screens "clip-finales")
     pirates  Jack's compass (lid open) hunts on springNeedle and settles on
              the bearing of the NEXT ACT on the page (derived); a brass
              course line draws from it to the frame's edge.
     idiots   the gauntlet's gates (gauntlet.length, derived) draw on in
              chalk white (1 px board-dark halo) across the lake's sky; ONE
              chalk circle closes on the last gate.
     rdr2     DEAD EYE (M5; the still is iconic-deadeye, the frozen
              frontier in its red grade): "mark first, fire once" — an
              ember X over a dark keyline locks on each bird held mid-air,
              left → right, 160 ms apart; then all of them take their shot
              AT ONCE (an ember point opens in every X). Settled / static:
              the X's stay locked with their points (IC-RD-02; no reticle,
              no weapon, no figure).
     hp       LD-HP complete: the ink Line draws while a cool light (the
              Lumos sprite) travels it (1.4 s), then ONE warm point lights at
              the Line's start — the point Card II→III sinks into its sun.
   ALT (piece films.screens "iris-marks"; the frame irises open from the
   plate's focal mark)
     pirates  "X marks the spot": a dotted brass course inks low across the
              water to a brass X on the moon path before the Pearl's bow
              (iconic-pearl's `treasure` mark).
     idiots   one chalk circle closes around the yellow scooter, then a chalk
              tick (the idiots success mark).
     rdr2     the still (the gang's camp by the lake, iconic-camp-alt)
              becomes a clipping in a journal: a pencil border and four
              pencil photo-corners draw on (Arthur's journal grammar).
     hp       Marauder's-Map footprints walk across the enchanted paper to
              where the ink spreads from; ONE warm point lights at the walk's
              start (the same hand-off to Card II→III).
   RASTER (P3-2, spec §12.1 #8): while a finale can still draw ("hidden",
   "play") its SVG overlay is its own layer, so a drawing frame never
   repaints the photograph under it; the static ("final") finale paints
   with the still.
   ========================================================================== */

export type FinaleMode = "hidden" | "play" | "final";

/** pathLength draw-on (plus opacity, so a zero-length round cap never dots). */
function draw(mode: FinaleMode, delay: number, duration: number) {
  return {
    initial: false as const,
    animate: { pathLength: mode === "hidden" ? 0 : 1, opacity: mode === "hidden" ? 0 : 1 },
    transition:
      mode === "play"
        ? { pathLength: { duration, ease: easeDraw, delay }, opacity: { duration: 0.01, delay } }
        : { duration: 0 },
  };
}

/** A one-shot fade to `to`. */
function appear(mode: FinaleMode, delay: number, to = 1, duration: number = dur.base) {
  return {
    initial: false as const,
    animate: { opacity: mode === "hidden" ? 0 : to },
    transition: mode === "play" ? { duration, ease, delay } : { duration: 0 },
  };
}

/** The overlay's own layer while it can draw (spec §12.1 #8). */
const layerOf = (mode: FinaleMode) => (mode === "final" ? undefined : "will-change-transform");

function PlateSvg({ aspect, children, className }: { aspect: number; children: ReactNode; className?: string }) {
  const W = Math.round(1000 * aspect);
  return (
    <svg
      viewBox={`0 0 ${W} 1000`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      // clipped to the frame: nothing a finale draws may run off the plate
      // into the page (M2 critic 3 #6: the compass course ended below it)
      className={cn("pointer-events-none absolute inset-0 size-full overflow-hidden", className)}
      fill="none"
    >
      {children}
    </svg>
  );
}

export function Finale({
  world,
  variant,
  mode,
  aspect,
  stillId,
  bearing,
  gates,
}: {
  world: CaptionWorld;
  variant: Variant;
  mode: FinaleMode;
  aspect: number;
  stillId: MediaId;
  bearing: number;
  gates: number;
}) {
  const W = 1000 * aspect;
  const alt = variant === "alt";
  if (world === "rdr2" && alt) return <RdrJournalFinale mode={mode} />;
  let body: ReactNode = null;
  if (world === "pirates") body = alt ? <PiratesChart mode={mode} W={W} stillId={stillId} /> : <PiratesCompass mode={mode} W={W} bearing={bearing} />;
  else if (world === "idiots") body = alt ? <IdiotsScooter mode={mode} W={W} stillId={stillId} /> : <IdiotsGates mode={mode} W={W} gates={gates} />;
  else if (world === "rdr2") body = <RdrDeadEye mode={mode} W={W} stillId={stillId} />;
  else body = alt ? <HpMapWalk mode={mode} W={W} stillId={stillId} /> : <HpInkLight mode={mode} W={W} />;
  return (
    <PlateSvg aspect={aspect} className={cn("films-finale", layerOf(mode))}>
      {body}
    </PlateSvg>
  );
}

/* — PIRATES ———————————————————————————————————————————————————————————— */

function PiratesCompass({ mode, W, bearing }: { mode: FinaleMode; W: number; bearing: number }) {
  const size = 210;
  const cx = 0.17 * W;
  const cy = 330;
  const heading = useMotionValue(mode === "hidden" ? 0 : bearing);
  useEffect(() => {
    if (mode === "play") {
      heading.jump(0);
      // hunt, then settle — spinning the long way (target = bearing + 360)
      const c = animate(heading, bearing + 360, { type: "spring", ...springNeedle, delay: 0.5 });
      return () => c.stop();
    }
    heading.jump(mode === "final" ? bearing : 0);
  }, [mode, bearing, heading]);

  // the course: from the case's rim along the bearing to the frame's edge
  const rad = (bearing * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const sx = cx + dx * size * 0.56;
  const sy = cy + dy * size * 0.56;
  const tx = dx > 1e-6 ? (W - sx) / dx : dx < -1e-6 ? -sx / dx : Infinity;
  const ty = dy > 1e-6 ? (1000 - sy) / dy : dy < -1e-6 ? -sy / dy : Infinity;
  const t = Math.min(tx, ty);
  const ex = sx + dx * t;
  const ey = sy + dy * t;
  return (
    <g data-finale="pirates-compass">
      <motion.g {...appear(mode, 0.3)}>
        <JacksCompass heading={heading} lidOpen x={cx - size / 2} y={cy - size * 0.5283} width={size} height={size * 1.06} />
      </motion.g>
      <motion.path
        d={`M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`}
        stroke="var(--w-brass)"
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...draw(mode, 1.7, dur.draw.med)}
      />
    </g>
  );
}

function PiratesChart({ mode, W, stillId }: { mode: FinaleMode; W: number; stillId: MediaId }) {
  const f = (v: number) => v.toFixed(1);
  // the tattered-sail Pearl (iconic-pearl): the sea is only the plate's
  // bottom band in the 2.39:1 crop, so the course runs LOW across the
  // water (y ≈ .815–.85, never into the fog or the hull) and the X lands on
  // the moon path just before the bow (the fallback = iconic-pearl's mark)
  const t = filmMark(stillId, "treasure") ?? [0.39, 0.815];
  const X = { x: t[0] * W, y: t[1] * 1000 };
  const d =
    `M${f(0.02 * W)} ${f(X.y + 30)} C${f(0.1 * W)} ${f(X.y + 34)} ${f(0.18 * W)} ${f(X.y + 2)} ${f(0.26 * W)} ${f(X.y + 12)}` +
    ` C${f(0.32 * W)} ${f(X.y + 22)} ${f(X.x - 80)} ${f(X.y + 16)} ${f(X.x)} ${f(X.y)}`;
  const course = measurePath(d);
  const DOTS = 18;
  const dots = Array.from({ length: DOTS }, (_, k) => course.at(k / DOTS));
  const s = 26;
  return (
    <g data-finale="pirates-chart">
      {dots.map((q, k) => (
        <motion.circle key={k} cx={q.x} cy={q.y} r={5.5} fill="var(--w-brass)" {...appear(mode, 0.55 + k * 0.07, 0.95, 0.2)} />
      ))}
      {[`M${X.x - s} ${X.y - s} L${X.x + s} ${X.y + s}`, `M${X.x + s} ${X.y - s} L${X.x - s} ${X.y + s}`].map((p, k) => (
        <motion.path
          key={k}
          d={p}
          stroke="var(--w-brass)"
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...draw(mode, 0.55 + DOTS * 0.07 + k * 0.18, 0.28)}
        />
      ))}
    </g>
  );
}

/* — 3 IDIOTS ——————————————————————————————————————————————————————————— */

/** A chalk gate: two posts and a flush crossbar — a validation HURDLE, not
 *  a shrine gate (the overhanging lintel + tie beam + finial read as a row
 *  of torii on the sky, M2 critic 3 #6). */
function gatePath(x: number, base: number, w: number, h: number): string {
  const l = x - w / 2;
  const r = x + w / 2;
  const t = base - h;
  return `M${l} ${base} L${l} ${t} L${r} ${t} L${r} ${base}`;
}

/** A hand-drawn chalk loop that overshoots its start (Rancho's circle). */
function chalkLoop(cx: number, cy: number, rx: number, ry: number): string {
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(cx - rx * 0.2)} ${f(cy - ry)}` +
    ` C${f(cx + rx * 0.7)} ${f(cy - ry * 1.05)} ${f(cx + rx * 1.05)} ${f(cy - ry * 0.2)} ${f(cx + rx)} ${f(cy + ry * 0.25)}` +
    ` C${f(cx + rx * 0.9)} ${f(cy + ry * 0.95)} ${f(cx - rx * 0.3)} ${f(cy + ry * 1.08)} ${f(cx - rx * 0.85)} ${f(cy + ry * 0.5)}` +
    ` C${f(cx - rx * 1.15)} ${f(cy)} ${f(cx - rx * 0.8)} ${f(cy - ry * 0.95)} ${f(cx + rx * 0.15)} ${f(cy - ry * 1.02)}`
  );
}

/** Chalk over a faint board-ink shadow, so it reads on a pale sky too.
 *  `halo` = the shadow's extra width (3 = 1.5 px each side). */
function ChalkStroke({
  d,
  mode,
  delay,
  duration,
  width = 2.6,
  halo = 3,
  haloOpacity = 0.6,
  linecap = "round",
}: {
  d: string;
  mode: FinaleMode;
  delay: number;
  duration: number;
  width?: number;
  halo?: number;
  haloOpacity?: number;
  linecap?: "round" | "square";
}) {
  return (
    <>
      <motion.path d={d} stroke="var(--bp-panel)" strokeOpacity={haloOpacity} strokeWidth={width + halo} strokeLinecap={linecap} vectorEffect="non-scaling-stroke" {...draw(mode, delay, duration)} />
      <motion.path d={d} stroke="var(--w-chalk)" strokeWidth={width} strokeLinecap={linecap} vectorEffect="non-scaling-stroke" {...draw(mode, delay, duration)} />
    </>
  );
}

function IdiotsGates({ mode, W, gates }: { mode: FinaleMode; W: number; gates: number }) {
  const n = Math.max(1, gates);
  const x0 = 0.07 * W;
  const x1 = 0.56 * W;
  const base = 215;
  const gw = 50;
  const gh = 84;
  const xs = Array.from({ length: n }, (_, k) => x0 + (x1 - x0) * (n === 1 ? 0 : k / (n - 1)));
  const circleAt = 0.6 + n * 0.14 + 0.45;
  // CHALK on the sky, not board ink: dark strokes on the pale dawn read as
  // fence posts (ART-DIRECTOR #12). Chalk white with a 1 px board-dark halo
  // (width + 2) so they hold on the bright sky and on the lake alike.
  return (
    <g data-finale="idiots-gates" data-gates={n}>
      <ChalkStroke d={`M${x0 - 44} ${base} L${x1 + 44} ${base}`} mode={mode} delay={0.45} duration={dur.draw.long} width={2} halo={1} haloOpacity={0.35} linecap="square" />
      {xs.map((x, k) => (
        <g key={k} data-gate={k + 1}>
          <ChalkStroke d={gatePath(x, base, gw, gh * 0.72)} mode={mode} delay={0.6 + k * 0.14} duration={0.6} width={2.4} halo={1} haloOpacity={0.35} linecap="square" />
        </g>
      ))}
      <ChalkStroke d={chalkLoop(xs[n - 1], base - gh / 2 - 4, 66, 72)} mode={mode} delay={circleAt} duration={dur.draw.short} />
    </g>
  );
}

function IdiotsScooter({ mode, W, stillId }: { mode: FinaleMode; W: number; stillId: MediaId }) {
  const sc = filmMark(stillId, "scooter") ?? [0.76, 0.6];
  const cx = sc[0] * W;
  const cy = sc[1] * 1000;
  const rx = 0.095 * W;
  const ry = 250;
  const tick = `M${(cx + rx * 0.98).toFixed(1)} ${(cy - ry * 1.02).toFixed(1)} l20 22 l46 -60`;
  return (
    <g data-finale="idiots-scooter">
      <ChalkStroke d={chalkLoop(cx, cy, rx, ry)} mode={mode} delay={0.7} duration={dur.draw.short} width={3} />
      <ChalkStroke d={tick} mode={mode} delay={0.7 + dur.draw.short + 0.15} duration={0.3} width={3} />
    </g>
  );
}

/* — RED DEAD REDEMPTION 2 ————————————————————————————————————————————— */

/** DEFAULT: Dead Eye on the frozen frontier — the marks lock on, one bird
 *  at a time, then fire once. Plate space (1000 = the still's height);
 *  pixel strokes (non-scaling) so the X keeps its weight at 3:2 on a phone. */
function RdrDeadEye({ mode, W, stillId }: { mode: FinaleMode; W: number; stillId: MediaId }) {
  const targets = DEAD_EYE_TARGETS[stillId] ?? [];
  const f = (v: number) => v.toFixed(1);
  const R = 19; // the X's half-size: a bird is ~40 plate units across
  const t0 = 0.5;
  const step = 0.16;
  const bite = 0.09; // each stroke of an X lands in 90 ms (the egg's timing)
  const fireAt = t0 + (targets.length - 1) * step + 2 * bite + 0.4;
  return (
    <g data-finale="rdr2-deadeye" strokeLinecap="round">
      {targets.map(([bx, by], k) => {
        const x = bx * W;
        const y = by * 1000;
        const d1 = `M${f(x - R)} ${f(y - R)}L${f(x + R)} ${f(y + R)}`;
        const d2 = `M${f(x + R)} ${f(y - R)}L${f(x - R)} ${f(y + R)}`;
        const at = t0 + k * step;
        return (
          <g key={k}>
            {/* a dark keyline under the ember, so the X reads on the red sky */}
            <motion.path d={d1} stroke="#140806" strokeWidth={5.5} vectorEffect="non-scaling-stroke" {...appear(mode, at, 1, bite)} />
            <motion.path d={d2} stroke="#140806" strokeWidth={5.5} vectorEffect="non-scaling-stroke" {...appear(mode, at + bite, 1, bite)} />
            <motion.path d={d1} stroke="var(--color-ember)" strokeWidth={2.6} vectorEffect="non-scaling-stroke" {...appear(mode, at, 1, bite)} />
            <motion.path d={d2} stroke="var(--color-ember)" strokeWidth={2.6} vectorEffect="non-scaling-stroke" {...appear(mode, at + bite, 1, bite)} />
          </g>
        );
      })}
      {/* fire once: every marked target takes its shot at the same moment */}
      <motion.g {...appear(mode, fireAt, 1, 0.12)}>
        {targets.map(([bx, by], k) => (
          <circle key={k} cx={f(bx * W)} cy={f(by * 1000)} r={5.5} fill="var(--color-ember)" stroke="#140806" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        ))}
      </motion.g>
    </g>
  );
}

/** ALT: the still becomes a clipping in Arthur's journal — a pencil border
 *  and four photo-corner mounts draw on (frame space, not plate space). */
function RdrJournalFinale({ mode }: { mode: FinaleMode }) {
  const corners: { cls: string; rot: number }[] = [
    { cls: "left-1.5 top-1.5", rot: 0 },
    { cls: "right-1.5 top-1.5", rot: 90 },
    { cls: "bottom-1.5 right-1.5", rot: 180 },
    { cls: "bottom-1.5 left-1.5", rot: 270 },
  ];
  return (
    <div aria-hidden="true" className={cn("films-finale pointer-events-none absolute inset-0", layerOf(mode))} data-finale="rdr2-journal">
      <div className="absolute inset-3 sm:inset-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" className="size-full overflow-visible" fill="none">
          <motion.path
            d="M0.3 0.6 L99.6 0.2 L99.8 99.5 L0.2 99.7 Z"
            stroke="var(--w-pencil)"
            strokeWidth={1.2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            {...draw(mode, 0.55, dur.draw.long)}
          />
        </svg>
      </div>
      {corners.map((c, k) => (
        <svg
          key={k}
          viewBox="0 0 40 40"
          focusable="false"
          className={cn("absolute size-8 overflow-visible sm:size-11", c.cls)}
          style={{ rotate: `${c.rot}deg` }}
          fill="none"
        >
          <motion.path
            d="M1 1 L39 1 L1 39 Z M7 1 L1 7 M14 1 L1 14 M21 1 L1 21 M28 1 L1 28"
            stroke="var(--w-bone)"
            strokeOpacity={0.9}
            strokeWidth={1.2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            {...draw(mode, 0.55 + dur.draw.long * 0.6 + k * 0.14, 0.45)}
          />
        </svg>
      ))}
    </div>
  );
}

/* — HARRY POTTER ———————————————————————————————————————————————————————— */

function HpInkLight({ mode, W }: { mode: FinaleMode; W: number }) {
  // the dark forest, lower left, clear of the viaduct (inside the 2.39:1
  // crop of the 16:9 plate: visible y ≈ .13–.87)
  const bw = 0.22 * W;
  const box: Box = { x: 0.035 * W, y: 640, w: bw, h: bw * 0.4 };
  const d = fitPath(LINE_D, box);
  const start = fitPoint(LINE.at(0), box);
  const p = useMotionValue(mode === "hidden" ? 0 : 1);
  useEffect(() => {
    if (mode === "play") {
      p.jump(0);
      const c = animate(p, 1, { duration: 1.4, ease: easeDraw, delay: 0.55 });
      return () => c.stop();
    }
    p.jump(mode === "final" ? 1 : 0);
  }, [mode, p]);
  const L = 48;
  const lx = useTransform(p, (v) => fitPoint(LINE.at(v), box).x - L / 2);
  const ly = useTransform(p, (v) => fitPoint(LINE.at(v), box).y - L / 2);
  const lightOpacity = useTransform(p, [0, 0.03, 0.88, 1], [0, 1, 1, 0]);
  const warmAt = 0.55 + 1.4;
  return (
    <g data-finale="hp-ink-light" strokeLinecap="round">
      {/* the ink Line is drawn by the light and then SINKS back into the
          page — at rest only the warm point stays (a gold line left lying on
          the forest read as a stray squiggle, M2 critic 3 #6) */}
      <motion.g
        initial={false}
        animate={{ opacity: mode === "play" ? [1, 1, 0] : 0 }}
        transition={mode === "play" ? { duration: warmAt + 0.9, times: [0, 0.75, 1] } : { duration: 0 }}
      >
        <motion.path d={d} stroke="var(--w-ink-contour)" strokeOpacity={0.35} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        <motion.path d={d} stroke="var(--w-ink-contour)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" style={{ pathLength: p }} />
      </motion.g>
      <motion.g style={{ x: lx, y: ly, opacity: lightOpacity }}>
        <image href={LUMOS_SPRITE} width={L} height={L} />
      </motion.g>
      {/* the one warm point, at the Line's start: Card II→III's low sun takes it */}
      <motion.g data-warm-point="" {...appear(mode, warmAt, 1, dur.reveal)}>
        <image href={FLAME_SPRITE} x={start.x - 30} y={start.y - 30} width={60} height={60} />
      </motion.g>
    </g>
  );
}

function HpMapWalk({ mode, W, stillId }: { mode: FinaleMode; W: number; stillId: MediaId }) {
  const ink = filmMark(stillId, "ink") ?? [0.765, 0.64];
  // on the paper (the dim, candle-lit sheet: luminance ~55–100 / 255)
  const a = { x: 0.5 * W, y: 718 };
  const b = { x: (ink[0] - 0.05) * W, y: ink[1] * 1000 + 8 };
  const N = 8;
  const steps = walkBetween(a, b, N, 14);
  const warm = { x: 0.42 * W, y: 690 }; // on the dark desk, left of the sheet
  const walkEnd = 0.6 + N * 0.18;
  return (
    <g data-finale="hp-map-walk">
      {steps.map((s, k) => {
        const lead = k >= N - 2;
        return (
          <motion.g
            key={k}
            initial={false}
            animate={{ opacity: mode === "hidden" ? 0 : lead ? 1 : mode === "play" ? [0, 1, 0.4] : 0.4 }}
            transition={
              mode === "play"
                ? { duration: lead ? dur.base : 0.9, delay: 0.6 + k * 0.18, times: lead ? undefined : [0, 0.2, 1] }
                : { duration: 0 }
            }
          >
            {/* gold ink: dark ink would vanish on the dim sheet (≈ 2 : 1) */}
            <PrintAt x={s.x} y={s.y} deg={s.deg} w={30} side={s.side} fill="var(--w-ink-contour)" />
          </motion.g>
        );
      })}
      <motion.g data-warm-point="" {...appear(mode, walkEnd, 1, dur.reveal)}>
        <image href={FLAME_SPRITE} x={warm.x - 30} y={warm.y - 30} width={60} height={60} />
      </motion.g>
    </g>
  );
}
