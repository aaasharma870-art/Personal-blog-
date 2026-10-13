// scripts/checks/fonts.mjs: spec §3.4 check 8 — the world fonts (PHASE3-SPEC
// §5.2, §5.5; P3-4 #5): files + licences + glyphs.txt, glyph coverage,
// budgets, the ≥ 64rem-only rule, the lazy tokens, the name's preload, and
// (#5 extension) the world blocks' type roles. Owner: B1-TYPE (PHASE3-PLAN
// §4.7). The face registry is scripts/fetch-display-fonts.mjs (FACES).
// Loaded by scripts/check-manifest.mjs, which calls `run(ctx)`.
import fs from "node:fs";
import path from "node:path";
import {
  BUDGET,
  FACES,
  LEGACY,
  LETTERING_DESKTOP,
  budgetFailures,
  glyphsPathOf,
  measure,
} from "../fetch-display-fonts.mjs";

const DESKTOP_MEDIA = /^@media\s*\(\s*min-width:\s*64rem\s*\)$/;
const FILM_WORLDS = ["pirates", "idiots", "rdr2", "hp"];

/** Declarations of a stylesheet with the stack of block preludes around each
 *  (`[{ prop, value, stack: ["@media (min-width: 64rem)", "[data-world=…]"] }]`). */
function declarationsOf(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, " ");
  const out = [];
  const stack = [];
  let buf = "";
  let quote = null;
  let paren = 0;
  const flush = () => {
    const t = buf.trim();
    buf = "";
    if (!t) return;
    const i = t.indexOf(":");
    if (i > 0 && !t.startsWith("@")) out.push({ prop: t.slice(0, i).trim(), value: t.slice(i + 1).trim(), stack: [...stack] });
  };
  for (const c of src) {
    if (quote) {
      buf += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      buf += c;
    } else if (c === "(") {
      paren++;
      buf += c;
    } else if (c === ")") {
      paren--;
      buf += c;
    } else if (c === "{" && paren === 0) {
      // a nested rule inside a rule's declarations: the text since the last ";" is its prelude
      stack.push(buf.trim().replace(/\s+/g, " "));
      buf = "";
    } else if (c === "}" && paren === 0) {
      flush();
      stack.pop();
    } else if (c === ";" && paren === 0) {
      flush();
    } else buf += c;
  }
  return out;
}

const charsOf = (s) => new Set([...s]);
const missing = (text, glyphs) => [...new Set([...text].filter((c) => c !== "\n" && !glyphs.has(c)))];

export default function run({ ROOT, err, warn, film, quotes, css, readFile }) {
  const exists = (p) => fs.existsSync(path.join(ROOT, p));

  /* — files, licences, glyphs.txt ——————————————————————————————————— */
  const glyphsOf = new Map();
  const readGlyphs = (fontPath) => {
    const g = glyphsPathOf(path.join(ROOT, fontPath));
    if (!fs.existsSync(g)) return null;
    return charsOf(fs.readFileSync(g, "utf8").replace(/\n$/, ""));
  };
  for (const f of FACES) {
    if (!exists(f.path)) {
      err(`fonts: ${f.family} ${f.weight} file ${f.path} is missing (node scripts/fetch-display-fonts.mjs)`);
      continue;
    }
    const dir = path.dirname(path.join(ROOT, f.path));
    const licFile = f.license === "apache" ? "LICENSE.txt" : "OFL.txt";
    const lic = path.join(dir, licFile);
    if (!fs.existsSync(lic)) err(`fonts: ${f.path} has no ${licFile} beside it`);
    else {
      const text = fs.readFileSync(lic, "utf8");
      const ok = f.license === "apache" ? /Apache License/i.test(text) : /SIL OPEN FONT LICENSE Version 1\.1/i.test(text);
      if (!ok) err(`fonts: ${path.relative(ROOT, lic)} is not the ${f.license === "apache" ? "Apache 2.0" : "SIL OFL 1.1"} text`);
      if (f.rfn && !new RegExp(`Reserved Font Name\\s+["'“]?${f.rfn}`, "i").test(text)) warn(`fonts: ${f.family} is marked RFN "${f.rfn}" but its licence names no such Reserved Font Name`);
    }
    if (f.rfn && !["ascii+", "latin", "strings"].includes(f.cut)) err(`fonts: ${f.family} carries the RFN "${f.rfn}": ship only the unmodified Google-served file (cut ascii+ / latin / strings)`);
    const g = readGlyphs(f.path);
    if (!g) err(`fonts: ${f.path} has no glyphs.txt beside it`);
    else glyphsOf.set(f.slug, g);
  }
  // the legacy subsets: phones keep today's bytes exactly
  for (const l of LEGACY) {
    if (!exists(l.path)) {
      err(`fonts: legacy subset ${l.path} is missing (phones must keep today's fonts)`);
      continue;
    }
    const size = fs.statSync(path.join(ROOT, l.path)).size;
    if (size !== l.bytes) err(`fonts: legacy subset ${l.path} is ${size} B, not ${l.bytes} (phones must fetch exactly today's bytes)`);
  }

  /* — budgets (PHASE3-SPEC §5.5) ————————————————————————————————————— */
  const m = measure(ROOT);
  for (const fail of budgetFailures(m)) err(`fonts: budget: ${fail}`);
  // a hand-added woff2 under the film folders bypasses the registry
  const known = new Set([...FACES.map((f) => f.path), ...LEGACY.map((l) => l.path)].map((p) => path.normalize(p)));
  const walk = (d) =>
    fs.existsSync(d)
      ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
      : [];
  for (const abs of [...walk(path.join(ROOT, "assets", "fonts", "film")), ...walk(path.join(ROOT, "public", "fonts"))]) {
    if (!/\.(woff2?|ttf|otf)$/i.test(abs)) continue;
    const r = path.normalize(path.relative(ROOT, abs));
    if (!known.has(r)) err(`fonts: ${r} is not in scripts/fetch-display-fonts.mjs FACES / LEGACY (budgets would not see it)`);
  }

  /* — glyph coverage: every shipped mode-A lettering string + quote ———— */
  const legacyGlyphs = new Map(LEGACY.map((l) => [l.family, readGlyphs(l.path)]));
  for (const l of film.lettering) {
    if (l.mode !== "A" || !l.shipped) continue;
    let text = l.text;
    if (l.quote) {
      const q = quotes[l.quote];
      if (q) text += q.text + (q.excerptText ?? "");
    }
    const slug = LETTERING_DESKTOP[l.face];
    if (!slug) {
      err(`fonts: lettering "${l.id}" face "${l.face}" has no desktop face (LETTERING_DESKTOP)`);
      continue;
    }
    const g = glyphsOf.get(slug);
    if (g) {
      const miss = missing(text, g);
      if (miss.length) err(`fonts: lettering "${l.id}" (${l.face} → ${slug}) is missing glyph(s) ${JSON.stringify(miss.join(""))} at ≥ 64rem`);
    }
    if (l.slot === "display") continue; // the name is desktop-only lettering
    const lg = legacyGlyphs.get(l.face);
    if (lg) {
      const miss = missing(text, lg);
      if (miss.length) warn(`fonts: lettering "${l.id}" falls back per glyph below 64rem: the frozen ${l.face} subset lacks ${JSON.stringify(miss.join(""))}`);
    }
  }

  /* — CSS: new faces only ≥ 64rem, lazy, the name preloaded ——————————— */
  const sheets = [
    ["app/globals.css", css],
    ["app/p3/type.css", exists("app/p3/type.css") ? readFile("app/p3/type.css") : ""],
  ];
  const faceVars = FACES.filter((f) => f.role !== "display").map((f) => f.css);
  const decls = [];
  for (const [file, text] of sheets) for (const d of declarationsOf(text)) decls.push({ ...d, file });
  const inDesktop = (d) => d.stack.some((p) => DESKTOP_MEDIA.test(p));
  for (const d of decls) {
    const refs = faceVars.filter((v) => d.value.includes(`var(${v})`) || d.value.includes(`var(${v},`));
    const nameRef = d.value.includes("/fonts/film/") || d.value.includes("var(--font-name-pirates");
    if ((refs.length || nameRef) && !inDesktop(d)) {
      err(`fonts: ${d.file} references ${refs[0] ?? "the name face"} outside @media (min-width: 64rem) (phones must fetch no new font)`);
    }
    // lazy: a face goes live only on its token (or the first-visit prologue)
    const live = /^--font-world-(pirates|idiots|rdr2|hp)-(head|body|lead|hand)-live$/.exec(d.prop);
    if (live) {
      const sel = d.stack.filter((p) => !p.startsWith("@")).join(" ");
      const display = d.value.includes("var(--font-name-pirates)");
      const token = sel.includes(`data-fonts~="${live[1]}"`) || sel.includes(`data-fonts~='${live[1]}'`);
      const prologue = live[1] === "hp" && live[2] === "head" && /intro-armed/.test(sel);
      if (!inDesktop(d)) err(`fonts: ${d.file} sets ${d.prop} outside @media (min-width: 64rem)`);
      if (!display && !token && !prologue) err(`fonts: ${d.file} sets ${d.prop} under "${sel}" — only html[data-fonts~="${live[1]}"] may (lazy per world; before the first scroll only the name's face and the house faces load)`);
    }
  }
  // the name's @font-face: ≥ 64rem, swap, the public file
  const nameFace = FACES.find((f) => f.role === "display");
  const href = "/" + nameFace.path.replace(/^public\//, "");
  const faceDecl = decls.find((d) => d.prop === "src" && d.value.includes(href));
  if (!faceDecl) err(`fonts: app/globals.css declares no @font-face for ${href}`);
  else {
    if (!inDesktop(faceDecl)) err(`fonts: the name's @font-face is not under @media (min-width: 64rem)`);
    const disp = decls.find((d) => d.prop === "font-display" && d.stack.join("|") === faceDecl.stack.join("|"));
    if (disp?.value !== "swap") err(`fonts: the name's @font-face needs font-display: swap`);
  }
  // the preload: desktop media, font, crossorigin anonymous (app/layout.tsx)
  const layout = readFile("app/layout.tsx");
  const fontsTs = readFile("lib/fonts.ts");
  if (!fontsTs.includes(`"${href}"`)) err(`fonts: lib/fonts.ts NAME_FONT_HREF is not "${href}"`);
  const pre = /preload\(\s*NAME_FONT_HREF\s*,\s*\{([\s\S]*?)\}\s*\)/.exec(layout)?.[1] ?? "";
  if (!pre) err(`fonts: app/layout.tsx does not preload NAME_FONT_HREF`);
  else {
    for (const [k, v] of [["as", "font"], ["type", "font/woff2"], ["crossOrigin", "anonymous"], ["media", "(min-width: 64rem)"]]) {
      if (!new RegExp(`${k}:\\s*"${v.replace(/[()/]/g, "\\$&")}"`).test(pre)) err(`fonts: the name preload in app/layout.tsx needs ${k}: "${v}"`);
    }
  }
  if (m.preload > BUDGET.preload) err(`fonts: the preloaded name face is over ${BUDGET.preload} B`);
  // next/font: every face preload false (nothing on the LCP path)
  for (const call of fontsTs.match(/localFont\(\{[\s\S]*?\}\)/g) ?? []) {
    if (!/preload:\s*false/.test(call)) err(`fonts: lib/fonts.ts has a localFont() without preload: false`);
  }
  for (const f of FACES.filter((x) => x.role !== "display")) {
    const rel = "../" + f.path;
    if (!fontsTs.includes(`"${rel}"`)) err(`fonts: lib/fonts.ts does not load ${f.path} (${f.family})`);
    if (!fontsTs.includes(`variable: "${f.css}"`)) err(`fonts: lib/fonts.ts has no variable "${f.css}" (${f.family})`);
  }

  /* — #5 extension: each world block sets its type roles (≥ 64rem) ———— */
  if (film.fontScope.worlds) {
    for (const w of FILM_WORLDS) {
      const set = new Set(
        decls
          .filter((d) => d.file === "app/globals.css" && inDesktop(d) && d.stack.some((p) => p.includes(`[data-world="${w}"]`)))
          .map((d) => d.prop),
      );
      const need = ["--world-font-head", "--world-font-body", "--world-head-scale", ...(w === "idiots" ? ["--world-font-lead"] : [])];
      for (const p of need) if (!set.has(p)) err(`#5 [data-world="${w}"] does not set ${p} at ≥ 64rem (PHASE3-SPEC §5.5)`);
    }
    // the research guard resets the roles inside data islands
    const guard = decls.filter((d) => d.file === "app/p3/type.css" && d.stack.some((p) => p.includes("[data-research]")));
    for (const p of ["--world-font-head", "--world-font-body", "--world-font-lead"]) {
      if (!guard.some((d) => d.prop === p)) err(`fonts: app/p3/type.css: [data-research] does not reset ${p}`);
    }
  }
}

