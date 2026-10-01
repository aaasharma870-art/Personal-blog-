// tools/capture/probes/loaf.mjs: no LoAF > 50 ms in the 3 s after quiet-end while wheel-scrolling (P3-2 #9).
// Owner: B1-SCROLL (PHASE3-PLAN §4.7). Spec §3.1 warm-up ladder, §3.7 quiet window.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
//
// Default flow (the real one): /?intro=1 at ctx.vw, click #intro-play, wait for the ladder's performance mark
// "p3:quiet-end" (after the opening titles), then wheel like a person (100 px every 110 ms, mouse wheel) for
// 3 s while a PerformanceObserver records long animation frames. With --loaf-path=/?skip=intro (or when the
// intro is not on the page) the window starts at the quiet-end mark of a page with no intro.
// Result: every LoAF in [quiet-end, +3 s] with its duration, blocking time, main-thread work (script +
// style/layout) and top script; the ladder marks (p3:ladder-1…5) relative to quiet-end; Lenis on/off.
// pass = no LoAF longer than --loaf-max (default 50 ms) by --loaf-metric=duration (default) or `work`
// (headless SwiftShader rasterises in software, so `duration` there includes raster waits a GPU never has;
// read `work` beside it).

function initLoaf() {
  window.__loaf = [];
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const end = e.startTime + e.duration;
        const scripts = [...(e.scripts || [])]
          .map((s) => ({ d: Math.round(s.duration), inv: String(s.invoker || "").slice(0, 120), src: String(s.sourceURL || "").slice(-80), fn: s.sourceFunctionName }))
          .sort((a, b) => b.d - a.d);
        const scriptMs = scripts.reduce((n, s) => n + s.d, 0);
        const styleLayout = e.styleAndLayoutStart ? end - e.styleAndLayoutStart : 0;
        window.__loaf.push({
          start: e.startTime,
          dur: Math.round(e.duration),
          block: Math.round(e.blockingDuration || 0),
          work: Math.round(Math.min(e.duration, scriptMs + styleLayout)),
          top: scripts[0] ?? null,
        });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {
    window.__loaf = null;
  }
}

export default async function probe(page, ctx) {
  const MAX = Number(ctx.args["loaf-max"] ?? 50);
  const METRIC = ctx.args["loaf-metric"] === "work" ? "work" : "dur";
  const WINDOW_MS = 3000;
  await page.addInitScript(initLoaf);

  const pathArg = ctx.args["loaf-path"];
  let mode = pathArg ? "path" : "intro";
  await page.goto(ctx.url(pathArg ?? "/?intro=1"), { waitUntil: "load", timeout: 90000 });
  if (mode === "intro") {
    const play = await page.waitForSelector("#intro-play", { timeout: 8000, state: "visible" }).catch(() => null);
    if (play) await play.click().catch(() => {});
    else mode = "no-intro";
  }
  const got = await page
    .waitForFunction(() => performance.getEntriesByName("p3:quiet-end").length > 0, null, { timeout: 40000, polling: 50 })
    .then(() => true, () => false);
  if (!got) return { pass: false, error: "no p3:quiet-end mark within 40 s (lib/ladder.ts not live?)", mode };
  if (!(await page.evaluate(() => Array.isArray(window.__loaf)))) return { skipped: true, reason: "no long-animation-frame support" };

  // wheel for 3 s from the quiet-end (the mark may be in the past for a no-intro page: start now)
  const q = await page.evaluate(() => {
    const m = performance.getEntriesByName("p3:quiet-end");
    return { mark: m[m.length - 1].startTime, now: performance.now() };
  });
  const windowStart = mode === "intro" ? q.mark : Math.max(q.mark, q.now);
  await page.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
  const t0 = Date.now();
  while (Date.now() - t0 < WINDOW_MS) {
    await page.mouse.wheel(0, 100);
    await ctx.sleep(110);
  }
  await ctx.sleep(400);

  const r = await page.evaluate(
    ({ from, to }) => {
      const marks = {};
      for (let n = 1; n <= 5; n++) {
        const m = performance.getEntriesByName(`p3:ladder-${n}`);
        if (m.length) marks[n] = Math.round(m[m.length - 1].startTime - from);
      }
      return {
        loafs: (window.__loaf || []).filter((l) => l.start >= from && l.start <= to).map((l) => ({ ...l, t: Math.round(l.start - from) })),
        ladderMs: marks,
        lenis: !!window.__lenis,
      };
    },
    { from: windowStart, to: windowStart + WINDOW_MS },
  );
  const over = r.loafs.filter((l) => l[METRIC] > MAX);
  return {
    pass: over.length === 0,
    mode,
    metric: METRIC === "dur" ? "duration" : "work",
    max: MAX,
    count: r.loafs.length,
    over: over.length,
    worstDur: Math.max(0, ...r.loafs.map((l) => l.dur)),
    worstWork: Math.max(0, ...r.loafs.map((l) => l.work)),
    loafs: r.loafs.sort((a, b) => b.dur - a.dur).slice(0, 12).map(({ start, ...l }) => l),
    ladderMs: r.ladderMs,
    lenis: r.lenis,
  };
}
