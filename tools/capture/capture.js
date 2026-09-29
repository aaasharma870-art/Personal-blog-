// Shared reference-capture harness.
// Usage: node capture.js <url> <outDir> [--settle=8000] [--headed]
// Produces: desktop (1440x900) + mobile (390x844) intro timelapse, scroll-position
// sequence (0..100% plus intermediates), a reduced-motion frame, a webm screen
// recording per viewport, and meta.json (load outcome, doc height, fonts, console errors).
// WebGL2 works headless via SwiftShader (software; slow but renders).
const { launch } = require('./browser'); // throttled: max 2 browsers machine-wide, below-normal priority
const fs = require('fs');
const path = require('path');

const [, , url, outDir, ...rest] = process.argv;
if (!url || !outDir) { console.error('usage: node capture.js <url> <outDir>'); process.exit(1); }
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const SETTLE = Number(opt.settle || 8000);
fs.mkdirSync(outDir, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run(label, viewport, isMobile) {
  const { browser, release } = await launch({ headless: !opt.headed });
  const ctx = await browser.newContext({
    viewport, deviceScaleFactor: 1, isMobile, hasTouch: isMobile,
    ...(isMobile ? {} : { recordVideo: { dir: path.join(outDir, `${label}-video`), size: viewport } }), // desktop-only recording (lighter)
    userAgent: isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : undefined,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 200)));
  const meta = { url, label, viewport, started: new Date().toISOString() };
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    meta.status = resp && resp.status();
  } catch (e) { meta.gotoError = e.message.slice(0, 300); }
  // Intro timelapse
  for (const t of [0, 1000, 2500, 4500, SETTLE]) {
    const prev = t === 0 ? 0 : [0, 1000, 2500, 4500, SETTLE][[0, 1000, 2500, 4500, SETTLE].indexOf(t) - 1];
    await sleep(t - prev);
    await page.screenshot({ path: path.join(outDir, `${label}-intro-${String(t).padStart(5, '0')}ms.png`) }).catch(() => {});
  }
  // Pointer move over hero to trigger pointer-reactive effects (desktop)
  if (!isMobile) {
    for (const [x, y] of [[300, 300], [720, 450], [1100, 300], [900, 700]]) { await page.mouse.move(x, y, { steps: 12 }); await sleep(250); }
    await page.screenshot({ path: path.join(outDir, `${label}-hero-pointer.png`) }).catch(() => {});
  }
  // Scroll sequence: use wheel for smooth-scroll libs (Lenis/Locomotive hijack window.scrollTo)
  const docH = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)).catch(() => 0);
  meta.docHeight = docH;
  const steps = 16;
  const totalTravel = Math.max(docH - viewport.height, viewport.height * 8); // WebGL sites often have short DOM but scroll-driven scenes
  for (let i = 1; i <= steps; i++) {
    const delta = totalTravel / steps;
    if (isMobile) await page.evaluate(d => window.scrollBy(0, d), delta).catch(() => {});
    else { for (let k = 0; k < 6; k++) { await page.mouse.wheel(0, delta / 6); await sleep(60); } }
    await sleep(1400);
    const y = await page.evaluate(() => window.scrollY).catch(() => -1);
    await page.screenshot({ path: path.join(outDir, `${label}-scroll-${String(i).padStart(2, '0')}of${steps}-y${y}.png`) }).catch(() => {});
  }
  meta.fonts = await page.evaluate(() => [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,span')].slice(0, 400).map(e => getComputedStyle(e).fontFamily))].slice(0, 12)).catch(() => []);
  meta.headings = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].slice(0, 30).map(h => { const cs = getComputedStyle(h); return { tag: h.tagName, text: h.innerText.trim().slice(0, 80), fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight, fontFamily: cs.fontFamily.slice(0, 60) }; })).catch(() => []);
  meta.canvases = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height }))).catch(() => []);
  meta.scripts = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).slice(0, 40)).catch(() => []);
  meta.libsGuess = await page.evaluate(() => ({ gsap: !!window.gsap, THREE: !!window.THREE, lenis: !!document.querySelector('.lenis, html.lenis'), barba: !!window.barba, locomotive: !!document.querySelector('[data-scroll-container]') })).catch(() => ({}));
  meta.consoleErrors = errors.slice(0, 20);
  await ctx.close();
  await browser.close();
  release();
  fs.writeFileSync(path.join(outDir, `${label}-meta.json`), JSON.stringify(meta, null, 2));
}

async function reducedMotion() {
  const { browser, release } = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch {}
  await sleep(SETTLE);
  await page.screenshot({ path: path.join(outDir, 'reduced-motion-desktop.png') }).catch(() => {});
  await browser.close();
  release();
}

(async () => {
  await run('desktop', { width: 1440, height: 900 }, false);
  await run('mobile', { width: 390, height: 844 }, true);
  await reducedMotion();
  console.log('done', outDir);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
