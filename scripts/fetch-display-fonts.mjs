// Fetches the world DISPLAY faces (SPEC v2 §9.7, DESIGN v3 §2.1.1) as woff2
// subsets containing ONLY the glyphs of their `lib/film.ts` lettering strings,
// plus each family's OFL.txt beside it (SPEC §12.5 #8: no font without its
// licence). Mode-A (OFL) faces only; mode B (outline-only, personal/desktop
// licences) never enters git and is not handled here.
//
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/fetch-display-fonts.mjs
//
// Re-run after adding or changing a `lettering` entry, then commit
// assets/fonts/film/** and update research/build/FONTS.md. Budget: all
// display woff2 ≤ 56 KB total (RECOGNIZABILITY O-2; was 24 KB, SPEC §14,
// before the captions scope) — the script fails above it.
// Lettered QUOTES (`lettering[].quote`) take their glyphs from lib/quotes.ts
// (text + excerptText), so the line never appears outside the registry.
//
// Source: the Google Fonts CSS2 API with `text=` (Google serves the subset
// from the family's canonical OFL files, under the family's own name), and
// the licence from github.com/google/fonts (ofl/<dir>/OFL.txt).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { film } from "../lib/film.ts";
import { quotes } from "../lib/quotes.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets", "fonts", "film");
const BUDGET = 56 * 1024;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

/** face → Google Fonts family, weight, repo dir, output slug. */
const FACES = {
  "Pirata One": { family: "Pirata One", weight: 400, dir: "pirataone", slug: "pirata-one" },
  Kalam: { family: "Kalam", weight: 400, dir: "kalam", slug: "kalam" },
  "IM Fell English": { family: "IM Fell English", weight: 400, dir: "imfellenglish", slug: "im-fell-english" },
  Rye: { family: "Rye", weight: 400, dir: "rye", slug: "rye" },
};

const byFace = new Map();
for (const l of film.lettering) {
  if (l.mode !== "A" || !l.shipped) continue;
  if (!FACES[l.face]) throw new Error(`lettering "${l.id}": no FACES entry for "${l.face}"`);
  const set = byFace.get(l.face) ?? new Set();
  for (const ch of l.text) set.add(ch);
  if (l.quote) {
    const q = quotes[l.quote];
    if (!q) throw new Error(`lettering "${l.id}": unknown quote "${l.quote}"`);
    for (const ch of q.text + (q.excerptText ?? "")) set.add(ch);
  }
  byFace.set(l.face, set);
}

let total = 0;
const report = [];
for (const [face, chars] of byFace) {
  const f = FACES[face];
  const text = [...chars].sort().join("");
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.family).replace(/%20/g, "+")}` +
    `:wght@${f.weight}&text=${encodeURIComponent(text)}&display=optional`;
  const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
  const url = css.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/)?.[1];
  if (!url) throw new Error(`${face}: no woff2 in the CSS2 response:\n${css.slice(0, 400)}`);
  const buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());
  const dir = path.join(OUT, f.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${f.slug}-subset.woff2`), buf);
  const lic = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${f.dir}/OFL.txt`);
  if (!lic.ok) throw new Error(`${face}: OFL.txt not found (${lic.status})`);
  fs.writeFileSync(path.join(dir, "OFL.txt"), await lic.text());
  total += buf.length;
  report.push(`${face.padEnd(16)} ${String(buf.length).padStart(6)} B  glyphs "${text}"`);
}
console.log(report.join("\n"));
console.log(`total ${total} B (budget ${BUDGET} B)`);
if (total > BUDGET) {
  console.error("fetch-display-fonts: over the display-font budget");
  process.exit(1);
}
