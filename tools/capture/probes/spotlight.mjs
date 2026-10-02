// tools/capture/probes/spotlight.mjs: one star at a time (lib/spotlight.ts, PHASE3-SPEC §3.8).
// Owner: B1-BEATS (PHASE3-PLAN §4.7). Run by tools/capture/p3-probes.mjs (`--only=spotlight`).
//
// Opens /?skip=intro&debug=spotlight (the facade loads the impl up front under that flag and
// exposes window.__spotlight) and runs a synthetic arbitration test in the page, then a real
// top-to-bottom scroll whose log it checks for overlapping grants:
//   own      a registered scroll star in the middle 60% makes a time star wait, then skip at maxWait
//   free     with the star out of the band a time star plays at once (< 100 ms)
//   queue    a second request waits for the first one's hold, then plays
//   once     asking again for an id that played answers "skip"
//   release  release() ends a hold early and the next request plays at once
//   idle     a needsIdle star waits through fast scrolling and plays ≥ 600 ms after it stops
//   pause    html[data-motion="paused"] skips every waiting star within 100 ms
//   page     a slow full scroll: no two grants ever hold at the same time; every request ends
// Under --rm (reduced motion) the impl must never load: pass = window.__spotlight absent.
// The probe needs a DESKTOP_FINE context (the default 1440x900 desktop viewport).

export default async function probe(page, ctx) {
  await ctx.goto(ctx.args.path ?? "/?skip=intro&debug=spotlight");
  const loaded = await page
    .waitForFunction(() => Boolean(window.__spotlight), null, { timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  if (ctx.rm) return { pass: !loaded, note: loaded ? "the spotlight loaded under reduced motion" : "not loaded under reduced motion (correct)" };
  if (!loaded) return { pass: false, error: "window.__spotlight never appeared (impl not loaded on DESKTOP_FINE with ?debug=spotlight)" };

  const tests = await page.evaluate(async () => {
    const S = window.__spotlight;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const now = () => performance.now();
    const res = {};
    const box = (y) => {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;left:0;top:${y}px;width:1px;height:${Math.round(innerHeight * 0.8)}px;pointer-events:none`;
      document.body.appendChild(el);
      return el;
    };
    window.scrollTo(0, Math.min(innerHeight * 2, document.documentElement.scrollHeight - innerHeight * 2));
    await sleep(200);
    // W2 measure fix: from W2 the opening card pins at 1–2.9 vh and its scroll stars (B03/B04) own the
    // band at y = 2 vh, so "free" / "queue" / "release" waited on a real owner. Step down the page to a
    // spot no registered scroll star owns before the synthetic tests (reported as res.start).
    for (let i = 0; i < 40 && S.state?.().owner; i++) {
      window.scrollTo(0, Math.min(window.scrollY + Math.round(innerHeight * 0.5), document.documentElement.scrollHeight - innerHeight * 2));
      await sleep(200);
    }
    {
      const owner = S.state?.().owner ?? null;
      res.start = { pass: owner === null, y: Math.round(window.scrollY), owner };
    }

    // own: a scroll star in the band blocks a time star until maxWait
    {
      const el = box(window.scrollY + innerHeight * 0.1);
      const off = S.registerScrollStar("probe-scroll", el, 3);
      const t0 = now();
      const a = await S.request("probe-own", { weight: 1, maxWait: 500 });
      res.own = { pass: a === "skip" && now() - t0 >= 450, answer: a, ms: Math.round(now() - t0) };
      off();
      el.remove();
    }
    // free: plays at once
    {
      const t0 = now();
      const a = await S.request("probe-free", { weight: 2, durationMs: 400 });
      res.free = { pass: a === "play" && now() - t0 < 100, answer: a, ms: Math.round(now() - t0) };
    }
    // queue: waits for probe-free's 400 ms hold, then plays
    {
      const t0 = now();
      const a = await S.request("probe-queue", { weight: 1, maxWait: 1500, durationMs: 200 });
      const ms = now() - t0;
      res.queue = { pass: a === "play" && ms >= 250 && ms < 1000, answer: a, ms: Math.round(ms) };
      await sleep(250);
    }
    // once per view
    {
      const a = await S.request("probe-free", { weight: 2 });
      res.once = { pass: a === "skip", answer: a };
    }
    // release ends a hold early
    {
      await S.request("probe-rel", { weight: 1, durationMs: 1200 });
      S.release("probe-rel");
      const t0 = now();
      const a = await S.request("probe-after", { weight: 1, durationMs: 100 });
      res.release = { pass: a === "play" && now() - t0 < 100, answer: a, ms: Math.round(now() - t0) };
      await sleep(150);
    }
    // idle: waits through fast scrolling (≈ 1800 px/s for 900 ms)
    {
      const p = S.request("probe-idle", { weight: 1, needsIdle: true, maxWait: 5000 });
      let stop = 0;
      const t0 = now();
      while (now() - t0 < 900) {
        window.scrollBy(0, 30);
        await sleep(16);
      }
      stop = now();
      const a = await p;
      const after = now() - stop;
      res.idle = { pass: a === "play" && after >= 550, answer: a, msAfterStop: Math.round(after) };
      await sleep(1300);
    }
    // pause: every waiting star skips within 100 ms
    {
      const el = box(window.scrollY + innerHeight * 0.1);
      const off = S.registerScrollStar("probe-scroll-2", el, 3);
      const p = S.request("probe-paused", { weight: 1, maxWait: 3000 });
      await sleep(50);
      const t0 = now();
      document.documentElement.dataset.motion = "paused";
      const a = await p;
      res.pause = { pass: a === "skip" && now() - t0 < 100, answer: a, ms: Math.round(now() - t0) };
      delete document.documentElement.dataset.motion;
      off();
      el.remove();
      await sleep(100);
    }
    return res;
  });

  // the real page: a slow full scroll, then check the log
  const real = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const S = window.__spotlight;
    const from = S.log.length;
    window.scrollTo(0, 0);
    await sleep(300);
    const step = Math.round(innerHeight * 0.25);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await sleep(y % (step * 8) === 0 ? 900 : 120); // a scroll-idle every 2 screens
    }
    await sleep(2000);
    return { log: S.log.slice(from), state: S.state() };
  });
  const counts = {};
  for (const e of real.log) counts[e.ev] = (counts[e.ev] ?? 0) + 1;
  // grants that overlap in time (each holds until its "end" or the next grant after an end)
  let holding = null;
  const overlaps = [];
  for (const e of real.log) {
    if (e.ev === "grant") {
      if (holding) overlaps.push(`${holding} and ${e.id}`);
      holding = e.id;
    } else if (e.ev === "end" && e.id === holding) holding = null;
  }
  const requested = new Set(real.log.filter((e) => e.ev === "request").map((e) => e.id));
  const ended = new Set(real.log.filter((e) => e.ev === "grant" || e.ev === "skip").map((e) => e.id));
  const open = [...requested].filter((id) => !ended.has(id) && !real.state.pending.includes(id));
  const page_ = { pass: overlaps.length === 0, counts, overlaps, unresolved: open, stillPending: real.state.pending };
  const all = { ...tests, page: page_ };
  const failed = Object.entries(all).filter(([, t]) => !t.pass).map(([k]) => k);
  return { pass: failed.length === 0, failed, tests: all, log: real.log };
}
