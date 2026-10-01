// tools/capture/probes/words.mjs: word primitives: titles in character, scrub, physical words, fly-throughs (P3-7).
// Owner: W2-WORDS (PHASE3-PLAN §4.7). Run by tools/capture/p3-probes.mjs (`--only=words`).
//
// Opens the words lab (default `/lab/p3/words?debug=words,spotlight`; `--words-path=/…` for another
// page, e.g. the home page once W3 wires the hosts) and checks, at the runner's viewport (a
// DESKTOP_FINE 1440x900 by default):
//   ssr        no-JS: every [data-words] element is there with its text; no armed state
//   identical  after a slow full scroll (every effect ended), each [data-words] element's outerHTML
//              equals the no-JS server markup (the binder leaves nothing behind)
//   titles     no title is left armed; titles played through the spotlight, one star at a time
//   scrub      the first sentence: dim (~.28) with its top at 95% of the viewport, every word at 1
//              with its bottom at 50%, dim again when scrolled back (reversible)
//   fly        a fly-through plays once its zone is half in view and the reader is idle
//   pause      Pause: within 100 ms no armed / playing state, every scrub word at opacity 1
//   rm         reduced motion: nothing armed, every word at 1, the spotlight never loads
//   phone      390x844 touch: no binder, every word at 1, the collapse expanded (summary hidden)

const SETTLE = 1800;

async function snapshot(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-words]")].map((el) => ({
      kind: el.getAttribute("data-words"),
      beat: el.getAttribute("data-beat"),
      text: el.textContent,
      html: el.outerHTML,
    })),
  );
}

async function scrubOpacities(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-words="scrub"] [data-w]')].map((w) => Number(getComputedStyle(w).opacity)),
  );
}

export default async function probe(page, ctx) {
  const target = ctx.args["words-path"] ?? "/lab/p3/words?debug=words,spotlight";
  const res = {};

  /* — no-JS: the server markup ——————————————————————————————————————— */
  const nojs = await ctx.newPage({ javaScriptEnabled: false, viewport: ctx.vw });
  await nojs.goto(ctx.url(target), { waitUntil: "load" });
  const ssr = await snapshot(nojs);
  const ssrArmed = await nojs.evaluate(() => document.querySelectorAll("[data-words-state]").length);
  res.ssr = { pass: ssr.length > 0 && ssr.every((e) => e.text && e.text.length > 0) && ssrArmed === 0, count: ssr.length, kinds: [...new Set(ssr.map((e) => e.kind))] };

  /* — reduced motion ——————————————————————————————————————————————— */
  const rm = await ctx.newPage({ viewport: ctx.vw, reducedMotion: "reduce" });
  await rm.goto(ctx.url(target), { waitUntil: "load" });
  await ctx.sleep(1500);
  await rm.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  const rmState = await rm.evaluate(() => ({
    armed: document.querySelectorAll("[data-words-state]").length,
    spotlight: Boolean(window.__spotlight),
  }));
  const rmOps = await scrubOpacities(rm);
  res.rm = { pass: rmState.armed === 0 && !rmState.spotlight && rmOps.every((o) => o > 0.99), ...rmState, minOpacity: Math.min(1, ...rmOps) };

  /* — phone ————————————————————————————————————————————————————————— */
  const phone = await ctx.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await phone.goto(ctx.url(target), { waitUntil: "load" });
  await ctx.sleep(1500);
  const phoneState = await phone.evaluate(() => {
    const d = document.querySelector("[data-collapse]");
    const s = d?.querySelector(":scope > summary");
    const content = d ? d.querySelector(":scope > :not(summary)") : null;
    return {
      binder: Boolean(window.__words),
      armed: document.querySelectorAll("[data-words-state]").length,
      detailsContentSupported: CSS.supports("selector(::details-content)"),
      summaryDisplay: s ? getComputedStyle(s).display : null,
      contentVisible: content ? content.getBoundingClientRect().height > 0 : null,
    };
  });
  const phoneOps = await scrubOpacities(phone);
  res.phone = {
    pass:
      !phoneState.binder &&
      phoneState.armed === 0 &&
      phoneOps.every((o) => o > 0.99) &&
      (!phoneState.detailsContentSupported || (phoneState.summaryDisplay === "none" && phoneState.contentVisible === true)),
    ...phoneState,
  };

  /* — desktop, motion on ——————————————————————————————————————————— */
  await page.goto(ctx.url(target), { waitUntil: "load" });
  const bound = await page
    .waitForFunction(() => Boolean(window.__words), null, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  if (!bound) {
    res.desktop = { pass: false, error: "window.__words never appeared (binder not bound: DESKTOP_FINE viewport? ?debug=words?)" };
    return { pass: false, ...res };
  }

  // scrub: the first sentence at 95% / 50% / back to 95%
  res.scrub = await page.evaluate(async () => {
    const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const s = document.querySelector('[data-words="scrub"]');
    if (!s) return { pass: false, error: "no scrub sentence" };
    const words = [...s.querySelectorAll("[data-w]")];
    // the binder attaches a sentence only once it has been out of view: start far above it
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
    const top = () => s.getBoundingClientRect().top + scrollY;
    const bottom = () => s.getBoundingClientRect().bottom + scrollY;
    const op = () => words.map((w) => Number(getComputedStyle(w).opacity));
    window.scrollTo(0, top() - innerHeight * 0.95);
    await raf();
    await new Promise((r) => setTimeout(r, 150));
    const dim = op();
    window.scrollTo(0, bottom() - innerHeight * 0.5);
    await raf();
    await new Promise((r) => setTimeout(r, 150));
    const lit = op();
    window.scrollTo(0, top() - innerHeight * 0.95);
    await raf();
    await new Promise((r) => setTimeout(r, 150));
    const back = op();
    const pass = dim[0] < 0.35 && lit.every((o) => o > 0.99) && back[0] < 0.35;
    return { pass, dimFirst: dim[0], litMin: Math.min(...lit), backFirst: back[0], words: words.length };
  });

  // fly: the first gull zone, half in view, idle
  res.fly = await page.evaluate(async () => {
    const z = document.querySelector('[data-words="fly"]');
    if (!z) return { pass: false, error: "no fly-through" };
    const id = z.getAttribute("data-beat");
    const from = window.__words.log.length;
    z.scrollIntoView({ block: "center" });
    const t0 = performance.now();
    while (performance.now() - t0 < 6000) {
      await new Promise((r) => setTimeout(r, 200));
      if (window.__words.log.slice(from).some((e) => e.ev === "play" && e.id.endsWith(id))) {
        return { pass: true, beat: id, ms: Math.round(performance.now() - t0) };
      }
    }
    return { pass: false, beat: id, log: window.__words.log.slice(from) };
  });
  await ctx.sleep(5000); // let the flight end

  // a slow full scroll with idles: titles arm and play, one star at a time
  const scroll = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    window.scrollTo(0, 0);
    await sleep(300);
    const step = Math.round(innerHeight * 0.3);
    let n = 0;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await sleep(++n % 3 === 0 ? 1000 : 160);
    }
    await sleep(2500);
    return {
      log: window.__words.log,
      spot: window.__spotlight ? window.__spotlight.log : [],
      left: document.querySelectorAll("[data-words-state]").length,
    };
  });
  await ctx.sleep(SETTLE);
  const plays = scroll.log.filter((e) => e.ev === "play");
  let holding = null;
  const overlaps = [];
  for (const e of scroll.spot) {
    if (e.ev === "grant") {
      if (holding) overlaps.push(`${holding} and ${e.id}`);
      holding = e.id;
    } else if (e.ev === "end" && e.id === holding) holding = null;
  }
  res.titles = {
    pass: scroll.left === 0 && plays.some((e) => e.id.startsWith("title:")) && overlaps.length === 0,
    played: plays.map((e) => e.id),
    statics: scroll.log.filter((e) => e.ev === "static").length,
    leftArmed: scroll.left,
    overlaps,
  };

  // identical: the markup after the effects equals the server's
  const after = await snapshot(page);
  const diff = [];
  for (let k = 0; k < Math.max(ssr.length, after.length); k++) {
    if (ssr[k]?.html !== after[k]?.html) diff.push({ k, kind: ssr[k]?.kind ?? after[k]?.kind, beat: ssr[k]?.beat ?? after[k]?.beat });
  }
  res.identical = { pass: diff.length === 0 && ssr.length === after.length, diff: diff.slice(0, 10) };

  // pause: everything final within 100 ms
  res.pause = await page.evaluate(async () => {
    const btn = document.querySelector("[data-motion-toggle]");
    if (!btn) return { pass: false, error: "no Pause control" };
    // re-arm something: scroll to the bottom-most title, then pause mid-way
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
    const t0 = performance.now();
    btn.click();
    await new Promise((r) => setTimeout(r, 100));
    const ms = performance.now() - t0;
    const armed = document.querySelectorAll("[data-words-state]").length;
    const ops = [...document.querySelectorAll('[data-words="scrub"] [data-w]')].map((w) => Number(getComputedStyle(w).opacity));
    const fx = [...document.querySelectorAll("[data-words-fx]")].filter((f) => !f.hidden).length;
    btn.click(); // resume
    return { pass: armed === 0 && fx === 0 && ops.every((o) => o > 0.99), ms: Math.round(ms), armed, openFx: fx, minOpacity: Math.min(1, ...ops) };
  });

  const pass = Object.values(res).every((r) => r.pass !== false);
  return { pass, target, ...res };
}
