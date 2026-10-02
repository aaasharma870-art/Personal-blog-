// W2 measure: direct check of words.titles (leftArmed 1, statics 1) on /lab/p3/words.
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
(async () => {
  const { browser, release } = await launch({ headless: true });
  for (let k = 0; k < 2; k++) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto('http://localhost:3161/lab/p3/words?debug=words,spotlight', { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__words, null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(k === 0 ? 2500 : 8000);
    const atTop = await page.evaluate(() => [...document.querySelectorAll('[data-words-state]')].map((e) => ({ kind: e.getAttribute('data-words'), beat: e.getAttribute('data-beat'), state: e.getAttribute('data-words-state'), top: Math.round(e.getBoundingClientRect().top) })));
    const r = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      window.scrollTo(0, 0); await sleep(300);
      const step = Math.round(innerHeight * 0.3); let n = 0;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await sleep(++n % 3 === 0 ? 1000 : 160); }
      await sleep(2500);
      const left = [...document.querySelectorAll('[data-words-state]')].map((e) => ({ kind: e.getAttribute('data-words'), beat: e.getAttribute('data-beat'), state: e.getAttribute('data-words-state'), top: Math.round(e.getBoundingClientRect().top + scrollY) }));
      const ids = new Set(left.map((l) => l.beat));
      return { left, statics: window.__words.log.filter((e) => e.ev === 'static'), logFor: window.__words.log.filter((e) => [...ids].some((b) => String(e.id).includes(b))).slice(-10), spotFor: (window.__spotlight?.log ?? []).filter((e) => [...ids].some((b) => String(e.id).includes(b))).slice(-10), H: document.documentElement.scrollHeight };
    });
    console.log('run', k, 'atTopArmed', JSON.stringify(atTop), JSON.stringify(r));
    await page.context().close();
  }
  await browser.close(); release && release();
})();
