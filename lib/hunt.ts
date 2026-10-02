/* ============================================================================
   HUNT — the 12-egg hunt: the registry and the visitor's progress
   (PHASE3-SPEC §3.6, §9; PHASE3-PLAN §3.7). OWNER: W2-HUNT.
   Three eggs per world: one spell (typed + palette + a lettered hint) and
   two finds. Each counts once.

   Split in three so the first load pays only for what the header needs:
   - components/eggs/hunt-store.ts — the ids, the stored finds, the
     subscription and the hydration-safe hook (always loaded: the chip).
   - components/eggs/hunt-rows.ts — the registry rows (pure data, which
     Node imports for scripts/checks/hunt.mjs).
   - this file — the contract: `HUNT`, `useHunt`, and the actions. Import it
     from lazy chunks and event handlers (a dynamic `import("@/lib/hunt")` in
     a first-load component). CLIENT ONLY for values (its store uses a React
     hook): a server component imports its TYPES, or reads the rows from
     components/eggs/hunt-rows.ts.

   RULES (spec §3.6): Obliviate never clears the hunt; `resetHunt()` (the
   confirmed "Reset the egg hunt") does. "Turn off easter eggs" sets
   `enabled: false` (the chip and the hints hide) and keeps the count. The
   Pause control is never a trigger: nothing here listens to it.
   ========================================================================== */

import { eggEnabled } from "@/components/eggs/egg-bus";
import { HUNT_ROWS, type HuntRow } from "@/components/eggs/hunt-rows";
import {
  HUNT_IDS,
  HUNT_TOTAL,
  foundIds,
  isHuntId,
  readHunt,
  useHuntState,
  writeHunt,
  type HuntId,
  type HuntState,
} from "@/components/eggs/hunt-store";
import { emit } from "./events";
import { film } from "./film";

export { HUNT_IDS, HUNT_TOTAL, isHuntId };
export type { HuntId, HuntState };

/** One egg (spec §9.1): world, the EggId that fires it (`registryId`), its
 *  host, its copy keys, its triggers, palette spell words, its keyboard
 *  path and its reduced-motion state. */
export type HuntSpec = HuntRow;

/** The 12 eggs (panel order: 4 worlds × 3, in page order). */
export const HUNT: Readonly<Record<HuntId, HuntSpec>> = HUNT_ROWS;

const registryOn = (): boolean => film.enabled && film.eggs.enabled;

/** The visitor's hunt. `count` is null on the server and during hydration
 *  (render "–/12"), then the stored count. */
export function useHunt(): HuntState {
  return useHuntState();
}

/** Count `id` as found (idempotent). true only the first time; dispatches
 *  `hunt:found` { id, count } (the chip ticks, the egg runtime toasts, the
 *  sound engine chimes). false on the server, for an unknown id, or when the
 *  egg is off in the registry. Eggs turned off for the session still count
 *  a find the visitor asks for (the palette keeps its eggs). */
export function markFound(id: HuntId): boolean {
  if (typeof window === "undefined" || !isHuntId(id) || !registryOn() || !eggEnabled(HUNT[id].registryId)) return false;
  const s = readHunt();
  if (s.found[id] !== undefined) return false;
  s.found[id] = Date.now();
  writeHunt(s);
  emit("hunt:found", { id, count: Math.min(foundIds(s).length, HUNT_TOTAL) });
  return true;
}

/** Forget every find and the pen's progress (the confirmed palette / panel
 *  command; never Obliviate). */
export function resetHunt(): void {
  if (typeof window === "undefined") return;
  writeHunt(null);
}

/** A kill-list ledger row reached the reading line or was activated. */
export function recordLedgerRowRead(row: string): void {
  if (typeof window === "undefined" || !row) return;
  const s = readHunt();
  if (s.rows.includes(row)) return;
  s.rows = [...s.rows, row].slice(-64);
  writeHunt(s);
}

/** The visitor won Dead Eye (the other way to earn the pen). */
export function recordDeadEyeWin(): void {
  if (typeof window === "undefined") return;
  const s = readHunt();
  if (s.deadEye !== undefined) return;
  s.deadEye = Date.now();
  writeHunt(s);
}

/** The kill-list ledger's RENDERED rows (flagships + survivors + killed
 *  ideas: components/site/ledger-reckoning.tsx `li[data-row]`). Read from
 *  the DOM, never from lib/content: this module is lazy, but any client
 *  import of a content export makes the shared first-load content module
 *  ship that export too (+1.9 KB gz on "/", W2 assembly). */
function ledgerRows(): number {
  return document.querySelectorAll("[data-ledger] li[data-row]").length;
}

/** The pen counts only for the worthy: every ledger row read (`total`
 *  defaults to the ledger's rendered rows; pass the count if it differs)
 *  OR Dead Eye won. */
export function worthyOfPen(total?: number): boolean {
  if (typeof window === "undefined") return false;
  const s = readHunt();
  const n = total ?? ledgerRows();
  return s.deadEye !== undefined || (n > 0 && s.rows.length >= n);
}
