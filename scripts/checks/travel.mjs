// scripts/checks/travel.mjs: PHASE3-SPEC §3.4 check 5 (card travel budgets, ERROR).
// Replaces the old validator's #3 (≤ 2 long cards) and #4 (signature ≤ 6, scene + long ≤ 2).
// Owner: B1-BEATS (W1); W2-CARDS (W2) (PHASE3-PLAN §4.7).
//   - film.cardTravel: every pinned card kind in use has a number, 0 ≤ travel ≤ 110 vh;
//   - the travel of the cards in use sums to ≤ 400 vh (and the whole table too);
//   - travel is a DESKTOP_FINE boot-gate layout (spec §3.2 "Layout gates"), 0 below: any
//     component or style that reads `cardTravel` must key it on the boot gate (lib/** is
//     data and may compute with it).
import fs from "node:fs";
import path from "node:path";

const MAX_EACH = 110;
const MAX_SUM = 400;
/** Cards that pin (spec §7.1); reel / title cards have no travel. */
const PINNED = ["opening", "seam", "tintype", "ignite"];
/** What a boot-gated reader looks like (globals.css `boot` variant, lib/flags.ts). */
const BOOT_GATE = /\bboot:|bootGateOn\(|@custom-variant boot\b|data-motion-boot|useBootGate|\bbootGate\b/;
/** Where layout happens (lib/** is data; scripts and tools are checks). */
const LAYOUT = /^(components|app)[\\/]/;

export default function run({ ROOT, err, film, page, derive, uiFiles }) {
  const travel = film.cardTravel;
  if (!travel || typeof travel !== "object") {
    err(`[P3 #5] film.cardTravel is missing (spec §7.1)`);
    return;
  }
  for (const [k, v] of Object.entries(travel)) {
    if (!PINNED.includes(k)) err(`[P3 #5] film.cardTravel.${k}: not a pinned card kind (${PINNED.join(", ")})`);
    if (!(typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= MAX_EACH)) err(`[P3 #5] film.cardTravel.${k} = ${v} (0–${MAX_EACH} vh)`);
  }
  const total = Object.values(travel).reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  if (total > MAX_SUM) err(`[P3 #5] film.cardTravel sums to ${total} vh (max ${MAX_SUM})`);

  const enabled = page.filter((s) => s.enabled !== false);
  const cards = derive.actCardsOf(enabled, film);
  let used = 0;
  for (const c of cards) {
    if (!PINNED.includes(c.transition)) continue;
    const v = travel[c.transition];
    if (v === undefined) err(`[P3 #5] card ${c.id} (${c.transition}) has no film.cardTravel.${c.transition}`);
    else used += v;
  }
  if (used > MAX_SUM) err(`[P3 #5] the cards in use travel ${used} vh in all (max ${MAX_SUM})`);

  for (const f of uiFiles) {
    const rel = path.relative(ROOT, f);
    if (!LAYOUT.test(rel)) continue;
    const src = fs.readFileSync(f, "utf8");
    if (/\bcardTravel\b/.test(src) && !BOOT_GATE.test(src)) {
      err(`[P3 #5] ${rel} reads cardTravel without the boot gate (travel is DESKTOP_FINE + motion-on layout only; 0 below)`);
    }
  }
}
