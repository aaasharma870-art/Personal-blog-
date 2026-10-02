// idle fps with a screencast running (as motion.js), parked like its idle probe; A/B by query
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
const QS = (process.env.QS || '').split('|');
const IDS = (process.env.IDS || 'act-1,journey').split(',');
(async () => {
  const { browser, release } = await launch({ headless: true });
  for (const Q of QS) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
    const cdp = await page.context().newCDPSession(page);
    await page.goto(`${process.env.B || 'http://localhost:3161'}/?skip=intro${Q ? '&' + Q : ''}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__lenis, null, { timeout: process.env.B ? 3000 : 20000 }).catch(() => {});
    await page.waitForTimeout(2000);
    cdp.on('Page.screencastFrame', (f) => cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}));
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 });
    const out = [];
    for (const id of IDS) {
      await page.evaluate((id) => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); scrollTo(0, r.top + scrollY + Math.max(0, Math.min(r.height - innerHeight, innerHeight) / 2)); }, id);
      await page.waitForTimeout(2500);
      const r = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else res({ fps: +(n / ((performance.now() - t0) / 1000)).toFixed(1), videos: [...document.querySelectorAll('video')].filter((v) => !v.paused && v.getBoundingClientRect().bottom > 0 && v.getBoundingClientRect().top < innerHeight).map((v) => v.closest('[data-media]')?.getAttribute('data-media') || 'video'), gl: [...document.querySelectorAll('[data-gl="on"]')].map((e) => e.closest('[data-act-card]')?.id) }); }; requestAnimationFrame(f); }));
      out.push(`${id} ${JSON.stringify(r)}`);
    }
    await cdp.send('Page.stopScreencast');
    console.log(W, Q || 'default', out.join(' | '));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
