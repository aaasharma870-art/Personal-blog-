/* ============================================================================
   SYNTH — the small Web Audio kit the recipes and beds are built from
   (PHASE3-SPEC §10.1: procedural, 0 files, original by construction).
   Part of the lazy engine chunk; framework-free; works on any
   BaseAudioContext (the live AudioContext, or an OfflineAudioContext the
   engine uses to measure a bed's loudness).

   Conventions: helpers take an OFFSET in seconds from the voice's start
   (`k.t0`); `k.rate` is a varispeed (frequencies × rate, times ÷ rate).
   Every envelope peak is linear gain on a source normalised to ≤ 0.9, and
   recipes keep the sum of their peaks ≤ 0.5 (SFX ≤ −6 dBFS, §3.5).
   ========================================================================== */

/** Seeded PRNG (mulberry32): a measured bed renders the same as a live one. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type NoiseKind = "white" | "brown" | "crackle" | "pops" | "clatter";

/** Seconds per buffer: different lengths keep the loops from lining up. */
const SECONDS: Record<NoiseKind, number> = { white: 2.7, brown: 3.3, crackle: 3.7, pops: 5.3, clatter: 1 };
const buffers = new Map<string, AudioBuffer>();

/** A looping mono noise buffer (context-free, cached per sample rate). */
export function noiseBuffer(sr: number, kind: NoiseKind): AudioBuffer {
  const key = `${kind}@${sr}`;
  const hit = buffers.get(key);
  if (hit) return hit;
  const len = Math.round(sr * SECONDS[kind]);
  const buf = new AudioBuffer({ length: len, sampleRate: sr, numberOfChannels: 1 });
  const d = buf.getChannelData(0);
  const r = rng(kind.length * 7919 + 17);
  if (kind === "white") {
    for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
  } else if (kind === "brown") {
    let b = 0;
    for (let i = 0; i < len; i++) {
      b = (b + 0.02 * (r() * 2 - 1)) / 1.02;
      d[i] = b;
    }
  } else if (kind === "clatter") {
    // 24 clicks a second: a projector gate.
    const step = sr / 24;
    for (let c = 0; c < 24; c++) burst(d, Math.round(c * step), Math.round(sr * 0.0015), 0.6 + 0.4 * r(), r);
  } else {
    // Sparse impulses: many small ticks, a few pops (crackle ≈ 14/s, pops ≈ 6/s).
    const n = Math.round(SECONDS[kind] * (kind === "crackle" ? 14 : 6));
    for (let c = 0; c < n; c++) {
      const amp = (kind === "pops" ? 0.35 : 0.15) + r() ** 3;
      burst(d, Math.floor(r() * (len - sr * 0.01)), Math.round(sr * (0.0008 + r() * (kind === "pops" ? 0.006 : 0.003))), amp, r);
    }
  }
  // Normalise to a 0.9 peak (brown noise is quiet before this).
  let peak = 0;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(d[i]));
  if (peak > 0) for (let i = 0; i < len; i++) d[i] *= 0.9 / peak;
  buffers.set(key, buf);
  return buf;
}

function burst(d: Float32Array, at: number, n: number, amp: number, r: () => number): void {
  for (let i = 0; i < n && at + i < d.length; i++) d[at + i] += amp * (r() * 2 - 1) * Math.exp(-i / (n / 4));
}

/* — Nodes ———————————————————————————————————————————————————————————— */

export const gain = (c: BaseAudioContext, g = 1) => new GainNode(c, { gain: g });
export const filter = (c: BaseAudioContext, type: BiquadFilterType, frequency: number, Q = 0.7) =>
  new BiquadFilterNode(c, { type, frequency, Q });
export const osc = (c: BaseAudioContext, type: OscillatorType, frequency: number) => new OscillatorNode(c, { type, frequency });
export const noiseSrc = (c: BaseAudioContext, kind: NoiseKind, rate = 1) =>
  new AudioBufferSourceNode(c, { buffer: noiseBuffer(c.sampleRate, kind), loop: true, playbackRate: rate });

/** Connect a chain left to right; returns the last node. */
export function wire(...n: AudioNode[]): AudioNode {
  for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]);
  return n[n.length - 1];
}

/** An LFO: `src` → gain(depth) → `target` (an AudioParam), started now. */
export function lfo(c: BaseAudioContext, f: number, depth: number, target: AudioParam, type: OscillatorType = "sine"): OscillatorNode {
  const o = osc(c, type, f);
  o.connect(gain(c, depth)).connect(target);
  return o;
}

/* — Envelopes ——————————————————————————————————————————————————————— */

/** Attack `a` s to `peak`, then an exponential fall to −60 dB at `a + d`. */
export function hit(p: AudioParam, t: number, peak: number, a: number, d: number): void {
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(peak, t + a);
  p.setTargetAtTime(0, t + a, d / 6.9);
}

/** Linear swell: 0 → `peak` at `t + a` → 0 at `t + a + d`. */
export function swell(p: AudioParam, t: number, peak: number, a: number, d: number): void {
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(peak, t + a);
  p.linearRampToValueAtTime(0, t + a + d);
}

/** Freeze a param at time `t` (cancelAndHoldAtTime where supported). */
export function holdAt(p: AudioParam, t: number): number {
  const v = p.value;
  const q = p as AudioParam & { cancelAndHoldAtTime?: (t: number) => AudioParam };
  if (typeof q.cancelAndHoldAtTime === "function") q.cancelAndHoldAtTime(t);
  else {
    p.cancelScheduledValues(t);
    p.setValueAtTime(v, t);
  }
  return v;
}

export const dbToGain = (db: number) => 10 ** (db / 20);

/* — Voices (one-shot sounds) ———————————————————————————————————————— */

/** Where a voice plays: the engine builds one per cue (gain → pan → bus). */
export type Kit = {
  ctx: BaseAudioContext;
  out: AudioNode;
  /** Voice start (context time). */
  t0: number;
  /** Varispeed: frequencies × rate, times ÷ rate. */
  rate: number;
  rnd: () => number;
  /** The voice panner's pan, when the voice has one (whooshes sweep it). */
  pan?: AudioParam;
  /** Latest end offset (seconds, real time) any helper scheduled. */
  end: number;
};

type Env = { peak: number; a?: number; d: number; swell?: boolean };

function envelope(k: Kit, g: GainNode, t: number, e: Env): number {
  const a = (e.a ?? 0.004) / k.rate;
  const d = e.d / k.rate;
  (e.swell ? swell : hit)(g.gain, t, e.peak, a, d);
  return a + d;
}

function finish(k: Kit, s: AudioScheduledSourceNode, t: number, len: number): number {
  s.start(t);
  s.stop(t + len + 0.03);
  const end = t - k.t0 + len + 0.03;
  k.end = Math.max(k.end, end);
  return end;
}

export type ToneOpts = Env & {
  f: number;
  type?: OscillatorType;
  /** Glide to this frequency over `glide` s (default the whole note). */
  to?: number;
  glide?: number;
  detune?: number;
  /** Lowpass the tone (Hz). */
  lp?: number;
  /** Bandpass the tone (Hz) with `q`. */
  bp?: number;
  q?: number;
  /** Amplitude modulation: [rate Hz, depth 0–1] (roughness, flutter). */
  am?: readonly [number, number];
};

/** An oscillator note. Returns its end offset. */
export function tone(k: Kit, off: number, o: ToneOpts): number {
  const c = k.ctx;
  const t = k.t0 + off / k.rate;
  const s = osc(c, o.type ?? "sine", o.f * k.rate);
  if (o.detune) s.detune.value = o.detune;
  if (o.to) {
    s.frequency.setValueAtTime(o.f * k.rate, t);
    s.frequency.exponentialRampToValueAtTime(o.to * k.rate, t + (o.glide ?? (o.a ?? 0.004) + o.d) / k.rate);
  }
  const g = gain(c, 0);
  let head: AudioNode = s;
  if (o.lp) head = wire(head, filter(c, "lowpass", o.lp * k.rate));
  if (o.bp) head = wire(head, filter(c, "bandpass", o.bp * k.rate, o.q ?? 4));
  wire(head, g);
  const len = envelope(k, g, t, o);
  if (o.am) {
    const m = gain(c, 1 - o.am[1] / 2);
    g.connect(m).connect(k.out);
    const l = osc(c, "sine", o.am[0]);
    l.connect(gain(c, o.am[1] / 2)).connect(m.gain);
    l.start(t);
    l.stop(t + len + 0.03);
  } else g.connect(k.out);
  return finish(k, s, t, len);
}

export type NoiseOpts = Env & {
  n?: NoiseKind;
  /** Filter type (default bandpass) and centre / cutoff (Hz). */
  type?: BiquadFilterType;
  f: number;
  q?: number;
  /** Sweep the filter to this frequency over `glide` s (default the whole hit). */
  to?: number;
  glide?: number;
  /** Buffer playback rate (brown noise pitched down = rumble), optionally
   *  ramped to `speedTo` over `glide` s (a projector winding up / down). */
  speed?: number;
  speedTo?: number;
  am?: readonly [number, number];
};

/** A filtered noise hit. Returns its end offset. */
export function noise(k: Kit, off: number, o: NoiseOpts): number {
  const c = k.ctx;
  const t = k.t0 + off / k.rate;
  const s = noiseSrc(c, o.n ?? "white", o.speed ?? 1);
  const f = filter(c, o.type ?? "bandpass", o.f * k.rate, o.q ?? 0.9);
  const glideEnd = t + (o.glide ?? (o.a ?? 0.004) + o.d) / k.rate;
  if (o.to) {
    f.frequency.setValueAtTime(o.f * k.rate, t);
    f.frequency.exponentialRampToValueAtTime(o.to * k.rate, glideEnd);
  }
  if (o.speedTo) {
    s.playbackRate.setValueAtTime(o.speed ?? 1, t);
    s.playbackRate.exponentialRampToValueAtTime(o.speedTo, glideEnd);
  }
  const g = gain(c, 0);
  wire(s, f, g);
  const len = envelope(k, g, t, o);
  if (o.am) {
    const m = gain(c, 1 - o.am[1] / 2);
    g.connect(m).connect(k.out);
    const l = osc(c, "square", o.am[0]);
    l.connect(gain(c, o.am[1] / 2)).connect(m.gain);
    l.start(t);
    l.stop(t + len + 0.03);
  } else g.connect(k.out);
  const buf = s.buffer as AudioBuffer;
  s.start(t, k.rnd() * buf.duration * 0.9);
  s.stop(t + len + 0.03);
  const end = t - k.t0 + len + 0.03;
  k.end = Math.max(k.end, end);
  return end;
}

/** A struck bell / chime: inharmonic partials of `f`, each quieter and
 *  shorter than the last. `peak` is the sum of every partial's peak. */
export function bell(k: Kit, off: number, f: number, ratios: readonly number[], o: { peak: number; d: number; a?: number; swell?: boolean }): number {
  const w = ratios.map((_, i) => 1 / (i + 1));
  const sum = w.reduce((x, y) => x + y, 0);
  let end = 0;
  ratios.forEach((m, i) => {
    end = Math.max(end, tone(k, off, { f: f * m, peak: (o.peak * w[i]) / sum, a: o.a, d: o.d * (1 - i * 0.14), swell: o.swell }));
  });
  return end;
}

/** `n` events scattered over `span` s from `off`: fn(offset, index, random). */
export function scatter(k: Kit, off: number, n: number, span: number, fn: (o: number, i: number, r: number) => void): void {
  for (let i = 0; i < n; i++) fn(off + k.rnd() * span, i, k.rnd());
}

/** Sweep the voice's pan from `a` to `b` over `d` s (when it has a panner). */
export function sweepPan(k: Kit, off: number, a: number, b: number, d: number): void {
  if (!k.pan) return;
  const t = k.t0 + off / k.rate;
  k.pan.setValueAtTime(a, t);
  k.pan.linearRampToValueAtTime(b, t + d / k.rate);
}
