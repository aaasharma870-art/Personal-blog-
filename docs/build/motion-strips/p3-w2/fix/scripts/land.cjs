const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
(async () => {
  const { browser, release } = await launch({ headless: true });
  for (const q of ['?skip=intro,smooth', '?skip=intro']) for (const id of ['act-1', 'act-2', 'act-3', 'act-4']) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
    await page.goto(`http://localhost:3161/${q}#${id}`, { waitUntil: 'load' });
    const t0 = Date.now(); const seen = [];
    let last = null;
    while (Date.now() - t0 < 6000) {
      const p = await page.evaluate((id) => { const pin = document.querySelector(`#${id} > [data-act-card-pin]`); const st = pin.querySelector(':scope > [data-card-stage]'); return +((scrollY - (pin.getBoundingClientRect().top + scrollY)) / (pin.offsetHeight - st.offsetHeight)).toFixed(3); }, id);
      if (p !== last) { seen.push([Date.now() - t0, p]); last = p; }
      await page.waitForTimeout(100);
    }
    console.log(W, q, id, JSON.stringify(seen));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
