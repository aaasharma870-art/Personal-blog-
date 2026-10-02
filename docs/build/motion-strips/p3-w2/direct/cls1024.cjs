// W2 measure: the 1024 native CLS 1.39 (two 0.69 shifts of section#act-2 at the journey → act-2 boundary).
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const [W, H] = (process.argv[2] || '1024x768').split('x').map(Number); const Q = process.argv[3] || '?skip=intro,smooth';
function OBS() {
  window.__ls = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      const src = e.sources.map((s) => (s.node && (s.node.id || s.node.nodeName)) + ' ' + Math.round(s.previousRect.y) + ',' + Math.round(s.previousRect.height) + ' -> ' + Math.round(s.currentRect.y) + ',' + Math.round(s.currentRect.height)).slice(0, 3);
      const j = document.getElementById('journey');
      window.__ls.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), y: Math.round(scrollY), src, j: j ? j.offsetHeight : -1 });
    }
  }).observe({ type: 'layout-shift', buffered: true });
}
(async () => {
  const { browser, release } = await launch({ headless: true });
  for (let k = 0; k < 2; k++) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
    await page.addInitScript(OBS);
    await page.goto(`http://localhost:3161/${Q}`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.mouse.move(W / 2, H / 2);
    const hs = [];
    for (let i = 0; i < 110; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(110); if (i % 10 === 0) hs.push(await page.evaluate(() => [Math.round(scrollY), document.getElementById('journey').offsetHeight, document.getElementById('act-1').offsetHeight, document.getElementById('act-2').getBoundingClientRect().top | 0])); }
    await page.waitForTimeout(1000);
    console.log(W, Q, k, JSON.stringify({ shifts: await page.evaluate(() => window.__ls.filter((e) => e.v > 0.01)), hs }));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
