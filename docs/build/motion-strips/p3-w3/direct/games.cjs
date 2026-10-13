// Direct checks for the games probe failures: rows.read on a fresh page, Pause → land latency (in-page clock),
// Dead Eye release over time, and the slow interactions (Event Timing entries > 200 ms, with targets).
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__ev = [];
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (/click|key|pointer/.test(e.name) && e.duration > 200)
          window.__ev.push({ name: e.name, dur: Math.round(e.duration), delay: Math.round(e.processingStart - e.startTime), proc: Math.round(e.processingEnd - e.processingStart), target: e.target ? (e.target.id ? "#" + e.target.id : e.target.tagName + "." + String(e.target.className).split(" ")[0]) : null, t: Math.round(e.startTime) });
      }).observe({ type: "event", durationThreshold: 16, buffered: true });
    } catch {}
  });
  await p.goto("http://localhost:3161/?skip=intro", { waitUntil: "load" });
  await p.evaluate(() => { localStorage.removeItem("aryan:games:v1"); localStorage.removeItem("aryan:hunt:v1"); });
  await p.goto("http://localhost:3161/?skip=intro", { waitUntil: "load" });
  await sleep(2000);
  // 1. rows.read on a fresh page: walk the ledger through the reading line
  await p.evaluate(() => document.getElementById("kill-list")?.scrollIntoView({ block: "start", behavior: "instant" }));
  await sleep(400);
  const h = await p.evaluate(() => document.getElementById("kill-list").offsetHeight);
  for (let y = 0; y < h; y += 60) { await p.mouse.wheel(0, 60); await sleep(60); }
  await sleep(1500);
  const rows = await p.evaluate(() => ({
    rendered: document.querySelectorAll("[data-ledger] li[data-row]").length,
    read: JSON.parse(localStorage.getItem("aryan:hunt:v1") ?? "null")?.rows?.length ?? 0,
  }));
  console.log(W, "rows.read (fresh page, wheel):", JSON.stringify(rows));
  // 2. Pause → landed, in-page clock (3 tries)
  for (let i = 0; i < 3; i++) {
    await p.evaluate(() => document.querySelector("#drone-takeoff")?.closest("[data-band]")?.scrollIntoView({ block: "center", behavior: "instant" }));
    await sleep(600);
    await p.click("#drone-takeoff");
    await p.waitForFunction(() => document.querySelector(".drone-game")?.getAttribute("data-phase") === "flying", null, { timeout: 8000 });
    await sleep(400);
    const r = await p.evaluate(() => new Promise((res) => {
      const g = document.querySelector(".drone-game");
      const t0 = performance.now();
      const mo = new MutationObserver(() => {
        const ph = g.getAttribute("data-phase");
        if (ph === "idle" || ph === "done") { mo.disconnect(); res({ ms: Math.round(performance.now() - t0), phase: ph }); }
      });
      mo.observe(g, { attributes: true, attributeFilter: ["data-phase"] });
      const before = g.getAttribute("data-phase");
      [...document.querySelectorAll("[data-motion-toggle]")].find((b) => b.offsetParent !== null)?.click();
      // the phase read synchronously after the click (the flight lands inside it)
      const sync = g.getAttribute("data-phase");
      if (sync === "idle" || sync === "done") { mo.disconnect(); return res({ ms: Math.round(performance.now() - t0), phase: sync, inClick: true }); }
      window.__dpDebug = { before, sync };
      setTimeout(() => { mo.disconnect(); res({ ms: null, phase: g.getAttribute("data-phase") }); }, 3000);
    }));
    console.log(W, "drone.pause try", i + 1, JSON.stringify({ ...r, ...(await p.evaluate(() => window.__dpDebug ?? {})) }));
    await p.evaluate(() => [...document.querySelectorAll("[data-motion-toggle]")].find((b) => b.offsetParent !== null)?.click());
    await sleep(800);
  }
  // 3. Dead Eye: start, Esc, read the layers at 200 / 600 / 1200 / 2500 ms
  await p.evaluate(() => document.getElementById("kill-list")?.scrollIntoView({ block: "start", behavior: "instant" }));
  await sleep(500);
  // the lens before the round (W3 gate: a round leaves no trace, the lens included)
  const lens = () => p.evaluate(() => {
    const l = document.querySelector("#kill-list [data-lens]");
    return l ? { lens: l.getAttribute("data-lens"), figure: l.querySelector("[data-lens-figure]")?.getAttribute("data-lens-figure") ?? null, y: Math.round(scrollY) } : null;
  });
  await p.mouse.move(8, Math.round(H / 2));
  await sleep(1200);
  const lensBefore = await lens();
  await p.click("#deadeye-call");
  await p.waitForSelector('#kill-list[data-deadeye="on"]', { timeout: 8000 });
  await sleep(800);
  await p.keyboard.press("Escape");
  const t0 = Date.now();
  for (const at of [200, 600, 1200, 2500, 4000]) {
    await sleep(at - (Date.now() - t0));
    const l = await p.evaluate(() => ({
      on: document.getElementById("kill-list").hasAttribute("data-deadeye"),
      layers: [...document.querySelectorAll("#kill-list [data-deadeye-layer]")].map((l) => `${l.getAttribute("data-deadeye-layer")}:${l.hidden ? "hidden" : "shown"}/${l.childElementCount}`),
      game: document.documentElement.getAttribute("data-game"),
    }));
    console.log(W, "de.release +" + at + "ms", JSON.stringify(l));
  }
  // back where the lens was read (the round centres the killed block), no row hovered
  await p.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo({ top: y, behavior: "instant" })), lensBefore?.y ?? 0);
  await p.mouse.move(8, Math.round(H / 2));
  await sleep(1200);
  console.log(W, "de.release lens", JSON.stringify({ before: lensBefore, after: await lens() }));
  console.log(W, "slow interactions (> 200 ms):", JSON.stringify(await p.evaluate(() => window.__ev)));
  await b.close();
})();
