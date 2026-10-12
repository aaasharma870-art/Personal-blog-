// tools/capture/probes/spotlight.mjs: one star at a time (lib/spotlight.ts, PHASE3-SPEC §3.8).
// Owner: B1-BEATS (PHASE3-PLAN §4.7). Run by tools/capture/p3-probes.mjs (`--only=spotlight`).
//
// Opens /?skip=intro&debug=spotlight (the facade loads the impl up front under that flag and
// exposes window.__spotlight) and runs a synthetic arbitration test in the page, then a real
// top-to-bottom scroll whose log it checks for overlapping grants. The arbiter of P3-11 r1/r3
// (lib/spotlight-impl.ts): a scroll star owns inside its PERFORMANCE WINDOW [a, b] (state().stars
// carry a / b in scroll px), performs while the page moves, or always when `live`; a still screen
// nobody performs is LENT to a live star in the band (C1); an ungated window opening during a hold
// CUTS it.
//   start    a quiet spot: no window holds it, no live star in its band, nothing held or pending
//   own      a LIVE scroll star in its window makes a time star wait, then skip at maxWait
//   still    an ungated SCRUB owner on a still page lets a time star play at once (< 100 ms)
//   free     with no owner a time star plays at once (< 100 ms)
//   queue    a second request waits for the first one's hold, then plays
//   once     asking again for an id that played answers "skip"
//   release  release() ends a hold early and the next request plays at once
//   lend     C1: a live star with no window, in the band of a still screen, is lent it (≤ 600 ms,
//            logged own · how live · why still); a time star's request takes it back at once
//            (logged free before the grant); a scroll of > 2 px releases a new lend
//   cut      a scroll star whose window opens during a hold ends the hold (logged end · cut by …)
//            and calls the request's onCut
//   cutMove  a hold granted over a still ungated scrub owner is cut (onCut) once the page moves
//            > 12 px inside its window (the owner performs again: never two)
//   idle     a needsIdle star waits through fast scrolling and plays ≥ 600 ms after it stops; the
//            scrolling (≈ 1800 px/s for 900 ms, back and forth over ≤ 600 px) happens in a stretch
//            no window holds and no live star's box crosses the band, so only the idle rule decides
//   pause    html[data-motion="paused"] skips every waiting star within 100 ms
//   page     a slow full scroll: no two grants ever hold at the same time; every request ends
// Under --rm (reduced motion) the impl must never load: pass = window.__spotlight absent.
// The probe needs a DESKTOP_FINE context (the default 1440x900 desktop viewport).
//
// WHERE THE SYNTHETIC TESTS RUN (P3-11 r3): on a light HARNESS page (http://spotlight.test/, served by a
// Playwright route: a tall empty page that imports lib/spotlight-impl.ts, transpiled from the source with the
// repo's typescript), so the site's real stars and SwiftShader frame starvation never decide their timing
// (r3, a loaded 4-CPU box: the full page drew 0–5 frames a second and the rAF-paced rules — the queue, the
// lend, reading pace — timed out). `--spotlight-site` runs them on the site as before. The `page` check
// always runs on the built site: a slow full scroll whose log may hold no two grants at once and no grant
// while a live star owns or is lent (`liveOverlaps`).

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HARNESS = "http://spotlight.test";

/** Serves the arbiter alone on `page`'s context (see the header). */
async function openHarness(page) {
  const ts = createRequire(path.join(ROOT, "package.json"))("typescript");
  const tr = (f) =>
    ts
      .transpileModule(fs.readFileSync(path.join(ROOT, f), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
      .outputText.replace(/from "\.\/(flags|spotlight-windows|beats|spotlight)"/g, 'from "./$1.js"');
  const files = {
    "/lib/spotlight-impl.js": tr("lib/spotlight-impl.ts"),
    "/lib/spotlight-windows.js": tr("lib/spotlight-windows.ts"),
    "/lib/beats.js": "export {};",
    "/lib/spotlight.js": "export {};",
    // lib/flags.ts's two exports the arbiter reads (the rest of flags is React state)
    "/lib/flags.js":
      'export const DESKTOP_FINE = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";\n' +
      'export function motionOffNow() { return document.documentElement.dataset.motion === "paused" || matchMedia("(prefers-reduced-motion: reduce)").matches; }',
  };
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#111}</style></head><body>' +
    '<div style="height:30000px;position:relative"></div>' +
    '<script type="module">import * as m from "/lib/spotlight-impl.js"; m.registerScrollStar("harness", document.body, 1)();</script></body></html>';
  await page.context().route(`${HARNESS}/**`, (route) => {
    const u = new URL(route.request().url());
    return files[u.pathname]
      ? route.fulfill({ status: 200, contentType: "text/javascript", body: files[u.pathname] })
      : route.fulfill({ status: 200, contentType: "text/html", body: html });
  });
  await page.goto(`${HARNESS}/?debug=spotlight`, { waitUntil: "load" });
}

export default async function probe(page, ctx) {
  const onSite = Boolean(ctx.args["spotlight-site"]) || Boolean(ctx.rm);
  const waitImpl = () =>
    page
      .waitForFunction(() => Boolean(window.__spotlight), null, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
  const sitePath = ctx.args.path ?? "/?skip=intro&debug=spotlight";
  let where = "site";
  if (onSite) await ctx.goto(sitePath);
  else {
    try {
      await openHarness(page);
      where = "harness";
    } catch (e) {
      // no typescript, no route: fall back to the site
      await ctx.goto(sitePath);
      where = `site (harness failed: ${String(e?.message ?? e).slice(0, 120)})`;
    }
  }
  const loaded = await waitImpl();
  if (ctx.rm) return { pass: !loaded, note: loaded ? "the spotlight loaded under reduced motion" : "not loaded under reduced motion (correct)" };
  if (!loaded) return { pass: false, where, error: "window.__spotlight never appeared (impl not loaded on DESKTOP_FINE with ?debug=spotlight)" };

  const synthetic = async () => {
    const S = window.__spotlight;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const now = () => performance.now();
    const res = {};
    const box = (y, h = innerHeight * 0.8) => {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;left:0;top:${Math.round(y)}px;width:1px;height:${Math.round(h)}px;pointer-events:none`;
      document.body.appendChild(el);
      return el;
    };
    const stars = () => S.state?.().stars ?? [];
    const vh = innerHeight;
    /** y lies in no window (± pad) and no live star's box meets the band [y + .2 vh, y + .8 vh]. */
    const clearAt = (y, pad = 0) =>
      stars().every(
        (st) =>
          (!st.placed || y < st.a - pad || y >= st.b + pad) &&
          (st.how !== "live" || st.bot <= y + 0.2 * vh - pad || st.top >= y + 0.8 * vh + pad),
      );
    const quiet = () => {
      const st = S.state?.() ?? {};
      return !st.owner && !st.lent && !st.hold && !(st.pending ?? []).length;
    };
    const lastLog = (pred) => [...S.log].reverse().find(pred) ?? null;
    window.scrollTo(0, Math.min(vh * 2, document.documentElement.scrollHeight - vh * 2));
    await sleep(200);
    {
      const maxY = document.documentElement.scrollHeight - vh * 2;
      let tries = 0;
      for (let y = Math.round(vh * 2); y <= maxY && tries < 40; y += 50) {
        if (!clearAt(y, 40)) continue;
        tries++;
        window.scrollTo(0, y);
        await sleep(600);
        if (clearAt(Math.round(window.scrollY)) && quiet()) break;
      }
    }
    {
      const st = S.state?.() ?? {};
      res.start = { pass: quiet(), y: Math.round(window.scrollY), owner: st.owner ?? null, lent: st.lent ?? null, hold: st.hold ?? null, pending: st.pending ?? [] };
    }
    // own: a LIVE star in its window performs while still and blocks a time star until maxWait
    {
      const el = box(window.scrollY + vh * 0.1);
      const off = S.registerScrollStar("probe-live", el, 3, { own: "top 100%, bottom 0%", live: true });
      const t0 = now();
      const a = await S.request("probe-own", { weight: 1, maxWait: 500 });
      res.own = { pass: a === "skip" && now() - t0 >= 450, answer: a, ms: Math.round(now() - t0), owner: S.state().owner };
      off();
      el.remove();
      await sleep(50);
    }
    // still: an ungated scrub owner on a still page does not block (it cannot move)
    {
      const el = box(window.scrollY + vh * 0.1);
      const off = S.registerScrollStar("probe-scrub", el, 2, { own: "top 100%, bottom 0%" });
      const owner = S.state().owner;
      const t0 = now();
      const a = await S.request("probe-still", { weight: 1, durationMs: 150 });
      res.still = { pass: owner === "probe-scrub" && a === "play" && now() - t0 < 100, answer: a, owner, ms: Math.round(now() - t0) };
      await sleep(250);
      off();
      el.remove();
      await sleep(50);
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
    // lend (C1): a live star with no window, in the band of a still screen
    {
      const el = box(window.scrollY + vh * 0.3, vh * 0.3);
      const off = S.registerScrollStar("probe-drift", el, 1, { live: true });
      const t0 = now();
      while (now() - t0 < 900 && S.state().lent !== "probe-drift") await sleep(25);
      const lentMs = Math.round(now() - t0);
      const lent = S.state().lent;
      const own = lastLog((e) => e.ev === "own" && e.id === "probe-drift");
      // a time star takes it back at once
      const t1 = now();
      const a = await S.request("probe-over-lend", { weight: 1, durationMs: 150 });
      const grantMs = Math.round(now() - t1);
      const freed = lastLog((e) => e.ev === "free" && e.id === "probe-drift");
      const lentDuringHold = S.state().lent;
      await sleep(700); // the hold ends; the still screen is lent again
      const relent = S.state().lent;
      // a scroll start releases it
      window.scrollBy(0, 12);
      await sleep(120);
      const afterScroll = S.state().lent;
      const why = lastLog((e) => e.ev === "free" && e.id === "probe-drift")?.why ?? null;
      off();
      el.remove();
      window.scrollBy(0, -12);
      await sleep(500);
      res.lend = {
        pass:
          lent === "probe-drift" && lentMs <= 600 && own?.how === "live" && own?.why === "still" &&
          a === "play" && grantMs < 100 && Boolean(freed) && lentDuringHold == null &&
          relent === "probe-drift" && afterScroll == null && why === "scroll",
        lent, lentMs, own, answer: a, grantMs, freedWhy: freed?.why ?? null, lentDuringHold, relent, afterScroll, releasedWhy: why,
      };
    }
    // cut: a window opening during a hold ends the hold and calls onCut
    {
      let cut = false;
      const p = S.request("probe-cut", { weight: 1, durationMs: 1200, onCut: () => (cut = true) });
      const a = await p;
      await sleep(50);
      const el = box(window.scrollY + vh * 0.1);
      const off = S.registerScrollStar("probe-opens", el, 1, { own: "top 100%, bottom 0%" });
      await sleep(50);
      const st = S.state();
      const end = lastLog((e) => e.ev === "end" && e.id === "probe-cut");
      res.cut = { pass: a === "play" && cut && st.hold == null && /cut by probe-opens/.test(end?.why ?? ""), answer: a, onCut: cut, hold: st.hold, why: end?.why ?? null };
      off();
      el.remove();
      await sleep(100);
    }
    // cutMove: the reader stops in a scrub window, a time star plays, the reader scrolls on
    {
      const el = box(window.scrollY - vh, vh * 3);
      const off = S.registerScrollStar("probe-scrub-2", el, 1, { own: "top 100%, bottom 0%" });
      await sleep(400); // still ≥ 300 ms
      let cut = false;
      const a = await S.request("probe-cut-move", { weight: 1, durationMs: 1200, onCut: () => (cut = true) });
      const held = S.state().hold;
      window.scrollBy(0, 4); // a settle: no cut
      await sleep(80);
      const heldAfterNudge = S.state().hold;
      window.scrollBy(0, 30);
      await sleep(80);
      const end = lastLog((e) => e.ev === "end" && e.id === "probe-cut-move");
      res.cutMove = {
        pass: a === "play" && held === "probe-cut-move" && heldAfterNudge === "probe-cut-move" && cut && S.state().hold == null && /cut by probe-scrub-2/.test(end?.why ?? ""),
        answer: a, held, heldAfterNudge, onCut: cut, why: end?.why ?? null,
      };
      off();
      el.remove();
      window.scrollBy(0, -34);
      await sleep(400);
    }
    // idle: waits through fast scrolling (≈ 1800 px/s for 900 ms), in a starless stretch
    {
      const RANGE = 600;
      const maxY = document.documentElement.scrollHeight - vh;
      const clear = (y0) => {
        for (let y = y0; y <= y0 + RANGE; y += 25) if (!clearAt(y, 20)) return false;
        return true;
      };
      const here = Math.round(window.scrollY);
      let y0 = null;
      for (let d = 0; d <= maxY && y0 === null; d += 50) {
        for (const y of [here + d, here - d]) {
          if (y >= 0 && y + RANGE <= maxY && clear(y)) {
            y0 = y;
            break;
          }
        }
      }
      if (y0 === null) {
        res.idle = { pass: false, error: `no ${RANGE} px stretch without a scroll star`, stars: stars() };
      } else {
        window.scrollTo(0, y0);
        await sleep(900); // let the jump's own scroll settle (it is not part of the test)
        // the request is made WHILE the page scrolls fast (r3 probe fix: asked after the 900 ms settle, the
        // reader was already idle and the star rightly played at once)
        let p = null;
        let dir = 1;
        const t0 = now();
        while (now() - t0 < 900) {
          const y = window.scrollY + 30 * dir;
          if (y > y0 + RANGE || y < y0) dir = -dir;
          window.scrollBy(0, 30 * dir);
          await sleep(16);
          if (!p && now() - t0 >= 150) p = S.request("probe-idle", { weight: 1, needsIdle: true, maxWait: 5000 });
        }
        const stop = now();
        const ownerDuring = S.state?.().owner ?? null;
        const a = await p;
        const after = now() - stop;
        res.idle = { pass: a === "play" && after >= 550, answer: a, msAfterStop: Math.round(after), y0, range: RANGE, ownerDuring };
        await sleep(1300);
      }
    }
    // pause: every waiting star skips within 100 ms (a live owner keeps it waiting first)
    {
      const el = box(window.scrollY + vh * 0.1);
      const off = S.registerScrollStar("probe-live-2", el, 3, { own: "top 100%, bottom 0%", live: true });
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
  };
  const tests = await page.evaluate(synthetic);

  // the real page (the built site): a slow full scroll, then check the log
  if (where === "harness") {
    await ctx.goto(sitePath);
    if (!(await waitImpl())) return { pass: false, where, tests, error: "window.__spotlight never appeared on the site" };
  }
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
  const lends = real.log.filter((e) => e.ev === "own" && e.why === "still").map((e) => e.id);
  const cuts = real.log.filter((e) => e.ev === "end" && /^cut by /.test(e.why ?? "")).map((e) => `${e.id} (${e.why})`);
  // a grant while a LIVE star owns or is lent (C1: it performs whatever the page does): never ≥ 100 ms
  const liveOverlaps = [];
  {
    let live = null; // { id, t } of the live owner / lent star
    let hold = null; // { id, t }
    const close = (t) => {
      if (live && hold) {
        const ms = t - Math.max(live.t, hold.t);
        if (ms >= 100) liveOverlaps.push(`${hold.id} over ${live.id} (${Math.round(ms)} ms)`);
      }
    };
    for (const e of real.log) {
      if (e.ev === "own") {
        if (live) close(e.t);
        live = e.how === "live" ? { id: e.id, t: e.t } : null;
      } else if (e.ev === "free" || e.ev === "off") {
        if (live) close(e.t);
        live = null;
      }
      if (e.ev === "grant") hold = { id: e.id, t: e.t };
      else if ((e.ev === "end" || e.ev === "release") && hold?.id === e.id) {
        close(e.t);
        hold = null;
      }
    }
  }
  const page_ = { pass: overlaps.length === 0 && liveOverlaps.length === 0, counts, overlaps, liveOverlaps, unresolved: open, stillPending: real.state.pending, lends, cuts };
  const all = { ...tests, page: page_ };
  const failed = Object.entries(all).filter(([, t]) => !t.pass).map(([k]) => k);
  return { pass: failed.length === 0, where, failed, tests: all, log: real.log };
}
