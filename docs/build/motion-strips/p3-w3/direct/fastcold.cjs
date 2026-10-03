// cold fast lane (like the lenis probe): load, wait for Lenis + 3 s, scroll top, click; optional query
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const QS = (process.env.QS || '').split('|');
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
const N = Number(process.env.N || 3);
(async () => {
  const { browser, release } = await launch({ headless: true });
  for (const Q of QS) {
    const out = [];
    for (let k = 0; k < N; k++) {
      const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
      await page.goto(`http://localhost:3161/?skip=intro${Q ? '&' + Q : ''}`, { waitUntil: 'load' });
      await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(3000);
      const r = await page.evaluate(() => new Promise((resolve) => {
        const pill = document.querySelector('header [data-fast-lane]'); const t0 = performance.now(); let at = null; let fin = null; const lo = [];
        // fin: when focus enters #work (focusin); at: the first animation frame that sees it there
        document.addEventListener('focusin', (e) => { if (fin == null && e.target instanceof Element && e.target.closest('#work')) fin = Math.round(performance.now() - t0); }, true);
        const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) lo.push([Math.round(e.startTime - t0), Math.round(e.duration), Math.round(e.blockingDuration)]); });
        try { obs.observe({ type: 'long-animation-frame' }); } catch {}
        pill.click();
        const f = () => { const t = performance.now() - t0; if (at == null && document.activeElement?.closest?.('#work')) at = Math.round(t); if (t > 2500) { obs.disconnect(); resolve({ at, fin, lo: lo.filter((x) => x[0] > -20 && x[1] > 100) }); } else requestAnimationFrame(f); };
        requestAnimationFrame(f);
      }));
      out.push(r);
      await page.context().close();
    }
    console.log(W, Q || 'default', 'focusin', JSON.stringify(out.map((r) => r.fin)), 'frame', JSON.stringify(out.map((r) => r.at)), JSON.stringify(out.map((r) => r.lo)));
  }
  await browser.close(); release && release();
})();
