"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { copyText } from "@/lib/sections";
import { scrollToTarget } from "@/lib/smooth-scroll";
import {
  clearDirectorsCutEnded,
  getPlayhead,
  holdDirectorsCutEnd,
  overlayOpen,
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

   TWO PARTS (Oct 16 review: nothing may sit on a held frame's caption):
   - the PROGRESS LINE: a slim dark capsule hugging the bottom edge (16 px, 4 px
     off it), always there: the line, its fill and a tick per chapter (a press
     seeks there). It never reaches a caption (they end well above it).
   - the CARD above it, only while it is wanted:
       RUNNING  [|<] [pause] [>|]  the chapter on screen      0:41 / 1:30  [Exit]
       PAUSED   the same, "Paused · Resume" where the chapter name was
       ENDED    [Replay the tour] [Skip to the research] [x]   (12 s; it waits while
                the pointer or the keyboard focus is on it)
     Wanted = the pointer is on the line / the card, the pointer moves near the
     bottom centre or a key is pressed (it goes again after a moment), keyboard
     focus is in it, or the cut is paused / ended. A tour starts with the card
     away (its first seconds hold the hero's caption) and the focus on the
     Pause button: Space / K pause, the arrows step, Esc exits.

   The bar and the clock are NOT React state: one rAF reads the player's
   playhead and writes a transform (scaleX) and the clock text; React renders
   on a play / pause / chapter / end change only. Everything inside carries
   [data-dc-keep]: a press here never pauses the cut (components/director/
   api.ts). The labels are lib/film.ts copy (dc.*, proposed + unsigned).
   Focus never falls to <body>: after Resume it is on Pause; after Exit, Esc
   or the end card's timeout it returns to the dock's Director's cut button.
   KEYBOARD vs POINTER. Keyboard focus never keeps the card open: it wakes for a moment on every
   key (like the pointer), then tucks again, and the focused control stays visible on its own, with
   its ring, over the empty bottom edge. The END card puts focus on "Replay the tour" only when the
   last thing the visitor did was press a key (then its ring shows); after the mouse, focus rests on
   the group (no armed button: Space / Enter anywhere never restarts a 90-180 s tour), and Esc closes
   the end card.
   ========================================================================== */

const W = "min(34rem, calc(100vw - 30rem))";
/** The card goes away (the progress line stays) after this long without the pointer near or a key. */
const IDLE_MS = 2600;
/** The pointer wakes the card from this far above / beside the progress line (px). */
const WAKE_UP = 120;
const WAKE_SIDE = 60;
/** Chapter ticks sit at least this far apart (px): a 24 px wide target each (as tall as the line,
 *  so it never reaches above it onto a caption), none overlapping. */
const TICK_GAP = 24;
const t = (key: Parameters<typeof copyText>[0], extra?: Record<string, string | number>) => copyText(key, extra).text;

const iconBtn =
  "inline-flex size-8 items-center justify-center rounded-pill text-fg transition-colors duration-(--dur-micro) hover:bg-[color-mix(in_srgb,var(--fg)_12%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";
const textBtn =
  "type-meta inline-flex min-h-8 items-center gap-2 rounded-pill px-4 text-fg shadow-[inset_0_0_0_1px_var(--fg-ghost)] transition-colors duration-(--dur-micro) hover:text-accent-bright hover:shadow-[inset_0_0_0_1px_var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

function runFastLane(): void {
  track("fast_lane");
  clearDirectorsCutEnded();
  void scrollToTarget("#work", { immediate: true, cut: true, focus: true, history: "push" });
}

/** The ticks' x (px along a track `width` wide): their true place, pushed apart to at least `gap`. */
export function spreadTicks(starts: readonly number[], total: number, width: number, gap = TICK_GAP): number[] {
  const n = starts.length;
  const x = starts.map((s) => Math.min(width, Math.max(0, total > 0 ? (s / total) * width : 0)));
  if (n < 2 || (n - 1) * gap > width) return x;
  for (let i = 1; i < n; i++) x[i] = Math.max(x[i], x[i - 1] + gap);
  if (x[n - 1] > width) x[n - 1] = width;
  for (let i = n - 2; i >= 0; i--) x[i] = Math.min(x[i], x[i + 1] - gap);
  return x;
}

const focusVisible = (el: EventTarget | null): boolean => el instanceof HTMLElement && el.matches(":focus-visible");

export function Transport() {
  const s = useDirectorsCut();
  const wrap = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const clockEl = useRef<HTMLSpanElement>(null);
  const pauseBtn = useRef<HTMLButtonElement>(null);
  const againBtn = useRef<HTMLButtonElement>(null);
  /** focus was last inside the transport (it is not on <body> by choice) */
  const had = useRef(false);
  /** the last thing the visitor did was press a key (false: a pointer press) */
  const kbd = useRef(false);
  const live = s.running;
  const frozen = s.paused || s.ended;
  const [awake, setAwake] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [trackW, setTrackW] = useState(528);
  const open = awake || hover || frozen;
  // keyboard focus inside the tucked card: only the focused control shows (with its ring), alone
  const ring = !open && focused;
  const dim = ring ? " opacity-0 focus-visible:bg-bg focus-visible:opacity-100" : "";

  // the card shows for a moment when the pointer comes near or a key is pressed, then goes again
  useEffect(() => {
    let timer = 0;
    const wake = () => {
      setAwake(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAwake(false), IDLE_MS);
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.current?.getBoundingClientRect();
      if (r && e.clientY >= r.top - WAKE_UP && e.clientX >= r.left - WAKE_SIDE && e.clientX <= r.right + WAKE_SIDE) wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  // the entrance (opacity + rise on the inner box; the outer box owns the centring)
  useEffect(() => {
    const el = root.current;
    if (!el || typeof el.animate !== "function") return;
    const a = el.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    return () => a.cancel();
  }, []);

  // the track's width (the ticks are spread in px)
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const measure = () => setTrackW(Math.max(120, el.clientWidth));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // FOCUS. A tour starts with the focus on Pause (Space / K / arrows then steer it); the dock's chooser
  // and the palette hand focus back to their own buttons a moment later, so look again twice
  useEffect(() => {
    pauseBtn.current?.focus({ preventScroll: true });
    had.current = Boolean(pauseBtn.current && document.activeElement === pauseBtn.current);
    // the browser's own modality: a script focus shows its ring only after a key
    kbd.current = Boolean(pauseBtn.current?.matches(":focus-visible"));
    const key = () => {
      kbd.current = true;
    };
    const press = () => {
      kbd.current = false;
    };
    const again = () => {
      const a = document.activeElement;
      if (!a || a === document.body || (a instanceof Element && a.closest("[data-dock-pop], [data-dock-cut]"))) pauseBtn.current?.focus({ preventScroll: true });
    };
    const timers = [window.setTimeout(again, 250), window.setTimeout(again, 800)];
    const seen = (e: FocusEvent) => {
      had.current = e.target instanceof Node && Boolean(wrap.current?.contains(e.target));
    };
    const away = (e: PointerEvent) => {
      if (!(e.target instanceof Node && wrap.current?.contains(e.target))) had.current = false;
    };
    document.addEventListener("focusin", seen);
    document.addEventListener("pointerdown", away, true);
    window.addEventListener("keydown", key, true);
    window.addEventListener("pointerdown", press, true);
    return () => {
      timers.forEach((x) => window.clearTimeout(x));
      document.removeEventListener("focusin", seen);
      document.removeEventListener("pointerdown", away, true);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("pointerdown", press, true);
      // gone (Exit, Esc, the end card's timeout) with the focus on it: back to the switch, never <body>
      const a = document.activeElement;
      if (had.current && (!a || a === document.body)) document.querySelector<HTMLElement>("[data-dock-cut]")?.focus({ preventScroll: true });
    };
  }, []);
  // the focused control went away (Resume, Replay the tour): on to the Pause button
  useEffect(() => {
    if (s.ended || !had.current) return;
    const a = document.activeElement;
    if (!a || a === document.body) pauseBtn.current?.focus({ preventScroll: true });
  }, [s.paused, s.ended]);

  // the end card: after a key press focus goes to its first button, with its ring (a keyboard visitor
  // lands on it). After the mouse it goes to the group itself, so no invisible button is armed: Space
  // and Enter anywhere stay a plain scroll, never a restart of a 90-180 s tour.
  useEffect(() => {
    if (!s.ended) return;
    const btn = againBtn.current;
    if (kbd.current && btn) {
      btn.focus({ preventScroll: true });
      if (btn.matches(":focus-visible")) return;
    }
    const a = document.activeElement;
    if (!a || a === document.body || wrap.current?.contains(a)) wrap.current?.focus({ preventScroll: true });
  }, [s.ended]);

  // Esc closes the end card (an open menu, panel or dialog takes its own Esc first)
  useEffect(() => {
    if (!s.ended) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || overlayOpen()) return;
      clearDirectorsCutEnded();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.ended]);

  // the end card waits while the pointer or the keyboard focus is on it
  useEffect(() => {
    if (s.ended) holdDirectorsCutEnd(hover || focused);
  }, [s.ended, hover, focused]);

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
  const ticks = total > 0 ? spreadTicks(s.starts, total, trackW) : [];
  const toggle = () => (s.paused ? resumeDirectorsCut() : pauseDirectorsCut());
  /** after a press with the mouse on a step / seek control: focus to Pause, so Space / K act on the tour, not on that button */
  const handBack = (e: React.MouseEvent) => {
    if (e.detail > 0) pauseBtn.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={wrap}
      data-dc-keep=""
      data-dc-transport=""
      data-world="house"
      data-tone="deep"
      data-house-type=""
      role="group"
      aria-label={t("dc.group")}
      tabIndex={-1}
      className="pointer-events-none absolute bottom-1 outline-none"
      style={{ width: W, left: `max(50%, calc(${W} / 2 + 28rem))`, transform: "translateX(-50%)" }}
      data-dc-open={open ? "" : undefined}
      data-dc-ring={ring ? "" : undefined}
    >
      <div
        ref={root}
        className="relative"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocusCapture={(e) => {
          if (focusVisible(e.target)) setFocused(true);
        }}
        onBlurCapture={(e) => {
          if (!(e.relatedTarget instanceof Node && wrap.current?.contains(e.relatedTarget))) setFocused(false);
        }}
      >
        {/* the card: above the line, in only while wanted (focusable either way) */}
        <div
          className="absolute inset-x-0 bottom-full pb-1.5 transition-[opacity,transform] duration-300 ease-out"
          style={{ opacity: open || ring ? 1 : 0, transform: open ? "translateY(0)" : "translateY(10px)", pointerEvents: open ? "auto" : "none" }}
          data-dc-card=""
        >
          <div
            className={`flex flex-col rounded-[1.1rem] px-3 py-1 text-fg transition-[background-color,box-shadow] duration-300 ${
              ring ? "bg-transparent shadow-none" : "bg-bg shadow-[0_10px_34px_rgba(0,0,0,.5),inset_0_0_0_1px_var(--rule)]"
            }`}
          >
            {s.ended ? (
              <div key="ended" className="flex flex-wrap items-center gap-2">
                <button ref={againBtn} type="button" className={textBtn} onClick={() => restartDirectorsCut()}>
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
              <div key="running" className="flex items-center gap-1">
                <button
                  type="button"
                  className={iconBtn + dim}
                  aria-label={t("dc.prev")}
                  title={t("dc.prev")}
                  onClick={(e) => {
                    stepDirectorsCut(-1);
                    handBack(e);
                  }}
                >
                  <SkipBack aria-hidden="true" className="size-4" />
                </button>
                <button
                  ref={pauseBtn}
                  type="button"
                  className={iconBtn + dim}
                  aria-label={s.paused ? t("dc.resume") : t("dc.pause")}
                  title={s.paused ? t("dc.resume") : t("dc.pause")}
                  onClick={toggle}
                  data-dc-pause=""
                >
                  {s.paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
                </button>
                <button
                  type="button"
                  className={iconBtn + dim}
                  aria-label={t("dc.next")}
                  title={t("dc.next")}
                  onClick={(e) => {
                    stepDirectorsCut(1);
                    handBack(e);
                  }}
                >
                  <SkipForward aria-hidden="true" className="size-4" />
                </button>
                <span className={`type-meta min-w-0 flex-1 truncate px-2 text-fg-muted${ring ? " opacity-0" : ""}`} data-dc-chapter="">
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
                <span ref={clockEl} className={`type-meta shrink-0 tabular-nums text-fg-muted${ring ? " opacity-0" : ""}`} data-dc-clock="">
                  {total > 0 ? `${clock(0)} / ${clock(total)}` : ""}
                </span>
                <button type="button" className={`${textBtn} ml-1 px-3${dim}`} onClick={() => stopDirectorsCut("exit")} data-dc-exit="">
                  {t("dc.exit")}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* the progress line: always there, a slim dark capsule at the bottom edge */}
        <div className="pointer-events-auto relative h-4 rounded-pill bg-bg shadow-[0_2px_10px_rgba(0,0,0,.45),inset_0_0_0_1px_var(--rule)]" data-dc-line="">
          <div
            ref={bar}
            role="progressbar"
            aria-label={t("dc.progress")}
            aria-valuemin={0}
            aria-valuemax={Math.max(1, Math.round(total))}
            aria-valuenow={0}
            className="absolute inset-x-2 top-1.5 h-1 overflow-hidden rounded-pill bg-[color-mix(in_srgb,var(--fg)_22%,transparent)]"
          >
            <div ref={fill} className="h-full origin-left bg-accent-bright" style={{ transform: "scaleX(0)" }} />
          </div>
          {ticks.map((x, i) => {
            const label = s.chapters[i] ?? "";
            return (
              <button
                key={`${label}-${i}`}
                type="button"
                disabled={s.ended}
                aria-label={t("dc.goto", { name: label })}
                aria-current={i === s.chapter ? "step" : undefined}
                title={label}
                data-dc-tick={i}
                onClick={(e) => {
                  seekDirectorsCut(i);
                  handBack(e);
                }}
                onKeyDown={(e) => {
                  // Enter seeks (the button's own); Space and K stay the tour's pause / resume
                  if (e.key === " ") {
                    e.preventDefault();
                    toggle();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
                className="group absolute top-0 flex h-5 w-6 -translate-x-1/2 items-start justify-center focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
                style={{ left: `${8 + x}px` }}
              >
                <span
                  aria-hidden="true"
                  className={`block w-0.5 rounded-pill transition-[height,margin,background-color] duration-(--dur-micro) ${
                    i === s.chapter ? "mt-0.5 h-3 bg-fg" : "mt-1 h-2 bg-fg-muted group-hover:mt-0.5 group-hover:h-3 group-hover:bg-fg"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
