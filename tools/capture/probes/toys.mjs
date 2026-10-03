// tools/capture/probes/toys.mjs: the HP candles + wand and the Pirates compass (P3-8 #6).
// Owner: W3 gate verifier (W3-HP handoff 3; plan §11.1 P3-11.0 TOOLS may absorb it). Run by
// tools/capture/p3-probes.mjs (`--only=toys`) on `/?skip=intro` in a DESKTOP_FINE context.
//
//   mount        [data-candle-toy] on the hall's field once the plate engine is up (ladder step 2)
//   arm          scroll #contact in from fully offscreen, one mouse move inside: every on-screen
//                svg[data-candle] loses data-lit, one toy "arm" event; the cursor over the section is the wand
//   idle         2.5 s with no input: no candle relights itself
//   light        the pointer within 56 px of each flame (rect.top + .2 h) re-lights it (a flame the pointer cannot
//                reach — under the fixed header at 1024×768 — is scrolled to the middle first); then one "done",
//                [data-candle-status] = "The hall is lit.", data-flare ticks once
//   bloom        [data-wand-bloom-sprite] shows (opacity > 0) while moving; it sits in a media/art layer
//                ([data-wand-art] at z −10, or a hall [data-wand-zone]), never in the text's own layer
//   offscreen    leaving #contact fully: every candle lit again, no transition
//   lumos        re-armed dark, the "Lumos" button by KEYBOARD (focus + Enter): all lit within 1.7 s, "done"
//   pause        Pause: every candle lit, no [data-candle-toy], no bloom, #contact cursor "auto"
//   compass      the About compass button: a click and Enter each settle the needle on a pillar bearing
//                (315 · 45 · 225 · 135 ± 2°), ← / → step it; a drag on the case settles on a bearing too
//                (the resting heading before any press is reported, not judged; "settled" = the same
//                reading over 8 drawn frames and ≥ 400 ms)
// Headless timing: a pointer move can reach a busy page seconds late, so arm / lumos wait for the toy's
// own "arm" / "done" events (≤ 6 s / ≤ 3.7 s) instead of fixed sleeps.
// Under --rm: no [data-candle-toy], no [data-wand-bloom-sprite], all candles lit; the compass press jumps
//   to the next bearing.

const HEADINGS = [315, 45, 225, 135];
const onBearing = (v) => v != null && HEADINGS.some((h) => Math.min(Math.abs(v - h), 360 - Math.abs(v - h)) <= 2);

export default async function probe(page, ctx) {
  const checks = {};
  const set = (name, pass, detail = {}) => (checks[name] = { pass: Boolean(pass), ...detail });
  const sleep = ctx.sleep;
  const run = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      set(name, false, { error: String(e?.message ?? e).split("\n")[0] });
    }
  };
  await page.addInitScript(() => {
    window.__toyLog = [];
    window.addEventListener("toy", (e) => window.__toyLog.push({ t: Math.round(performance.now()), ...e.detail }));
  });
  await ctx.goto();
  const log = () => page.evaluate(() => window.__toyLog.filter((e) => e.toy === "candles").map((e) => e.action));
  /** Wait (≤ ms) for a candles toy action in the log; true when seen. Headless input can land seconds late
   *  (a pointer move reached the page 2.2 s after it was sent), so a fixed sleep raced the arm. */
  const mark = () => page.evaluate(() => window.__toyLog.length);
  const waitAction = (action, ms, from = 0) =>
    page
      .waitForFunction(([a, from]) => window.__toyLog.slice(from).some((e) => e.toy === "candles" && e.action === a), [action, from], { timeout: ms, polling: 50 })
      .then(() => true, () => false);
  const candles = () =>
    page.evaluate(() => {
      const s = document.querySelector('[data-world-section="contact"]');
      const all = s ? [...s.querySelectorAll("svg[data-candle]")] : [];
      const vh = innerHeight;
      const shown = all.filter((c) => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh;
      });
      return {
        total: all.length,
        shown: shown.length,
        litShown: shown.filter((c) => c.hasAttribute("data-lit")).length,
        litAll: all.filter((c) => c.hasAttribute("data-lit")).length,
        toy: Boolean(document.querySelector("[data-candle-toy]")),
        flames: shown
          .filter((c) => !c.hasAttribute("data-lit"))
          .map((c) => {
            const r = c.getBoundingClientRect();
            return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.2 };
          }),
        // every DISPLAYED dark candle (the toy counts those, on screen or not)
        dark: all
          .filter((c) => {
            const r = c.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && !c.hasAttribute("data-lit");
          })
          .map((c) => {
            const r = c.getBoundingClientRect();
            return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.2 };
          }),
      };
    });
  const toTop = () => page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  const toHall = () =>
    page.evaluate(() => {
      const s = document.querySelector('[data-world-section="contact"]');
      const f = s?.querySelector("svg[data-candle]")?.parentElement;
      (f ?? s)?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  /** A point inside #contact, away from the hall (the text column's left margin). */
  const inside = () =>
    page.evaluate(() => {
      const r = document.querySelector('[data-world-section="contact"]').getBoundingClientRect();
      return { x: Math.max(8, r.left + 40), y: Math.min(innerHeight - 20, Math.max(20, r.top + r.height / 2)) };
    });

  if (ctx.rm) {
    await sleep(8000);
    await toHall();
    await sleep(600);
    const p = await inside();
    await page.mouse.move(p.x, p.y);
    await sleep(800);
    const c = await candles();
    const bloom = await page.evaluate(() => Boolean(document.querySelector("[data-wand-bloom-sprite]")));
    set("rm.candles", !c.toy && !bloom && c.litAll === c.total && c.total > 0, { ...c, flames: undefined, dark: undefined, bloom });
    await run("rm.compass", async () => {
      const btn = page.locator('button[data-toy="compass"]');
      const has = await btn.count();
      if (!has) {
        const static_ = await page.evaluate(() => document.querySelector('[data-instrument="jack-compass"]')?.getAttribute("data-needle") ?? null);
        set("rm.compass", true, { button: false, note: "no toy button under RM (static compass)", needle: static_ });
        return;
      }
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await sleep(400);
      const v = await page.evaluate(() => Number(document.querySelector('[data-instrument="jack-compass"]')?.getAttribute("data-needle")));
      set("rm.compass", onBearing(v), { button: true, needle: v });
    });
    return { pass: Object.values(checks).every((c) => c.pass), checks };
  }

  await run("mount", async () => {
    const t0 = Date.now();
    await page.waitForSelector("[data-candle-toy]", { state: "attached", timeout: 30000 });
    set("mount", true, { ms: Date.now() - t0 });
  });
  if (!checks.mount?.pass) return { pass: false, checks };

  // ARM: #contact has been offscreen since load (we are at the top)
  await run("arm", async () => {
    await toTop();
    await sleep(500);
    await toHall();
    await sleep(700);
    const before = await candles();
    const p = await inside();
    const from = await mark();
    await page.mouse.move(p.x, p.y, { steps: 2 });
    const t0 = Date.now();
    await waitAction("arm", 6000, from);
    const armMs = Date.now() - t0;
    await sleep(1100); // the 600 ms sweep + 200 ms fade
    const c = await candles();
    const cursor = await page.evaluate(() => getComputedStyle(document.querySelector('[data-world-section="contact"]')).cursor);
    const l = await log();
    set("arm", before.litShown === before.shown && c.shown > 0 && c.litShown === 0 && l.filter((a) => a === "arm").length === 1 && /url\(/.test(cursor), {
      shown: c.shown,
      total: c.total,
      litBefore: before.litShown,
      litAfter: c.litShown,
      events: l,
      armMs,
      cursor: cursor.slice(0, 40),
    });
  });

  await run("idle", async () => {
    const a = await candles();
    await sleep(2500);
    const b = await candles();
    set("idle", b.litShown === a.litShown && a.litShown === 0, { before: a.litShown, after: b.litShown });
  });

  await run("light", async () => {
    // [data-flare] renders only once a flare has played (flare > 0): absent = 0
    const flareBefore = await page.evaluate(() => document.querySelector("[data-flare]")?.getAttribute("data-flare") ?? "0");
    let c = await candles();
    let bloomSeen = null;
    let guard = 0;
    let recentred = 0;
    while (c.dark.length && guard++ < 80) {
      // a flame the pointer cannot reach (under the fixed header at 1024×768, or at the viewport's edge:
      // the pointer events go to another element) is brought to the viewport's middle first
      const reachable = await page.evaluate((fl) => fl.map((f) => {
        const el = f.x > 4 && f.x < innerWidth - 4 && f.y > 4 && f.y < innerHeight - 4 ? document.elementFromPoint(f.x, f.y) : null;
        return Boolean(el?.closest('[data-world-section="contact"]'));
      }), c.dark);
      const k = reachable.indexOf(true);
      if (k < 0) {
        if (recentred++ > 10) break;
        await page.evaluate((y) => {
          const to = scrollY + y - innerHeight / 2;
          const l = window.__lenis;
          if (l) l.scrollTo(to, { immediate: true, force: true });
          else scrollTo({ top: to, behavior: "instant" });
        }, c.dark[0].y);
        await sleep(400);
        c = await candles();
        continue;
      }
      const f = c.dark[k];
      await page.mouse.move(f.x - 30, f.y - 20, { steps: 2 });
      await page.mouse.move(f.x, f.y, { steps: 3 });
      await sleep(60);
      // keep the first reading with the bloom actually shown (a reading over the header shows it hidden)
      if (!bloomSeen || !(bloomSeen.opacity > 0))
        bloomSeen = await page.evaluate(() => {
          const b = document.querySelector("[data-wand-bloom-sprite]");
          if (!b) return null;
          const layer = b.closest("[data-wand-art],[data-wand-zone]");
          return {
            opacity: Number(getComputedStyle(b).opacity),
            layer: layer ? (layer.hasAttribute("data-wand-art") ? "wand-art" : "wand-zone") : b.parentElement?.tagName,
            layerZ: layer ? getComputedStyle(layer).zIndex : null,
            textInside: Boolean(layer && layer.querySelector("p,h1,h2,h3,a,button,li")),
          };
        });
      c = await candles();
    }
    await sleep(500);
    c = await candles();
    const l = await log();
    const status = await page.evaluate(() => document.querySelector("[data-candle-status]")?.textContent?.trim() ?? null);
    const flareAfter = await page.evaluate(() => document.querySelector("[data-flare]")?.getAttribute("data-flare") ?? "0");
    const done = l.filter((a) => a === "done").length;
    set("light", c.litShown === c.shown && done === 1 && status === "The hall is lit." && Number(flareAfter) === Number(flareBefore) + 1, {
      lit: `${c.litShown}/${c.shown}`,
      recentred,
      done,
      status,
      flare: [flareBefore, flareAfter],
      lights: l.filter((a) => a === "light").length,
      moves: guard,
    });
    set("bloom", bloomSeen && bloomSeen.opacity > 0 && bloomSeen.layer !== null && !bloomSeen.textInside, bloomSeen ?? { bloom: "never shown" });
  });

  await run("offscreen", async () => {
    await toTop();
    await sleep(600);
    const c = await candles();
    set("offscreen", c.litAll === c.total, { litAll: c.litAll, total: c.total });
  });

  await run("lumos", async () => {
    await page.evaluate(() => window.__toyLog.splice(0));
    await toHall();
    await sleep(700);
    const p = await inside();
    await page.mouse.move(p.x, p.y, { steps: 2 });
    await waitAction("arm", 6000);
    await sleep(1100);
    const dark = await candles();
    await page.focus("[data-candle-lumos]");
    const t0 = Date.now();
    await page.keyboard.press("Enter");
    let c = dark;
    while (Date.now() - t0 < 1700) {
      await sleep(100);
      c = await candles();
      if (c.litShown === c.shown) break;
    }
    const ms = Date.now() - t0;
    // "done" ends the 1.6 s sweep (a timer: late on a busy headless page, reported as doneMs)
    const doneSeen = await waitAction("done", Math.max(0, 1700 + 2000 - (Date.now() - t0)));
    const doneMs = doneSeen ? Date.now() - t0 : null;
    const l = await log();
    set("lumos", dark.litShown === 0 && c.litShown === c.shown && ms <= 1700 && l.includes("done"), {
      darkBefore: `${dark.litShown}/${dark.shown}`,
      lit: `${c.litShown}/${c.shown}`,
      ms,
      doneMs,
      events: [...new Set(l)],
    });
  });

  await run("pause", async () => {
    // arm dark again first, so Pause has to put every candle back
    await toTop();
    await sleep(500);
    await toHall();
    await sleep(700);
    const p = await inside();
    const from = await mark();
    await page.mouse.move(p.x, p.y, { steps: 2 });
    await waitAction("arm", 6000, from);
    await sleep(1100);
    const before = await candles();
    await page.locator("header [data-motion-toggle]").first().click();
    await sleep(250);
    const c = await candles();
    const after = await page.evaluate(() => ({
      cursor: getComputedStyle(document.querySelector('[data-world-section="contact"]')).cursor,
      bloom: Boolean(document.querySelector("[data-wand-bloom-sprite]")),
    }));
    set("pause", c.litAll === c.total && !c.toy && !after.bloom && after.cursor === "auto", {
      darkBefore: before.shown - before.litShown,
      litAll: `${c.litAll}/${c.total}`,
      toy: c.toy,
      ...after,
    });
    await page.locator("header [data-motion-toggle]").first().click();
    await sleep(800);
  });

  await run("compass", async () => {
    await toTop();
    const btn = page.locator('button[data-toy="compass"]');
    await btn.waitFor({ state: "attached", timeout: 15000 });
    await btn.scrollIntoViewIfNeeded();
    await sleep(800);
    // the needle has stopped when it reads the same over 8 drawn frames and ≥ 400 ms (≤ 9 s): two reads
    // 300 ms apart agreed mid-spin when a busy headless page drew no frame between them (203.3°)
    const settle = () =>
      page.evaluate(async () => {
        const read = () => {
          const v = document.querySelector('[data-instrument="jack-compass"]')?.getAttribute("data-needle");
          return v == null ? null : Number(v);
        };
        const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
        const t0 = performance.now();
        let last = read();
        let still = 0;
        let since = performance.now();
        while (performance.now() - t0 < 9000) {
          await frame();
          const v = read();
          if (v != null && last != null && Math.abs(v - last) < 0.05) still++;
          else {
            still = 0;
            since = performance.now();
          }
          last = v;
          if (still >= 8 && performance.now() - since >= 400) break;
        }
        return last;
      });
    const start = await settle();
    await btn.click();
    const click = await settle();
    await btn.focus();
    await page.keyboard.press("Enter");
    const enter = await settle();
    await page.keyboard.press("ArrowRight");
    const right = await settle();
    await page.keyboard.press("ArrowLeft");
    const left = await settle();
    const box = await btn.boundingBox();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height * 0.5;
    await page.mouse.move(cx + box.width * 0.3, cy);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      await page.mouse.move(cx + Math.cos(a) * box.width * 0.3, cy + Math.sin(a) * box.width * 0.3);
      await sleep(16);
    }
    await page.mouse.up();
    const drag = await settle();
    // the needle's resting heading before any press (start) is reported, not judged: only a press, a key
    // and a drag must settle on a pillar bearing
    const all = { start, click, enter, right, left, drag };
    set("compass", [click, enter, right, left, drag].every(onBearing) && click !== start && enter !== click && right !== enter, all);
  });

  return { pass: Object.values(checks).every((c) => c.pass), checks };
}
