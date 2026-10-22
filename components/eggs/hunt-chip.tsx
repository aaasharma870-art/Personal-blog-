"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import { on } from "@/lib/events";
import { film } from "@/lib/film";
import { motionOffNow } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";
import { copyText, copyVisible } from "@/lib/sections";
import { HUNT_PANEL_EVENT, HUNT_TOTAL, markNudgeSeen, nudgeSeen, useHuntState } from "@/components/eggs/hunt-store";

/* ============================================================================
   HUNT CHIP "n/12" (PHASE3-SPEC §9.3, P3-8) — OWNER: W2-HUNT.
   Pre-mounted in the header's right cluster, before the sound toggle and
   Pause. A server-rendered <button> in Meta tnum, shown only on
   DESKTOP_FINE by the full media query (app/p3/game.css; never `lg:`), so a
   touch tablet never shows a hunt it cannot play. Its count box reserves
   "12/12" (no shift when the count arrives). "–/12" on the server and
   during hydration; the stored count one render later.
   - One 400 ms tick per `hunt:found` (none with motion off).
   - Snitch gold at 12/12.
   - Opens the lazy hunt panel (components/eggs/hunt-panel.tsx): a
     non-modal popover; Esc closes it and focus returns here. The palette's
     "Show egg hints" opens it too (HUNT_PANEL_EVENT).
   - "Turn off easter eggs" hides it (the count is kept).
   Oct 22 (fix/eggs): an egg glyph before the count at EVERY desktop width
   (the word "Eggs" still joins from 84rem), the count in gold once anything
   is found, the name "n of 12 easter eggs found, open for hints", and the
   one-time nudge (hunt-nudge.tsx, lazy: mounted ~5 s after hydration, only
   with the eggs on, nothing found and this tab not yet nudged).
   ========================================================================== */

// safeLazy: a failed chunk opens nothing, never an application error (W3 review #6)
const HuntPanel = safeLazy(() => import("@/components/eggs/hunt-panel"));
const preload = () => void import("@/components/eggs/hunt-panel");
const HuntNudge = safeLazy(() => import("@/components/eggs/hunt-nudge"));
/** How long after hydration the nudge's watcher is mounted. */
const NUDGE_ARM_MS = 5000;

/** The egg: an outline at 0, filled gold once something is found. */
function EggGlyph() {
  return (
    <svg className="hunt-chip-egg" viewBox="0 0 14 18" aria-hidden="true" focusable="false">
      <path d="M7 1.1C4 1.1 1.2 6.2 1.2 10.8c0 3.4 2.5 6.1 5.8 6.1s5.8-2.7 5.8-6.1C12.8 6.2 10 1.1 7 1.1Z" />
    </svg>
  );
}
/** The visible word before the count from 90rem up ("Eggs 0/12"; app/p3/dock.css). */
const EGGS_WORD = copyText("dock.eggs");

export function HuntChip() {
  const { count, enabled } = useHuntState();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [nudge, setNudge] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(
    () =>
      on("hunt:found", () => {
        if (!motionOffNow()) setTick((t) => t + 1);
      }),
    [],
  );
  useEffect(() => {
    const show = () => {
      markNudgeSeen();
      setNudge(false);
      setOpen(true);
    };
    window.addEventListener(HUNT_PANEL_EVENT, show);
    return () => window.removeEventListener(HUNT_PANEL_EVENT, show);
  }, []);
  // the one-time nudge: armed once the count is known to be 0 and this tab has not had it
  const fresh = enabled && count === 0;
  useEffect(() => {
    if (!fresh || nudgeSeen()) return;
    const t = window.setTimeout(() => setNudge(true), NUDGE_ARM_MS);
    return () => window.clearTimeout(t);
  }, [fresh]);

  if (!film.enabled || !film.eggs.enabled) return null;
  const n = count === null ? "–" : String(count);
  if (!enabled) {
    // eggs turned off for the session: the chip is gone, but its width is not
    // (an invisible, inert twin of its box holds the place), so the dock and
    // the rest of the header do not slide right when it disappears. It is no
    // button and carries no data-hunt-chip: nothing can find or press it.
    const ghostLabel = copyText("egg.hunt.chip", { n: "0" });
    if (!copyVisible(ghostLabel)) return null;
    return (
      <span className="hunt-chip-wrap invisible" data-house-type="" aria-hidden="true" inert>
        <span className="hunt-chip type-meta">
          <EggGlyph />
          {copyVisible(EGGS_WORD) ? (
            <span className="dock-word">
              {EGGS_WORD.text}
              {"\u00a0"}
            </span>
          ) : null}
          <span className="hunt-chip-n">{ghostLabel.text}</span>
        </span>
      </span>
    );
  }
  const label = copyText("egg.hunt.chip", { n });
  const name = copyText("dock.eggs.name", { n });
  if (!copyVisible(label) || !copyVisible(name)) return null;

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };

  return (
    <span className="hunt-chip-wrap" data-house-type="" data-dc-keep="">
      <button
        ref={btn}
        type="button"
        className="hunt-chip type-meta"
        aria-label={name.text}
        // a hover hint for the bare "0/12" (W2 visual LOW 10): the same line
        title={name.text}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-hunt-chip=""
        data-complete={count === HUNT_TOTAL ? "" : undefined}
        data-any={count ? "" : undefined}
        onClick={() => {
          markNudgeSeen();
          setNudge(false);
          setOpen((o) => !o);
        }}
        onPointerEnter={preload}
        onFocus={preload}
      >
        <EggGlyph />
        {copyVisible(EGGS_WORD) ? (
          <span aria-hidden="true" className="dock-word">
            {EGGS_WORD.text}
            {"\u00a0"}
          </span>
        ) : null}
        <span key={tick} className="hunt-chip-n" data-tick={tick ? "" : undefined} aria-hidden="true">
          {label.text}
        </span>
      </button>
      {open ? (
        <Suspense fallback={null}>
          <HuntPanel id={panelId} chip={btn} onClose={close} />
        </Suspense>
      ) : null}
      {nudge && !open ? (
        <Suspense fallback={null}>
          <HuntNudge
            onOpen={() => {
              setNudge(false);
              setOpen(true);
            }}
            onGone={() => setNudge(false)}
          />
        </Suspense>
      ) : null}
    </span>
  );
}
