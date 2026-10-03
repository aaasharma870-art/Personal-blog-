// Direct check (P3-2 #11): a paused reload, snapshots at DOMContentLoaded, load, hydration (window.__pageHydrated)
// and +3 s; page height and the boxes that move between the hydration snapshot and the last one. Base vs after.
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const snap = () => {
  const boxes = [...document.querySelectorAll("[data-section] > *, [id^='act-']")].map((el) => {
    const r = el.getBoundingClientRect();
    return [el.id || el.getAttribute("data-world-section") || el.tagName, Math.round(r.top + scrollY), Math.round(r.height)];
  });
  return { height: document.documentElement.scrollHeight, n: boxes.length, pending: document.querySelectorAll("template[id^='B:']").length, hydrated: !!window.__pageHydrated, boxes };
};
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  for (const [name, base] of [["after", "http://localhost:3161"], ["base", "http://localhost:3162"]]) {
    for (let k = 0; k < 2; k++) {
      const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
      await p.addInitScript(() => { try { sessionStorage.setItem("motion", "paused"); } catch {} });
      await p.goto(base + "/?skip=intro", { waitUntil: "domcontentloaded" });
      const dcl = await p.evaluate(snap);
      await p.waitForLoadState("load");
      const load = await p.evaluate(snap);
      await p.waitForFunction(() => !!window.__pageHydrated, null, { timeout: 8000 }).catch(() => {});
      const hyd = await p.evaluate(snap);
      await p.waitForTimeout(3000);
      const late = await p.evaluate(snap);
      const byId = (s) => Object.fromEntries(s.boxes.map((b) => [b[0] + "@" + b[1], b]));
      // index-wise (the probe's own diff), between the LOAD snapshot and +3 s
      const moved = late.boxes.map((b, i) => [b, load.boxes[i]]).filter(([b, h]) => JSON.stringify(b) !== JSON.stringify(h)).map(([b, h]) => [b[0], h ? `${h[1]}+${h[2]}` : "new", `${b[1]}+${b[2]}`]);
      console.log(name, "run", k + 1, JSON.stringify({ dcl: [dcl.height, dcl.n, dcl.pending], load: [load.height, load.n, load.pending], hydrated: [hyd.height, hyd.n, hyd.pending, hyd.hydrated], late: [late.height, late.n, late.pending] }));
      console.log("   moved between load and +3 s (index-wise):", JSON.stringify(moved.slice(0, 8)));
      await p.context().close();
    }
  }
  await b.close();
})();
