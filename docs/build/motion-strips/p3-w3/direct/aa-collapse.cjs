// Direct check: are the aa-scrim failing boxes inside a CLOSED <details> (not painted)?
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  for (const vw of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }]) {
    const p = await (await b.newContext({ viewport: vw })).newPage();
    await p.goto("http://localhost:3161/?skip=intro,smooth", { waitUntil: "load" });
    await p.waitForTimeout(1500);
    for (const needle of ["I read moral philosophy", "Happiness can be found", "our own prompts; the only image"]) {
      const r = await p.evaluate((needle) => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (!n.textContent.includes(needle)) continue;
          const el = n.parentElement;
          if (!el.closest(".stage-backdrop")) continue;
          el.scrollIntoView({ block: "center", behavior: "instant" });
          const d = el.closest("details");
          const rg = document.createRange(); rg.selectNodeContents(n);
          const rr = [...rg.getClientRects()][0];
          const hit = rr ? document.elementFromPoint(rr.left + 4, rr.top + rr.height / 2) : null;
          return {
            needle, inDetails: Boolean(d), open: d ? d.open : null,
            checkVisibility: el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true }),
            rect: rr ? [Math.round(rr.left), Math.round(rr.top), Math.round(rr.width), Math.round(rr.height)] : null,
            hitIsText: hit ? el.contains(hit) || hit.contains(el) : false,
            hit: hit ? hit.tagName + (hit.className ? "." + String(hit.className).split(" ")[0] : "") : null,
          };
        }
        return { needle, found: false };
      }, needle);
      console.log(vw.width, JSON.stringify(r));
    }
  }
  await b.close();
})();
