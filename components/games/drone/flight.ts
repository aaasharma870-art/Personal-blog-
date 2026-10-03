/* ============================================================================
   FLY THE HOMEMADE DRONE · the flight controller (PHASE3-SPEC §9.2 #2) —
   OWNER: W3-GAMES. Plain closures over the game's refs: no React per frame
   (the component, drone-game.tsx, renders the phases and wires the input).
   One flight: take-off from the mark, the physics step per frame, the gates
   in order, the live-region lines, the score, the landing glide, and the
   world around it (in view, the tab visible, Pause / reduced motion and the
   fast lane land at once, the band below 50 % visible lands it, the band
   fully out of view ends a landing at once). See drone-game.tsx's header
   for the whole behaviour.
   ========================================================================== */

import type { RefObject } from "react";
import { sound, type SoundLoop } from "@/lib/audio";
import { emit, on } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { GATE_COUNT, TAKEOFF, passes } from "@/components/games/drone/course";
import { PHYS, bobOf, speedShare, step, tiltOf, type Flight, type Steer } from "@/components/games/drone/physics";
import { fill, secs, type DroneCopy } from "@/components/games/shared";
import { recordDroneCourse } from "@/components/games/store";

export type Phase = "idle" | "flying" | "landing" | "done" | "plan";
export type Result = { ms: number; best: number };

/** The sprite's width as a share of the band, and its aspect (192 × 134). */
export const SPRITE_W = 0.055;
export const SPRITE_ASPECT = 134 / 192;

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

export type Setters = {
  phase(p: Phase): void;
  gates(n: number): void;
  clock(ms: number): void;
  say(s: string): void;
  result(r: Result | null): void;
};

export type Refs = {
  /** The game's own layer (`.drone-game`: its data-phase is the phase). */
  game: RefObject<HTMLDivElement | null>;
  box: RefObject<HTMLDivElement | null>;
  field: RefObject<HTMLDivElement | null>;
  sprite: RefObject<HTMLImageElement | null>;
  board: RefObject<HTMLDivElement | null>;
  pill: RefObject<HTMLButtonElement | null>;
};

/** The flight controller: plain closures over refs, no React per frame. */
export function flightController(r: Refs, copy: DroneCopy, set: Setters) {
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
  /** A take-off's centring scroll in progress (the observer does not judge
   *  the band's share until it ends), and which take-off started it. */
  let centering = false;
  let centerSeq = 0;
  let visible = document.visibilityState !== "hidden";
  const keys: Record<Key, boolean> = { l: false, r: false, u: false, d: false };
  let ptr: { x: number; y: number } | null = null;
  let hum: SoundLoop | null = null;
  let glide: { x0: number; y0: number; t0: number; reason: string } | null = null;

  const go = (p: Phase) => {
    phase = p;
    // the layer's phase now, in this task (its CSS and the probes read it;
    // React renders the same value with the state below, which may land a
    // task later when the game's root is not the one handling the event)
    r.game.current?.setAttribute("data-phase", p);
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

  /** The band's visible share now (a layout read: only at a take-off and
   *  at the end of its centring scroll, never per frame or under Pause). */
  const shareNow = (): number => {
    const b = r.box.current?.getBoundingClientRect();
    return b && b.height ? Math.max(0, Math.min(b.bottom, window.innerHeight) - Math.max(b.top, 0)) / b.height : 0;
  };

  const atMark = () => {
    f.x = TAKEOFF[0] * W;
    f.y = TAKEOFF[1] * H;
    f.vx = 0;
    f.vy = 0;
  };

  /** The running opacity fade per layer (cancelled by the next one). */
  const fades = new WeakMap<HTMLElement, Animation>();
  /** Opacity on one layer: a fade with motion on; with motion off (Pause,
   *  reduced motion) a plain set with NO style read, so the Pause click never
   *  forces the restyle html[data-motion] has just invalidated. */
  const fade = (el: HTMLElement | null, to: 0 | 1, ms: number) => {
    if (!el) return;
    const off = motionOffNow();
    // the fade's start is read before the running one is cancelled (motion on)
    const from = off ? to : Number(getComputedStyle(el).opacity) || 0;
    fades.get(el)?.cancel();
    fades.delete(el);
    el.style.opacity = String(to);
    if (!off && from !== to) fades.set(el, el.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: "ease-out" }));
  };

  const steer = (): Steer => {
    if (ptr) return { kind: "pointer", tx: ptr.x, ty: ptr.y };
    const ax = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
    const ay = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    return ax || ay ? { kind: "keys", ax, ay } : { kind: "none" };
  };

  // a flight runs in view; a landing glide finishes even off-view (the band
  // scrolled away mid-glide: its HUD, hum and data-game must still end)
  const loop = () => {
    if (!raf && visible && (phase === "landing" || (phase === "flying" && inView))) raf = requestAnimationFrame(frame);
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
    // focus comes home to the pill (the fast lane moves it to #work itself).
    // Pause: on the next frame, so the click never forces the restyle that
    // html[data-motion] has just invalidated (focus() flushes style)
    if (!hadFocus || reason === "fastlane") return;
    const home = () => {
      const a = document.activeElement;
      if (!a || a === document.body || r.field.current?.contains(a)) r.pill.current?.focus({ preventScroll: true });
    };
    if (reason === "pause") requestAnimationFrame(home);
    else home();
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
    // past it): bring it to the middle first; the flight starts at once, and
    // the visible share is judged only once the centring scroll has ended
    // (else the observer's first report would land it straight away)
    if (r.box.current && shareNow() < 0.5) {
      const n = ++centerSeq;
      centering = true;
      void scrollToTarget(r.box.current, { block: "center" }).finally(() => {
        if (n !== centerSeq) return;
        centering = false;
        if (phase !== "flying") return;
        // measured, not the observer's last report (it may be a frame old);
        // the visitor may also have scrolled away during the scroll
        const share = shareNow();
        if (share === 0) land("offscreen", false);
        else if (share < 0.5) land("offscreen", true);
        else resume();
      });
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
      if (centering) {
        if (inView) resume();
        return;
      }
      // the band fully out of view (a fast wheel past it, mid-flight or
      // mid-glide): land at once, so no HUD, hum or data-game outlives it
      if (ratio === 0 && (phase === "flying" || phase === "landing")) {
        land("offscreen", false);
        return;
      }
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
    else if (phase === "landing") {
      // a hidden tab never runs the glide's frames: end it now
      end(glide?.reason ?? "hidden");
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      keys.l = keys.r = keys.u = keys.d = false;
    }
  };
  document.addEventListener("visibilitychange", onVis);
  // Pause / reduced motion: land at once, in this task, with the stop-at-once
  // set (before html[data-motion] restyles the page). The loop and the hum
  // stop synchronously; end() reads no layout on this path, and the
  // game:stop listeners only schedule frames.
  const offMotion = onMotionOffChange(
    () => {
      if (motionOffNow()) land("pause", false);
    },
    { first: true },
  );
  // the fast lane (spec §11.3) stops any game
  const offFast = on("fastlane", () => land("fastlane", false));

  /** Presses already answered by THIS controller. A fresh controller
   *  answers the press that mounted it: the games binder mounts the game
   *  only on a press, and drops it on leaving DESKTOP_FINE, so a remount
   *  never replays an old press by itself. */
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
      offFast();
    },
  };
}

export type FlightController = ReturnType<typeof flightController>;
