const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const OUT = '/home/user/Personal-blog-/docs/build/motion-strips/p3-w2/fix/';
(async () => {
  const { browser, release } = await launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto('http://localhost:3161/lab/p3/gl?gl=force', { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__glLab, null, { timeout: 20000 });
  await page.evaluate(() => window.__glLab.card('seam'));
  await page.waitForFunction(() => (window.__gl?.log ?? []).some((e) => e.ev === 'settle' && e.card === 'seam'), null, { timeout: 40000 });
  const fr = await page.$('[data-act-card-frame]');
  const b = await fr.boundingBox();
  for (const kr of [0, 0.5, 1]) {
    await page.evaluate((kr) => { window.__glLab.kraken(kr); window.__glLab.p(0.02); }, kr);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}kraken-gl-k${kr}-p0.02.jpg`, type: 'jpeg', quality: 65, clip: b });
  }
  console.log(JSON.stringify(await page.evaluate(() => ({ gl: document.querySelector('[data-act-card-frame]')?.getAttribute('data-gl'), draws: window.__gl?.draws }))));
  await browser.close(); release && release();
})();
