"use client";

import { useId, useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, useSvgAttr } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, fitPath, fitPoint, remap } from "@/components/primitives/loaders/line";
import { SUN_SPRITE } from "@/components/primitives/loaders/sprites-rd";
import { useCard } from "@/components/sections/act-card/card-context";
import { FrontierGround, SUN, TINTYPE } from "@/components/sections/act-card/frames/tintype";

/**
 * Card II→III, ALT choreography "dead-eye" (lib/variants.ts
 * `card-tintype.choreo` alt; SM-14, rdr2-act.BAR §A; IC-RD-02 at card
 * scale: "the marks lock along the Line"). The DEFAULT develops the plate;
 * this one uses RDR2's other signature — Dead Eye, which is "mark first,
 * fire once" (RD-P2), the site's own method: pre-registration marks the
 * targets, the blind holdout is the one shot. Driven by the card's passage
 * p (no pin, 0 travel); everything is a pure function of p and reverses
 * exactly by position.
 *   0–.25    the frontier plate is already there, a tintype under a low sun;
 *            the Line is drawn across it in graphite (pathLength =
 *            remap(p, 0, .25)), and a bone tick rises at each of the four
 *            act points as the Line reaches it.
 *   .22–.32  Dead Eye engages: the plate takes the sepia-red grade and a red
 *            vignette (--w-deadeye, MEDIA ONLY — a layer inside the plate,
 *            never text, never the marks).
 *   .34–.78  the marks lock on, one act at a time (I → IV, .12 apart), each
 *            a two-stroke BONE X drawn onto its act point.
 *   .86–.92  fire once: all four marks resolve AT ONCE into bone points,
 *            the grade lifts, and the plate's bone border draws (.86–1).
 * The X is bone, never ember (ember = killed: these acts are marked, not
 * killed) and never the Dead Eye red (DESIGN §1.3.3). No reticle, no
 * weapon, no gunshot (ICONS IC-RD-02). The progress element is the lower
 * bar's pencil line: no "loading", no %, no status. Static card (RM,
 * Pause, no JS, < 640, SSR): the plate in its tintype, the Line drawn, the
 * four points resolved, the border drawn — 0 grade. aria-hidden art.
 */

const { VB, PLATE, TRAIL_BOX } = TINTYPE;
const TRAIL = fitPath(LINE_D, TRAIL_BOX);
const HACHURES = Array.from({ length: 6 }, (_, k) => {
  const q = fitPoint(LINE.at((k + 0.55) / 6.3), TRAIL_BOX);
  return `M${(q.x - 26).toFixed(1)} ${(q.y + 20).toFixed(1)}q26 -15 52 0`;
}).join("");
const BORDER = `M${PLATE.x + PLATE.r} ${PLATE.y}H${PLATE.x + PLATE.w - PLATE.r}Q${PLATE.x + PLATE.w} ${PLATE.y} ${PLATE.x + PLATE.w} ${PLATE.y + PLATE.r}V${PLATE.y + PLATE.h - PLATE.r}Q${PLATE.x + PLATE.w} ${PLATE.y + PLATE.h} ${PLATE.x + PLATE.w - PLATE.r} ${PLATE.y + PLATE.h}H${PLATE.x + PLATE.r}Q${PLATE.x} ${PLATE.y + PLATE.h} ${PLATE.x} ${PLATE.y + PLATE.h - PLATE.r}V${PLATE.y + PLATE.r}Q${PLATE.x} ${PLATE.y} ${PLATE.x + PLATE.r} ${PLATE.y}Z`;

/** The four act points on the Line (I–IV) and their lock windows. */
const ACTS = [0.14, 0.38, 0.62, 0.86].map((f, k) => {
  const q = fitPoint(LINE.at(f), TRAIL_BOX);
  return { f, x: q.x, y: q.y, lock: 0.34 + 0.12 * k };
});
const LOCK_LEN = 0.08;
const FIRE = { from: 0.86, to: 0.92 };
const X_R = 15;

/** The Dead Eye grade (0–1): in over .22–.32, out as the marks fire. */
const gradeAt = (v: number) => Math.min(remap(v, 0.22, 0.32), 1 - remap(v, FIRE.from, FIRE.to + 0.02));

export function TintypeDeadEyeFrame({ plate }: { plate: MediaId | null }) {
  const { p, live } = useCard();
  const one = useMotionValue(1);
  // the static card is the final frame; useTransform binds one source
  return <DeadEye key={live ? "live" : "static"} p={live ? p : one} plate={plate} />;
}

function DeadEye({ p, plate }: { p: MotionValue<number>; plate: MediaId | null }) {
  const ids = useId();
  const trail = useTransform(p, (v) => remap(v, 0, 0.25));
  const border = useTransform(p, (v) => remap(v, FIRE.from, 1));
  const grade = useTransform(p, gradeAt);

  const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
  const plateBox = {
    left: pct(PLATE.x / VB.w),
    top: pct(PLATE.y / VB.h),
    width: pct(PLATE.w / VB.w),
    height: pct(PLATE.h / VB.h),
  };

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* the plate: the frontier, as a tintype (R-2) */}
      <div className="act-tintype absolute overflow-hidden" style={plateBox}>
        {plate ? (
          <MediaFrame media={plate} layout="fill" playOn="never" sizes="(max-width: 639px) 100vw, 92vw" />
        ) : (
          <FrontierGround id={`${ids}g`} />
        )}
        {/* the Dead Eye grade: a sepia-red wash + red vignette, MEDIA only */}
        <motion.svg
          viewBox={`0 0 ${PLATE.w} ${PLATE.h}`}
          preserveAspectRatio="none"
          focusable="false"
          className="absolute inset-0 size-full"
          style={{ opacity: grade }}
        >
          <defs>
            <radialGradient id={`${ids}v`} cx="0.5" cy="0.5" r="0.72">
              <stop offset="0.5" stopColor="var(--w-deadeye)" stopOpacity={0} />
              <stop offset="1" stopColor="var(--w-deadeye)" stopOpacity={0.5} />
            </radialGradient>
          </defs>
          <rect width={PLATE.w} height={PLATE.h} fill="var(--w-deadeye)" opacity={0.42} style={{ mixBlendMode: "color" }} />
          <rect width={PLATE.w} height={PLATE.h} fill="var(--w-deadeye)" opacity={0.14} style={{ mixBlendMode: "multiply" }} />
          <rect width={PLATE.w} height={PLATE.h} fill={`url(#${ids}v)`} />
        </motion.svg>
        <span className="act-tintype-vignette pointer-events-none absolute inset-0" />
      </div>

      {/* the low sun, already low (a pre-rendered --w-dusk sprite) */}
      <span
        className="pointer-events-none absolute block -translate-x-1/2 -translate-y-1/2"
        style={{ left: pct(SUN.x), top: pct(SUN.to), width: pct(SUN.size), aspectRatio: "1" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB inline sprite (world media), not content */}
        <img src={SUN_SPRITE} alt="" width={40} height={40} className="size-full max-w-none" />
      </span>

      {/* the Line in graphite, the act ticks, the marks, the border */}
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        // stretched with the frame so it registers with the %-placed plate
        preserveAspectRatio="none"
        focusable="false"
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
        strokeLinecap="round"
      >
        <path d={HACHURES} stroke="var(--w-pencil)" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.6} />
        <DrawPath d={TRAIL} progress={trail} stroke="var(--w-pencil)" strokeWidth={1.3} />
        {ACTS.map((a, k) => (
          <ActMark key={k} act={a} p={p} trail={trail} />
        ))}
        <DrawPath d={BORDER} progress={border} stroke="var(--w-bone)" strokeWidth={0.9} />
      </svg>

      {/* the resolved points: HTML dots placed in %, so they stay round in
          the < 640 3:2 plate (the SVG above is stretched to the frame) */}
      {ACTS.map((a, k) => (
        <ActPoint key={k} act={a} p={p} />
      ))}
    </div>
  );
}

/** The point an act's mark resolves into (all four at once: fire once). */
function ActPoint({ act, p }: { act: (typeof ACTS)[number]; p: MotionValue<number> }) {
  const scale = useTransform(p, (v) => remap(v, FIRE.from, FIRE.to));
  return (
    <motion.span
      className="pointer-events-none absolute block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--w-bone)"
      style={{ left: `${((act.x / VB.w) * 100).toFixed(3)}%`, top: `${((act.y / VB.h) * 100).toFixed(3)}%`, scale }}
    />
  );
}

/** One act point: its tick (when the Line reaches it) and its X (locked
 *  in its window, collapsing as the marks fire; the point is <ActPoint>). */
function ActMark({
  act,
  p,
  trail,
}: {
  act: (typeof ACTS)[number];
  p: MotionValue<number>;
  trail: MotionValue<number>;
}) {
  const tick = useTransform(trail, (t) => (t >= act.f - 1e-6 ? 1 : 0));
  const a = useTransform(p, (v) => remap(v, act.lock, act.lock + LOCK_LEN / 2));
  const b = useTransform(p, (v) => remap(v, act.lock + LOCK_LEN / 2, act.lock + LOCK_LEN));
  const xRef = useRef<SVGGElement>(null);
  const xT = useSvgAttr(xRef, p, "transform", (v) => {
    const s = 1 - remap(v, FIRE.from, FIRE.to);
    return `translate(${act.x.toFixed(1)} ${act.y.toFixed(1)}) scale(${s.toFixed(3)})`;
  });
  return (
    <g>
      <motion.path
        d={`M${act.x} ${act.y - 10}V${act.y + 10}`}
        stroke="var(--w-bone)"
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
        style={{ opacity: tick }}
      />
      <g ref={xRef} transform={xT}>
        <DrawPath d={`M${-X_R} ${-X_R}L${X_R} ${X_R}`} progress={a} stroke="var(--w-bone)" strokeWidth={2.6} />
        <DrawPath d={`M${X_R} ${-X_R}L${-X_R} ${X_R}`} progress={b} stroke="var(--w-bone)" strokeWidth={2.6} />
      </g>
    </g>
  );
}
