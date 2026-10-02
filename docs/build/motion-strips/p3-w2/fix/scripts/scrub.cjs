// W2 fix visual check: each pinned card at a set of p, viewport JPEGs, waiting for the damped p to settle
const fs = require('fs');
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
const OUT = process.env.OUT; fs.mkdirSync(OUT, { recursive: true });
const PS = (process.env.PS || '0.05,0.22,0.5,0.75,0.9,1').split(',').map(Number);
const Q = process.env.Q || '';
(async () => {
  const { browser, release } = await launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
  await page.goto(`http://localhost:3161/?skip=intro&debug=cards${Q ? '&' + Q : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__lenis && Object.keys(window.__cards || {}).length >= 4, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const log = [];
  for (const [id, kind] of [['act-1', 'opening'], ['act-2', 'seam'], ['act-3', 'tintype'], ['act-4', 'ignite']]) {
    for (const p of PS) {
      await page.evaluate(([id, p]) => { const pin = document.querySelector(`#${id} > [data-act-card-pin]`); const y = pin.getBoundingClientRect().top + scrollY + p * (pin.offsetHeight - innerHeight); window.__lenis.scrollTo(Math.round(y), { immediate: true, force: true }); }, [id, p]);
      const t0 = Date.now();
      await page.waitForFunction((k) => { const c = window.__cards?.[k]; return c && Math.abs(c.t() - c.raw()) < 0.004; }, kind, { timeout: 8000, polling: 50 }).catch(() => {});
      await page.waitForTimeout(900);
      const st = await page.evaluate(([id, k]) => { const c = window.__cards[k]; const s = document.querySelector(`#${id} .act-card-subtitle`); return { raw: +c.raw().toFixed(3), t: +c.t().toFixed(3), phase: document.getElementById(id).getAttribute('data-card-phase'), sub: s ? +(+getComputedStyle(s).opacity).toFixed(2) : null }; }, [id, kind]);
      const name = `${kind}-p${p}`;
      await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 62 });
      log.push({ name, settleMs: Date.now() - t0 - 900, ...st });
    }
  }
  fs.writeFileSync(`${OUT}/log.json`, JSON.stringify(log, null, 1));
  console.log(log.map((l) => `${l.name} t=${l.t} raw=${l.raw} ${l.phase} sub=${l.sub} settle=${l.settleMs}`).join('\n'));
  await browser.close(); release && release();
})();
