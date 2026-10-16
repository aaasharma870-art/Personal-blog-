"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { copyText } from "@/lib/sections";
import { scrollToTarget } from "@/lib/smooth-scroll";
import {
  clearDirectorsCutEnded,
  getPlayhead,
  pauseDirectorsCut,
  restartDirectorsCut,
  resumeDirectorsCut,
  seekDirectorsCut,
  stepDirectorsCut,
  stopDirectorsCut,
  useDirectorsCut,
} from "./api";
import { clock } from "./plan";

/* ============================================================================
   THE TRANSPORT (React half of the director's cut; replaces the old DOM
   "■ Stop · 2× · Act n/4" pill). Rendered by <StageLayers/> in the "stop"
   layer (z 30: above the bars, under the toasts and the header) while a run
   lives or its end state shows. Bottom-centre, kept clear of the egg toasts'
   bottom-left column (<= 27 rem) at 1024 / 1280 / 1440.

   RUNNING   [|<] [pause] [>|]  the chapter on screen                0:41 / 1:30  [Exit]
             a progress bar with a tick per chapter (a press seeks there)
   PAUSED    the same, "Paused · Resume" where the chapter name was
   ENDED     [Play again] [Skip to the research] [x]   (12 s, then it goes)

   The bar and the clock are NOT React state: one rAF reads the player's
   playhead and writes a transform (scaleX) and the clock text; React renders
   on a play / pause / chapter / end change only. Everything inside carries
   [data-dc-keep]: a press here never pauses the cut (components/director/
   api.ts). The labels are lib/film.ts copy (dc.*, proposed + unsigned).
   ========================================================================== */

const W = "min(34rem, calc(100vw - 30rem))";
const t = (key: Parameters<typeof copyText>[0], extra?: Record<string, string | number>) => copyText(key, extra).text;

const iconBtn =
  "inline-flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-(--dur-micro) hover:bg-[color-mix(in_srgb,var(--fg)_12%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";
const textBtn =
  "type-meta inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-fg shadow-[inset_0_0_0_1px_var(--fg-ghost)] transition-colors duration-(--dur-micro) hover:text-accent-bright hover:shadow-[inset_0_0_0_1px_var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

function runFastLane(): void {
  track("fast_lane");
  clearDirectorsCutEnded();
  void scrollToTarget("#work", { immediate: true, cut: true, focus: true, history: "push" });
}

export function Transport() {
  const s = useDirectorsCut();
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const clockEl = useRef<HTMLSpanElement>(null);
  const live = s.running;
  const frozen = s.paused || s.ended;

  // the entrance (opacity + rise on the inner box; the outer box owns the centring)
  useEffect(() => {
    const el = root.current;
    if (!el || typeof el.animate !== "function") return;
    const a = el.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    return () => a.cancel();
  }, []);

  // the bar and the clock: one rAF while the camera moves, once when it rests
  useEffect(() => {
    const total = s.total;
    if (!(total > 0) || (!live && !s.ended)) return;
    let raf = 0;
    let lastSec = -1;
    const paint = () => {
      const p = s.ended ? total : Math.min(total, Math.max(0, getPlayhead()));
      if (fill.current) fill.current.style.transform = `scaleX(${(p / total).toFixed(4)})`;
      const sec = Math.floor(p);
      if (sec !== lastSec) {
        lastSec = sec;
        if (clockEl.current) clockEl.current.textContent = `${clock(p)} / ${clock(total)}`;
        const label = s.chapters[Math.max(0, s.chapter)] ?? "";
        bar.current?.setAttribute("aria-valuenow", String(sec));
        bar.current?.setAttribute("aria-valuetext", `${label}, ${clock(p)} / ${clock(total)}`);
      }
    };
    const loop = () => {
      paint();
      raf = requestAnimationFrame(loop);
    };
    if (frozen) paint();
    else raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.total, s.chapter, s.chapters, live, frozen, s.ended]);

  const name = s.chapters[Math.max(0, s.chapter)] ?? "";
  const total = s.total;

  return (
    <div
      data-dc-keep=""
      data-dc-transport=""
      data-world="house"
      data-tone="deep"
      data-house-type=""
      role="group"
      aria-label={t("dc.group")}
      className="pointer-events-auto absolute bottom-4"
      style={{ width: W, left: `max(50%, calc(${W} / 2 + 28rem))`, transform: "translateX(-50%)" }}
    >
      <div
        ref={root}
        className="flex flex-col gap-1 rounded-[1.25rem] bg-bg px-3 pb-1 pt-2 text-fg shadow-[0_10px_34px_rgba(0,0,0,.5),inset_0_0_0_1px_var(--rule)]"
      >
        {s.ended ? (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <button type="button" className={textBtn} onClick={() => restartDirectorsCut()} autoFocus>
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("dc.replay")}
            </button>
            <button type="button" className={textBtn} onClick={runFastLane}>
              {t("fastlane.label")}
            </button>
            <button type="button" className={`${iconBtn} ml-auto`} aria-label={t("dc.exit")} title={t("dc.exit")} onClick={() => clearDirectorsCutEnded()}>
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button type="button" className={iconBtn} aria-label={t("dc.prev")} title={t("dc.prev")} onClick={() => stepDirectorsCut(-1)}>
              <SkipBack aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              className={iconBtn}
              aria-label={s.paused ? t("dc.resume") : t("dc.pause")}
              title={s.paused ? t("dc.resume") : t("dc.pause")}
              onClick={() => (s.paused ? resumeDirectorsCut() : pauseDirectorsCut())}
              data-dc-pause=""
            >
              {s.paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
            </button>
            <button type="button" className={iconBtn} aria-label={t("dc.next")} title={t("dc.next")} onClick={() => stepDirectorsCut(1)}>
              <SkipForward aria-hidden="true" className="size-4" />
            </button>
            <span className="type-meta min-w-0 flex-1 truncate px-2 text-fg-muted" data-dc-chapter="">
              {s.paused ? (
                <>
                  <span className="text-fg">{t("dc.paused.now")}</span>
                  <span aria-hidden="true"> · </span>
                  <button type="button" className="text-accent-bright underline underline-offset-4" onClick={() => resumeDirectorsCut()}>
                    {t("dc.resume")}
                  </button>
                </>
              ) : (
                name
              )}
            </span>
            <span ref={clockEl} className="type-meta shrink-0 tabular-nums text-fg-muted" data-dc-clock="">
              {total > 0 ? `${clock(0)} / ${clock(total)}` : ""}
            </span>
            <button type="button" className={`${textBtn} ml-1 px-3`} onClick={() => stopDirectorsCut("exit")} data-dc-exit="">
              {t("dc.exit")}
            </button>
          </div>
        )}
        <div className="relative mx-2 h-7">
          <div
            ref={bar}
            role="progressbar"
            aria-label={t("dc.progress")}
            aria-valuemin={0}
            aria-valuemax={Math.max(1, Math.round(total))}
            aria-valuenow={0}
            className="absolute inset-x-0 top-3 h-1.5 overflow-hidden rounded-pill bg-[color-mix(in_srgb,var(--fg)_16%,transparent)]"
          >
            <div ref={fill} className="h-full origin-left bg-accent-bright" style={{ transform: "scaleX(0)" }} />
          </div>
          {total > 0
            ? s.chapters.map((label, i) => (
                <button
                  key={`${label}-${i}`}
                  type="button"
                  disabled={s.ended}
                  aria-label={t("dc.goto", { name: label })}
                  aria-current={i === s.chapter ? "step" : undefined}
                  title={label}
                  data-dc-tick={i}
                  onClick={() => seekDirectorsCut(i)}
                  className="group absolute top-0 flex h-7 w-6 -translate-x-1/2 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
                  style={{ left: `${Math.min(100, (s.starts[i] / total) * 100)}%` }}
                >
                  <span
                    aria-hidden="true"
                    className={`block w-0.5 rounded-pill transition-[height,background-color] duration-(--dur-micro) ${
                      i === s.chapter ? "h-4 bg-fg" : "h-3 bg-fg-muted group-hover:h-4 group-hover:bg-fg"
                    }`}
                  />
                </button>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
