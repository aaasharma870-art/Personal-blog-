/* ============================================================================
   SOUND ENGINE — the lazy half of lib/audio (PHASE3-SPEC §3.5, §10; DP-13).
   Loaded by lib/audio/store.ts only after the first unmute (the click that
   creates the AudioContext). Framework-free.

   Graph:  cue voices (gain → pan) ─→ sfx bus ─┐
           beds (trim → fade) → bed bus (duck) → time-slow LP ─┤→ master → ceiling → out
   - Beds ≈ −30 LUFS: each bed's continuous layers are rendered offline once
     (K-weighted) and trimmed; 1.5 s equal-power crossfades.
   - SFX: every recipe is rendered offline once and normalised to its peak
     LEVEL (≤ −6 dBFS); the master ceiling (a waveshaper) holds the sum
     under −6 dBFS. Beds duck −6 dB under SFX.
   - Files (the tts-* lines): public/audio/<id>.webm (Opus) or .mp3 by
     canPlayType, fetched after the first unmute, decoded to AudioBuffers,
     played by AudioBufferSourceNode. A 404 is a silent no-op.
   - Event listeners (lib/events.ts) voice the page: impact, transition:meet,
     letterbox, hunt:found, egg:trigger, game:*, toy, post-credits, dc:*.
   - `setRunning(false)` (Pause / RM / hidden tab / muted) silences the
     master at once and every cue is a no-op; the store suspends the
     context. Timed bed events skip while not running.
   ========================================================================== */

import { on } from "../events";
import { onIdle } from "../idle";
import { BEDS, type BedKit, type BedLayers } from "./beds";
import {
  CUE_IDS,
  EGG_CUES,
  FILE_CUES,
  FOUND_CUES,
  IMPACT_CUES,
  MEET_CUES,
  TOY_CUES,
  fileBase,
  isFileCue,
  type BedId,
  type CueId,
  type FileCueId,
  type RecipeCueId,
  type Shot,
} from "./cues";
import { RECIPES, droneHum, levelOf } from "./recipes";
import { dbToGain, filter, gain, holdAt, rng, type Kit } from "./synth";
import type { CueOptions, SoundLoop } from "./index";

/** Bed loudness target (spec §3.5). */
const BED_LUFS = -30;
/** Crossfade between beds (seconds, equal power). */
const XFADE = 1.5;
/** SFX duck depth under effects (dB). */
const DUCK_DB = -6;
const MAX_VOICES = 24;
/** Cues that legitimately repeat fast (ticks); everything else drops a
 *  same-id repeat inside 70 ms (an event voiced twice). */
const REPEATABLE = new Set<CueId>(["compass-ratchet", "typewriter-click", "deadeye-scratch", "drone-gate", "candle-fwip"]);

export type EngineHooks = {
  /** Keep the context running `ms` longer even though motion just turned
   *  off (the typed "nox" spell pauses motion and must still be heard). */
  grace(ms: number): void;
};

export type EngineState = {
  ctx: AudioContextState;
  running: boolean;
  bed: BedId | null;
  storm: boolean;
  beds: BedId[];
  trims: Partial<Record<BedId, number>>;
  files: Partial<Record<FileCueId, "pending" | "ok" | "missing">>;
  norms: number;
  voices: number;
  cues: { id: CueId; t: number }[];
};

export type Engine = {
  cue(id: CueId, o?: CueOptions): void;
  loop(id: CueId, o?: CueOptions): SoundLoop;
  bed(b: BedId | null): void;
  layer(name: "storm", on: boolean): void;
  duck(db: number, ms: number): void;
  setRunning(on: boolean): void;
  /** Lab/probe: the master's current peak and RMS (dBFS). */
  meter(): { peakDb: number; rmsDb: number };
  /** Lab/probe: a snapshot of the engine. */
  state(): EngineState;
  /** Lab: a recipe's measured peak (dBFS) before normalisation, if known. */
  measuredPeakDb(id: CueId): number | null;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** y = x below 0.4, then a tanh knee that never passes 0.5 (−6 dBFS). */
function ceilingCurve(): Float32Array<ArrayBuffer> {
  const n = 2049;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    const a = Math.abs(x);
    c[i] = a <= 0.4 ? x : Math.sign(x) * (0.4 + 0.1 * Math.tanh((a - 0.4) / 0.1));
  }
  return c;
}

export function createEngine(ctx: AudioContext, hooks: EngineHooks): Engine {
  const sr = ctx.sampleRate;
  const rnd = rng((Date.now() & 0xffff) + 1);

  /* — The master graph ———————————————————————————————————————————— */
  const ceiling = new WaveShaperNode(ctx, { curve: ceilingCurve(), oversample: "none" });
  const master = gain(ctx, 0);
  const sfxBus = gain(ctx, 1);
  const bedBus = gain(ctx, 1);
  const slow = filter(ctx, "lowpass", 20000, 0.5);
  bedBus.connect(slow).connect(master);
  sfxBus.connect(master);
  master.connect(ceiling).connect(ctx.destination);

  let running = false;
  let voices = 0;
  const last = new Map<CueId, number>();
  const log: { id: CueId; t: number }[] = [];

  function setRunning(v: boolean): void {
    running = v;
    const t = ctx.currentTime;
    holdAt(master.gain, t);
    master.gain.setTargetAtTime(v ? 1 : 0, t, v ? 0.03 : 0.008);
  }

  const live = () => running && ctx.state === "running";

  /* — Ducking ——————————————————————————————————————————————————————— */
  let duckUntil = 0;
  let holds = 0;
  function duckFor(sec: number, db = DUCK_DB): void {
    const t = ctx.currentTime;
    duckUntil = Math.max(duckUntil, t + sec);
    const p = bedBus.gain;
    holdAt(p, t);
    p.setTargetAtTime(dbToGain(-Math.abs(db)), t, 0.04);
    if (!holds) p.setTargetAtTime(1, duckUntil, 0.25);
  }
  function unhold(): void {
    holds = Math.max(0, holds - 1);
    if (!holds) duckFor(0.05);
  }

  /* — Offline measurement (levels) ————————————————————————————————— */
  const norms = new Map<CueId, number>();
  const peaks = new Map<CueId, number>();

  async function peakOf(build: (c: BaseAudioContext, out: AudioNode, pan: AudioParam) => void, seconds: number): Promise<number> {
    const oc = new OfflineAudioContext(2, Math.ceil(sr * seconds), sr);
    const v = gain(oc, 1);
    const p = new StereoPannerNode(oc, { pan: 0 });
    v.connect(p).connect(oc.destination);
    build(oc, v, p.pan);
    const buf = await oc.startRendering();
    let peak = 0;
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const a = d[i] < 0 ? -d[i] : d[i];
        if (a > peak) peak = a;
      }
    }
    return peak;
  }

  function measureCue(id: RecipeCueId): Promise<void> {
    const build =
      id === "drone-hum"
        ? (c: BaseAudioContext, out: AudioNode) => void droneHum(c, out, 1)
        : (c: BaseAudioContext, out: AudioNode, pan: AudioParam) => {
            const k: Kit = { ctx: c, out, t0: 0.005, rate: 1, rnd: rng(7), pan, end: 0 };
            RECIPES[id](k);
          };
    return peakOf(build, id === "drone-hum" ? 1 : 2.2).then(
      (pk) => {
        if (pk <= 1e-5) return;
        peaks.set(id, pk);
        norms.set(id, clamp(dbToGain(levelOf(id)) / pk, 0.02, 8));
      },
      () => {},
    );
  }

  /** Before its measurement lands, a cue assumes a 0.45 design peak. */
  const normOf = (id: CueId) => norms.get(id) ?? dbToGain(levelOf(id)) / 0.45;

  async function measureBed(id: BedId): Promise<number> {
    const oc = new OfflineAudioContext(1, Math.ceil(sr * 6), sr);
    // BS.1770 K-weighting: a +4 dB high shelf at ~1.7 kHz and a 38 Hz high-pass.
    const shelf = new BiquadFilterNode(oc, { type: "highshelf", frequency: 1681, gain: 4 });
    const hp = new BiquadFilterNode(oc, { type: "highpass", frequency: 38, Q: 0.5 });
    shelf.connect(hp).connect(oc.destination);
    BEDS[id](bedKit(oc, shelf, false).kit);
    const d = (await oc.startRendering()).getChannelData(0);
    let s = 0;
    for (let i = sr; i < d.length; i++) s += d[i] * d[i];
    // Mono rendered; it plays on both channels (+3.01 dB in BS.1770).
    const lufs = -0.691 + 10 * Math.log10(s / (d.length - sr) + 1e-12) + 3.01;
    return clamp(dbToGain(BED_LUFS - lufs), 0.01, 30);
  }

  /* — Cues ——————————————————————————————————————————————————————————— */
  function remember(id: CueId): void {
    log.push({ id, t: Math.round(performance.now()) });
    if (log.length > 40) log.shift();
  }

  function occupy(node: AudioNode, sec: number): void {
    voices++;
    duckFor(sec);
    window.setTimeout(
      () => {
        voices--;
        node.disconnect();
      },
      (sec + 0.3) * 1000,
    );
  }

  function voice(o: CueOptions, level: number): { v: GainNode; p: StereoPannerNode } {
    const v = gain(ctx, clamp(o.gain ?? 1, 0, 1) * level);
    const p = new StereoPannerNode(ctx, { pan: clamp(o.pan ?? 0, -1, 1) });
    v.connect(p).connect(sfxBus);
    return { v, p };
  }

  function play(id: CueId, o: CueOptions = {}, delay = 0): void {
    if (!live()) return;
    const now = performance.now();
    if (now - (last.get(id) ?? -1e9) < (REPEATABLE.has(id) ? 15 : 70)) return;
    last.set(id, now);
    if (voices >= MAX_VOICES) return;
    if (isFileCue(id)) {
      playFile(id, o, delay);
      return;
    }
    const { v, p } = voice(o, normOf(id));
    const k: Kit = { ctx, out: v, t0: ctx.currentTime + 0.005 + delay, rate: clamp(o.rate ?? 1, 0.25, 4), rnd, pan: p.pan, end: 0 };
    RECIPES[id](k);
    occupy(p, delay + k.end);
    remember(id);
  }

  /* — Files (TTS) ————————————————————————————————————————————————————— */
  const files = new Map<FileCueId, Promise<AudioBuffer | null>>();
  const fileState: Partial<Record<FileCueId, "pending" | "ok" | "missing">> = {};
  const probe = document.createElement("audio");
  const exts: readonly string[] = probe.canPlayType('audio/webm; codecs="opus"') ? ["webm", "mp3"] : ["mp3"];

  function loadFile(id: FileCueId): Promise<AudioBuffer | null> {
    let p = files.get(id);
    if (!p) {
      fileState[id] = "pending";
      p = (async () => {
        for (const e of exts) {
          let res: Response;
          try {
            res = await fetch(`${fileBase(id)}.${e}`);
          } catch {
            break;
          }
          if (!res.ok) break; // missing: no second request
          try {
            const buf = await ctx.decodeAudioData(await res.arrayBuffer());
            fileState[id] = "ok";
            return buf;
          } catch {
            // undecodable here: try the next format
          }
        }
        fileState[id] = "missing";
        return null;
      })();
      files.set(id, p);
    }
    return p;
  }

  function playFile(id: FileCueId, o: CueOptions, delay: number): void {
    const asked = performance.now();
    void loadFile(id).then((buf) => {
      const late = (performance.now() - asked) / 1000;
      if (!buf || !live() || late > 1.5) return;
      const rate = clamp(o.rate ?? 1, 0.5, 2);
      const s = new AudioBufferSourceNode(ctx, { buffer: buf, playbackRate: rate });
      const { v, p } = voice(o, 1);
      s.connect(v);
      const wait = Math.max(0, delay - late);
      s.start(ctx.currentTime + 0.005 + wait);
      occupy(p, wait + buf.duration / rate);
      remember(id);
    });
  }

  /* — Loops ————————————————————————————————————————————————————————— */
  function loop(id: CueId, o: CueOptions = {}): SoundLoop {
    const { v, p } = voice(o, normOf(id));
    holds++;
    duckFor(0.1);
    let stopped = false;
    let stopInner: () => void;
    let setRate: (r: number) => void = () => {};
    if (id === "drone-hum") {
      const h = droneHum(ctx, v, o.rate ?? 1);
      stopInner = h.stop;
      setRate = h.rate;
    } else {
      // Any other cue loops by re-triggering back to back while running.
      let timer = 0;
      let rate = clamp(o.rate ?? 1, 0.25, 4);
      const again = () => {
        let len = 0.5;
        if (live() && !isFileCue(id)) {
          const k: Kit = { ctx, out: v, t0: ctx.currentTime + 0.005, rate, rnd, pan: p.pan, end: 0 };
          RECIPES[id](k);
          len = Math.max(0.05, k.end);
        }
        timer = window.setTimeout(again, len * 1000);
      };
      again();
      stopInner = () => window.clearTimeout(timer);
      setRate = (r) => {
        rate = clamp(r, 0.25, 4);
      };
    }
    return {
      set(n) {
        const t = ctx.currentTime;
        if (n.rate != null) setRate(n.rate);
        if (n.gain != null) v.gain.setTargetAtTime(clamp(n.gain, 0, 1) * normOf(id), t, 0.05);
        if (n.pan != null) p.pan.setTargetAtTime(clamp(n.pan, -1, 1), t, 0.05);
      },
      stop() {
        if (stopped) return;
        stopped = true;
        stopInner();
        v.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        unhold();
        window.setTimeout(() => p.disconnect(), 600);
      },
    };
  }

  /* — Beds ——————————————————————————————————————————————————————————— */
  type LiveBed = { id: BedId; fade: GainNode; trim: GainNode; stop(at: number): void; layers: BedLayers | void; timer: number };
  const beds = new Map<BedId, LiveBed>();
  const trims: Partial<Record<BedId, number>> = {};
  let current: BedId | null = null;
  let storm = false;

  function bedKit(c: BaseAudioContext, out: AudioNode, isLive: boolean): { kit: BedKit; stop(at: number): void } {
    const srcs: AudioScheduledSourceNode[] = [];
    const timers: { id: number }[] = [];
    const r = isLive ? rnd : rng(11);
    const kit: BedKit = {
      ctx: c,
      out,
      live: isLive,
      rnd: r,
      src(n) {
        n.start(c.currentTime);
        srcs.push(n);
        return n;
      },
      every(min, max, fn) {
        if (!isLive) return;
        const h = { id: 0 };
        timers.push(h);
        const tick = () => {
          h.id = window.setTimeout(
            () => {
              if (live()) fn({ ctx: c, out, t0: c.currentTime + 0.05, rate: 1, rnd: r, end: 0 });
              tick();
            },
            (min + r() * (max - min)) * 1000,
          );
        };
        tick();
      },
    };
    return {
      kit,
      stop(at) {
        for (const h of timers) window.clearTimeout(h.id);
        for (const s of srcs) {
          try {
            s.stop(at);
          } catch {
            // already stopped
          }
        }
      },
    };
  }

  function startBed(id: BedId): LiveBed {
    const fade = gain(ctx, 0);
    const trim = gain(ctx, trims[id] ?? 0.3);
    trim.connect(fade).connect(bedBus);
    const { kit, stop } = bedKit(ctx, trim, true);
    const layers = BEDS[id](kit);
    if (layers && storm) layers.layer("storm", true);
    const e: LiveBed = {
      id,
      fade,
      trim,
      layers,
      timer: 0,
      stop(at) {
        stop(at);
        window.setTimeout(() => fade.disconnect(), 500);
      },
    };
    beds.set(id, e);
    if (trims[id] == null) {
      void measureBed(id).then(
        (g) => {
          trims[id] = g;
          e.trim.gain.setTargetAtTime(g, ctx.currentTime, 0.15);
        },
        () => {},
      );
    }
    return e;
  }

  function equalPower(p: AudioParam, up: boolean): void {
    const t = ctx.currentTime;
    const v0 = holdAt(p, t);
    const curve = new Float32Array(33);
    for (let i = 0; i <= 32; i++) {
      const x = ((i / 32) * Math.PI) / 2;
      curve[i] = up ? v0 + (1 - v0) * Math.sin(x) : v0 * Math.cos(x);
    }
    p.setValueCurveAtTime(curve, t + 0.01, XFADE);
  }

  function retire(e: LiveBed): void {
    window.clearTimeout(e.timer);
    const done = () => {
      // Wait for a running context and a finished fade before stopping.
      if (ctx.state !== "running" || e.fade.gain.value > 0.002) {
        e.timer = window.setTimeout(done, 500);
        return;
      }
      e.stop(ctx.currentTime);
      beds.delete(e.id);
    };
    e.timer = window.setTimeout(done, (XFADE + 0.2) * 1000);
  }

  function bed(b: BedId | null): void {
    if (b === current) return;
    const old = current ? beds.get(current) : undefined;
    if (old) {
      equalPower(old.fade.gain, false);
      retire(old);
    }
    current = b;
    if (b) {
      const e = beds.get(b) ?? startBed(b);
      window.clearTimeout(e.timer);
      equalPower(e.fade.gain, true);
    }
  }

  function layer(name: "storm", v: boolean): void {
    if (name !== "storm" || storm === v) return;
    storm = v;
    beds.get("pirates")?.layers?.layer("storm", v);
  }

  /* — Dead Eye's time-slow on the beds ——————————————————————————————— */
  function slowmo(v: boolean): void {
    const t = ctx.currentTime;
    holdAt(slow.frequency, t);
    slow.frequency.setTargetAtTime(v ? 650 : 20000, t, v ? 0.25 : 0.4);
  }

  /* — Page events → cues ———————————————————————————————————————————— */
  const shots = (list?: readonly Shot[]) => list?.forEach(([id, dt]) => play(id, {}, dt));
  let releasedAt = -1e9;
  const release = () => {
    slowmo(false);
    if (performance.now() - releasedAt < 1500) return;
    releasedAt = performance.now();
    play("deadeye-release");
  };
  on("impact", (d) => {
    const id = IMPACT_CUES[d.world];
    if (id) play(id);
  });
  on("transition:meet", (d) => shots(MEET_CUES[d.card]));
  on("letterbox", (d) => play("letterbox-whum", { rate: d.state === "open" ? 1.12 : 1 }));
  on("hunt:found", (d) => {
    const id = FOUND_CUES[String(d.id).split("-")[0]];
    if (id) play(id);
    if (d.count >= 12) play("hunt-complete", {}, 0.5);
  });
  on("egg:trigger", (d) => {
    if (d.id === "nox") hooks.grace(1500);
    shots(EGG_CUES[d.id]);
  });
  on("game:start", (d) => {
    if (d.game !== "deadeye") return;
    slowmo(true);
    play("deadeye-swell");
  });
  on("game:gate", () => play("drone-gate"));
  on("game:mark", () => play("deadeye-scratch"));
  on("game:fire", () => play("deadeye-strike"));
  on("game:finish", (d) => (d.game === "drone" ? play("drone-finish") : release()));
  on("game:stop", (d) => {
    if (d.game === "deadeye") release();
  });
  on("toy", (d) => {
    const m = TOY_CUES[d.toy]?.[d.action];
    if (!m) return;
    const step = d.toy === "candles" && typeof d.n === "number" ? 1 + 0.06 * d.n : 1;
    play(m[0], { rate: (m[1] ?? 1) * step * (d.toy === "compass" ? 0.96 + rnd() * 0.08 : 1) });
  });
  on("post-credits", () => {
    play("postcredits-whoosh");
    play("postcredits-chime", {}, 0.95);
  });
  on("dc:start", () => play("projector-start"));
  on("dc:stop", () => play("reel-runout"));
  window.addEventListener("egg:snitch-caught", () => play("snitch-ting"));

  /* — Warm-up after the first unmute: TTS files, then every level ————— */
  onIdle(() => FILE_CUES.forEach((id) => void loadFile(id)), { timeout: 3000 });
  onIdle(
    () => {
      const ids = CUE_IDS.filter((id): id is RecipeCueId => !isFileCue(id));
      void ids.reduce((p, id) => p.then(() => measureCue(id)), Promise.resolve());
    },
    { timeout: 4000 },
  );

  /* — Meter (lab / probe) ——————————————————————————————————————————— */
  let analyser: AnalyserNode | null = null;
  let scratch: Float32Array<ArrayBuffer> | null = null;
  function meter(): { peakDb: number; rmsDb: number } {
    if (!analyser) {
      analyser = new AnalyserNode(ctx, { fftSize: 2048 });
      scratch = new Float32Array(analyser.fftSize);
      ceiling.connect(analyser);
    }
    const d = scratch as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(d);
    let pk = 0;
    let s = 0;
    for (let i = 0; i < d.length; i++) {
      const a = Math.abs(d[i]);
      if (a > pk) pk = a;
      s += d[i] * d[i];
    }
    const db = (x: number) => (x > 1e-6 ? 20 * Math.log10(x) : -120);
    return { peakDb: db(pk), rmsDb: db(Math.sqrt(s / d.length)) };
  }

  const engine: Engine = {
    cue: (id, o) => play(id, o),
    loop,
    bed,
    layer,
    duck: (db, ms) => {
      if (live()) duckFor(Math.max(0, ms) / 1000, db);
    },
    setRunning,
    meter,
    state: () => ({
      ctx: ctx.state,
      running,
      bed: current,
      storm,
      beds: [...beds.keys()],
      trims: { ...trims },
      files: { ...fileState },
      norms: norms.size,
      voices,
      cues: log.slice(-20),
    }),
    measuredPeakDb: (id) => {
      const pk = peaks.get(id);
      return pk ? 20 * Math.log10(pk) : null;
    },
  };
  (window as Window & { __p3sound?: Engine }).__p3sound = engine;
  return engine;
}
