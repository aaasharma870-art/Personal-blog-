"use client";

import { useEffect, useSyncExternalStore } from "react";
import { carrySound, preloadSound, setSoundOn, useSound } from "@/lib/audio/store";
import { copyText, copyVisible } from "@/lib/sections";

/* ============================================================================
   INTRO SOUND — the Play card's sound button (fix2d, finding S6).
   The page behind the prologue is inert, so the header's Sound toggle cannot
   be reached on the first pass; this is the same switch inside the dialog,
   so a first-time visitor can hear the intro (the hall's bed, the broom
   whoosh, the landing). Same store, same copy as the header toggle: the
   click is the audio gesture (lib/audio/store.ts setSoundOn creates the
   AudioContext inside it), the header's toggle mounts the bed follower.
   - Muted by default; SSR and hydration render the muted state, the real
     one arrives one render later (like the header toggle).
   - Shown under DESKTOP_FINE only (app/p3/sound.css `.intro-sound`), like
     the header toggle; hidden when there is no Web Audio / motion is off.
   - Its label is the state ("Sound off" / "Sound on"), which is also its
     accessible name; the speaker icon shows the same.
   - The controller (components/intro/controller.js) puts it in the dialog's
     Tab cycle: Play, Sound, Skip to the research, Skip. Enter / Space press
     it; it never starts, skips or changes the flight.
   - A Replay intro reloads the page (components/intro/intro-head-script.tsx
     sets window.__introReplayed when it armed from the replay marker). With
     sound on, the button then brings the sound back by itself (carrySound:
     the hall's bed under the card, as before the reload) or, where the browser
     does not carry the click's permission, says "Sound off" and waits for the
     visitor, as at the beginning. A first visit never takes that path.
   ========================================================================== */

const NAME = copyText("sound.name");
const ON = copyText("sound.on");
const OFF = copyText("sound.off");

/** true after hydration (server + hydration render = false). */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function IntroSound() {
  const mounted = useMounted();
  const { on, available } = useSound();
  const label = on ? ON : OFF;
  const shown = copyVisible(label);
  useEffect(() => {
    if ((window as Window & { __introReplayed?: number }).__introReplayed) carrySound();
  }, []);
  return (
    <button
      type="button"
      id="intro-sound"
      className="intro-skip intro-sound type-meta"
      data-intro-sound={on ? "on" : "off"}
      hidden={mounted && !available ? true : undefined}
      onPointerEnter={available ? preloadSound : undefined}
      onFocus={available ? preloadSound : undefined}
      onClick={() => {
        void setSoundOn(!on);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="intro-sound__icon">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        <g className="intro-sound__waves" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
          <path d="M18 7a7 7 0 0 1 0 10" />
        </g>
        <g className="intro-sound__mute" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
        </g>
      </svg>
      {shown ? <span>{label.text}</span> : <span className="sr-only">{copyVisible(NAME) ? NAME.text : "Sound"}</span>}
    </button>
  );
}
