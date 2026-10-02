// W2 measure: P3-6 #4/#5 under a real wheel scroll with ?gl=force: tier switches while 0<p<1 ON SCREEN,
// contexts, compiles while moving. Records each logged event with the card's on-screen state.
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const [W, H] = (process.argv[2] || '1440x900').split('x').map(Number);
(async () => {
  const { browser, release } = await launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
  await page.goto('http://localhost:3161/?skip=intro&gl=force', { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.mouse.move(W / 2, H / 2);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let n = 0;
  while (true) {
    await page.mouse.wheel(0, 240); await page.waitForTimeout(110); n++;
    if (n % 40 === 0) await page.waitForTimeout(800);
    const y = await page.evaluate(() => scrollY + innerHeight);
    if (y >= total - 4 || n > 1200) break;
  }
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const g = window.__gl || {};
    const log = (g.log || []).slice();
    const mid = log.filter((e) => /^(engage|settle|disengage)$/.test(e.ev) && e.p > 0 && e.p < 1);
    return { contexts: g.contexts, draws: g.draws, mid, compilesMoving: (g.compiles || []).filter((c) => c.moving), compiles: (g.compiles || []).length, events: log.filter((e) => e.ev !== 'draw').slice(0, 60).map((e) => `${Math.round(e.t)} ${e.ev} ${e.card ?? ''} ${e.p ?? ''}`) };
  });
  console.log(W, 'wheels', n, JSON.stringify(r));
  await browser.close(); release && release();
})();
