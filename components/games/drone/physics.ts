/* ============================================================================
   THE HOMEMADE DRONE · physics (PHASE3-SPEC §9.2 #2 "Physics") — OWNER:
   W3-GAMES. Pure: one step per animation frame, no DOM, no allocation per
   frame beyond the state object it mutates.

   Numbers are px at 1440 (the band is 1312 px wide there) and scale with the
   band's width (`k = width / 1312`):
     thrust 1500 px/s² · max speed 460 px/s · drag v·e^(−2.6·dt)
     tilt ±10° with the horizontal speed · hover bob ±2 px at 1.6 Hz
     pointer drag: a spring toward the pointer, k 90 s⁻², ζ .9
   The band's edge stops the drone dead (restitution 0): no bounce, no
   crash, no fall, no fail state. dt is clamped to 1/30 s by the caller.
   ========================================================================== */

export const PHYS = {
  /** The band width the px numbers are tuned for (1440 viewport). */
  refWidth: 1312,
  thrust: 1500,
  maxSpeed: 460,
  drag: 2.6,
  tiltDeg: 10,
  bobPx: 2,
  bobHz: 1.6,
  springK: 90,
  springZeta: 0.9,
  /** Longest step the loop integrates (s). */
  dtMax: 1 / 30,
  /** Esc / auto-land / Pause-free landing glide (ms). */
  landMs: 600,
} as const;

export type Flight = {
  /** The sprite centre, band px. */
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type Steer =
  /** Keys held: −1 / 0 / +1 per axis. */
  | { kind: "keys"; ax: number; ay: number }
  /** A pointer pressed on the field: the target, band px. */
  | { kind: "pointer"; tx: number; ty: number }
  | { kind: "none" };

/**
 * Advance `f` by `dt` seconds inside a `w × h` band. `rx` / `ry` are the
 * sprite's half extents (the centre never leaves the band minus them).
 */
export function step(f: Flight, steer: Steer, dt: number, w: number, h: number, rx: number, ry: number): void {
  const k = w / PHYS.refWidth;
  const max = PHYS.maxSpeed * k;
  let ax = 0;
  let ay = 0;
  if (steer.kind === "keys") {
    const len = Math.hypot(steer.ax, steer.ay) || 1;
    ax = (steer.ax / len) * PHYS.thrust * k;
    ay = (steer.ay / len) * PHYS.thrust * k;
  } else if (steer.kind === "pointer") {
    const c = 2 * PHYS.springZeta * Math.sqrt(PHYS.springK);
    ax = PHYS.springK * (steer.tx - f.x) - c * f.vx;
    ay = PHYS.springK * (steer.ty - f.y) - c * f.vy;
  }
  f.vx += ax * dt;
  f.vy += ay * dt;
  const d = Math.exp(-PHYS.drag * dt);
  f.vx *= d;
  f.vy *= d;
  const sp = Math.hypot(f.vx, f.vy);
  if (sp > max) {
    f.vx *= max / sp;
    f.vy *= max / sp;
  }
  f.x += f.vx * dt;
  f.y += f.vy * dt;
  // the edge: stop dead on the axis that hit it (restitution 0)
  if (f.x < rx) {
    f.x = rx;
    f.vx = 0;
  } else if (f.x > w - rx) {
    f.x = w - rx;
    f.vx = 0;
  }
  if (f.y < ry) {
    f.y = ry;
    f.vy = 0;
  } else if (f.y > h - ry) {
    f.y = h - ry;
    f.vy = 0;
  }
}

/** The sprite's tilt (deg) for its horizontal speed. */
export function tiltOf(f: Flight, w: number): number {
  const max = PHYS.maxSpeed * (w / PHYS.refWidth);
  return Math.max(-1, Math.min(1, f.vx / max)) * PHYS.tiltDeg;
}

/** The hover bob (px) at time `t` seconds, scaled to the band. */
export function bobOf(t: number, w: number): number {
  return PHYS.bobPx * (w / PHYS.refWidth) * Math.sin(2 * Math.PI * PHYS.bobHz * t);
}

/** Speed as a 0–1 share of the maximum (the rotor hum's rate). */
export function speedShare(f: Flight, w: number): number {
  return Math.min(1, Math.hypot(f.vx, f.vy) / (PHYS.maxSpeed * (w / PHYS.refWidth)));
}
