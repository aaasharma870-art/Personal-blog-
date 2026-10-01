/* ============================================================================
   HUNT STORE (the always-loaded half; PHASE3-SPEC §3.6, PHASE3-PLAN §3.7).
   OWNER: W2-HUNT. The smallest piece every hunt surface shares: the 12 ids,
   the stored finds, one subscription and one hydration-safe hook. The chip,
   the SEEKER row, THE HUNT credits gate and the palette read it; the
   registry (components/eggs/hunt-rows.ts) and the actions (lib/hunt.ts:
   markFound, the pen) load with the lazy chunks that need them, so the
   first load pays only for this file.

   STORE: localStorage["aryan:hunt:v1"] = {"v":1,"found":{"<id>":<ts>}}
   (+ "rows" / "deadEye" for the pen). Every access is in try/catch; a
   blocked store works in memory for the view. Unknown ids are dropped, so
   the count is capped at 12. One `storage` listener syncs the other tabs.
   HYDRATION: the server snapshot has `count: null` ("–/12"); the stored
   count arrives one render after hydration, so the markup never mismatches.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { film } from "@/lib/film";
import { eggsSessionOff, subscribeEggs } from "@/components/eggs/egg-bus";

/** The 12 hunt eggs (spec §9.1), three per world. */
export const HUNT_IDS = [
  "hp-map",
  "hp-lumos",
  "hp-snitch",
  "pc-parley",
  "pc-coin",
  "pc-kraken",
  "3i-aal",
  "3i-quad",
  "3i-pen",
  "rd-eagle",
  "rd-bone",
  "rd-fire",
] as const;
export type HuntId = (typeof HUNT_IDS)[number];
export const HUNT_TOTAL = 12;

export function isHuntId(id: string): id is HuntId {
  return (HUNT_IDS as readonly string[]).includes(id);
}

/** Opens the hunt panel (the palette's "Show egg hints"); the chip listens. */
export const HUNT_PANEL_EVENT = "hunt:panel";

const KEY = "aryan:hunt:v1";

export type HuntStored = { v: 1; found: Partial<Record<HuntId, number>>; rows: string[]; deadEye?: number };

/** The view's copy when localStorage is blocked. */
let memory: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

/** The stored hunt, validated (corrupt or unknown → an empty hunt). */
export function readHunt(): HuntStored {
  const out: HuntStored = { v: 1, found: {}, rows: [] };
  if (typeof window === "undefined") return out;
  try {
    const o = JSON.parse(readRaw() ?? "null") as { v?: unknown; found?: Record<string, unknown>; rows?: unknown; deadEye?: unknown } | null;
    if (!o || o.v !== 1 || !o.found || typeof o.found !== "object") return out;
    for (const id of HUNT_IDS) {
      const t = o.found[id];
      if (typeof t === "number" && Number.isFinite(t)) out.found[id] = t;
    }
    if (Array.isArray(o.rows)) out.rows = o.rows.filter((r): r is string => typeof r === "string").slice(-64);
    if (typeof o.deadEye === "number") out.deadEye = o.deadEye;
  } catch {
    /* corrupt: start over */
  }
  return out;
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Save (null forgets the hunt) and tell every subscriber in this tab. */
export function writeHunt(s: HuntStored | null): void {
  const value = s ? JSON.stringify(s) : null;
  memory = value;
  try {
    if (value === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    /* memory only */
  }
  notify();
}

/** Ids found, in registry order. */
export function foundIds(s: HuntStored = readHunt()): HuntId[] {
  return HUNT_IDS.filter((id) => s.found[id] !== undefined);
}

let storageWired = false;
const onStorage = (e: StorageEvent) => {
  if (e.key === KEY || e.key === null) notify();
};

/** Hunt changes in this tab, in another tab, and "Turn off easter eggs". */
export function subscribeHunt(onChange: () => void): () => void {
  if (!storageWired && typeof window !== "undefined") {
    storageWired = true;
    window.addEventListener("storage", onStorage);
  }
  listeners.add(onChange);
  const offEggs = subscribeEggs(onChange);
  return () => {
    listeners.delete(onChange);
    offEggs();
  };
}

/* — the hook ———————————————————————————————————————————————————————— */

export type HuntState = { count: number | null; found: ReadonlySet<HuntId>; enabled: boolean };

const registryOn = (): boolean => film.enabled && film.eggs.enabled;
const SERVER: HuntState = { count: null, found: new Set(), enabled: registryOn() };

let snap: HuntState | null = null;
let snapKey = "";

function clientSnapshot(): HuntState {
  const ids = foundIds();
  const enabled = registryOn() && !eggsSessionOff();
  const key = `${enabled ? 1 : 0}|${ids.join(",")}`;
  if (!snap || key !== snapKey) {
    snap = { count: Math.min(ids.length, HUNT_TOTAL), found: new Set(ids), enabled };
    snapKey = key;
  }
  return snap;
}

const serverSnapshot = () => SERVER;

/** The visitor's hunt: `count` is null on the server and during hydration
 *  (render "–/12"), then the stored count. `enabled` is false when the
 *  registry is off or the visitor turned the eggs off for this session (the
 *  chip and the hints hide; the count is kept). */
export function useHuntState(): HuntState {
  return useSyncExternalStore(subscribeHunt, clientSnapshot, serverSnapshot);
}
