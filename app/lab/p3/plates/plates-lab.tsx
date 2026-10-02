"use client";

import { useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CameraGroup } from "@/components/primitives/camera";
import { DepthPlate } from "@/components/primitives/depth-plate";
import { LivePlate } from "@/components/primitives/live-plate";
import { MediaFrame } from "@/components/primitives/media-frame";
import { MotionToggle } from "@/components/primitives/motion-toggle";
import { WeatherLayer, type WeatherKind } from "@/components/stage/weather-layer";
import { useFrameSequence } from "@/components/worlds/pirates/use-frame-sequence";
import { loopFor } from "@/lib/loops";
import { markOf, rectOf, sequenceFrames, type MediaId } from "@/lib/media";

/* The lab's plates: loop hosts and the loop-less ones (the code path). */
const PLATES: readonly MediaId[] = [
  "iconic-ice",
  "MV-05a",
  "iconic-corridor",
  "iconic-camp",
  "MV-10",
  "iconic-drone",
  "iconic-express",
  "iconic-deadeye",
];

const WEATHER: readonly { kind: WeatherKind; plate: MediaId }[] = [
  { kind: "spray", plate: "iconic-pearl" },
  { kind: "chalk", plate: "iconic-corridor" },
  { kind: "fireflies", plate: "MV-10" },
  { kind: "motes", plate: "MV-08" },
];

const SEQ = sequenceFrames("SEQ-HALL");

/** The plate's registered line (the engine's rule, components/stage/stage.tsx `lineOf`). */
function lineOf(id: MediaId): number | null {
  const h = markOf(id, "horizon") ?? markOf(id, "lake");
  if (h) return h[1];
  const l = markOf(id, "ledgeL");
  const r = markOf(id, "ledgeR");
  return l && r ? (l[1] + r[1]) / 2 : null;
}

type SeqMem = { resident: string | null; frames: number; bytes: number; peak: number };

const btn = "type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted";

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="type-small flex items-center gap-3 text-fg-muted">
      <span className="w-24 tabular-nums">
        {label} {value.toFixed(3)}
      </span>
      <input type="range" min={0} max={1} step={0.001} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1" />
    </label>
  );
}

export function PlatesLab() {
  const [pv, setPv] = useState(0);
  const p = useMotionValue(0);
  const [dv, setDv] = useState(0.5);
  const d = useMotionValue(0.5);
  const [sv, setSv] = useState(0);
  const idx = useRef(0);
  const [seqOn, setSeqOn] = useState(false);
  const seq = useFrameSequence(SEQ, seqOn, { window: 12, index: idx });
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState("");

  const setP = (v: number) => {
    setPv(v);
    p.set(v);
  };
  const setD = (v: number) => {
    setDv(v);
    d.set(v);
  };

  // draw the sequence frame (the nearest decoded one while the window
  // fills); retries for ≤ 2 s of frames while the window decodes
  const { frameAt, decoded, ready } = seq;
  useEffect(() => {
    const c = canvas.current;
    if (!c || !SEQ.length || !seqOn) return;
    const i = Math.round(sv * (SEQ.length - 1));
    idx.current = i;
    let raf = 0;
    let tries = 120;
    const draw = () => {
      const f = frameAt(i);
      const ctx = c.getContext("2d");
      if (f && ctx) ctx.drawImage(f, 0, 0, c.width, c.height);
      else if (tries-- > 0) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [sv, seqOn, frameAt, decoded, ready]);

  // readouts + the probe's handle
  useEffect(() => {
    const w = window as Window & { __platesLab?: unknown; __seqMem?: SeqMem; __decoderHolder?: string | null };
    w.__platesLab = {
      plates: PLATES,
      p: (v: number) => setP(v),
      depth: (v: number) => setD(v),
      seq: (on: boolean, v?: number) => {
        setSeqOn(on);
        if (v !== undefined) setSv(v);
      },
    };
    const t = window.setInterval(() => {
      const m = w.__seqMem;
      const states = [...document.querySelectorAll("[data-plates-lab] [data-media-state]")]
        .map((el) => el.getAttribute("data-media-state"))
        .reduce<Record<string, number>>((a, s) => ({ ...a, [s ?? "?"]: (a[s ?? "?"] ?? 0) + 1 }), {});
      setStats(
        `decoder ${w.__decoderHolder ?? "–"} · frames ${Object.entries(states)
          .map(([k, v]) => `${k} ${v}`)
          .join(", ")} · seq ${m ? `${m.frames} decoded, ${(m.bytes / 2 ** 20).toFixed(1)} MB (peak ${(m.peak / 2 ** 20).toFixed(1)})` : "–"}`,
      );
    }, 500);
    return () => {
      window.clearInterval(t);
      delete w.__platesLab;
    };
    // the setters are stable; the handle is installed once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const board = rectOf("iconic-ice", "boardRect");

  return (
    <div className="flex flex-col gap-tier-group" data-plates-lab="">
      <div className="flex flex-wrap items-center gap-2">
        <MotionToggle showLabel />
        <p className="type-small text-fg-muted" data-plates-lab-status="">
          {stats}
        </p>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="lab-loops">
        <h2 id="lab-loops" className="type-small text-fg">
          LivePlate: a registered loop, else the code camera + depth
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {PLATES.map((m) => {
            const loop = loopFor(m);
            const line = lineOf(m);
            return (
              <figure key={m} className="flex flex-col gap-1">
                <LivePlate media={m} sizes="(min-width: 84rem) 20rem, 46vw" className="aspect-video w-full" />
                <figcaption className="type-meta text-fg-muted">
                  {m} · {loop ? `loop ${loop}` : `code${line !== null ? `, depth @${line.toFixed(3)}` : ""}`}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="lab-camera">
        <h2 id="lab-camera" className="type-small text-fg">
          CameraGroup on a progress value: a push 1 → 1.35 toward the board, the overlay rides it
        </h2>
        <div className="relative aspect-[2.39/1] w-full overflow-hidden bg-bg">
          <CameraGroup
            spec={{
              kind: "push",
              scale: [1, 1.35],
              focal: board ? [(board.x0 + board.x1) / 2, (board.y0 + board.y1) / 2] : [0.6, 0.25],
              driver: "progress",
            }}
            progress={p}
            className="absolute inset-0"
          >
            <MediaFrame media="iconic-ice" layout="fill" playOn="never" loop={false} sizes="(min-width: 84rem) 80rem, 92vw" />
            {board ? (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
                <rect
                  x={board.x0 * 100}
                  y={board.y0 * 100}
                  width={(board.x1 - board.x0) * 100}
                  height={(board.y1 - board.y0) * 100}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={0.3}
                  vectorEffect="non-scaling-stroke"
                  className="text-fg-muted"
                />
              </svg>
            ) : null}
          </CameraGroup>
        </div>
        <Slider label="p" value={pv} onChange={setP} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="lab-depth">
        <h2 id="lab-depth" className="type-small text-fg">
          DepthPlate on the horizon (far .4×, near 1×)
        </h2>
        <div className="relative aspect-video w-full max-w-[48rem] overflow-hidden bg-bg" data-lab-depth="">
          <DepthPlate media="MV-10" spec={{ line: lineOf("MV-10") ?? 0.333, max: 0.015 }} progress={d} sizes="48rem" />
        </div>
        <Slider label="travel" value={dv} onChange={setD} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="lab-weather">
        <h2 id="lab-weather" className="type-small text-fg">
          Weather
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {WEATHER.map((w) => (
            <figure key={w.kind} className="flex flex-col gap-1">
              <div className="relative aspect-video w-full overflow-hidden bg-bg">
                <MediaFrame media={w.plate} layout="fill" playOn="never" loop={false} sizes="20rem" />
                <WeatherLayer kind={w.kind} zone="frame" />
              </div>
              <figcaption className="type-meta text-fg-muted">{w.kind}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="lab-seq">
        <h2 id="lab-seq" className="type-small text-fg">
          Sequence window (SEQ-HALL, ±12 frames decoded)
        </h2>
        <canvas ref={canvas} width={1280} height={720} className="aspect-video w-full max-w-[48rem] bg-bg" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn} aria-pressed={seqOn} onClick={() => setSeqOn(!seqOn)}>
            {seqOn ? "release" : "load"}
          </button>
          <span className="type-meta text-fg-muted" data-seq-lab="">
            {seq.decoded}/{seq.total} fetched · {seq.ready ? "ready" : "not ready"}
            {seq.failed ? " · failed" : ""}
          </span>
        </div>
        <Slider label="frame" value={sv} onChange={setSv} />
      </section>
    </div>
  );
}
