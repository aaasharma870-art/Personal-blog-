/* ============================================================================
   EGG BUS — the tiny, always-loaded half of the easter eggs (SPEC v2 §10.3,
   eggs.BAR). Pure client utilities (no React): the trigger event every egg
   host listens for, the session switches ("Turn off easter eggs", the
   Map's footprint trail, the Snitch), and Obliviate.

   Storage is sessionStorage behind try/catch (lib/session.ts): a private
   window or blocked site data simply means no trail and eggs ON. Nothing
   here touches the DOM at rest (E1: the page with every egg untriggered is
   the page without eggs).
   ========================================================================== */

import { film } from "@/lib/film";
import { clearRunThisSession, readSession, writeSession } from "@/lib/session";

export type EggId =
  | "marauders-map"
  | "lumos"
  | "nox"
  | "accio-obliviate"
  | "parley"
  | "aal-izz-well"
  | "dead-eye"
  | "snitch"
  /* Phase 3 hunt eggs (PHASE3-SPEC §9.1; lib/hunt.ts). The first two are
     today's page-triggered eggs, named so the hunt can count them. */
  | "hidden-kraken"
  | "quadcopter-lift"
  | "aztec-coin"
  | "worthy-pen"
  | "eagle-eye"
  | "fossil-bone"
  | "campfire-flare"
  /** "Turn off / on easter eggs" (session; always available). */
  | "eggs-off"
  | "eggs-on";

/** window CustomEvent: { detail: { id: EggId } }. The EggHost (mounted
 *  with the command palette) runs it. */
export const EGG_EVENT = "egg:trigger";

export function triggerEgg(id: EggId): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EGG_EVENT, { detail: { id } }));
}

/* — the registry switch (lib/film.ts `eggs`) ——————————————————————— */

/** Registry id of an egg (lumos / nox share "lumos-nox"). */
const REGISTRY_ID: Record<EggId, string> = {
  "marauders-map": "marauders-map",
  lumos: "lumos-nox",
  nox: "lumos-nox",
  "accio-obliviate": "accio-obliviate",
  parley: "parley",
  "aal-izz-well": "aal-izz-well",
  "dead-eye": "dead-eye",
  snitch: "snitch",
  "hidden-kraken": "hidden-kraken",
  "quadcopter-lift": "quadcopter-lift",
  "aztec-coin": "aztec-coin",
  "worthy-pen": "worthy-pen",
  "eagle-eye": "eagle-eye",
  "fossil-bone": "fossil-bone",
  "campfire-flare": "campfire-flare",
  "eggs-off": "*",
  "eggs-on": "*",
};

/** On in the registry (film on, eggs on, this egg on). Data only: SSR = client. */
export function eggEnabled(id: EggId): boolean {
  if (!film.enabled || !film.eggs.enabled) return false;
  if (REGISTRY_ID[id] === "*") return true;
  const e = film.eggs.list.find((x) => x.id === REGISTRY_ID[id]);
  return Boolean(e?.enabled);
}

/* — "Turn off easter eggs" (session) ————————————————————————————— */

const OFF_KEY = "eggs:off";
const listeners = new Set<() => void>();

/** The visitor turned eggs off for this session (typed triggers and the
 *  auto-eggs stop; palette commands stay, so they can turn them back on). */
export function eggsSessionOff(): boolean {
  return readSession(OFF_KEY) === "1";
}

export function setEggsSessionOff(off: boolean): void {
  writeSession(OFF_KEY, off ? "1" : null);
  listeners.forEach((l) => l());
}

export function subscribeEggs(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/* — The Map's footprints: the visitor's OWN visited sections (E6) ——— */

const TRAIL_KEY = "eggs:map-trail";

/** Visited section ids in visit order (deduplicated; most recent last). */
export function readTrail(): string[] {
  const raw = readSession(TRAIL_KEY);
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

export function recordVisit(id: string): void {
  if (!id) return;
  const trail = readTrail().filter((x) => x !== id);
  trail.push(id);
  writeSession(TRAIL_KEY, trail.slice(-40).join(","));
}

/* — The Snitch (credits): caught this session ———————————————————— */

export const SNITCH_EVENT = "egg:snitch-caught";
const SEEKER_KEY = "eggs:seeker";

export function snitchCaught(): boolean {
  return readSession(SEEKER_KEY) === "1";
}

export function catchSnitch(): void {
  writeSession(SEEKER_KEY, "1");
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SNITCH_EVENT));
}

/* — Obliviate: forget this visit ———————————————————————————————————— */

/** Clears `intro-seen` (the prologue arms again on the next visit to the
 *  top), the Map trail and every egg flag (E12: it really does). The Pause
 *  choice is the visitor's accessibility setting and is kept. */
export function obliviate(): void {
  writeSession("intro-seen", null);
  writeSession(TRAIL_KEY, null);
  writeSession(SEEKER_KEY, null);
  writeSession(OFF_KEY, null);
  clearRunThisSession("egg:snitch");
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SNITCH_EVENT));
}
