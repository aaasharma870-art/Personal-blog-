// Direct check: which request 404s during a full Lenis scroll (the lenis probe's console.error).
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  const bad = [];
  p.on("response", (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  for (const path of ["/?skip=intro", "/?skip=intro&debug=words,spotlight", "/lab/p3/games"]) {
    await p.goto("http://localhost:3161" + path, { waitUntil: "load" });
    await p.waitForTimeout(2500);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await p.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), y); await p.waitForTimeout(80); }
    await p.waitForTimeout(1500);
    // the menu / palette / hash paths the lenis probe uses
    await p.goto("http://localhost:3161" + path.split("&")[0] + "#work", { waitUntil: "load" }).catch(() => {});
    await p.waitForTimeout(1500);
  }
  console.log(W, "4xx/5xx:", JSON.stringify([...new Set(bad)], null, 1));
  await b.close();
})();
