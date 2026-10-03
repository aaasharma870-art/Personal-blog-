// tools/capture/clips.mjs: cut a screencast into 1 s clips + contact sheets (P3-11.0 TOOLS; PHASE3-PLAN §11.1).
// Usage: node tools/capture/clips.mjs <screencastDir> [--raw=<dir>] [--clip=1] [--from=start|scroll]
//          [--per-sheet=10] [--sheet-width=1600] [--quality=70] [--strips=1] [--strip-width=1280] [--label=<text>]
//          [--plain --name=panel]
// <screencastDir> holds screencast.json (tools/capture/screencast.mjs); the frames are read from <raw>/frames
// (default: the screencast's meta.raw, else <screencastDir>/raw).
//
// Per clip ([t, t + clip) of page time from the recording start, or from the first scroll input with
// --from=scroll):
//   - 4 frames, the frame on screen at 1/8, 3/8, 5/8 and 7/8 of the clip;
//   - scrollY (mid-clip, from the frames' scroll offsets), the section at the reading line (50 %);
//   - the STARS ACTIVE per the spotlight log (?debug=spotlight): a scroll star owns the spotlight from "own"
//     to the next "own" / "free" (its PERFORMANCE WINDOW since P3-11 r1: lib/spotlight.ts) and PERFORMS only
//     while the page moves inside it (frames' scrollY changing), unless the log marks it `how: "live"` (it
//     animates on its own: a loop); a time star holds it from "grant" to "end" / "release". So the machine
//     counts what the eye can see move (and only where the page moved ≥ 12 px inside the clip). `maxConcurrent` is the largest number active at one instant (the O.4
//     bar: 0 clips with two or more; `overlapMs` = how long two or more are active together inside the clip);
//     `ids` every star seen in the clip (a hand-off inside one second lists two, one after the other);
//   - declared scroll stars that never registered with the spotlight in this run (e.g. a host that never calls
//     registerScrollStar), while their DOM box crosses the middle 60 %: `unregistered`; totals.withDeclared
//     counts them with the spotlight's own stars;
//   - the declared breath (lib/beats.ts BREATHS, P3-11 r1): the viewport right after each weight-3 star (a
//     card's (a) → (b) set piece counts as one, from the end of its (b)), placed on this run's own geometry
//     (lib/page.ts + lib/film.ts beats `at` / `span`, with the validator's rule: an offset ≥ 0 at the same
//     fraction of the item, a negative one in vh), so a clip whose scrollY falls in one is
//     `breath: "after <id>"`; `row` / `rowStars` = the beat-map row of the screen and its declared stars;
//   - the intro phase (play screen, flight, hold, titles) from the intro:* marks: the prologue is outside the
//     page rules and is counted apart;
//   - frame timings (rAF fps, p95, max) and LoAFs > 50 ms in the clip.
// --plain: labels carry only the clip number, the time and the screen number (scrollY / viewport height + 1):
// a judge of "would you keep scrolling?" sees no star or beat annotation. --name=<n> writes clips-<n>.json and
// sheets-<n>/ beside the default ones (e.g. --clip=2 --plain --name=panel).
// Writes: <screencastDir>/clips.json ({ meta, totals, clips }), <screencastDir>/sheets/sheet-NN.jpg (10 clips per
// sheet in 2 columns, labels burned in; ≤ 1600 px wide, JPEG q70) and, with --strips (default on), one strip per
// clip in <raw>/clips/clip-NNNN.jpg (4 frames, ≤ 1280 px wide; local only).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const [DIR] = argv.filter((a) => !a.startsWith("--"));
if (!DIR || flags.help) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\nimport ")[0].replace(/^\/\/ ?/gm, ""));
  process.exit(DIR ? 0 : 2);
}
const SC = JSON.parse(fs.readFileSync(path.join(DIR, "screencast.json"), "utf8"));
const RAW = path.resolve(flags.raw ?? (SC.meta.raw ? path.resolve(SC.meta.raw) : path.join(DIR, "raw")));
const FRAMES = path.join(RAW, "frames");
const CLIP_S = Number(flags.clip ?? 1);
const PER_SHEET = Number(flags["per-sheet"] ?? 10);
const SHEET_W = Number(flags["sheet-width"] ?? 1600);
const QUALITY = Number(flags.quality ?? 70);
const STRIPS = flags.strips !== "0";
const STRIP_W = Number(flags["strip-width"] ?? 1280);
const PLAIN = Boolean(flags.plain);
const NAME = flags.name ? `-${flags.name}` : "";
const [VWW, VWH] = SC.meta.viewport.split("x").map(Number);

/* — the declared beats (the manifest) and the ⟂ rows (the spec) ——————————————— */
const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { page } = await imp("lib/page.ts");
const { film } = await imp("lib/film.ts");
const { pageItemsOf } = await imp("lib/derive.ts");
const items = pageItemsOf(page.filter((s) => s.enabled !== false), film).map((it) =>
  it.kind === "act"
    ? { dom: it.id, card: true, est: film.acts.find((a) => a.id === it.act)?.estVh ?? null, beats: film.acts.find((a) => a.id === it.act)?.beats ?? [] }
    : { dom: it.entry.id, card: false, est: it.entry.estVh ?? null, beats: it.entry.beats ?? [] },
);
const DECLARED_SCROLL = new Set(items.flatMap((it) => it.beats.filter((b) => b.star && b.timing === "scroll").map((b) => b.id)));
const rowOf = (id) => id.slice(0, 3);

/** An item's beat offset (vh @1440 from its top) → px on a geometry snapshot (the validator's rule). */
const placer = (it, box, vh) => {
  const itemVh = it.est ? it.est.d * 100 : (box.h / vh) * 100; // the item's height in vh@1440 (the beats' unit)
  return (at) => box.top + (at >= 0 ? (at / itemVh) * box.h : (at / 100) * vh);
};

/** The breaths (lib/beats.ts BREATHS) on a geometry snapshot: [{ after, from, to }] in scrollY (viewport top).
 *  A weight-3 star ends at at + span (a time star with span 0: at + 50); a card's (a) → (b) is one set piece. */
function breathsFor(geo) {
  const vh = geo.vh;
  const byId = new Map(geo.items.map((i) => [i.id, i]));
  const ends = [];
  for (const it of items) {
    const box = byId.get(it.dom);
    if (!box) continue;
    const y = placer(it, box, vh);
    let piece = null;
    for (const b of it.beats) {
      if (!b.star || b.weight !== 3) continue;
      const end = { id: b.id, y: y(b.timing === "time" && b.span === 0 ? b.at + 50 : b.at + b.span) };
      if (it.card && (b.kind === "transition" || b.kind === "push-title")) {
        if (!piece || end.y > piece.y) piece = end;
      } else ends.push(end);
    }
    if (piece) ends.push(piece);
  }
  return ends.sort((a, b) => a.y - b.y).map((e) => ({ after: e.id, from: Math.round(e.y), to: Math.round(e.y + vh) }));
}

/** Beat-map rows placed on a geometry snapshot: [{ row, from, to, stars: [{ id, w }] }] in scrollY (viewport top). */
function rowsFor(geo) {
  const vh = geo.vh;
  const byId = new Map(geo.items.map((i) => [i.id, i]));
  const starts = [];
  for (const it of items) {
    const box = byId.get(it.dom);
    if (!box) continue;
    const y = placer(it, box, vh);
    for (const b of it.beats) starts.push({ id: b.id, row: rowOf(b.id), y: y(b.at), star: Boolean(b.star), w: b.weight ?? 0, timing: b.timing });
  }
  const rows = new Map();
  for (const s of starts) {
    const r = rows.get(s.row) ?? { row: s.row, from: Infinity, stars: [] };
    r.from = Math.min(r.from, s.y);
    if (s.star) r.stars.push({ id: s.id, w: s.w, timing: s.timing });
    rows.set(s.row, r);
  }
  const list = [...rows.values()].sort((a, b) => a.from - b.from);
  list.forEach((r, i) => (r.to = list[i + 1]?.from ?? geo.H));
  // a row that begins inside a breath is a rest (tools/capture/deadscreen.mjs asks it for no fill)
  const breaths = breathsFor(geo);
  return list.map((r) => ({ ...r, from: Math.round(r.from), to: Math.round(r.to), breath: breaths.some((b) => b.from - 1 <= r.from && r.from < b.to) }));
}

/* — spotlight intervals ———————————————————————————————————————————————————— */
const T_END = SC.tEnd;
/** When the page moves: [from, to] page-time spans where consecutive frames' scrollY differ. The screencast
 *  sends a frame only when the screen changes, so a long gap before a moved frame counts its last 150 ms. */
const MOVING = (() => {
  const out = [];
  const fr = SC.frames ?? [];
  for (let k = 1; k < fr.length; k++) {
    if (Math.abs((fr[k].y ?? 0) - (fr[k - 1].y ?? 0)) < 1) continue;
    const from = Math.max(fr[k - 1].t, fr[k].t - 150);
    const last = out.at(-1);
    if (last && from <= last[1] + 1) last[1] = fr[k].t;
    else out.push([from, fr[k].t]);
  }
  return out;
})();
/** The scroll a scrub star needs inside a clip to count there (px). */
const MIN_SCRUB_PX = 12;
/** A scrub star performs only while the page moves inside its window: its own interval cut to MOVING. */
const performing = (i) =>
  i.kind !== "scrub"
    ? [i]
    : MOVING.filter(([a, b]) => b > i.from && a < i.to).map(([a, b]) => ({ ...i, from: Math.max(a, i.from), to: Math.min(b, i.to) }));
function starIntervals(log) {
  const out = [];
  let own = null;
  const holds = new Map();
  for (const e of log ?? []) {
    if (e.ev === "own") {
      if (own) own.to = e.t;
      own = { id: e.id, w: e.weight ?? 0, how: "scroll", kind: e.how === "live" ? "live" : "scrub", from: e.t, to: null };
      out.push(own);
    } else if (e.ev === "free") {
      if (own) own.to = e.t;
      own = null;
    } else if (e.ev === "grant") {
      const h = { id: e.id, w: e.weight ?? 0, how: "time", from: e.t, to: null };
      holds.set(e.id, h);
      out.push(h);
    } else if (e.ev === "end" || e.ev === "release") {
      const h = holds.get(e.id);
      if (h) h.to = e.t;
      holds.delete(e.id);
    } else if (e.ev === "off") {
      if (own) own.to = e.t;
      own = null;
      for (const h of holds.values()) h.to = e.t;
      holds.clear();
    }
  }
  for (const i of out) if (i.to == null) i.to = Math.max(i.from, T_END);
  return out.flatMap(performing);
}
const STARS = starIntervals(SC.spotlight);
/** Declared scroll stars that never owned the spotlight in THIS run (not registered, or never reached). */
const OWNED = new Set((SC.spotlight ?? []).filter((e) => e.ev === "own").map((e) => e.id));
const UNREGISTERED = new Set([...DECLARED_SCROLL].filter((id) => !OWNED.has(id)));
/** Declared scroll stars whose DOM box crosses the middle 60 % of the viewport at scrollY y (the spotlight's
 *  own ownership rule, applied to the declared beats; a beat on a sticky child rides its box). */
const geoScrollStars = (g, y) => {
  const b0 = y + 0.2 * g.vh;
  const b1 = y + 0.8 * g.vh;
  return [...new Set(g.beats.filter((b) => b.star && DECLARED_SCROLL.has(b.id) && Math.min(b.bottom, b1) - Math.max(b.top, b0) > 0).map((b) => b.id))];
};

/** Time (ms) inside [a, b) during which two or more intervals are active. */
function overlapMs(list, a, b) {
  const ev = [];
  for (const i of list) {
    const s = Math.max(i.from, a);
    const e = Math.min(i.to, b);
    if (e > s) ev.push([s, 1], [e, -1]);
  }
  ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let n = 0;
  let t = a;
  let ms = 0;
  for (const [at, d] of ev) {
    if (n >= 2) ms += at - t;
    t = at;
    n += d;
  }
  return Math.round(ms);
}

/** Max number of intervals active at one instant inside [a, b). */
function maxConcurrent(list, a, b) {
  const ev = [];
  for (const i of list) {
    const s = Math.max(i.from, a);
    const e = Math.min(i.to, b);
    if (e > s) ev.push([s, 1], [e, -1]);
  }
  ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let n = 0;
  let m = 0;
  for (const [, d] of ev) m = Math.max(m, (n += d));
  return m;
}

/* — timeline helpers ————————————————————————————————————————————————————— */
const frames = SC.frames;
const frameAt = (t) => {
  let lo = 0;
  let hi = frames.length - 1;
  if (!frames.length) return null;
  if (t <= frames[0].t) return frames[0];
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo];
};
const geoAt = (t) => {
  let g = SC.geo[0];
  for (const x of SC.geo) if (x.t <= t) g = x;
  return g;
};
const rowsCache = new Map();
const rowsAt = (t) => {
  const g = geoAt(t);
  if (!rowsCache.has(g)) rowsCache.set(g, rowsFor(g));
  return rowsCache.get(g);
};
const breathsCache = new Map();
const breathsAt = (t) => {
  const g = geoAt(t);
  if (!breathsCache.has(g)) breathsCache.set(g, breathsFor(g));
  return breathsCache.get(g);
};
const sectionAt = (g, y) => {
  const mid = y + g.vh / 2;
  let best = null;
  for (const s of g.items) if (s.top <= mid && mid < s.top + s.h && (!best || s.h < best.h)) best = s;
  return best ? best.id : "-";
};
const marks = Object.fromEntries((SC.marks ?? []).filter((m) => m.name.startsWith("intro:")).map((m) => [m.name.slice(6), m.t]));
const quietEnd = (SC.events ?? []).find((e) => e.k === "intro:quiet-end")?.t ?? null;
function introPhase(t) {
  if (SC.meta.intro !== "play" || !marks.ready) return null;
  if (t >= (quietEnd ?? marks["titles-end"] ?? Infinity)) return null;
  if (marks["titles-end"] != null && t >= marks["titles-end"]) return "quiet";
  if (marks.titles != null && t >= marks.titles) return "titles";
  if (marks.reveal != null && t >= marks.reveal) return "reveal";
  if (marks.hold != null && t >= marks.hold) return "hold";
  if (marks.flight != null && t >= marks.flight) return "flight";
  return "play-screen";
}
const q = (arr, p) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};
const r1 = (v) => (v == null ? null : Math.round(v * 10) / 10);

/* — build the clips —————————————————————————————————————————————————————— */
const T0 = flags.from === "scroll" ? SC.tScroll : Math.max(SC.tStart, frames[0]?.t ?? SC.tStart);
const T1 = Math.min(SC.tEnd, frames.at(-1)?.t ?? SC.tEnd);
const N = Math.max(0, Math.floor((T1 - T0) / (CLIP_S * 1000)));
const clips = [];
for (let i = 0; i < N; i++) {
  const a = T0 + i * CLIP_S * 1000;
  const b = a + CLIP_S * 1000;
  const picks = [0.125, 0.375, 0.625, 0.875].map((f) => frameAt(a + f * (b - a)));
  const ys = picks.map((f) => f?.y ?? 0);
  const y = frameAt((a + b) / 2)?.y ?? 0;
  const g = geoAt((a + b) / 2);
  const rows = rowsAt((a + b) / 2);
  const intro = introPhase((a + b) / 2);
  const row = intro ? null : rows.find((r) => r.from <= y && y < r.to) ?? null;
  const rest = intro ? null : breathsAt((a + b) / 2).find((r) => r.from <= y && y < r.to) ?? null;
  // a scrub star counts in this clip only if the page moved ≥ 12 px while it performed in it (a Lenis
  // settle of a few px moves nothing the eye can see in four frames)
  const movedIn = (s) => Math.abs((frameAt(Math.min(s.to, b))?.y ?? 0) - (frameAt(Math.max(s.from, a))?.y ?? 0));
  const active = STARS.filter((s) => s.from < b && s.to > a && (s.kind !== "scrub" || movedIn(s) >= MIN_SCRUB_PX));
  const ids = [...new Map(active.map((s) => [s.id, { id: s.id, w: s.w, how: s.how }])).values()];
  const mc = maxConcurrent(active, a, b);
  const raf = SC.raf.filter((s) => s[0] >= a && s[0] < b).map((s) => s[1]);
  const sum = raf.reduce((x, d) => x + d, 0);
  const skips = (SC.spotlight ?? []).filter((e) => e.ev === "skip" && e.t >= a && e.t < b).map((e) => `${e.id} (${e.why})`);
  const geoIds = intro ? [] : geoScrollStars(g, y);
  const unreg = geoIds.filter((id) => UNREGISTERED.has(id) && !ids.some((s) => s.id === id));
  clips.push({
    i: i + 1,
    t: r1((a - T0) / 1000),
    tPage: Math.round(a),
    y,
    yRange: [Math.min(...ys), Math.max(...ys)],
    section: sectionAt(g, y),
    intro,
    screen: Math.floor(y / g.vh) + 1,
    stars: ids,
    maxConcurrent: mc,
    overlapMs: mc >= 2 ? overlapMs(active, a, b) : 0,
    distinct: ids.length,
    geoScroll: geoIds,
    unregistered: unreg,
    withDeclared: mc + unreg.length,
    skips,
    row: row?.row ?? null,
    rowStars: row ? row.stars.map((s) => `${s.id} w${s.w}`) : [],
    breath: rest ? `after ${rest.after}` : null,
    frames: picks.map((f) => f?.file ?? null),
    fps: sum ? r1((1000 * raf.length) / sum) : null,
    p95: r1(q(raf, 0.95)),
    maxDt: raf.length ? r1(Math.max(...raf)) : null,
    loaf50: SC.loaf.filter((l) => l.t >= a && l.t < b && l.dur > 50).length,
    loafWork50: SC.loaf.filter((l) => l.t >= a && l.t < b && l.work > 50).length,
  });
}

/* — totals (the automated J1 numbers for this run) ————————————————————————————— */
const pageClips = clips.filter((c) => !c.intro);
const pct = (n, d) => (d ? Math.round((1000 * n) / d) / 10 : null);
const one = pageClips.filter((c) => c.maxConcurrent === 1).length;
const two = pageClips.filter((c) => c.maxConcurrent >= 2);
const none = pageClips.filter((c) => c.maxConcurrent === 0);
const noneOut = none.filter((c) => !c.breath);
const totals = {
  clips: clips.length,
  introClips: clips.length - pageClips.length,
  pageClips: pageClips.length,
  exactlyOne: one,
  exactlyOnePct: pct(one, pageClips.length),
  twoPlus: two.length,
  twoPlusClips: two.map((c) => ({ i: c.i, t: c.t, y: c.y, stars: c.stars.map((s) => s.id), overlapMs: c.overlapMs })),
  twoPlusOver100ms: two.filter((c) => c.overlapMs >= 100).length,
  none: none.length,
  noneInBreath: none.length - noneOut.length,
  noneOutsideBreath: noneOut.length,
  noneOutsideBreathPct: pct(noneOut.length, pageClips.length),
  noneOutsideBreathBySection: Object.entries(noneOut.reduce((m, c) => ((m[c.section] = (m[c.section] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]),
  distinctTwoPlus: pageClips.filter((c) => c.distinct >= 2).length,
  unregisteredScrollStars: [...UNREGISTERED].filter((id) => pageClips.some((c) => c.unregistered.includes(id))),
  withDeclared: (() => {
    const o = pageClips.filter((c) => c.withDeclared === 1).length;
    const t = pageClips.filter((c) => c.withDeclared >= 2);
    const z = pageClips.filter((c) => c.withDeclared === 0 && !c.breath).length;
    return {
      note: "the spotlight's stars plus declared scroll stars that never registered with it in this run, counted while their box crosses the middle 60 %",
      exactlyOne: o,
      exactlyOnePct: pct(o, pageClips.length),
      twoPlus: t.length,
      twoPlusClips: t.map((c) => ({ i: c.i, t: c.t, y: c.y, stars: [...c.stars.map((s) => s.id), ...c.unregistered] })),
      noneOutsideBreath: z,
    };
  })(),
  starsSeen: [...new Set(STARS.map((s) => s.id))].length,
  breaths: breathsFor(SC.geo.at(-1)),
};

/* — images ——————————————————————————————————————————————————————————————— */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const labelOf = (c) => {
  const mm = `${Math.floor(c.t / 60)}:${String(Math.floor(c.t % 60)).padStart(2, "0")}`;
  if (PLAIN) return { left: `#${c.i} ${mm}`, right: c.intro ? "opening" : `screen ${c.screen}`, alert: false };
  const unreg = c.unregistered.length ? ` (+${c.unregistered.join(" ")} unreg.)` : "";
  const stars = (c.stars.length ? c.stars.map((s) => `★${s.id}·w${s.w}`).join(" ") : "no star") + unreg;
  const flag = c.intro ? `intro: ${c.intro}` : c.maxConcurrent >= 2 ? "2+ AT ONCE" : c.maxConcurrent === 0 ? (c.breath ? `breath ${c.breath}` : "NO STAR") : c.breath ? `breath ${c.breath}` : "";
  const right = c.stars.length || c.unregistered.length || !flag ? `${stars}${flag ? " | " + flag : ""}` : flag;
  return { left: `#${c.i} ${mm} y${c.y} ${c.section}`, right, alert: !c.intro && (c.maxConcurrent >= 2 || (c.maxConcurrent === 0 && !c.breath)) };
};
const labelSvg = (w, h, c, size) => {
  const L = labelOf(c);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${L.alert ? "#5a1d1d" : "#1d1d1d"}"/>` +
      `<text x="4" y="${h - 5}" font-family="DejaVu Sans" font-size="${size}" fill="#f2f2f2">${esc(L.left)}</text>` +
      `<text x="${w - 4}" y="${h - 5}" text-anchor="end" font-family="DejaVu Sans" font-size="${size}" fill="${L.alert ? "#ffd2c2" : "#ffe08a"}">${esc(L.right)}</text></svg>`,
  );
};
const thumb = async (file, w, h) =>
  file && fs.existsSync(path.join(FRAMES, file))
    ? sharp(path.join(FRAMES, file)).resize(w, h, { fit: "fill" }).toBuffer()
    : sharp({ create: { width: w, height: h, channels: 3, background: "#000" } }).png().toBuffer();

async function clipBlock(c, tw, th, labelH, gap, fontSize) {
  const w = tw * 4 + gap * 3;
  const comp = [{ input: labelSvg(w, labelH, c, fontSize), left: 0, top: 0 }];
  for (let k = 0; k < 4; k++) comp.push({ input: await thumb(c.frames[k], tw, th), left: k * (tw + gap), top: labelH });
  return { w, h: labelH + th, comp };
}

const sheetsDir = path.join(DIR, `sheets${NAME}`);
fs.rmSync(sheetsDir, { recursive: true, force: true });
fs.mkdirSync(sheetsDir, { recursive: true });
const COLS = 2;
const GAP = 6;
const blockW = Math.floor((SHEET_W - (COLS + 1) * GAP) / COLS);
const TW = Math.floor((blockW - 3 * 2) / 4);
const TH = Math.round((TW * VWH) / VWW);
const LABEL = 18;
const HEAD = 24;
const nSheets = Math.ceil(clips.length / PER_SHEET);
const title = flags.label ?? (PLAIN ? `${SC.meta.profile} · ${SC.meta.viewport}` : `${SC.meta.profile} · ${SC.meta.viewport} · ${SC.meta.browserMode}`);
const sheets = [];
for (let s = 0; s < nSheets; s++) {
  const part = clips.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const rows = Math.ceil(part.length / COLS);
  const H = HEAD + GAP + rows * (LABEL + TH + GAP);
  const comp = [
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_W}" height="${HEAD}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="17" font-family="DejaVu Sans" font-size="14" fill="#fff">${esc(
          `${title} · clips ${part[0].i}–${part.at(-1).i} of ${clips.length} (${CLIP_S} s each; 4 frames at 1/8 3/8 5/8 7/8) · sheet ${s + 1}/${nSheets}`,
        )}</text></svg>`,
      ),
      left: 0,
      top: 0,
    },
  ];
  for (let k = 0; k < part.length; k++) {
    const col = k % COLS;
    const row = Math.floor(k / COLS);
    const blk = await clipBlock(part[k], TW, TH, LABEL, 2, 12);
    const left = GAP + col * (blockW + GAP);
    const top = HEAD + GAP + row * (LABEL + TH + GAP);
    for (const c of blk.comp) comp.push({ ...c, left: left + c.left, top: top + c.top });
  }
  const file = path.join(sheetsDir, `sheet-${String(s + 1).padStart(2, "0")}.jpg`);
  await sharp({ create: { width: SHEET_W, height: H, channels: 3, background: "#000" } }).composite(comp).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(file);
  sheets.push(path.basename(file));
}

if (STRIPS && !PLAIN) {
  const stripDir = path.join(RAW, "clips");
  fs.rmSync(stripDir, { recursive: true, force: true });
  fs.mkdirSync(stripDir, { recursive: true });
  const tw = Math.floor((STRIP_W - 3 * 4) / 4);
  const th = Math.round((tw * VWH) / VWW);
  for (const c of clips) {
    const blk = await clipBlock(c, tw, th, 24, 4, 15);
    await sharp({ create: { width: blk.w, height: blk.h, channels: 3, background: "#000" } })
      .composite(blk.comp)
      .jpeg({ quality: 75, mozjpeg: true })
      .toFile(path.join(stripDir, `clip-${String(c.i).padStart(4, "0")}.jpg`));
  }
}

const out = {
  meta: {
    tool: "tools/capture/clips.mjs",
    source: path.relative(ROOT, path.join(DIR, "screencast.json")),
    profile: SC.meta.profile,
    viewport: SC.meta.viewport,
    browserMode: SC.meta.browserMode,
    clipS: CLIP_S,
    from: flags.from === "scroll" ? "first scroll input" : "recording start",
    sheets: sheets.map((f) => `sheets${NAME}/${f}`),
    plain: PLAIN,
    strips: STRIPS ? path.relative(ROOT, path.join(RAW, "clips")) + " (local only)" : null,
    definitions: {
      stars: "spotlight log (?debug=spotlight): scroll star own → next own/free, counted only while the page moves (frames' scrollY changes) unless the log says how: live; time star grant → end/release",
      maxConcurrent: "most stars active at one instant inside the clip (the O.4 bar counts this)",
      overlapMs: "how long two or more stars are active together inside the clip (context for a 2+ clip)",
      unregistered: "declared scroll stars (lib/page.ts, lib/film.ts) that never owned the spotlight in this run, listed while their box crosses the middle 60 % (shown as '(+id unreg.)'; totals.withDeclared counts them)",
      distinct: "stars seen anywhere in the clip (a hand-off inside one second lists two in sequence)",
      breath: "the clip's scrollY lies in the viewport after a weight-3 star (lib/beats.ts BREATHS; a card's set piece from the end of its (b)), placed on this run's geometry",
      intro: "the prologue (play screen → titles → quiet window), outside the page rules; excluded from the page totals",
    },
  },
  totals,
  rows: rowsFor(SC.geo.at(-1)).map(({ row, from, to, breath, stars }) => ({ row, from, to, breath, stars: stars.map((s) => s.id) })),
  clips,
};
fs.writeFileSync(path.join(DIR, `clips${NAME}.json`), JSON.stringify(out, null, 1));
console.log(
  `clips: ${clips.length} clips (${totals.introClips} intro) → ${sheets.length} sheet(s); page clips: exactly one star ${totals.exactlyOne} (${totals.exactlyOnePct} %), 2+ at once ${totals.twoPlus}, none ${totals.none} (outside a declared breath ${totals.noneOutsideBreath}); ${path.relative(ROOT, path.join(DIR, `clips${NAME}.json`))}`,
);
