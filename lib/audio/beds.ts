/* ============================================================================
   BEDS — one ambient bed per world plus the house (PHASE3-SPEC §10.2).
   Part of the lazy engine chunk. Each bed is continuous filtered noise and
   non-melodic tones (seamless by construction: no loop points), plus sparse
   timed events in the live context only (creaks, chirps, crickets, a distant
   train). The engine measures each bed's continuous layers offline
   (K-weighted) and trims the bed to ≈ −30 LUFS.

   Never a melody: the HP hall hum is a static open fifth (110/165/220 Hz,
   slowly detuned ±3 cents), never a celesta or music-box figure; the RDR2
   train horn is one faint generic tone; the 3 Idiots bed has no crowd and no
   voice.
   ========================================================================== */

import type { BedId } from "./cues";
import { filter, gain, lfo, noise, noiseSrc, osc, tone, wire, type Kit } from "./synth";

export type BedKit = {
  ctx: BaseAudioContext;
  out: AudioNode;
  /** false while the engine measures the bed offline (no timed events). */
  live: boolean;
  rnd: () => number;
  /** Start a source now; the bed stops it. */
  src<T extends AudioScheduledSourceNode>(n: T): T;
  /** Live only: run `fn` every `min`–`max` s while sound is running. */
  every(min: number, max: number, fn: (k: Kit) => void): void;
};

/** Optional extra layers a bed can switch (the seam's storm). */
export type BedLayers = { layer(name: "storm", on: boolean): void };

export type BedBuild = (k: BedKit) => BedLayers | void;

export const BEDS: Record<BedId, BedBuild> = {
  /* Sea swell, wind, a hull creak every 6–14 s; the seam's storm on cue. */
  pirates: (k) => {
    const c = k.ctx;
    const lp = filter(c, "lowpass", 700, 0.5);
    const sea = gain(c, 0.6);
    wire(k.src(noiseSrc(c, "brown")), lp, sea, k.out);
    const swellL = k.src(osc(c, "sine", 0.09));
    swellL.connect(gain(c, 0.35)).connect(sea.gain);
    swellL.connect(gain(c, 200)).connect(lp.frequency);

    const bp = filter(c, "bandpass", 800, 0.7);
    const wind = gain(c, 0.4);
    wire(k.src(noiseSrc(c, "white", 0.97)), bp, wind, k.out);
    k.src(lfo(c, 0.05, 0.2, wind.gain));
    k.src(lfo(c, 0.037, 250, bp.frequency));

    k.every(6, 14, (v) =>
      tone(v, 0, { type: "sawtooth", f: 120, to: 260, glide: 0.8 + v.rnd() * 0.4, bp: 480 + v.rnd() * 200, q: 7, peak: 0.35, a: 0.25, d: 0.7, swell: true, am: [17, 0.7] }),
    );

    let storm: GainNode | null = null;
    return {
      layer(name, on) {
        if (name !== "storm") return;
        if (!storm) {
          if (!on) return;
          storm = gain(c, 0);
          storm.connect(k.out);
          wire(k.src(noiseSrc(c, "white", 1.03)), filter(c, "highpass", 3000), gain(c, 0.18), storm);
          const rumble = gain(c, 0.4);
          wire(k.src(noiseSrc(c, "brown", 0.5)), filter(c, "lowpass", 90), rumble, storm);
          k.src(lfo(c, 0.13, 0.2, rumble.gain));
        }
        storm.gain.setTargetAtTime(on ? 1 : 0, c.currentTime, 0.4);
      },
    };
  },

  /* Classroom room tone, a ceiling fan (70 Hz hum + blade swish, AM 5.5 Hz),
     sparse courtyard FM chirps 2–5 kHz. No crowd murmur. */
  idiots: (k) => {
    const c = k.ctx;
    wire(k.src(noiseSrc(c, "brown")), filter(c, "lowpass", 200), gain(c, 0.6), k.out);
    const fan = gain(c, 0.75);
    fan.connect(k.out);
    k.src(lfo(c, 5.5, 0.25, fan.gain));
    k.src(osc(c, "sine", 70)).connect(gain(c, 0.085)).connect(fan);
    k.src(osc(c, "sine", 140)).connect(gain(c, 0.03)).connect(fan);
    wire(k.src(noiseSrc(c, "white", 0.93)), filter(c, "bandpass", 500, 1.2), gain(c, 0.12), fan);

    k.every(3, 9, (v) => {
      const n = 2 + Math.floor(v.rnd() * 3);
      for (let i = 0; i < n; i++) {
        const f = 2000 + v.rnd() * 3000;
        tone(v, i * (0.09 + v.rnd() * 0.07), { f, to: f * (1.15 + v.rnd() * 0.3), glide: 0.08, peak: 0.05, a: 0.02, d: 0.06 + v.rnd() * 0.08, am: [25 + v.rnd() * 20, 0.6] });
      }
    });
  },

  /* Campfire crackle + a 150 Hz roar, prairie wind, crickets (4.5 kHz,
     30 Hz pulses in groups of 3–5), a distant train every ~40 s. */
  rdr2: (k) => {
    const c = k.ctx;
    wire(k.src(noiseSrc(c, "crackle")), filter(c, "bandpass", 2200, 0.6), gain(c, 0.6), k.out);
    wire(k.src(noiseSrc(c, "pops", 0.8)), filter(c, "bandpass", 1400, 0.8), gain(c, 0.4), k.out);
    const roar = gain(c, 0.5);
    wire(k.src(noiseSrc(c, "brown")), filter(c, "bandpass", 150, 0.8), roar, k.out);
    k.src(lfo(c, 0.2, 0.15, roar.gain));
    const wind = gain(c, 0.25);
    wire(k.src(noiseSrc(c, "white", 1.05)), filter(c, "bandpass", 600, 0.9), wind, k.out);
    k.src(lfo(c, 0.045, 0.12, wind.gain));

    k.every(0.7, 2.2, (v) => {
      const n = 3 + Math.floor(v.rnd() * 3);
      for (let i = 0; i < n; i++) tone(v, i / 30, { f: 4500, peak: 0.04, a: 0.006, d: 0.02 });
    });
    k.every(35, 48, (v) => {
      // Chuffs at 1.5 Hz for ~9 s, swelling in and out, + one faint horn tone.
      const swell = gain(v.ctx, 0);
      swell.connect(v.out);
      const t = v.t0;
      swell.gain.setValueAtTime(0, t);
      swell.gain.linearRampToValueAtTime(1, t + 4);
      swell.gain.linearRampToValueAtTime(0, t + 9);
      const w: Kit = { ...v, out: swell };
      for (let i = 0; i < 13; i++) noise(w, i / 1.5, { n: "brown", type: "lowpass", f: 320, peak: 0.12, a: 0.03, d: 0.35 });
      tone(w, 3.5, { type: "sawtooth", f: 196, lp: 900, peak: 0.03, a: 0.3, d: 1.2, swell: true });
      v.end = Math.max(v.end, 9.1);
    });
  },

  /* The great-hall hum (non-melodic 110/165/220 Hz, ±3 cents drift),
     candle crackle, soft window wind. */
  hp: (k) => {
    const c = k.ctx;
    const drift = k.src(osc(c, "sine", 0.03));
    (
      [
        [110, 0.12],
        [165, 0.07],
        [220, 0.05],
      ] as const
    ).forEach(([f, g], i) => {
      const o = k.src(osc(c, "sine", f));
      drift.connect(gain(c, i === 1 ? -3 : 3)).connect(o.detune);
      o.connect(gain(c, g)).connect(k.out);
    });
    wire(k.src(noiseSrc(c, "crackle", 1.3)), filter(c, "bandpass", 3200, 0.7), gain(c, 0.35), k.out);
    const bp = filter(c, "bandpass", 450, 1.2);
    const wind = gain(c, 0.4);
    wire(k.src(noiseSrc(c, "white", 0.95)), bp, wind, k.out);
    k.src(lfo(c, 0.06, 0.25, wind.gain));
    k.src(lfo(c, 0.041, 120, bp.frequency));
  },

  /* The projector: a 24 Hz whir on band-passed noise, a low motor, the gate. */
  house: (k) => {
    const c = k.ctx;
    const whir = gain(c, 0.6);
    wire(k.src(noiseSrc(c, "white")), filter(c, "bandpass", 1100, 1.4), whir, k.out);
    k.src(lfo(c, 24, 0.4, whir.gain));
    k.src(osc(c, "sine", 96)).connect(gain(c, 0.04)).connect(k.out);
    wire(k.src(noiseSrc(c, "clatter")), filter(c, "bandpass", 2800, 1.2), gain(c, 0.25), k.out);
  },
};
