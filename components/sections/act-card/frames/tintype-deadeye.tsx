"use client";

import { useId, useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, useSvgAttr } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, fitPath, fitPoint, remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";
import {
  BORDER_D,
  FrontierGround,
  PLATE_ASPECT,
  PLATE_STYLE,
  TINTYPE,
} from "@/components/sections/act-card/frames/tintype";
import { PlateBox, plateOf } from "@/components/sections/act-card/plate";

/**
 * Card II→III, ALT choreography "dead-eye" (lib/variants.ts
 * `card-tintype.choreo` alt; SM-14, rdr2-act.BAR §A; RECOGNIZABILITY S13 alt,
 * IC-RD-02 at card scale: "the marks lock along the Line"). The DEFAULT
 * develops the Heartlands; this one uses RDR2's other signature — DEAD
 * EYE, which is "mark first, fire once" (RD-P2), the site's own method:
 * pre-registration marks the targets, the blind holdout is the one shot.
 * Driven by the card's passage p (no pin, 0 travel); a pure function of p,
 * reversing exactly by position.
 *   0–.25    the frozen frontier (iconic-deadeye: a lone oak, a split-rail
 *            fence, a trail to a homestead, birds held mid-air) lies in a
 *            neutral tintype; the Line is drawn across it in graphite
 *            (pathLength = remap(p, 0, .25)), and a bone tick rises at each
 *            act point as the Line reaches it.
 *   .22–.32  DEAD EYE ENGAGES: the tintype lifts off the plate's own red-
 *            sepia grade and a red vignette closes in (--w-deadeye, MEDIA
 *            ONLY — a layer inside the plate, never text, never the marks).
 *   .34–.78  the marks lock on, one act at a time (I → IV, .12 apart): a
 *            two-stroke EMBER X on each act point (the X is ember, never the
 *            Dead Eye red: DESIGN §1.3.3), over a dark keyline so it reads
 *            on the red.
 *   .86–.92  fire once: all four marks take their shot AT ONCE (an ember
 *            point opens in each X) and the plate's bone border draws.
 * SETTLED (and the static card: RM, Pause, no JS, < 640, SSR): the Dead Eye
 * grade STAYS, the four X marks stay locked on the act points, the Line and
 * the border drawn — blind, it reads "Red Dead's Dead Eye". No reticle, no
 * weapon, no figure, no gunshot (ICONS IC-RD-02). The progress element is
 * the lower bar's pencil line: no "loading", no %, no status.
 *
 * The plate: iconic-deadeye carries the grade itself (its accept.icon lists
 * IC-RD-02); any other plate (the lab's MV-10, a fallback) gets the code
 * grade layer at full strength instead. With no plate at all, the code
 * frontier in that grade.
 */

const { VB, PLATE, TRAIL_BOX } = TINTYPE;
const TRAIL = fitPath(LINE_D, TRAIL_BOX);
// (no hachure arcs: on the red plate they floated as grey scribbles — M2
// critic 3 #6; the Line, the ticks and the marks carry the frame)

/** The four act points on the Line (I–IV) and their lock windows. */
const ACTS = [0.14, 0.38, 0.62, 0.86].map((f, k) => {
  const q = fitPoint(LINE.at(f), TRAIL_BOX);
  return { f, x: q.x, y: q.y, lock: 0.34 + 0.12 * k };
});
const LOCK_LEN = 0.08;
const FIRE = { from: 0.86, to: 0.92 };
const ENGAGE = { from: 0.22, to: 0.32 };
const X_R = 15;

export function TintypeDeadEyeFrame({ plate }: { plate: MediaId | null }) {
  const { p, live } = useCard();
  const one = useMotionValue(1);
  // the static card is the final frame; useTransform binds one source
  return <DeadEye key={live ? "live" : "static"} p={live ? p : one} live={live} plate={plate} />;
}

function DeadEye({ p, live, plate: id }: { p: MotionValue<number>; live: boolean; plate: MediaId | null }) {
  const ids = useId();
  const plate = plateOf(id);
  // does the plate carry the Dead Eye grade itself?
  const baked = Boolean(plate?.asset.accept?.icon?.includes("IC-RD-02"));
  const trail = useTransform(p, (v) => remap(v, 0, 0.25));
  const border = useTransform(p, (v) => remap(v, FIRE.from, 1));
  const engaged = useTransform(p, (v) => remap(v, ENGAGE.from, ENGAGE.to));
  const tintype = useTransform(engaged, (e) => 1 - e);
  const grade = useTransform(engaged, (e) => (baked ? 0.55 : 1) * e);

  return (
    <div aria-hidden="true" data-frame="deadeye" className="absolute inset-0">
      {/* the plate: the frozen frontier, in its Dead Eye grade */}
      <div className="absolute overflow-hidden rounded-[6px]" style={PLATE_STYLE}>
        {plate ? (
          <PlateBox plate={plate} aspect={PLATE_ASPECT}>
            <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="(max-width: 639px) 100vw, 92vw" />
          </PlateBox>
        ) : (
          <FrontierGround id={`${ids}g`} />
        )}
        {/* the Dead Eye grade: a sepia-red wash + red vignette, MEDIA only
            (at full strength on a plate without its own grade) */}
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
          {baked ? null : (
            <>
              <rect width={PLATE.w} height={PLATE.h} fill="var(--w-deadeye)" opacity={0.42} style={{ mixBlendMode: "color" }} />
              <rect width={PLATE.w} height={PLATE.h} fill="var(--w-deadeye)" opacity={0.14} style={{ mixBlendMode: "multiply" }} />
            </>
          )}
          <rect width={PLATE.w} height={PLATE.h} fill={`url(#${ids}v)`} />
        </motion.svg>
        <span className="act-tintype-vignette pointer-events-none absolute inset-0 opacity-70" />
      </div>
      {/* before Dead Eye engages: the same plate as a neutral tintype */}
      {live && plate ? (
        <motion.div className="act-tintype absolute overflow-hidden" style={{ ...PLATE_STYLE, opacity: tintype }}>
          <PlateBox plate={plate} aspect={PLATE_ASPECT}>
            <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="(max-width: 639px) 100vw, 92vw" />
          </PlateBox>
        </motion.div>
      ) : null}

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
        <DrawPath d={TRAIL} progress={trail} stroke="var(--w-bone)" strokeOpacity={0.8} strokeWidth={1.3} />
        {ACTS.map((a, k) => (
          <ActMark key={k} act={a} p={p} trail={trail} />
        ))}
        <DrawPath d={BORDER_D} progress={border} stroke="var(--w-bone)" strokeWidth={0.9} />
      </svg>

      {/* the shots: an ember point opens in each X at once (HTML dots
          placed in %, so they stay round in the < 640 3:2 plate) */}
      {ACTS.map((a, k) => (
        <ActPoint key={k} act={a} p={p} />
      ))}
    </div>
  );
}

/** The shot in an act's X (all four at once: fire once). */
function ActPoint({ act, p }: { act: (typeof ACTS)[number]; p: MotionValue<number> }) {
  const scale = useTransform(p, (v) => remap(v, FIRE.from, FIRE.to));
  return (
    <motion.span
      // border colour inline: an unlayered `* { border-color }` in
      // app/globals.css outranks the border-colour utilities
      className="pointer-events-none absolute block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-(--color-ember)"
      style={{
        left: `${((act.x / VB.w) * 100).toFixed(3)}%`,
        top: `${((act.y / VB.h) * 100).toFixed(3)}%`,
        scale,
        borderColor: "#140806",
      }}
    />
  );
}

/** One act point: its tick (when the Line reaches it) and its ember X,
 *  locked in its window and KEPT (the settled alt keeps the marks). */
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
  // the lock "bites": the X lands 1.25× and settles to 1× as it completes
  const xRef = useRef<SVGGElement>(null);
  const xT = useSvgAttr(xRef, p, "transform", (v) => {
    const s = 1.25 - 0.25 * remap(v, act.lock, act.lock + LOCK_LEN);
    return `translate(${act.x.toFixed(1)} ${act.y.toFixed(1)}) scale(${s.toFixed(3)})`;
  });
  const d1 = `M${-X_R} ${-X_R}L${X_R} ${X_R}`;
  const d2 = `M${X_R} ${-X_R}L${-X_R} ${X_R}`;
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
        {/* a dark keyline under the ember, so the X reads on the red plate */}
        <DrawPath d={d1} progress={a} stroke="#140806" strokeWidth={6.5} />
        <DrawPath d={d2} progress={b} stroke="#140806" strokeWidth={6.5} />
        <DrawPath d={d1} progress={a} stroke="var(--color-ember)" strokeWidth={3.2} />
        <DrawPath d={d2} progress={b} stroke="var(--color-ember)" strokeWidth={3.2} />
      </g>
    </g>
  );
}
