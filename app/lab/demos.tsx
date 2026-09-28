"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import { decoderHolderLabel, subscribeDecoder } from "@/lib/decoder-lock";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { Lens, useApertureOnce, type LensRect, type LensState } from "@/components/primitives/lens";
import { Loader, type LoaderMode } from "@/components/primitives/loader";
import { MediaFrame, type MediaFrameState } from "@/components/primitives/media-frame";
import type { MediaId } from "@/lib/media";

/* /lab client demos. Workbench only — not product components. */

export function MotionReadout() {
  const { reduced, osReduced, paused } = useMotionPreference();
  const holder = useSyncExternalStore(subscribeDecoder, decoderHolderLabel, () => null);
  return (
    <dl className="type-meta grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-fg-muted" data-lab-readout="">
      <dt>MOTION</dt>
      <dd className="text-fg" data-lab-motion={reduced ? "off" : "on"}>
        {reduced ? "OFF" : "ON"}
      </dd>
      <dt>OS REDUCED</dt>
      <dd>{osReduced ? "YES" : "NO"}</dd>
      <dt>PAUSED</dt>
      <dd>{paused ? "YES" : "NO"}</dd>
      <dt>DECODER</dt>
      <dd className="text-fg" data-lab-decoder={holder ?? "free"}>
        {holder ?? "FREE"}
      </dd>
    </dl>
  );
}

export function MediaDemo({
  media,
  caption,
  priority = false,
}: {
  media: MediaId;
  caption: string;
  priority?: boolean;
}) {
  const [state, setState] = useState<MediaFrameState>("poster");
  return (
    <figure className="flex flex-col gap-3">
      <MediaFrame media={media} radius="frame" sizes="(min-width: 64rem) 30vw, 100vw" priority={priority} onStateChange={setState} />
      <figcaption className="type-meta flex justify-between gap-3 text-fg-muted">
        <span>{caption}</span>
        <span className="text-fg">{state.toUpperCase()}</span>
      </figcaption>
    </figure>
  );
}

/** Closed / open / aperture (replayable) on one media frame. */
export function LensStatesDemo() {
  const [state, setState] = useState<LensState>("open");
  const [focus, setFocus] = useState(true);
  const buttons: { label: string; next: LensState }[] = [
    { label: "Closed", next: "closed" },
    { label: "Open", next: "open" },
    { label: "Play aperture", next: "aperture" },
  ];
  return (
    <div className="flex flex-col gap-tier-group">
      <div className="px-[var(--lens-inset)] py-[var(--lens-inset)]">
        <Lens
          state={state}
          focus={focus}
          frame={{ x0: 0.46, x1: 0.94, y0: 0.12, y1: 0.88 }}
          origin={0.7}
        >
          <MediaFrame media="still-calm" sizes="(min-width: 64rem) 45vw, 100vw" />
        </Lens>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            aria-pressed={state === b.next}
            onClick={() => {
              // "Play aperture" always replays from closed.
              if (b.next === "aperture") {
                setState("closed");
                requestAnimationFrame(() => setState("aperture"));
              } else setState(b.next);
            }}
            className="type-meta min-h-11 rounded-control px-4 text-fg-muted surface-1 hover:text-fg aria-pressed:text-fg"
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={!focus}
          onClick={() => setFocus((f) => !f)}
          className="type-meta min-h-11 rounded-control px-4 text-fg-muted surface-1 hover:text-fg aria-pressed:text-fg"
        >
          Idle colour
        </button>
        <span className="type-meta text-fg-muted" data-lab-lens-state={state}>
          STATE • {state.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

const ROWS = [
  "Pre-registration",
  "Blind holdout, spent once",
  "Deflated Sharpe ratio",
  "Purged cross-validation",
  "Realistic costs",
];

/** Track: the bracket follows the hovered / focused / arrowed row. */
export function LensTrackDemo() {
  const listRef = useRef<HTMLOListElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState<LensRect | null>(null);

  const select = (i: number) => {
    const list = listRef.current;
    const btn = btnRefs.current[i];
    if (!list || !btn) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setActive(i);
    setRect({ x: br.left - lr.left, y: br.top - lr.top, width: br.width, height: br.height });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : null;
    if (next === null || next < 0 || next >= ROWS.length) return;
    e.preventDefault();
    btnRefs.current[next]?.focus();
  };

  return (
    <Lens state={rect ? "track" : "open"} target={rect} focus={rect !== null} clip={false}>
      <ol ref={listRef} className="flex flex-col" aria-label="Validation gates (track demo)">
        {ROWS.map((row, i) => (
          <li key={row}>
            <button
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              type="button"
              onPointerEnter={() => select(i)}
              onFocus={() => select(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={
                "type-heading flex min-h-11 w-full items-baseline gap-4 px-2 py-3 text-left transition-colors duration-(--dur-micro) " +
                (rect && active === i ? "text-fg" : "text-fg-ghost")
              }
            >
              <span className="type-meta tnum text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
              {row}
            </button>
          </li>
        ))}
      </ol>
    </Lens>
  );
}

/** Aperture once per session, armed offscreen, played at 50% in view. */
export function LensOnceDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const { state, onSettled } = useApertureOnce(ref, "lab-aperture");
  return (
    <div ref={ref} className="px-[var(--lens-inset)] py-[var(--lens-inset)]" data-lab-lens-once={state}>
      <Lens state={state} onSettled={onSettled} origin={0.5}>
        <MediaFrame media="still-blueprint" sizes="(min-width: 64rem) 60vw, 100vw" />
      </Lens>
    </div>
  );
}

const MODES: LoaderMode[] = ["indeterminate", "determinate", "complete", "static"];

export function LoaderModesDemo() {
  const [p, setP] = useState(0.4);
  return (
    <div className="flex flex-col gap-tier-group">
      <label className="type-meta flex items-center gap-4 text-fg-muted">
        PROGRESS
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          className="min-h-11 w-48 accent-(--accent)"
        />
        <span className="tnum text-fg">{p.toFixed(2)}</span>
      </label>
      <ul className="grid gap-tier-group sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map((mode) => (
          <li key={mode} className="flex flex-col gap-3">
            <span className="type-meta text-fg-muted">{mode.toUpperCase()}</span>
            <Loader mode={mode} size="card" progress={mode === "indeterminate" ? undefined : p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A REAL load: streams a real file and reports bytes received / total. */
export function RealLoadDemo() {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const start = async () => {
    setPhase("loading");
    setProgress(undefined);
    try {
      const res = await fetch("/media/v-contour.mp4", { cache: "no-store" });
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body?.getReader();
      if (!reader) throw new Error("no stream");
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got += value.byteLength;
        if (total) setProgress(got / total);
      }
    } catch {
      /* keep honest: the demo just ends */
    }
    setPhase("done");
  };

  return (
    <div className="flex flex-wrap items-center gap-tier-group">
      <button
        type="button"
        onClick={start}
        disabled={phase === "loading"}
        className="type-meta min-h-11 rounded-control px-4 text-fg-muted surface-1 hover:text-fg disabled:opacity-60"
      >
        Load a real file
      </button>
      {phase === "loading" ? (
        <Loader status="Loading a sample file…" size="card" progress={progress} />
      ) : null}
      {phase === "done" ? <span className="type-meta text-fg-muted">LOADED</span> : null}
    </div>
  );
}
