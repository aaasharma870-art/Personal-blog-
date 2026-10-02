// W2 fix: subtitle in star (b), damped p after jumps / steps
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const B = process.env.B || 'http://localhost:3161';
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
(async () => {
  const { browser, release } = await launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
  await page.goto(`${B}/?skip=intro&debug=cards`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const geo = (id) => page.evaluate((id) => { const el = document.getElementById(id); const pin = el.querySelector(':scope > [data-act-card-pin]'); const top = pin.getBoundingClientRect().top + scrollY; return { top, travel: pin.offsetHeight - innerHeight }; }, id);
  const read = (id, kind) => page.evaluate(([id, kind]) => { const el = document.getElementById(id); const s = el.querySelector('.act-card-subtitle'); const c = window.__cards?.[kind]; return { phase: el.getAttribute('data-card-phase'), sub: s ? +getComputedStyle(s).opacity : null, subText: s?.textContent?.slice(0, 40), raw: c ? +c.raw().toFixed(3) : null, t: c ? +c.t().toFixed(3) : null }; }, [id, kind]);
  for (const [id, kind] of [['act-1', 'opening'], ['act-2', 'seam'], ['act-3', 'tintype'], ['act-4', 'ignite']]) {
    const g = await geo(id);
    // instant jump (script scrollTo): must snap
    await page.evaluate((y) => { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, Math.round(g.top + 0.6 * g.travel));
    const t0 = Date.now(); let r;
    for (;;) { r = await read(id, kind); if (Math.abs(r.t - r.raw) < 0.005 || Date.now() - t0 > 6000) break; await page.waitForTimeout(50); }
    const settleMs = Date.now() - t0;
    await page.waitForTimeout(1500);
    const at = await read(id, kind);
    const y = await page.evaluate(() => scrollY);
    console.log(id, 'jump→.6 settle', settleMs, 'ms', JSON.stringify(at), 'y', y, 'want', Math.round(g.top + 0.6 * g.travel));
  }
  // wheel steps through act-2 star (b): damped lag
  const g = await geo('act-2');
  await page.evaluate((y) => { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, Math.round(g.top + 0.05 * g.travel));
  await page.waitForTimeout(1500);
  await page.mouse.move(W / 2, H / 2);
  const samples = [];
  const t0 = Date.now();
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(90); }
  for (let k = 0; k < 30; k++) { const r = await read('act-2', 'seam'); samples.push([Date.now() - t0, r.raw, r.t]); if (Math.abs(r.raw - r.t) < 0.003 && k > 5) break; await page.waitForTimeout(100); }
  console.log('wheel act-2', JSON.stringify(samples));
  await browser.close(); release && release();
})();
