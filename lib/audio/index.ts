/* ============================================================================
   SOUND (facade) — the page's sound API (PHASE3-SPEC §3.5, §10; DP-13).
   Every visit starts muted; the AudioContext and the engine chunk load only
   on the first unmute click (lib/audio/store.ts). Beds follow the world at
   the reading line; cues are short procedural or file effects.

   W1.0 STUB: every call is a no-op (W2-SOUND implements the lazy engine,
   recipes and cue map behind this same surface).
   ========================================================================== */

/** Every effect id (spec §10.3; PHASE3-PLAN §4.8). */
export type CueId =
  | "broom-whoosh"
  | "broom-land"
  | "wave-wash"
  | "wave-recede"
  | "duster-swipe"
  | "shutter"
  | "flash-whumpf"
  | "match-strike"
  | "shimmer-rise"
  | "letterbox-whum"
  | "projector-start"
  | "reel-runout"
  | "impact-iris"
  | "impact-chalk"
  | "impact-flash"
  | "impact-lumos"
  | "title-sting"
  | "typewriter-click"
  | "compass-lid"
  | "compass-ratchet"
  | "compass-settle"
  | "drone-hum"
  | "drone-gate"
  | "drone-finish"
  | "deadeye-swell"
  | "deadeye-scratch"
  | "deadeye-strike"
  | "deadeye-release"
  | "candle-fwip"
  | "hall-swell"
  | "map-unfold"
  | "ink-scratch"
  | "lumos-bell"
  | "nox-snuff"
  | "snitch-flutter"
  | "snitch-ting"
  | "parley-creak"
  | "flag-snap"
  | "coin-ting"
  | "hollow-wind"
  | "kraken-rumble"
  | "wave-slap"
  | "heartbeat-2"
  | "quad-spinup"
  | "pen-creak"
  | "pen-ting"
  | "eagle-shimmer"
  | "bone-scratch"
  | "fire-shift"
  | "fire-crackle"
  | "found-pirates"
  | "found-idiots"
  | "found-rdr2"
  | "found-hp"
  | "hunt-complete"
  | "postcredits-whoosh"
  | "postcredits-chime"
  | "toggle-click"
  | "tts-lumos"
  | "tts-nox"
  | "tts-solemn"
  | "tts-mischief"
  | "tts-parley";

/** One bed per world plus the house (spec §10.2). */
export type BedId = "pirates" | "idiots" | "rdr2" | "hp" | "house";

export type CueOptions = { pan?: number; rate?: number; gain?: number };
export type SoundLoop = { set(o: CueOptions): void; stop(): void };

const idleLoop: SoundLoop = { set: () => {}, stop: () => {} };

export const sound = {
  /** Play one effect (no-op while muted). */
  cue(id: CueId, o?: CueOptions): void {
    void id;
    void o;
  },
  /** Start a looping effect (the drone's hum); stop() ends it. */
  loop(id: CueId, o?: CueOptions): SoundLoop {
    void id;
    void o;
    return idleLoop;
  },
  /** Crossfade to a world's bed (null = silence). */
  bed(b: BedId | null): void {
    void b;
  },
  /** Duck the beds by `db` for `ms`. */
  duck(db: number, ms: number): void {
    void db;
    void ms;
  },
  /** The director's cut: unmute for its duration; resolves to `restore`. */
  borrow(): Promise<() => void> {
    return Promise.resolve(() => {});
  },
};
