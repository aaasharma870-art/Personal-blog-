"use client";

import { Suspense, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Gamepad2, Play, RotateCcw, Square } from "lucide-react";
import { on } from "@/lib/events";
import { motionOffNow } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";
import { copyText, copyVisible } from "@/lib/sections";
import type { CopyKey } from "@/lib/film";
import { stopDirectorsCut, useDirectorsCut } from "@/components/director/api";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { DC_CHOOSER_EVENT, primeIntro, replayIntro } from "@/components/site/dock-actions";

/* ============================================================================
   CONTROL DOCK (Oct 16 fix; complaints 1, 5, 6): three labelled, solid,
   ringed buttons in the fixed header's right cluster, left of the Skip pill:
     [↻ Replay intro]  [▶ Director's cut  OFF|ON]  [🎮 Games ▾]
   Real <button>s, 44 px tall, always on screen (the header never hides).
   DESKTOP_FINE only (app/p3/dock.css: the full media query, never `lg:`):
   the server markup is the same for everyone and nothing shifts when the
   client hydrates; short words below 80rem (Replay / Cut / Games), never a
   hidden control.
   - Replay: window.__intro.replay() (components/site/dock-actions.ts). Motion
     off (Pause or OS reduced motion): aria-disabled, and a press says why.
   - Director's cut: aria-pressed, an ON/OFF chip. Running: a press STOPS it.
     Off: a press opens the chooser (Quick / Full tour). The hero button and
     the palette open the same chooser (DC_CHOOSER_EVENT). Motion off:
     aria-disabled, "Motion is paused".
   - Games: the menu of things to try (components/site/dock-popovers.tsx).
   The group carries `data-dc-keep`: the player ignores presses inside it, so
   the switch stops a run instead of stopping it and restarting it.
   The popovers (lazy) open under their button; Esc / a press outside / focus
   leaving closes them and Esc returns focus to the button. A silent two-ring
   cue plays once per session on the cut and games buttons after the intro
   (never with motion off).
   All copy is `dock.*` in lib/film.ts (proposed, unsigned).
   ========================================================================== */

const Popover = safeLazy(() => import("@/components/site/dock-popovers"));
const warmPopovers = () => void import("@/components/site/dock-popovers").catch(() => {});

const text = (k: CopyKey): string | null => {
  const c = copyText(k);
  return copyVisible(c) ? c.text : null;
};

/** true after hydration (server + hydration render = false). */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type Open = "cut" | "games" | "note-replay" | "note-cut" | null;

const CUE_KEY = "aryan:dock-cue";

function cueSeen(name: string): boolean {
  try {
    return window.sessionStorage.getItem(`${CUE_KEY}:${name}`) === "1";
  } catch {
    return false;
  }
}
function cueMark(name: string): void {
  try {
    window.sessionStorage.setItem(`${CUE_KEY}:${name}`, "1");
  } catch {
    /* in-memory only: it plays once per page view */
  }
}

export function ControlDock() {
  const mounted = useMounted();
  const dc = useDirectorsCut();
  const { reduced } = useMotionPreference();
  // motion is off for any reason (Pause or OS reduced motion); false until hydrated
  const off = mounted && reduced;
  const [open, setOpen] = useState<Open>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const cutRef = useRef<HTMLButtonElement>(null);
  const gamesRef = useRef<HTMLButtonElement>(null);
  const live = useRef<{ off: boolean; running: boolean; open: Open }>({ off, running: dc.running, open });
  useEffect(() => {
    live.current = { off, running: dc.running, open };
  });

  const replayLabel = text("dock.replay");
  const replayShort = text("dock.replay.short") ?? replayLabel;
  const cutLabel = text("dock.cut");
  const cutShort = text("dock.cut.short") ?? cutLabel;
  const onWord = text("dock.cut.on") ?? "ON";
  const offWord = text("dock.cut.off") ?? "OFF";
  const gamesLabel = text("dock.games");
  const group = text("dock.group") ?? "Controls";
  const replayWhy = text("dock.replay.paused");
  const cutWhy = text("dc.paused");

  const triggerOf = (o: Open): HTMLButtonElement | null =>
    o === "cut" || o === "note-cut" ? cutRef.current : o === "games" ? gamesRef.current : o === "note-replay" ? replayRef.current : null;

  const close = (refocus: boolean) => {
    const was = live.current.open;
    setOpen(null);
    if (refocus) triggerOf(was)?.focus();
  };

  const closeEvent = useEffectEvent((refocus: boolean) => close(refocus));

  // a popover is open: Esc closes (focus returns), a press outside or focus
  // leaving the dock item closes
  useEffect(() => {
    if (!open) return;
    const item = groupRef.current?.querySelector<HTMLElement>(`[data-item="${open.startsWith("note") ? open.slice(5) : open}"]`);
    const inside = (t: EventTarget | null) => t instanceof Node && Boolean(item?.contains(t));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeEvent(true);
    };
    const onDown = (e: PointerEvent) => {
      if (!inside(e.target)) closeEvent(false);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget && !inside(e.relatedTarget)) closeEvent(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    item?.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
      item?.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  // the hero's "Director's cut" and the palette open this same chooser
  useEffect(() => {
    const show = (e: Event) => {
      const d = (e as CustomEvent<{ handled?: boolean } | null>).detail;
      if (d) d.handled = true;
      if (live.current.running) stopDirectorsCut("toggle");
      else setOpen(live.current.off ? "note-cut" : "cut");
    };
    window.addEventListener(DC_CHOOSER_EVENT, show);
    return () => window.removeEventListener(DC_CHOOSER_EVENT, show);
  }, []);

  // a game starting closes any popover
  useEffect(() => on("game:start", () => setOpen(null)), []);

  // warm the intro controller and the popover chunk when the visitor is near
  useEffect(() => {
    const idle = window.setTimeout(() => {
      primeIntro();
      warmPopovers();
    }, 2500);
    return () => window.clearTimeout(idle);
  }, []);

  // the silent cue: two ring pulses on the cut and games buttons, once per
  // session each, after the intro (or at once when it is not showing)
  useEffect(() => {
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const cue = (name: string, el: HTMLElement | null, delay: number) => {
      if (!el || cueSeen(name)) return;
      timers.push(
        window.setTimeout(() => {
          if (motionOffNow() || document.documentElement.classList.contains("intro-armed")) return;
          cueMark(name);
          el.setAttribute("data-cue", "");
          el.addEventListener("animationend", () => el.removeAttribute("data-cue"), { once: true });
        }, delay),
      );
    };
    const run = (lead: number) => {
      cue("cut", cutRef.current, lead);
      cue("games", gamesRef.current, lead + 700);
    };
    if (document.documentElement.classList.contains("intro-armed")) {
      const onEnd = () => run(1800);
      window.addEventListener("intro:end", onEnd, { once: true });
      return () => {
        window.removeEventListener("intro:end", onEnd);
        clear();
      };
    }
    run(1500);
    return clear;
  }, []);

  const onReplay = () => {
    if (live.current.off) {
      setOpen((o) => (o === "note-replay" ? null : "note-replay"));
      return;
    }
    setOpen(null);
    replayIntro();
  };
  const onCut = () => {
    if (live.current.off) {
      setOpen((o) => (o === "note-cut" ? null : "note-cut"));
      return;
    }
    if (live.current.running) {
      stopDirectorsCut("toggle");
      return;
    }
    setOpen((o) => (o === "cut" ? null : "cut"));
  };
  const onGames = () => setOpen((o) => (o === "games" ? null : "games"));
  if (!replayLabel && !cutLabel && !gamesLabel) return null;

  return (
    <div ref={groupRef} className="dock" role="group" aria-label={group} data-dock="" data-dc-keep="" data-house-type="">
      {replayLabel ? (
        <span className="dock-item" data-item="replay">
          <button
            ref={replayRef}
            type="button"
            className="dock-btn"
            data-dock-replay=""
            aria-label={replayLabel}
            aria-disabled={off || undefined}
            aria-describedby={off && open === "note-replay" ? "dock-note-replay" : undefined}
            title={off && replayWhy ? replayWhy : undefined}
            onClick={onReplay}
            onPointerEnter={primeIntro}
            onFocus={primeIntro}
          >
            <RotateCcw aria-hidden="true" strokeWidth={2} />
            <span className="dock-f" aria-hidden="true">
              {replayLabel}
            </span>
            <span className="dock-s" aria-hidden="true">
              {replayShort}
            </span>
          </button>
          {open === "note-replay" && replayWhy ? (
            <p id="dock-note-replay" className="dock-note" role="status">
              {replayWhy}
            </p>
          ) : null}
        </span>
      ) : null}

      {cutLabel ? (
        <span className="dock-item" data-item="cut">
          <button
            ref={cutRef}
            type="button"
            className="dock-btn"
            data-dock-cut=""
            aria-label={cutLabel}
            aria-pressed={dc.running}
            aria-haspopup={dc.running || off ? undefined : "dialog"}
            aria-expanded={dc.running || off ? undefined : open === "cut"}
            aria-disabled={off || undefined}
            aria-describedby={off && open === "note-cut" ? "dock-note-cut" : undefined}
            title={off && cutWhy ? cutWhy : dc.running ? (text("dock.cut.stop") ?? undefined) : undefined}
            onClick={onCut}
            onPointerEnter={warmPopovers}
            onFocus={warmPopovers}
          >
            {dc.running ? <Square aria-hidden="true" strokeWidth={2} fill="currentColor" /> : <Play aria-hidden="true" strokeWidth={2} />}
            <span className="dock-f" aria-hidden="true">
              {cutLabel}
            </span>
            <span className="dock-s" aria-hidden="true">
              {cutShort}
            </span>
            <span className="dock-chip" aria-hidden="true">
              {dc.running ? onWord : offWord}
            </span>
            {!dc.running && !off ? <ChevronDown className="dock-caret" aria-hidden="true" strokeWidth={2.25} /> : null}
          </button>
          {open === "cut" ? (
            <Suspense fallback={null}>
              <Popover kind="cut" onDone={close} />
            </Suspense>
          ) : null}
          {open === "note-cut" && cutWhy ? (
            <p id="dock-note-cut" className="dock-note" role="status">
              {cutWhy}
            </p>
          ) : null}
        </span>
      ) : null}

      {gamesLabel ? (
        <span className="dock-item" data-item="games">
          <button
            ref={gamesRef}
            type="button"
            className="dock-btn"
            data-dock-games=""
            aria-haspopup="dialog"
            aria-expanded={open === "games"}
            onClick={onGames}
            onPointerEnter={warmPopovers}
            onFocus={warmPopovers}
          >
            <Gamepad2 aria-hidden="true" strokeWidth={2} />
            <span>{gamesLabel}</span>
            <ChevronDown className="dock-caret" aria-hidden="true" strokeWidth={2.25} />
          </button>
          {open === "games" ? (
            <Suspense fallback={null}>
              <Popover kind="games" onDone={close} />
            </Suspense>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
