/* ============================================================================
   HUNT — the 12-egg hunt: the registry and the visitor's progress
   (PHASE3-SPEC §3.6, §9; PHASE3-PLAN §3.7). Three eggs per world: one spell
   (typed + palette + a lettered hint) and two finds. Each counts once.

   HUNT is final data (W1.0). Each row maps a hunt id onto its egg-bus id
   (`registryId`, the EggId `triggerEgg()` fires) and names its host
   section, its name and hint copy keys (lib/film.ts `egg.hunt.*`; hp-lumos
   reuses the Pause tooltip "pause.tooltip.resume") and, for the spells, the
   palette words that reveal it (hunt eggs are hidden from the palette's
   browse list until the query holds a spell word).

   STORE: localStorage["aryan:hunt:v1"] = {"v":1,"found":{"<id>":<ts>}}
   (+ "rows" / "deadEye" for the pen). Every access in try/catch (a blocked
   store works in memory for the view); unknown ids are dropped, so the
   count is capped at 12; a `storage` event syncs tabs. `useHunt()` is a
   useSyncExternalStore whose server snapshot has `count: null` ("–/12"):
   the count arrives one render after hydration (no mismatch). Obliviate
   never clears the hunt; `resetHunt()` (the palette's confirmed "Reset the
   egg hunt") does. "Turn off easter eggs" sets `enabled: false` (the chip
   and hints hide) and keeps the count. W2-HUNT may rewrite the internals.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { eggEnabled, eggsSessionOff, subscribeEggs, type EggId } from "@/components/eggs/egg-bus";
import { featuredProjects, killList, survivors } from "./content";
import { emit } from "./events";
import { film, type CopyKey } from "./film";
import type { WorldId } from "./worlds";

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

export type HuntSpec = {
  world: WorldId;
  /** The egg-bus id that fires it (lib/film.ts `eggs.list` via REGISTRY_ID). */
  registryId: EggId;
  /** Section / card id it lives in, or "global" (typed + palette). */
  host: string;
  name: CopyKey;
  hint: CopyKey;
  /** Palette query words that reveal a spell egg. */
  spell?: readonly string[];
};

/** The 12 eggs (PHASE3-SPEC §9.1), in panel order (4 worlds × 3). */
export const HUNT: Readonly<Record<HuntId, HuntSpec>> = {
  "hp-map": { world: "hp", registryId: "marauders-map", host: "global", name: "egg.hunt.name.hp-map", hint: "egg.hunt.hint.hp-map", spell: ["solemn"] },
  "hp-lumos": { world: "hp", registryId: "lumos", host: "global", name: "egg.hunt.name.hp-lumos", hint: "pause.tooltip.resume", spell: ["lumos", "nox"] },
  "hp-snitch": { world: "hp", registryId: "snitch", host: "credits", name: "egg.hunt.name.hp-snitch", hint: "egg.hunt.hint.hp-snitch" },
  "pc-parley": { world: "pirates", registryId: "parley", host: "global", name: "egg.hunt.name.pc-parley", hint: "egg.hunt.hint.pc-parley", spell: ["parley"] },
  "pc-coin": { world: "pirates", registryId: "aztec-coin", host: "journey", name: "egg.hunt.name.pc-coin", hint: "egg.hunt.hint.pc-coin" },
  "pc-kraken": { world: "pirates", registryId: "hidden-kraken", host: "act-2", name: "egg.hunt.name.pc-kraken", hint: "egg.hunt.hint.pc-kraken" },
  "3i-aal": { world: "idiots", registryId: "aal-izz-well", host: "optuna-screener", name: "egg.hunt.name.3i-aal", hint: "egg.hunt.hint.3i-aal", spell: ["aal"] },
  "3i-quad": { world: "idiots", registryId: "quadcopter-lift", host: "work", name: "egg.hunt.name.3i-quad", hint: "egg.hunt.hint.3i-quad" },
  "3i-pen": { world: "idiots", registryId: "worthy-pen", host: "kill-list", name: "egg.hunt.name.3i-pen", hint: "egg.hunt.hint.3i-pen" },
  "rd-eagle": { world: "rdr2", registryId: "eagle-eye", host: "beyond", name: "egg.hunt.name.rd-eagle", hint: "egg.hunt.hint.rd-eagle" },
  "rd-bone": { world: "rdr2", registryId: "fossil-bone", host: "writing", name: "egg.hunt.name.rd-bone", hint: "egg.hunt.hint.rd-bone" },
  "rd-fire": { world: "rdr2", registryId: "campfire-flare", host: "voices", name: "egg.hunt.name.rd-fire", hint: "egg.hunt.hint.rd-fire" },
};

export const HUNT_TOTAL = HUNT_IDS.length;

export function isHuntId(id: string): id is HuntId {
  return (HUNT_IDS as readonly string[]).includes(id);
}

/* — storage ————————————————————————————————————————————————————————— */

const KEY = "aryan:hunt:v1";

type Stored = { v: 1; found: Partial<Record<HuntId, number>>; rows: string[]; deadEye?: number };

/** In-memory copy for a view whose localStorage is blocked. */
let memory: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

function writeRaw(value: string | null): void {
  memory = value;
  try {
    if (value === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    /* memory only */
  }
}

function parse(raw: string | null): Stored {
  const out: Stored = { v: 1, found: {}, rows: [] };
  if (!raw) return out;
  try {
    const o = JSON.parse(raw) as { v?: unknown; found?: Record<string, unknown>; rows?: unknown; deadEye?: unknown };
    if (!o || o.v !== 1 || !o.found || typeof o.found !== "object") return out;
    for (const id of HUNT_IDS) {
      const t = o.found[id];
      if (typeof t === "number" && Number.isFinite(t)) out.found[id] = t;
    }
    if (Array.isArray(o.rows)) out.rows = o.rows.filter((r): r is string => typeof r === "string").slice(0, 64);
    if (typeof o.deadEye === "number") out.deadEye = o.deadEye;
  } catch {
    /* corrupt: start over */
  }
  return out;
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function save(s: Stored): void {
  writeRaw(JSON.stringify(s));
  notify();
}

/* — the hook ———————————————————————————————————————————————————————— */

export type HuntState = { count: number | null; found: ReadonlySet<HuntId>; enabled: boolean };

const registryOn = (): boolean => film.enabled && film.eggs.enabled;
const SERVER: HuntState = { count: null, found: new Set(), enabled: registryOn() };

let snap: HuntState | null = null;
let snapKey = "";

function clientSnapshot(): HuntState {
  const s = parse(readRaw());
  const ids = HUNT_IDS.filter((id) => s.found[id] !== undefined);
  const enabled = registryOn() && !eggsSessionOff();
  const key = `${enabled ? 1 : 0}|${ids.join(",")}`;
  if (!snap || key !== snapKey) {
    snap = { count: Math.min(ids.length, HUNT_TOTAL), found: new Set(ids), enabled };
    snapKey = key;
  }
  return snap;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  const offEggs = subscribeEggs(onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
    offEggs();
  };
}

/** The visitor's hunt. `count` is null on the server and during hydration
 *  (render "–/12"), then the stored count. */
export function useHunt(): HuntState {
  return useSyncExternalStore(subscribe, clientSnapshot, () => SERVER);
}

/* — actions ————————————————————————————————————————————————————————— */

/** Count `id` as found (idempotent). true only the first time; dispatches
 *  `hunt:found` { id, count }. false on the server, for an unknown id, or
 *  when the egg is off in the registry. */
export function markFound(id: HuntId): boolean {
  if (typeof window === "undefined" || !isHuntId(id) || !registryOn() || !eggEnabled(HUNT[id].registryId)) return false;
  const s = parse(readRaw());
  if (s.found[id] !== undefined) return false;
  s.found[id] = Date.now();
  save(s);
  const count = HUNT_IDS.filter((x) => s.found[x] !== undefined).length;
  emit("hunt:found", { id, count });
  return true;
}

/** Forget every find (and the pen's progress). */
export function resetHunt(): void {
  if (typeof window === "undefined") return;
  writeRaw(null);
  notify();
}

/** A kill-list ledger row reached the reading line or was activated. */
export function recordLedgerRowRead(row: string): void {
  if (typeof window === "undefined" || !row) return;
  const s = parse(readRaw());
  if (s.rows.includes(row)) return;
  s.rows = [...s.rows, row].slice(-64);
  save(s);
}

/** The visitor won Dead Eye (the other way to earn the pen). */
export function recordDeadEyeWin(): void {
  if (typeof window === "undefined") return;
  const s = parse(readRaw());
  if (s.deadEye !== undefined) return;
  s.deadEye = Date.now();
  save(s);
}

/** The pen counts only for the worthy: every ledger row read (`total`
 *  defaults to the kill-list ledger's rows: flagships + survivors + killed
 *  ideas; pass the rendered count if it differs) OR Dead Eye won. */
export function worthyOfPen(total: number = featuredProjects.length + survivors.length + killList.length): boolean {
  if (typeof window === "undefined") return false;
  const s = parse(readRaw());
  return s.deadEye !== undefined || (total > 0 && s.rows.length >= total);
}
