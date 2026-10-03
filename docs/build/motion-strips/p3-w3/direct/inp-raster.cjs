// Direct check (W3 gate, games INP): is the slow Dead Eye interaction main-thread work, or the headless
// software raster (SwiftShader) painting the frame after it?
// For each device scale factor (1, then 0.5: the same CSS layout and the same script, a quarter of the
// pixels to raster), on /?skip=intro at W×H: start a round from the DEAD EYE pill, mark the five killed
// rows, then fire with Shift+Enter. For the pill click and the Fire keydown it reads the Event Timing entry
// (duration = input delay + processing + presentation) and the long animation frames that overlap it
// (script + style/layout = main-thread work). Presentation that shrinks with the pixel count while the
// processing and the work stay flat is raster time, not app work. It also times the games probe's first
// drone pill click (1.5 s after load, the band scrolled to the centre), the probe's worst interaction.
// Usage: node inp-raster.cjs [W] [H] [baseUrl] [runs]   (ANGLE=1: the probe runner's launch flags, SwiftShader GL
// compositing + WebGL, as tools/capture/p3-probes.mjs; default: Playwright's default headless launch)
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const BASE = process.argv[4] || "http://localhost:3161";
const RUNS = Number(process.argv[5] || 2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function observe() {
  window.__ev = [];
  window.__lo = [];
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (!["click", "keydown", "pointerdown"].includes(e.name)) continue;
        window.__ev.push({ name: e.name, t: Math.round(e.startTime), dur: Math.round(e.duration), delay: Math.round(e.processingStart - e.startTime), proc: Math.round(e.processingEnd - e.processingStart), present: Math.round(e.startTime + e.duration - e.processingEnd), target: e.target ? (e.target.id ? "#" + e.target.id : e.target.tagName) : null });
      }
    }).observe({ type: "event", durationThreshold: 16, buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const scripts = [...(e.scripts || [])].reduce((n, s) => n + s.duration, 0);
        const styleLayout = e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0;
        const top = [...(e.scripts || [])].sort((a, b) => b.duration - a.duration).slice(0, 2).map((x) => ({ d: Math.round(x.duration), inv: String(x.invoker || "").slice(0, 60), src: String(x.sourceURL || "").split("/").pop(), fn: x.sourceFunctionName }));
        window.__lo.push({ t: Math.round(e.startTime), end: Math.round(e.startTime + e.duration), dur: Math.round(e.duration), work: Math.round(Math.min(e.duration, scripts + styleLayout)), script: Math.round(scripts), styleLayout: Math.round(styleLayout), top });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
}

async function once(browser, dsf) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
  const p = await ctx.newPage();
  await p.addInitScript(observe);
  await p.goto(`${BASE}/?skip=intro`, { waitUntil: "load" });
  await p.waitForFunction(() => window.__pageHydrated === true, null, { timeout: 15000 }).catch(() => {});
  await sleep(2500);
  await p.evaluate(() => document.getElementById("kill-list")?.scrollIntoView({ block: "start", behavior: "instant" }));
  await sleep(1500);
  // the binder must be in (the pill answers live)
  await p.waitForFunction(() => !window.__enhanceQ, null, { timeout: 10000 }).catch(() => {});
  const t0 = await p.evaluate(() => performance.now());
  await p.click("#deadeye-call");
  await p.waitForSelector('#kill-list[data-deadeye="on"]', { timeout: 8000 });
  await sleep(800);
  await p.evaluate(() => {
    for (const li of document.querySelectorAll('#kill-list li[data-verdict="killed"]')) li.querySelector("[data-reason]")?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await sleep(300);
  await p.focus('#kill-list li[data-verdict="killed"] h3 button');
  const t1 = await p.evaluate(() => performance.now());
  await p.keyboard.press("Shift+Enter");
  await sleep(2500);
  const r = await p.evaluate(([t0, t1]) => {
    const pick = (name, after) => window.__ev.filter((e) => e.name === name && e.t >= after - 5).sort((a, b) => b.dur - a.dur)[0] ?? null;
    const near = (e) => (e ? window.__lo.filter((l) => l.end >= e.t && l.t <= e.t + e.dur) : []);
    const click = pick("click", t0);
    const key = pick("keydown", t1);
    const sum = (ls) => ({ frames: ls.length, work: ls.reduce((n, l) => n + l.work, 0), maxWork: Math.max(0, ...ls.map((l) => l.work)) });
    return { click, clickLoaf: sum(near(click)), fire: key, fireLoaf: sum(near(key)), struck: document.querySelectorAll("#kill-list li[data-deadeye-struck]").length };
  }, [t0, t1]);
  await p.keyboard.press("Escape");
  await ctx.close();
  return r;
}

async function drone(browser, dsf) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
  const p = await ctx.newPage();
  await p.addInitScript(observe);
  await p.goto(`${BASE}/?skip=intro`, { waitUntil: "load" });
  // DRONE_WAIT: ms after load before the band is brought in (default 1500, the games probe's)
  await sleep(Number(process.env.DRONE_WAIT || 1500));
  await p.evaluate(() => document.querySelector("#drone-takeoff")?.closest("[data-band]")?.scrollIntoView({ block: "center", behavior: "instant" }));
  await sleep(500);
  const t0 = await p.evaluate(() => performance.now());
  await p.click("#drone-takeoff");
  await p.waitForFunction(() => document.querySelector(".drone-game")?.getAttribute("data-phase") === "flying", null, { timeout: 8000 }).catch(() => {});
  await sleep(1500);
  const r = await p.evaluate((t0) => {
    const evs = window.__ev.filter((e) => e.t >= t0 - 5 && e.name !== "keydown");
    const worst = evs.sort((a, b) => b.dur - a.dur)[0] ?? null;
    const near = worst ? window.__lo.filter((l) => l.end >= worst.t && l.t <= worst.t + worst.dur) : [];
    return { worst, loafs: near, marks: performance.getEntriesByType("mark").filter((m) => /p3:/.test(m.name)).map((m) => `${m.name}@${Math.round(m.startTime)}`) };
  }, t0);
  await p.keyboard.press("Escape");
  await ctx.close();
  return r;
}

// ONLY=keys: the drone in flight — focus the field, hold ArrowLeft 1 s (twice), then Esc; every key event's
// Event Timing entry with the long frames that overlap it (the games probe's 232 ms keydown, final run)
async function keys(browser, dsf) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
  const p = await ctx.newPage();
  await p.addInitScript(observe);
  await p.goto(`${BASE}/?skip=intro`, { waitUntil: "load" });
  await sleep(6000);
  await p.evaluate(() => document.querySelector("#drone-takeoff")?.closest("[data-band]")?.scrollIntoView({ block: "center", behavior: "instant" }));
  await sleep(600);
  await p.click("#drone-takeoff");
  await p.waitForFunction(() => document.querySelector(".drone-game")?.getAttribute("data-phase") === "flying", null, { timeout: 8000 }).catch(() => {});
  await sleep(400);
  await p.evaluate(() => document.querySelector(".drone-field")?.focus());
  const t0 = await p.evaluate(() => performance.now());
  for (const k of ["ArrowLeft", "ArrowUp"]) {
    await p.keyboard.down(k);
    await sleep(1000);
    await p.keyboard.up(k);
    await sleep(300);
  }
  await p.keyboard.press("Escape");
  await sleep(1500);
  const r = await p.evaluate((t0) => {
    const evs = window.__ev.filter((e) => e.t >= t0 - 5 && e.name === "keydown").sort((a, b) => b.dur - a.dur);
    return evs.map((e) => ({ ...e, loafs: window.__lo.filter((l) => l.end >= e.t && l.t <= e.t + e.dur).map((l) => ({ dur: l.dur, work: l.work, styleLayout: l.styleLayout })) }));
  }, t0);
  await ctx.close();
  return r;
}

const ONLY = process.env.ONLY || "";
(async () => {
  const args = process.env.ANGLE ? ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"] : [];
  const browser = await chromium.launch({ args });
  console.log("launch args", JSON.stringify(args));
  if (ONLY === "keys") {
    for (const dsf of [1, 0.5])
      for (let i = 0; i < RUNS; i++) console.log(`${W}x${H} dsf ${dsf} drone-keys run ${i + 1}`, JSON.stringify(await keys(browser, dsf).catch((e) => ({ error: String(e.message).split("\n")[0] }))));
    await browser.close();
    return;
  }
  for (const dsf of ONLY === "dead-eye" ? [] : [1, 0.5]) {
    for (let i = 0; i < RUNS; i++) {
      const r = await drone(browser, dsf).catch((e) => ({ error: String(e.message).split("\n")[0] }));
      console.log(`${W}x${H} dsf ${dsf} drone-click (wait ${process.env.DRONE_WAIT || 1500} ms) run ${i + 1}`, JSON.stringify(r));
    }
  }
  for (const dsf of ONLY === "drone" ? [] : [1, 0.5]) {
    for (let i = 0; i < RUNS; i++) {
      const r = await once(browser, dsf).catch((e) => ({ error: String(e.message).split("\n")[0] }));
      console.log(`${W}x${H} dsf ${dsf} dead-eye run ${i + 1}`, JSON.stringify(r));
    }
  }
  await browser.close();
})();
