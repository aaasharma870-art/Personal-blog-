"use client";

import { Suspense, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Gamepad2, Play, RotateCcw, Square } from "lucide-react";
import { on } from "@/lib/events";
import { useDesktopFine } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";
import { copyText, copyVisible } from "@/lib/sections";
import type { CopyKey } from "@/lib/film";
import { stopDirectorsCut, useDirectorsCut } from "@/components/director/api";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { DC_CHOOSER_EVENT } from "@/components/site/dock-events";

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
   - Director's cut: an ON/OFF chip. Running: aria-pressed and a press STOPS
     it (a press that began while a tour ran never re-opens the chooser, even
     though the player's own pointerdown / keydown stops the run first).
     Off: a menu button (aria-haspopup / aria-expanded) that opens the
     chooser (Quick / Full tour). Its accessible name is its visible words
     ("Director's cut OFF", "Tour OFF" below 80rem), read from the content
     with no aria-label (WCAG 2.5.3 label in name: the short word "Tour" and
     the ON / OFF chip are part of the name; the title is the description).
     The hero button and the palette open the same chooser (DC_CHOOSER_EVENT)
     and focus returns to them. Motion off: aria-disabled, with the reason
     for its cause (the Pause toggle, or the system's reduced motion).
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
/** replay / prime live in a lazy module (warmed on hover, focus and idle) */
const actions = () => import("@/components/site/dock-actions");
const primeIntro = () => void actions().then((m) => m.primeIntro()).catch(() => {});
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

export function ControlDock() {
  const mounted = useMounted();
  // the dock is display:none below DESKTOP_FINE: nothing is warmed for it there
  const fine = useDesktopFine();
  const dc = useDirectorsCut();
  const { reduced, paused } = useMotionPreference();
  // motion is off for any reason (Pause or OS reduced motion); false until hydrated
  const off = mounted && reduced;
  const [open, setOpen] = useState<Open>(null);
  /** the popover whose chunk actually mounted (aria-expanded follows it) */
  const [ready, setReady] = useState<Open>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const cutRef = useRef<HTMLButtonElement>(null);
  const gamesRef = useRef<HTMLButtonElement>(null);
  /** a press on the cut switch (or the hero button) began while a tour ran */
  const pressed = useRef<boolean | null>(null);
  /** who opened the chooser from outside the dock (the hero button, the palette) */
  const invoker = useRef<HTMLElement | null>(null);
  const live = useRef<{ off: boolean; running: boolean; open: Open }>({ off, running: dc.running, open });
  useEffect(() => {
    live.current = { off, running: dc.running, open };
  });

  const replayLabel = text("dock.replay");
  const replayShort = text("dock.replay.short") ?? replayLabel;
  const cutLabel = text("dock.cut");
  const cutShort = text("dock.cut.short") ?? cutLabel;
  const cutTip = text("dock.cut.blurb");
  const onWord = text("dock.cut.on") ?? "ON";
  const offWord = text("dock.cut.off") ?? "OFF";
  const gamesLabel = text("dock.games");
  const group = text("dock.group") ?? "Controls";
  // the reason follows the cause: the Pause toggle, or the system's reduced motion
  const replayWhy = text(paused ? "dock.replay.paused" : "dock.replay.reduced");
  const cutWhy = text(paused ? "dc.paused" : "dock.cut.reduced");

  const triggerOf = (o: Open): HTMLButtonElement | null =>
    o === "cut" || o === "note-cut" ? cutRef.current : o === "games" ? gamesRef.current : o === "note-replay" ? replayRef.current : null;

  const close = (refocus: boolean) => {
    const was = live.current.open;
    const from = invoker.current;
    invoker.current = null;
    setOpen(null);
    if (!refocus) return;
    // a chooser the hero button or the palette opened returns focus to them
    const back = (was === "cut" || was === "note-cut") && from && from.isConnected ? from : triggerOf(was);
    back?.focus();
  };
  const show = (k: Open) => {
    setReady(null);
    setOpen(k);
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

  // a press on the cut switch / the hero button that began while a tour ran:
  // the player's own pointerdown / keydown stops the run first, so by the time
  // the click arrives nothing is running. Remember it, so that click does not
  // re-open the chooser (capture, registered before any player exists).
  useEffect(() => {
    const note = (e: Event) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t?.closest("[data-dock-cut], [data-dc]")) return;
      if (e.type === "keydown") {
        const k = e as KeyboardEvent;
        if (k.repeat || (k.key !== "Enter" && k.key !== " ")) return;
      }
      pressed.current = live.current.running;
    };
    window.addEventListener("pointerdown", note, true);
    window.addEventListener("keydown", note, true);
    return () => {
      window.removeEventListener("pointerdown", note, true);
      window.removeEventListener("keydown", note, true);
    };
  }, []);

  // the hero's "Director's cut" and the palette open this same chooser
  useEffect(() => {
    const showChooser = (e: Event) => {
      const d = (e as CustomEvent<{ handled?: boolean } | null>).detail;
      if (d) d.handled = true;
      const began = pressed.current === true;
      pressed.current = null;
      if (live.current.running) stopDirectorsCut("toggle");
      else if (!began) {
        const a = document.activeElement;
        invoker.current = a instanceof HTMLElement && a !== document.body && !groupRef.current?.contains(a) ? a : null;
        show(live.current.off ? "note-cut" : "cut");
      }
    };
    window.addEventListener(DC_CHOOSER_EVENT, showChooser);
    return () => window.removeEventListener(DC_CHOOSER_EVENT, showChooser);
  }, []);

  // a popover whose chunk never arrived (a failed load) does not stay "open"
  useEffect(() => {
    if (open !== "cut" && open !== "games") return;
    const t = window.setTimeout(() => {
      if (live.current.open === open && ready !== open) setOpen(null);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [open, ready]);

  // a game starting closes any popover
  useEffect(() => on("game:start", () => setOpen(null)), []);

  // warm the intro controller and the popover chunk when the visitor is near
  // (only where the dock shows: hover and focus still prime it on a laptop)
  useEffect(() => {
    if (!fine) return;
    const idle = window.setTimeout(() => {
      primeIntro();
      warmPopovers();
    }, 2500);
    return () => window.clearTimeout(idle);
  }, [fine]);

  // the silent cue (components/site/dock-cue.ts, lazy): two ring pulses on the
  // cut and games buttons, once per session each, after the intro
  useEffect(() => {
    if (!fine) return;
    let off = () => {};
    let dead = false;
    void import("@/components/site/dock-cue")
      .then((m) => {
        if (!dead) off = m.armCues(cutRef.current, gamesRef.current);
      })
      .catch(() => {});
    return () => {
      dead = true;
      off();
    };
  }, [fine]);

  const onReplay = () => {
    if (live.current.off) {
      setOpen((o) => (o === "note-replay" ? null : "note-replay"));
      return;
    }
    setOpen(null);
    void actions().then((m) => m.replayIntro());
  };
  const onCut = () => {
    // did this press begin while a tour ran? (then the player stopped it first)
    const began = pressed.current === true;
    pressed.current = null;
    if (live.current.off) {
      setOpen((o) => (o === "note-cut" ? null : "note-cut"));
      return;
    }
    if (live.current.running) {
      stopDirectorsCut("toggle");
      return;
    }
    if (began) return;
    if (live.current.open === "cut") close(false);
    else show("cut");
  };
  const onGames = () => (live.current.open === "games" ? close(false) : show("games"));

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
            aria-pressed={dc.running ? true : undefined}
            aria-haspopup={dc.running || off ? undefined : "dialog"}
            aria-expanded={dc.running || off ? undefined : open === "cut" && ready === "cut"}
            aria-disabled={off || undefined}
            aria-describedby={off && open === "note-cut" ? "dock-note-cut" : undefined}
            title={off && cutWhy ? cutWhy : dc.running ? (text("dock.cut.stop") ?? undefined) : (cutTip ?? undefined)}
            onClick={onCut}
            onPointerEnter={warmPopovers}
            onFocus={warmPopovers}
          >
            {dc.running ? <Square aria-hidden="true" strokeWidth={2} fill="currentColor" /> : <Play aria-hidden="true" strokeWidth={2} />}
            {/* no aria-hidden: the name is what the visitor sees (one of the two
                words is display:none at any width); the spaces keep "cut OFF" apart */}
            <span className="dock-f">{cutLabel}</span>
            <span className="dock-s">{cutShort}</span>{" "}
            <span className="dock-chip">{dc.running ? onWord : offWord}</span>
            {!dc.running && !off ? <ChevronDown className="dock-caret" aria-hidden="true" strokeWidth={2.25} /> : null}
          </button>
          {open === "cut" ? (
            <Suspense fallback={null}>
              <Popover kind="cut" onDone={close} onReady={() => setReady("cut")} />
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
            aria-expanded={open === "games" && ready === "games"}
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
              <Popover kind="games" onDone={close} onReady={() => setReady("games")} />
            </Suspense>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
