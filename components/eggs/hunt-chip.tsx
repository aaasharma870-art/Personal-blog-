"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import { on } from "@/lib/events";
import { film } from "@/lib/film";
import { motionOffNow } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";
import { copyText, copyVisible } from "@/lib/sections";
import { HUNT_PANEL_EVENT, HUNT_TOTAL, useHuntState } from "@/components/eggs/hunt-store";

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
   ========================================================================== */

// safeLazy: a failed chunk opens nothing, never an application error (W3 review #6)
const HuntPanel = safeLazy(() => import("@/components/eggs/hunt-panel"));
const preload = () => void import("@/components/eggs/hunt-panel");
/** The visible word before the count from 90rem up ("Eggs 0/12"; app/p3/dock.css). */
const EGGS_WORD = copyText("dock.eggs");

export function HuntChip() {
  const { count, enabled } = useHuntState();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
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
    const show = () => setOpen(true);
    window.addEventListener(HUNT_PANEL_EVENT, show);
    return () => window.removeEventListener(HUNT_PANEL_EVENT, show);
  }, []);

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
    <span className="hunt-chip-wrap" data-house-type="">
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
        onClick={() => setOpen((o) => !o)}
        onPointerEnter={preload}
        onFocus={preload}
      >
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
    </span>
  );
}
