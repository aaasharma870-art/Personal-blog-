// scripts/checks/unsigned.mjs: PHASE3-SPEC §3.4 check 10, unsigned copy (a release gate:
// a warning in `npm run check`, an error under RELEASE=1; PHASE3-PLAN DP-9). Owner: B1-BEATS.
//
// Every `Copy` with `unsigned: true` is a Phase-3 string Aryan has not signed (page
// microcopy Claude drafted, and the loglines' new rendering as subtitles). Both modes print
// the full list: key, text, and where it renders. The gate fails closed: a string counts
// whether or not a component wires it yet (a key that is built from parts, like
// `egg.hunt.name.${id}`, cannot be found by a text search), and it never ships unsigned
// either way. Aryan signs by removing `unsigned` (never by flipping film.copySignedOff).
import fs from "node:fs";
import path from "node:path";

export default function run({ ROOT, gate, film, uiFiles }) {
  /** Every unsigned string: [key, text, how to find its renderers]. */
  const list = [];
  // `find` names the renderer: the quoted key, or (for fields reached through the derived
  // act cards / worlds) the field name inside components/** and app/** only
  const visit = (key, c, find, uiOnly = false) => {
    if (c && typeof c === "object" && c.unsigned === true && c.text) list.push({ key, text: c.text, find, uiOnly });
  };
  const quoted = (k) => new RegExp(`["'\`]${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`);
  for (const [k, c] of Object.entries(film.copy ?? {})) visit(`copy.${k}`, c, quoted(k));
  for (const a of film.acts ?? []) {
    for (const f of ["title", "logline"]) visit(`acts.${a.id}.${f}`, a[f], new RegExp(`\\b${f}\\b`), true);
    if (a.epigraph && typeof a.epigraph === "object") visit(`acts.${a.id}.epigraph`, a.epigraph, /\bepigraph\b/, true);
  }
  for (const [w, s] of Object.entries(film.worlds ?? {})) {
    for (const f of ["borrowed", "reason"]) visit(`worlds.${w}.${f}`, s[f], new RegExp(`\\b${f}\\b`), true);
  }
  (film.tips ?? []).forEach((t, i) => visit(`tip #${i + 1}`, t, /\btip\b/, true));
  for (const [k, c] of Object.entries(film.captions ?? {})) visit(k, c?.moment, quoted(k));
  if (!list.length) return;

  // where each renders: the component / app files (and lib wiring, e.g. lib/hunt.ts) that name it
  const sources = uiFiles
    .map((f) => path.relative(ROOT, f))
    .filter((rel) => /^(components|app|lib)[\\/]/.test(rel) && /\.(tsx?|jsx?)$/.test(rel) && !/^lib[\\/]film\.ts$/.test(rel))
    .map((rel) => ({ rel, src: uncommented(fs.readFileSync(path.join(ROOT, rel), "utf8")) }));
  let wired = 0;
  const lines = list.map(({ key, text, find, uiOnly }) => {
    const at = sources.filter((s) => !(uiOnly && /^lib[\\/]/.test(s.rel)) && find.test(s.src)).map((s) => s.rel);
    if (at.length) wired++;
    return `      ${key} · "${text}" · ${at.length ? at.join(", ") : "not wired yet"}`;
  });
  gate(
    `[P3 #10] unsigned copy: ${list.length} string(s) await Aryan's signature (${wired} wired into the page, ` +
      `${list.length - wired} not yet); sign each by removing \`unsigned\` in lib/film.ts:\n${lines.join("\n")}`,
  );
}

/** Source without its comments (a key named in a comment is not a renderer). */
function uncommented(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
}
