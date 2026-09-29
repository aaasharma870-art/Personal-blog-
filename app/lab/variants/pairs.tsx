"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { animate, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import type { MediaId } from "@/lib/media";
import { writeSession } from "@/lib/session";
import type { Variant } from "@/lib/variants";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { Loader, type LoaderMode } from "@/components/primitives/loader";
import { MediaFrame } from "@/components/primitives/media-frame";
import { WorldProvider } from "@/components/primitives/world";
import { CardContext, type CardState } from "@/components/sections/act-card/card-context";
import { ProgressLine } from "@/components/sections/act-card/progress-line";

/* /lab/variants client pairs. Workbench only — not product components.
   Each pair drives BOTH sides from ONE clock, so the DEFAULT and the ALT
   are always at the same progress. Nothing here reads the URL: every side
   is FORCED (variant prop / CardContext), so ?variant=… never changes the
   lab. Reduced motion / Pause: replays jump to the settled frame. */

const SIDES = ["default", "alt"] as const;
const BTN =
  "type-meta inline-flex min-h-11 items-center rounded-control px-4 text-fg-muted surface-1 hover:text-fg aria-pressed:text-fg disabled:opacity-60";

function SideLabel({ side, name }: { side: Variant; name?: string }) {
  return (
    <p className="type-meta flex flex-wrap gap-x-3 text-fg-muted">
      <span className={side === "alt" ? "text-accent" : "text-fg"}>{side === "alt" ? "ALT" : "DEFAULT"}</span>
      {name ? <span>{name}</span> : null}
    </p>
  );
}

/** One shared 0–1 clock with Replay / Settle / a scrub slider. The slider
 *  and readout are written straight to the DOM (no re-render per frame). */
function useClock(initial: number, seconds: number, onDone?: () => void) {
  const reduced = useReducedMotion();
  const p = useMotionValue(initial);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(p, "change", (v) => {
    if (input.current && document.activeElement !== input.current) input.current.value = String(v);
    if (readout.current) readout.current.textContent = v.toFixed(2);
  });
  useEffect(() => () => run.current?.stop(), []);
  const stop = () => {
    run.current?.stop();
    run.current = null;
  };
  const replay = () => {
    stop();
    if (reduced) {
      p.set(1);
      onDone?.();
      return;
    }
    p.jump(0);
    run.current = animate(p, 1, { duration: seconds, ease: "linear", onComplete: () => onDone?.() });
  };
  const settle = () => {
    stop();
    p.set(1);
    onDone?.();
  };
  const scrub = (v: number) => {
    stop();
    p.set(v);
  };
  return { p, reduced, replay, settle, scrub, input, readout };
}

type Clock = ReturnType<typeof useClock>;

function ClockControls({
  label,
  onReplay,
  onSettle,
  onScrub,
  inputRef,
  readoutRef,
  reduced,
  initial,
  extra,
}: {
  label: string;
  onReplay: Clock["replay"];
  onSettle: Clock["settle"];
  onScrub: Clock["scrub"];
  inputRef: Clock["input"];
  readoutRef: Clock["readout"];
  reduced: boolean;
  initial: number;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-lab-controls={label}>
      <button type="button" className={BTN} onClick={onReplay} data-lab-replay={label}>
        Replay both
      </button>
      <button type="button" className={BTN} onClick={onSettle} data-lab-settle={label}>
        Settle
      </button>
      {extra}
      <label className="type-meta flex min-h-11 items-center gap-3 text-fg-muted">
        <span>SCRUB</span>
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={initial}
          onInput={(e) => onScrub(Number(e.currentTarget.value))}
          aria-label={`Scrub ${label}`}
          className="min-h-11 w-40 accent-(--accent)"
          data-lab-scrub={label}
        />
        <span ref={readoutRef} className="tnum w-10 text-fg">
          {initial.toFixed(2)}
        </span>
      </label>
      {reduced ? <span className="type-meta text-fg-muted">Motion off: static frames</span> : null}
    </div>
  );
}

/* — Act cards ————————————————————————————————————————————————————————— */

/** A DEFAULT and an ALT act-card frame on one clock: each sits in its own
 *  letterbox on the card's deep plane with the CardContext the real
 *  CardShell would give it (p = the clock, live = motion on). */
export function LabCardPair({
  kind,
  world,
  names,
  frames,
  stack = false,
  seconds = 4,
}: {
  kind: string;
  world: WorldId;
  names: Record<Variant, string>;
  frames: Record<Variant, ReactNode>;
  /** Full-width rows (the opening card's free content) instead of columns. */
  stack?: boolean;
  seconds?: number;
}) {
  const { p, reduced, replay, settle, scrub, input, readout } = useClock(1, seconds);
  const live = !reduced;
  const states = useMemo(
    () =>
      Object.fromEntries(SIDES.map((v) => [v, { p, live, long: false, variant: v }])) as Record<Variant, CardState>,
    [p, live],
  );
  return (
    <div className="flex flex-col gap-tier-group" data-lab-card-pair={kind}>
      <ClockControls
        label={`card-${kind}`}
        onReplay={replay}
        onSettle={settle}
        onScrub={scrub}
        inputRef={input}
        readoutRef={readout}
        reduced={reduced}
        initial={1}
      />
      <div className={stack ? "flex flex-col gap-tier-group" : "grid gap-tier-group lg:grid-cols-2"}>
        {SIDES.map((v) => (
          <figure key={v} className="flex min-w-0 flex-col gap-3" data-lab-card={kind} data-variant={v}>
            <SideLabel side={v} name={names[v]} />
            <div {...planeAttrs("deep", world)} className="rounded-frame bg-bg text-fg">
              <WorldProvider world={world} tone="deep">
                <CardContext.Provider value={states[v]}>
                  <div
                    className={
                      stack
                        ? "relative overflow-hidden px-4 sm:px-0 lg:aspect-(--letterbox-ratio)"
                        : "relative aspect-[3/2] overflow-hidden sm:aspect-(--letterbox-ratio)"
                    }
                  >
                    {frames[v]}
                  </div>
                  <div className="px-4 pb-4 pt-3">
                    <ProgressLine world={world} />
                  </div>
                </CardContext.Provider>
              </WorldProvider>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* — World loaders ————————————————————————————————————————————————————— */

/** One world's loader, DEFAULT beside ALT, on one clock: Replay runs the
 *  real determinate progress 0 → 1 then the completion; Wait shows the
 *  indeterminate waiting loop (it idle-stops after 5 s, as in production). */
export function LabLoaderPair({ world, names }: { world: WorldId; names: Record<Variant, string> }) {
  const [mode, setMode] = useState<LoaderMode>("complete");
  const [waits, setWaits] = useState(0);
  const clock = useClock(1, 2.6, () => setMode("complete"));
  const { p, reduced, settle, input, readout } = clock;
  const replay = () => {
    setMode("determinate");
    clock.replay();
  };
  const scrub = (v: number) => {
    setMode("determinate");
    clock.scrub(v);
  };
  const waiting = mode === "indeterminate";
  return (
    <div {...planeAttrs("deep", world)} className="flex flex-col gap-tier-group rounded-frame bg-bg p-4 text-fg" data-lab-loader-pair={world}>
      <ClockControls
        label={`loader-${world}`}
        onReplay={replay}
        onSettle={settle}
        onScrub={scrub}
        inputRef={input}
        readoutRef={readout}
        reduced={reduced}
        initial={1}
        extra={
          <button
            type="button"
            className={BTN}
            aria-pressed={waiting}
            onClick={() => {
              setMode("indeterminate");
              setWaits((n) => n + 1);
            }}
            data-lab-wait={world}
          >
            Wait
          </button>
        }
      />
      <div className="grid gap-tier-group sm:grid-cols-2">
        {SIDES.map((v) => (
          <figure key={v} className="flex min-w-0 flex-col gap-3" data-lab-loader={world} data-variant={v}>
            <SideLabel side={v} name={names[v]} />
            <div className="flex min-h-28 flex-wrap items-center gap-6">
              <Loader
                key={waiting ? `wait-${waits}` : "run"}
                world={world}
                variant={v}
                size="card"
                mode={mode}
                progress={waiting ? undefined : p}
              />
              <Loader
                key={waiting ? `mini-wait-${waits}` : "mini-run"}
                world={world}
                variant={v}
                size="mini"
                mode={mode}
                progress={waiting ? undefined : p}
              />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* — Media pairs ——————————————————————————————————————————————————————— */

/** A registered media pair (lib/media.ts `variants.alt`). Stills sit side
 *  by side; for video only ONE side may hold the decoder: Play mounts that
 *  side's clip (desktop fine pointer, motion on) and returns the other to
 *  its poster. */
export function LabMediaPair({
  ids,
  video,
  names,
}: {
  ids: Record<Variant, MediaId>;
  video: boolean;
  names?: Record<Variant, string>;
}) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState<Variant | null>(null);
  const [runs, setRuns] = useState(0);
  return (
    <div className="grid gap-tier-group sm:grid-cols-2" data-lab-media-pair={ids.default}>
      {SIDES.map((v) => (
        <figure key={v} className="flex min-w-0 flex-col gap-3" data-lab-media={ids[v]} data-variant={v}>
          <SideLabel side={v} name={names?.[v] ?? ids[v]} />
          <MediaFrame
            key={playing === v ? `play-${runs}` : "poster"}
            media={ids[v]}
            radius="frame"
            sizes="(min-width: 40rem) 45vw, 100vw"
            playOn={video && playing === v ? "desktop" : "never"}
          />
          {video ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={BTN}
                aria-pressed={playing === v}
                disabled={reduced}
                onClick={() => {
                  setPlaying(v);
                  setRuns((n) => n + 1);
                }}
                data-lab-play={ids[v]}
              >
                {playing === v ? "Replay" : "Play"} {v === "alt" ? "ALT" : "DEFAULT"}
              </button>
              {playing === v ? (
                <button type="button" className={BTN} onClick={() => setPlaying(null)}>
                  Stop
                </button>
              ) : null}
            </div>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

/* — Page replays (intro / hero) ——————————————————————————————————————— */

/** A replay that plays on the real page (the prologue and the hero live on
 *  "/"). `clear` = sessionStorage keys to forget first (the aperture's
 *  once-per-session mark). A plain link without JS. */
export function PageReplay({ href, label, clear = [] }: { href: string; label: string; clear?: readonly string[] }) {
  return (
    <a
      href={href}
      className={BTN}
      onClick={() => {
        for (const k of clear) writeSession(k, null);
      }}
      data-lab-page-replay={href}
    >
      {label}
    </a>
  );
}
