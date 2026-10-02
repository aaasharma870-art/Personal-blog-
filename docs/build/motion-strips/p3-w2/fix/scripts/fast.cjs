// fast-lane warm timing, with an optional query (e.g. gl=off) and a trace of what changes at #work
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const B = 'http://localhost:3161';
const Q = process.env.Q || '';
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
(async () => {
  const { browser, release } = await launch({ headless: true });
  for (let k = 0; k < Number(process.env.N || 2); k++) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
    await page.goto(`${B}/?skip=intro${Q ? '&' + Q : ''}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
    await page.mouse.move(W / 2, H / 2);
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(200); }
    await page.waitForTimeout(8000);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => new Promise((resolve) => {
      const pill = document.querySelector('header [data-fast-lane]'); const t0 = performance.now(); let at = null, frames = [], last = t0;
      const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) frames.push({ loaf: Math.round(e.duration), st: Math.round(e.startTime - t0), sl: e.styleAndLayoutStart ? Math.round(e.startTime + e.duration - e.styleAndLayoutStart) : 0, render: e.renderStart ? Math.round(e.startTime + e.duration - e.renderStart) : 0, block: Math.round(e.blockingDuration), scripts: (e.scripts || []).slice(0, 3).map((s) => `${s.invoker}:${Math.round(s.duration)}:${(s.sourceURL||"").split("/").pop()}:${s.sourceFunctionName}:${s.sourceCharPosition}`) }); });
      try { obs.observe({ type: 'long-animation-frame', buffered: false }); } catch {}
      pill.click();
      const f = () => { const n = performance.now(); const t = n - t0; if (at == null && document.activeElement?.closest?.('#work')) at = Math.round(t); if (t > 2500) { obs.disconnect(); resolve({ focusedAt: at, loafs: frames.filter((x) => x.st > -50) }); } else requestAnimationFrame(f); }; requestAnimationFrame(f);
    }));
    console.log(W, Q, k, JSON.stringify(r));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
