// tools/capture/probes/aa-scrim.mjs: text contrast over the stage scrims (backdrop mode).
// Owner: B1-STAGE (PHASE3-PLAN §4.7; spec §3.2 "the AA probe", §13 P3-2 #4).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`.
//
// For every `.stage-backdrop` (about, the act-1 program block, credits …) at 1440×900 and
// 1024×768 (`--widths=1440x900,1024x768` overrides; `--step=0.5` viewports between samples):
//   1. scroll (native, ?skip=intro,smooth) through the section in steps, so every cue (and a
//      playing loop, when one is registered) passes under the text;
//   2. at each step wait for the stage to mark the section live (html[data-stage="live"] and
//      the frame's [data-stage-on]); sections the stage is not showing are opaque = today's;
//   3. collect every visible text box inside the section (text-node client rects; aria-hidden
//      decorative ink is incidental and skipped) and its rendered colour (painted through a
//      1×1 canvas, so oklab / color-mix resolve);
//   4. screenshot with the section's text made transparent: the pixels under each box are
//      exactly what the text sits on (plate + scrim + ground); find the brightest and the
//      darkest pixel under it and take the worse contrast;
//   (text that is not rendered, e.g. a closed <details>, is skipped; --aa-open opens every collapse first;
//   text mid-entrance — inside [data-words-state] or [data-reveal="armed"] once ≤ 4 s have not settled
//   it — is reported as `transient`, not failed: the words probe checks no title is left armed)
//   5. threshold 4.5:1, or 3:1 for large text (≥ 24 px, or ≥ 18.66 px at weight ≥ 700).
// pass = no box under its threshold at any step; `live: false` sections are reported, not failed
// (the stage never showed them, so they rendered opaque as today): every non-live box under its
// threshold is listed as a WARNING with its coordinates (P3-11 r3, J9 F7: a 1.67:1 sample on About's
// "Process over outcome", 1024, RM, was dropped silently).
// KILL-LIST (P3-11 r3, J9 F7): the lens-dimmed rows of #kill-list (every row but the one the lens holds,
// aria-current) are sampled the same way at three scroll positions per width; their text under
// threshold fails (research data stays readable in every state).
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  sharp = null;
}

const HIDE_TEXT_ID = "aa-scrim-hide-text";

function lum([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Text boxes inside `scope` elements (default `.stage-backdrop`) that are on screen. Runs in the page.
 *  `kill`: the kill-list rows (each box says whether its row is the lens's, `dim` = not). */
function collectBoxes({ scope = ".stage-backdrop", kill = false } = {}) {
  const vh = innerHeight;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const g = cv.getContext("2d", { willReadFrequently: true });
  const rgb = (css) => {
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = "#000";
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  // boxes under the fixed header are not on show (the header covers them)
  const head = document.querySelector("body header")?.getBoundingClientRect().bottom ?? 0;
  const out = [];
  document.querySelectorAll(scope).forEach((sec) => {
    const frame = kill ? sec : sec.closest("[data-stage-on]");
    const item = kill ? "kill-list" : sec.closest("[data-section]")?.getAttribute("data-section") ?? sec.id ?? "?";
    const dim = kill ? !sec.querySelector('[aria-current="true"]') : undefined;
    const w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      // decorative ink (aria-hidden: the ghost "•" separators, motifs) is incidental text
      if (!el || el.closest('[aria-hidden="true"]')) continue;
      // not rendered (a CLOSED <details>' content: content-visibility hidden still has client rects)
      if (typeof el.checkVisibility === "function" && !el.checkVisibility()) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility !== "visible" || Number(cs.opacity) === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width < 2 || r.height < 2 || r.top < head || r.top >= vh) continue;
        const size = parseFloat(cs.fontSize);
        const weight = Number(cs.fontWeight) || 400;
        out.push({
          item,
          live: kill || (Boolean(frame) && document.documentElement.dataset.stage === "live"),
          ...(kill ? { row: Number(sec.getAttribute("data-row")), dim } : {}),
          text: n.textContent.trim().slice(0, 48),
          x: Math.max(0, Math.floor(r.left)),
          y: Math.max(0, Math.floor(r.top)),
          w: Math.ceil(r.width),
          h: Math.ceil(Math.min(r.bottom, vh) - Math.max(r.top, 0)),
          color: rgb(cs.color),
          large: size >= 24 || (size >= 18.66 && weight >= 700),
          // mid-entrance: a words primitive armed / playing (an in-character title before its spotlight
          // grant), or a Rise block not yet entered: its colour is not the reading state
          transient: Boolean(el.closest('[data-words-state], [data-reveal="armed"]')),
        });
      }
    }
  });
  return out;
}

async function measureAt(page, shotFile, opts = {}) {
  const boxes = await page.evaluate(collectBoxes, opts);
  if (!boxes.length || !sharp) return { boxes: boxes.length, results: [] };
  const scope = opts.scope ?? ".stage-backdrop";
  // the kill-list's aria-hidden decorations drawn OVER the text (the KILLED strike, a hairline in the
  // kill hue) are foreground, not what the text sits on: hidden in the shot
  const over = opts.kill ? `${scope} [aria-hidden="true"] { visibility: hidden !important; }` : "";
  await page.addStyleTag({
    content: `${scope}, ${scope} * { color: transparent !important; transition: none !important; text-shadow: none !important; -webkit-text-stroke: 0 !important; } ${over}`,
  }).then((h) => h.evaluate((el, id) => (el.id = id), HIDE_TEXT_ID));
  const png = await page.screenshot({ type: "png", path: shotFile });
  await page.evaluate((id) => document.getElementById(id)?.remove(), HIDE_TEXT_ID);
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const results = boxes.map((b) => {
    let hi = null;
    let lo = null;
    let hiL = -1;
    let loL = 2;
    const x1 = Math.min(info.width, b.x + b.w);
    const y1 = Math.min(info.height, b.y + b.h);
    for (let y = b.y; y < y1; y += 1) {
      for (let x = b.x; x < x1; x += 1) {
        const p = px(x, y);
        const l = lum(p);
        if (l > hiL) {
          hiL = l;
          hi = p;
        }
        if (l < loL) {
          loL = l;
          lo = p;
        }
      }
    }
    if (!hi || !lo) return { ...b, ratio: null };
    // the text colour over its background (alpha text blends into the darker/brighter pixel)
    const blend = (bg) => b.color.slice(0, 3).map((c, i) => Math.round(c * b.color[3] + bg[i] * (1 - b.color[3])));
    const ratio = Math.min(contrast(blend(hi), hi), contrast(blend(lo), lo));
    return { ...b, ratio: Math.round(ratio * 100) / 100, min: b.large ? 3 : 4.5 };
  });
  return { boxes: boxes.length, results };
}

async function runWidth(page, ctx, vw, step) {
  await page.setViewportSize(vw);
  await ctx.goto("/?skip=intro,smooth");
  await page.waitForTimeout(1500);
  // --aa-open: measure with every collapse OPEN (the text a reader sees after opening it)
  if (ctx.args["aa-open"]) await page.evaluate(() => document.querySelectorAll("details[data-collapse]").forEach((d) => (d.open = true)));
  if (ctx.args["aa-open"]) await page.waitForTimeout(600);
  const sections = await page.evaluate(() =>
    [...document.querySelectorAll(".stage-backdrop")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        item: el.closest("[data-section]")?.getAttribute("data-section") ?? el.id ?? "?",
        top: r.top + scrollY,
        bottom: r.bottom + scrollY,
      };
    }),
  );
  const report = [];
  for (const s of sections) {
    const ys = [];
    for (let y = s.top - vw.height * 0.5; y < s.bottom - vw.height * 0.25; y += vw.height * step) ys.push(Math.max(0, Math.round(y)));
    const failures = [];
    const transient = [];
    const warnings = [];
    let samples = 0;
    let liveSamples = 0;
    let worst = null;
    for (const [i, y] of ys.entries()) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      // the stage marks the section once its plate decoded; the Rise reveals settle (≈ 620 ms)
      await page
        .waitForFunction(
          (item) => document.documentElement.dataset.stage === "live" && document.querySelector(`[data-section="${item}"][data-stage-on], #${CSS.escape(item)}[data-stage-on]`),
          s.item,
          { timeout: 2500 },
        )
        .catch(() => null);
      await page.waitForTimeout(800);
      // let the entrances on screen finish (a title plays once the reader is idle and the spotlight grants it)
      await page
        .waitForFunction(() => {
          const on = (el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
          };
          return ![...document.querySelectorAll('[data-words-state], [data-reveal="armed"]')].some(on);
        }, null, { timeout: 4000 })
        .catch(() => null);
      const m = await measureAt(page, ctx.file(`${vw.width}-${s.item}-${i}.png`));
      samples += 1;
      for (const r of m.results) {
        if (r.item !== s.item || r.ratio === null) continue;
        if (r.live) liveSamples += 1;
        if (!r.transient && (!worst || r.ratio < worst.ratio)) worst = { ratio: r.ratio, text: r.text, y, live: r.live };
        if (r.live && r.ratio < r.min) (r.transient ? transient : failures).push({ y, text: r.text, ratio: r.ratio, min: r.min });
        // not live (the stage never showed the section, e.g. RM): a warning with its coordinates
        else if (!r.live && !r.transient && r.ratio < r.min) warnings.push({ scrollY: y, x: r.x, top: r.y, w: r.w, h: r.h, text: r.text, ratio: r.ratio, min: r.min, shot: `${vw.width}-${s.item}-${i}.png` });
      }
    }
    report.push({
      item: s.item,
      samples,
      liveBoxes: liveSamples,
      worst,
      failures: failures.slice(0, 20),
      failCount: failures.length,
      ...(transient.length ? { transient: transient.slice(0, 10) } : {}),
      ...(warnings.length ? { warnings: warnings.slice(0, 20), warnCount: warnings.length } : {}),
    });
  }
  return report;
}

/** The kill-list's lens-dimmed rows (J9 F7): the list at three reading positions; every row but the
 *  lens's is sampled (`dim`), the lens's row too for reference. */
async function killList(page, ctx, vw) {
  const geo = await page.evaluate(() => {
    const ul = document.querySelector("#kill-list li[data-row]")?.parentElement;
    if (!ul) return null;
    const r = ul.getBoundingClientRect();
    return { top: r.top + scrollY, h: r.height };
  });
  if (!geo) return { found: false, failures: [], failCount: 0 };
  const failures = [];
  let worstDim = null;
  let dimBoxes = 0;
  for (const [i, f] of [0.2, 0.5, 0.8].entries()) {
    await page.evaluate((top) => window.scrollTo(0, top), Math.max(0, Math.round(geo.top + f * geo.h - vw.height / 2)));
    await page.waitForTimeout(1200); // the lens travels to the centre-line row and the rows' colours settle
    const m = await measureAt(page, ctx.file(`${vw.width}-kill-list-${i}.png`), { scope: "#kill-list li[data-row]", kill: true });
    for (const r of m.results) {
      if (r.ratio === null || r.transient) continue;
      if (r.dim) {
        dimBoxes += 1;
        if (!worstDim || r.ratio < worstDim.ratio) worstDim = { ratio: r.ratio, text: r.text, row: r.row };
      }
      if (r.ratio < r.min) failures.push({ at: f, row: r.row, dim: r.dim, text: r.text, ratio: r.ratio, min: r.min, x: r.x, top: r.y });
    }
  }
  return { found: true, dimBoxes, worstDim, failures: failures.slice(0, 20), failCount: failures.length };
}

export default async function probe(page, ctx) {
  if (!sharp) return { pass: false, error: "sharp is not installed (npm i -D sharp)" };
  const widths = (ctx.args.widths ?? "1440x900,1024x768").split(",").map((w) => {
    const [width, height] = w.split("x").map(Number);
    return { width, height };
  });
  const step = Number(ctx.args.step ?? 0.5);
  const out = {};
  let failCount = 0;
  let live = 0;
  let warnCount = 0;
  const kill = {};
  for (const vw of widths) {
    const r = await runWidth(page, ctx, vw, step);
    out[`${vw.width}x${vw.height}`] = r;
    for (const s of r) {
      failCount += s.failCount;
      warnCount += s.warnCount ?? 0;
      live += s.liveBoxes;
    }
    const k = await killList(page, ctx, vw);
    kill[`${vw.width}x${vw.height}`] = k;
    failCount += k.failCount;
  }
  return {
    pass: failCount === 0,
    liveBoxes: live,
    warnCount,
    killList: kill,
    note: live ? undefined : "the stage never went live over a backdrop (not mounted, or no backdrop StageSpec): nothing to judge",
    widths: out,
  };
}
