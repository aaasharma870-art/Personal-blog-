/* ============================================================================
   SOUND STORE — on/off for this visit (PHASE3-SPEC §3.5, §10.4).
   `useSound()` is a useSyncExternalStore: the server and the hydration
   render are muted and unavailable; the client value arrives one render
   later. Persisted in sessionStorage "sound" (try/catch, lib/session.ts), so
   every new visit starts muted.

   W1.0: the store only (no AudioContext, no engine). W2-SOUND makes the
   first `setSoundOn(true)` create the AudioContext inside the click, load
   the engine chunk, and ties `available` to motion (RM / Pause disable it).
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit } from "../events";
import { readSession, writeSession } from "../session";

export type SoundState = { on: boolean; available: boolean };

const KEY = "sound";
const OFF: SoundState = { on: false, available: false };
const listeners = new Set<() => void>();
let snap: SoundState = OFF;

function audioAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.AudioContext === "function";
}

function snapshot(): SoundState {
  const available = audioAvailable();
  const on = available && readSession(KEY) === "on";
  if (snap.on !== on || snap.available !== available) snap = { on, available };
  return snap;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useSound(): SoundState {
  return useSyncExternalStore(subscribe, snapshot, () => OFF);
}

/** Turn sound on or off for this visit (call it from the click). */
export function setSoundOn(on: boolean): Promise<void> {
  if (!audioAvailable()) return Promise.resolve();
  writeSession(KEY, on ? "on" : null);
  listeners.forEach((l) => l());
  emit("sound:change", { on });
  return Promise.resolve();
}
