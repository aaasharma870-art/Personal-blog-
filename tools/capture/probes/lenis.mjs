// tools/capture/probes/lenis.mjs: Lenis on DESKTOP_FINE only, native elsewhere; anchors, locks, the fast lane (P3-2).
// Owner: B1-SCROLL (PHASE3-PLAN §4.7). Spec §13 P3-2 #1 #2 #3 #12, P3-10 #3.
// Run by tools/capture/p3-probes.mjs: `export default async function probe(page, ctx)`
// (page = a fresh, not yet navigated page; ctx.goto() opens ctx.path; see the runner's header).
//
// Checks (each { pass, … } in the result; the probe passes when every check does):
//  desktop (ctx.vw, default 1440x900; skipped as "expected off" below 1024 px or with --rm):
//   lenis.on           window.__lenis appears after quiet-end (≤ 8 s); html.lenis is height:auto (taller than the
//                      viewport), scroll-behavior auto; the ladder marks p3:quiet-end / p3:ladder-1 exist
//   wheel              a wheel notch moves the page through Lenis (isScrolling "smooth" seen)
//   keyboard.midglide  a keydown during a glide halts it (isScrolling !== "smooth" ≤ 60 ms), so the key's native
//                      scroll is never overridden
//   anchor.menu        a menu link lands with the native offset (scroll-margin + scroll-padding ± 4 px), focus inside
//   anchor.skiplink    keyboard "Skip to content" focuses <main>
//   lock.menu          wheel over the open menu sheet never moves the page
//   lock.palette       wheel over the palette backdrop never moves the page
//   fastlane           [data-fast-lane] reads "Skip to the research"; a click lands #work focused ≤ 400 ms through
//                      the cut (overlay seen), the pill stays the top element at its centre during the cut
//   cut.z              .cut-overlay z-index (35) < header z-index (40)
//   hash.load          /?skip=intro#work lands #work at its anchor offset after the first refresh
//   pause              Pause destroys Lenis ≤ 100 ms (html.lenis gone), the page still wheel-scrolls; palette
//                      jumps under Pause are instant; resume re-creates Lenis
//  expected OFF (each in its own context, 6 s): 390x844 touch, 1024x1366 touch, OS reduced motion,
//   ?skip=smooth, /lab, a 404; plus "Work" (not the fast-lane label) at 390.
// Flags: --lenis-skip=fastlane,pause,…  skip named checks.
// Headless note: SwiftShader is slow; timing checks have slack only where the spec has none (400 ms, 100 ms).

export default async function probe(page, ctx) {
  const SKIP = new Set(String(ctx.args["lenis-skip"] ?? "").split(",").filter(Boolean));
  const checks = {};
  const set = (name, pass, detail = {}) => {
    checks[name] = { pass: Boolean(pass), ...detail };
  };
  const want = (name) => !SKIP.has(name.split(".")[0]) && !SKIP.has(name);
  const sleep = ctx.sleep;
  const hasLenis = (p) => p.evaluate(() => !!window.__lenis).catch(() => false);
  const waitLenis = (p, ms = 8000) =>
    p.waitForFunction(() => !!window.__lenis, null, { timeout: ms, polling: 50 }).then(() => true, () => false);
  const waitStill = (p, ms = 4000) =>
    p.waitForFunction(() => !window.__lenis || window.__lenis.isScrolling === false, null, { timeout: ms, polling: 16 }).catch(() => {});
  const anchorOffset = (p, id) =>
    p.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const off = parseFloat(getComputedStyle(el).scrollMarginTop) + parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
      const top = el.getBoundingClientRect().top;
      const max = document.documentElement.scrollHeight - innerHeight;
      return { top: Math.round(top), expected: Math.round(off || 0), atEnd: scrollY >= max - 2, focusInside: !!document.activeElement?.closest?.(`#${CSS.escape(id)}`) };
    }, id);

  const desktop = ctx.vw.width >= 1024 && !ctx.rm;

  /* ---------------------------------------------------------------- desktop */
  if (desktop) {
    await ctx.goto();
    const on = await waitLenis(page);
    const geo = await page.evaluate(() => {
      const h = document.documentElement;
      const mark = (n) => performance.getEntriesByName(n).length > 0;
      return {
        lenisClass: h.classList.contains("lenis"),
        htmlHeight: Math.round(h.getBoundingClientRect().height),
        vh: innerHeight,
        scrollBehavior: getComputedStyle(h).scrollBehavior,
        quietEnd: mark("p3:quiet-end"),
        ladder: [1, 2, 3, 4, 5].filter((n) => mark(`p3:ladder-${n}`)),
        js: h.classList.contains("js"),
      };
    });
    set("lenis.on", on && geo.lenisClass && geo.htmlHeight > geo.vh * 1.5 && geo.scrollBehavior === "auto" && geo.quietEnd, geo);

    if (on && want("wheel")) {
      await page.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
      const y0 = await page.evaluate(() => scrollY);
      const seen = page.evaluate(
        () =>
          new Promise((r) => {
            const t0 = performance.now();
            const f = () => (window.__lenis?.isScrolling === "smooth" ? r(true) : performance.now() - t0 > 1500 ? r(false) : requestAnimationFrame(f));
            f();
          }),
      );
      await page.mouse.wheel(0, 400);
      const smooth = await seen;
      await waitStill(page);
      const y1 = await page.evaluate(() => scrollY);
      set("wheel", smooth && y1 > y0, { y0, y1, smooth });
    }

    if (on && want("keyboard.midglide")) {
      await page.mouse.wheel(0, 1200);
      await page.waitForFunction(() => window.__lenis?.isScrolling === "smooth", null, { timeout: 1500, polling: 16 }).catch(() => {});
      const r = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const before = window.__lenis?.isScrolling;
            const t0 = performance.now();
            document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
            const f = () => {
              const s = window.__lenis?.isScrolling;
              if (s !== "smooth") resolve({ before, after: s, ms: Math.round(performance.now() - t0) });
              else if (performance.now() - t0 > 300) resolve({ before, after: s, ms: 300 });
              else requestAnimationFrame(f);
            };
            f();
          }),
      );
      set("keyboard.midglide", r.before === "smooth" ? r.after !== "smooth" && r.ms <= 60 : null, r);
      await waitStill(page);
    }

    if (on && want("anchor.skiplink")) {
      await page.evaluate(() => scrollTo(0, 0));
      await sleep(300);
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await page.keyboard.press("Tab");
      const isSkip = await page.evaluate(() => document.activeElement?.getAttribute("href") === "#main");
      if (isSkip) await page.keyboard.press("Enter");
      await sleep(400);
      const focused = await page.evaluate(() => document.activeElement?.id === "main");
      set("anchor.skiplink", isSkip && focused, { isSkip, focused });
    }

    if (on && want("anchor.menu")) {
      await page.evaluate(() => scrollTo(0, 0));
      await sleep(300);
      await page.click("header button[aria-controls='site-menu']");
      await page.waitForSelector("#site-menu", { timeout: 3000 }).catch(() => {});
      // a near target: the first menu link (a glide); and the wheel lock while the sheet is open
      const y0 = await page.evaluate(() => scrollY);
      if (want("lock.menu")) {
        await page.mouse.move(ctx.vw.width / 2, ctx.vw.height - 40);
        for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 300);
        await sleep(500);
        const y1 = await page.evaluate(() => scrollY);
        set("lock.menu", y1 === y0, { y0, y1 });
      }
      const link = await page.$("#site-menu [data-menu-first]");
      const id = link ? (await link.getAttribute("href")).replace(/^\/?#/, "") : null;
      if (link) await link.click();
      await sleep(250);
      await waitStill(page, 5000);
      await sleep(250);
      const at = id ? await anchorOffset(page, id) : null;
      set("anchor.menu", at && (Math.abs(at.top - at.expected) <= 4 || at.atEnd) && at.focusInside, { id, ...at });
    }

    if (on && want("lock.palette")) {
      await page.keyboard.press("Control+k");
      await page.waitForSelector("#cmd-list", { timeout: 3000 }).catch(() => {});
      const y0 = await page.evaluate(() => scrollY);
      await page.mouse.move(20, ctx.vw.height - 20); // the backdrop, outside the dialog
      for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 300);
      await sleep(500);
      const y1 = await page.evaluate(() => scrollY);
      set("lock.palette", y1 === y0, { y0, y1 });
      await page.keyboard.press("Escape");
      await sleep(400);
    }

    if (on && want("fastlane")) {
      await page.evaluate(() => scrollTo(0, 0));
      await waitStill(page);
      await sleep(300);
      const pill = await page.$("header [data-fast-lane]");
      const label = pill ? (await pill.innerText()).trim() : null;
      const box = pill ? await pill.boundingBox() : null;
      // in-page: click, then watch the overlay, the top element at the pill's centre, and the focus
      const r = box
        ? await page.evaluate(
            ({ x, y }) =>
              new Promise((resolve) => {
                const pill = document.querySelector("header [data-fast-lane]");
                const overlay = document.querySelector(".cut-overlay");
                let overlaySeen = false;
                let pillCovered = false;
                let focusedAt = null;
                const t0 = performance.now();
                pill.click();
                const f = () => {
                  const t = performance.now() - t0;
                  if (overlay && +getComputedStyle(overlay).opacity > 0.05) overlaySeen = true;
                  const top = document.elementFromPoint(x, y);
                  if (!top || !top.closest("[data-fast-lane]")) pillCovered = true;
                  if (focusedAt == null && document.activeElement?.closest?.("#work")) focusedAt = Math.round(t);
                  if (t > 900) {
                    const w = document.getElementById("work").getBoundingClientRect().top;
                    const off = parseFloat(getComputedStyle(document.getElementById("work")).scrollMarginTop) + parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
                    resolve({ overlaySeen, pillCovered, focusedAt, workTop: Math.round(w), expected: Math.round(off), hash: location.hash, fonts: document.documentElement.dataset.fonts ?? "" });
                  } else requestAnimationFrame(f);
                };
                requestAnimationFrame(f);
              }),
            { x: box.x + box.width / 2, y: box.y + box.height / 2 },
          )
        : null;
      set(
        "fastlane",
        label?.toLowerCase() === "skip to the research" && r && r.focusedAt != null && r.focusedAt <= 400 && r.overlaySeen && !r.pillCovered && Math.abs(r.workTop - r.expected) <= 4 && /idiots/.test(r.fonts),
        { label, ...r },
      );
    }

    if (want("cut.z")) {
      const z = await page.evaluate(() => {
        const o = document.querySelector(".cut-overlay");
        const h = document.querySelector("header");
        return { overlay: o ? getComputedStyle(o).zIndex : null, header: h ? getComputedStyle(h).zIndex : null, position: o ? getComputedStyle(o).position : null };
      });
      set("cut.z", z.overlay != null && Number(z.overlay) < Number(z.header) && z.position === "fixed", z);
    }

    if (want("hash.load")) {
      const p2 = await ctx.newPage();
      await p2.goto(ctx.url("/?skip=intro#work"), { waitUntil: "load" });
      await waitLenis(p2, 8000);
      await sleep(1500); // the ladder's step-2 refresh + the hash re-apply
      const at = await anchorOffset(p2, "work");
      set("hash.load", at && Math.abs(at.top - at.expected) <= 4, at ?? {});
    }

    if (on && want("pause")) {
      await page.evaluate(() => scrollTo(0, 0));
      await sleep(300);
      const r = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const btn = document.querySelector("header [data-motion-toggle]");
            if (!btn) return resolve({ button: false });
            const t0 = performance.now();
            btn.click();
            const f = () => {
              const gone = !window.__lenis && !document.documentElement.classList.contains("lenis");
              const t = performance.now() - t0;
              if (gone || t > 500) resolve({ button: true, gone, ms: Math.round(t) });
              else setTimeout(f, 2);
            };
            f();
          }),
      );
      await page.mouse.move(ctx.vw.width / 2, ctx.vw.height / 2);
      const y0 = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 500);
      await sleep(600);
      const y1 = await page.evaluate(() => scrollY);
      // palette jump under Pause: instant (the old matchMedia bug)
      await page.keyboard.press("Control+k");
      await page.waitForSelector("#cmd-list", { timeout: 3000 }).catch(() => {});
      await page.keyboard.type("kill");
      await sleep(200);
      const jump = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const ys = [];
            const t0 = performance.now();
            document.querySelector("#cmd-list [aria-selected='true']")?.click();
            const f = () => {
              ys.push(Math.round(scrollY));
              if (performance.now() - t0 > 600) resolve({ distinct: new Set(ys).size, last: ys[ys.length - 1] });
              else requestAnimationFrame(f);
            };
            f();
          }),
      );
      // resume: Lenis comes back
      await page.click("header [data-motion-toggle]");
      const back = await waitLenis(page, 8000);
      set("pause", r.button && r.gone && r.ms <= 100 && y1 > y0 && jump.distinct <= 3 && back, { ...r, scrolledAfter: y1 - y0, paletteJump: jump, back });
    }
  } else {
    set("desktop", null, { skipped: `viewport ${ctx.vw.width}x${ctx.vw.height}${ctx.rm ? " rm" : ""}: smooth scroll expected off` });
  }

  /* ---------------------------------------------------------------- expected OFF */
  const off = [
    ["off.390touch", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, "/?skip=intro"],
    ["off.1024x1366touch", { viewport: { width: 1024, height: 1366 }, isMobile: true, hasTouch: true }, "/?skip=intro"],
    ["off.rm", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }, "/?skip=intro"],
    ["off.skipsmooth", { viewport: { width: 1440, height: 900 } }, "/?skip=intro,smooth"],
    ["off.lab", { viewport: { width: 1440, height: 900 } }, "/lab"],
    ["off.404", { viewport: { width: 1440, height: 900 } }, "/p3-probe-does-not-exist"],
  ];
  for (const [name, opts, path] of off) {
    if (!want(name)) continue;
    const p = await ctx.newPage(opts);
    await p.goto(ctx.url(path), { waitUntil: "load" }).catch(() => {});
    await sleep(6000);
    const present = await hasLenis(p);
    const extra = name === "off.390touch" ? { label: await p.$eval("header [data-fast-lane]", (a) => a.innerText.trim()).catch(() => null) } : {};
    set(name, !present && (name !== "off.390touch" || extra.label?.toLowerCase() === "work"), { lenis: present, ...extra });
  }

  const failed = Object.entries(checks).filter(([, v]) => v.pass === false).map(([k]) => k);
  return { pass: failed.length === 0, failed, checks };
}
