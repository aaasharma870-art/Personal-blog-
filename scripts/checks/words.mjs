// scripts/checks/words.mjs: the word primitives (PHASE3-SPEC §8.2, §8.3, §8.5, §3.8, §11.5;
// P3-7, D3-6, D3-9, D3-16). Owner: W2-WORDS (PHASE3-PLAN §4.7).
//
// ERRORS (the data the primitives ship with):
//   scrub     components/words/words-data.ts SCRUB_LINES are exactly the four spec §8.3 strings,
//             each verbatim and a whole sentence in its content.ts source, with no digit and no
//             Sharpe / PSR / PF; its beat is a `scrub-sentence` SCROLL star on the named section.
//   physical  each PHYSICAL_WORDS token is a whole word in its host copy (content.ts, or the host
//             file for "Killed"); its beat is a `physical-word` TIME star on that section; ≤ 2
//             in all, ≤ 1 per section.
//   titles    exactly 8 `title` beats, the TITLE_BEATS ids on their sections (D3-16).
//   fly       exactly 2 `fly-through` beats (B12, B45), both `needsIdle` (spec §3.8).
//   hygiene   no <details className="… collapse …"> (Tailwind's `visibility: collapse`; the
//             hook is [data-collapse]); app/p3/words.css has no [class*=…] / [class^=…] and no
//             html.lenis / .lenis-* rule (W1 lesson).
//   hosts     no more hosts than the spec allows (8 in-character, 4 scrub, 2 physical, 2 fly).
// RELEASE GATE (W3 gate, 2026-10-02: every host has landed): fewer hosts than that. A
// <FilmTitle inCharacter beat={FILM_BEATS[…].title}> fed from the per-film table
// (components/sections/films/film-beats.ts) counts once per film title in that table.
import path from "node:path";
import { pathToFileURL } from "node:url";

/** Spec §8.3, verbatim. */
const SPEC_SCRUB = {
  B08: "The work I am proudest of is not a winning strategy — it is the documented graveyard of my own ideas that did not survive testing.",
  B21: "A documented 'no' protects capital better than another optimistic 'yes'.",
  B42: "Nature, architecture, people — studying composition and the behavior of light and shadow.",
  B55: "Most failures I have seen were failures of attention before they were failures of math.",
};
const NEVER_ANIMATE = /\b(Sharpe|PSR|PF)\b/;
const HOSTS = { inCharacter: 8, scrub: 4, physical: 2, fly: 2 };

const wholeWord = (text, word) => new RegExp(`(^|[^A-Za-z0-9'’])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Za-z0-9'’])`).test(text);
/** Source without comments (a usage named in a comment does not count). */
const uncommented = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

export default async function run({ ROOT, RELEASE, err, warn, gate: ctxGate, page, content, readFile, uiFiles }) {
  const gate = ctxGate ?? ((m) => (RELEASE ? err(m) : warn(`[release gate] ${m}`)));
  const data = await import(pathToFileURL(path.join(ROOT, "components", "words", "words-data.ts")).href);
  const get = (p) => p.split(/[.[\]]/).filter(Boolean).reduce((o, k) => (o == null ? o : o[k]), content);
  const beats = new Map();
  for (const s of page) for (const b of s.beats ?? []) beats.set(b.id, { ...b, section: s.id });
  const beatIs = (id, host, kind, timing, label) => {
    const b = beats.get(id);
    if (!b) return err(`words ${label}: beat ${id} is not declared in lib/page.ts`);
    if (b.kind !== kind) err(`words ${label}: beat ${id} is "${b.kind}", not "${kind}"`);
    if (b.timing !== timing) err(`words ${label}: beat ${id} must be a ${timing} beat`);
    if (!b.star) err(`words ${label}: beat ${id} must be a star`);
    if (host && b.section !== host) err(`words ${label}: beat ${id} sits on "${b.section}", words-data.ts says "${host}"`);
    return b;
  };

  /* — scrubbed sentences (spec §8.3, D3-6) ————————————————————————————— */
  const scrub = data.SCRUB_LINES ?? {};
  if (Object.keys(scrub).length !== 4) err(`words §8.3: exactly four scrubbed sentences (one per act), found ${Object.keys(scrub).length}`);
  for (const [id, spec] of Object.entries(SPEC_SCRUB)) {
    const line = scrub[id];
    if (!line) {
      err(`words §8.3: SCRUB_LINES has no ${id}`);
      continue;
    }
    if (line.text !== spec) err(`words §8.3: SCRUB_LINES.${id} is not the spec §8.3 string`);
    if (/\d/.test(line.text)) err(`words §8.3: SCRUB_LINES.${id} holds a number (a scrubbed sentence never does)`);
    if (NEVER_ANIMATE.test(line.text)) err(`words §8.3: SCRUB_LINES.${id} names Sharpe / PSR / PF (they never animate)`);
    const src = get(line.source);
    if (typeof src !== "string") err(`words §8.3: ${id} source "${line.source}" is not a content.ts string`);
    else {
      const at = src.indexOf(line.text);
      if (at < 0) {
        err(`words §8.3: ${id} is no longer verbatim in content.ts ${line.source} (the host renders plain text; update SCRUB_LINES and spec §8.3 together)`);
      } else {
        const before = src.slice(0, at).trimEnd();
        const after = src.slice(at + line.text.length);
        if ((before && !/[.!?]$/.test(before)) || (after && !/^\s/.test(after))) err(`words §8.3: ${id} is not a whole sentence of ${line.source}`);
      }
    }
    beatIs(id, line.host, "scrub-sentence", "scroll", "§8.3");
  }

  /* — physical words (spec §8.5) ————————————————————————————————————— */
  const phys = Object.entries(data.PHYSICAL_WORDS ?? {});
  if (phys.length > 2) err(`words §8.5: at most two physical words, found ${phys.length}`);
  const physHosts = new Set();
  for (const [id, w] of phys) {
    if (physHosts.has(w.host)) err(`words §8.5: two physical words on "${w.host}" (≤ 1 per section)`);
    physHosts.add(w.host);
    if (NEVER_ANIMATE.test(w.word)) err(`words §8.5: ${id} animates Sharpe / PSR / PF`);
    let src;
    try {
      src = /^(components|app|lib)\//.test(w.source) ? readFile(w.source) : get(w.source);
    } catch {
      src = undefined;
    }
    if (typeof src !== "string") err(`words §8.5: ${id} host copy "${w.source}" not found`);
    else if (!wholeWord(src, w.word)) err(`words §8.5: "${w.word}" (${id}) is no longer a whole word in ${w.source} (nothing plays; check the host)`);
    beatIs(id, w.host, "physical-word", "time", "§8.5");
  }

  /* — titles in character (spec §8.2, D3-16) ——————————————————————————— */
  const titleBeats = [...beats.values()].filter((b) => b.kind === "title");
  if (titleBeats.length !== 8) err(`words §8.2: exactly 8 in-character title beats (D3-16), found ${titleBeats.length}: ${titleBeats.map((b) => b.id).join(", ")}`);
  for (const [id, t] of Object.entries(data.TITLE_BEATS ?? {})) beatIs(id, t.host, "title", "time", "§8.2");

  /* — fly-throughs (spec §3.8, §2.5) ————————————————————————————————— */
  const flyBeats = [...beats.values()].filter((b) => b.kind === "fly-through");
  if (flyBeats.length !== 2) err(`words §3.8: exactly two fly-throughs (Act I gull, Act III horse), found ${flyBeats.length}`);
  for (const [id, f] of Object.entries(data.FLY_BEATS ?? {})) {
    const b = beatIs(id, f.host, "fly-through", "time", "§3.8");
    if (b && b.needsIdle !== true) err(`words §3.8: fly-through ${id} must be needsIdle`);
  }

  /* — hygiene ——————————————————————————————————————————————————————— */
  const sources = uiFiles
    .map((f) => ({ rel: path.relative(ROOT, f).split(path.sep).join("/"), f }))
    .filter(({ rel }) => /^(components|app)\//.test(rel) && /\.(tsx?|css)$/.test(rel))
    .map(({ rel }) => ({ rel, src: readFile(rel) }));
  for (const { rel, src } of sources) {
    if (/<details\b[^>]*className=\{?["'`][^"'`]*(?<![\w-])collapse(?![\w-])/.test(src)) err(`words §11.5: ${rel} gives a <details> the class "collapse" (Tailwind's visibility: collapse); use <Collapse> ([data-collapse])`);
  }
  const css = readFile("app/p3/words.css");
  if (/\[class[*^]=/.test(css)) err("words: app/p3/words.css uses a [class*=…] / [class^=…] selector (W1 rule)");
  if (/html\.lenis|\.lenis-/.test(css)) err("words: app/p3/words.css keys on Lenis's html classes (W1 rule)");

  /* — hosts (too many is an error, too few a release gate since W3) ———————— */
  const hosts = sources.filter(({ rel }) => /\.tsx$/.test(rel) && !/^components\/words\//.test(rel) && !/^app\/lab\//.test(rel));
  const count = (re) => hosts.reduce((n, { src }) => n + (uncommented(src).match(re)?.length ?? 0), 0);
  // the films screens render one FilmTitle per film from FILM_BEATS (B31–B34)
  let filmTable = "";
  try {
    filmTable = uncommented(readFile("components/sections/films/film-beats.ts") ?? "");
  } catch {
    filmTable = "";
  }
  const filmTitles = new Set([...filmTable.matchAll(/\btitle:\s*["'](B\d+)["']/g)].map((m) => m[1])).size;
  const tableHosts = count(/<FilmTitle\b[^>]*?\binCharacter\b[^>]*?\bbeat=\{\s*FILM_BEATS\[/gs);
  const used = {
    inCharacter:
      count(/<(?:SectionHead|FilmTitle|SceneCaption|Lettered)\b[^>]*?\binCharacter\b/gs) + count(/<InCharacterTitle\b/g) + tableHosts * Math.max(0, filmTitles - 1),
    scrub: count(/<ScrubSentence\b/g),
    physical: count(/<PhysicalWord\b/g),
    fly: count(/<FlyThrough\b/g),
  };
  for (const [k, max] of Object.entries(HOSTS)) {
    if (used[k] > max) err(`words: ${used[k]} ${k} hosts in components/app (the spec allows ${max})`);
    else if (used[k] < max) gate(`words: ${used[k]} of ${max} ${k} hosts wired (spec §8; every host landed in W3)`);
  }
}
