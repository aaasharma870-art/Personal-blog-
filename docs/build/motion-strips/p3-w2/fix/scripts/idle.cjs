// idle fps per section (rAF count over 1.5 s after a 2.5 s park), and the infinite animations running
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const B = process.env.B || 'http://localhost:3161';
const [W, H] = (process.env.VW || '1440x900').split('x').map(Number);
const IDS = (process.env.IDS || 'top,act-1,journey').split(',');
(async () => {
  const { browser, release } = await launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
  await page.goto(`${B}/?skip=intro${process.env.Q ? '&' + process.env.Q : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  for (const id of IDS) {
    await page.evaluate((id) => { const el = document.getElementById(id); const y = el ? el.getBoundingClientRect().top + scrollY + (id === 'journey' ? innerHeight * 0.5 : 0) : 0; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, id);
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else res({ fps: +(n / ((performance.now() - t0) / 1000)).toFixed(1), anims: document.getAnimations().filter((a) => a.playState === 'running').length, animTargets: [...new Set(document.getAnimations().filter((a) => a.playState === 'running').map((a) => { const t = a.effect?.target; return t ? (t.className?.baseVal ?? t.className ?? t.tagName).toString().slice(0, 40) : '?'; }))].slice(0, 8), videos: [...document.querySelectorAll('video')].filter((v) => !v.paused).length }); }; requestAnimationFrame(f); }));
    console.log(W, id, JSON.stringify(r));
  }
  await browser.close(); release && release();
})();
