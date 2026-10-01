/* ============================================================================
   RECIPES — one procedural graph per effect (PHASE3-SPEC §3.5
   "lib/audio/recipes.ts", §10.3). Part of the lazy engine chunk.

   Original by construction: filtered noise, single tones, struck
   inharmonic "bells" and one three-note chime. No film theme, no melody, no
   celesta / music-box figure, no "Aal izz well" rhythm (two heartbeats
   only), no voice, and no gunshot: Dead Eye's strike is a muffled "thock".

   Levels: the `peak` values inside a recipe only balance its own layers.
   The engine renders every recipe once offline and normalises it to its
   LEVEL below (peak dBFS; every SFX ≤ −6 dBFS, §3.5), and the master
   ceiling holds the sum under −6 dBFS.
   ========================================================================== */

import type { CueId, RecipeCueId } from "./cues";
import { bell, filter, gain, noise, noiseSrc, osc, scatter, sweepPan, tone, wire, type Kit } from "./synth";

export type Recipe = (k: Kit) => void;

/** Target peak (dBFS) per cue after normalisation. Default −9. */
const LEVELS: Partial<Record<CueId, number>> = {
  "impact-iris": -6,
  "impact-chalk": -6,
  "impact-flash": -6,
  "impact-lumos": -7,
  "wave-wash": -8,
  "wave-recede": -8,
  "flash-whumpf": -8,
  "kraken-rumble": -7,
  "title-sting": -14,
  "typewriter-click": -16,
  "compass-ratchet": -16,
  "compass-lid": -13,
  "drone-gate": -13,
  "drone-hum": -17,
  "deadeye-scratch": -14,
  "candle-fwip": -12,
  "found-pirates": -12,
  "found-idiots": -12,
  "found-rdr2": -12,
  "found-hp": -12,
  "hunt-complete": -10,
  "postcredits-chime": -11,
  "toggle-click": -20,
  "letterbox-whum": -10,
};

export const levelOf = (id: CueId): number => LEVELS[id] ?? -9;

/* The procedural cues (every CueId except the tts-* files; tsc checks the
   set is complete). Times in seconds, frequencies in Hz. */
export const RECIPES: Record<RecipeCueId, Recipe> = {
  /* — Transitions and scenes ——————————————————————————————————————— */
  "broom-whoosh": (k) => {
    noise(k, 0, { f: 300, to: 2500, glide: 0.9, q: 1.4, peak: 0.5, a: 0.75, d: 0.45, swell: true });
    noise(k, 0.1, { n: "brown", type: "lowpass", f: 400, to: 900, peak: 0.25, a: 0.6, d: 0.5, swell: true });
    sweepPan(k, 0, -0.7, 0.7, 1.2);
  },
  "broom-land": (k) => {
    tone(k, 0, { f: 92, to: 46, glide: 0.16, peak: 0.45, d: 0.28 });
    noise(k, 0, { n: "brown", type: "lowpass", f: 420, peak: 0.3, a: 0.01, d: 0.18 });
  },
  "wave-wash": (k) => {
    noise(k, 0, { n: "brown", type: "lowpass", f: 280, to: 1700, glide: 0.75, q: 0.6, peak: 0.5, a: 0.75, d: 0.75, swell: true });
    noise(k, 0.55, { type: "highpass", f: 2400, peak: 0.12, a: 0.25, d: 0.6, swell: true });
    sweepPan(k, 0, -0.25, 0.25, 1.5);
  },
  "wave-recede": (k) => {
    noise(k, 0, { n: "brown", type: "lowpass", f: 1500, to: 240, q: 0.6, peak: 0.5, a: 0.03, d: 0.6 });
    noise(k, 0.05, { type: "highpass", f: 3000, to: 1500, peak: 0.1, a: 0.02, d: 0.45 });
  },
  "duster-swipe": (k) => {
    noise(k, 0, { f: 1800, to: 4200, q: 0.8, peak: 0.45, a: 0.03, d: 0.32 });
    noise(k, 0, { n: "brown", type: "lowpass", f: 800, peak: 0.25, a: 0.02, d: 0.25 });
    sweepPan(k, 0, 0.4, -0.4, 0.35);
  },
  shutter: (k) => {
    noise(k, 0, { type: "highpass", f: 2000, peak: 0.45, a: 0.001, d: 0.025 });
    tone(k, 0, { f: 1150, peak: 0.2, a: 0.001, d: 0.05 });
    noise(k, 0.065, { type: "highpass", f: 1600, peak: 0.35, a: 0.001, d: 0.03 });
    tone(k, 0.065, { f: 820, peak: 0.16, a: 0.001, d: 0.05 });
  },
  "flash-whumpf": (k) => {
    noise(k, 0, { n: "brown", type: "lowpass", f: 600, to: 1600, glide: 0.08, q: 0.7, peak: 0.5, a: 0.015, d: 0.65 });
    tone(k, 0, { f: 62, to: 40, peak: 0.3, a: 0.01, d: 0.3 });
    noise(k, 0.01, { type: "highpass", f: 4000, peak: 0.08, a: 0.005, d: 0.3 });
  },
  "match-strike": (k) => {
    for (let i = 0; i < 3; i++) noise(k, i * 0.045, { f: 2600, q: 1.6, peak: 0.35 - i * 0.05, a: 0.004, d: 0.04 });
    noise(k, 0.13, { f: 900, to: 2200, glide: 0.2, q: 0.8, peak: 0.35, a: 0.06, d: 0.55 });
    noise(k, 0.15, { n: "crackle", f: 3000, q: 0.7, peak: 0.25, a: 0.02, d: 0.6 });
  },
  "shimmer-rise": (k) => {
    // An inharmonic cluster that swells together (no arpeggio, no tune).
    [880, 1243, 1567, 1975, 2489].forEach((f, i) => tone(k, i * 0.04, { f, peak: 0.07, a: 0.75, d: 0.45, swell: true, am: [5 + i, 0.3] }));
    noise(k, 0.3, { type: "highpass", f: 6000, peak: 0.06, a: 0.5, d: 0.4, swell: true });
  },
  "letterbox-whum": (k) => {
    tone(k, 0, { f: 55, peak: 0.4, a: 0.12, d: 0.28, swell: true });
    tone(k, 0, { f: 110, peak: 0.14, a: 0.1, d: 0.3, swell: true });
    noise(k, 0, { n: "brown", type: "lowpass", f: 300, peak: 0.2, a: 0.12, d: 0.28, swell: true });
  },
  "projector-start": (k) => {
    noise(k, 0, { n: "clatter", f: 2600, q: 1.1, speed: 0.25, speedTo: 1, glide: 1.1, peak: 0.45, a: 0.4, d: 1.1, swell: true });
    tone(k, 0, { type: "sawtooth", f: 30, to: 96, glide: 1.1, lp: 400, peak: 0.12, a: 0.5, d: 1.0, swell: true });
    noise(k, 0.1, { f: 1100, q: 1.4, peak: 0.2, a: 0.6, d: 0.9, swell: true, am: [24, 0.6] });
  },
  "reel-runout": (k) => {
    noise(k, 0, { n: "clatter", f: 1800, q: 0.9, speed: 1, speedTo: 0.18, glide: 1.4, peak: 0.45, a: 0.02, d: 1.5, swell: true });
    tone(k, 0, { type: "sawtooth", f: 96, to: 30, glide: 1.4, lp: 400, peak: 0.1, a: 0.02, d: 1.4, swell: true });
  },
  "impact-iris": (k) => {
    bell(k, 0, 420, [1, 2.69, 4.45], { peak: 0.38, d: 0.95 });
    tone(k, 0, { f: 70, to: 45, peak: 0.25, d: 0.25 });
  },
  "impact-chalk": (k) => {
    tone(k, 0, { f: 930, to: 720, glide: 0.04, peak: 0.42, a: 0.001, d: 0.07 });
    tone(k, 0, { f: 190, peak: 0.25, a: 0.002, d: 0.09 });
    noise(k, 0, { f: 2600, q: 1.2, peak: 0.3, a: 0.001, d: 0.03 });
  },
  "impact-flash": (k) => {
    noise(k, 0, { type: "lowpass", f: 3200, to: 900, peak: 0.5, a: 0.004, d: 0.4 });
    noise(k, 0, { n: "brown", type: "lowpass", f: 500, peak: 0.35, a: 0.01, d: 0.35 });
  },
  "impact-lumos": (k) => {
    [330, 495, 660].forEach((f, i) => tone(k, 0, { f, detune: (i - 1) * 4, peak: 0.13, a: 0.35, d: 0.6, swell: true }));
    noise(k, 0, { f: 1400, q: 0.8, peak: 0.12, a: 0.3, d: 0.5, swell: true });
  },
  "title-sting": (k) => {
    // One soft note (D4), plucked once.
    tone(k, 0, { f: 293.66, peak: 0.3, a: 0.012, d: 1.4 });
    tone(k, 0, { f: 587.33, peak: 0.08, a: 0.012, d: 0.9 });
    tone(k, 0, { type: "triangle", f: 293.66, detune: 5, lp: 1200, peak: 0.08, a: 0.012, d: 1.1 });
  },
  "typewriter-click": (k) => {
    noise(k, 0, { type: "highpass", f: 1500, peak: 0.4, a: 0.0008, d: 0.012 });
    tone(k, 0, { f: 3400 + k.rnd() * 300, peak: 0.12, a: 0.0008, d: 0.02 });
    tone(k, 0.004, { f: 180, peak: 0.15, a: 0.001, d: 0.03 });
  },

  /* — Toys —————————————————————————————————————————————————————————— */
  "compass-lid": (k) => {
    noise(k, 0, { type: "highpass", f: 2500, peak: 0.35, a: 0.001, d: 0.015 });
    noise(k, 0.028, { type: "highpass", f: 2000, peak: 0.3, a: 0.001, d: 0.02 });
    tone(k, 0.03, { f: 4200, peak: 0.08, a: 0.001, d: 0.12 });
  },
  "compass-ratchet": (k) => {
    noise(k, 0, { f: 5000, q: 6, peak: 0.45, a: 0.0006, d: 0.012 });
    tone(k, 0, { f: 2900 + k.rnd() * 200, peak: 0.08, a: 0.0006, d: 0.015 });
  },
  "compass-settle": (k) => {
    bell(k, 0, 1760, [1, 1.5, 2.76], { peak: 0.3, d: 0.75 });
  },
  "drone-hum": (k) => {
    // One second of the rotor hum (the game uses sound.loop for the real thing).
    tone(k, 0, { type: "sawtooth", f: 210, lp: 1300, peak: 0.25, a: 0.1, d: 0.9, swell: true });
    noise(k, 0, { f: 2200, q: 0.7, peak: 0.1, a: 0.1, d: 0.9, swell: true });
  },
  "drone-gate": (k) => {
    tone(k, 0, { f: 1320, peak: 0.3, a: 0.002, d: 0.1 });
    noise(k, 0, { type: "highpass", f: 3000, peak: 0.15, a: 0.001, d: 0.01 });
  },
  "drone-finish": (k) => {
    // One chord, struck once.
    [523.25, 659.25, 783.99].forEach((f) => tone(k, 0, { f, type: "triangle", lp: 2400, peak: 0.13, a: 0.01, d: 1.25 }));
  },
  "deadeye-swell": (k) => {
    noise(k, 0, { n: "brown", type: "lowpass", f: 2000, to: 280, glide: 1.0, peak: 0.45, a: 0.6, d: 0.6, swell: true });
    tone(k, 0, { f: 48, peak: 0.25, a: 0.6, d: 0.6, swell: true });
    noise(k, 0, { f: 3000, to: 600, q: 2, peak: 0.12, a: 0.5, d: 0.6, swell: true });
  },
  "deadeye-scratch": (k) => {
    scatter(k, 0, 4, 0.16, (o, _i, r) => noise(k, o, { f: 3000 + r * 900, q: 2, peak: 0.25 + r * 0.15, a: 0.004, d: 0.04 + r * 0.03 }));
  },
  "deadeye-strike": (k) => {
    // The ink strike: a muffled "thock", never a gunshot.
    tone(k, 0, { f: 150, to: 68, glide: 0.06, peak: 0.45, a: 0.002, d: 0.16 });
    noise(k, 0, { n: "brown", type: "lowpass", f: 520, peak: 0.3, a: 0.002, d: 0.09 });
  },
  "deadeye-release": (k) => {
    noise(k, 0, { f: 950, to: 420, q: 0.7, peak: 0.4, a: 0.15, d: 0.75, swell: true });
    noise(k, 0, { n: "brown", type: "lowpass", f: 700, to: 300, peak: 0.25, a: 0.15, d: 0.7, swell: true });
  },
  "candle-fwip": (k) => {
    noise(k, 0, { f: 600, to: 2300, glide: 0.12, q: 1.1, peak: 0.42, a: 0.012, d: 0.26 });
    noise(k, 0, { n: "brown", type: "lowpass", f: 600, peak: 0.2, a: 0.01, d: 0.18 });
  },
  "hall-swell": (k) => {
    [110, 165, 220, 330].forEach((f, i) => tone(k, 0, { f, detune: i % 2 ? 3 : -3, peak: 0.11, a: 0.9, d: 0.6, swell: true }));
  },

  /* — Eggs —————————————————————————————————————————————————————————— */
  "map-unfold": (k) => {
    scatter(k, 0, 11, 0.7, (o, _i, r) => noise(k, o, { type: "highpass", f: 1500 + r * 2500, peak: 0.12 + r * 0.25, a: 0.002, d: 0.015 + r * 0.03 }));
    noise(k, 0.05, { n: "brown", type: "lowpass", f: 650, peak: 0.25, a: 0.3, d: 0.5, swell: true });
  },
  "ink-scratch": (k) => {
    for (let i = 0; i < 4; i++) noise(k, i * 0.11, { f: 3600, to: 4600, q: 3, peak: 0.3, a: 0.01, d: 0.07 + k.rnd() * 0.03 });
  },
  "lumos-bell": (k) => {
    bell(k, 0, 660, [1, 2.76, 5.4, 8.93], { peak: 0.4, a: 0.12, d: 1.2 });
  },
  "nox-snuff": (k) => {
    noise(k, 0, { type: "lowpass", f: 2200, to: 300, peak: 0.4, a: 0.006, d: 0.28 });
    noise(k, 0, { type: "highpass", f: 5000, peak: 0.1, a: 0.002, d: 0.06 });
  },
  "snitch-flutter": (k) => {
    // An 18–20 Hz wing buzz.
    noise(k, 0, { f: 1600, q: 1.2, peak: 0.4, a: 0.2, d: 0.5, swell: true, am: [19, 0.9] });
    tone(k, 0, { type: "triangle", f: 190, peak: 0.08, a: 0.2, d: 0.5, swell: true, am: [19, 0.9] });
    sweepPan(k, 0, -0.6, 0.6, 0.7);
  },
  "snitch-ting": (k) => {
    bell(k, 0, 2637, [1, 1.5, 2.4], { peak: 0.32, d: 0.5 });
  },
  "parley-creak": (k) => {
    tone(k, 0, { type: "sawtooth", f: 140, to: 230, glide: 0.5, bp: 520, q: 6, peak: 0.45, a: 0.08, d: 0.45, swell: true, am: [23, 0.6] });
  },
  "flag-snap": (k) => {
    [0, 0.045, 0.1].forEach((o, i) => noise(k, o, { type: "lowpass", f: 3200, peak: 0.2 + i * 0.12, a: 0.002, d: 0.04 + i * 0.03 }));
  },
  "coin-ting": (k) => {
    bell(k, 0, 3100, [1, 1.57, 2.11], { peak: 0.3, d: 0.85 });
    tone(k, 0, { f: 3108, peak: 0.06, d: 0.8 });
  },
  "hollow-wind": (k) => {
    noise(k, 0, { f: 420, to: 680, glide: 0.8, q: 4, peak: 0.45, a: 0.6, d: 0.9, swell: true });
    sweepPan(k, 0, 0.3, -0.3, 1.5);
  },
  "kraken-rumble": (k) => {
    tone(k, 0, { f: 44, to: 58, glide: 1.2, peak: 0.3, a: 0.45, d: 0.95, swell: true });
    tone(k, 0, { f: 63, to: 52, glide: 1.2, peak: 0.18, a: 0.5, d: 0.9, swell: true });
    noise(k, 0, { n: "brown", type: "lowpass", f: 120, peak: 0.4, a: 0.5, d: 0.9, swell: true });
  },
  "wave-slap": (k) => {
    noise(k, 0, { n: "brown", type: "lowpass", f: 1300, peak: 0.45, a: 0.008, d: 0.35 });
    noise(k, 0.02, { type: "highpass", f: 2600, peak: 0.12, a: 0.02, d: 0.45 });
  },
  "heartbeat-2": (k) => {
    // Two heartbeats at ~60 bpm (lub-dub, lub-dub); nothing else.
    [0, 1].forEach((o) => {
      tone(k, o, { f: 58, to: 40, glide: 0.09, peak: 0.36, a: 0.008, d: 0.12 });
      tone(k, o, { f: 116, to: 80, glide: 0.09, peak: 0.1, a: 0.008, d: 0.08 });
      tone(k, o + 0.19, { f: 52, to: 38, glide: 0.08, peak: 0.26, a: 0.008, d: 0.1 });
    });
  },
  "quad-spinup": (k) => {
    tone(k, 0, { type: "sawtooth", f: 60, to: 260, glide: 1.0, lp: 1600, peak: 0.2, a: 0.9, d: 0.45, swell: true });
    noise(k, 0, { f: 1500, q: 0.7, peak: 0.3, a: 0.9, d: 0.45, swell: true, am: [40, 0.5] });
  },
  "pen-creak": (k) => {
    tone(k, 0, { type: "sawtooth", f: 90, to: 132, glide: 0.3, bp: 700, q: 8, peak: 0.4, a: 0.05, d: 0.28, swell: true, am: [31, 0.7] });
  },
  "pen-ting": (k) => {
    bell(k, 0, 3520, [1, 2.3], { peak: 0.26, d: 0.6 });
  },
  "eagle-shimmer": (k) => {
    [2200, 2930, 3570].forEach((f, i) => tone(k, i * 0.05, { f, peak: 0.08, a: 0.5, d: 0.7, swell: true, am: [9, 0.6] }));
    noise(k, 0, { f: 900, to: 600, q: 1.5, peak: 0.3, a: 0.55, d: 0.7, swell: true });
    sweepPan(k, 0, -0.4, 0.4, 1.25);
  },
  "bone-scratch": (k) => {
    for (let i = 0; i < 5; i++) noise(k, i * 0.1 + k.rnd() * 0.03, { f: 2200, to: 2600, q: 1.5, peak: 0.28, a: 0.01, d: 0.06 + k.rnd() * 0.03 });
  },
  "fire-shift": (k) => {
    noise(k, 0, { n: "brown", type: "lowpass", f: 420, peak: 0.4, a: 0.004, d: 0.08 });
    tone(k, 0, { f: 240, peak: 0.18, a: 0.002, d: 0.08 });
    noise(k, 0.05, { n: "pops", f: 2400, q: 0.7, peak: 0.45, a: 0.01, d: 0.4 });
  },
  "fire-crackle": (k) => {
    noise(k, 0, { n: "pops", f: 2000, q: 0.6, peak: 0.45, a: 0.08, d: 1.1, swell: true });
    noise(k, 0, { n: "brown", type: "lowpass", f: 220, peak: 0.25, a: 0.15, d: 1.0, swell: true });
  },

  /* — Hunt UI, post-credits, the toggle ————————————————————————————— */
  "found-pirates": (k) => {
    bell(k, 0, 523.25, [1, 2, 2.92, 4.1], { peak: 0.38, d: 1.15 });
  },
  "found-idiots": (k) => {
    noise(k, 0, { f: 3500, q: 1.5, peak: 0.35, a: 0.001, d: 0.02 });
    noise(k, 0.07, { f: 3200, q: 1.5, peak: 0.3, a: 0.001, d: 0.025 });
    tone(k, 0.07, { f: 1050, peak: 0.12, a: 0.001, d: 0.04 });
  },
  "found-rdr2": (k) => {
    scatter(k, 0, 4, 0.22, (o, _i, r) => bell(k, o, 4000 + r * 900, [1, 1.38], { peak: 0.14, d: 0.09 }));
  },
  "found-hp": (k) => {
    bell(k, 0, 1568, [1, 3, 4.2], { peak: 0.32, a: 0.005, d: 1.0 });
  },
  "hunt-complete": (k) => {
    // The 12/12 chime: three original notes rising in fifths, ≤ 2 s.
    [783.99, 1174.66, 1760].forEach((f, i) => bell(k, i * 0.18, f, [1, 3], { peak: 0.24, d: 1.2 }));
  },
  "postcredits-whoosh": (k) => {
    noise(k, 0, { f: 400, to: 2200, glide: 0.65, q: 1.3, peak: 0.45, a: 0.55, d: 0.35, swell: true });
    sweepPan(k, 0, 0.6, -0.6, 0.9);
  },
  "postcredits-chime": (k) => {
    bell(k, 0, 1046.5, [1, 1.5, 2.76], { peak: 0.3, d: 1.2 });
  },
  "toggle-click": (k) => {
    tone(k, 0, { f: 1800, peak: 0.3, a: 0.001, d: 0.025 });
    noise(k, 0, { type: "highpass", f: 4000, peak: 0.12, a: 0.0005, d: 0.006 });
  },
};

/* — The drone's rotor hum (a loop; pitch follows speed) ——————————————— */

export type Hum = { rate(r: number): void; stop(): void };

/** Two detuned sawtooths 180–320 Hz + rotor noise into `out`.
 *  `rate` 1 = idle (180 Hz) … 1.78 = full speed (320 Hz). */
export function droneHum(c: BaseAudioContext, out: AudioNode, rate = 1): Hum {
  const f = (r: number) => Math.min(320, Math.max(180, 180 * r));
  const a = osc(c, "sawtooth", f(rate));
  const b = osc(c, "sawtooth", f(rate));
  b.detune.value = 9;
  const lp = filter(c, "lowpass", f(rate) * 6, 1.2);
  const n = noiseSrc(c, "white");
  const bp = filter(c, "bandpass", 2200, 0.7);
  const g = gain(c, 0);
  a.connect(lp);
  b.connect(lp);
  wire(lp, g);
  wire(n, bp, gain(c, 0.35), g);
  g.connect(out);
  const t = c.currentTime;
  for (const s of [a, b, n]) s.start(t);
  g.gain.setTargetAtTime(0.5, t, 0.08);
  return {
    rate(r) {
      const now = c.currentTime;
      a.frequency.setTargetAtTime(f(r), now, 0.06);
      b.frequency.setTargetAtTime(f(r), now, 0.06);
      lp.frequency.setTargetAtTime(f(r) * 6, now, 0.06);
    },
    stop() {
      const now = c.currentTime;
      g.gain.setTargetAtTime(0, now, 0.05);
      for (const s of [a, b, n]) s.stop(now + 0.4);
    },
  };
}
