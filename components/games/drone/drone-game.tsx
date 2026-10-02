"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { sound, type SoundLoop } from "@/lib/audio";
import { emit } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { scrollToTarget } from "@/lib/smooth-scroll";
import type { Variant } from "@/lib/variants";
import { StageLayerPortal } from "@/components/stage/stage-layers";
import { GATE_COUNT, TAKEOFF, gateSpan, gateX, passes } from "@/components/games/drone/course";
import { PHYS, bobOf, speedShare, step, tiltOf, type Flight, type Steer } from "@/components/games/drone/physics";
import { fill, secs, type DroneCopy } from "@/components/games/shared";
import { recordDroneCourse } from "@/components/games/store";
// the games' CSS rides this lazy chunk, never the first load (W2 rule 34)
import "@/components/games/games.css";

/* ============================================================================
   FLY THE HOMEMADE DRONE (PHASE3-SPEC §9.2 #2; P3-8 #4) — OWNER: W3-GAMES.
   The lazy game, mounted inside the systems band's picture box by
   <DroneBand/> on the first press of "▲ Take off" (DESKTOP_FINE only; the
   pill is server markup shown by the full media query). It never starts by
   itself: every flight is a press (`run` counts them).

   THE FLIGHT
   - Take-off: the plate dims to the slate "board" state (an opacity layer
     over the plate: the plate itself is never repainted) and the chalk
     ChalkQuadcopter, a PRE-RASTERIZED PNG sprite (assets/p3/games/), rises
     from the photographed drone's mark [.60, .47]. Focus moves into the play
     field; `html[data-game="drone"]` is set (the typed-egg listener stands
     down, B9; no CSS keys on it, rule 33) and `game:start` holds the band's
     camera still (drone-desk.tsx).
   - Seven chalk gates (course.ts, static SVG): 01…07, the next one the
     viewport's one aqua mark. Passing gate n speaks its VERBATIM gauntlet
     title in a polite live region ("Gate 2 of 7 · A blind holdout, spent
     once"; the strings are filled on the server) and emits `game:gate`
     (the chalk tick). Gate 7 records the time (best in aryan:games:v1),
     emits `game:finish` (the finish chord), lands, and the band shows the
     score and a real link "Next: the kill-list ↓".
   - Physics (physics.ts): thrust, max speed, drag, tilt, hover bob; the
     band's edge stops it dead (restitution 0). No crash, fall, fail state
     or time limit. dt ≤ 1/30 s; rAF only while flying, in view and the tab
     visible; < 2 ms of JS per frame (one transform on one promoted sprite).
   - Controls: arrows / WASD ONLY while the play field has focus
     (preventDefault only there; no page-wide keys, WCAG 2.1.4); pointer
     press-and-drag on the field (a spring toward the pointer); Esc lands
     (600 ms glide back to the mark); the band below 50 % visible lands it.
     Wheel and scroll are never captured.
   - Sound (lib/audio): the rotor hum loop at a rate that follows the speed;
     the gate tick and finish chord come from the events.
   - The HUD ("3/7 gates · 9.2 s" and how to fly) is fixed, through
     StageLayerPortal("game-hud") (under the header and the fast lane).

   MOTION OFF (reduced motion or Pause): take-off is disabled; the pill shows
   the static labelled course with "Motion is off: here is the flight plan"
   and the gate titles (a press again or Esc closes it). Pause mid-flight
   lands at once; nothing keeps moving.

   VARIANTS (`systems.drone`, the key is handed to lib/variants.ts):
     default "chalk-sprite"  the slate board, chalk gates, the chalk sprite;
     alt     "blueprint"     the blueprint panel, dashed drafting gates in
                             the blueprint line, the drone as a clean
                             blueprint drawing (drone-blueprint.png).
   IC-3I-08: no window, no camera feed, no song, no crash, no comic sound,
   and nothing links it to Aryan's own drone work. Never "Rancho's drone"
   in any string.
   ========================================================================== */

type Phase = "idle" | "flying" | "landing" | "done" | "plan";
type Result = { ms: number; best: number };

/** The sprite's width as a share of the band, and its aspect (192 × 134). */
const SPRITE_W = 0.055;
const SPRITE_ASPECT = 134 / 192;
/** The course's drawing box: the band is exactly 21:9 at ≥ 640 px. */
const VB_W = 2100;
const VB_H = 900;
/** The posts above / below each opening (viewBox units). */
const POST = 70;
const BAR = 26;

const pad = (n: number) => String(n).padStart(2, "0");
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

type Key = "l" | "r" | "u" | "d";
function keyOf(k: string): Key | null {
  switch (k) {
    case "ArrowLeft":
    case "a":
    case "A":
      return "l";
    case "ArrowRight":
    case "d":
    case "D":
      return "r";
    case "ArrowUp":
    case "w":
    case "W":
      return "u";
    case "ArrowDown":
    case "s":
    case "S":
      return "d";
    default:
      return null;
  }
}

type Setters = {
  phase(p: Phase): void;
  gates(n: number): void;
  clock(ms: number): void;
  say(s: string): void;
  result(r: Result | null): void;
};

type Refs = {
  box: RefObject<HTMLDivElement | null>;
  field: RefObject<HTMLDivElement | null>;
  sprite: RefObject<HTMLImageElement | null>;
  board: RefObject<HTMLDivElement | null>;
  pill: RefObject<HTMLButtonElement | null>;
};

/** The flight controller: plain closures over refs, no React per frame. */
function controller(r: Refs, copy: DroneCopy, set: Setters) {
  let phase: Phase = "idle";
  const f: Flight = { x: 0, y: 0, vx: 0, vy: 0 };
  let W = 0;
  let H = 0;
  let sw = 0;
  let sh = 0;
  /** Gates passed (= the next gate's index). */
  let next = 0;
  /** Flight time (ms) and the bob clock (s). */
  let flown = 0;
  let t = 0;
  let raf = 0;
  let last = 0;
  let lastClock = -1;
  let lastHum = 0;
  let inView = true;
  let visible = document.visibilityState !== "hidden";
  const keys: Record<Key, boolean> = { l: false, r: false, u: false, d: false };
  let ptr: { x: number; y: number } | null = null;
  let hum: SoundLoop | null = null;
  let glide: { x0: number; y0: number; t0: number; reason: string } | null = null;

  const go = (p: Phase) => {
    phase = p;
    set.phase(p);
  };

  const measure = (): boolean => {
    const b = r.box.current;
    if (!b) return false;
    const nw = b.clientWidth;
    const nh = b.clientHeight;
    if (!nw || !nh) return false;
    if (W && H && (nw !== W || nh !== H)) {
      f.x *= nw / W;
      f.y *= nh / H;
      f.vx *= nw / W;
      f.vy *= nh / H;
    }
    W = nw;
    H = nh;
    sw = W * SPRITE_W;
    sh = sw * SPRITE_ASPECT;
    return true;
  };

  const draw = (bob: number, tilt: number) => {
    const s = r.sprite.current;
    if (!s) return;
    s.style.transform = `translate3d(${(f.x - sw / 2).toFixed(1)}px,${(f.y - sh / 2 + bob).toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;
  };

  const atMark = () => {
    f.x = TAKEOFF[0] * W;
    f.y = TAKEOFF[1] * H;
    f.vx = 0;
    f.vy = 0;
  };

  /** Opacity on one layer: a fade with motion on, a set with motion off. */
  const fade = (el: HTMLElement | null, to: 0 | 1, ms: number) => {
    if (!el) return;
    const from = Number(getComputedStyle(el).opacity) || 0;
    el.style.opacity = String(to);
    if (!motionOffNow() && from !== to)
      el.animate([{ opacity: from }, { opacity: to }], {
        duration: ms,
        easing: "ease-out",
      });
  };

  const steer = (): Steer => {
    if (ptr) return { kind: "pointer", tx: ptr.x, ty: ptr.y };
    const ax = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
    const ay = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    return ax || ay ? { kind: "keys", ax, ay } : { kind: "none" };
  };

  const loop = () => {
    if (!raf && inView && visible && (phase === "flying" || phase === "landing")) raf = requestAnimationFrame(frame);
  };
  /** Restart after a stop (hidden tab, off-view): no catch-up step. */
  const resume = () => {
    if (raf) return;
    last = performance.now();
    loop();
  };

  function frame(now: number) {
    raf = 0;
    const real = Math.max(0, Math.min((now - last) / 1000, 0.25));
    const dt = Math.min(real, PHYS.dtMax);
    last = now;
    t += real;
    if (phase === "flying") {
      flown += real * 1000;
      const x0 = f.x;
      const y0 = f.y;
      step(f, steer(), dt, W, H, sw / 2, sh / 2);
      if (next < GATE_COUNT && passes(next, x0, y0, f.x, f.y, W, H)) pass();
      if (phase === "flying") {
        const c = Math.floor(flown / 100);
        if (c !== lastClock) {
          lastClock = c;
          set.clock(c * 100);
        }
        if (hum && now - lastHum > 90) {
          lastHum = now;
          hum.set({ rate: 1 + 0.78 * speedShare(f, W) });
        }
        draw(bobOf(t, W), tiltOf(f, W));
      }
    } else if (phase === "landing" && glide) {
      const k = Math.min(1, (now - glide.t0) / PHYS.landMs);
      const e = easeInOut(k);
      f.x = glide.x0 + (TAKEOFF[0] * W - glide.x0) * e;
      f.y = glide.y0 + (TAKEOFF[1] * H - glide.y0) * e;
      draw(bobOf(t, W) * (1 - k), 0);
      if (k >= 1) {
        end(glide.reason);
        return;
      }
    }
    loop();
  }

  function pass() {
    next += 1;
    set.gates(next);
    emit("game:gate", { n: next });
    if (next < GATE_COUNT) {
      set.say(copy.gates[next - 1] ?? "");
      return;
    }
    // gate 7: the course is flown
    const ms = flown;
    const rec = recordDroneCourse(ms);
    set.result({ ms, best: rec.best });
    set.clock(ms);
    set.say(`${copy.gates[GATE_COUNT - 1] ?? ""}. ${fill(copy.score, { n: GATE_COUNT, s: secs(ms) })}`);
    emit("game:finish", { game: "drone", score: Math.round(ms) });
    land("finish", true);
  }

  /** Back to the mark: a 600 ms glide, or at once (Pause, motion off). */
  function land(reason: string, withGlide: boolean) {
    if (phase === "landing" && !withGlide) {
      end(reason);
      return;
    }
    if (phase !== "flying") return;
    keys.l = keys.r = keys.u = keys.d = false;
    ptr = null;
    if (!withGlide || motionOffNow()) {
      end(reason);
      return;
    }
    glide = { x0: f.x, y0: f.y, t0: performance.now(), reason };
    hum?.set({ rate: 1 });
    go("landing");
    resume();
  }

  function end(reason: string) {
    if (phase !== "flying" && phase !== "landing") return;
    cancelAnimationFrame(raf);
    raf = 0;
    glide = null;
    hum?.stop();
    hum = null;
    atMark();
    draw(0, 0);
    const hadFocus = Boolean(r.field.current?.contains(document.activeElement));
    fade(r.board.current, 0, 300);
    fade(r.sprite.current, 0, 300);
    if (document.documentElement.getAttribute("data-game") === "drone") document.documentElement.removeAttribute("data-game");
    go(next === GATE_COUNT ? "done" : "idle");
    emit("game:stop", { game: "drone", reason });
    if (hadFocus) r.pill.current?.focus({ preventScroll: true });
  }

  function takeOff() {
    if (phase === "flying" || phase === "landing") {
      // the pill again mid-flight: land
      land("pill", true);
      return;
    }
    if (motionOffNow()) {
      plan(phase !== "plan");
      return;
    }
    if (!measure()) return;
    // a take-off with the band under half in view (a press after scrolling
    // past it): bring it to the middle first; the flight starts at once
    const b = r.box.current?.getBoundingClientRect();
    if (b && Math.max(0, Math.min(b.bottom, window.innerHeight) - Math.max(b.top, 0)) < b.height / 2 && r.box.current) {
      void scrollToTarget(r.box.current, { block: "center" });
    }
    next = 0;
    flown = 0;
    t = 0;
    lastClock = -1;
    set.gates(0);
    set.clock(0);
    set.result(null);
    set.say("");
    atMark();
    draw(0, 0);
    document.documentElement.setAttribute("data-game", "drone");
    go("flying");
    emit("game:start", { game: "drone" });
    hum = sound.loop("drone-hum", { rate: 1 });
    fade(r.board.current, 1, 300);
    fade(r.sprite.current, 1, 200);
    resume();
  }

  /** Motion off: the static labelled course (and the note), or close it. */
  function plan(open: boolean) {
    if (phase === "flying" || phase === "landing") return;
    if (open) {
      measure();
      atMark();
      draw(0, 0);
      if (r.board.current) r.board.current.style.opacity = "1";
      if (r.sprite.current) r.sprite.current.style.opacity = "1";
      go("plan");
      return;
    }
    if (r.board.current) r.board.current.style.opacity = "0";
    if (r.sprite.current) r.sprite.current.style.opacity = "0";
    go("idle");
  }

  /* — the world around the flight ——————————————————————————————————— */
  const io = new IntersectionObserver(
    ([e]) => {
      const ratio = e?.isIntersecting ? e.intersectionRatio : 0;
      inView = ratio > 0;
      // the band below 50 % visible: land (no capture, no fight)
      if (phase === "flying" && ratio < 0.5) land("offscreen", true);
      else if (inView) resume();
    },
    { threshold: [0, 0.5] },
  );
  if (r.box.current) io.observe(r.box.current);
  const ro = new ResizeObserver(() => {
    if (phase !== "idle" && measure()) draw(0, 0);
  });
  if (r.box.current) ro.observe(r.box.current);
  const onVis = () => {
    visible = document.visibilityState !== "hidden";
    if (visible) resume();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
      keys.l = keys.r = keys.u = keys.d = false;
    }
  };
  document.addEventListener("visibilitychange", onVis);
  // Pause / reduced motion: land at once
  const offMotion = onMotionOffChange(() => {
    if (motionOffNow()) land("pause", false);
  });

  /** Presses already answered by THIS controller (a remount, e.g. React's
   *  dev double effects, answers the current press again). */
  let answered = 0;

  return {
    /** Answer press `n` of the pill: take off, land, or the flight plan. */
    request(n: number) {
      if (n <= answered) return;
      answered = n;
      takeOff();
    },
    key(k: string, down: boolean): boolean {
      const d = keyOf(k);
      if (!d || phase !== "flying") return false;
      keys[d] = down;
      return true;
    },
    esc(): boolean {
      if (phase === "flying") {
        land("esc", true);
        return true;
      }
      if (phase === "plan") {
        plan(false);
        r.pill.current?.focus({ preventScroll: true });
        return true;
      }
      return false;
    },
    blur() {
      keys.l = keys.r = keys.u = keys.d = false;
    },
    point(x: number, y: number) {
      if (phase === "flying") ptr = { x, y };
    },
    release() {
      ptr = null;
    },
    destroy() {
      land("unmount", false);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      offMotion();
    },
  };
}

type Controller = ReturnType<typeof controller>;

export default function DroneGame({
  run,
  box,
  pill,
  copy,
  variant,
  sprite,
}: {
  /** Presses of "▲ Take off" (each one takes off, lands, or opens the plan). */
  run: number;
  /** The band's picture box (the field covers it). */
  box: RefObject<HTMLDivElement | null>;
  /** The pill (focus returns to it on landing). */
  pill: RefObject<HTMLButtonElement | null>;
  copy: DroneCopy;
  /** `systems.drone`: "default" chalk-sprite, "alt" blueprint. */
  variant: Variant;
  /** The sprite for the variant (a static import's URL). */
  sprite: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [gates, setGates] = useState(0);
  const [clock, setClock] = useState(0);
  const [said, setSaid] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const field = useRef<HTMLDivElement>(null);
  const spriteEl = useRef<HTMLImageElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const planEl = useRef<HTMLDivElement>(null);
  const ctl = useRef<Controller | null>(null);
  const helpId = useId();

  useEffect(() => {
    const c = controller({ box, field, sprite: spriteEl, board, pill }, copy, {
      phase: setPhase,
      gates: setGates,
      clock: setClock,
      say: setSaid,
      result: setResult,
    });
    ctl.current = c;
    return () => {
      c.destroy();
      ctl.current = null;
    };
  }, [box, pill, copy]);

  // each press of the pill (the first one mounted this chunk); declared
  // after the controller's effect, so it runs after it on every mount
  useEffect(() => {
    ctl.current?.request(run);
  }, [run]);

  // focus follows the game: into the field on take-off, onto the plan
  useEffect(() => {
    if (phase === "flying") field.current?.focus({ preventScroll: true });
    else if (phase === "plan") planEl.current?.focus({ preventScroll: true });
  }, [phase]);

  const local = (e: PointerEvent<HTMLDivElement>) => {
    const b = box.current?.getBoundingClientRect();
    return b ? { x: e.clientX - b.left, y: e.clientY - b.top } : null;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>, down: boolean) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (down && e.key === "Escape") {
      if (ctl.current?.esc()) e.preventDefault();
      return;
    }
    if (ctl.current?.key(e.key, down)) e.preventDefault();
    // Space would page the band away mid-flight: inside the field it does nothing
    else if (e.key === " ") e.preventDefault();
  };

  const flying = phase === "flying" || phase === "landing";
  const score = (n: number, ms: number) => fill(copy.score, { n, s: secs(ms) });

  return (
    <>
      <div className="drone-game" data-phase={phase} data-variant={variant}>
        {/* the board and its course stay mounted once the game is (the board
            is transparent at rest), so a landing fades them out together */}
        <div ref={board} className="drone-board" aria-hidden="true">
          <svg className="drone-course" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" focusable="false">
            {Array.from({ length: GATE_COUNT }, (_, i) => {
              const x = gateX(i) * VB_W;
              const [a, b] = gateSpan(i);
              const top = a * VB_H;
              const bot = b * VB_H;
              const state = phase === "plan" ? "todo" : i < gates ? "done" : i === gates ? "next" : "todo";
              return (
                <g key={i} data-state={state}>
                  <path
                    d={`M${x} ${top - POST} L${x} ${top} M${x - BAR} ${top} L${x + BAR} ${top} M${x} ${bot + POST} L${x} ${bot} M${x - BAR} ${bot} L${x + BAR} ${bot}`}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
          {Array.from({ length: GATE_COUNT }, (_, i) => (
            <span
              key={i}
              className="drone-label tnum"
              data-state={phase === "plan" ? "todo" : i < gates ? "done" : i === gates ? "next" : "todo"}
              style={{
                left: `${gateX(i) * 100}%`,
                top: `${((gateSpan(i)[0] * VB_H - POST) / VB_H) * 100}%`,
              }}
            >
              {pad(i + 1)}
            </span>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- a pre-rasterized sprite moved by transform every frame (spec §9.2 #2) */}
        <img
          ref={spriteEl}
          className="drone-sprite"
          src={sprite}
          width={192}
          height={134}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
        />

        {flying ? (
          <div
            ref={field}
            className="drone-field"
            role="application"
            aria-label={copy.cmd}
            aria-describedby={helpId}
            tabIndex={0}
            onKeyDown={(e) => onKey(e, true)}
            onKeyUp={(e) => onKey(e, false)}
            onBlur={() => ctl.current?.blur()}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.focus({ preventScroll: true });
              const p = local(e);
              if (p) ctl.current?.point(p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const p = local(e);
              if (p) ctl.current?.point(p.x, p.y);
            }}
            onPointerUp={() => ctl.current?.release()}
            onPointerCancel={() => ctl.current?.release()}
            onLostPointerCapture={() => ctl.current?.release()}
          />
        ) : null}
        <p id={helpId} className="sr-only">
          {copy.help}
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {said}
        </p>

        {phase === "plan" ? (
          <div
            ref={planEl}
            className="drone-panel drone-plan"
            role="group"
            aria-label={copy.rm}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape" && ctl.current?.esc()) e.preventDefault();
            }}
          >
            <p className="type-meta text-fg">{copy.rm}</p>
            <ol className="mt-2 type-small text-fg-muted">
              {copy.titles.map((title, i) => (
                <li key={i}>
                  <span className="tnum text-fg">{pad(i + 1)}</span> {title}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {phase === "done" && result ? (
          <div className="drone-panel drone-result">
            <p className="tnum type-meta text-fg">{score(GATE_COUNT, result.ms)}</p>
            {copy.best ? <p className="tnum type-meta text-fg-muted">{fill(copy.best, { s: secs(result.best) })}</p> : null}
            <a href="#kill-list" className="drone-next type-meta">
              {copy.next}
            </a>
          </div>
        ) : null}
      </div>

      {flying ? (
        <StageLayerPortal layer="game-hud">
          <div className="drone-hud" aria-hidden="true" data-house-type="">
            <p className="tnum type-meta text-fg">{score(gates, clock)}</p>
            <p className="type-small text-fg-muted">{copy.help}</p>
          </div>
        </StageLayerPortal>
      ) : null}
    </>
  );
}
