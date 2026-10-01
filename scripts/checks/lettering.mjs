// scripts/checks/lettering.mjs: validator #10 (lettering scope + where a
// world face may appear). Owner: B1-TYPE (PHASE3-PLAN §4.7; W1.0 moved the
// M2 block here from scripts/check-manifest.mjs, DP-11).
// Loaded by scripts/check-manifest.mjs: `export default function run(ctx)`.
//
// Phase 3 (PHASE3-SPEC §5.5 "Validator changes", P3-4):
//   (a) slots: act-title, loader, egg, caption (fontScope.extended), display
//       (fontScope.name: exactly one entry — the name — text === site.name,
//       face = the hero world's face, mode A, shipped, rendered only by
//       hero-section.tsx); the head / body / lead / hand ROLES are CSS
//       (app/globals.css "world type") and are in scope only while
//       fontScope.worlds is on.
//   (b) files: CLASS ALLOW + DATA DENY.
//       - allow the role classes `font-world-head|body|lead|hand` in any
//         components/** file (while fontScope.worlds);
//       - keep the list below for the raw faces (`--font-world-*`,
//         `world-face-*`, `font-world-act`, `fontWorld*`, `worldFaceClass(`);
//       - DENY any world face in components/visuals/**, metric-tile.tsx and
//         the experiment section, on any className that also has tnum /
//         tabular-nums / type-meta / font-mono, and on table / td / th /
//         figcaption;
//       - the h1 carries `type-name`, never `uppercase`, and is the only h1.
import fs from "node:fs";
import path from "node:path";

/** Raw world faces: CSS vars, the caption classes, act lettering, the
 *  next/font exports and the class helper. */
const RAW = /--font-world-|--font-egg-|world-face-|font-world-act|fontWorld[A-Z]\w*|fontEggRye|worldFaceClass\(/;
/** The world role classes (Phase 3). */
const ROLE = /\bfont-world-(?:head|body|lead|hand)\b/;
/** Either. */
const ANY = new RegExp(`${RAW.source}|${ROLE.source}`);
/** Data markers a world face may never sit beside (same className). */
const DATA_CLASS = /\b(?:tnum|tabular-nums|type-meta|font-mono)\b/;

/** Who may reference a RAW face. Everyone else letters through
 *  scene-caption.tsx (<SceneCaption>, <Lettered>, <FilmTitle>) or
 *  <FilmQuote rendition="lettered">, which set a face only on REGISTERED
 *  strings (lib/sections.ts letteredIn), or uses a role class. */
const ALLOW = [
  /^components[\\/]primitives[\\/](scene-caption\.tsx|world-face\.ts)$/,
  /^components[\\/]site[\\/]film-quote\.tsx$/, // <FilmQuote rendition="lettered"> (registered quotes)
  /^app[\\/]globals\.css$/,
  /^app[\\/]layout\.tsx$/,
  /^lib[\\/]fonts\.ts$/,
  // Phase 3: the world-fonts registration (B1-TYPE, PHASE3-PLAN §5.6)
  /^lib[\\/]world-fonts\.ts$/,
  /^components[\\/]providers[\\/]world-fonts\.tsx$/,
  /^app[\\/]p3[\\/]type\.css$/,
  /^components[\\/]primitives[\\/](act-card|loader)\.tsx$/,
  /^components[\\/]primitives[\\/]loaders[\\/]/,
  /^components[\\/]sections[\\/]act-card[\\/]/,
  /^components[\\/]eggs[\\/]/,
  /^components[\\/]site[\\/]journey[^\\/]*\.tsx$/, // the THE CROSSING cartouche
  /^app[\\/](not-found|lab)/,
  // Phase 3 (PHASE3-SPEC §5.5): the world kit, the hero, the words
  // primitives, the chapter select
  /^components[\\/]site[\\/]world-kit\.tsx$/,
  /^components[\\/]sections[\\/]hero[\\/]hero-section\.tsx$/,
  /^components[\\/]words[\\/]/,
  /^components[\\/]site[\\/]chapter-select\.tsx$/,
];

/** DENY: research UI never takes a world face (PHASE3-SPEC §5.1 "data"). */
const DENY_FILES = [
  /^components[\\/]visuals[\\/]/,
  /^components[\\/]site[\\/]metric-tile\.tsx$/,
  /^components[\\/]sections[\\/]experiment[\\/]/,
];

/** Every className value in a TSX source: "…", '…', `…` and the string
 *  literals inside {cn(…)} / {`…`} expressions (approximate, line-safe). */
function classNamesOf(src) {
  const out = [];
  const re = /className=(?:"([^"]*)"|'([^']*)'|\{)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1] !== undefined || m[2] !== undefined) {
      out.push({ at: m.index, text: m[1] ?? m[2] });
      continue;
    }
    // a {…} expression: take its balanced braces
    let depth = 1;
    let i = re.lastIndex;
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      i++;
    }
    out.push({ at: m.index, text: src.slice(re.lastIndex, i - 1) });
    re.lastIndex = i;
  }
  return out;
}

/** Opening tags `<tag …>` (attribute text up to the first unbraced `>`). */
function openingTags(src, tags) {
  const out = [];
  const re = new RegExp(`<(${tags.join("|")})\\b`, "g");
  let m;
  while ((m = re.exec(src))) {
    let depth = 0;
    let i = re.lastIndex;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    out.push({ tag: m[1], at: m.index, attrs: src.slice(re.lastIndex, i) });
  }
  return out;
}

const lineOf = (src, at) => src.slice(0, at).split("\n").length;

export default function run({ ROOT, film, quotes, err, warn, page, content, derive, uiFiles }) {
  /* — (a) the lettering registry ———————————————————————————————————— */
  const SLOTS = ["act-title", "loader", "egg", ...(film.fontScope.extended ? ["caption"] : []), ...(film.fontScope.name ? ["display"] : [])];
  const QUOTE_IDS = new Set(Object.keys(quotes));
  for (const l of film.lettering) {
    if (!SLOTS.includes(l.slot)) err(`#10 lettering "${l.id}" slot "${l.slot}" is outside the display-font scope`);
    if (l.quote !== undefined && !QUOTE_IDS.has(l.quote)) err(`#10 lettering "${l.id}": unknown quote "${l.quote}"`);
    if (l.quote === undefined && !l.text) err(`#10 lettering "${l.id}" has no text`);
    if (l.mode === "B" && l.shipped && !fs.existsSync(path.join(ROOT, "lib", "lettering.generated.ts"))) err(`#10 lettering "${l.id}" is mode B + shipped but lib/lettering.generated.ts is missing`);
  }

  // the display slot: the name, once, in the hero world's face
  const display = film.lettering.filter((l) => l.slot === "display");
  if (film.fontScope.name) {
    if (display.length !== 1) err(`#10 the "display" slot needs exactly one lettering entry (the name); found ${display.length}`);
    for (const d of display) {
      if (d.text !== content.site.name) err(`#10 display lettering "${d.id}": text "${d.text}" !== site.name "${content.site.name}"`);
      if (d.mode !== "A" || !d.shipped) err(`#10 display lettering "${d.id}" must be mode "A" and shipped`);
      const enabled = page.filter((s) => s.enabled !== false);
      const hero = enabled.find((s) => s.type === "hero");
      const heroWorld = hero ? derive.worldOfIn(hero, enabled, film) : "house";
      const want = film.worldFaces?.[heroWorld];
      if (!want) err(`#10 display lettering "${d.id}": the hero world "${heroWorld}" has no world face`);
      else if (d.face !== want) err(`#10 display lettering "${d.id}": face "${d.face}" is not the hero world's face "${want}" (${heroWorld})`);
    }
  } else if (display.length) {
    err(`#10 ${display.length} "display" lettering entr(y/ies) while film.fontScope.name is off`);
  }

  /* — (b) files: class allow + data deny —————————————————————————————— */
  const rel = (f) => path.relative(ROOT, f);
  const tsx = uiFiles.filter((f) => /\.(tsx?|jsx?|mjs)$/.test(f));
  const sources = new Map(uiFiles.map((f) => [rel(f), fs.readFileSync(f, "utf8")]));

  for (const [r, src] of sources) {
    const isComponent = /^components[\\/]/.test(r);
    const raw = RAW.test(src);
    const role = ROLE.test(src);
    if (!raw && !role) continue;
    // DENY: research files never reference a world face
    if (DENY_FILES.some((re) => re.test(r))) {
      err(`#10 ${r} is research UI and references a world face (data stays Geist / Geist Mono)`);
      continue;
    }
    if (raw && !ALLOW.some((re) => re.test(r))) {
      err(`#10 ${r} uses a world display face outside the allowed slots (act titles, loader route cards, eggs, captions; use <SceneCaption>/<Lettered>/<FilmTitle>/<FilmQuote> or a font-world-head|body|lead class)`);
    }
    if (role && !raw && !isComponent && !ALLOW.some((re) => re.test(r))) {
      err(`#10 ${r} uses a world role class outside components/**`);
    }
    if (role && !film.fontScope.worlds) err(`#10 ${r} uses a world role class (font-world-head|body|lead|hand) while film.fontScope.worlds is off`);
  }

  // DENY on the element: a world face next to a data class, or on table / td / th / figcaption
  for (const f of tsx) {
    const r = rel(f);
    const src = sources.get(r);
    if (!ANY.test(src)) continue;
    for (const c of classNamesOf(src)) {
      if (ANY.test(c.text) && DATA_CLASS.test(c.text)) {
        err(`#10 ${r}:${lineOf(src, c.at)} a world face shares a className with ${c.text.match(DATA_CLASS)[0]} (data stays Geist / Geist Mono)`);
      }
    }
    for (const t of openingTags(src, ["table", "td", "th", "figcaption"])) {
      if (ANY.test(t.attrs)) err(`#10 ${r}:${lineOf(src, t.at)} a world face on <${t.tag}> (tables and figure labels are data)`);
    }
  }

  /* — (c) the h1: the name step, mixed case, the only one ———————————— */
  const heroRel = path.join("components", "sections", "hero", "hero-section.tsx");
  const heroSrc = sources.get(heroRel);
  if (!heroSrc) err(`#10 ${heroRel} is missing (the h1 lives there)`);
  else {
    const h1s = openingTags(heroSrc, ["h1"]);
    if (h1s.length !== 1) err(`#10 ${heroRel} must render exactly one <h1> (found ${h1s.length})`);
    for (const h of h1s) {
      if (!/\btype-name\b/.test(h.attrs)) err(`#10 ${heroRel}:${lineOf(heroSrc, h.at)} the h1 must carry the name step "type-name" (PHASE3-SPEC §5.4)`);
      if (/\buppercase\b/.test(h.attrs)) err(`#10 ${heroRel}:${lineOf(heroSrc, h.at)} the h1 must never be uppercase (blackletter caps are illegible)`);
    }
  }
  // `type-name` is the hero's alone
  for (const [r, src] of sources) {
    if (r === heroRel || !/^components[\\/]/.test(r)) continue;
    if (/\btype-name\b/.test(src)) err(`#10 ${r} uses "type-name": the name step is the hero h1's alone`);
  }
  // the only h1 on the page: no other mounted component renders one
  const imported = (r) => {
    const spec = "@/" + r.replace(/\\/g, "/").replace(/\.(tsx?|jsx?)$/, "");
    for (const [o, s] of sources) if (o !== r && (s.includes(`"${spec}"`) || s.includes(`'${spec}'`))) return true;
    return false;
  };
  for (const [r, src] of sources) {
    if (r === heroRel || !/^components[\\/].*\.tsx$/.test(r)) continue;
    if (!/<h1\b|as=["']h1["']/.test(src)) continue;
    if (imported(r)) err(`#10 ${r} renders an <h1>: the hero's name is the page's only h1`);
    else warn(`#10 ${r} contains an <h1> but is not imported anywhere (dead code)`);
  }
}
