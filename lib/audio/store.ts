/* ============================================================================
   SOUND STORE — on/off for this visit (PHASE3-SPEC §3.5, §10.4; P3-9).
   The STATIC half (DP-13: in the header on every device, so it stays
   tiny): the snapshot, the visitor's wish and the AudioContext creation,
   which must happen synchronously inside the click. Everything else
   (running / suspending, the nox grace, the first press after a reload,
   the engine) lives in the lazy lib/audio/store-impl.ts and
   lib/audio/engine.ts, loaded together by the first unmute.

   - `useSound()` is a useSyncExternalStore: the server and the hydration
     render are { on: false, available: false }; the client value arrives
     one render later. `on` = the visitor wants sound AND it can play (motion
     on); `available` = Web Audio exists AND motion is on (RM / Pause disable
     the toggle).
   - Persisted in sessionStorage "sound" (try/catch, lib/session.ts), so
     every new visit starts muted. A reload in the same tab keeps "on": the
     lazy half then arms the first pointer / key press anywhere (browsers
     allow audio only after a gesture; scrolling is not one).
   - The AudioContext is created ONLY inside a gesture: the first unmute
     click (setSoundOn), the director's cut click (borrowSound) or that
     first press after a reload. Hovering or focusing the toggle may
     prefetch the chunks (JS only, no audio bytes, no context).
   - Pause, OS reduced motion or a hidden tab: the engine silences the
     master at once and the context suspends 40 ms later (< 100 ms);
     resuming plays again only if sound is on.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit } from "../events";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "../flags";
import { readSession, writeSession } from "../session";
import type { Engine } from "./engine";
import type { StoreImpl } from "./store-impl";

export type SoundState = { on: boolean; available: boolean };

const OFF: SoundState = { on: false, available: false };
const listeners = new Set<() => void>();
const engineHooks: ((e: Engine) => void)[] = [];
let snap: SoundState = OFF;
/** The visitor's wish (null = not read from storage yet). */
let want: boolean | null = null;
/** Set while the director's cut has turned sound on for its duration. */
let borrowToken: object | null = null;
let ctx: AudioContext | null = null;
let engine: Engine | null = null;
let impl: StoreImpl | null = null;
let implLoad: Promise<StoreImpl | null> | null = null;
let wired = false;

function ctor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

const wants = (): boolean => (want ??= readSession("sound") === "on");

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

/** Create (or resume) the context. Only ever called inside a gesture. */
function ensureContext(): AudioContext | null {
  const AC = ctor();
  if (!ctx && AC) {
    try {
      ctx = new AC({ latencyHint: "interactive" });
    } catch {
      return null;
    }
  }
  if (ctx && ctx.state !== "running" && !motionOffNow()) void ctx.resume().catch(() => {});
  return ctx;
}

/** The lazy half (and the engine chunk in parallel when a context exists). */
function loadImpl(): Promise<StoreImpl | null> {
  if (ctx) void import("./engine").catch(() => {});
  implLoad ??= import("./store-impl").then(
    (m) =>
      (impl = m.init({
        ctx: () => ctx,
        ensure: ensureContext,
        wants,
        ready(e) {
          engine = e;
          engineHooks.splice(0).forEach((h) => h(e));
        },
      })),
    () => (implLoad = null),
  );
  return implLoad;
}

function wire(): void {
  if (wired || typeof window === "undefined") return;
  wired = true;
  onMotionOffChange(() => {
    impl?.motion();
    notify();
  });
  // A reload with sound on: the lazy half arms the first press (no context yet).
  if (wants() && window.matchMedia(DESKTOP_FINE).matches) void loadImpl();
}

function turn(on: boolean, persist: boolean): Promise<void> {
  if (on) ensureContext(); // synchronously, inside the click
  wire();
  want = on;
  if (persist) writeSession("sound", on ? "on" : null);
  notify();
  emit("sound:change", { on: compute().on });
  if (!ctx) return Promise.resolve();
  return loadImpl().then((i) => i?.turn(on, persist));
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

/** Turn sound on or off for this visit. Call it from the click itself: the
 *  first `true` creates the AudioContext inside that gesture. Under RM or
 *  Pause (the toggle is disabled) it does nothing. */
export function setSoundOn(on: boolean): Promise<void> {
  if (!ctor() || (on && motionOffNow())) return Promise.resolve();
  borrowToken = null;
  return turn(on, true);
}

/** The director's cut (spec §11.1): its click is consent. If muted, unmute
 *  for its duration (not persisted) and resolve to `restore`, which mutes
 *  again unless the visitor changed sound in between. Call it from the
 *  click and AWAIT it before emitting dc:start (the engine, which voices
 *  dc:start, exists once it resolves). */
export function borrowSound(): Promise<() => void> {
  const noop = () => {};
  if (!ctor() || motionOffNow() || wants()) return Promise.resolve(noop);
  const token = {};
  borrowToken = token;
  return turn(true, false).then(() => () => {
    if (borrowToken !== token) return;
    borrowToken = null;
    void turn(false, false);
  });
}

/** Prefetch both lazy chunks (hover / focus on the toggle). No context. */
export function preloadSound(): void {
  void import("./engine").catch(() => {});
  void import("./store-impl").catch(() => {});
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
