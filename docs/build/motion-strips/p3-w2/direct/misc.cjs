// W2 measure: (a) LoAF at GL context creation (P3-6 #4), (b) the kraken on the GL tier (P3-6 #11, lab),
// (c) act h2 text present for SR + subtitle computed opacity in phase b (P3-7 #1, #4).
const fs = require('fs');
const { launch } = require('/home/user/Personal-blog-/tools/capture/browser.js');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const { browser, release } = await launch({ headless: true });
  // (a)
  for (let k = 0; k < 2; k++) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.addInitScript(() => { window.__lo = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) { const end = e.startTime + e.duration; const sc = [...(e.scripts || [])]; const ms = sc.reduce((n, s) => n + s.duration, 0); const sl = e.styleAndLayoutStart ? end - e.styleAndLayoutStart : 0; window.__lo.push({ s: Math.round(e.startTime), d: Math.round(e.duration), w: Math.round(Math.min(e.duration, ms + sl)), top: sc.sort((a, b) => b.duration - a.duration).slice(0, 2).map((s) => Math.round(s.duration) + ' ' + String(s.invoker).slice(0, 60) + ' ' + String(s.sourceURL).slice(-30)) }); } }).observe({ type: 'long-animation-frame', buffered: true }); });
    await page.goto('http://localhost:3161/?skip=intro&gl=force', { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__lenis, null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await page.mouse.move(720, 450);
    for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(150); const c = await page.evaluate(() => window.__gl?.contexts ?? 0); if (c) break; }
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => { const ctxEv = (window.__gl?.log ?? []).find((e) => e.ev === 'context'); const t = ctxEv?.t ?? null; return { contextT: t, compiles: (window.__gl?.compiles ?? []).slice(0, 4), near: t == null ? [] : window.__lo.filter((l) => l.s + l.d >= t - 300 && l.s <= t + 1500 && l.d > 50) }; });
    r.overByWork = r.near.filter((l) => l.w > 50).length; r.overByDur = r.near.length;
    console.log('ctxloaf', k, JSON.stringify(r));
    await page.context().close();
  }
  // (b) kraken on GL (lab seam)
  {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto('http://localhost:3161/lab/p3/gl?gl=force', { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__glLab, null, { timeout: 20000 });
    await page.evaluate(() => window.__glLab.card('seam'));
    await page.waitForFunction(() => (window.__gl?.log ?? []).some((e) => e.ev === 'settle' && e.card === 'seam'), null, { timeout: 40000 });
    for (const [kr, p] of [[0, 0.1], [1, 0.1], [1, 0.3]]) {
      await page.evaluate(({ kr, p }) => { window.__glLab.kraken(kr); window.__glLab.p(p); }, { kr, p }); await page.waitForTimeout(700);
      const b = await page.locator('[data-act-card-frame]').first().boundingBox();
      await page.screenshot({ path: `${OUT}/kraken-k${kr}-p${p}.png`, clip: b });
    }
    console.log('kraken shots done', JSON.stringify(await page.evaluate(() => ({ gl: document.querySelector('[data-act-card-frame]')?.getAttribute('data-gl'), draws: window.__gl?.draws }))));
    await page.context().close();
  }
  // (c) h2 + subtitle in phase b on the page (css tier)
  {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto('http://localhost:3161/?skip=intro,smooth&debug=cards', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 450) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    await page.waitForTimeout(800);
    for (const k of ['opening', 'seam', 'tintype', 'ignite']) {
      await page.evaluate((k) => { const pin = document.querySelector(`[data-act-card-pin="${k}"]`); const st = pin.querySelector(':scope > [data-card-stage]'); scrollTo(0, Math.round(pin.getBoundingClientRect().top + scrollY + 0.58 * (pin.offsetHeight - st.offsetHeight))); }, k);
      await page.waitForTimeout(1800);
      const r = await page.evaluate((k) => { const sec = document.querySelector(`[data-act-card="${k}"]`); const sub = sec.querySelector('.act-card-subtitle'); const h2 = sec.querySelector('h2'); const cs = getComputedStyle(sub); return { phase: sec.getAttribute('data-card-phase'), subOpacity: cs.opacity, subClip: cs.clipPath, subText: sub.textContent.slice(0, 60), subRect: (({ top, height, width }) => ({ top: Math.round(top), height: Math.round(height), width: Math.round(width) }))(sub.getBoundingClientRect()), h2: h2 ? { text: h2.textContent.trim().slice(0, 40), ariaHidden: h2.getAttribute('aria-hidden'), vis: getComputedStyle(h2).visibility } : null }; }, k);
      const b = await page.locator(`[data-act-card="${k}"] [data-card-stage]`).first().boundingBox();
      await page.screenshot({ path: `${OUT}/phaseb-${k}.png`, clip: { x: 0, y: Math.max(0, b.y), width: 1440, height: 900 } });
      console.log('phaseb', k, JSON.stringify(r));
    }
    await page.context().close();
  }
  await browser.close(); release && release();
})();
