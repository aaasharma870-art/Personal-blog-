// scripts/checks/lettering.mjs: validator #10 (lettering scope + the
// display-face allow-list). Owner: B1-TYPE (PHASE3-PLAN §4.7; W1.0 moved the
// block here VERBATIM from scripts/check-manifest.mjs, DP-11).
// Loaded by scripts/check-manifest.mjs: `export default function run(ctx)`.
import fs from "node:fs";
import path from "node:path";

export default function run({ ROOT, film, quotes, err, uiFiles }) {
/* — #10 lettering scope + display-face allow-list —————————————————— */
{
  // M2 (RECOGNIZABILITY O-1): the "caption" slot is in scope only while
  // film.fontScope.extended is on.
  const SLOTS = ["act-title", "loader", "egg", ...(film.fontScope.extended ? ["caption"] : [])];
  const QUOTE_IDS = new Set(Object.keys(quotes));
  for (const l of film.lettering) {
    if (!SLOTS.includes(l.slot)) err(`#10 lettering "${l.id}" slot "${l.slot}" is outside the display-font scope`);
    if (l.quote !== undefined && !QUOTE_IDS.has(l.quote)) err(`#10 lettering "${l.id}": unknown quote "${l.quote}"`);
    if (l.quote === undefined && !l.text) err(`#10 lettering "${l.id}" has no text`);
    if (l.mode === "B" && l.shipped && !fs.existsSync(path.join(ROOT, "lib", "lettering.generated.ts"))) err(`#10 lettering "${l.id}" is mode B + shipped but lib/lettering.generated.ts is missing`);
  }
  // who may reference a display face (font-world-*, --font-egg-*, the M2
  // .world-face-<world> classes). Everyone else sets a fan face through
  // scene-caption.tsx (<SceneCaption>, <Lettered>, <FilmTitle>), which only
  // letters REGISTERED strings (lib/sections.ts letteredIn).
  const ALLOW = [
    /^components[\\/]primitives[\\/](scene-caption\.tsx|world-face\.ts)$/,
    /^app[\\/]globals\.css$/,
    /^app[\\/]layout\.tsx$/,
    /^lib[\\/]fonts\.ts$/,
    /^components[\\/]primitives[\\/](act-card|loader)\.tsx$/,
    /^components[\\/]primitives[\\/]loaders[\\/]/,
    /^components[\\/]sections[\\/]act-card[\\/]/,
    /^components[\\/]eggs[\\/]/,
    /^components[\\/]site[\\/]journey[^\\/]*\.tsx$/, // the THE CROSSING cartouche
    /^app[\\/](not-found|lab)/,
  ];
  for (const f of uiFiles) {
    const rel = path.relative(ROOT, f);
    const src = fs.readFileSync(f, "utf8");
    if (/font-world-|--font-egg-|world-face-|fontWorld(Pirates|Idiots|Hp|Rdr2)|fontEggRye/.test(src) && !ALLOW.some((re) => re.test(rel))) {
      err(`#10 ${rel} uses a world display face outside the allowed slots (act titles, loader route cards, eggs)`);
    }
  }
}
}
