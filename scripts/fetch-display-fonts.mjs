// scripts/fetch-display-fonts.mjs: the film faces (PHASE3-SPEC §5.2, §5.5;
// owner B1-TYPE). One table, FACES, is the registry the validator
// (scripts/checks/fonts.mjs) and FONTS.md read; lib/fonts.ts loads the files.
//
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/fetch-display-fonts.mjs [--check]
//
// For every FACES entry it fetches the woff2 from the Google Fonts CSS2 API
// (Google generates and serves the file from the family's canonical OFL
// sources, under the family's own name) and the licence from
// github.com/google/fonts (`ofl/<dir>/OFL.txt` or `apache/<dir>/LICENSE.txt`),
// writes `glyphs.txt` (the file's real cmap) beside each file, enforces the
// budgets and prints the FONTS.md table. `--check` fetches nothing: it
// re-reads the files on disk, rewrites glyphs.txt and prints the table.
//
// cut:
//   "ascii+"  `text=` with the 95 printable ASCII + ‘’“”–—…•·× (ASCII_PLUS):
//             any English heading, so heading copy can change without a re-run
//   "latin"   the CSS2 response's `/* latin */` unicode-range file
//   "strings" `text=` with `text` plus every shipped lettering string set in
//             this family (lib/film.ts `lettering`, quotes from lib/quotes.ts)
// RFN faces (Pirata One "Pirata", Rye "Rye") ship ONLY these unmodified
// Google-served files, never our own subset (OFL §3; FONTS.md RFN note).
//
// LEGACY (phones, < 64rem): the four M2 subsets in assets/fonts/film/<face>/
// stay byte-for-byte (54,336 B, PHASE3-SPEC §5.5). This script never
// refetches them; it only writes their glyphs.txt and checks their bytes.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { film } from "../lib/film.ts";
import { quotes } from "../lib/quotes.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

/** The deterministic heading set: printable ASCII + the typographer's marks. */
export const ASCII_PLUS =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") + "‘’“”–—…•·×";

/** Base set of the journal hand (≤ 4 words per page; dates). */
const HAND_BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;’'–-";

/**
 * The desktop film faces (≥ 64rem only). `css` is the next/font variable
 * (lib/fonts.ts) or, for the display face, the CSS var app/globals.css sets.
 * `designer` feeds the credits TYPE row (FONTS.md §4).
 */
export const FACES = [
  { family: "Pirata One", weight: 400, dir: "pirataone", slug: "pirata-one", world: "pirates", role: "display", cut: "ascii+", license: "ofl", rfn: "Pirata", path: "public/fonts/film/pirata-one/pirata-one-ascii.woff2", css: "--font-name-pirates", designer: "Rodrigo Fuenzalida & Nicolás Massi", note: "the hero h1 (preloaded ≥ 64rem) and the Pirates head" },
  { family: "Cormorant Garamond", weight: 500, dir: "cormorantgaramond", slug: "cormorant-garamond-500", world: "pirates", role: "body", cut: "latin", license: "ofl", path: "assets/fonts/film/cormorant-garamond-500/cormorant-garamond-500-latin.woff2", css: "--font-world-pirates-body", designer: "Christian Thalmann", note: "Pirates body, 20 px / 1.55, ink only" },
  { family: "Kalam", weight: 700, dir: "kalam", slug: "kalam-700", world: "idiots", role: "head", cut: "ascii+", license: "ofl", path: "assets/fonts/film/kalam-700/kalam-700-ascii.woff2", css: "--font-world-idiots-head", designer: "Indian Type Foundry", note: "3 Idiots head (replaces the 400 subset at ≥ 64rem)" },
  { family: "Patrick Hand", weight: 400, dir: "patrickhand", slug: "patrick-hand", world: "idiots", role: "body", cut: "latin", license: "ofl", path: "assets/fonts/film/patrick-hand/patrick-hand-latin.woff2", css: "--font-world-idiots-lead", designer: "Patrick Wagesreiter", note: "3 Idiots lead only (type-lead intros, board notes), 22 px / 1.45" },
  { family: "Rye", weight: 400, dir: "rye", slug: "rye-ascii", world: "rdr2", role: "head", cut: "ascii+", license: "ofl", rfn: "Rye", path: "assets/fonts/film/rye-ascii/rye-ascii.woff2", css: "--font-world-rdr2-head", designer: "Nicole Fally (Sorkin Type)", note: "RDR2 head, scale .8, heads ≤ 6 words" },
  { family: "Courier Prime", weight: 400, dir: "courierprime", slug: "courier-prime", world: "rdr2", role: "body", cut: "latin", license: "ofl", path: "assets/fonts/film/courier-prime/courier-prime-latin.woff2", css: "--font-world-rdr2-body", designer: "Alan Dague-Greene", note: "RDR2 body, 17 px / 1.65" },
  { family: "Nothing You Could Do", weight: 400, dir: "nothingyoucoulddo", slug: "nothing-you-could-do", world: "rdr2", role: "hand", cut: "strings", text: HAND_BASE, license: "ofl", path: "assets/fonts/film/nothing-you-could-do/nothing-you-could-do-strings.woff2", css: "--font-world-rdr2-hand", designer: "Kimberly Geswein", note: "RDR2 journal heads / dates, ≤ 4 words per page" },
  { family: "IM Fell English SC", weight: 400, dir: "imfellenglishsc", slug: "im-fell-english-sc", world: "hp", role: "head", cut: "ascii+", license: "ofl", path: "assets/fonts/film/im-fell-english-sc/im-fell-english-sc-ascii.woff2", css: "--font-world-hp-head", designer: "Igino Marini", note: "HP head (replaces the IM Fell English roman subset at ≥ 64rem)" },
  { family: "Crimson Pro", weight: 400, dir: "crimsonpro", slug: "crimson-pro", world: "hp", role: "body", cut: "latin", license: "ofl", path: "assets/fonts/film/crimson-pro/crimson-pro-latin.woff2", css: "--font-world-hp-body", designer: "Jacques Le Bailly", note: "HP body, 19 px / 1.6 (no italic shipped)" },
];

/** The M2 subsets phones keep (< 64rem), frozen byte-for-byte. */
export const LEGACY = [
  { family: "Pirata One", world: "pirates", path: "assets/fonts/film/pirata-one/pirata-one-subset.woff2", bytes: 3036 },
  { family: "Kalam", world: "idiots", path: "assets/fonts/film/kalam/kalam-subset.woff2", bytes: 7932 },
  { family: "Rye", world: "rdr2", path: "assets/fonts/film/rye/rye-subset.woff2", bytes: 13516 },
  { family: "IM Fell English", world: "hp", path: "assets/fonts/film/im-fell-english/im-fell-english-subset.woff2", bytes: 29852 },
];

/** A lettering `face` (lib/film.ts) → the desktop file that sets it ≥ 64rem. */
export const LETTERING_DESKTOP = {
  "Pirata One": "pirata-one",
  Kalam: "kalam-700",
  Rye: "rye-ascii",
  "IM Fell English": "im-fell-english-sc",
};

/** PHASE3-SPEC §5.5 budgets (bytes). */
export const BUDGET = {
  preload: 6 * 1024,
  perWorld: 64 * 1024,
  desktop: 192 * 1024,
  legacy: 54336,
};

/** Every shipped mode-A lettering string set in `family` (quotes included). */
export function letteringText(family) {
  let s = "";
  for (const l of film.lettering) {
    if (l.mode !== "A" || !l.shipped || l.face !== family) continue;
    s += l.text;
    if (l.quote) {
      const q = quotes[l.quote];
      if (q) s += q.text + (q.excerptText ?? "");
    }
  }
  return s;
}

/** The glyphs.txt path beside a font file. */
export const glyphsPathOf = (fontPath) => path.join(path.dirname(fontPath), "glyphs.txt");

/** The code points a woff2 maps (fontkit, bundled with next/font), or null. */
export function cmapOf(buf) {
  try {
    const req = createRequire(import.meta.url);
    const mod = req(path.join(ROOT, "node_modules/next/dist/compiled/@next/font/dist/fontkit/index.js")).default;
    const create = mod.default || mod;
    const font = create(buf);
    return [...new Set(font.characterSet)].filter((c) => c >= 0x20 && c !== 0x7f && c < 0xfffe).sort((a, b) => a - b);
  } catch {
    return null;
  }
}

const fam = (f) => encodeURIComponent(f).replace(/%20/g, "+");
const axisOf = (f) => (f.weight === 400 ? "" : `:wght@${f.weight}`);

async function get(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r;
}

async function fetchFace(f) {
  let cssUrl = `https://fonts.googleapis.com/css2?family=${fam(f.family)}${axisOf(f)}&display=swap`;
  if (f.cut === "ascii+" || f.cut === "strings") {
    const set = [...new Set(f.cut === "ascii+" ? ASCII_PLUS : (f.text ?? "") + letteringText(f.family))].sort().join("");
    cssUrl += `&text=${encodeURIComponent(set)}`;
  }
  const css = await (await get(cssUrl)).text();
  let block = css;
  if (f.cut === "latin") {
    const blocks = css.split("/*").slice(1).map((b) => ({ name: b.split("*/")[0].trim(), body: b }));
    const latin = blocks.find((b) => b.name === "latin");
    if (!latin) throw new Error(`${f.family}: no /* latin */ block in the CSS2 response`);
    block = latin.body;
  }
  const url = block.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/)?.[1];
  if (!url) throw new Error(`${f.family}: no woff2 in the CSS2 response:\n${css.slice(0, 400)}`);
  return Buffer.from(await (await get(url)).arrayBuffer());
}

async function fetchLicence(f) {
  const kind = f.license === "apache" ? "apache" : "ofl";
  const file = kind === "apache" ? "LICENSE.txt" : "OFL.txt";
  const r = await get(`https://raw.githubusercontent.com/google/fonts/main/${kind}/${f.dir}/${file}`);
  return { file, text: await r.text() };
}

function writeGlyphs(abs, buf, fallbackText) {
  const cps = cmapOf(buf) ?? [...new Set(fallbackText ?? "")].map((c) => c.codePointAt(0)).sort((a, b) => a - b);
  fs.writeFileSync(glyphsPathOf(abs), String.fromCodePoint(...cps) + "\n");
  return cps.length;
}

/** Bytes per world and in total, from the files on disk. */
export function measure(root = ROOT) {
  const size = (p) => (fs.existsSync(path.join(root, p)) ? fs.statSync(path.join(root, p)).size : 0);
  const rows = FACES.map((f) => ({ ...f, bytes: size(f.path) }));
  const perWorld = {};
  for (const r of rows) perWorld[r.world] = (perWorld[r.world] ?? 0) + r.bytes;
  const desktop = rows.reduce((a, r) => a + r.bytes, 0);
  const preload = rows.filter((r) => r.role === "display").reduce((a, r) => a + r.bytes, 0);
  const legacy = LEGACY.reduce((a, l) => a + size(l.path), 0);
  return { rows, perWorld, desktop, preload, legacy };
}

/** Budget failures (strings), [] when every §5.5 budget holds. */
export function budgetFailures(m) {
  const out = [];
  if (m.preload > BUDGET.preload) out.push(`preloaded world bytes ${m.preload} > ${BUDGET.preload}`);
  for (const [w, b] of Object.entries(m.perWorld)) if (b > BUDGET.perWorld) out.push(`world ${w}: ${b} B > ${BUDGET.perWorld}`);
  if (m.desktop > BUDGET.desktop) out.push(`all desktop film faces ${m.desktop} B > ${BUDGET.desktop}`);
  if (m.legacy !== BUDGET.legacy) out.push(`below 64rem: the legacy subsets are ${m.legacy} B, not today's ${BUDGET.legacy}`);
  return out;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  for (const f of FACES) {
    const abs = path.join(ROOT, f.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    let buf;
    if (checkOnly) {
      if (!fs.existsSync(abs)) throw new Error(`${f.path} is missing (run without --check)`);
      buf = fs.readFileSync(abs);
    } else {
      buf = await fetchFace(f);
      fs.writeFileSync(abs, buf);
      const lic = await fetchLicence(f);
      fs.writeFileSync(path.join(path.dirname(abs), lic.file), lic.text);
    }
    const n = writeGlyphs(abs, buf, f.cut === "ascii+" ? ASCII_PLUS : (f.text ?? "") + letteringText(f.family));
    console.log(`${f.family.padEnd(22)} ${String(buf.length).padStart(6)} B  ${f.cut.padEnd(7)} ${String(n).padStart(3)} glyphs  ${f.path}`);
  }
  for (const l of LEGACY) {
    const abs = path.join(ROOT, l.path);
    const buf = fs.readFileSync(abs);
    writeGlyphs(abs, buf, letteringText(l.family));
    if (buf.length !== l.bytes) console.error(`legacy ${l.path}: ${buf.length} B, expected ${l.bytes} (phones must keep today's bytes)`);
  }

  const m = measure();
  console.log("\nFONTS.md table:\n");
  console.log("| World | Role | Face | Cut | Licence | woff2 | File |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of m.rows) {
    const lic = `${r.license === "apache" ? "Apache 2.0" : "SIL OFL 1.1"}${r.rfn ? ` (RFN "${r.rfn}")` : ""}`;
    console.log(`| ${r.world} | ${r.role} | ${r.family} ${r.weight} | ${r.cut} | ${lic} | ${r.bytes.toLocaleString("en-US")} B | \`${r.path}\` |`);
  }
  console.log(`\nper world: ${Object.entries(m.perWorld).map(([w, b]) => `${w} ${b.toLocaleString("en-US")} B`).join(" · ")}`);
  console.log(`preloaded ${m.preload} B (≤ ${BUDGET.preload}) · desktop ${m.desktop} B (≤ ${BUDGET.desktop}) · phones (legacy) ${m.legacy} B (= ${BUDGET.legacy})`);
  const fails = budgetFailures(m);
  if (fails.length) {
    console.error(`fetch-display-fonts: over budget:\n  ${fails.join("\n  ")}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
