/* ============================================================================
   SOUND STORE (lazy half) — running, suspending and the engine
   (PHASE3-SPEC §3.5; DP-13). Loaded by lib/audio/store.ts with the engine
   chunk on the first unmute (or, after a reload with sound on, to arm the
   first press). Framework-free.

   - Runs while the visitor wants sound, the tab is visible and motion is
     on. Otherwise the engine silences the master at once and the context
     suspends 40 ms later (< 100 ms, P3-9 #3).
   - The nox grace: the typed / palette "nox" pauses motion and must still
     be heard, so the effects (never the beds) stay up for 1.5 s. Never
     under the OS reduced-motion preference, which wins at once.
   - The first press after a reload with sound on creates the context, but
     never the Pause control or the toggle itself (plan §0.1 #8).
   ========================================================================== */

import { DESKTOP_FINE, motionOffNow } from "../flags";
import type { Engine } from "./engine";

export type Host = {
  ctx(): AudioContext | null;
  /** Create / resume the context (inside a gesture only). */
  ensure(): AudioContext | null;
  wants(): boolean;
  ready(e: Engine): void;
};

export type StoreImpl = {
  /** After the static half changed the wish: start or silence. `click` =
   *  the visitor's own unmute (one soft click confirms it). */
  turn(on: boolean, click: boolean): Promise<void>;
  /** Motion went on or off (OS reduced motion or Pause). */
  motion(): void;
};

const SUSPEND_MS = 40;
const RM = "(prefers-reduced-motion: reduce)";

export function init(h: Host): StoreImpl {
  let engine: Engine | null = null;
  let engineLoad: Promise<Engine | null> | null = null;
  let suspendTimer = 0;
  let graceUntil = 0;
  let graceTimer = 0;
  /** When motion last went from on to off (performance.now). */
  let motionOffAt = -1e9;
  let motionWasOff = motionOffNow();
  let visWired = false;

  const rmNow = () => window.matchMedia(RM).matches;

  function shouldRun(): boolean {
    if (!h.ctx() || !h.wants() || document.visibilityState === "hidden") return false;
    if (!motionOffNow()) return true;
    // Motion is off: only the nox grace, and never under OS reduced motion.
    return !rmNow() && performance.now() < graceUntil;
  }

  function sync(): void {
    const ctx = h.ctx();
    if (!ctx) return;
    if (!visWired) {
      visWired = true;
      document.addEventListener("visibilitychange", sync);
    }
    window.clearTimeout(suspendTimer);
    if (shouldRun()) {
      if (ctx.state !== "running") void ctx.resume().catch(() => {});
      // In the grace (motion already off) only the effects play.
      engine?.setRunning(true, motionOffNow());
    } else {
      engine?.setRunning(false);
      suspendTimer = window.setTimeout(() => {
        if (!shouldRun() && ctx.state === "running") void ctx.suspend().catch(() => {});
      }, SUSPEND_MS);
    }
  }

  /** Keep the effects running `ms` longer although motion is going off:
   *  only for the Pause that this very spell causes (motion on now, or
   *  switched off in the last 150 ms), never under OS reduced motion. */
  function grace(ms: number): void {
    const now = performance.now();
    if (rmNow() || (motionOffNow() && now - motionOffAt > 150)) return;
    graceUntil = now + ms;
    window.clearTimeout(graceTimer);
    graceTimer = window.setTimeout(sync, ms + 5);
    sync();
  }

  function loadEngine(): Promise<Engine | null> {
    engineLoad ??= import("./engine").then(
      (m) => {
        const ctx = h.ctx();
        if (!ctx) return null;
        engine = m.createEngine(ctx, { grace });
        sync(); // running first, so the cues held by the facade can play
        h.ready(engine);
        return engine;
      },
      () => (engineLoad = null),
    );
    return engineLoad;
  }

  /** A reload with sound on: the first pointer / key press brings it back. */
  function armGesture(): void {
    if (h.ctx() || !h.wants() || !window.matchMedia(DESKTOP_FINE).matches) return;
    const go = (e: Event) => {
      const t = e.target;
      if (t instanceof Element && t.closest("[data-sound-toggle], [data-motion-toggle]")) return;
      if (!h.wants() || motionOffNow()) return;
      const c = h.ensure();
      if (!c) return;
      void loadEngine();
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
  armGesture();

  return {
    turn(on, click) {
      if (!on) {
        sync();
        return Promise.resolve();
      }
      h.ensure();
      return loadEngine().then(async (e) => {
        sync();
        const ctx = h.ctx();
        // One soft click confirms the visitor's own unmute (not the cut's),
        // once the context is really running (some engines start it async).
        if (!click || !e || !ctx || !shouldRun()) return;
        await ctx.resume().catch(() => {});
        if (shouldRun()) e.cue("toggle-click");
      });
    },
    motion() {
      const off = motionOffNow();
      if (off && !motionWasOff) motionOffAt = performance.now();
      motionWasOff = off;
      sync();
    },
  };
}
