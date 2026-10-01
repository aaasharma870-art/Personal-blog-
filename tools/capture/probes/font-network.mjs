// tools/capture/probes/font-network.mjs: world fonts load at ladder step 5, never on phones or first paint.
// Owner: B1-TYPE (PHASE3-PLAN §4.7; PHASE3-SPEC §5.4–5.5, P3-4 #1, #3, #7).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
//
// Font files are identified by CONTENT (sha1 of the response body against
// the repo's files): the film faces under assets/fonts/film/** and
// public/fonts/film/** — "legacy" = the four M2 *-subset.woff2 (phones),
// "name" = the Pirata ASCII+ file, "world" = every other film face; any
// other font is a house face (Geist, Geist Mono, Newsreader).
//
// DESKTOP (ctx.vw, default 1440×900; ctx.path, default /?skip=intro):
//   - the name is preloaded: <link rel=preload as=font media="(min-width: 64rem)">
//     (or the same as a Link header), and the h1 renders in it, mixed case,
//     line-height .96 (P3-4 #1);
//   - before ladder step 5 only the name + house faces were requested
//     (P3-4 #7; the prologue's hp head is the documented exception and
//     does not arise with ?skip=intro);
//   - the legacy subsets are never requested;
//   - after step 5 without scrolling: which worlds loaded (Pirates at the top);
//   - then a slow scroll to the end: every world's faces load, in order;
//   - LCP ≤ --lcp-budget (default 400 ms; 0 = report only); CLS before the
//     scroll ≤ 0.001 (P3-4 #3).
// PHONE (390×844, touch): no world face and no name face, ever (load, idle,
//   full scroll); film bytes ⊆ the legacy subsets (≤ 54,336 B);
//   --mobile-lcp-base=<ms> also checks mobile LCP within ±5%.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LEGACY_BYTES = 54336;

function walk(d) {
  return fs.existsSync(d)
    ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
    : [];
}

/** sha1 → { file, kind: "legacy" | "name" | "world" } for every film face in the repo. */
function filmIndex() {
  const out = new Map();
  for (const abs of [...walk(path.join(ROOT, "assets", "fonts", "film")), ...walk(path.join(ROOT, "public", "fonts", "film"))]) {
    if (!abs.endsWith(".woff2")) continue;
    const rel = path.relative(ROOT, abs);
    const kind = /-subset\.woff2$/.test(rel) ? "legacy" : /pirata-one-ascii\.woff2$/.test(rel) ? "name" : "world";
    out.set(crypto.createHash("sha1").update(fs.readFileSync(abs)).digest("hex"), { file: rel, kind });
  }
  return out;
}

const INIT = () => {
  const p = (window.__fontProbe = { step5: null, lcp: [], cls: 0, shifts: [] });
  addEventListener("ladder:step", (e) => {
    if (e.detail && e.detail.step === 5 && p.step5 === null) p.step5 = performance.now();
  });
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) p.lcp.push({ t: Math.round(e.startTime), el: e.element ? e.element.tagName + (e.element.id ? "#" + e.element.id : "") : "", size: e.size });
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue;
        p.cls += e.value;
        p.shifts.push({ t: Math.round(e.startTime), v: e.value });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {
    /* no observers: LCP / CLS stay empty */
  }
};

/** Record every font response (url → { bytes, sha1 }) on `page`. */
function recordFonts(page) {
  const seen = new Map();
  page.on("response", async (res) => {
    const url = res.url();
    if (res.request().resourceType() !== "font" && !/\.woff2?(\?|$)/.test(url)) return;
    try {
      const body = await res.body();
      seen.set(url, { bytes: body.length, sha1: crypto.createHash("sha1").update(body).digest("hex"), status: res.status() });
    } catch {
      seen.set(url, { bytes: 0, sha1: "", status: res.status() });
    }
  });
  return seen;
}

/** Resource-timing start of every font request (url → ms since navigation). */
const fontTimings = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      performance
        .getEntriesByType("resource")
        .filter((e) => /\.woff2?(\?|$)/.test(e.name))
        .map((e) => [e.name, Math.round(e.startTime)]),
    ),
  );

async function slowScroll(page, sleep) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  for (let y = 0; y < h; y += Math.round(vh * 0.8)) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await sleep(140);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(800);
  await page.evaluate(() => document.fonts.ready);
}

export default async function probe(page, ctx) {
  const index = filmIndex();
  const classify = (seen, timings = {}) =>
    [...seen].map(([url, r]) => {
      const hit = index.get(r.sha1);
      return { url: url.replace(ctx.base, ""), bytes: r.bytes, kind: hit ? hit.kind : "house", file: hit ? hit.file : null, t: timings[url] ?? null };
    });
  const lcpBudget = Number(ctx.args["lcp-budget"] ?? 400);
  const notes = [];

  /* — desktop ————————————————————————————————————————————————————— */
  await page.addInitScript(INIT);
  const seen = recordFonts(page);
  const nav = await ctx.goto();
  const linkHeader = (nav && (await nav.allHeaders())["link"]) || "";
  const head = await page.evaluate(() => {
    const l = document.querySelector('link[rel="preload"][as="font"][href*="pirata-one-ascii"]');
    const h1 = document.querySelector("h1");
    const cs = h1 ? getComputedStyle(h1) : null;
    return {
      preload: l ? { href: l.getAttribute("href"), media: l.getAttribute("media"), type: l.getAttribute("type"), crossorigin: l.getAttribute("crossorigin") } : null,
      h1s: document.querySelectorAll("h1").length,
      h1: cs ? { family: cs.fontFamily, lineHeight: cs.lineHeight, fontSize: cs.fontSize, transform: cs.textTransform, text: h1.textContent } : null,
    };
  });
  const headerPreload = /pirata-one-ascii\.woff2>[^,]*rel=preload[^,]*media="\(min-width: 64rem\)"/.test(linkHeader);
  // wait for ladder step 5 (≤ 15 s), then idle without scrolling
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    if (await page.evaluate(() => window.__fontProbe.step5 !== null)) break;
    await ctx.sleep(200);
  }
  await ctx.sleep(1500);
  await page.evaluate(() => document.fonts.ready);
  const name = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    return h1 ? [...document.fonts].some((f) => f.status === "loaded" && /Film Name Pirates/i.test(f.family)) : false;
  });
  const before = await page.evaluate(() => ({ ...window.__fontProbe }));
  const atRest = classify(seen, await fontTimings(page));
  if (before.step5 === null) notes.push("ladder step 5 never fired within 15 s (ladder stub or stalled): 'before step 5' covers the whole wait");
  const step5 = before.step5 ?? Infinity;
  const early = atRest.filter((f) => f.t !== null && f.t < step5);
  const earlyBad = early.filter((f) => f.kind === "world" || f.kind === "legacy");
  const worldsAtRest = [...new Set(atRest.filter((f) => f.kind === "world").map((f) => f.file))];

  await slowScroll(page, ctx.sleep);
  const all = classify(seen, await fontTimings(page));
  const worldFiles = [...index.values()].filter((v) => v.kind === "world").map((v) => v.file);
  const loadedWorld = new Set(all.filter((f) => f.kind === "world").map((f) => f.file));
  const order = all.filter((f) => f.kind === "world").sort((a, b) => (a.t ?? 0) - (b.t ?? 0)).map((f) => `${f.t} ms ${f.file}`);
  const lcp = before.lcp.at(-1) ?? null;
  const desktop = {
    preload: head.preload,
    preloadOk: (head.preload !== null && head.preload.media === "(min-width: 64rem)") || headerPreload,
    h1s: head.h1s,
    h1: head.h1,
    nameFaceLoaded: name,
    step5: before.step5 === null ? null : Math.round(before.step5),
    beforeStep5: early.map((f) => `${f.t} ms ${f.kind} ${f.file ?? f.url} ${f.bytes} B`),
    beforeStep5Bad: earlyBad.map((f) => f.file),
    legacyRequested: all.filter((f) => f.kind === "legacy").map((f) => f.file),
    worldsAtRest,
    worldOrder: order,
    worldMissingAfterScroll: worldFiles.filter((f) => !loadedWorld.has(f) && !/nothing-you-could-do/.test(f)),
    filmBytes: all.filter((f) => f.kind !== "house").reduce((a, f) => a + f.bytes, 0),
    lcp,
    clsBeforeScroll: Number(before.cls.toFixed(4)),
    shifts: before.shifts,
  };
  if (desktop.worldMissingAfterScroll.length) notes.push("world faces not requested after a full scroll (a world with no laid-out text uses none)");

  /* — phone ———————————————————————————————————————————————————————— */
  const phone = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await phone.addInitScript(INIT);
  const pseen = recordFonts(phone);
  await phone.goto(ctx.url(), { waitUntil: "load" });
  await ctx.sleep(3000);
  const plcp = await phone.evaluate(() => window.__fontProbe.lcp.at(-1) ?? null);
  const pcls = await phone.evaluate(() => window.__fontProbe.cls);
  await slowScroll(phone, ctx.sleep);
  const pall = classify(pseen);
  const legacyBytes = pall.filter((f) => f.kind === "legacy").reduce((a, f) => a + f.bytes, 0);
  const mobileBase = ctx.args["mobile-lcp-base"] ? Number(ctx.args["mobile-lcp-base"]) : null;
  const phoneR = {
    newFonts: pall.filter((f) => f.kind === "world" || f.kind === "name").map((f) => f.file),
    legacy: pall.filter((f) => f.kind === "legacy").map((f) => `${f.file} ${f.bytes} B`),
    legacyBytes,
    house: pall.filter((f) => f.kind === "house").map((f) => `${f.url} ${f.bytes} B`),
    lcp: plcp,
    lcpWithin5pct: mobileBase && plcp ? Math.abs(plcp.t - mobileBase) <= mobileBase * 0.05 : null,
    cls: Number(pcls.toFixed(4)),
  };

  const checks = {
    preload: desktop.preloadOk,
    oneH1: desktop.h1s === 1,
    h1Pirata: Boolean(desktop.h1 && /Film Name Pirates/i.test(desktop.h1.family) && desktop.h1.transform !== "uppercase"),
    nameFaceLoaded: desktop.nameFaceLoaded,
    beforeStep5: desktop.beforeStep5Bad.length === 0,
    noLegacyOnDesktop: desktop.legacyRequested.length === 0,
    desktopLcp: lcpBudget <= 0 || (lcp !== null && lcp.t <= lcpBudget),
    desktopCls: desktop.clsBeforeScroll <= 0.001,
    phoneNoNewFont: phoneR.newFonts.length === 0,
    phoneLegacyBytes: phoneR.legacyBytes <= LEGACY_BYTES,
    phoneLcp: phoneR.lcpWithin5pct !== false,
  };
  return { pass: Object.values(checks).every(Boolean), checks, desktop, phone: phoneR, notes };
}
