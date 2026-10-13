/* ============================================================================
   BROWSER DATA DIET — a Turbopack loader (next.config.ts `turbopack.rules`,
   condition "browser" only). PHASE3-SPEC §12.1: the initial route grows
   ≤ 6 KB gz JS. The four data modules every client component reaches
   (lib/media.ts, lib/variants.ts, lib/page.ts, lib/film.ts) carry long
   DOCUMENTATION fields that only Node (the validator, the probes) and
   server components (the credits roll, /lab/variants) ever read:
     lib/media.ts     provenance → { source }   (model, credits, date,
                      jobId and the LOG note stay server-side; the client
                      reads only `provenance.source`, the "legacy" test)
     lib/variants.ts  note, plan, files, and each side's name and media
                      (the lab pages are server components and Node reads
                      the rest; the client reads only the keys and whether
                      `alt` is null: hasAlt, pieceSpec in prepaint-variants)
     lib/page.ts      beats, tempo, estVh        (read by StageSplit, a
     lib/film.ts      beats, tempo, estVh         server component, and by
                                                  Node; the spotlight reads
                                                  data-beat from the DOM)
   The SOURCE stays the one truth (tsc, `npm run check`, Node and every
   server render see the full rows). Only the browser chunk is slimmer, so
   nothing a client component renders can differ from the server's HTML
   (no hydration risk): a client file that starts reading one of these
   fields must also be removed from this list.

   It rewrites only object-literal properties at code level inside the
   named data object (strings, template literals and comments are skipped
   exactly), and it FAILS THE BUILD if a module no longer matches what it
   expects (no data object, or nothing stripped), so a refactor can never
   silently ship the docs again or strip the wrong thing.
   ========================================================================== */
"use strict";

/** Per file: the data object's opening text, and what to do per key. */
const RULES = {
  "lib/media.ts": { start: "export const mediaAssets = {", keys: { provenance: "source" } },
  "lib/variants.ts": {
    start: "export const VARIANT_REGISTRY = {",
    keys: { note: "drop", plan: "drop", files: "drop", name: "drop", media: "drop" },
  },
  "lib/page.ts": { start: "export const page: readonly SectionEntry[] = [", keys: { beats: "drop", tempo: "drop", estVh: "drop" } },
  "lib/film.ts": { start: "export const film = {", keys: { beats: "drop", tempo: "drop", estVh: "drop" } },
};

/** Index just past the string / template / comment that starts at `i`
 *  (or `i` itself when none starts there). */
function skipNonCode(src, i) {
  const c = src[i];
  const n = src[i + 1];
  if (c === "/" && n === "/") {
    const e = src.indexOf("\n", i);
    return e < 0 ? src.length : e;
  }
  if (c === "/" && n === "*") {
    const e = src.indexOf("*/", i + 2);
    if (e < 0) throw new Error("unterminated comment");
    return e + 2;
  }
  if (c === '"' || c === "'") {
    let j = i + 1;
    while (j < src.length && src[j] !== c) {
      if (src[j] === "\\") j++;
      if (src[j] === "\n") throw new Error("unterminated string");
      j++;
    }
    return j + 1;
  }
  if (c === "`") {
    let j = i + 1;
    while (j < src.length && src[j] !== "`") {
      if (src[j] === "\\") j += 2;
      else if (src[j] === "$" && src[j + 1] === "{") j = matchClose(src, j + 1) + 1;
      else j++;
    }
    return j + 1;
  }
  return i;
}

const OPEN = { "(": ")", "[": "]", "{": "}" };

/** Index of the bracket closing the one at `i`. */
function matchClose(src, i) {
  const stack = [OPEN[src[i]]];
  let j = i + 1;
  while (j < src.length) {
    const k = skipNonCode(src, j);
    if (k !== j) {
      j = k;
      continue;
    }
    const c = src[j];
    if (OPEN[c]) stack.push(OPEN[c]);
    else if (c === ")" || c === "]" || c === "}") {
      if (stack.pop() !== c) throw new Error(`unbalanced "${c}" at ${j}`);
      if (!stack.length) return j;
    }
    j++;
  }
  throw new Error("unclosed bracket");
}

/** End of the property value starting at `i`: the index of the `,`, `}` or
 *  `]` that ends it at depth 0. */
function valueEnd(src, i) {
  let j = i;
  while (j < src.length) {
    const k = skipNonCode(src, j);
    if (k !== j) {
      j = k;
      continue;
    }
    const c = src[j];
    if (OPEN[c]) j = matchClose(src, j) + 1;
    else if (c === "," || c === "}" || c === "]") return j;
    else if (c === ";") throw new Error(`";" inside a property value at ${j}`);
    else j++;
  }
  throw new Error("unterminated value");
}

function sourceOf(value) {
  const v = value.trim();
  if (/^(hf|hf2|hfP3)\s*\(/.test(v)) return '{ source: "higgsfield" }';
  if (v.startsWith("{")) {
    const m = /\bsource\s*:\s*("[a-z]+")/.exec(v);
    if (m) return `{ source: ${m[1]} }`;
  }
  return null; // an identifier (`legacy`) or anything else: kept as written
}

function strip(src, file) {
  const rule = RULES[file];
  const at = src.indexOf(rule.start);
  if (at < 0) throw new Error(`browser-data-loader: "${rule.start}" not found in ${file}`);
  const open = at + rule.start.length - 1;
  const close = matchClose(src, open);
  const keyRe = new RegExp(`^(${Object.keys(rule.keys).join("|")})\\s*:`);
  const edits = [];
  let j = open + 1;
  // the last code character passed (comments and whitespace skipped): a
  // property key follows "{" or ","
  let before = "{";
  while (j < close) {
    const k = skipNonCode(src, j);
    if (k !== j) {
      if (src[j] === '"' || src[j] === "'" || src[j] === "`") before = src[j];
      j = k;
      continue;
    }
    const m = /[A-Za-z_$]/.test(src[j]) && !/[\w$.]/.test(src[j - 1]) ? keyRe.exec(src.slice(j, j + 24)) : null;
    if (!/\s/.test(src[j])) {
      if (!m) before = src[j];
    }
    if (m && (before === "{" || before === ",")) {
      const vStart = j + m[0].length;
      const vEnd = valueEnd(src, vStart);
      const how = rule.keys[m[1]];
      if (how === "drop") {
        const end = src[vEnd] === "," ? vEnd + 1 : vEnd;
        edits.push([j, end, ""]);
      } else {
        const repl = sourceOf(src.slice(vStart, vEnd));
        if (repl) edits.push([vStart, vEnd, ` ${repl}`]);
      }
      before = ",";
      j = vEnd;
      continue;
    }
    j++;
  }
  if (!edits.length) throw new Error(`browser-data-loader: nothing stripped in ${file}; update RULES`);
  let out = src;
  for (let e = edits.length - 1; e >= 0; e--) {
    const [a, b, s] = edits[e];
    out = out.slice(0, a) + s + out.slice(b);
  }
  return out;
}

module.exports = function browserDataLoader(source) {
  const rel = this.resourcePath.replace(/\\/g, "/").replace(/^.*?\/(lib\/[^/]+\.ts)$/, "$1");
  if (!RULES[rel]) return source;
  return strip(source, rel);
};
module.exports.strip = strip;
module.exports.RULES = RULES;
