// Direct check (W3 gate): the chapter select's act tiles land with focus on the act heading (P3-10 #2).
// The nav probe saw focus end on <body> after the #act-3 tile at 1024 in 1 of 3 runs. This repeats the
// probe's order (menu → #films, then menu → #act-3 by mouse) N times and, when focus leaves the act
// heading, records why: whether the heading is still connected, its computed display / visibility, an
// `inert` ancestor, where focus went, and the stack of the code that moved it.
// Usage: node tile-focus.cjs [W] [H] [baseUrl] [runs] [fromHash] [toHash]
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const W = Number(process.argv[2] || 1024), H = Number(process.argv[3] || 768);
const BASE = process.argv[4] || "http://localhost:3161";
const RUNS = Number(process.argv[5] || 5);
const FROM = process.argv[6] || "#films";
const TO = process.argv[7] || "#act-3";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tracer() {
  window.__focusLog = [];
  const desc = (el) => (!el ? null : el === document.body ? "body" : el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""));
  document.addEventListener(
    "focusout",
    (e) => {
      const t = e.target;
      if (!(t instanceof Element) || !/^act-\d-title$/.test(t.id)) return;
      const cs = getComputedStyle(t);
      const hiddenBy = [];
      for (let n = t; n && n !== document.documentElement; n = n.parentElement) {
        const c = getComputedStyle(n);
        if (c.display === "none" || c.visibility === "hidden" || n.inert || c.contentVisibility === "hidden") hiddenBy.push(desc(n) + ` {display:${c.display},visibility:${c.visibility},inert:${n.inert}}`);
      }
      window.__focusLog.push({ t: Math.round(performance.now()), from: t.id, to: desc(e.relatedTarget), connected: t.isConnected, display: cs.display, visibility: cs.visibility, hiddenBy: hiddenBy.slice(0, 3), stack: (new Error().stack || "").split("\n").slice(2, 7).map((s) => s.trim().slice(0, 140)) });
    },
    true,
  );
}

(async () => {
  const browser = await chromium.launch();
  let lost = 0;
  for (let i = 0; i < RUNS; i++) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    await p.addInitScript(tracer);
    await p.goto(`${BASE}/?skip=intro`, { waitUntil: "load" });
    await p.waitForFunction(() => !!window.__lenis, null, { timeout: 15000 }).catch(() => {});
    await sleep(1500);
    const pick = async (href) => {
      await p.click("header button[aria-controls='site-menu']");
      await p.waitForSelector(`[data-chapter-select] a[href$="${href}"]`, { timeout: 8000 });
      await sleep(250);
      await p.click(`[data-chapter-select] a[href$="${href}"]`);
      // the nav probe's read: the page still (scrollY steady 400 ms), ≤ 6 s
      let last = -1, still = 0;
      for (let k = 0; k < 60 && still < 4; k++) {
        await sleep(100);
        const y = await p.evaluate(() => Math.round(scrollY));
        still = y === last ? still + 1 : 0;
        last = y;
      }
      await sleep(300);
      return p.evaluate(() => ({ y: Math.round(scrollY), hash: location.hash, focus: document.activeElement === document.body ? "body" : document.activeElement?.id || document.activeElement?.tagName }));
    };
    const a = await pick(FROM);
    const b = await pick(TO);
    const log = await p.evaluate(() => window.__focusLog);
    const ok = b.focus === `${TO.slice(1)}-title`;
    if (!ok) lost++;
    console.log(`${W}x${H} run ${i + 1}`, JSON.stringify({ from: a, to: b, ok, focusouts: log }));
    await ctx.close();
  }
  console.log(`${W}x${H} ${TO} focus lost in ${lost} of ${RUNS}`);
  await browser.close();
})();
