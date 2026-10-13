// Direct check: what Pause costs on the main thread (W2: Lenis gone in 2 ms, audio suspended in 4 ms).
// At several scroll positions: click the Pause toggle in-page, time until window.__lenis is gone (2 ms poll),
// and list the LoAFs around the click with their script attribution.
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const BASE = process.argv[4] || "http://localhost:3161";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.addInitScript(() => {
    window.__loafs = [];
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__loafs.push({ t: Math.round(e.startTime), dur: Math.round(e.duration), block: Math.round(e.blockingDuration), work: Math.round((e.renderStart || e.startTime + e.duration) - e.startTime), style: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: e.scripts.map((s) => ({ d: Math.round(s.duration), inv: s.invoker, src: (s.sourceURL || "").split("/").pop(), fn: s.sourceFunctionName, fsl: Math.round(s.forcedStyleAndLayoutDuration) })) });
      }).observe({ type: "long-animation-frame", buffered: true });
    } catch {}
  });
  await p.goto(BASE + "/?skip=intro", { waitUntil: "load" });
  await p.waitForFunction(() => !!window.__lenis, null, { timeout: 15000 }).catch(() => {});
  await sleep(3000);
  for (const at of ["top", "work", "kill-list", "contact"]) {
    await p.evaluate((id) => { const el = id === "top" ? null : document.getElementById(id); window.__lenis?.scrollTo(el ? el.getBoundingClientRect().top + scrollY : 0, { immediate: true, force: true }); }, at);
    await sleep(2500);
    const r = await p.evaluate(() => new Promise((res) => {
      const t0 = performance.now();
      window.__loafs.length = 0;
      document.querySelector("header [data-motion-toggle]").click();
      const t1 = performance.now();
      const f = () => {
        const ms = performance.now() - t0;
        if (!window.__lenis) res({ lenisGoneMs: Math.round(ms), clickHandlerMs: Math.round(t1 - t0), t0: Math.round(t0) });
        else if (ms > 2000) res({ lenisGoneMs: null, clickHandlerMs: Math.round(t1 - t0) });
        else setTimeout(f, 2);
      };
      f();
    }));
    await sleep(800);
    const loafs = await p.evaluate((t0) => window.__loafs.filter((l) => l.t + l.dur >= t0 - 5 && l.t <= t0 + 800), r.t0 ?? 0);
    console.log(W, at, JSON.stringify(r));
    for (const l of loafs.slice(0, 4)) console.log("   loaf", JSON.stringify(l).slice(0, 700));
    await p.evaluate(() => document.querySelector("header [data-motion-toggle]").click());
    await p.waitForFunction(() => !!window.__lenis, null, { timeout: 8000 }).catch(() => {});
    await sleep(1500);
  }
  await b.close();
})();
