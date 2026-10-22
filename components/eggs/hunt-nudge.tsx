"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { DESKTOP_FINE } from "@/lib/flags";
import { isQuiet, whenQuietEnd } from "@/lib/ladder";
import { copyText, copyVisible } from "@/lib/sections";
import { useDirectorsCut, overlayOpen } from "@/components/director/api";
import { eggsSessionOff } from "@/components/eggs/egg-bus";
import { markNudgeSeen, nudgeSeen } from "@/components/eggs/hunt-store";
// its CSS (eggs-lazy.css) loads with this lazy chunk, not the page
import "@/app/p3/eggs-lazy.css";

/* ============================================================================
   HUNT NUDGE (lazy; Oct 22 fix, fix/eggs) — the one-time "there are eggs"
   line. Aryan could not tell the page HAS eggs, or how to start. Once per tab
   (sessionStorage, lib/session via hunt-store `markNudgeSeen`; once per page
   view when storage is blocked), the first time the visitor is past the
   first act (About's top is above the middle of the screen) or ~25 s after
   the opening settled, a small plate hangs under the Eggs chip: "There are
   12 easter eggs hidden here. Open EGGS for hints." with a key that opens
   the hunt panel and a quiet "Not now". NON-BLOCKING: it takes no focus, no
   scroll lock, no click-away; it fades by itself after 16 s unless the
   pointer or the keyboard focus is on it.
   QUIET RULES (it waits, then shows, or never shows): not during the intro
   (`html.intro-armed`, the ladder's quiet window), a director's cut tour or
   its end card, a game (`html[data-game]`), the palette / a menu / the map /
   the hunt panel (director/api `overlayOpen`), while the eggs are off, a
   hidden tab, a pinned act card mid-play (phases a, b, m), or while the page
   is still scrolling (350 ms of calm first; 8 s after a game or tour ends).
   It never asks the spotlight:
   it is a corner note, not a star (and the spotlight answers each id once).
   Mounted by <HuntChip/> ~5 s after hydration, on DESKTOP_FINE with the eggs
   on and nothing found yet; the chip owns "open the panel".
   ========================================================================== */

const CALM_MS = 350;
/** After a game or a tour has ended the page gets this long before the plate may show. */
const AFTER_BUSY_MS = 8000;
const AFTER_MS = 25_000;
const SHOW_MS = 16_000;
const POLL_MS = 500;

/** The viewport's middle sits in an act card that is still playing (phases a, b, m). */
function cardPlaying(): boolean {
  const mid = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
  const phase = mid?.closest("[data-card-phase]")?.getAttribute("data-card-phase");
  return phase === "a" || phase === "b" || phase === "m";
}

/** Past the first act: About's top has crossed the middle of the screen. */
function pastFirstAct(): boolean {
  const about = document.getElementById("about");
  return about ? about.getBoundingClientRect().top < window.innerHeight * 0.5 : false;
}

export default function HuntNudge({ onOpen, onGone }: { onOpen: () => void; onGone: () => void }) {
  const [shown, setShown] = useState(false);
  const tour = useDirectorsCut();
  const box = useRef<HTMLDivElement>(null);
  // always this render's values, from inside the watcher's timers
  const tourBusy = useEffectEvent(() => tour.running || tour.ended);
  const gone = useEffectEvent(() => onGone());

  useEffect(() => {
    if (!window.matchMedia(DESKTOP_FINE).matches) return;
    let alive = true;
    let t0 = Number.POSITIVE_INFINITY;
    let lastScroll = performance.now();
    let lastBusy = Number.NEGATIVE_INFINITY;
    const onScroll = () => {
      lastScroll = performance.now();
    };
    void whenQuietEnd().then(() => {
      if (alive) t0 = performance.now();
    });
    const root = document.documentElement;
    const check = () => {
      if (!alive || document.visibilityState !== "visible") return;
      // the panel was opened (or the plate shown) since this watcher was armed: once per tab, never again
      if (nudgeSeen()) {
        alive = false;
        window.clearInterval(poll);
        gone();
        return;
      }
      if (root.classList.contains("intro-armed") || isQuiet() || eggsSessionOff()) return;
      if (tourBusy() || root.hasAttribute("data-game")) {
        lastBusy = performance.now();
        return;
      }
      if (overlayOpen() || performance.now() - lastBusy < AFTER_BUSY_MS) return;
      if (performance.now() - lastScroll < CALM_MS || cardPlaying()) return;
      if (!pastFirstAct() && performance.now() - t0 < AFTER_MS) return;
      alive = false;
      window.clearInterval(poll);
      markNudgeSeen();
      setShown(true);
    };
    const poll = window.setInterval(check, POLL_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // it fades by itself (a hover or focus on it holds it), and Esc dismisses it
  useEffect(() => {
    if (!shown) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => gone(), SHOW_MS);
    };
    const hold = () => window.clearTimeout(timer);
    const el = box.current;
    arm();
    el?.addEventListener("pointerenter", hold);
    el?.addEventListener("pointerleave", arm);
    el?.addEventListener("focusin", hold);
    el?.addEventListener("focusout", arm);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") gone();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      el?.removeEventListener("pointerenter", hold);
      el?.removeEventListener("pointerleave", arm);
      el?.removeEventListener("focusin", hold);
      el?.removeEventListener("focusout", arm);
      window.removeEventListener("keydown", onKey);
    };
  }, [shown]);

  const text = copyText("egg.nudge.text");
  const open = copyText("egg.nudge.open");
  const dismiss = copyText("egg.nudge.dismiss");
  if (!shown || !copyVisible(text) || !copyVisible(open)) return null;

  return (
    <div ref={box} className="egg-nudge" data-egg-nudge="">
      <p className="egg-nudge-text" role="status">
        {text.text}
      </p>
      <div className="egg-nudge-act">
        <button type="button" className="egg-key" onClick={onOpen}>
          <span className="egg-key-face">
            <span className="egg-key-lamp" aria-hidden="true" />
            {open.text}
          </span>
        </button>
        {copyVisible(dismiss) ? (
          <button type="button" className="egg-nudge-ghost" onClick={onGone}>
            {dismiss.text}
          </button>
        ) : null}
      </div>
    </div>
  );
}
