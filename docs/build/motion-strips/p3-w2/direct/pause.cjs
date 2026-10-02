// W2 measure: direct check of layout-gates pausedReload + pauseMid (P3-2 #11) with the four act cards.
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const B = process.env.B || 'http://localhost:3161';
const snap = () => {
  const h = document.documentElement;
  const acts = ['act-1', 'act-2', 'act-3', 'act-4', 'journey', 'work'].map((id) => { const e = document.getElementById(id); if (!e) return [id, null]; const r = e.getBoundingClientRect(); const pin = e.querySelector(':scope > [data-act-card-pin]'); return [id, Math.round(r.top + scrollY), Math.round(r.height), pin ? Math.round(pin.offsetHeight) : null]; });
  return { y: Math.round(scrollY), H: h.scrollHeight, attrs: Object.fromEntries([...h.attributes].filter((a) => a.name !== 'style').map((a) => [a.name, a.value.slice(0, 80)])), acts };
};
(async () => {
  const { browser, release } = await launch({ headless: true });
  // paused reload
  {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.addInitScript(() => { try { sessionStorage.setItem('motion', 'paused'); } catch {} window.__shift = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__shift += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    await page.goto(`${B}/?skip=intro`, { waitUntil: 'domcontentloaded' });
    const early = await page.evaluate(snap);
    await page.waitForLoadState('load'); await page.waitForTimeout(3000);
    const late = await page.evaluate(snap);
    console.log('pausedReload early', JSON.stringify(early));
    console.log('pausedReload late ', JSON.stringify(late), 'cls', await page.evaluate(() => window.__shift));
    await page.context().close();
  }
  // pause mid (Lenis on and off)
  for (const q of ['?skip=intro,smooth', '?skip=intro']) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto(`${B}/${q}`, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const target = await page.evaluate(() => { const s = document.querySelector('[data-stage-split]') ?? document.querySelector('.stage-backdrop'); const r = s.getBoundingClientRect(); return Math.round(r.top + scrollY + r.height / 3); });
    await page.evaluate((y) => window.scrollTo(0, y), target); await page.waitForTimeout(2500);
    await page.evaluate(() => { window.__shift = 0; window.__shifts = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__shift += e.value; window.__shifts.push({ v: +e.value.toFixed(4), src: e.sources.map((s) => (s.node?.id || s.node?.nodeName || '?') + ' ' + Math.round(s.previousRect.y) + '→' + Math.round(s.currentRect.y)).slice(0, 4) }); } }).observe({ type: 'layout-shift', buffered: false }); });
    const before = await page.evaluate(snap);
    await page.locator('header [data-motion-toggle]').first().click();
    await page.waitForTimeout(400);
    const after = await page.evaluate(snap);
    console.log('pauseMid', q, 'before', JSON.stringify(before));
    console.log('pauseMid', q, 'after ', JSON.stringify(after), 'shift', JSON.stringify(await page.evaluate(() => ({ s: window.__shift, e: window.__shifts.slice(0, 5) }))));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
