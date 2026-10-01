/* ============================================================================
   SOUND STORE — on/off for this visit (PHASE3-SPEC §3.5, §10.4; P3-9).
   Static and small: everything that makes sound lives in the lazy engine
   (lib/audio/engine.ts), loaded only after the first unmute.

   - `useSound()` is a useSyncExternalStore: the server and the hydration
     render are { on: false, available: false }; the client value arrives
     one render later. `on` = the visitor wants sound AND it can play (motion
     on); `available` = Web Audio exists AND motion is on (RM / Pause disable
     the toggle).
   - Persisted in sessionStorage "sound" (try/catch, lib/session.ts), so
     every new visit starts muted. A reload in the same tab keeps "on": the
     context is then created on the first pointer / key press anywhere
     (browsers allow audio only after a gesture; scrolling is not one).
   - The AudioContext is created ONLY inside a gesture: the first unmute
     click (setSoundOn), the director's cut click (borrowSound) or that
     first press after a reload. The engine chunk loads then; hovering or
     focusing the toggle may prefetch the chunk (JS only, no audio bytes).
   - Pause, OS reduced motion or a hidden tab: the engine silences the
     master at once and the context suspends 40 ms later (< 100 ms);
     resuming plays again only if sound is on.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit } from "../events";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "../flags";
import { readSession, writeSession } from "../session";
import type { Engine } from "./engine";

export type SoundState = { on: boolean; available: boolean };

const KEY = "sound";
const OFF: SoundState = { on: false, available: false };
const SUSPEND_MS = 40;

const listeners = new Set<() => void>();
let snap: SoundState = OFF;
/** The visitor's wish (null = not read from storage yet). */
let want: boolean | null = null;
/** Set while the director's cut has turned sound on for its duration. */
let borrowToken: object | null = null;
let ctx: AudioContext | null = null;
let engine: Engine | null = null;
let engineLoad: Promise<Engine | null> | null = null;
let suspendTimer = 0;
let graceUntil = 0;
let graceTimer = 0;
let wired = false;
const engineHooks: ((e: Engine) => void)[] = [];

type AudioContextCtor = typeof AudioContext;

function ctor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitAudioContext?: AudioContextCtor };
  return typeof w.AudioContext === "function" ? w.AudioContext : (w.webkitAudioContext ?? null);
}

function wants(): boolean {
  if (want === null) want = readSession(KEY) === "on";
  return want;
}

function compute(): SoundState {
  const available = ctor() !== null && !motionOffNow();
  const on = available && wants();
  if (snap.on !== on || snap.available !== available) snap = { on, available };
  return snap;
}

function notify(): void {
  compute();
  listeners.forEach((l) => l());
}

/* — Running: on, motion on (or the nox grace), tab visible ————————————— */

function shouldRun(): boolean {
  if (!ctx || !wants()) return false;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
  return !motionOffNow() || performance.now() < graceUntil;
}

function sync(): void {
  if (!ctx) return;
  const run = shouldRun();
  window.clearTimeout(suspendTimer);
  if (run) {
    if (ctx.state !== "running") void ctx.resume().catch(() => {});
    engine?.setRunning(true);
  } else {
    engine?.setRunning(false);
    const c = ctx;
    suspendTimer = window.setTimeout(() => {
      if (!shouldRun() && c.state === "running") void c.suspend().catch(() => {});
    }, SUSPEND_MS);
  }
}

function wire(): void {
  if (wired || typeof window === "undefined") return;
  wired = true;
  onMotionOffChange(() => {
    sync();
    notify();
  });
  armGesture();
}

/* — Context + engine (only ever inside a gesture) ——————————————————— */

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const AC = ctor();
  if (!AC) return null;
  try {
    ctx = new AC({ latencyHint: "interactive" });
  } catch {
    return null;
  }
  document.addEventListener("visibilitychange", sync);
  return ctx;
}

function loadEngine(): Promise<Engine | null> {
  if (!engineLoad) {
    engineLoad = import("./engine").then(
      (m) => {
        if (!ctx) return null;
        engine = m.createEngine(ctx, { grace });
        engineHooks.forEach((h) => h(engine as Engine));
        sync();
        return engine;
      },
      () => {
        engineLoad = null;
        return null;
      },
    );
  }
  return engineLoad;
}

/** Keep sound running `ms` longer although motion just went off. */
function grace(ms: number): void {
  graceUntil = performance.now() + ms;
  window.clearTimeout(graceTimer);
  graceTimer = window.setTimeout(sync, ms + 5);
  sync();
}

/** Create (or resume) the context inside the current gesture, then load
 *  the engine. Resolves when it is ready (null without Web Audio). */
function start(): Promise<Engine | null> {
  const c = ensureContext();
  if (!c) return Promise.resolve(null);
  if (c.state !== "running" && !motionOffNow()) void c.resume().catch(() => {});
  return loadEngine();
}

/** A reload with sound on: the first pointer / key press brings it back. */
let armed = false;
function armGesture(): void {
  if (armed || ctx || !wants() || !window.matchMedia(DESKTOP_FINE).matches) return;
  armed = true;
  const go = (e: Event) => {
    const t = e.target;
    if (t instanceof Element && t.closest("[data-sound-toggle]")) return;
    if (!wants() || motionOffNow()) return;
    void start();
    const c = ctx;
    if (!c) return;
    void c.resume().then(
      () => {
        if (c.state !== "running") return;
        window.removeEventListener("pointerdown", go, true);
        window.removeEventListener("keydown", go, true);
      },
      () => {},
    );
  };
  window.addEventListener("pointerdown", go, true);
  window.addEventListener("keydown", go, true);
}

/* — Public ———————————————————————————————————————————————————————————— */

function subscribe(onChange: () => void): () => void {
  wire();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useSound(): SoundState {
  return useSyncExternalStore(subscribe, compute, () => OFF);
}

/** Non-hook read (effects, handlers). */
export function soundState(): SoundState {
  return typeof window === "undefined" ? OFF : compute();
}

function turn(on: boolean, persist: boolean): Promise<void> {
  wire();
  want = on;
  if (persist) writeSession(KEY, on ? "on" : null);
  notify();
  emit("sound:change", { on: compute().on });
  if (!on) {
    sync();
    return Promise.resolve();
  }
  return start().then((e) => {
    sync();
    // One soft click confirms the visitor's own unmute (not the cut's).
    if (persist) e?.cue("toggle-click");
  });
}

/** Turn sound on or off for this visit. Call it from the click itself: the
 *  first `true` creates the AudioContext inside that gesture. Under RM or
 *  Pause (the toggle is disabled) it does nothing. */
export function setSoundOn(on: boolean): Promise<void> {
  if (typeof window === "undefined" || !ctor()) return Promise.resolve();
  if (on && motionOffNow()) return Promise.resolve();
  borrowToken = null;
  return turn(on, true);
}

/** The director's cut (spec §11.1): its click is consent. If muted, unmute
 *  for its duration (not persisted) and resolve to `restore`, which mutes
 *  again unless the visitor changed sound in between. Call it from the
 *  click. */
export function borrowSound(): Promise<() => void> {
  const noop = () => {};
  if (typeof window === "undefined" || !ctor() || motionOffNow() || wants()) return Promise.resolve(noop);
  const token = {};
  borrowToken = token;
  return turn(true, false).then(() => () => {
    if (borrowToken !== token) return;
    borrowToken = null;
    void turn(false, false);
  });
}

/** Prefetch the engine chunk (hover / focus on the toggle). No context. */
export function preloadSound(): void {
  void import("./engine").catch(() => {});
}

/** The engine once loaded (null until the first unmute). */
export function soundEngine(): Engine | null {
  return engine;
}

/** Run `fn` with the engine as soon as it exists (now if it does). */
export function onSoundEngine(fn: (e: Engine) => void): void {
  if (engine) fn(engine);
  else engineHooks.push(fn);
}
