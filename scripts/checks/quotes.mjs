// scripts/checks/quotes.mjs: a RENDERED community-sourced quote is a release gate (P3-11 r3, J9 F3;
// docs/build/CONTENT-RULES.md: never present an unverified line as fact). Owner: F1 (P3-11 r3).
//
// lib/quotes.ts marks each line VERIFIED (checked in the work) or COMMUNITY (a fan transcript, not yet
// checked). scripts/check-manifest.mjs warns about every COMMUNITY entry; this module asks whether one
// actually REACHES the page: its id named (in quotes) in uncommented UI or data code (components/**,
// app/**, lib/** but lib/quotes.ts: `<FilmQuote id="Q-…">`, `quotes["Q-…"]`, `quote: "Q-…"`, a world's
// `line: "Q-…"`) and not behind a verification guard (`isVerified(…)` / `"VERIFIED"` within 8 lines of
// it, the parley toast's pattern). Such a quote is a warning in `npm run check` and an ERROR
// under RELEASE=1: verify it in the work (verified: "VERIFIED") or stop rendering it. Aryan decides.
import fs from "node:fs";
import path from "node:path";

const GUARD = /isVerified\(|["']VERIFIED["']/;
const NEAR = 8;

export default function run({ ROOT, gate, quotes, uiFiles }) {
  const community = Object.entries(quotes ?? {}).filter(([, q]) => q?.verified === "COMMUNITY");
  if (!community.length) return;
  const sources = uiFiles
    .map((f) => path.relative(ROOT, f))
    .filter((rel) => /^(components|app|lib)[\\/]/.test(rel) && /\.(tsx?|jsx?)$/.test(rel) && !/^lib[\\/]quotes\.ts$/.test(rel))
    .map((rel) => ({ rel, lines: uncommented(fs.readFileSync(path.join(ROOT, rel), "utf8")).split("\n") }));
  const rows = [];
  for (const [id, q] of community) {
    const at = new Set();
    const needle = new RegExp(`["'\`]${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`);
    for (const { rel, lines } of sources) {
      lines.forEach((line, i) => {
        if (!needle.test(line)) return;
        const near = lines.slice(Math.max(0, i - NEAR), i + NEAR + 1).join("\n");
        if (!GUARD.test(near)) at.add(`${rel}:${i + 1}`);
      });
    }
    if (at.size) rows.push(`      ${id} · "${q.text}" — ${q.speaker ?? q.work} · ${[...at].join(", ")}`);
  }
  if (!rows.length) return;
  gate(
    `[J9 F3] ${rows.length} COMMUNITY-sourced quote(s) render on the page unverified; verify each in the work ` +
      `(lib/quotes.ts verified: "VERIFIED") or stop rendering it (Aryan's call):\n${rows.join("\n")}`,
  );
}

/** Source without its comments (an id named in a comment is not a renderer); line breaks kept. */
function uncommented(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:\\])\/\/.*$/gm, "$1");
}
