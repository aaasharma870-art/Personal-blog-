// scripts/checks/travel.mjs: PHASE3-SPEC §3.4 check 5 (card travel budgets, ERROR).
// Replaces the old validator's #3 (≤ 2 long cards) and #4 (signature ≤ 6, scene + long ≤ 2).
// Owner: B1-BEATS (W1); W2-CARDS (W2) (PHASE3-PLAN §4.7).
//   - film.cardTravel: every pinned card kind in use has a number, 0 ≤ travel ≤ 110 vh;
//   - the travel of the cards in use sums to ≤ 400 vh (and the whole table too);
//   - travel is a DESKTOP_FINE boot-gate layout (spec §3.2 "Layout gates"), 0 below: any
//     component or style that reads `cardTravel` must key it on the boot gate (lib/** is
//     data and may compute with it; comments do not count);
//   - W2-CARDS: the per-kind `--act-card-travel-<kind>` vars are declared ONLY in
//     app/p3/cards.css, ONLY inside the boot-gate media block under
//     `html.js:not([data-motion-boot="paused"])`, and equal film.cardTravel (vh), one per
//     pinned kind; the pin wrapper's min-height and the sticky stage live there too. No other
//     stylesheet declares them (the Phase-2 `[data-act-card-long]` rule in globals.css is
//     dead: CardShell no longer emits the attribute; a warning until the assembler drops it).
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
/** The boot gate's media query and its html guard (globals.css `boot:`). */
const GATE_MEDIA = /min-width:\s*64rem\)\s*and\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*and\s*\(prefers-reduced-motion:\s*no-preference/;
const GATE_HTML = /html\.js:not\(\[data-motion-boot="paused"\]\)/;
const CARDS_CSS = path.join("app", "p3", "cards.css");

/** Source without comments (block, line; CSS has only blocks). */
function stripComments(src, css) {
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, "");
  return css ? noBlock : noBlock.replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

/** Every declaration in a stylesheet with its enclosing preludes (outermost
 *  first). A small brace scanner: enough for plain CSS (no nesting tricks). */
function declarations(css) {
  const out = [];
  const stack = [];
  let buf = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      stack.push(buf.trim());
      buf = "";
    } else if (ch === "}") {
      for (const d of buf.split(";")) if (d.includes(":")) out.push({ decl: d.trim(), in: [...stack] });
      stack.pop();
      buf = "";
    } else if (ch === ";" && stack.length) {
      if (buf.includes(":")) out.push({ decl: buf.trim(), in: [...stack] });
      buf = "";
    } else buf += ch;
  }
  return out;
}

export default function run({ ROOT, err, warn, film, page, derive, uiFiles }) {
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
    if (c.travel !== undefined && film.intensity === "full" && c.travel !== v) {
      err(`[P3 #5] card ${c.id}: item.travel ${c.travel} ≠ film.cardTravel.${c.transition} ${v} (lib/derive.ts)`);
    }
  }
  if (used > MAX_SUM) err(`[P3 #5] the cards in use travel ${used} vh in all (max ${MAX_SUM})`);

  for (const f of uiFiles) {
    const rel = path.relative(ROOT, f);
    if (!LAYOUT.test(rel)) continue;
    const src = stripComments(fs.readFileSync(f, "utf8"), f.endsWith(".css"));
    if (/\bcardTravel\b/.test(src) && !BOOT_GATE.test(src)) {
      err(`[P3 #5] ${rel} reads cardTravel without the boot gate (travel is DESKTOP_FINE + motion-on layout only; 0 below)`);
    }
    // the per-kind travel vars belong to the cards partial alone
    if (f.endsWith(".css") && rel !== CARDS_CSS && /--act-card-travel-[a-z]+\s*:/.test(src)) {
      err(`[P3 #5] ${rel} declares --act-card-travel-* (only ${CARDS_CSS}, inside the boot gate)`);
    }
    if (f.endsWith(".css") && /\[data-act-card-long\]/.test(src)) {
      warn(`[P3 #5] ${rel}: the Phase-2 [data-act-card-long] travel rule is dead (CardShell pins through ${CARDS_CSS}); remove it`);
    }
  }

  // W2-CARDS: the travel lives in app/p3/cards.css, inside the boot gate
  const cssPath = path.join(ROOT, CARDS_CSS);
  if (!fs.existsSync(cssPath)) {
    err(`[P3 #5] ${CARDS_CSS} is missing`);
    return;
  }
  const decls = declarations(stripComments(fs.readFileSync(cssPath, "utf8"), true));
  const gated = (d) => d.in.some((p) => p.startsWith("@media") && GATE_MEDIA.test(p)) && d.in.some((p) => GATE_HTML.test(p));
  const seen = new Map();
  for (const d of decls) {
    const m = /^--act-card-travel-([a-z]+)\s*:\s*([\d.]+)(vh)?$/.exec(d.decl);
    if (!m) continue;
    if (!gated(d)) err(`[P3 #5] ${CARDS_CSS}: --act-card-travel-${m[1]} is declared outside the boot gate`);
    if (m[3] !== "vh") err(`[P3 #5] ${CARDS_CSS}: --act-card-travel-${m[1]} must be in vh`);
    seen.set(m[1], Number(m[2]));
  }
  for (const k of PINNED) {
    const want = travel[k];
    if (want === undefined) continue;
    if (!seen.has(k)) err(`[P3 #5] ${CARDS_CSS}: no --act-card-travel-${k} (film.cardTravel.${k} = ${want} vh)`);
    else if (seen.get(k) !== want) err(`[P3 #5] ${CARDS_CSS}: --act-card-travel-${k} = ${seen.get(k)}vh ≠ film.cardTravel.${k} = ${want}vh`);
  }
  for (const k of seen.keys()) if (!PINNED.includes(k)) err(`[P3 #5] ${CARDS_CSS}: --act-card-travel-${k} is not a pinned card kind`);
  // the wrapper's travel and the sticky stage are gated layout too
  const pinRules = decls.filter((d) => /^(min-height|position)\s*:/.test(d.decl) && d.in.some((p) => /\[data-act-card-pin\]/.test(p)));
  if (!pinRules.length) err(`[P3 #5] ${CARDS_CSS}: no pin-wrapper rule ([data-act-card-pin] min-height / the sticky stage)`);
  for (const d of pinRules) if (!gated(d)) err(`[P3 #5] ${CARDS_CSS}: "${d.decl}" on the pin wrapper is outside the boot gate`);
}
