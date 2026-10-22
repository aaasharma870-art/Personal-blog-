// tools/capture/probes/replay.mjs: Replay is a brand-new visit (the intro's cold path), not a re-arm.
// Owner: A-REPLAY (Oct 22 fix: "replay plays the crappy old intro, we want the good intro that plays at the beginning").
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`.
//   node tools/capture/p3-probes.mjs http://localhost:3000 out --only=replay [--how=header|end|palette|fn] [--from=6000]
//
// Plays the intro on a first visit, scrolls to `--from` px (`end` = the very bottom), replays it through one
// entrance (`--how`: the header's Replay button, the closing "Mischief managed / Play it again" button, the palette,
// or window.__intro.replay()), plays the replay, and checks that:
//   same.marks     the replay's intro:* performance marks are the first visit's, in order (arm … titles-end)
//   flight.video   both runs played the flight as a <video> (a blob: or the intro-flight file), never the code flight
//   url            the replay ends on the clean home URL (no hash, no ?skip / ?intro) at scrollY 0
//   one.arm        the new document armed exactly once (one `intro:arm` mark, one controller script)
//   marker         the one-shot `intro-replay` marker is gone and `intro-seen` is set again
//   reload         a plain reload afterwards does NOT replay (no loop)
//   history        history.length did not grow (the location is replaced, not pushed)
// With --rm (reduced motion) only the refusal is checked: no intro on load, replay() false, no marker.
// Headless Chromium has no H.264: the flight plays from its WebM twin; the check is about the element, not the codec.

const ENDED = () => ["played", "skipped"].includes(document.documentElement.getAttribute("data-intro") ?? "");
const ARMED = () => window.__introReady === true && document.documentElement.classList.contains("intro-armed");

async function until(page, fn, ms = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(fn).catch(() => false)) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

/** One intro run on the current document: arm, press Play, wait for the end; returns what played. */
async function run(page, ctx) {
  const armed = await until(page, ARMED, 30000);
  if (!armed) return { armed: false };
  await page.waitForTimeout(900);
  await page.click("#intro-play");
  const ended = await until(page, ENDED, 40000);
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({
    marks: performance.getEntriesByType("mark").filter((m) => m.name.startsWith("intro:")).map((m) => m.name.slice(6)),
    plays: (window.__rpPlays ?? []).map((s) => (s.startsWith("blob:") ? "blob" : s.replace(/^.*\//, "").replace(/\?.*$/, ""))),
    code: Boolean(window.__rpCode),
    arms: performance.getEntriesByName("intro:arm").length,
    ctl: document.querySelectorAll("script#intro-ctl").length,
    di: document.documentElement.getAttribute("data-intro"),
  }));
  ctx.log("run", JSON.stringify(r));
  return { armed, ended, ...r };
}

export default async function probe(page, ctx) {
  await page.addInitScript(() => {
    window.__rpPlays = [];
    window.__rpCode = false;
    const play = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
      window.__rpPlays.push(this.currentSrc || this.src || "");
      return play.apply(this, arguments);
    };
    setInterval(() => {
      if (window.__introState === "code") window.__rpCode = true;
    }, 50);
  });

  if (ctx.rm) {
    await page.goto(ctx.url("/"), { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({
      armed: document.documentElement.classList.contains("intro-armed"),
      replay: window.__intro?.replay?.(),
      marker: sessionStorage.getItem("intro-replay"),
    }));
    return { pass: !r.armed && r.replay === false && !r.marker, rm: true, ...r };
  }

  const how = ctx.args.how ?? "header";
  const from = ctx.args.from ?? "6000";
  await page.goto(ctx.url("/"), { waitUntil: "load" });
  const first = await run(page, ctx);
  if (!first.ended) return { pass: false, why: "the first visit never played", first };

  await page.evaluate(async (f) => {
    const to = f === "end" ? document.documentElement.scrollHeight : Number(f);
    for (let y = 0; y <= to; y += 1500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo(0, to);
    await new Promise((r) => setTimeout(r, 1800));
  }, from);
  const before = await page.evaluate(() => ({ y: Math.round(scrollY), hist: history.length }));
  if (how === "header") await page.click("[data-dock-replay]");
  else if (how === "end") {
    await page.locator("[data-play-again]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.click("[data-play-again]");
  } else if (how === "palette") {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(800);
    await page.keyboard.type("intro");
    await page.waitForTimeout(400);
    await page.keyboard.press("Enter");
  } else await page.evaluate(() => window.__intro.replay());

  const replay = await run(page, ctx);
  const after = await page.evaluate(() => ({
    url: location.href,
    y: Math.round(scrollY),
    hist: history.length,
    marker: sessionStorage.getItem("intro-replay"),
    seen: sessionStorage.getItem("intro-seen"),
  }));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(2500);
  const reload = await page.evaluate(() => ({ armed: document.documentElement.classList.contains("intro-armed") }));

  const flight = (r) => r.plays.some((p) => p === "blob" || /intro-flight/.test(p));
  const checks = {
    "same.marks": replay.armed && first.marks.join() === replay.marks.join(),
    "flight.video": flight(first) && flight(replay) && !first.code && !replay.code,
    url: after.url === ctx.url("/") && after.y === 0,
    "one.arm": replay.arms === 1 && replay.ctl === 1,
    marker: after.marker === null && after.seen === "1",
    reload: !reload.armed,
    history: after.hist === before.hist,
  };
  return { pass: Object.values(checks).every(Boolean), how, from, before, after, checks, first, replay };
}
