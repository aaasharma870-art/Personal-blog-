"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { dur, ease } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { DrawPath, hash01, useSvgAttr } from "@/components/primitives/loaders/kit";
import { LINE, LINE_D, measurePath, remap } from "@/components/primitives/loaders/line";
import { CANDLE_SPRITE, FLAME_SPRITE, LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { FIRE0_SPRITE } from "@/components/primitives/loaders/sprites-rd";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * Card III→IV, ALT choreography "lumos-sweep" (lib/variants.ts
 * `card-ignite.choreo` alt; SM-10, D-5 long #2). The DEFAULT carries the
 * campfire's embers up to become candles along the Line; here the candles
 * already hang, dark, in the hall, and ONE light does the work: a wand-tip
 * light (the light only — never a wand, L21) is struck from the fire's last
 * flame and sweeps the hall in a single flourish, and every candle it
 * passes catches, in the order it passes them. One pinned driver p (≤ 60vh
 * on a desktop fine pointer; everything a pure function of p, reversible
 * and pixel-identical on return):
 *   0–.12    the rd → hp ground crossfade (CardShell `fromGround`); the
 *            campfire at the Line's start burns down and goes out, while the
 *            hall's candles appear unlit (faint ink tapers).
 *   .1–.2    Lumos: the light is struck where the fire was (one warm family
 *            at a time: the fire is out before the first candle catches).
 *   .2–.82   the sweep: the light runs a flourish across the hall; a candle
 *            catches as the light's reach passes it (a ramp, never a pop),
 *            a short ink tail follows the light, and the Line below is inked
 *            up to the light's reach.
 *   .82–.96  the light comes down onto the Line's end and becomes the last
 *            warm point (a flame sprite); the hall is lit.
 *   > .9     THE GREAT HALL (iconic-hall-alt; RECOGNIZABILITY S17: both
 *            variants settle on the hall) swaps in on dur.preview (a state
 *            swap) — "LUMOS — THE GREAT HALL LIGHTS UP • HARRY POTTER".
 * Every luminous pixel is a pre-rendered sprite (<image>, plus-lighter;
 * Law 1): 36 candles + 1 light + 1 fire + 1 flame (≤ 40, ignite G5); no
 * canvas, no DOM glow, no aqua beyond the one cool light. Static card (RM, Pause, < 1024 /
 * coarse, no JS, SSR): the Great Hall still — or, with no hall plate, the
 * lit code hall (every candle lit, the Line inked, the last warm point).
 * aria-hidden art.
 */

/** The hall in Line space (the Line's 1000 × 400, padded for the candles). */
const VB = { x: -60, y: -70, w: 1120, h: 500 };

/** The flourish, fire → across the hall → down onto the Line's end. */
const SWEEP_D =
  "M40 300C24 196 66 92 150 72C262 44 330 152 450 112C562 74 598 18 700 38C804 58 838 150 930 110C992 84 1004 176 926 228";
const SWEEP = measurePath(SWEEP_D, 64);
const SWEEP_T = { from: 0.2, to: 0.82 };

/** Running max x of the light along the sweep (its reach), tabulated. */
const REACH = (() => {
  const n = 400;
  const out: number[] = [];
  let m = -Infinity;
  for (let i = 0; i <= n; i++) {
    m = Math.max(m, SWEEP.at(i / n).x);
    out.push(m);
  }
  return out;
})();
const reachAt = (u: number) => REACH[Math.round(Math.min(1, Math.max(0, u)) * (REACH.length - 1))];

/** The Line fraction whose x the reach has passed (the ink under the sweep). */
const LINE_X = Array.from({ length: 201 }, (_, i) => LINE.at(i / 200).x);
function inkAt(u: number): number {
  const rx = reachAt(u);
  let f = 0;
  for (let i = 0; i < LINE_X.length; i++) {
    if (LINE_X[i] <= rx) f = i / 200;
    else break;
  }
  // the fold at the Line's end turns back under the reach: finish it as the
  // light comes down onto it
  return Math.max(f, remap(u, 0.9, 1));
}

/** A Halton point (deterministic, evenly spread, never a grid). */
function halton(i: number, b: number): number {
  let f = 1;
  let r = 0;
  for (let k = i; k > 0; k = Math.floor(k / b)) {
    f /= b;
    r += f * (k % b);
  }
  return r;
}

/** 36 candles floating over the hall: higher = farther (smaller, dimmer). */
const CANDLES = Array.from({ length: 36 }, (_, i) => {
  const x = 84 + halton(i + 1, 2) * 870;
  const y = -34 + halton(i + 1, 3) * 176;
  const depth = 0.62 + 0.5 * ((y + 34) / 176) + (hash01(i, 4) - 0.5) * 0.12;
  const w = 13 * depth;
  return { x, y, w, h: w * 3, depth: Math.min(1.1, depth) };
});

const FIRE_AT = LINE.at(0);
const END_AT = LINE.at(1);
const LIGHT = 34;

export function IgniteLumosFrame({ hall }: { hall: MediaId | null }) {
  const { p, live } = useCard();
  const one = useMotionValue(1);
  const [hallOn, setHallOn] = useState(() => p.get() > 0.9);
  useMotionValueEvent(p, "change", (v) => {
    const on = v > 0.9;
    if (on !== hallOn) setHallOn(on);
  });

  if (hall) {
    return (
      <div aria-hidden="true" data-frame="ignite-lumos" className="absolute inset-0">
        {live ? <Hall key="live" p={p} /> : null}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: !live || hallOn ? 1 : 0 }}
          transition={live ? { duration: dur.preview, ease } : { duration: 0 }}
        >
          <MediaFrame media={hall} layout="fill" playOn="never" sizes="100vw" />
        </motion.div>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* no hall yet (MV-07): the sweep ends on its own final frame */}
      <Hall key={live ? "live" : "static"} p={live ? p : one} />
    </div>
  );
}

function Hall({ p }: { p: MotionValue<number> }) {
  const u = useTransform(p, (v) => remap(v, SWEEP_T.from, SWEEP_T.to));
  const reach = useTransform(u, reachAt);
  const ink = useTransform(u, inkAt);
  const tapers = useTransform(p, (v) => remap(v, 0, 0.15));
  const fire = useTransform(p, (v) => 1 - remap(v, 0.04, 0.12));
  const lightOn = useTransform(p, (v) => Math.min(remap(v, 0.1, 0.18), 1 - remap(v, 0.9, 0.96)));
  const last = useTransform(p, (v) => remap(v, 0.9, 0.96));
  // the light: at the fire until the sweep starts, then along the flourish
  const lightRef = useRef<SVGImageElement>(null);
  const lightT = useSvgAttr(lightRef, u, "transform", (t) => {
    const q = SWEEP.at(t);
    return `translate(${(q.x - LIGHT / 2).toFixed(1)} ${(q.y - LIGHT / 2).toFixed(1)})`;
  });
  // a short ink tail behind the light (the flourish, [u − .07, u])
  const TAIL = 0.07;
  const tailOffset = useTransform(u, (t) => -(t - TAIL));
  const tailOn = useTransform(p, (v) => (v > SWEEP_T.from && v < SWEEP_T.to + 0.04 ? 0.55 : 0));

  return (
    <svg
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className="absolute inset-0 size-full"
      fill="none"
    >
      {/* the Line: faint graphite, inked up to the light's reach */}
      <path
        d={LINE_D}
        stroke="var(--w-pencil)"
        strokeOpacity={0.3}
        strokeWidth={1.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <DrawPath d={LINE_D} progress={ink} stroke="var(--w-ink-contour)" strokeWidth={2} strokeLinecap="round" />

      {/* unlit tapers (faint ink), each hidden as its candle catches */}
      <motion.g style={{ opacity: tapers }}>
        {CANDLES.map((c, i) => (
          <Taper key={i} c={c} reach={reach} />
        ))}
      </motion.g>

      {/* the lit candles, the fire, the light, the last warm point: sprites */}
      <g style={{ mixBlendMode: "plus-lighter" }}>
        {CANDLES.map((c, i) => (
          <Candle key={i} c={c} reach={reach} />
        ))}
        <motion.image
          href={FIRE0_SPRITE}
          x={FIRE_AT.x - 11}
          y={FIRE_AT.y - 29}
          width={22}
          height={33}
          preserveAspectRatio="none"
          style={{ opacity: fire }}
        />
        <motion.path
          d={SWEEP_D}
          pathLength={1}
          stroke="var(--w-ink-contour)"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeDasharray={`${TAIL} 2`}
          style={{ strokeDashoffset: tailOffset, opacity: tailOn }}
        />
        <motion.g style={{ opacity: lightOn }}>
          <image ref={lightRef} href={LUMOS_SPRITE} width={LIGHT} height={LIGHT} transform={lightT} />
        </motion.g>
        <motion.image
          href={FLAME_SPRITE}
          x={END_AT.x - 12}
          y={END_AT.y - 18}
          width={24}
          height={24}
          style={{ opacity: last }}
        />
      </g>
    </svg>
  );
}

type C = (typeof CANDLES)[number];

/** A candle catches over 40 units of the light's reach (a ramp, not a pop). */
const litAt = (c: C, rx: number) => remap(rx, c.x - 20, c.x + 20);

function Taper({ c, reach }: { c: C; reach: MotionValue<number> }) {
  const opacity = useTransform(reach, (rx) => 0.3 * c.depth * (1 - litAt(c, rx)));
  return (
    <motion.rect
      x={c.x - c.w / 6}
      y={c.y + c.h * 0.44}
      width={c.w / 3}
      height={c.h * 0.53}
      rx={c.w / 12}
      fill="var(--w-ink-contour)"
      style={{ opacity }}
    />
  );
}

function Candle({ c, reach }: { c: C; reach: MotionValue<number> }) {
  const opacity = useTransform(reach, (rx) => 0.95 * litAt(c, rx) * (0.7 + 0.3 * c.depth));
  return (
    <motion.image
      href={CANDLE_SPRITE}
      x={c.x - c.w / 2}
      y={c.y}
      width={c.w}
      height={c.h}
      preserveAspectRatio="none"
      style={{ opacity }}
    />
  );
}
