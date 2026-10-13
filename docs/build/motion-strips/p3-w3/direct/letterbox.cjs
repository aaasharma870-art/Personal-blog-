// Direct check: the films head letterbox close (LIGHTS close: frame top 125% → 85% of the viewport).
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto("http://localhost:3161/?skip=intro", { waitUntil: "load" });
  await p.waitForFunction(() => !!window.__lenis, null, { timeout: 15000 });
  // walk the page once so lazy content settles
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 1500) { await p.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), y); await p.waitForTimeout(60); }
  const out = [];
  for (const k of (process.argv[4] ? process.argv[4].split(",").map(Number) : [1.3, 1.2, 1.1, 1.0, 0.95, 0.9, 0.87, 0.85, 0.8, 0.7, 0.5])) {
    const top = await p.evaluate(() => { const r = document.querySelector("[data-films-frame]").getBoundingClientRect(); return r.top + scrollY; });
    await p.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), top - k * H);
    await p.waitForTimeout(250);
    const read = () => p.evaluate(() => {
      const bar = document.querySelector('.letterbox-bar[data-bar="top"]');
      const fr = document.querySelector("[data-films-frame]").getBoundingClientRect();
      return { frameTopVh: +(fr.top / innerHeight).toFixed(3), attr: document.documentElement.hasAttribute("data-letterbox"), transform: bar?.style.transform ?? null };
    });
    const r = await read();
    await p.waitForTimeout(700);
    const r2 = await read();
    out.push({ k, ...r, later: r2.transform, laterTop: r2.frameTopVh });
  }
  for (const o of out) console.log(W, JSON.stringify(o));
  await b.close();
})();
