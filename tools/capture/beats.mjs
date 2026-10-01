// tools/capture/beats.mjs: the P3-2 beat probe (PHASE3-SPEC §3.4; PHASE3-PLAN §5.3, owner B1-BEATS).
// Usage: node tools/capture/beats.mjs <baseUrl> [--widths=1440,1024] [--write] [--out=<dir>]
//                                     [--path=/?skip=intro,smooth&debug=spotlight] [--report-only]
//
// GEOMETRY ONLY. It opens the page with the intro and Lenis skipped (positions are the same with or
// without Lenis; no motion judgement ever uses ?skip=smooth), walks it top to bottom (so lazy content,
// fonts and the spotlight run), then measures at each width (1440×900, 1024×768):
//   - every page item's top and height (sections by #id, act cards by #act-n), so estVh = h / viewport;
//   - every [data-beat] element: page box, star flag and weight (beatAttrs, lib/beats.ts);
//   - the spotlight log (window.__spotlight.log, ?debug=spotlight): requests, waits, grants, skips.
// It prints the gaps (> 100vh between consecutive beats), the competing stars (a scroll star = its box,
// a time star = its top ± 50vh; one spec row or one card set piece never competes with itself), the
// scroll-star spans (< 300 px), the pacing breaches (a weight > 1 star in the viewport after a
// weight-3 one) and the DECLARED-BUT-MISSING ids (in lib/page.ts / lib/film.ts, not in the DOM), plus
// any undeclared data-beat ids. Exit 1 on a gap > 100vh or a scroll-star span < 300 px (unless
// --report-only). --write updates `estVh` in lib/page.ts (sections) and lib/film.ts (acts[]): d from the
// 1440 run, t from the 1024 run, 3 decimals. --out writes beats.json there.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const [BASE] = argv.filter((a) => !a.startsWith("--"));
if (!BASE || flags.help) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\nimport ")[0].replace(/^\/\/ ?/gm, ""));
  process.exit(BASE ? 0 : 2);
}
const VIEWPORTS = { 1440: { width: 1440, height: 900 }, 1024: { width: 1024, height: 768 } };
const widths = (flags.widths ?? "1440,1024").split(",").map((w) => Number(w.trim()));
for (const w of widths) {
  if (!VIEWPORTS[w]) {
    console.error(`beats: --widths takes 1440 and/or 1024 (got ${w})`);
    process.exit(2);
  }
}
const PATH = flags.path ?? "/?skip=intro,smooth&debug=spotlight";
const base = BASE.replace(/\/+$/, "");

/* — the manifest (Node strips the TypeScript types) ———————————————————— */
const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { page } = await imp("lib/page.ts");
const { film } = await imp("lib/film.ts");
const { pageItemsOf } = await imp("lib/derive.ts");
const enabled = page.filter((s) => s.enabled !== false);
const items = pageItemsOf(enabled, film).map((it) =>
  it.kind === "act"
    ? { dom: it.id, kind: "act", act: it.act, beats: film.acts.find((a) => a.id === it.act)?.beats ?? [] }
    : { dom: it.entry.id, kind: "section", beats: it.entry.beats ?? [] },
);
const declared = new Map();
for (const it of items) for (const b of it.beats) declared.set(b.id, { ...b, item: it.dom });
const rowOf = (id) => id.slice(0, 3);

/* — the browser (the same playwright fallback as tools/capture/motion.js) ———— */
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}
const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });

async function measure(width) {
  const vp = VIEWPORTS[width];
  const context = await browser.newContext({ viewport: vp });
  const pg = await context.newPage();
  const errors = [];
  pg.on("pageerror", (e) => errors.push(e.message));
  await pg.goto(`${base}${PATH.startsWith("/") ? "" : "/"}${PATH}`, { waitUntil: "load", timeout: 90000 });
  await pg.waitForFunction(() => window.__pageHydrated === true, null, { timeout: 8000 }).catch(() => {});
  await pg.evaluate(() => document.fonts?.ready);
  // walk the page once (lazy content, entrances, the spotlight), then measure from the top
  await pg.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await sleep(90);
    }
    await sleep(700); // a scroll-idle for needsIdle stars at the end
    window.scrollTo(0, 0);
    await sleep(300);
  });
  const dom = await pg.evaluate((ids) => {
    const y0 = window.scrollY;
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + y0, bottom: r.bottom + y0, h: r.height };
    };
    const itemTops = ids.map((id) => {
      const el = document.getElementById(id);
      return { id, top: el ? box(el).top : null };
    });
    const beats = [...document.querySelectorAll("[data-beat]")]
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => ({
        id: el.getAttribute("data-beat"),
        star: el.hasAttribute("data-beat-star"),
        weight: Number(el.getAttribute("data-beat-weight")) || null,
        ...box(el),
      }));
    const sl = window.__spotlight;
    return {
      scrollHeight: document.documentElement.scrollHeight,
      itemTops,
      beats,
      spotlight: sl ? { log: sl.log, state: sl.state() } : null,
    };
  }, items.map((i) => i.dom));
  await context.close();
  return { width, vp, errors, ...dom };
}

/* — analysis (px; vh = the viewport height of the run) ————————————————— */
function analyse(m) {
  const vh = m.vp.height;
  const toVh = (px) => Math.round((px / vh) * 1000) / 10;
  const out = { width: m.width, pageVh: toVh(m.scrollHeight), heights: {}, gaps: [], competing: [], spans: [], pacing: [], missing: [], undeclared: [] };
  // item heights (top to the next found item's top)
  const tops = m.itemTops.filter((t) => t.top != null).sort((a, b) => a.top - b.top);
  tops.forEach((t, i) => {
    const next = tops[i + 1]?.top ?? m.scrollHeight;
    out.heights[t.id] = Math.round(((next - t.top) / vh) * 1000) / 1000;
  });
  out.notFound = m.itemTops.filter((t) => t.top == null).map((t) => t.id);
  // first box per id
  const seen = new Map();
  for (const b of m.beats) if (!seen.has(b.id)) seen.set(b.id, b);
  const beats = [...seen.values()].sort((a, b) => a.top - b.top);
  out.missing = [...declared.keys()].filter((id) => !seen.has(id));
  out.undeclared = beats.filter((b) => !declared.has(b.id)).map((b) => b.id);
  // gaps between consecutive beat boxes
  let end = -Infinity;
  let last = null;
  for (const b of beats) {
    if (last && b.top - end > vh) out.gaps.push({ after: last.id, before: b.id, vh: toVh(b.top - end) });
    if (b.bottom > end) {
      end = b.bottom;
      last = b;
    }
  }
  const timing = (b) => declared.get(b.id)?.timing ?? (b.h > 0 ? "scroll" : "time");
  const occ = (b) => (timing(b) === "time" ? [b.top - vh / 2, b.top + vh / 2] : [b.top, b.bottom]);
  const stars = beats.filter((b) => b.star);
  const setPiece = (b) => ["transition", "push-title"].includes(declared.get(b.id)?.kind) && declared.get(b.id)?.item;
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const [a, b] = [stars[i], stars[j]];
      if (rowOf(a.id) === rowOf(b.id) || (setPiece(a) && setPiece(a) === setPiece(b))) continue;
      const o = Math.min(occ(a)[1], occ(b)[1]) - Math.max(occ(a)[0], occ(b)[0]);
      if (o > vh / 100) out.competing.push({ a: a.id, b: b.id, vh: toVh(o) });
    }
  }
  for (const b of stars) if (timing(b) === "scroll" && b.h < 300) out.spans.push({ id: b.id, px: Math.round(b.h) });
  for (const h of stars.filter((b) => b.weight === 3)) {
    const breath = [occ(h)[1], occ(h)[1] + vh];
    for (const b of stars) {
      if (b === h || (b.weight ?? 0) <= 1 || (setPiece(b) && setPiece(b) === setPiece(h))) continue;
      if (Math.min(occ(b)[1], breath[1]) - Math.max(occ(b)[0], breath[0]) > vh / 100) out.pacing.push({ heavy: h.id, star: b.id, weight: b.weight });
    }
  }
  if (m.spotlight) {
    const counts = {};
    for (const e of m.spotlight.log) counts[e.ev] = (counts[e.ev] ?? 0) + 1;
    out.spotlight = { counts, log: m.spotlight.log };
  } else out.spotlight = null;
  out.beats = beats.map((b) => ({ id: b.id, star: b.star, weight: b.weight, topVh: toVh(b.top), hPx: Math.round(b.h) }));
  out.pageErrors = m.errors;
  return out;
}

/* — estVh writer ———————————————————————————————————————————————————————— */
function writeEstVh(results) {
  const est = new Map(); // dom id → { d?, t? }
  for (const r of results) {
    const key = r.width === 1440 ? "d" : "t";
    for (const [id, v] of Object.entries(r.heights)) est.set(id, { ...est.get(id), [key]: v });
  }
  const replaceIn = (src, from, to, id, v, file) => {
    const block = src.slice(from, to);
    const m = /estVh: \{ d: ([\d.]+), t: ([\d.]+) \}/.exec(block);
    if (!m) {
      console.warn(`beats --write: ${file} "${id}" has no "estVh: { d: …, t: … }" literal to update`);
      return src;
    }
    const d = v.d ?? Number(m[1]);
    const t = v.t ?? Number(m[2]);
    const next = block.replace(m[0], `estVh: { d: ${+d.toFixed(3)}, t: ${+t.toFixed(3)} }`);
    return src.slice(0, from) + next + src.slice(to);
  };
  // sections: lib/page.ts entries (4-space `id: "<id>",`)
  let pageSrc = fs.readFileSync(path.join(ROOT, "lib/page.ts"), "utf8");
  for (const it of items.filter((i) => i.kind === "section")) {
    const v = est.get(it.dom);
    if (!v) continue;
    const at = pageSrc.indexOf(`\n    id: "${it.dom}",`);
    if (at < 0) continue;
    const nextEntry = pageSrc.indexOf("\n    id: \"", at + 1);
    pageSrc = replaceIn(pageSrc, at, nextEntry < 0 ? pageSrc.length : nextEntry, it.dom, v, "lib/page.ts");
  }
  fs.writeFileSync(path.join(ROOT, "lib/page.ts"), pageSrc);
  // cards: lib/film.ts acts[] (6-space `id: "<act>",` inside the acts block)
  let filmSrc = fs.readFileSync(path.join(ROOT, "lib/film.ts"), "utf8");
  const ACTS_END = "] as const satisfies readonly ActSpec[]";
  for (const it of items.filter((i) => i.kind === "act")) {
    const v = est.get(it.dom);
    const a0 = filmSrc.indexOf("\n  acts: [");
    const a1 = filmSrc.indexOf(ACTS_END, a0);
    if (!v || a0 < 0 || a1 < 0) continue;
    const at = filmSrc.indexOf(`\n      id: "${it.act}",`, a0);
    if (at < 0 || at > a1) continue;
    const nextAct = filmSrc.indexOf('\n      id: "', at + 1);
    filmSrc = replaceIn(filmSrc, at, nextAct < 0 || nextAct > a1 ? a1 : nextAct, it.act, v, "lib/film.ts");
  }
  fs.writeFileSync(path.join(ROOT, "lib/film.ts"), filmSrc);
  console.log(`beats --write: estVh updated for ${est.size} item(s) in lib/page.ts and lib/film.ts`);
}

/* — run ————————————————————————————————————————————————————————————————— */
const results = [];
for (const w of widths) results.push(analyse(await measure(w)));
await browser.close();

let fail = false;
for (const r of results) {
  console.log(`\nbeats @${r.width}: page ${r.pageVh}vh; ${r.beats.length} beat element(s), ${declared.size} declared`);
  if (r.notFound.length) console.log(`  items not found by id: ${r.notFound.join(", ")}`);
  console.log(`  estVh: ${Object.entries(r.heights).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  const list = (label, xs, f) => xs.length && console.log(`  ${label} (${xs.length}): ${xs.map(f).join("; ")}`);
  list("GAPS > 100vh", r.gaps, (g) => `${g.after} → ${g.before} ${g.vh}vh`);
  list("competing stars", r.competing, (c) => `${c.a} × ${c.b} ${c.vh}vh`);
  list("SCROLL-STAR SPANS < 300px", r.spans, (s) => `${s.id} ${s.px}px`);
  list("pacing", r.pacing, (p) => `${p.star} (w${p.weight}) after ${p.heavy}`);
  list("declared but missing", r.missing, (id) => id);
  list("undeclared data-beat", r.undeclared, (id) => id);
  console.log(`  spotlight: ${r.spotlight ? JSON.stringify(r.spotlight.counts) : "not loaded (not DESKTOP_FINE, motion off, or no ?debug=spotlight)"}`);
  if (r.pageErrors.length) console.log(`  page errors: ${r.pageErrors.join(" | ")}`);
  if (r.gaps.length || r.spans.length) fail = true;
}
if (flags.out) {
  fs.mkdirSync(flags.out, { recursive: true });
  fs.writeFileSync(path.join(flags.out, "beats.json"), JSON.stringify({ base, path: PATH, date: new Date().toISOString(), results }, null, 2) + "\n");
  console.log(`\nbeats: wrote ${path.join(flags.out, "beats.json")}`);
}
if (flags.write) writeEstVh(results);
process.exit(fail && !flags["report-only"] ? 1 : 0);
