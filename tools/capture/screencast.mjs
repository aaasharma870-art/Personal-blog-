// tools/capture/screencast.mjs: a person scrolling the page, recorded (P3-11.0 TOOLS; PHASE3-PLAN §11.1).
// Usage: node tools/capture/screencast.mjs [baseUrl] --profile=reader|skimmer|director --vw=<w>x<h> --out=<dir>
//          [--raw=<dir>] [--intro=play|skip] [--limit=<s>] [--headless] [--nth=1] [--quality=72]
//          [--max-width=<px>] [--video=0] [--keep-frames=1] [--seed=<n>] [--rate=250] [--fling=2500]
// baseUrl defaults to http://localhost:3161.
//
// Browser: HEADED Chrome. Without a $DISPLAY it re-runs itself under `xvfb-run -a` (when xvfb-run exists);
// with neither (or --headless) it falls back to Chromium's new headless mode (`channel: "chromium"`). The
// mode is recorded as meta.browserMode ("headed (xvfb-run)", "headed ($DISPLAY)" or "headless=new"). Both use
// SwiftShader (no GPU here), so read absolute frame times as RELATIVE, as with motion.js.
//
// Page: `/?skip=intro&debug=spotlight` (reader with --intro=play: `/?intro=1&debug=spotlight`: the play screen
// for 2.5 s, a click on Play, the flight, the hold and the titles, untouched until `intro:quiet-end`). Lenis is
// ON (never ?skip=smooth): every profile waits for window.__lenis before its first scroll input.
//
// Profiles (input = CDP mouseWheel events, pixel deltas, dispatched without awaiting the renderer's ack, the
// pointer parked in the right gutter so no hover egg fires by accident):
//   reader    ≈ 250 px/s as 50 px notches every 200 ms (Lenis smooths them into a glide); a 2 s pause at each h2
//             (its top above 50 % of the viewport) and at each act card (an act title is an h2 in the card's
//             lower bar: the pause starts at p ≈ .42 and rests near the settle, p .45–.50, between the card's two
//             stars). 2 s on the hero first. ≤ 3 notches in flight, so a slow frame never queues a glide past a pause.
//   skimmer   trackpad flings: 60 Hz pixel deltas at ≈ 2,500 px/s for 0.25 s (±10 %, seeded), then an inertial
//             tail (×0.92 per frame until < 1 px), then a 0.35–0.9 s look; repeated to the end.
//   director  clicks the hero's "Director's cut" button ([data-dc="hero"]) and records until the cut ends
//             (window.__dc false) or --limit (default 720 s). It dwells on stars: judge it on its own axis only.
// Recording: CDP Page.startScreencast (JPEG, ≤ 960 px wide by default) → <raw>/frames/f#####.jpg with each frame's page time and scrollY;
// ffmpeg encodes <raw>/video.mp4 at the frames' real timing (variable frame rate). <raw> defaults to <out>/raw:
// keep it OUT of git (raw video + frames).
// Instrumentation (addInitScript): a rAF loop [t, dt, scrollY] (frame timings), PerformanceObserver
// long-animation-frame (LoAF) and layout-shift, performance marks (intro:*), and a geometry snapshot every 5 s
// (sections + act cards: top/height; pins: top/travel; every [data-beat]: box, star, weight). ?debug=spotlight
// fills window.__spotlight.log ({ t, y, ev, id, weight, why }, t = performance.now()) — the machine-readable
// star record; tools/capture/clips.mjs turns it into stars per 1 s clip.
// Writes <out>/screencast.json (meta, frames, raf, loaf, ls, marks, spotlight, geometry, pauses/flings, errors,
// frame-time summary). Then: node tools/capture/clips.mjs <out> (clips + contact sheets).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
if (flags.help) {
  console.log(fs.readFileSync(SELF, "utf8").split("\nimport ")[0].replace(/^\/\/ ?/gm, ""));
  process.exit(0);
}
const BASE = (argv.find((a) => !a.startsWith("--")) ?? "http://localhost:3161").replace(/\/+$/, "");
const PROFILE = flags.profile ?? "reader";
if (!["reader", "skimmer", "director"].includes(PROFILE)) {
  console.error(`screencast: --profile must be reader, skimmer or director (got "${PROFILE}")`);
  process.exit(2);
}
const vm = /^(\d+)x(\d+)$/.exec(flags.vw ?? "1440x900");
if (!vm) {
  console.error(`screencast: --vw must be WxH (got "${flags.vw}")`);
  process.exit(2);
}
const VW = { width: Number(vm[1]), height: Number(vm[2]) };
if (!flags.out) {
  console.error("screencast: --out=<dir> is required");
  process.exit(2);
}
const OUT = path.resolve(flags.out);
const RAW = path.resolve(flags.raw ?? path.join(OUT, "raw"));
const INTRO = flags.intro ?? (PROFILE === "reader" ? "play" : "skip");
const LIMIT_S = Number(flags.limit ?? (PROFILE === "director" ? 720 : 900));
const NTH = Number(flags.nth ?? 1);
const QUALITY = Number(flags.quality ?? 72);
const MAXW = Number(flags["max-width"] ?? Math.min(960, VW.width));
const VIDEO = flags.video !== "0";
const KEEP_FRAMES = flags["keep-frames"] !== "0";
const RATE = Number(flags.rate ?? 250); // reader px/s
const FLING = Number(flags.fling ?? 2500); // skimmer peak px/s
let seed = Number(flags.seed ?? 20261003);
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* — headed Chrome: re-run under xvfb-run when there is no display —————————————— */
const hasXvfb = () => spawnSync("sh", ["-c", "command -v xvfb-run"], { encoding: "utf8" }).status === 0;
if (!flags.headless && !process.env.DISPLAY && !process.env.SCREENCAST_XVFB && hasXvfb()) {
  const r = spawnSync("xvfb-run", ["-a", "-s", `-screen 0 ${Math.max(1920, VW.width + 64)}x${Math.max(1200, VW.height + 64)}x24`, process.execPath, SELF, ...argv], {
    stdio: "inherit",
    env: { ...process.env, SCREENCAST_XVFB: "1" },
  });
  process.exit(r.status ?? 1);
}
const HEADED = !flags.headless && Boolean(process.env.DISPLAY);
const MODE = HEADED ? (process.env.SCREENCAST_XVFB ? "headed (xvfb-run)" : "headed ($DISPLAY)") : "headless=new";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}

/* — in-page instrumentation ———————————————————————————————————————————————— */
function initScreencast() {
  if (window.top !== window) return;
  const S = (window.__sc = { raf: [], loaf: [], ls: [], geo: [], errors: [], ev: [], timeOrigin: performance.timeOrigin });
  // the page's own milestones (lib/events.ts window CustomEvents)
  for (const k of ["intro:quiet-end", "impact", "transition:meet", "scroll:jump"]) {
    addEventListener(k, (e) => S.ev.push({ k, t: Math.round(performance.now()), y: Math.round(scrollY), d: e.detail && typeof e.detail === "object" ? JSON.stringify(e.detail).slice(0, 120) : e.detail ?? null }));
  }
  let last = 0;
  const tick = (now) => {
    if (last) S.raf.push([Math.round(now * 10) / 10, Math.round((now - last) * 10) / 10, Math.round(scrollY)]);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const scripts = [...(e.scripts || [])].sort((a, b) => b.duration - a.duration);
        const scriptMs = scripts.reduce((a, s) => a + s.duration, 0);
        const end = e.startTime + e.duration;
        const styleLayout = e.styleAndLayoutStart ? end - e.styleAndLayoutStart : 0;
        const top = scripts[0];
        S.loaf.push({
          t: Math.round(e.startTime),
          dur: Math.round(e.duration),
          block: Math.round(e.blockingDuration || 0),
          work: Math.round(Math.min(e.duration, scriptMs + styleLayout)),
          scriptMs: Math.round(scriptMs),
          styleLayout: Math.round(styleLayout),
          y: Math.round(scrollY),
          top: top ? `${String(top.invoker || "").slice(0, 80)} ${String(top.sourceURL || "").split("/").pop()}:${top.sourceCharPosition ?? ""} ${Math.round(top.duration)}ms` : null,
        });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch (e) {
    S.errors.push("loaf: " + e.message);
  }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) S.ls.push({ t: Math.round(e.startTime), v: +e.value.toFixed(5), input: e.hadRecentInput, y: Math.round(scrollY) });
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {
    S.errors.push("ls: " + e.message);
  }
  // geometry: items (sections + act cards), pins, beats; page px at the moment of the snapshot
  S.snap = () => {
    const y0 = scrollY;
    const items = [...document.querySelectorAll("section[id], footer[id], [data-act-card][id]")].map((e) => {
      const r = e.getBoundingClientRect();
      return { id: e.id, top: Math.round(r.top + y0), h: Math.round(r.height) };
    });
    const pins = [...document.querySelectorAll("[data-act-card-pin]")].map((pin) => {
      const st = pin.querySelector(":scope > [data-card-stage]");
      const r = pin.getBoundingClientRect();
      return { kind: pin.getAttribute("data-act-card-pin"), id: pin.closest("[data-act-card]")?.id ?? null, top: Math.round(r.top + y0), travel: st ? pin.offsetHeight - st.offsetHeight : 0 };
    });
    const beats = [...document.querySelectorAll("[data-beat]")]
      .filter((e) => e.getClientRects().length > 0)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return {
          id: e.getAttribute("data-beat"),
          star: e.hasAttribute("data-beat-star"),
          w: Number(e.getAttribute("data-beat-weight")) || 0,
          top: Math.round(r.top + y0),
          bottom: Math.round(r.bottom + y0),
        };
      });
    const g = { t: Math.round(performance.now()), y: Math.round(y0), vh: innerHeight, H: document.documentElement.scrollHeight, items, pins, beats };
    S.geo.push(g);
    return g;
  };
  const start = () => {
    S.snap();
    setInterval(() => S.snap(), 5000);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}

/* — the run ——————————————————————————————————————————————————————————————— */
fs.mkdirSync(OUT, { recursive: true });
const FRAMES = path.join(RAW, "frames");
fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

const launchArgs = ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"];
const browser = await chromium.launch(HEADED ? { headless: false, args: launchArgs } : { headless: true, channel: "chromium", args: launchArgs });
const context = await browser.newContext({ viewport: VW, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await context.addInitScript(initScreencast);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 300)}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text().slice(0, 300)}`);
});
const cdp = await context.newCDPSession(page);

// screencast → JPEG files (page time attached after the run, from the frame's epoch timestamp)
const frames = [];
let seq = 0;
let recording = false;
cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
  cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  if (!recording) return;
  const file = `f${String(seq).padStart(5, "0")}.jpg`;
  fs.writeFileSync(path.join(FRAMES, file), Buffer.from(data, "base64"));
  frames.push({ i: seq++, file, ts: metadata.timestamp ? metadata.timestamp * 1000 : Date.now(), y: Math.round(metadata.scrollOffsetY || 0) });
});
const startRec = async () => {
  recording = true;
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: QUALITY, maxWidth: MAXW, maxHeight: Math.round((MAXW * VW.height) / VW.width), everyNthFrame: NTH });
};
const stopRec = async () => {
  await cdp.send("Page.stopScreencast").catch(() => {});
  await sleep(250);
  recording = false;
};

const perfNow = () => page.evaluate(() => performance.now());
const state = () =>
  page.evaluate(() => ({ y: Math.round(scrollY), end: scrollY + innerHeight >= document.documentElement.scrollHeight - 2, H: document.documentElement.scrollHeight }));
async function settle(timeout = 3000) {
  await page
    .waitForFunction(() => !window.__lenis || window.__lenis.isScrolling === false, null, { timeout, polling: 30 })
    .catch(() => {});
}
const GUTTER = { x: VW.width - 24, y: Math.round(VW.height * 0.6) };
let inflight = 0;
const wheel = (dy) => {
  inflight++;
  return cdp
    .send("Input.dispatchMouseEvent", { type: "mouseWheel", x: GUTTER.x, y: GUTTER.y, deltaX: 0, deltaY: dy })
    .catch(() => {})
    .finally(() => inflight--);
};
const drain = async () => {
  while (inflight > 0) await sleep(10);
};

/** The next pause target for the reader: an h2 whose top has reached 50 % of the viewport (outside the act
 *  cards), or an act card whose p has reached .46. `done` = keys already paused at. */
const nextPause = (done) =>
  page.evaluate((done) => {
    const vh = innerHeight;
    const seen = new Set(done);
    for (const pin of document.querySelectorAll("[data-act-card-pin]")) {
      const st = pin.querySelector(":scope > [data-card-stage]");
      if (!st) continue;
      const travel = pin.offsetHeight - st.offsetHeight;
      const top = pin.getBoundingClientRect().top + scrollY;
      const p = travel > 0 ? (scrollY - top) / travel : -1;
      const key = `card:${pin.getAttribute("data-act-card-pin")}`;
      if (!seen.has(key) && p >= 0.42 && p < 0.9) return { key, p: +p.toFixed(3), y: Math.round(scrollY) };
    }
    for (const h of document.querySelectorAll("h2")) {
      if (h.closest("[data-act-card]") || h.closest('[aria-hidden="true"]')) continue; // an aria-hidden duplicate is the same heading
      const r = h.getBoundingClientRect();
      if (r.height < 8 || r.width < 8) continue;
      if (typeof h.checkVisibility === "function" && !h.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const sec = h.closest("section[id], footer[id]")?.id ?? "-";
      const key = `h2:${sec}:${(h.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48)}`;
      if (seen.has(key)) continue;
      if (r.top <= vh * 0.5 && r.bottom > vh * 0.05) return { key, top: Math.round(r.top), y: Math.round(scrollY) };
    }
    return null;
  }, done);

async function reader(t0wall) {
  const pauses = [];
  const done = [];
  await page.mouse.move(GUTTER.x, GUTTER.y);
  // a look at the hero first
  pauses.push({ key: "hero", y: (await state()).y, at: Date.now() - t0wall });
  await sleep(2000);
  const NOTCH_MS = 200;
  const dy = Math.round((RATE * NOTCH_MS) / 1000);
  let next = Date.now();
  let tick = 0;
  let endTicks = 0;
  let still = 0;
  let lastY = -1;
  while (Date.now() - t0wall < LIMIT_S * 1000) {
    {
      const hit = await nextPause(done);
      if (hit) {
        await drain();
        await settle();
        done.push(hit.key);
        const at = Date.now() - t0wall;
        pauses.push({ ...hit, yRest: (await state()).y, at });
        await sleep(2000);
        next = Date.now();
        continue;
      }
      const st = await state();
      if (st.end) {
        if (++endTicks >= 6) break;
      } else endTicks = 0;
      if (st.y === lastY && !st.end) {
        if (++still > 60) {
          console.error(`  reader: scroll stuck at y=${st.y}`);
          break;
        }
      } else still = 0;
      lastY = st.y;
    }
    if (inflight < 3) void wheel(dy);
    tick++;
    next += NOTCH_MS;
    const w = next - Date.now();
    if (w > 0) await sleep(w);
    else next = Date.now();
  }
  await drain();
  await settle();
  return { pauses };
}

async function skimmer(t0wall) {
  const flings = [];
  await page.mouse.move(GUTTER.x, GUTTER.y);
  await sleep(1000);
  let endFlings = 0;
  while (Date.now() - t0wall < LIMIT_S * 1000) {
    const st0 = await state();
    if (st0.end) {
      if (++endFlings >= 2) break;
    }
    const peak = FLING * (0.9 + 0.2 * rnd());
    const f = { at: Date.now() - t0wall, y0: st0.y, peak: Math.round(peak), px: 0, events: 0 };
    const DT = 1000 / 60;
    let v = peak / 60; // px per frame
    let next = Date.now();
    const holdFrames = Math.round(0.25 * 60);
    for (let i = 0; v >= 1; i++) {
      const d = Math.round(v);
      // a fling keeps wall-clock pace: up to 40 events may wait for the renderer, which coalesces queued
      // wheel events into one per frame (a real trackpad on a slow page does the same)
      while (inflight >= 40) await sleep(2);
      void wheel(d);
      f.px += d;
      f.events++;
      if (i >= holdFrames) v *= 0.92;
      next += DT;
      const w = next - Date.now();
      if (w > 0) await sleep(w);
      else next = Date.now();
    }
    await drain();
    f.ms = Date.now() - t0wall - f.at;
    flings.push(f);
    await sleep(350 + Math.round(550 * rnd()));
  }
  await drain();
  await settle(4000);
  return { flings };
}

async function director(t0wall) {
  await page.mouse.move(GUTTER.x, GUTTER.y);
  const btn = page.locator('[data-dc="hero"]').first();
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await btn.click();
  const started = await page
    .waitForFunction(() => window.__dc === true, null, { timeout: 8000 })
    .then(() => true, () => false);
  const samples = [];
  if (!started) return { started, samples };
  await page.mouse.move(GUTTER.x, GUTTER.y); // never over the stop pill; no further input (input stops the cut)
  while (Date.now() - t0wall < LIMIT_S * 1000) {
    await sleep(1000);
    const s = await page.evaluate(() => ({ dc: window.__dc === true, y: Math.round(scrollY), end: scrollY + innerHeight >= document.documentElement.scrollHeight - 2 }));
    samples.push({ at: Date.now() - t0wall, ...s });
    if (!s.dc) break;
  }
  return { started, samples, endedBy: samples.at(-1)?.dc ? "limit" : "cut ended" };
}

/* — go ———————————————————————————————————————————————————————————————————— */
const pathQ = INTRO === "play" ? "/?intro=1&debug=spotlight" : "/?skip=intro&debug=spotlight";
console.log(`screencast: ${PROFILE} ${VW.width}x${VW.height} ${MODE} ${BASE}${pathQ}`);
const t0wall = Date.now();
await page.goto(BASE + pathQ, { waitUntil: "load", timeout: 90000 }).catch((e) => console.error("goto", e.message));
await startRec();
const tStart = await perfNow();
let intro = null;
if (INTRO === "play") {
  const play = page.locator("#intro-play");
  await play.waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
  await sleep(2500); // the play screen (B00)
  await play.click({ timeout: 15000 }).catch(async (e) => {
    console.error("  click #intro-play:", e.message.split("\n")[0]);
  });
  const clickT = await perfNow();
  // untouched until the quiet window ends (the titles end on any input)
  await page
    .waitForFunction(() => window.__sc.ev.some((e) => e.k === "intro:quiet-end"), null, { timeout: 40000, polling: 200 })
    .catch(() => console.error("  intro:quiet-end not seen in 40 s"));
  intro = { clickT: Math.round(clickT), marks: await page.evaluate(() => performance.getEntriesByType("mark").filter((m) => m.name.startsWith("intro:")).map((m) => ({ name: m.name, t: Math.round(m.startTime) }))) };
}
const lenis = await page
  .waitForFunction(() => !!window.__lenis, null, { timeout: 15000, polling: 100 })
  .then(() => true, () => false);
console.log(`  Lenis ${lenis ? "ON" : "NOT RUNNING"}${intro ? `; intro marks ${intro.marks.map((m) => m.name.replace("intro:", "")).join(",")}` : ""}`);
await page.evaluate(() => window.__sc.snap());
const tScroll = await perfNow();
const wall = Date.now();
const drive = PROFILE === "reader" ? await reader(wall) : PROFILE === "skimmer" ? await skimmer(wall) : await director(wall);
await sleep(1500);
const tEnd = await perfNow();
await page.evaluate(() => window.__sc.snap());
await stopRec();

const data = await page.evaluate(() => {
  const S = window.__sc;
  return {
    raf: S.raf,
    loaf: S.loaf,
    ls: S.ls,
    geo: S.geo,
    errors: S.errors,
    timeOrigin: S.timeOrigin,
    spotlight: window.__spotlight ? window.__spotlight.log.slice() : null,
    spotlightState: window.__spotlight ? window.__spotlight.state() : null,
    marks: performance.getEntriesByType("mark").map((m) => ({ name: m.name, t: Math.round(m.startTime) })),
    events: S.ev,
    lenisAtEnd: !!window.__lenis,
    H: document.documentElement.scrollHeight,
  };
});
const version = browser.version();
await browser.close();

// page time for every frame (CDP timestamps are epoch seconds)
for (const f of frames) f.t = Math.round((f.ts - data.timeOrigin) * 10) / 10;
frames.sort((a, b) => a.t - b.t);

/* — frame-time summary (rAF, during the scroll) ————————————————————————————— */
const q = (arr, p) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};
const r1 = (v) => (v == null ? null : Math.round(v * 10) / 10);
function stats(samples) {
  const dts = samples.map((s) => s[1]);
  if (!dts.length) return { frames: 0 };
  const sum = dts.reduce((a, b) => a + b, 0);
  return {
    frames: dts.length,
    fps: r1((1000 * dts.length) / sum),
    p50: r1(q(dts, 0.5)),
    p95: r1(q(dts, 0.95)),
    p99: r1(q(dts, 0.99)),
    over33Pct: r1((100 * dts.filter((d) => d > 33.4).length) / dts.length),
    over50Pct: r1((100 * dts.filter((d) => d > 50).length) / dts.length),
    max: r1(Math.max(...dts)),
  };
}
const during = data.raf.filter((s) => s[0] >= tScroll && s[0] <= tEnd);
const shots = frames.filter((f) => f.t >= tScroll && f.t <= tEnd);
const shotDts = shots.slice(1).map((f, i) => [f.t, f.t - shots[i].t]);
const loafIn = data.loaf.filter((l) => l.t >= tScroll && l.t <= tEnd);
const summary = {
  raf: stats(during),
  screencast: stats(shotDts),
  loaf: { n: loafIn.length, over50: loafIn.filter((l) => l.dur > 50).length, workOver50: loafIn.filter((l) => l.work > 50).length, maxDur: loafIn.reduce((a, l) => Math.max(a, l.dur), 0), maxWork: loafIn.reduce((a, l) => Math.max(a, l.work), 0) },
  cls: +data.ls.filter((s) => !s.input).reduce((a, s) => a + s.v, 0).toFixed(4),
  spotlightEvents: data.spotlight ? data.spotlight.length : null,
};

const report = {
  meta: {
    tool: "tools/capture/screencast.mjs",
    profile: PROFILE,
    viewport: `${VW.width}x${VW.height}`,
    browserMode: MODE,
    chromium: version,
    base: BASE,
    path: pathQ,
    intro: INTRO,
    lenis,
    lenisAtEnd: data.lenisAtEnd,
    date: new Date().toISOString(),
    params: PROFILE === "reader" ? { rate: RATE, notch: Math.round((RATE * 200) / 1000), notchMs: 200, pauseMs: 2000 } : PROFILE === "skimmer" ? { peak: FLING, holdS: 0.25, tail: 0.92, look: "350–900 ms", seed: Number(flags.seed ?? 20261003) } : { limitS: LIMIT_S },
    screencast: { format: "jpeg", quality: QUALITY, maxWidth: MAXW, everyNthFrame: NTH, frames: frames.length },
    raw: path.relative(process.cwd(), RAW),
    note: "Times are page time (performance.now(), ms). tStart = recording start, tScroll = first scroll input, tEnd = the end of the run. SwiftShader raster (no GPU): read frame times as relative.",
  },
  tStart: Math.round(tStart),
  tScroll: Math.round(tScroll),
  tEnd: Math.round(tEnd),
  intro,
  drive,
  summary,
  frames: frames.map(({ i, file, t, y }) => ({ i, file, t, y })),
  raf: data.raf,
  loaf: data.loaf,
  ls: data.ls,
  marks: data.marks,
  events: data.events,
  spotlight: data.spotlight,
  spotlightState: data.spotlightState,
  geo: data.geo,
  pageH: data.H,
  errors: [...errors, ...data.errors],
};
fs.writeFileSync(path.join(OUT, "screencast.json"), JSON.stringify(report));

/* — the video (ffmpeg, the frames' real timing) ———————————————————————————— */
if (VIDEO && frames.length > 1) {
  const list = path.join(RAW, "frames.txt");
  const lines = [];
  for (let k = 0; k < frames.length; k++) {
    const d = k + 1 < frames.length ? Math.max(0.001, (frames[k + 1].t - frames[k].t) / 1000) : 0.1;
    lines.push(`file 'frames/${frames[k].file}'`, `duration ${d.toFixed(4)}`);
  }
  lines.push(`file 'frames/${frames.at(-1).file}'`);
  fs.writeFileSync(list, lines.join("\n") + "\n");
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-fps_mode", "vfr", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-pix_fmt", "yuv420p", path.join(RAW, "video.mp4")],
    { encoding: "utf8" },
  );
  if (r.status !== 0) console.error(`  ffmpeg failed (${r.status}): ${(r.stderr || r.error?.message || "").slice(0, 300)}`);
  else console.log(`  video: ${path.relative(process.cwd(), path.join(RAW, "video.mp4"))}`);
}
if (!KEEP_FRAMES) fs.rmSync(FRAMES, { recursive: true, force: true });

const s = summary;
console.log(
  `  ${frames.length} frames; scroll ${((tEnd - tScroll) / 1000).toFixed(1)} s; rAF ${s.raf.fps} fps p95 ${s.raf.p95} ms >50ms ${s.raf.over50Pct}%; screencast ${s.screencast.fps} fps; LoAF ${s.loaf.n} (${s.loaf.over50} > 50 ms, work > 50: ${s.loaf.workOver50}); CLS ${s.cls}; spotlight events ${s.spotlightEvents}; errors ${report.errors.length}`,
);
console.log(`  → ${path.relative(process.cwd(), path.join(OUT, "screencast.json"))}`);
