// scripts/checks/honesty.mjs: PHASE3-SPEC §3.4 check 6, the honesty lint (ERROR), for the
// §8.6 honesty copy. Owner: B1-BEATS (PHASE3-PLAN §4.7).
//
// Smooth scroll, WebGL and sound reach only some visitors (DESKTOP_FINE with motion on; the
// css/off GL tiers, phones, reduced motion and Pause get none of them), so rendered copy:
//   1. never DENIES a feature whose flag is on (film.smoothScroll / film.gl / film.sound):
//      no "native scroll", "no WebGL", "silent" / "no audio", unless the same string scopes
//      the denial to where it is true ("on phones", "with reduced motion", "paused");
//   2. never CLAIMS one without its scope: a string naming Lenis / smooth scroll / WebGL
//      also says where ("on desktop", "where supported"); with the flag off it may not
//      claim it at all. A licence credit ("Lenis (MIT)") is an attribution, not a claim.
// Scanned: every film copy string (rendered or not: fail closed), the act titles, loglines
// and epigraphs, tips, captions, world reasons, every lib/content.ts string, and the code
// of components/** and app/** with comments stripped. Routes that never run Lenis (/lab,
// the 404) may say "native scroll". components/gl/** is the GL code itself (exempt from 2).
//
// DEFERRED: a finding on a key listed here is a release gate (warning now, error under
// RELEASE=1) instead of an error, because its fix is a scheduled handoff in a later wave.
import fs from "node:fs";
import path from "node:path";

// (empty since the W2 assembly: "systems.pencil.body.p3" replaced the M2 wink and the
// "systems.meta.webgl" line is on, in the commit that ships the WebGL layer)
const DEFERRED = {};

/** Where a denial is true: the visitor really has native scroll / no WebGL / no sound. */
const DENIAL_SCOPE = /\b(?:on|for)\s+(?:phones?|mobiles?|touch(?:\s+screens?)?|tablets?|small screens)\b|\breduced[\s-]motion\b|\bpaused?\b|\bwithout javascript\b|\bno-js\b|\buntil you\b|\bby default\b|\bmuted\b/i;
/** Where a claim is true. */
const CLAIM_SCOPE = /\bdesktops?\b|\bwhere supported\b|\bif supported\b|\bwhere (?:the )?(?:browser|device) (?:allows|supports)\b/i;
const ATTRIBUTION = /\blicen[cs]e[ds]?\b|\(MIT\)|\bMIT licen/i;

// Prose patterns (a space, not a hyphen: "smooth-scroll" is a file or an id, not a claim;
// "WebGL" / "Lenis" capitalised: "webgl2" / "lenis" are API strings and class names).
const RULES = [
  { flag: "smoothScroll", what: "smooth scroll", deny: [/\bnative\s+scroll(?:ing)?\b/i, /\bno\s+(?:smooth\s+scroll(?:ing)?|scroll\s*(?:hi)?jacking)\b/i], claim: [/\bLenis\b/, /\bsmooth\s+scroll(?:ing)?\b/i] },
  { flag: "gl", what: "WebGL", deny: [/\bno[\s-]+WebGL\b/i, /\bwithout\s+WebGL\b/i, /\bWebGL[\s-]free\b/i, /\bnon-WebGL\b/i], claim: [/\bWebGL\b/] },
  { flag: "sound", what: "sound", deny: [/\bsilent\b/i, /\b(?:no|without)\s+(?:audio|sound)\b/i], claim: [] },
];
/** Routes with no Lenis (spec §13 P3-2 #1: /lab and the 404). */
const NO_LENIS_ROUTE = /^app[\\/](?:lab[\\/]|(?:.*[\\/])?not-found\.)/;
const GL_CODE = /^components[\\/]gl[\\/]/;
/** A JSX text run that is really code (`a > b && c < d`, generics). */
const CODE_RUN = /[=;]|&&|\|\||=>/;
/** Statements whose strings are never rendered copy. */
const NOT_COPY = /\bconsole\.\w+\(|\bthrow\b|\bnew Error\(|\bimport\b|\brequire\(/;

/** Comments → spaces (newlines kept), so commented prose is never read as copy. Strings are
 *  skipped (a quote opens one; ' and " strings end at the line end, so a JSX apostrophe can
 *  swallow at most the rest of its own line). */
function stripComments(src) {
  const out = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") {
        out.push(" ");
        i++;
      }
    } else if (c === "/" && d === "*") {
      const close = src.indexOf("*/", i + 2);
      const stop = close === -1 ? n : close + 2;
      out.push(src.slice(i, stop).replace(/[^\n]/g, " "));
      i = stop;
    } else if (c === '"' || c === "'" || c === "`") {
      const stop = stringEnd(src, i);
      out.push(src.slice(i, stop));
      i = stop;
    } else {
      out.push(c);
      i++;
    }
  }
  return out.join("");
}

/** The index just past the string literal opening at `i` (' and " end at the line end). */
function stringEnd(src, i) {
  const q = src[i];
  let j = i + 1;
  while (j < src.length && src[j] !== q && !(q !== "`" && src[j] === "\n")) j += src[j] === "\\" ? 2 : 1;
  return Math.min(src[j] === q ? j + 1 : j, src.length);
}

export default function run({ ROOT, err, gate, film, content, uiFiles }) {
  const report = (where, text, why) => {
    const snippet = text.length > 140 ? `${text.slice(0, 137)}…` : text;
    const msg = `[P3 #6] honesty: ${where}: "${snippet.trim()}": ${why}`;
    if (DEFERRED[where]) gate(`${msg} (deferred: ${DEFERRED[where]})`);
    else err(msg);
  };
  /** One rendered string (or one code line). */
  const lint = (where, text, o = {}) => {
    if (typeof text !== "string" || !text) return;
    for (const r of RULES) {
      const on = Boolean(film[r.flag]);
      const denies = r.deny.some((re) => re.test(text));
      if (denies) {
        if (on && !DENIAL_SCOPE.test(text) && !(r.flag === "smoothScroll" && o.noLenisRoute)) {
          report(where, text, `denies ${r.what} while film.${r.flag} is on (scope it: "on phones", "with reduced motion")`);
        }
        continue; // a denial is not also a claim
      }
      if (o.glCode || !r.claim.some((re) => re.test(text)) || ATTRIBUTION.test(text)) continue;
      if (!on) report(where, text, `claims ${r.what}, but film.${r.flag} is off`);
      else if (!CLAIM_SCOPE.test(text)) report(where, text, `claims ${r.what} without its scope ("on desktop", "where supported")`);
    }
  };

  /* — film copy (every string: fail closed) ——————————————————————————— */
  for (const [k, c] of Object.entries(film.copy ?? {})) lint(`copy.${k}`, c?.text);
  for (const a of film.acts ?? []) {
    lint(`acts.${a.id}.title`, a.title?.text);
    lint(`acts.${a.id}.logline`, a.logline?.text);
    if (a.epigraph && typeof a.epigraph === "object") lint(`acts.${a.id}.epigraph`, a.epigraph.text);
  }
  for (const [w, s] of Object.entries(film.worlds ?? {})) {
    lint(`worlds.${w}.borrowed`, s.borrowed?.text);
    lint(`worlds.${w}.reason`, s.reason?.text);
  }
  (film.tips ?? []).forEach((t, i) => lint(`tip #${i + 1}`, t?.text));
  for (const [k, c] of Object.entries(film.captions ?? {})) lint(k, c?.moment?.text);

  /* — lib/content.ts (the facts the sections render) ———————————————————— */
  const seen = new Set();
  const walk = (v, where) => {
    if (typeof v === "string") return lint(where, v);
    if (!v || typeof v !== "object" || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
  };
  for (const [k, v] of Object.entries(content ?? {})) walk(v, `content.${k}`);

  /* — components/** and app/** code: string literals and JSX text only ——————— */
  for (const f of uiFiles) {
    const rel = path.relative(ROOT, f);
    if (!/^(components|app)[\\/]/.test(rel) || !/\.(tsx?|jsx?|mjs)$/.test(rel)) continue;
    const o = { noLenisRoute: NO_LENIS_ROUTE.test(rel), glCode: GL_CODE.test(rel) };
    for (const { line, text } of copyIn(stripComments(fs.readFileSync(f, "utf8")))) lint(`${rel}:${line}`, text, o);
  }
}

/** The copy-like runs of comment-free code: every string literal (outside console / throw /
 *  import statements) and every JSX text run (between > and <, with no code punctuation). */
function copyIn(code) {
  const out = [];
  const lines = code.split("\n");
  const lineAt = (idx) => code.slice(0, idx).split("\n").length;
  const blanked = [];
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (c !== '"' && c !== "'" && c !== "`") {
      blanked.push(c);
      i++;
      continue;
    }
    const stop = stringEnd(code, i);
    const body = code.slice(i + 1, code[stop - 1] === c && stop - 1 > i ? stop - 1 : stop);
    const line = lineAt(i);
    if (!NOT_COPY.test(lines[line - 1] ?? "")) out.push({ line, text: body.replace(/\\(.)/g, "$1") });
    blanked.push(c, code.slice(i + 1, stop).replace(/[^\n]/g, " "));
    i = stop;
  }
  for (const m of blanked.join("").matchAll(/>([^<>{}]+)</g)) {
    const text = m[1];
    if (/[A-Za-z]/.test(text) && !CODE_RUN.test(text)) out.push({ line: lineAt(m.index), text });
  }
  return out;
}
