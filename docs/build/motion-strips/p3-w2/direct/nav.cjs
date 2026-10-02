// W2 measure: direct checks of lenis.hash.load, lenis.fastlane and cards.landAt.
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const B = 'http://localhost:3161';
const what = (process.argv[2] || 'hash,land,fast').split(',');
(async () => {
  const { browser, release } = await launch({ headless: true });
  const newPage = async (w = 1440, h = 900) => (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const measure = (page, id) => page.evaluate((id) => {
    const el = document.getElementById(id);
    const pin = el?.querySelector(':scope > [data-act-card-pin]');
    const stage = pin?.querySelector(':scope > [data-card-stage]');
    const top = Math.round(el.getBoundingClientRect().top);
    const out = { y: Math.round(scrollY), top, lenis: !!window.__lenis, focus: document.activeElement?.id || document.activeElement?.tagName };
    if (pin && stage) { const pt = pin.getBoundingClientRect().top + scrollY; out.p = +((scrollY - pt) / (pin.offsetHeight - stage.offsetHeight)).toFixed(3); out.travel = pin.offsetHeight - stage.offsetHeight; }
    return out;
  }, id);
  if (what.includes('hash')) for (const q of ['?skip=intro', '?skip=intro,smooth']) for (let k = 0; k < 3; k++) {
    const page = await newPage();
    await page.goto(`${B}/${q}#work`, { waitUntil: 'load' });
    const at = [];
    for (const ms of [1500, 3000, 6000]) { await page.waitForTimeout(ms - (at.length ? [1500, 3000, 6000][at.length - 1] : 0)); at.push({ ms, ...(await measure(page, 'work')) }); }
    console.log('hash #work', q, k, JSON.stringify(at));
    await page.context().close();
  }
  if (what.includes('land')) for (const q of ['?skip=intro', '?skip=intro,smooth']) for (const id of ['act-1', 'act-2', 'act-3', 'act-4']) {
    const page = await newPage();
    await page.goto(`${B}/${q}#${id}`, { waitUntil: 'load' });
    await page.waitForTimeout(2500); const a = await measure(page, id);
    await page.waitForTimeout(4000); const b = await measure(page, id);
    // in-page anchor link (the W2-notes smoke path): from the top, click a link to #id
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800);
    await page.evaluate((id) => { const a = document.createElement('a'); a.href = '#' + id; a.textContent = 'x'; a.style.cssText = 'position:fixed;top:200px;left:10px;z-index:99'; document.body.appendChild(a); a.click(); }, id);
    await page.waitForTimeout(3500); const c = await measure(page, id);
    console.log('land', q, id, JSON.stringify({ load2500: a, load6500: b, link: c }));
    await page.context().close();
  }
  if (what.includes('fast')) for (const [W, H] of [[1440, 900], [1024, 768]]) for (let k = 0; k < 2; k++) {
    const page = await newPage(W, H);
    await page.goto(`${B}/?skip=intro`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
    const cold = k === 0 ? await page.evaluate(() => new Promise((resolve) => {
      const pill = document.querySelector('header [data-fast-lane]'); const t0 = performance.now(); let at = null; pill.click();
      const f = () => { const t = performance.now() - t0; if (at == null && document.activeElement?.closest?.('#work')) at = Math.round(t); if (t > 2500) resolve({ coldFocusedAt: at, workTop: Math.round(document.getElementById('work').getBoundingClientRect().top) }); else requestAnimationFrame(f); }; requestAnimationFrame(f);
    })) : null;
    await page.mouse.move(W / 2, H / 2);
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(200); }
    await page.waitForTimeout(8000);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(() => !window.__lenis || window.__lenis.isScrolling === false, null, { timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => new Promise((resolve) => {
      const pill = document.querySelector('header [data-fast-lane]'); const t0 = performance.now(); let at = null, frames = 0, maxDt = 0, last = t0; pill.click();
      const f = () => { const n = performance.now(); frames++; maxDt = Math.max(maxDt, n - last); last = n; const t = n - t0; if (at == null && document.activeElement?.closest?.('#work')) at = Math.round(t); if (t > 1500) resolve({ focusedAt: at, frames, maxFrameMs: Math.round(maxDt), workTop: Math.round(document.getElementById('work').getBoundingClientRect().top) }); else requestAnimationFrame(f); }; requestAnimationFrame(f);
    }));
    console.log('fast', W, k, JSON.stringify({ cold, warm: r }));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
