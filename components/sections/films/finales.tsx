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
import { EMBER_SPRITE, FIRE0_SPRITE, FIRE1_SPRITE, FIRE2_SPRITE } from "@/components/primitives/loaders/sprites-rd";
import { PrintAt, walkBetween } from "@/components/worlds/hp/footprints";
import { filmMark } from "@/components/sections/films/plate-marks";

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
     idiots   the gauntlet's gates (gauntlet.length, derived) draw on as a
              blueprint across the lake's sky; ONE chalk circle closes on
              the last gate.
     rdr2     a graphite trail crosses the hill's hachures to a campfire
              point that kindles (3 fire frames + 2 embers: 5 sprites).
     hp       LD-HP complete: the ink Line draws while a cool light (the
              Lumos sprite) travels it (1.4 s), then ONE warm point lights at
              the Line's start — the point Card II→III sinks into its sun.
   ALT (piece films.screens "iris-marks"; the frame irises open from the
   plate's focal mark)
     pirates  "X marks the spot": a dotted brass course inks across the water
              to a brass X before the Pearl's bow.
     idiots   one chalk circle closes around the yellow scooter, then a chalk
              tick (the idiots success mark).
     rdr2     the still becomes a clipping in a journal: a pencil border and
              four pencil photo-corners draw on (Arthur's journal grammar).
     hp       Marauder's-Map footprints walk across the enchanted paper to
              where the ink spreads from; ONE warm point lights at the walk's
              start (the same hand-off to Card II→III).
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

function PlateSvg({ aspect, children, className }: { aspect: number; children: ReactNode; className?: string }) {
  const W = Math.round(1000 * aspect);
  return (
    <svg
      viewBox={`0 0 ${W} 1000`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none absolute inset-0 size-full overflow-visible", className)}
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
  else if (world === "rdr2") body = <RdrTrail mode={mode} W={W} />;
  else body = alt ? <HpMapWalk mode={mode} W={W} stillId={stillId} /> : <HpInkLight mode={mode} W={W} />;
  return (
    <PlateSvg aspect={aspect} className="films-finale">
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
  const lantern = filmMark(stillId, "lantern") ?? [0.836, 0.556];
  const X = { x: (lantern[0] - 0.29) * W, y: 760 };
  const d = `M${(0.02 * W).toFixed(1)} 905 C${(0.12 * W).toFixed(1)} 870 ${(0.2 * W).toFixed(1)} 720 ${(0.3 * W).toFixed(1)} 745 C${(0.38 * W).toFixed(1)} 765 ${(X.x - 90).toFixed(1)} 800 ${X.x.toFixed(1)} ${X.y}`;
  const course = measurePath(d);
  const DOTS = 18;
  const dots = Array.from({ length: DOTS }, (_, k) => course.at(k / DOTS));
  const s = 26;
  return (
    <g data-finale="pirates-chart">
      {dots.map((q, k) => (
        <motion.circle key={k} cx={q.x} cy={q.y} r={4.5} fill="var(--w-brass)" {...appear(mode, 0.55 + k * 0.07, 0.95, 0.2)} />
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

/** A blueprint gate: two posts, an overhanging lintel, a tie beam, a finial. */
function gatePath(x: number, base: number, w: number, h: number): string {
  const l = x - w / 2;
  const r = x + w / 2;
  const t = base - h;
  return `M${l} ${base} L${l} ${t} M${r} ${base} L${r} ${t} M${l - 8} ${t} L${r + 8} ${t} M${l} ${t + 16} L${r} ${t + 16} M${x} ${t} L${x} ${t - 12}`;
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

/** Chalk over a faint board-ink shadow, so it reads on a pale sky too. */
function ChalkStroke({ d, mode, delay, duration, width = 2.6 }: { d: string; mode: FinaleMode; delay: number; duration: number; width?: number }) {
  return (
    <>
      <motion.path d={d} stroke="var(--bp-panel)" strokeOpacity={0.6} strokeWidth={width + 3} strokeLinecap="round" vectorEffect="non-scaling-stroke" {...draw(mode, delay, duration)} />
      <motion.path d={d} stroke="var(--w-chalk)" strokeWidth={width} strokeLinecap="round" vectorEffect="non-scaling-stroke" {...draw(mode, delay, duration)} />
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
  const ink = "var(--bp-panel)";
  const circleAt = 0.6 + n * 0.14 + 0.45;
  return (
    <g data-finale="idiots-gates" data-gates={n} strokeLinecap="square">
      <motion.path
        d={`M${x0 - 44} ${base} L${x1 + 44} ${base}`}
        stroke={ink}
        strokeOpacity={0.7}
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
        {...draw(mode, 0.45, dur.draw.long)}
      />
      {xs.map((x, k) => (
        <motion.path
          key={k}
          d={gatePath(x, base, gw, gh)}
          stroke={ink}
          strokeOpacity={0.92}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          data-gate={k + 1}
          {...draw(mode, 0.6 + k * 0.14, 0.6)}
        />
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

function RdrTrail({ mode, W }: { mode: FinaleMode; W: number }) {
  const fire = { x: 0.41 * W, y: 712 };
  const trail =
    `M${(0.02 * W).toFixed(1)} 945 C${(0.1 * W).toFixed(1)} 910 ${(0.16 * W).toFixed(1)} 865 ${(0.23 * W).toFixed(1)} 835` +
    ` C${(0.3 * W).toFixed(1)} 805 ${(0.35 * W).toFixed(1)} 770 ${(fire.x - 14).toFixed(1)} ${fire.y + 40}`;
  // the hill's brow falls from ~0.6 (left) to ~0.48 (right) of the height
  const hachures = [0.07, 0.15, 0.23, 0.31, 0.5, 0.58].map((f) => {
    const x = f * W;
    const y = 605 - f * 150 + 34;
    return `M${(x - 28).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y - 13).toFixed(1)} ${(x + 28).toFixed(1)} ${y.toFixed(1)}`;
  });
  const t0 = 0.45 + dur.draw.med + 0.1;
  const fw = 46;
  const fh = 69;
  const frames = [FIRE0_SPRITE, FIRE1_SPRITE, FIRE2_SPRITE];
  return (
    <g data-finale="rdr2-trail" strokeLinecap="round">
      {hachures.map((d, k) => (
        <motion.path key={k} d={d} stroke="var(--w-pencil)" strokeOpacity={0.8} strokeWidth={1.2} vectorEffect="non-scaling-stroke" {...draw(mode, 0.3 + k * 0.08, 0.35)} />
      ))}
      <motion.path d={trail} stroke="var(--w-pencil)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" {...draw(mode, 0.45, dur.draw.med)} />
      {/* the kindle: three flame frames, once, settling on the last */}
      {frames.map((src, k) => {
        const last = k === frames.length - 1;
        return (
          <motion.g
            key={k}
            initial={false}
            animate={{ opacity: mode === "hidden" ? 0 : last ? 1 : mode === "play" ? [0, 1, 0] : 0 }}
            transition={
              mode === "play"
                ? last
                  ? { duration: 0.12, delay: t0 + k * 0.16 }
                  : { duration: 0.34, times: [0, 0.35, 1], delay: t0 + k * 0.16 }
                : { duration: 0 }
            }
          >
            <image href={src} x={fire.x - fw / 2} y={fire.y - fh + 8} width={fw} height={fh} />
          </motion.g>
        );
      })}
      {[0, 1].map((k) => (
        <motion.g
          key={`e${k}`}
          initial={false}
          animate={mode === "play" ? { opacity: [0, 1, 0], y: [0, -40 - k * 22] } : { opacity: 0, y: 0 }}
          transition={mode === "play" ? { duration: 1.3, delay: t0 + 0.3 + k * 0.25, ease } : { duration: 0 }}
        >
          <image href={EMBER_SPRITE} x={fire.x - 10 + (k ? 14 : -10)} y={fire.y - fh} width={20} height={20} />
        </motion.g>
      ))}
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
    <div aria-hidden="true" className="films-finale pointer-events-none absolute inset-0" data-finale="rdr2-journal">
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
      <motion.path d={d} stroke="var(--w-ink-contour)" strokeOpacity={0.35} strokeWidth={1.2} vectorEffect="non-scaling-stroke" {...appear(mode, 0.4)} />
      <motion.path d={d} stroke="var(--w-ink-contour)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" style={{ pathLength: p }} />
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
