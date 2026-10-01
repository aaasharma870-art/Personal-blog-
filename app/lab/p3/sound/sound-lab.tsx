"use client";

/* /lab/p3/sound client bench. Workbench only — not product UI. */

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { emit } from "@/lib/events";
import { sound, bedLayer, type BedId, type CueId, type SoundLoop } from "@/lib/audio";
import { BED_IDS, CUE_IDS, isFileCue } from "@/lib/audio/cues";
import type { EngineState } from "@/lib/audio/engine";
import { setSoundOn, soundEngine, useSound } from "@/lib/audio/store";
import { SoundToggle } from "@/components/audio/sound-toggle";
import { MotionToggle } from "@/components/primitives/motion-toggle";
import { cn } from "@/lib/utils";

const GROUPS: readonly { title: string; test: (id: CueId) => boolean }[] = [
  { title: "Transitions and scenes", test: (id) => /^(broom|wave-wash|wave-recede|duster|shutter|flash|match|shimmer|letterbox|projector|reel|impact|title|typewriter)/.test(id) },
  { title: "Toys", test: (id) => /^(compass|drone|deadeye|candle|hall)/.test(id) },
  { title: "Eggs", test: (id) => /^(map|ink|lumos|nox|snitch|parley|flag|coin|hollow|kraken|wave-slap|heartbeat|quad|pen|eagle|bone|fire)/.test(id) },
  { title: "Hunt, post-credits, toggle", test: (id) => /^(found|hunt|postcredits|toggle)/.test(id) },
  { title: "Spoken lines (files)", test: (id) => isFileCue(id) },
];

const EVENTS: readonly { label: string; fire: () => void }[] = [
  { label: "impact pirates", fire: () => emit("impact", { world: "pirates" }) },
  { label: "impact idiots", fire: () => emit("impact", { world: "idiots" }) },
  { label: "impact rdr2", fire: () => emit("impact", { world: "rdr2" }) },
  { label: "impact hp", fire: () => emit("impact", { world: "hp" }) },
  { label: "meet opening", fire: () => emit("transition:meet", { card: "opening" }) },
  { label: "meet seam", fire: () => emit("transition:meet", { card: "seam" }) },
  { label: "meet tintype", fire: () => emit("transition:meet", { card: "tintype" }) },
  { label: "meet ignite", fire: () => emit("transition:meet", { card: "ignite" }) },
  { label: "letterbox close", fire: () => emit("letterbox", { state: "close" }) },
  { label: "letterbox open (silent)", fire: () => emit("letterbox", { state: "open" }) },
  { label: "found pc-coin (3/12)", fire: () => emit("hunt:found", { id: "pc-coin", count: 3 }) },
  { label: "found hp-map (12/12)", fire: () => emit("hunt:found", { id: "hp-map", count: 12 }) },
  { label: "dead eye: start", fire: () => emit("game:start", { game: "deadeye" }) },
  { label: "dead eye: mark", fire: () => emit("game:mark", { row: "lab" }) },
  { label: "dead eye: fire", fire: () => emit("game:fire") },
  { label: "dead eye: finish", fire: () => emit("game:finish", { game: "deadeye", score: 5 }) },
  { label: "drone: gate", fire: () => emit("game:gate", { n: 1 }) },
  { label: "drone: finish", fire: () => emit("game:finish", { game: "drone", score: 7 }) },
  { label: "compass open / tick / settle", fire: () => ["open", "tick", "settle"].forEach((a, i) => window.setTimeout(() => emit("toy", { toy: "compass", action: a }), i * 350)) },
  { label: "candles 1–4, done", fire: () => [1, 2, 3, 4].forEach((n) => window.setTimeout(() => emit("toy", { toy: "candles", action: n === 4 ? "done" : "light", n }), n * 300)) },
  { label: "post-credits", fire: () => emit("post-credits", { extended: false }) },
  { label: "director's cut start", fire: () => emit("dc:start") },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-rule pt-4">
      <h2 className="type-meta text-fg-muted">{title}</h2>
      {children}
    </section>
  );
}

function Pad({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded-control border border-rule px-3 py-2 text-left type-meta transition-colors duration-(--dur-micro)",
        active ? "bg-fg text-bg" : "text-fg hover:bg-fg/10",
      )}
    >
      {children}
    </button>
  );
}

const db = (x: number | null | undefined) => (x == null ? "—" : `${x.toFixed(1)} dB`);

function measuredLabel(m: { peakDb: number; lufs: number; gain: number } | null): string {
  if (!m) return "not measured yet";
  const g = 20 * Math.log10(m.gain);
  return `raw ${m.peakDb.toFixed(1)} dBFS peak, ${m.lufs.toFixed(1)} LUFS-M; plays at ${(m.peakDb + g).toFixed(1)} dBFS peak, ${(m.lufs + g).toFixed(1)} LUFS-M`;
}

export function SoundLab() {
  const { on, available } = useSound();
  const [rate, setRate] = useState(1);
  const [pan, setPan] = useState(0);
  const [bed, setBed] = useState<BedId | null>(null);
  const [storm, setStorm] = useState(false);
  const [hum, setHum] = useState(1);
  const [humOn, setHumOn] = useState(false);
  const humRef = useRef<SoundLoop | null>(null);
  const [state, setState] = useState<EngineState | null>(null);
  const [level, setLevel] = useState<{ peakDb: number; rmsDb: number } | null>(null);
  const [, setTick] = useState(0);

  // Engine readout and meter, 5×/s, only while sound is on and the tab is visible.
  useEffect(() => {
    if (!on) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      const e = soundEngine();
      if (!e) return;
      setState(e.state());
      setLevel(e.meter());
      setTick((t) => t + 1);
    }, 200);
    return () => window.clearInterval(id);
  }, [on]);

  useEffect(() => {
    const ref = humRef;
    return () => ref.current?.stop();
  }, []);

  const engine = soundEngine();

  return (
    <div className="flex flex-col gap-tier-group">
      <Section title="Sound">
        <div className="flex flex-wrap items-center gap-3">
          <SoundToggle follow={false} className="inline-flex!" />
          <Pad onClick={() => void setSoundOn(!on)} active={on}>
            {on ? "Sound on" : available ? "Turn sound on" : "Unavailable (motion off or no Web Audio)"}
          </Pad>
          <MotionToggle showLabel />
        </div>
        <dl className="type-meta grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-fg-muted">
          <dt>CONTEXT</dt>
          <dd className="text-fg">{state?.ctx ?? "none"}</dd>
          <dt>RUNNING</dt>
          <dd>{state ? String(state.running) : "—"}</dd>
          <dt>MASTER PEAK / RMS</dt>
          <dd>
            {db(level?.peakDb)} / {db(level?.rmsDb)}
          </dd>
          <dt>BED</dt>
          <dd>
            {state?.bed ?? "none"} {state?.storm ? "+ storm" : ""}
          </dd>
          <dt>BED TRIMS (to −30 LUFS)</dt>
          <dd>{state ? Object.entries(state.trims).map(([b, g]) => `${b} ×${(g as number).toFixed(2)}`).join(" · ") || "—" : "—"}</dd>
          <dt>FILES</dt>
          <dd>{state ? Object.entries(state.files).map(([f, s]) => `${f} ${s}`).join(" · ") || "—" : "—"}</dd>
          <dt>LEVELS MEASURED</dt>
          <dd>{state ? `${state.norms} / ${CUE_IDS.length - 5}` : "—"}</dd>
          <dt>VOICES</dt>
          <dd>{state?.voices ?? "—"}</dd>
        </dl>
      </Section>

      <Section title="Beds (crossfade 1.5 s, equal power)">
        <div className="flex flex-wrap gap-2">
          {BED_IDS.map((b) => (
            <Pad
              key={b}
              active={bed === b}
              onClick={() => {
                setBed(b);
                sound.bed(b);
              }}
            >
              {b}
            </Pad>
          ))}
          <Pad
            active={bed === null}
            onClick={() => {
              setBed(null);
              sound.bed(null);
            }}
          >
            silence
          </Pad>
          <Pad
            active={storm}
            onClick={() => {
              setStorm(!storm);
              bedLayer("storm", !storm);
            }}
          >
            pirates storm layer
          </Pad>
          <Pad onClick={() => sound.duck(6, 1500)}>duck −6 dB, 1.5 s</Pad>
        </div>
      </Section>

      <Section title="Cue options">
        <div className="flex flex-wrap items-center gap-6 type-meta text-fg-muted">
          <label className="flex items-center gap-2">
            rate {rate.toFixed(2)}
            <input type="range" min={0.5} max={2} step={0.01} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-2">
            pan {pan.toFixed(2)}
            <input type="range" min={-1} max={1} step={0.01} value={pan} onChange={(e) => setPan(Number(e.target.value))} />
          </label>
        </div>
      </Section>

      {GROUPS.map((g) => (
        <Section key={g.title} title={g.title}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
            {CUE_IDS.filter(g.test).map((id) => (
              <Pad key={id} onClick={() => sound.cue(id, { rate, pan })} title={isFileCue(id) ? "a file (public/audio)" : measuredLabel(engine?.measured(id) ?? null)}>
                {id}
              </Pad>
            ))}
          </div>
        </Section>
      ))}

      <Section title="Loop: the drone's hum (pitch = speed)">
        <div className="flex flex-wrap items-center gap-4">
          <Pad
            active={humOn}
            onClick={() => {
              if (humRef.current) {
                humRef.current.stop();
                humRef.current = null;
                setHumOn(false);
              } else {
                humRef.current = sound.loop("drone-hum", { rate: hum });
                setHumOn(true);
              }
            }}
          >
            {humOn ? "stop hum" : "start hum"}
          </Pad>
          <label className="flex items-center gap-2 type-meta text-fg-muted">
            speed {hum.toFixed(2)} ({Math.round(Math.min(320, Math.max(180, 180 * hum)))} Hz)
            <input
              type="range"
              min={1}
              max={1.78}
              step={0.01}
              value={hum}
              onChange={(e) => {
                const r = Number(e.target.value);
                setHum(r);
                humRef.current?.set({ rate: r });
              }}
            />
          </label>
        </div>
      </Section>

      <Section title="Page events (the engine's listeners)">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
          {EVENTS.map((e) => (
            <Pad key={e.label} onClick={e.fire}>
              {e.label}
            </Pad>
          ))}
        </div>
        <p className="type-small text-fg-muted">
          Last cues: {state?.cues.map((c) => c.id).join(" · ") || "—"}
        </p>
      </Section>
    </div>
  );
}
