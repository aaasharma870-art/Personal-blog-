// tools/capture/probes/nav.mjs: the in-page anchors W3 added land where they say (P3-2 #2).
// Owner: W3 measure (P3-11.0 TOOLS may absorb it). Run by tools/capture/p3-probes.mjs (`--only=nav`)
// on /?skip=intro in a DESKTOP_FINE context (1440×900 default), under Lenis when it is on. The menu
// links, the skip link, the fast lane and a hash on load are lenis.mjs's; this probe follows the rest
// of spec §13 P3-2 #2's list:
//   chapter    the menu's chapter-select tiles ([data-chapter-select] [data-chapter] > a), the menu
//              reopened for each: the menu closes, the hash is PUSHED
//   waypoints  the journey chart's waypoints (ol[aria-label="Voyage waypoints"] a[href^="#journey-step-"]):
//              in the voyage ([data-voyage]) the step CENTRED, the hash REPLACED (the stack's are plain
//              anchors: the start, pushed)
//   map        the Marauder's Map rooms (egg "marauders-map", or the palette's "solemn"; a[data-room]),
//              the map reopened for each: the map closes, the hash REPLACED
//   turner     the credits' Time-Turner ([data-credits-return] a), by click and by Enter: the spin first
//              (the page has not moved 300 ms after the press), then the opening; the hash REPLACED
//   films      the films chapter's "Seen here in" links (the act card + sections of that world): the
//              hash PUSHED
// Landing, every link (read once the page is still: scrollY steady 400 ms, Lenis at rest, ≤ 6 s):
//   in view    an act card (#act-n, pinned) at its landAt: scrollY within 6 px of the card's top +
//              landAt × travel (lib/smooth-scroll.ts); a centred target within 8 px of the viewport's
//              middle; any other target with its top between the fixed header's bottom (− 2 px) and
//              0.5 vh (at the page's top or end, where it cannot scroll further: in view, under or below
//              the header);
//   focus      on the target or inside it (its heading);
//   hash       location.hash = the link's; history pushed or replaced as the family says (history.length).
// The FIRST link of each family is pressed by KEYBOARD (focus + Enter: the instant path), the others
// by mouse click (the glide / cut path).
// A family whose links are not on the page is reported { found: 0, reportOnly: true }, never failed.
// Under --rm the probe is skipped: reduced motion keeps the browser's own anchor jumps (no landAt, no
// focus move: smooth-scroll-impl.tsx useAnchors), and P3-2 #2 is the motion-on path.
// Flags: --nav-skip=map,turner,…  skip families; --nav-max=N  follow at most N links per family.

import fs from "node:fs";
import { fileURLToPath } from "node:url";

/** acts[].landAt by act id, from lib/film.ts (read as text: the probe never imports the app). */
function landAts() {
  try {
    const src = fs.readFileSync(fileURLToPath(new URL("../../../lib/film.ts", import.meta.url)), "utf8");
    return Object.fromEntries([...src.matchAll(/id: "(act-\d)"[\s\S]*?landAt: ([\d.]+)/g)].map((m) => [m[1], Number(m[2])]));
  } catch {
    return {};
  }
}

/** Where the target sits now. Runs in the page. */
function landing({ id, mode, landAt }) {
  const el = document.getElementById(id);
  const y = window.scrollY;
  const vh = innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  const a = document.activeElement;
  const out = {
    y: Math.round(y),
    hash: location.hash,
    histLen: history.length,
    focus: a && a !== document.body ? (a.id ? `#${a.id}` : a.tagName.toLowerCase()) : null,
  };
  if (!el) return { ...out, missing: true, inView: id === "" ? y <= 1 : false, focusOk: id === "" };
  const r = el.getBoundingClientRect();
  const header = document.querySelector("body header")?.getBoundingClientRect().bottom ?? 0;
  Object.assign(out, { top: Math.round(r.top), height: Math.round(r.height), header: Math.round(header) });
  out.focusOk = Boolean(a && (a === el || el.contains(a)));
  out.focusOn = !a ? null : a === el ? "target" : el.contains(a) ? (a.matches("h1, h2, h3") ? "heading" : a.tagName.toLowerCase()) : "outside";
  // an act card pins: it lands at its landAt share of the pinned travel
  if (el.hasAttribute("data-act-card") && landAt != null) {
    const pin = el.querySelector(":scope > [data-act-card-pin]") ?? el;
    const stage = el.querySelector("[data-card-stage], .act-card-stage");
    const travel = stage && getComputedStyle(stage).position === "sticky" ? Math.max(0, pin.offsetHeight - vh) : 0;
    if (travel > 0) {
      const want = Math.min(max, pin.getBoundingClientRect().top + y + landAt * travel);
      return { ...out, mode: "landAt", landAt, want: Math.round(want), off: Math.round(y - want), inView: Math.abs(y - want) <= 6 };
    }
  }
  const atTop = y <= 1;
  const atEnd = y >= max - 2;
  if (mode === "center") {
    const c = r.top + r.height / 2;
    const off = Math.round(c - vh / 2);
    return { ...out, mode, off, inView: Math.abs(off) <= 8 || (atTop && off < 0) || (atEnd && off > 0 && r.top < vh), atTop, atEnd };
  }
  const pad = parseFloat(getComputedStyle(el).scrollMarginTop) + parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  const band = r.top >= header - 2 && r.top <= vh * 0.5;
  return {
    ...out,
    mode: "start",
    pad: Math.round(pad || 0),
    inView: band || (atTop && r.top + y <= header + 2) || (atEnd && r.top >= header - 2 && r.top < vh),
    atTop,
    atEnd,
  };
}

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["nav-skip"] ?? "").split(",").filter(Boolean));
  const MAX = Number(ctx.args["nav-max"] ?? Infinity);
  const LAND_AT = landAts();
  const sleep = ctx.sleep;
  const families = {};

  const frames = (n = 2) =>
    page.evaluate((n) => new Promise((r) => {
      let k = 0;
      const f = () => (++k >= n ? r() : requestAnimationFrame(f));
      requestAnimationFrame(f);
    }), n);
  /** Jump instantly (Lenis when present) and let the page's scroll readers run. */
  const jump = async (y) => {
    await page.evaluate((y) => {
      const l = window.__lenis;
      if (l) l.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo({ top: y, behavior: "instant" });
    }, Math.max(0, Math.round(y)));
    await frames(3);
    await sleep(150);
  };
  /** Put a page element at the viewport's middle. */
  const bringIn = async (selector) => {
    const y = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.top + scrollY + r.height / 2 - innerHeight / 2;
    }, selector);
    if (y != null) await jump(y);
    return y != null;
  };
  /** The page is still: it first left y0 (≤ 2 s: a jump can start late — the Time-Turner's 600 ms spin,
   *  a closing modal's unlock, the cut's fade-in), then scrollY steady for 400 ms, Lenis at rest, no cut
   *  on screen (≤ 6 s). */
  const settle = async (y0) => {
    const t0 = Date.now();
    while (y0 != null && Date.now() - t0 < 2000) {
      if (Math.abs((await page.evaluate(() => scrollY)) - y0) > 1) break;
      await sleep(50);
    }
    let last = null;
    let steady = 0;
    while (Date.now() - t0 < 8000) {
      const s = await page.evaluate(() => ({
        y: Math.round(scrollY),
        // "smooth" only: Lenis 1.3 can leave isScrolling at "native" after an immediate jump (a native
        // scroll event with zero velocity never schedules its reset); the app reads only "smooth"
        gliding: window.__lenis?.isScrolling === "smooth",
        cut: [...document.querySelectorAll(".cut-overlay")].some((c) => Number(getComputedStyle(c).opacity) > 0.01 && getComputedStyle(c).visibility !== "hidden"),
      }));
      steady = last !== null && s.y === last && !s.gliding && !s.cut ? steady + 1 : 0;
      last = s.y;
      if (steady >= 4) break;
      await sleep(100);
    }
    await sleep(150); // the focus move follows arrival
    return Date.now() - t0;
  };
  /** Press a link: keyboard (focus + Enter) or a mouse click. */
  const press = async (selector, how) => {
    const loc = page.locator(selector).first();
    if (how === "key") {
      await loc.focus();
      await page.keyboard.press("Enter");
    } else {
      await loc.click({ timeout: 5000 });
    }
  };
  /** history.length and scrollY just before a press. */
  const pre = () => page.evaluate(() => ({ before: history.length, y0: Math.round(scrollY) }));
  /** Judge one landing. `history`: "push" | "replace". */
  const judge = async ({ href, how, mode, history, before, y0, extra = {} }) => {
    const id = href.startsWith("#") ? decodeURIComponent(href.slice(1)) : "";
    const ms = await settle(y0);
    const r = await page.evaluate(landing, { id, mode, landAt: LAND_AT[id] ?? null });
    const hashOk = id === "" ? true : r.hash === href;
    // Chromium caps history.length at 50: past it, push and replace look alike
    const histMode = before >= 50 ? "unknown" : r.histLen === before + 1 ? "push" : r.histLen === before ? "replace" : `+${r.histLen - before}`;
    const histOk = histMode === "unknown" || histMode === history;
    const pass = Boolean(r.inView && r.focusOk && hashOk && histOk);
    return { href, how, pass, ms, y0, ...r, hashOk, hist: histMode, histWant: history, ...extra };
  };
  const family = async (name, fn) => {
    if (SKIP.has(name)) return;
    try {
      families[name] = await fn();
    } catch (e) {
      families[name] = { pass: false, error: String(e?.message ?? e).split("\n")[0] };
    }
  };
  const summarize = (links, extra = {}) => {
    const failed = links.filter((l) => !l.pass).map((l) => `${l.href} (${l.how})`);
    return { pass: links.length > 0 && failed.length === 0, found: links.length, failed, ...extra, links };
  };
  const notFound = (what) => ({ found: 0, reportOnly: true, note: `${what} not on the page: nothing to follow` });
  if (ctx.rm) return { skipped: true, note: "reduced motion: the browser's own anchor jumps (P3-2 #2 is the motion-on path)" };

  /* — boot ——————————————————————————————————————————————————————————— */
  await ctx.goto();
  const lenis = await page
    .waitForFunction(() => Boolean(window.__lenis), null, { timeout: 10000, polling: 100 })
    .then(() => true, () => false);
  // the desktop enhancer and the egg host bind at ladder step 2
  await page.waitForFunction(() => performance.getEntriesByName("p3:ladder-2").length > 0, null, { timeout: 15000 }).catch(() => {});
  // every streamed section in (act-3 / act-4 can stream after load)
  await page
    .waitForFunction(() => !document.querySelector("template[id^='B:'], div[hidden][id^='S:']"), null, { timeout: 8000 })
    .catch(() => {});
  await sleep(800);

  /* — the chapter select ——————————————————————————————————————————— */
  await family("chapter", async () => {
    const openMenu = async () => {
      if (!(await page.evaluate(() => Boolean(document.getElementById("site-menu"))))) {
        await page.click('button[aria-controls="site-menu"]');
      }
      return page.waitForSelector("[data-chapter-select] [data-chapter] > a", { timeout: 8000 }).then(() => true, () => false);
    };
    await jump(0);
    if (!(await openMenu())) return notFound("[data-chapter-select] tiles (menu: button[aria-controls=site-menu])");
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("[data-chapter-select] [data-chapter] > a")].map((a) => a.getAttribute("href")));
    const links = [];
    for (const [i, href] of hrefs.slice(0, MAX).entries()) {
      if (!(await openMenu())) {
        links.push({ href, pass: false, error: "the menu did not reopen" });
        continue;
      }
      await sleep(400);
      const { before, y0 } = await pre();
      const how = i === 0 ? "key" : "click";
      await press(`[data-chapter-select] [data-chapter] > a[href="${href}"]`, how);
      const r = await judge({ href, how, mode: "start", history: "push", before, y0 });
      const menu = await page.evaluate(() => Boolean(document.getElementById("site-menu")));
      links.push({ ...r, menuOpen: menu, pass: r.pass && !menu });
    }
    if (await page.evaluate(() => Boolean(document.getElementById("site-menu")))) await page.keyboard.press("Escape");
    return summarize(links);
  });

  /* — the journey waypoints ———————————————————————————————————————— */
  await family("waypoints", async () => {
    const SEL = 'ol[aria-label="Voyage waypoints"] a[href^="#journey-step-"]';
    // the section's top: the chart is in view, step 1 not yet centred
    const sec = await page.evaluate(() => {
      const s = document.getElementById("journey-step-1")?.closest("[data-section], section");
      return s ? Math.round(s.getBoundingClientRect().top + scrollY) : null;
    });
    if (sec == null) return notFound("#journey-step-1");
    await jump(sec);
    await sleep(800); // the voyage is a lazy chunk
    const visible = () =>
      page.evaluate((s) => [...document.querySelectorAll(s)].filter((a) => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
      }).map((a) => a.getAttribute("href")), SEL);
    let hrefs = await visible();
    if (!hrefs.length) {
      await page.waitForSelector(SEL, { state: "visible", timeout: 5000 }).catch(() => {});
      hrefs = await visible();
    }
    if (!hrefs.length) return notFound(`visible ${SEL}`);
    const links = [];
    for (const [i, href] of hrefs.slice(0, MAX).entries()) {
      // the chart rides with the section: bring the link back into view if a landing left it out
      const shown = (await visible()).includes(href);
      if (!shown) await jump(sec);
      // the voyage's waypoints centre the step (replaceState); the stack's are plain anchors (the start, pushed)
      const voyage = await page.evaluate((s) => Boolean(document.querySelector(s)?.closest("[data-voyage]")), `${SEL}[href="${href}"]`);
      const { before, y0 } = await pre();
      const how = i === 0 ? "key" : "click";
      await press(`${SEL}[href="${href}"]`, how);
      links.push(await judge({ href, how, mode: voyage ? "center" : "start", history: voyage ? "replace" : "push", before, y0, extra: { voyage } }));
    }
    return summarize(links);
  });

  /* — the Marauder's Map rooms ————————————————————————————————————— */
  await family("map", async () => {
    const ROOM = '[data-egg="marauders-map"] a[data-room]';
    const openMap = async () => {
      if (await page.evaluate((s) => Boolean(document.querySelector(s)), ROOM)) return true;
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("egg:trigger", { detail: { id: "marauders-map" } })));
      let ok = await page.waitForSelector(ROOM, { timeout: 4000 }).then(() => true, () => false);
      if (!ok) {
        // the palette's spell (typed "solemn")
        await page.keyboard.press("Control+k");
        await page.waitForSelector("input[role=combobox]", { timeout: 3000 });
        await page.fill("input[role=combobox]", "solemn");
        await page.waitForSelector("#cmd-egg-map", { timeout: 3000 });
        await page.click("#cmd-egg-map");
        ok = await page.waitForSelector(ROOM, { timeout: 4000 }).then(() => true, () => false);
      }
      if (ok) await sleep(1000); // the unfold (0.8 s) and the first room's focus
      return ok;
    };
    await jump(0);
    if (!(await openMap().catch(() => false))) return notFound(`${ROOM} (egg marauders-map / palette "solemn")`);
    const ids = await page.evaluate((s) => [...document.querySelectorAll(s)].map((a) => a.getAttribute("data-room")), ROOM);
    const links = [];
    for (const [i, id] of ids.slice(0, MAX).entries()) {
      if (!(await openMap().catch(() => false))) {
        links.push({ href: `#${id}`, pass: false, error: "the map did not reopen" });
        continue;
      }
      const { before, y0 } = await pre();
      const how = i === 0 ? "key" : "click";
      await press(`${ROOM}[data-room="${id}"]`, how);
      const r = await judge({ href: `#${id}`, how, mode: "start", history: "replace", before, y0 });
      const open = await page.evaluate(() => Boolean(document.querySelector('[data-egg="marauders-map"]')));
      links.push({ ...r, mapOpen: open, pass: r.pass && !open });
    }
    if (await page.evaluate(() => Boolean(document.querySelector('[data-egg="marauders-map"]')))) await page.keyboard.press("Escape");
    return summarize(links);
  });

  /* — the Time-Turner ——————————————————————————————————————————————— */
  await family("turner", async () => {
    const SEL = "[data-credits-return] a[href]";
    const info = await page.evaluate((s) => {
      const a = document.querySelector(s);
      return a ? { href: a.getAttribute("href"), turner: Boolean(a.querySelector('[data-motif="time-turner"]')) } : null;
    }, SEL);
    if (!info) return notFound(SEL);
    const links = [];
    for (const how of ["click", "key"]) {
      if (!(await bringIn(SEL))) break;
      await sleep(600);
      const { before, y0 } = await pre();
      await press(SEL, how);
      await sleep(300);
      const mid = await page.evaluate(() => {
        const svg = document.querySelector('[data-credits-return] [data-motif="time-turner"]');
        const t = svg ? getComputedStyle(svg).transform : "none";
        return { y: Math.round(scrollY), spinning: Boolean(t && t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)") };
      });
      // the spin first (the Time-Turner icon: 600 ms) — the plain link (no icon) jumps at once
      const spinFirst = !info.turner || Math.abs(mid.y - y0) <= 2;
      const r = await judge({ href: info.href, how, mode: "start", history: "replace", before, y0, extra: { at300ms: mid } });
      links.push({ ...r, spinFirst, pass: r.pass && spinFirst });
    }
    return summarize(links, { turner: info.turner });
  });

  /* — the films' "Seen here in" links ————————————————————————————— */
  await family("films", async () => {
    // tag them (probe-only attribute): the paragraph that starts with "Seen here in"
    const hrefs = await page.evaluate(() => {
      const out = [];
      for (const p of document.querySelectorAll("p")) {
        const first = p.firstElementChild;
        if (!first || first.tagName !== "SPAN" || first.textContent.trim() !== "Seen here in") continue;
        for (const a of p.querySelectorAll('a[href^="#"]')) {
          a.setAttribute("data-nav-probe", `films-${out.length}`);
          out.push(a.getAttribute("href"));
        }
      }
      return out;
    });
    if (!hrefs.length) return notFound('"Seen here in" links');
    const links = [];
    for (const [i, href] of hrefs.slice(0, MAX).entries()) {
      const sel = `[data-nav-probe="films-${i}"]`;
      await bringIn(sel);
      await sleep(600);
      const { before, y0 } = await pre();
      const how = i === 0 ? "key" : "click";
      const text = await page.evaluate((s) => document.querySelector(s)?.textContent?.trim() ?? null, sel);
      await press(sel, how);
      links.push(await judge({ href, how, mode: "start", history: "push", before, y0, extra: { text } }));
    }
    return summarize(links);
  });

  const judged = Object.values(families).filter((f) => !f.reportOnly);
  const pass = judged.length > 0 && judged.every((f) => f.pass);
  return { pass, lenis, landAt: LAND_AT, families };
}
