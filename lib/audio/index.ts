/* ============================================================================
   SOUND (facade) — the page's sound API (PHASE3-SPEC §3.5, §10; DP-13).
   Tiny and static: every call forwards to the lazy engine once it exists
   (lib/audio/engine.ts, loaded by the first unmute; lib/audio/store.ts).
   While muted, `cue` is a no-op; `bed` and `loop` remember what they asked
   for, so a later unmute starts the right bed and any live loop. In the
   moment between an unmute (or `borrow()`) and the engine's arrival, `cue`
   holds the request and plays it when the engine lands (≤ 1 s late).

   The engine already voices the page events (impact, transition:meet,
   letterbox, hunt:found, egg:trigger, game:*, toy, post-credits, dc:*; see
   lib/audio/cues.ts). Call `sound.cue` only for sounds no event carries
   (e.g. "typewriter-click", "title-sting", "tts-mischief" on the map close).
   ========================================================================== */

import type { BedId, CueId } from "./cues";
import type { Engine } from "./engine";
import { borrowSound, onSoundEngine, soundEngine, soundState } from "./store";

export type { BedId, CueId } from "./cues";

export type CueOptions = { pan?: number; rate?: number; gain?: number };
export type SoundLoop = { set(o: CueOptions): void; stop(): void };

/** What the page last asked for (applied when the engine arrives). */
let bedWant: BedId | null | undefined;
let stormWant = false;
type LoopProxy = { id: CueId; o: CueOptions; inner: SoundLoop | null };
const loops = new Set<LoopProxy>();
/** Cues asked while sound is on but the engine is still loading. */
let held: { id: CueId; o?: CueOptions; t: number }[] = [];

onSoundEngine((e: Engine) => {
  if (bedWant !== undefined) e.bed(bedWant);
  e.layer("storm", stormWant);
  for (const l of loops) l.inner = e.loop(l.id, l.o);
  const now = performance.now();
  for (const h of held) if (now - h.t <= 1000) e.cue(h.id, h.o);
  held = [];
});

export const sound = {
  /** Play one effect (no-op while muted). */
  cue(id: CueId, o?: CueOptions): void {
    const e = soundEngine();
    if (e) e.cue(id, o);
    else if (soundState().on) {
      const now = performance.now();
      held = held.filter((h) => now - h.t <= 1000).slice(-7);
      held.push({ id, o, t: now });
    }
  },
  /** Start a looping effect (the drone's hum: `rate` 1 → 1.78 = 180 → 320 Hz);
   *  stop() ends it. Survives a later unmute. */
  loop(id: CueId, o: CueOptions = {}): SoundLoop {
    const l: LoopProxy = { id, o: { ...o }, inner: null };
    loops.add(l);
    l.inner = soundEngine()?.loop(id, l.o) ?? null;
    return {
      set(n) {
        Object.assign(l.o, n);
        l.inner?.set(n);
      },
      stop() {
        loops.delete(l);
        l.inner?.stop();
        l.inner = null;
      },
    };
  },
  /** Crossfade to a world's bed (null = silence). */
  bed(b: BedId | null): void {
    bedWant = b;
    soundEngine()?.bed(b);
  },
  /** Duck the beds by `db` for `ms`. */
  duck(db: number, ms: number): void {
    soundEngine()?.duck(db, ms);
  },
  /** The director's cut: unmute for its duration; resolves to `restore`
   *  once the engine is ready. Call it from the click (the click is the
   *  consent and the gesture) and await it before emitting dc:start. */
  borrow(): Promise<() => void> {
    return borrowSound();
  },
};

/** The seam's storm over the Pirates bed (the bed follower switches it). */
export function bedLayer(name: "storm", on: boolean): void {
  stormWant = on;
  soundEngine()?.layer(name, on);
}
