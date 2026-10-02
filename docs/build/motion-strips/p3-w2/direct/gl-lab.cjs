// W2 measure: direct check of the gl.lab failure (draws < 6 for seam + every ALT in a sequential lab run).
// Fresh page per card: card(id), wait until the GL log shows engage/settle FOR THAT CARD, then step p.
const crypto = require('crypto'); const fs = require('fs');
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const ids = (process.argv[3] || 'seam,opening-alt,seam-alt,tintype-alt,ignite-alt').split(',');
(async () => {
  const { browser, release } = await launch({ headless: true });
  const res = {};
  for (const fresh of [true, false]) {
    let page = null;
    for (const id of ids) {
      if (fresh || !page) { if (page && fresh) await page.context().close(); page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); await page.goto('http://localhost:3161/lab/p3/gl?gl=force', { waitUntil: 'load' }); await page.waitForFunction(() => !!window.__glLab, null, { timeout: 20000 }); }
      const n0 = await page.evaluate(() => (window.__gl?.log ?? []).length);
      await page.evaluate((id) => window.__glLab.card(id), id);
      const card = id.replace(/-alt$/, '');
      const t0 = Date.now();
      const ok = await page.waitForFunction(({ n0, card }) => (window.__gl?.log ?? []).slice(n0).some((e) => (e.ev === 'settle' || e.ev === 'engage') && e.card === card), { n0, card }, { timeout: 40000, polling: 50 }).then(() => true, () => false);
      const ms = Date.now() - t0;
      await page.waitForTimeout(500);
      const d0 = await page.evaluate(() => window.__gl?.draws ?? 0);
      const hashes = [];
      for (const v of [0.05, 0.22, 0.45, 0.75, 0.97]) {
        await page.evaluate((v) => window.__glLab.p(v), v); await page.waitForTimeout(500);
        const b = await page.locator('[data-act-card-frame]').first().boundingBox();
        const buf = await page.screenshot({ clip: b });
        fs.writeFileSync(`${OUT}/${fresh ? 'fresh' : 'seq'}-${id}-p${v}.png`, buf);
        hashes.push(crypto.createHash('md5').update(buf).digest('hex').slice(0, 8));
      }
      const s = await page.evaluate((n0) => ({ draws: window.__gl?.draws ?? 0, contexts: window.__gl?.contexts, gl: document.querySelector('[data-act-card-frame]')?.getAttribute('data-gl'), log: (window.__gl?.log ?? []).slice(n0).slice(-8) }), n0);
      res[`${fresh ? 'fresh' : 'seq'}:${id}`] = { engagedForCard: ok, ms, draws: s.draws - d0, distinctFrames: new Set(hashes).size, gl: s.gl, contexts: s.contexts, log: s.log };
      console.log(fresh ? 'fresh' : 'seq', id, JSON.stringify(res[`${fresh ? 'fresh' : 'seq'}:${id}`]));
    }
    if (page) await page.context().close();
  }
  fs.writeFileSync(`${OUT}/gl-lab.json`, JSON.stringify(res, null, 1));
  await browser.close(); release && release();
})();
