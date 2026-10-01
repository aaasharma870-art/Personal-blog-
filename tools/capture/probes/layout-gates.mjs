// tools/capture/probes/layout-gates.mjs: layout differences key only on the boot gate (phones and RM unchanged).
// Owner: B1-STAGE (PHASE3-PLAN §4.7; spec §3.2 "Layout gates", §12.1 CLS, §13 P3-2 #11/#12).
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`.
//
// Four runs (each in its own context):
//   paused-reload  1440×900, sessionStorage "motion" = "paused" before load (a paused view):
//                  the layout read at DOMContentLoaded equals the layout 3 s after load (no
//                  reflow after hydration); no split grid, no stage root, no bars;
//   pause-mid      1440×900, unpaused: scroll into the first split section, record every
//                  section's box, press the header's Pause control, wait 400 ms: every box
//                  identical, scroll position kept, and the layout-shift entries after the
//                  press sum to 0 (hadRecentInput included); the stage's layers hidden and the
//                  sections opaque (no [data-stage-on] left);
//   no-js          1440×900, JavaScript disabled: no split grid, no window, no stage root, no
//                  html.js (so no pinned travel or tail can key on the gate);
//   phone / rm     390×844 touch, and 1440×900 with reduced motion: no split grid, no window,
//                  no stage root, no html[data-stage], no letterbox bars after 4 s.
// z-scale (#12): in the default run, every fixed Phase-3 layer is outside <main> and
// <main> / the credits footer sit at --z-main.
// pass = every run's checks hold.

function layoutSnapshot() {
  const boxes = [...document.querySelectorAll("[data-section] > *, [id^='act-']")].map((el) => {
    const r = el.getBoundingClientRect();
    return [el.id || el.getAttribute("data-world-section") || el.tagName, Math.round(r.top + scrollY), Math.round(r.height)];
  });
  return { height: document.documentElement.scrollHeight, boxes };
}

function gateState() {
  const split = [...document.querySelectorAll(".stage-split")].map((el) => getComputedStyle(el).display);
  const win = [...document.querySelectorAll(".stage-window")].map((el) => getComputedStyle(el).display);
  return {
    js: document.documentElement.classList.contains("js"),
    motionBoot: document.documentElement.getAttribute("data-motion-boot"),
    stage: document.documentElement.getAttribute("data-stage"),
    splitGrid: split.filter((d) => d === "grid").length,
    windowShown: win.filter((d) => d !== "none").length,
    stageRoot: Boolean(document.querySelector("[data-stage-root]")),
    bars: Boolean(document.querySelector(".letterbox")),
    on: document.querySelectorAll("[data-stage-on]").length,
  };
}

function zAudit() {
  const main = document.querySelector("main#main");
  const credits = document.querySelector("footer#credits, body > footer");
  const fixedInMain = main
    ? [...main.querySelectorAll("*")].filter((el) => getComputedStyle(el).position === "fixed").map((el) => el.tagName + (el.id ? `#${el.id}` : ""))
    : ["no main"];
  const z = (el) => (el ? getComputedStyle(el).zIndex : null);
  const layers = [...document.querySelectorAll("[data-stage-layers]")].map((el) => [el.getAttribute("data-stage-layers"), getComputedStyle(el).zIndex]);
  return { mainZ: z(main), creditsZ: z(credits), fixedInMain: fixedInMain.slice(0, 10), layers };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default async function probe(page, ctx) {
  const results = {};

  // paused-reload
  {
    const p = await ctx.newPage({ viewport: { width: 1440, height: 900 } });
    await p.addInitScript(() => {
      try {
        sessionStorage.setItem("motion", "paused");
      } catch {}
    });
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "domcontentloaded" });
    const early = await p.evaluate(layoutSnapshot);
    await p.waitForLoadState("load");
    await p.waitForTimeout(3000);
    const late = await p.evaluate(layoutSnapshot);
    const gate = await p.evaluate(gateState);
    const diff = late.boxes.filter((b, i) => !same(b, early.boxes[i])).slice(0, 10);
    results.pausedReload = {
      gate,
      diff,
      heights: [early.height, late.height],
      ok: diff.length === 0 && gate.splitGrid === 0 && !gate.stageRoot && !gate.bars && gate.motionBoot === "paused",
    };
  }

  // pause-mid
  {
    const p = await ctx.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(ctx.url("/?skip=intro,smooth"), { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const target = await p.evaluate(() => {
      const s = document.querySelector("[data-stage-split]") ?? document.querySelector(".stage-backdrop");
      if (!s) return Math.round(document.documentElement.scrollHeight / 3);
      const r = s.getBoundingClientRect();
      return Math.round(r.top + scrollY + r.height / 3);
    });
    await p.evaluate((y) => window.scrollTo(0, y), target);
    await p.waitForTimeout(2500);
    await p.evaluate(() => {
      window.__shift = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__shift += e.value;
      }).observe({ type: "layout-shift", buffered: false });
    });
    const before = await p.evaluate(layoutSnapshot);
    const gateBefore = await p.evaluate(gateState);
    const y0 = await p.evaluate(() => Math.round(scrollY));
    const button = p.locator('button[aria-label="Pause motion"]').first();
    const found = (await button.count()) > 0;
    if (found) await button.click();
    await p.waitForTimeout(400);
    const after = await p.evaluate(layoutSnapshot);
    const gateAfter = await p.evaluate(gateState);
    const y1 = await p.evaluate(() => Math.round(scrollY));
    const shift = await p.evaluate(() => window.__shift);
    const layersHidden = await p.evaluate(() =>
      [...document.querySelectorAll(".stage-layer, [data-stage-root]")].every((el) => getComputedStyle(el).display === "none"),
    );
    const diff = after.boxes.filter((b, i) => !same(b, before.boxes[i])).slice(0, 10);
    results.pauseMid = {
      pauseControl: found,
      stageWasLive: gateBefore.stage === "live",
      onBefore: gateBefore.on,
      onAfter: gateAfter.on,
      layersHidden,
      scroll: [y0, y1],
      shift,
      diff,
      ok: found && diff.length === 0 && y0 === y1 && shift === 0 && gateAfter.on === 0 && layersHidden,
    };
    results.zScale = { ...(await p.evaluate(zAudit)) };
    results.zScale.ok = results.zScale.mainZ === "1" && results.zScale.creditsZ === "1" && results.zScale.fixedInMain.length === 0;
  }

  // no-js
  {
    const p = await ctx.newPage({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    await p.goto(ctx.url("/"), { waitUntil: "load" });
    const gate = await p.evaluate(gateState);
    results.noJs = { gate, ok: !gate.js && gate.splitGrid === 0 && gate.windowShown === 0 && !gate.stageRoot };
  }

  // phone and reduced motion
  for (const [name, opts] of [
    ["phone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }],
    ["rm", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
  ]) {
    const p = await ctx.newPage(opts);
    await p.goto(ctx.url("/?skip=intro"), { waitUntil: "load" });
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 4));
    await p.waitForTimeout(4000);
    const gate = await p.evaluate(gateState);
    results[name] = { gate, ok: gate.splitGrid === 0 && gate.windowShown === 0 && !gate.stageRoot && !gate.stage && !gate.bars };
  }

  return { pass: Object.values(results).every((r) => r.ok), ...results };
}
