"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { emit } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import type { CompassApi } from "@/components/worlds/pirates/jack-compass";
import { nearestTurn } from "@/components/worlds/pirates/voyage-chart";

/* ============================================================================
   useCompassSpin — "Spin Jack's compass", the Act I toy (PHASE3-SPEC §9.2
   #1; ICONS IC-PC-03). Lazy (compass-toy.tsx, DESKTOP_FINE only). It drives
   the About compass through JackCompass's handle (`CompassApi`): motion
   values and DOM attributes, no React render per frame. Only the resting
   pillar (`setPoint`) and "a spin owns the needle" (`setBusy`) are state.

   - CLICK / Enter / Space: an impulse of +720…1080° (seeded by the press
     count), the needle spinning down with 3 s⁻¹ friction, a little past the
     goal, then springNeedle (the compass's own spring) settles it on the
     NEXT pillar's bearing in reading order (NW → NE → SW → SE). The lid
     clicks shut-open on each spin.
     ALT (about.compass "taking-bearings"): the press takes the four
     bearings in turn, one spring step each, and comes to rest on the next.
   - DRAG: pointer capture on the case; the drag turns the CASE (lid, dial)
     about its centre, direct manipulation, while the needle keeps its
     bearing (it never follows the pointer: IC-PC-03). On release the case
     carries the flick with 3 s⁻¹ friction, eases back upright, the lid
     clicks and the needle springs to the next pillar's bearing.
   - ← / →: step to the previous / next pillar's bearing (the focused
     button only; WCAG 2.1.4).
   - Reduced motion / Pause: a press jumps to the next bearing; no drag, no
     sound. Pause mid-spin stops at once on the final bearing, case upright.
   - Sound (lib/audio via the "toy" event, spec §10.3): the lid click
     ("open"), a ratchet tick per 45° (≤ 12/s, "tick"), the settle clunk.
   ========================================================================== */

export type CompassSpinOptions = {
  /** The pillars' bearings (° clockwise from north), in reading order. */
  bearings: readonly number[];
  /** The pillar the needle rests on now. */
  point: number;
  setPoint(i: number): void;
  setBusy(busy: boolean): void;
  /** about.compass ALT: a press takes the bearings in turn. */
  alt: boolean;
};

export type CompassSpin = {
  onClick(e: MouseEvent<HTMLButtonElement>): void;
  onKeyDown(e: KeyboardEvent<HTMLButtonElement>): void;
  onPointerDown(e: PointerEvent<HTMLButtonElement>): void;
  onPointerMove(e: PointerEvent<HTMLButtonElement>): void;
  onPointerUp(e: PointerEvent<HTMLButtonElement>): void;
  onPointerCancel(e: PointerEvent<HTMLButtonElement>): void;
  /** The B08 invite: one needle twitch. */
  twitch(): void;
  /** The visitor has used the toy (the invite is then pointless). */
  used(): boolean;
};

/** Spin friction (s⁻¹) and the needle's run past the goal (°). */
const FRICTION = 3;
const OVERRUN = 16;
/** ≤ 12 ratchet ticks a second (spec §9.2 #1). */
const TICK_MS = 1000 / 12;
/** A press that moves less than this is a click, not a drag (px). */
const DRAG_PX = 5;
/** The case of the compass box: its centre as a fraction of the height. */
const CASE_Y = 92 / 144;

const toy = (action: string) => {
  if (!motionOffNow()) emit("toy", { toy: "compass", action });
};

/** The press count → an impulse in 720…1080° (deterministic, seeded). */
function impulse(n: number): number {
  const x = Math.sin((n + 1) * 12.9898) * 43758.5453;
  return 720 + 360 * (x - Math.floor(x));
}

/** A rAF tween with exponential decay (friction `k`): p(t) normalised so it
 *  lands exactly on `to` at `ms`. Returns its cancel. */
function decay(from: number, to: number, ms: number, k: number, step: (v: number) => void, done: () => void): () => void {
  const T = ms / 1000;
  const norm = 1 - Math.exp(-k * T);
  let raf = 0;
  let t0 = -1;
  const frame = (now: number) => {
    if (t0 < 0) t0 = now;
    const t = Math.min(T, (now - t0) / 1000);
    const p = norm > 0 ? (1 - Math.exp(-k * t)) / norm : 1;
    step(from + (to - from) * p);
    if (t < T) raf = requestAnimationFrame(frame);
    else done();
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

export function useCompassSpin(api: CompassApi, o: CompassSpinOptions): CompassSpin {
  const opts = useRef(o);
  useEffect(() => {
    opts.current = o;
  });

  const presses = useRef(0);
  const touched = useRef(false);
  /** Cancels whatever is running (rAF loops, timers). */
  const running = useRef<(() => void)[]>([]);
  /** The pillar a running spin will rest on (Pause lands it there). */
  const pending = useRef<number | null>(null);
  const caseAngle = useRef(0);
  const drag = useRef<{
    id: number;
    cx: number;
    cy: number;
    last: number;
    moved: boolean;
    x0: number;
    y0: number;
    tick: number;
    tickAt: number;
    samples: { t: number; a: number }[];
  } | null>(null);
  const swallowClick = useRef(false);

  const later = (ms: number, fn: () => void) => {
    const t = window.setTimeout(fn, ms);
    running.current.push(() => window.clearTimeout(t));
  };
  const stopAll = () => {
    const fns = running.current;
    running.current = [];
    fns.forEach((f) => f());
  };
  const writeCase = (a: number) => {
    caseAngle.current = a;
    api.caseEl?.setAttribute("transform", Math.abs(a) < 0.01 ? "" : `rotate(${a.toFixed(2)})`);
  };
  const next = () => (opts.current.point + 1) % opts.current.bearings.length;
  const bearingOf = (i: number) => opts.current.bearings[i] ?? 0;

  /** Rest on pillar `i`: the needle's goal (springNeedle settles it). */
  const land = (i: number, jump: boolean) => {
    const goal = nearestTurn(api.needle.get(), bearingOf(i));
    if (jump) {
      api.target.jump(goal);
      api.needle.jump(goal);
    } else api.target.set(goal);
    pending.current = null;
    opts.current.setPoint(i);
    opts.current.setBusy(false);
  };

  /** Motion off mid-anything: stop now, final state (Pause: no sound). */
  useEffect(
    () =>
      onMotionOffChange(() => {
        if (!motionOffNow()) return;
        const was = pending.current;
        stopAll();
        drag.current = null;
        writeCase(0);
        api.lid("open", true);
        // the bearing it was heading for, else the one it rests on (a
        // twitch cut short must not leave the needle off its bearing)
        land(was ?? opts.current.point, true);
      }),
    // `api` is stable for the compass's life
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api],
  );
  // unmount: stop, upright
  useEffect(
    () => () => {
      stopAll();
      writeCase(0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api],
  );

  const lidClick = () => {
    api.lid("shut");
    later(110, () => {
      api.lid("open");
      toy("open");
    });
  };

  const spin = () => {
    touched.current = true;
    const to = next();
    stopAll();
    if (motionOffNow()) {
      land(to, true);
      return;
    }
    pending.current = to;
    opts.current.setBusy(true);
    lidClick();
    if (opts.current.alt) {
      // take the bearings in turn: a full lap of the four, resting on `to`
      const n = opts.current.bearings.length;
      for (let k = 1; k <= n; k++) {
        const i = (to + k) % n;
        later(140 + (k - 1) * 380, () => {
          const cur = api.needle.get();
          let g = nearestTurn(cur, bearingOf(i));
          if (g <= cur + 10) g += 360; // always clockwise
          api.target.set(g);
          toy("tick");
          if (k === n) {
            later(520, () => {
              toy("settle");
              land(to, false);
            });
          }
        });
      }
      return;
    }
    const from = api.needle.get();
    let goal = nearestTurn(from + impulse(presses.current++), bearingOf(to));
    while (goal - from < 720) goal += 360;
    const ms = 1500 + ((goal - from - 720) / 360) * 600;
    let k = Math.floor(from / 45);
    let tickAt = 0;
    running.current.push(
      decay(
        from,
        goal + OVERRUN,
        ms,
        FRICTION,
        (v) => {
          api.needle.jump(v);
          const kk = Math.floor(v / 45);
          if (kk !== k) {
            k = kk;
            const now = performance.now();
            if (now - tickAt >= TICK_MS) {
              tickAt = now;
              toy("tick");
            }
          }
        },
        () => {
          // the run past the goal springs back: springNeedle settles it
          land(to, false);
          later(380, () => toy("settle"));
        },
      ),
    );
  };

  /** ← / →: the neighbouring bearing (spring). */
  const step = (d: 1 | -1) => {
    touched.current = true;
    stopAll();
    const n = opts.current.bearings.length;
    const to = (opts.current.point + d + n) % n;
    const jump = motionOffNow();
    land(to, jump);
    if (!jump) {
      toy("tick");
      later(420, () => toy("settle"));
    }
  };

  const angleAt = (x: number, y: number, cx: number, cy: number) => (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI;

  const releaseDrag = (e: PointerEvent<HTMLButtonElement>, fling: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d.moved) return; // a click: onClick spins
    // the click this release makes is not a spin (it follows in the same
    // task; the flag clears itself if none comes)
    swallowClick.current = true;
    window.setTimeout(() => {
      swallowClick.current = false;
    }, 60);
    touched.current = true;
    stopAll();
    if (motionOffNow()) {
      writeCase(0);
      land(next(), true);
      return;
    }
    // the flick: release velocity (°/s) over the last ~100 ms
    const s = d.samples;
    const a = s[s.length - 1];
    const b = s.find((p) => a && a.t - p.t <= 100) ?? s[0];
    const v = fling && a && b && a.t > b.t ? ((a.a - b.a) / (a.t - b.t)) * 1000 : 0;
    const from = caseAngle.current;
    const carry = Math.max(-900, Math.min(900, v / FRICTION));
    const coast = Math.abs(carry) > 2 ? Math.min(1400, 400 + Math.abs(carry) * 2) : 0;
    const upright = () => {
      const a0 = caseAngle.current;
      const goal = 360 * Math.round(a0 / 360);
      if (Math.abs(goal - a0) < 0.5) return writeCase(goal % 360 === 0 ? 0 : goal);
      running.current.push(decay(a0, goal, 700, 4, writeCase, () => writeCase(0)));
    };
    const to = next();
    pending.current = to;
    opts.current.setBusy(true);
    lidClick();
    later(160, () => {
      land(to, false);
      later(420, () => toy("settle"));
    });
    if (coast) running.current.push(decay(from, from + carry, coast, FRICTION, writeCase, upright));
    else upright();
  };

  return {
    onClick(e) {
      if (swallowClick.current) {
        swallowClick.current = false;
        e.preventDefault();
        return;
      }
      spin();
    },
    onKeyDown(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        step(e.key === "ArrowRight" ? 1 : -1);
      }
    },
    onPointerDown(e) {
      if (e.button !== 0 || motionOffNow()) return;
      const r = e.currentTarget.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * CASE_Y;
      const a = angleAt(e.clientX, e.clientY, cx, cy);
      drag.current = {
        id: e.pointerId,
        cx,
        cy,
        last: a,
        moved: false,
        x0: e.clientX,
        y0: e.clientY,
        tick: Math.floor(caseAngle.current / 45),
        tickAt: 0,
        samples: [{ t: e.timeStamp, a: caseAngle.current }],
      };
      swallowClick.current = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e) {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      if (!d.moved) {
        if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < DRAG_PX) return;
        d.moved = true;
        stopAll();
        opts.current.setBusy(true);
      }
      const a = angleAt(e.clientX, e.clientY, d.cx, d.cy);
      let delta = a - d.last;
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      d.last = a;
      const turned = caseAngle.current + delta;
      writeCase(turned);
      d.samples.push({ t: e.timeStamp, a: turned });
      if (d.samples.length > 12) d.samples.shift();
      const kk = Math.floor(turned / 45);
      if (kk !== d.tick) {
        d.tick = kk;
        if (e.timeStamp - d.tickAt >= TICK_MS) {
          d.tickAt = e.timeStamp;
          toy("tick");
        }
      }
    },
    onPointerUp(e) {
      releaseDrag(e, true);
    },
    onPointerCancel(e) {
      releaseDrag(e, false);
    },
    twitch() {
      if (motionOffNow() || touched.current) return;
      const base = api.target.get();
      api.target.set(base + 14);
      later(170, () => api.target.set(base));
    },
    used: () => touched.current,
  };
}
