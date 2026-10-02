// tools/capture/probes/cinema.mjs: the films, the credits, the director's cut, the chapter select, analytics (P3-10).
// Owner: W3-CINEMA (PHASE3-PLAN §4.7, §7.6). Spec §13 P3-10 #1 #2 #4 #5 (credits), P3-6 #8, P3-5 #4 (films), P3-2 #5.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
// Use the DEFAULT path (Lenis on): `--path=/?skip=intro`. Needs --timeout=240000 (the plate walk is slow headless).
//
// Checks (each { pass, … }; the probe passes when every one does):
//  desktop (ctx.vw ≥ 1024, not --rm):
//   beats        every W3-CINEMA beat is in the DOM: B30, B31-bars, B31–B34 (titles, data-words="title"), the four
//                finales (B3x-finale on [data-films-frame]), B35 (scroll star), B57 (the Snitch)
//   button       [data-dc="hero"] is shown (DESKTOP_FINE), records early clicks (data-enhance-queue), carries a
//                shot list (data-dc-shots ≥ 10 items, act cards as "c"), not aria-disabled
//   letterbox    house lights down: walking the films head, html[data-letterbox] is set and the top bar is closed
//                (scaleY ≥ .98) when the first frame's top is at the viewport's bottom; open again (attribute gone)
//                once the frame has passed centre; the attribute flips ≤ 2 times per pass (rule 33)
//   plates       each films screen's LivePlate is engaged (data-plate loop | depth | still) and its camera moves
//                (the .plate-cam transform is not identity mid-passage); ≤ 1 playing <video> at every sample (P3-2 #5)
//   carry        the warm point (B35): visible while the act-3 card rises (its top at 50% of the viewport), hidden
//                again once the card is at the top
//   credits      the footer's details[data-collapse] is closed with its summary shown; the H3 fan-tribute line,
//                "To be continued." and the last line are visible outside it; "Built with AI assistance" is visible
//   chapter      the menu's chapter select: "▶ Director's cut" first, 7 tiles with lazy 16:9 images ≤ 640 w; the
//                act-2 tile closes the menu and lands #act-2 at its landAt (± 6 px) with focus inside and #act-2
//                pushed
//   dc.run       the hero button starts the cut (window.__dc), the stop pill sits in the stage's "stop" layer with
//                focus on ■ Stop, the page glides at a tempo speed (30–400 px/s headless), 2× toggles without
//                stopping, a wheel stops it (pill gone) ≤ 400 ms
//   dc.esc / dc.pause / dc.fastlane   Escape, the Pause toggle and the fast lane each stop a running cut
//   analytics    no request to an analytics host during the whole probe (track() is a no-op, spec §11.4)
//  expected OFF (own contexts): 390×844 touch and 1024×1366 touch hide the button; at 390 the credits disclosure
//   is expanded (its rows visible, the summary hidden); --rm: the button reads "Motion is paused".
// Flags: --cinema-skip=chapter,dc,…  skip named checks.

import fs from "node:fs";
import { fileURLToPath } from "node:url";

/** acts[].landAt from lib/film.ts (read as text: the probe never imports the app). */
function actLandAt(id) {
  try {
    const src = fs.readFileSync(fileURLToPath(new URL("../../../lib/film.ts", import.meta.url)), "utf8");
    const m = new RegExp(`id: "${id}"[\\s\\S]*?landAt: ([\\d.]+)`).exec(src);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

const ANALYTICS_HOST = /vercel-insights|vitals\.vercel|va\.vercel-scripts|google-analytics|googletagmanager|plausible|segment\.io|mixpanel|amplitude|hotjar/i;

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["cinema-skip"] ?? "").split(",").filter(Boolean));
  const want = (name) => !SKIP.has(name.split(".")[0]) && !SKIP.has(name);
  const checks = {};
  const set = (name, pass, detail = {}) => {
    checks[name] = { pass: Boolean(pass), ...detail };
  };
  const sleep = ctx.sleep;
  const external = [];
  const watch = (p) =>
    p.on("request", (r) => {
      const u = r.url();
      if (ANALYTICS_HOST.test(u)) external.push(u);
    });
  watch(page);
  const run = async (name, fn) => {
    if (!want(name)) return;
    try {
      await fn();
    } catch (e) {
      set(name, false, { error: String(e?.message ?? e) });
    }
  };
  const frames = (p, n = 2) => p.evaluate((n) => new Promise((r) => {
    let k = 0;
    const f = () => (++k >= n ? r() : requestAnimationFrame(f));
    requestAnimationFrame(f);
  }), n);
  /** Jump instantly (Lenis when present), then let ScrollTrigger and the rAF readers run. */
  const jump = async (p, y) => {
    await p.evaluate((y) => {
      const l = window.__lenis;
      if (l) l.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo({ top: y, behavior: "instant" });
    }, y);
    await frames(p, 3);
    await sleep(120);
  };
  const waitLenis = (p, ms = 10000) =>
    p.waitForFunction(() => !!window.__lenis, null, { timeout: ms, polling: 100 }).then(() => true, () => false);

  const desktop = ctx.vw.width >= 1024 && !ctx.rm;

  if (desktop) {
    await ctx.goto();
    const lenis = await waitLenis(page);
    // the desktop enhancer (dc binder) runs at ladder step 2
    await page.waitForFunction(() => performance.getEntriesByName("p3:ladder-2").length > 0, null, { timeout: 15000 }).catch(() => {});
    await sleep(800);

    await run("beats", async () => {
      const r = await page.evaluate(() => {
        const has = (id) => document.querySelectorAll(`[data-beat="${id}"]`).length;
        const ids = ["B30", "B31-bars", "B31", "B32", "B33", "B34", "B31-finale", "B32-finale", "B33-finale", "B34-finale", "B35", "B57"];
        const out = Object.fromEntries(ids.map((id) => [id, has(id)]));
        const titles = ["B31", "B32", "B33", "B34"].every((id) => document.querySelector(`[data-beat="${id}"]`)?.getAttribute("data-words") === "title");
        const finales = ["B31", "B32", "B33", "B34"].every((id) => document.querySelector(`[data-beat="${id}-finale"]`)?.hasAttribute("data-films-frame"));
        const b35 = document.querySelector('[data-beat="B35"]');
        const b30 = document.querySelector('[data-beat="B30"]');
        return {
          out,
          titles,
          finales,
          b30: b30 ? { star: b30.hasAttribute("data-beat-star"), w: b30.getAttribute("data-beat-weight"), h: Math.round(b30.getBoundingClientRect().height) } : null,
          b35: b35 ? { star: b35.hasAttribute("data-beat-star"), h: Math.round(b35.getBoundingClientRect().height) } : null,
        };
      });
      const missing = Object.entries(r.out).filter(([, n]) => n < 1).map(([id]) => id);
      set("beats", !missing.length && r.titles && r.finales && r.b30?.star && r.b30.w === "3" && r.b30.h >= 300 && r.b35?.star && r.b35.h >= 300, { ...r, missing });
    });

    await run("button", async () => {
      const r = await page.evaluate(() => {
        const b = document.querySelector('[data-dc="hero"]');
        if (!b) return null;
        const shots = (b.getAttribute("data-dc-shots") ?? "").split(/\s+/).filter(Boolean);
        return {
          display: getComputedStyle(b).display,
          queue: b.getAttribute("data-enhance-queue"),
          shots: shots.length,
          cards: shots.filter((s) => s.endsWith(":c")).length,
          disabled: b.getAttribute("aria-disabled"),
          text: b.textContent?.trim(),
        };
      });
      set("button", r && r.display !== "none" && r.queue && r.shots >= 10 && r.cards >= 4 && r.disabled !== "true", r ?? { missing: true });
    });

    await run("letterbox", async () => {
      if (!lenis) return set("letterbox", false, { why: "no Lenis (use --path=/?skip=intro)" });
      const geo = await page.evaluate(() => {
        const f = document.querySelector("[data-films-frame]");
        if (!f) return null;
        const r = f.getBoundingClientRect();
        return { top: r.top + scrollY, h: r.height, vh: innerHeight };
      });
      if (!geo) return set("letterbox", false, { why: "no films frame" });
      await page.evaluate(() => {
        window.__lbFlips = 0;
        new MutationObserver(() => window.__lbFlips++).observe(document.documentElement, { attributes: true, attributeFilter: ["data-letterbox"] });
      });
      const read = () =>
        page.evaluate(() => {
          const bar = document.querySelector('.letterbox-bar[data-bar="top"]');
          const m = bar ? /scaleY\(([\d.]+)\)/.exec(bar.style.transform) : null;
          return { attr: document.documentElement.hasAttribute("data-letterbox"), scale: m ? Number(m[1]) : bar ? Number(getComputedStyle(bar).opacity) : null };
        });
      // before the close, the hold (the frame's top at the viewport bottom), after the open
      const ys = [geo.top - 1.6 * geo.vh, geo.top - 1.4 * geo.vh, geo.top - 1.2 * geo.vh, geo.top - 1.0 * geo.vh, geo.top - 0.9 * geo.vh];
      for (const y of ys) await jump(page, y);
      const hold = await read();
      for (const k of [0.6, 0.4, 0.2, 0]) await jump(page, geo.top + geo.h / 2 - k * geo.vh);
      const after = await read();
      const flips = await page.evaluate(() => window.__lbFlips);
      set("letterbox", hold.attr && (hold.scale ?? 0) >= 0.98 && !after.attr && flips >= 1 && flips <= 2, { hold, after, flips });
    });

    await run("plates", async () => {
      const ids = await page.evaluate(() => [...document.querySelectorAll("[data-films-frame]")].map((f) => f.getAttribute("data-films-frame")));
      const out = [];
      let maxPlaying = 0;
      for (const id of ids) {
        const box = await page.evaluate((id) => {
          const f = document.querySelector(`[data-films-frame="${id}"]`);
          const r = f.getBoundingClientRect();
          return { top: r.top + scrollY, h: r.height, vh: innerHeight };
        }, id);
        // centre it, wait for the engine and the loop, then a second sample further on
        await jump(page, box.top + box.h / 2 - box.vh / 2);
        await sleep(2500);
        const a = await page.evaluate((id) => {
          const lp = document.querySelector(`[data-films-frame="${id}"] [data-live-plate]`);
          const cam = lp?.querySelector(":scope > .plate-cam");
          const playing = [...document.querySelectorAll("video")].filter((v) => !v.paused && v.readyState >= 2).length;
          return { plate: lp?.getAttribute("data-plate") ?? null, media: lp?.getAttribute("data-live-plate") ?? null, transform: cam ? getComputedStyle(cam).transform : null, playing };
        }, id);
        await jump(page, box.top + box.h / 2 - box.vh * 0.3);
        await sleep(700);
        const b = await page.evaluate((id) => {
          const cam = document.querySelector(`[data-films-frame="${id}"] [data-live-plate] > .plate-cam`);
          return { transform: cam ? getComputedStyle(cam).transform : null, playing: [...document.querySelectorAll("video")].filter((v) => !v.paused && v.readyState >= 2).length };
        }, id);
        maxPlaying = Math.max(maxPlaying, a.playing, b.playing);
        const moved = (t) => t && t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)";
        out.push({ id, ...a, transformB: b.transform, pass: Boolean(a.plate) && (moved(a.transform) || moved(b.transform)) && a.transform !== b.transform });
      }
      set("plates", out.length === 4 && out.every((o) => o.pass) && maxPlaying <= 1, { screens: out, maxPlaying });
    });

    await run("carry", async () => {
      const card = await page.evaluate(() => {
        const sun = document.querySelector('[data-beat="B35-sun"]');
        const c = sun?.closest("[data-act-card]");
        if (!c) return null;
        return { top: c.getBoundingClientRect().top + scrollY, vh: innerHeight };
      });
      if (!card) return set("carry", false, { why: "no B35-sun (the tintype card is not live)" });
      const vis = () =>
        page.evaluate(() => {
          const el = document.querySelector("[data-warm-carry]");
          return el ? { visibility: el.style.visibility, transform: el.style.transform, opacity: el.style.opacity } : null;
        });
      await jump(page, card.top - card.vh * 0.9);
      await jump(page, card.top - card.vh * 0.5);
      const mid = await vis();
      await jump(page, card.top + 4);
      const end = await vis();
      set("carry", mid?.visibility === "visible" && /translate3d/.test(mid.transform) && end?.visibility === "hidden", { mid, end });
    });

    await run("credits", async () => {
      await page.evaluate(() => document.getElementById("credits")?.scrollIntoView({ block: "start" }));
      await frames(page, 3);
      const r = await page.evaluate(() => {
        const f = document.querySelector("footer");
        const d = f?.querySelector("details[data-collapse]");
        const shown = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
        const textEl = (needle) => [...(f?.querySelectorAll("p, dd, dt") ?? [])].find((e) => e.textContent?.includes(needle) && !d?.contains(e));
        return {
          details: !!d,
          open: d?.open ?? null,
          summary: shown(d?.querySelector("summary")),
          tribute: shown(textEl("Fan tribute")),
          end: shown(textEl("To be continued.")),
          last: shown(f?.querySelector("[data-credits-last]")),
          ai: [...(f?.querySelectorAll("dt") ?? [])].some((dt) => dt.textContent === "Built with AI assistance" && shown(dt)),
        };
      });
      set("credits", r.details && r.open === false && r.summary && r.tribute && r.end && r.last && r.ai, r);
    });

    await run("chapter", async () => {
      await jump(page, 0);
      await page.click('button[aria-controls="site-menu"]');
      await page.waitForSelector("[data-chapter-select] [data-chapter]", { timeout: 8000 });
      await sleep(600);
      const r = await page.evaluate(() => {
        const sel = document.querySelector("[data-chapter-select]");
        const first = sel?.querySelector("button, a[href]");
        const tiles = [...(sel?.querySelectorAll("[data-chapter]") ?? [])];
        const imgs = tiles.map((t) => t.querySelector("img")).filter(Boolean);
        return {
          firstIsPlay: first?.hasAttribute("data-dc-menu") ?? false,
          tiles: tiles.map((t) => t.getAttribute("data-chapter")),
          imgs: imgs.length,
          lazy: imgs.every((i) => i.getAttribute("loading") === "lazy"),
          widths: imgs.map((i) => Number(/[?&]w=(\d+)/.exec(i.currentSrc || i.src)?.[1] ?? 0)),
          ratio: imgs.map((i) => Math.round((i.getBoundingClientRect().width / Math.max(1, i.getBoundingClientRect().height)) * 100) / 100),
        };
      });
      const landAt = actLandAt("act-2");
      await page.click('[data-chapter="act-2"] > a');
      await sleep(1500);
      const land = await page.evaluate((landAt) => {
        const card = document.getElementById("act-2");
        const pin = card?.querySelector(":scope > [data-act-card-pin]") ?? card;
        if (!pin) return null;
        const travel = Math.max(0, pin.offsetHeight - innerHeight);
        const want = pin.getBoundingClientRect().top + scrollY + (landAt ?? 0) * travel;
        return {
          y: Math.round(scrollY),
          want: Math.round(want),
          hash: location.hash,
          menu: !!document.getElementById("site-menu"),
          focus: !!document.activeElement?.closest?.("#act-2"),
        };
      }, landAt);
      set(
        "chapter",
        r.firstIsPlay && r.tiles.length === 7 && r.imgs === 7 && r.lazy && r.widths.every((w) => w > 0 && w <= 640) && r.ratio.every((x) => Math.abs(x - 1.78) < 0.05) &&
          land && !land.menu && land.hash === "#act-2" && Math.abs(land.y - land.want) <= 6 && land.focus,
        { ...r, landAt, land },
      );
    });

    const startCut = async () => {
      await jump(page, 0);
      await sleep(300);
      await page.click('[data-dc="hero"]');
      return page.waitForFunction(() => window.__dc === true && !!document.querySelector('[data-stage-layers="stop"] [data-dc-pill]'), null, { timeout: 6000 }).then(() => true, () => false);
    };
    const stopped = (ms = 400) => page.waitForFunction(() => window.__dc === false && !document.querySelector("[data-dc-pill]"), null, { timeout: ms, polling: 16 }).then(() => true, () => false);

    await run("dc.run", async () => {
      const started = await startCut();
      if (!started) return set("dc.run", false, { why: "did not start" });
      const focus = await page.evaluate(() => document.activeElement?.hasAttribute("data-dc-stop") ?? false);
      await sleep(1500);
      const y0 = await page.evaluate(() => scrollY);
      const t0 = Date.now();
      await sleep(2500);
      const y1 = await page.evaluate(() => scrollY);
      const speed = ((y1 - y0) / (Date.now() - t0)) * 1000;
      await page.click("[data-dc-speed]");
      await sleep(400);
      const twoX = await page.evaluate(() => ({ pressed: document.querySelector("[data-dc-speed]")?.getAttribute("aria-pressed"), running: window.__dc }));
      await page.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
      await page.mouse.wheel(0, 120);
      const stop = await stopped();
      set("dc.run", focus && speed >= 30 && speed <= 400 && twoX.pressed === "true" && twoX.running === true && stop, { focus, speed: Math.round(speed), twoX, stop });
    });

    await run("dc.esc", async () => {
      if (!(await startCut())) return set("dc.esc", false, { why: "did not start" });
      await sleep(600);
      await page.keyboard.press("Escape");
      set("dc.esc", await stopped());
    });

    await run("dc.pause", async () => {
      if (!(await startCut())) return set("dc.pause", false, { why: "did not start" });
      await sleep(600);
      await page.click("[data-motion-toggle]");
      const ok = await stopped(300);
      await page.click("[data-motion-toggle]").catch(() => {});
      await waitLenis(page, 6000);
      set("dc.pause", ok);
    });

    await run("dc.fastlane", async () => {
      if (!(await startCut())) return set("dc.fastlane", false, { why: "did not start" });
      await sleep(600);
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("fastlane")));
      set("dc.fastlane", await stopped());
    });
  }

  /* — expected off ———————————————————————————————————————————————————— */
  if (want("off")) {
    for (const [name, o] of [
      ["off.390", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }],
      ["off.1024touch", { viewport: { width: 1024, height: 1366 }, hasTouch: true, isMobile: true }],
    ]) {
      try {
        const p = await ctx.newPage(o);
        watch(p);
        await p.goto(ctx.url(), { waitUntil: "load" });
        await sleep(1500);
        const r = await p.evaluate(() => {
          const b = document.querySelector('[data-dc="hero"]');
          const d = document.querySelector("footer details[data-collapse]");
          const dt = [...(d?.querySelectorAll("dt") ?? [])].find((e) => e.textContent === "Lines quoted");
          return {
            button: b ? getComputedStyle(b).display : "absent",
            summary: d?.querySelector("summary") ? getComputedStyle(d.querySelector("summary")).display : null,
            rowsShown: dt ? dt.getClientRects().length > 0 && dt.getBoundingClientRect().height > 0 : null,
          };
        });
        const pass = (r.button === "none" || r.button === "absent") && (name !== "off.390" || (r.summary === "none" && r.rowsShown !== false));
        set(name, pass, r);
      } catch (e) {
        set(name, false, { error: String(e?.message ?? e) });
      }
    }
  }
  if (ctx.rm && want("rm")) {
    try {
      await ctx.goto();
      await sleep(1500);
      const r = await page.evaluate(() => {
        const b = document.querySelector('[data-dc="hero"]');
        return b ? { text: b.textContent?.trim(), display: getComputedStyle(b).display } : null;
      });
      set("rm.button", !!r && /Motion is paused/.test(r.text ?? "") && (ctx.vw.width < 1024 || r.display !== "none"), r ?? {});
    } catch (e) {
      set("rm.button", false, { error: String(e?.message ?? e) });
    }
  }

  set("analytics", external.length === 0, { requests: external.slice(0, 5) });
  const pass = Object.values(checks).every((c) => c.pass);
  return { pass, checks };
}
