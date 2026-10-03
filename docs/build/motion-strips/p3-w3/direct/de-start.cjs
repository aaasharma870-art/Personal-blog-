// Direct check (W3 gate): Dead Eye's start centres the killed rows (games probe de.start) — also right after
// a quick Pause → resume. Reproduces the probe's order: the drone band, take off, Pause, resume after GAP ms,
// then #kill-list to the top, the pill; traces scrollY / Lenis per frame from the press and reads where the
// first and last killed rows sit.
// Usage: node de-start.cjs [W] [H] [baseUrl] [gapMs,...]
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const W = Number(process.argv[2] || 1024), H = Number(process.argv[3] || 768);
const BASE = process.argv[4] || "http://localhost:3161";
const GAPS = (process.argv[5] || "10,300").split(",").map(Number);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  for (const gap of GAPS) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(`${BASE}/?skip=intro`, { waitUntil: "load" });
    await sleep(1500);
    await p.evaluate(() => document.querySelector("#drone-takeoff")?.closest("[data-band]")?.scrollIntoView({ block: "center", behavior: "instant" }));
    await sleep(500);
    await p.click("#drone-takeoff");
    await p.waitForFunction(() => document.querySelector(".drone-game")?.getAttribute("data-phase") === "flying", null, { timeout: 8000 }).catch(() => {});
    await sleep(350);
    const toggle = () => p.evaluate(() => [...document.querySelectorAll("[data-motion-toggle]")].find((x) => x.offsetParent !== null)?.click());
    // gap < 0: no Pause at all (Esc lands the drone instead)
    if (gap >= 0) {
      await toggle();
      await sleep(gap);
      await toggle();
    } else await p.keyboard.press("Escape");
    await sleep(300);
    const snap = () =>
      p.evaluate(() => {
        const out = { y: Math.round(scrollY), lenis: window.__lenis ? Math.round(window.__lenis.animatedScroll) : null, H: document.documentElement.scrollHeight, kl: Math.round(document.getElementById("kill-list").getBoundingClientRect().top + scrollY), s: {} };
        for (const s of document.querySelectorAll("main section[id], main > *")) {
          if (s.id === "kill-list") break;
          const k = s.id || s.tagName.toLowerCase() + "." + String(s.className).split(" ")[0];
          out.s[k] = Math.round(s.getBoundingClientRect().height);
        }
        return out;
      });
    const s0 = await snap();
    await p.evaluate(() => document.getElementById("kill-list")?.scrollIntoView({ block: "start", behavior: "instant" }));
    const s1 = await snap();
    await sleep(500);
    await p.mouse.move(8, Math.round(H / 2));
    await sleep(1200);
    const s2 = await snap();
    const diff = (a, b) => Object.keys(b.s).filter((k) => a.s[k] !== b.s[k]).map((k) => `${k} ${a.s[k]}→${b.s[k]}`);
    const inner = () =>
      p.evaluate(() => {
        const kl = document.getElementById("kill-list");
        const top = kl.getBoundingClientRect().top;
        const first = kl.querySelector('li[data-verdict="killed"]');
        const kids = [...kl.querySelectorAll(":scope > *, :scope > * > *")].slice(0, 12).map((e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""}:${Math.round(e.getBoundingClientRect().height)}`);
        const rows = [...kl.querySelectorAll("li[data-row]")].map((li) => Math.round(li.getBoundingClientRect().height));
        return { firstOff: Math.round(first.getBoundingClientRect().top - top), rows, kids };
      });
    console.log("  inner at press", JSON.stringify(await inner()));
    console.log(`  snaps: before ${JSON.stringify({ y: s0.y, lenis: s0.lenis, kl: s0.kl, H: s0.H })} after-sIV ${JSON.stringify({ y: s1.y, lenis: s1.lenis, kl: s1.kl, H: s1.H })} at-press ${JSON.stringify({ y: s2.y, lenis: s2.lenis, kl: s2.kl, H: s2.H })} changed(before→press) ${JSON.stringify(diff(s0, s2))}`);
    const r = await p.evaluate(
      () =>
        new Promise((resolve) => {
          const trace = [];
          const t0 = performance.now();
          // layout shifts from the press on, with the moved nodes (what above the ledger changed height)
          const shifts = [];
          const desc = (n) => (!n ? null : n.id ? "#" + n.id : (n.tagName || "node").toLowerCase() + (n.className && typeof n.className === "string" ? "." + n.className.split(" ").slice(0, 2).join(".") : "") + (n.closest?.("[data-section]") ? " in " + n.closest("[data-section]").getAttribute("data-section") : ""));
          try {
            new PerformanceObserver((l) => {
              for (const e of l.getEntries()) shifts.push({ t: Math.round(e.startTime - t0), v: +e.value.toFixed(4), src: (e.sources || []).slice(0, 4).map((x) => ({ n: desc(x.node), dy: Math.round(x.currentRect.y - x.previousRect.y), dh: Math.round(x.currentRect.height - x.previousRect.height) })) });
            }).observe({ type: "layout-shift" });
          } catch {}
          // the heights of every section above #kill-list at the press, re-read at the end
          const above = () => { const out = {}; for (const s of document.querySelectorAll("[data-section]")) { if (s.id === "kill-list") break; out[s.id] = Math.round(s.getBoundingClientRect().height); } return out; };
          const h0 = above();
          const rows = () => [...document.querySelectorAll('#kill-list li[data-verdict="killed"]')];
          let last = null;
          const f = () => {
            const y = Math.round(scrollY);
            const lenis = window.__lenis ? `${window.__lenis.isScrolling}` : "none";
            const k = `${y}|${lenis}`;
            if (k !== last) trace.push([Math.round(performance.now() - t0), y, lenis]);
            last = k;
            if (performance.now() - t0 < 3500) requestAnimationFrame(f);
            else {
              const a = rows()[0]?.getBoundingClientRect();
              const z = rows().at(-1)?.getBoundingClientRect();
              const h1 = above();
              const changed = Object.keys(h1).filter((k) => h1[k] !== h0[k]).map((k) => `${k} ${h0[k]}→${h1[k]}`);
              resolve({ on: document.getElementById("kill-list").dataset.deadeye ?? null, top: a?.top, bottom: z?.bottom, pad: getComputedStyle(document.documentElement).scrollPaddingTop, changed, shifts: shifts.slice(0, 8), trace: trace.slice(0, 6) });
            }
          };
          document.getElementById("deadeye-call").click();
          requestAnimationFrame(f);
        }),
    );
    console.log(`${W}x${H} gap ${gap} ms`, JSON.stringify(r));
    console.log("  inner at end", JSON.stringify(await inner()));
    const s3 = await snap();
    console.log("  changed press→end", JSON.stringify(diff(s2, s3)), "kl", s2.kl, "→", s3.kl);
    await p.keyboard.press("Escape");
    await p.context().close();
  }
  await b.close();
})();
