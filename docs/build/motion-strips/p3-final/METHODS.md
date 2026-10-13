# P3-12 measurement scripts (verbatim)

These are the scripts that produced the JSON in this folder. They ran from the session scratchpad (not committed as code, to keep this folder JSON/MD/logs only). Run with `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` and node 22; Playwright is `/opt/node22/lib/node_modules/playwright`. Chromium 141.0.7390.37 headless shell, 4 CPUs, SwiftShader (software GL), no GPU.

## widths.cjs

```js
// P3-12 step 2: per-viewport load + full scroll. Usage: node widths.cjs <baseUrl> <out.json> [--only=a,b] [--runs=N]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const crypto = require('crypto');
const fs = require('fs');
const [, , BASE, OUT, ...rest] = process.argv;
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const VPS = [
  { id: '1440x900', w: 1440, h: 900, touch: false, dpr: 1, kind: 'desktop' },
  { id: '1024x768', w: 1024, h: 768, touch: false, dpr: 1, kind: 'desktop' },
  { id: '1024x1366', w: 1024, h: 1366, touch: true, ua: IPAD_UA, dpr: 1, kind: 'tablet' },
  { id: '844x390', w: 844, h: 390, touch: true, ua: IPHONE_UA, dpr: 2, kind: 'phone-landscape' },
  { id: '390x844', w: 390, h: 844, touch: true, ua: IPHONE_UA, dpr: 2, kind: 'phone' },
  { id: '320x640', w: 320, h: 640, touch: true, ua: IPHONE_UA, dpr: 2, kind: 'phone' },
];
const only = opt.only ? String(opt.only).split(',') : null;
const RUNS = Number(opt.runs || 1);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);

async function one(browser, vp, run) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dpr, isMobile: vp.touch, hasTouch: vp.touch, ...(vp.ua ? { userAgent: vp.ua } : {}) });
  const page = await ctx.newPage();
  const R = { vp: vp.id, kind: vp.kind, run, console: [], pageErrors: [], hydration: [], failed: [], http: [] };
  page.on('console', m => { if (m.type() === 'error') { const t = m.text().slice(0, 400); R.console.push(t); if (/hydrat|#418|#423|#425|did not match|Minified React error/i.test(t)) R.hydration.push(t); } });
  page.on('pageerror', e => { const t = String(e.message).slice(0, 400); R.pageErrors.push(t); if (/hydrat|#418|#423|#425|did not match|Minified React error/i.test(t)) R.hydration.push('pageerror: ' + t); });
  page.on('requestfailed', r => R.failed.push(`${r.method()} ${r.url().replace(BASE, '')} :: ${r.failure() && r.failure().errorText}`));
  page.on('response', r => { if (r.status() >= 400) R.http.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
  await page.addInitScript(() => {
    window.__cls = 0; window.__shifts = [];
    const chain = n => { const out = []; let x = n; for (let i = 0; i < 5 && x && x.nodeType === 1; i++) { out.push(`${x.tagName.toLowerCase()}${x.id ? '#' + x.id : ''}.${String((x.className && x.className.baseVal !== undefined) ? x.className.baseVal : x.className).replace(/\s+/g, '.').slice(0, 45)}`); x = x.parentElement; } return out; };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(5), sy: Math.round(scrollY), src: (e.sources || []).slice(0, 3).map(s => ({ chain: chain(s.node), prev: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height].map(Math.round), cur: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height].map(Math.round) })) }); } } }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  });
  const t0 = Date.now();
  await page.goto(BASE + '/?skip=intro', { waitUntil: 'load', timeout: 120000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  R.heightAtLoad = await page.evaluate(() => document.documentElement.scrollHeight);
  // full scroll: step 0.8 viewport, re-reading the (growing) height until stable at the bottom
  R.scroll = await page.evaluate(async () => {
    const sl = ms => new Promise(r => setTimeout(r, ms));
    const step = Math.round(innerHeight * 0.8);
    let y = 0, n = 0, stable = 0, lastH = 0;
    for (;;) {
      const H = document.documentElement.scrollHeight;
      window.scrollTo(0, y);
      await sl(90);
      n++;
      if (y >= H - innerHeight) { if (H === lastH) { stable++; if (stable >= 3) break; } else stable = 0; lastH = H; await sl(250); } else { y += step; }
      if (n > 1500) break;
    }
    return { steps: n, finalY: Math.round(scrollY), height: document.documentElement.scrollHeight };
  });
  // settle at the bottom, then back to the top (scroll-behavior: smooth on html would animate: wait it out)
  await sleep(1200);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
  await sleep(1200);
  R.after = await page.evaluate(() => {
    const iw = document.documentElement.clientWidth;
    const off = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.right > iw + 1) && getComputedStyle(e).position !== 'fixed'; })
      .filter(e => { let p = e.parentElement; while (p && p !== document.body) { if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) return false; p = p.parentElement; } return true; })
      .slice(0, 8).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 50)} r=${Math.round(e.getBoundingClientRect().right)}`);
    const secs = [...new Set([...document.querySelectorAll('[data-section], main section[id], footer#credits')])].filter(s => s.id);
    const norm = s => s.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
    return {
      scrollWidth: document.documentElement.scrollWidth, clientWidth: iw, bodyScrollWidth: document.body.scrollWidth, offenders: off,
      h1: document.querySelectorAll('h1').length, h1Text: [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 80)),
      docHeight: document.documentElement.scrollHeight,
      lenis: !!window.__lenis,
      cls: +(window.__cls || 0).toFixed(5), shifts: window.__shifts.slice(0, 12),
      sections: secs.map(s => ({ id: s.id, h: Math.round(s.getBoundingClientRect().height), hasContent: s.getClientRects().length > 0 })),
      bodyText: norm(document.body.innerText),
      allText: (() => { const c = document.body.cloneNode(true); c.querySelectorAll('script,style,template,noscript').forEach(n => n.remove()); return norm(c.textContent.replace(/<!--.*?-->/g, '')); })(),
      closedDetails: [...document.querySelectorAll('details:not([open])')].map(d => (d.closest('[data-section]') || {}).dataset ? d.closest('[data-section]').dataset.section : '?'),
      hiddenAttr: document.querySelectorAll('[hidden]').length,
      secText: Object.fromEntries(secs.map(s => [s.id, norm(s.innerText)])),
      secAll: Object.fromEntries(secs.map(s => { const c = s.cloneNode(true); c.querySelectorAll('script,style,template,noscript').forEach(n => n.remove()); return [s.id, norm(c.textContent)]; })),
      title: document.title,
    };
  });
  R.ms = Date.now() - t0;
  await ctx.close();
  return R;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const out = { meta: { base: BASE, date: new Date().toISOString(), chromium: browser.version() }, results: [] };
  try {
    for (const vp of VPS) {
      if (only && !only.includes(vp.id)) continue;
      for (let run = 1; run <= RUNS; run++) {
        const r = await one(browser, vp, run);
        const a = r.after;
        r.bodyHash = sha(a.bodyText); r.bodyChars = a.bodyText.length; r.allHash = sha(a.allText); r.allChars = a.allText.length;
        r.secHash = Object.fromEntries(Object.entries(a.secText).map(([k, v]) => [k, sha(v)]));
        out.results.push(r);
        console.log(`${vp.id} run${run}: console=${r.console.length} pageErr=${r.pageErrors.length} hyd=${r.hydration.length} failed=${r.failed.length} http>=400=${r.http.length} overflow=${a.scrollWidth - a.clientWidth} h1=${a.h1} cls=${a.cls} height=${a.docHeight} bodyHash=${r.bodyHash} ${r.ms}ms`);
        fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
      }
    }
  } finally { await browser.close(); }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
})();
```

## modes.cjs

```js
// P3-12 steps 3 and 5: reduced motion / Pause / normal runs.
// Usage: node modes.cjs <baseUrl> <out.json> --vw=1440x900 --mode=rm|paused|normal [--loads=3] [--nodeeplinks] [--nowheel]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const [, , BASE, OUT, ...rest] = process.argv;
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const [W, H] = String(opt.vw || '1440x900').split('x').map(Number);
const MODE = opt.mode || 'normal';
const LOADS = Number(opt.loads || 3);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const INIT = (paused) => `
(() => {
  ${paused ? `try { sessionStorage.setItem('motion', 'paused'); } catch (e) {}` : ''}
  window.__aud = { ctxCreated: 0, ctxs: [], plays: [] };
  for (const k of ['AudioContext', 'webkitAudioContext']) {
    const A = window[k];
    if (!A) continue;
    const W2 = function (...a) { const c = new A(...a); window.__aud.ctxCreated++; window.__aud.ctxs.push(c); return c; };
    W2.prototype = A.prototype;
    window[k] = W2;
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { window.__aud.plays.push({ tag: this.tagName, src: String(this.currentSrc || this.src).slice(-60), t: Math.round(performance.now()) }); return play.apply(this, a); };
  window.__raf = 0; const raf = window.requestAnimationFrame; window.requestAnimationFrame = function (cb) { window.__raf++; return raf.call(window, cb); };
  window.__cls = 0; window.__shifts = [];
  const chain = n => { const out = []; let x = n; for (let i = 0; i < 4 && x && x.nodeType === 1; i++) { out.push(x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + '.' + String((x.className && x.className.baseVal !== undefined) ? x.className.baseVal : x.className).replace(/\\s+/g, '.').slice(0, 40)); x = x.parentElement; } return out; };
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(5), sy: Math.round(scrollY), src: (e.sources || []).slice(0, 2).map(s => ({ chain: chain(s.node), prev: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height].map(Math.round), cur: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height].map(Math.round) })) }); } } }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
  window.__lcp = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), el: e.element ? e.element.tagName + (e.element.id ? '#' + e.element.id : '') + '.' + String(e.element.className && e.element.className.baseVal !== undefined ? e.element.className.baseVal : e.element.className).slice(0, 40) : '', url: (e.url || '').slice(-50), size: e.size }); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
})();`;

async function mkPage(browser, label) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: MODE === 'rm' ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(INIT(MODE === 'paused'));
  const page = await ctx.newPage();
  const net = { media: [], audio: [], videoBytes: 0, errors: [], failed: [], http: [] };
  page.on('console', m => { if (m.type() === 'error') net.errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', e => net.errors.push('pageerror ' + String(e.message).slice(0, 300)));
  page.on('requestfailed', r => net.failed.push(`${r.url().replace(BASE, '')} ${r.failure() && r.failure().errorText}`));
  page.on('response', async r => {
    const rt = r.request().resourceType(); const u = r.url().replace(BASE, '');
    if (r.status() >= 400) net.http.push(`${r.status()} ${u}`);
    if (rt === 'media' || /\.(mp4|webm|mp3|m4a|ogg|wav)(\?|$)/.test(u)) {
      let n = Number(r.headers()['content-length'] || 0);
      net.media.push({ u: u.slice(0, 80), status: r.status(), n, type: rt });
      if (/video|\.mp4|\.webm/.test(r.headers()['content-type'] || u) && !/audio/.test(r.headers()['content-type'] || '')) net.videoBytes += n;
      if (/audio|\.mp3|\.m4a|\.ogg|\.wav/.test((r.headers()['content-type'] || '') + u)) net.audio.push(u.slice(0, 80));
    }
  });
  return { ctx, page, net };
}

const SAMPLE = () => {
  const anims = document.getAnimations().filter(a => a.playState === 'running' && !(a.effect && a.effect.getTiming && a.effect.getTiming().iterations === 1 && a.effect.getComputedTiming && a.effect.getComputedTiming().progress === 1));
  const vids = [...document.querySelectorAll('video')];
  const playing = vids.filter(v => !v.paused && !v.ended && v.readyState > 2);
  const aud = [...document.querySelectorAll('audio')].filter(a => !a.paused);
  const ctxs = (window.__aud && window.__aud.ctxs || []);
  return {
    running: anims.length,
    sample: anims.slice(0, 4).map(a => `${a.constructor.name}:${a.animationName || a.transitionProperty || a.id || ''}:${(a.effect && a.effect.target && (a.effect.target.className && a.effect.target.className.baseVal !== undefined ? a.effect.target.className.baseVal : a.effect.target.className)) || ''}`.slice(0, 110)),
    videosTotal: vids.length, videosPlaying: playing.length, videosWithSrc: vids.filter(v => v.currentSrc || v.src).length,
    audioEls: aud.length, audioCtxCreated: window.__aud ? window.__aud.ctxCreated : null, audioCtxRunning: ctxs.filter(c => c.state === 'running').length, audioPlays: window.__aud ? window.__aud.plays.length : null,
    gl: document.querySelectorAll('canvas').length,
    htmlAttrs: { motion: document.documentElement.getAttribute('data-motion'), boot: document.documentElement.getAttribute('data-motion-boot'), stage: document.documentElement.getAttribute('data-stage') },
    lenis: !!window.__lenis,
  };
};

async function wheelAll(page, sampleEvery = 60) {
  await page.mouse.move(W / 2, H / 2);
  const samples = [];
  let n = 0, stuck = 0, last = -1;
  const t0 = Date.now();
  for (;;) {
    await page.mouse.wheel(0, 100); await sleep(110); n++;
    if (n % sampleEvery === 0) {
      const s = await page.evaluate(SAMPLE); const y = await page.evaluate(() => Math.round(scrollY));
      samples.push({ n, y, ...s });
    }
    if (n % 10 === 0) {
      const st = await page.evaluate(() => ({ y: scrollY, h: document.documentElement.scrollHeight, ih: innerHeight }));
      if (st.y + st.ih >= st.h - 2) { if (Math.abs(st.y - last) < 1) { stuck++; if (stuck >= 3) break; } } else stuck = 0;
      last = st.y;
    }
    if (n > 2500 || Date.now() - t0 > 300000) break;
  }
  return { notches: n, secs: Math.round((Date.now() - t0) / 1000), samples };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const R = { meta: { base: BASE, mode: MODE, vw: `${W}x${H}`, date: new Date().toISOString(), chromium: browser.version() }, loads: [], deeplinks: [] };
  try {
    for (let i = 1; i <= LOADS; i++) {
      const L = { i };
      // (a) LCP load: '/' with the intro armed (qa.js method: cache off, 4 s settle)
      if (MODE === 'normal') {
        const { ctx, page, net } = await mkPage(browser, 'lcp');
        const cdp = await ctx.newCDPSession(page); await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 }); await sleep(4000);
        L.lcpArmed = await page.evaluate(() => ({ lcp: window.__lcp, cls: +window.__cls.toFixed(5), shifts: window.__shifts }));
        L.lcpArmedErrors = net.errors;
        await ctx.close();
        const c2 = await mkPage(browser, 'lcpskip');
        const cdp2 = await c2.ctx.newCDPSession(c2.page); await cdp2.send('Network.enable'); await cdp2.send('Network.setCacheDisabled', { cacheDisabled: true });
        await c2.page.goto(BASE + '/?skip=intro', { waitUntil: 'load', timeout: 120000 }); await sleep(4000);
        L.lcpSkip = await c2.page.evaluate(() => ({ lcp: window.__lcp, cls: +window.__cls.toFixed(5), shifts: window.__shifts }));
        await c2.ctx.close();
      }
      // (b) the full run: load with skip=intro, hydrated, baseline, wheel pass, section walk
      const { ctx, page, net } = await mkPage(browser, 'run');
      const t0 = Date.now();
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => window.__pageHydrated === true, null, { timeout: 20000 }).catch(() => { L.hydratedTimeout = true; });
      L.hydratedAt = await page.evaluate(() => { const m = performance.getEntriesByName('page:hydrated')[0]; return m ? Math.round(m.startTime) : null; });
      await sleep(2500);
      L.baseline = await page.evaluate(SAMPLE);
      L.raf1s = await page.evaluate(async () => { const a = window.__raf; await new Promise(r => setTimeout(r, 1000)); return window.__raf - a; });
      L.clsAtRest = await page.evaluate(() => ({ cls: +window.__cls.toFixed(5), shifts: window.__shifts }));
      if (!opt.nowheel) L.wheel = await wheelAll(page);
      await sleep(1500);
      L.afterWheel = await page.evaluate(() => ({ cls: +window.__cls.toFixed(5), shifts: window.__shifts, docH: document.documentElement.scrollHeight, h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      // section walk (qa.js method)
      L.walk = [];
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
      for (const id of ['top', 'act-1', 'journey', 'act-2', 'work', 'films', 'act-3', 'voices', 'act-4', 'contact', 'credits']) {
        await page.evaluate(i => { const e = document.getElementById(i); if (e) e.scrollIntoView(); }, id); await sleep(1500);
        L.walk.push({ id, ...(await page.evaluate(SAMPLE)) });
      }
      L.final = await page.evaluate(() => ({ cls: +window.__cls.toFixed(5), shifts: window.__shifts }));
      const hyd = L.hydratedAt;
      L.shiftsAfterHydration = hyd == null ? null : L.final.shifts.filter(s => s.t > hyd);
      L.net = { media: net.media.length, videoBytes: net.videoBytes, audioRequests: net.audio, mediaList: net.media.slice(0, 12), errors: net.errors, failed: net.failed, http: net.http };
      L.ms = Date.now() - t0;
      await ctx.close();
      R.loads.push(L);
      fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
      console.log(`${MODE} ${W}x${H} load${i}: cls_rest=${L.clsAtRest.cls} cls_wheel=${L.afterWheel.cls} cls_final=${L.final.cls} baseline.running=${L.baseline.running} videosPlaying=${L.baseline.videosPlaying} walk.running=${L.walk.map(w => w.running).join(',')} walk.vid=${L.walk.map(w => w.videosPlaying).join(',')} audioCtx=${L.baseline.audioCtxCreated}/${L.baseline.audioCtxRunning} videoBytes=${L.net.videoBytes} errs=${L.net.errors.length} ${L.ms}ms${L.lcpArmed ? ' lcpArmed=' + (L.lcpArmed.lcp.slice(-1)[0] || {}).t + ' lcpSkip=' + (L.lcpSkip.lcp.slice(-1)[0] || {}).t : ''}`);
    }
    // deep links
    if (!opt.nodeeplinks && MODE !== 'normal') {
      for (const hash of ['work', 'beyond', 'principles', 'journey']) {
        for (const variant of ['plain', 'plain', 'skip']) {
          const { ctx, page, net } = await mkPage(browser, 'dl');
          const url = BASE + (variant === 'skip' ? '/?skip=intro' : '/') + '#' + hash;
          await page.goto(url, { waitUntil: 'load', timeout: 120000 });
          await sleep(5500);
          const read = () => page.evaluate(h => { const e = document.getElementById(h); return { top: e ? Math.round(e.getBoundingClientRect().top) : null, y: Math.round(scrollY), h: document.documentElement.scrollHeight, hyd: !!window.__pageHydrated }; }, hash);
          const a = await read(); await sleep(3500); const b = await read();
          const landed = a.top != null && a.top >= -2 && a.top <= 300;
          R.deeplinks.push({ hash, variant, at5_5s: a, at9s: b, landed, stable: Math.abs((a.top ?? 0) - (b.top ?? 0)) <= 4, errors: net.errors.length });
          await ctx.close();
        }
        const lastN = R.deeplinks.filter(d => d.hash === hash);
        console.log(`${MODE} ${W}x${H} #${hash}: ${lastN.map(d => (d.landed ? 'landed' : 'MISS') + `(${d.at5_5s.top}->${d.at9s.top})`).join(' ')}`);
        fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
      }
    }
  } finally { await browser.close(); }
  fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
})();
```

## nojs.cjs

```js
// P3-12 step 4: no-JS. Usage: node nojs.cjs <baseUrl> <out.json> <shotDir> --vws=1440x900,1024x768,390x844
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const [, , BASE, OUT, SHOTS, ...rest] = process.argv;
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const VWS = String(opt.vws || '1440x900,1024x768,390x844').split(',').map(s => s.split('x').map(Number));
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const R = { meta: { base: BASE, date: new Date().toISOString(), chromium: browser.version() }, widths: {} };
  try {
    for (const [w, h] of VWS) {
      const phone = w < 640;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false, ...(phone ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: IPHONE_UA } : {}) });
      const page = await ctx.newPage();
      const errs = []; const failed = []; const scripts = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
      page.on('requestfailed', r => failed.push(r.url().replace(BASE, '')));
      page.on('request', r => { if (r.resourceType() === 'script') scripts.push(r.url().replace(BASE, '').slice(0, 60)); });
      await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
      await sleep(1500);
      const D = await page.evaluate(() => {
        const vis = e => { for (let n = e; n && n !== document.documentElement; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
        const secEls = [...document.querySelectorAll('[data-section]')];
        const secs = secEls.map(s => {
          let r = s.getBoundingClientRect();
          if (getComputedStyle(s).display === 'contents') { const rg = document.createRange(); rg.selectNodeContents(s); r = rg.getBoundingClientRect(); }
          const texts = [...s.querySelectorAll('h2,h3,p,li,figcaption,blockquote')].filter(e => e.textContent.trim());
          const why = e => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); const nm = n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + '.' + String(n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className).replace(/\s+/g, '.').slice(0, 40); if (cs.display === 'none') return 'display:none @' + nm; if (cs.visibility === 'hidden') return 'visibility:hidden @' + nm; if (Number(cs.opacity) < 0.05) return 'opacity:' + cs.opacity + ' @' + nm; if (cs.clipPath && cs.clipPath.includes('inset(100%')) return 'clip @' + nm; if (n.getAttribute('aria-hidden') === 'true' && false) return 'aria-hidden'; } return null; };
          const hiddenInfo = texts.map(e => ({ e, w: why(e) })).filter(x => x.w);
          const hidden = hiddenInfo.map(x => x.e);
          const small = texts.filter(e => parseFloat(getComputedStyle(e).fontSize) < 11);
          return { id: s.id || s.getAttribute('data-section'), section: s.getAttribute('data-section'), display: getComputedStyle(s).display, visible: vis(s), h: Math.round(r.height), w: Math.round(r.width), textEls: texts.length, hiddenText: hidden.length, hiddenSample: hiddenInfo.slice(0, 4).map(x => x.e.textContent.trim().slice(0, 40) + ' <= ' + x.w), tinyText: small.length, chars: s.innerText.trim().length };
        });
        const skip = [...document.querySelectorAll('a')].filter(a => /skip to the research/i.test(a.textContent));
        const streamed = [...document.querySelectorAll('div[hidden][id^="S:"]')].map(d => ({ id: d.id, shown: getComputedStyle(d).display !== 'none' }));
        const templates = document.querySelectorAll('template[id^="B:"]').length;
        const hs = [...document.querySelectorAll('h1')];
        const ov = document.querySelector('#intro, #intro-caps, [data-intro-overlay]');
        const bodyCS = getComputedStyle(document.body);
        // text contrast sample: foreground vs the first non-transparent background up the tree (images/gradients are not resolved: a sample, not an audit)
        const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
        const bgOf = e => { for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/[\d.]+/g); if (m && (m.length < 4 || Number(m[3]) > 0.9)) return c; } return 'rgb(255,255,255)'; };
        const samp = [...document.querySelectorAll('p, h2, h3, li')].filter(e => e.textContent.trim().length > 20 && vis(e)).filter((_, i) => i % 4 === 0).slice(0, 80);
        const lows = []; const ratios = samp.map(e => { const a = lum(getComputedStyle(e).color), b = lum(bgOf(e)); const rr = +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2); if (rr < 4.5) lows.push({ r: rr, text: e.textContent.trim().slice(0, 50), fg: getComputedStyle(e).color, bg: bgOf(e), sec: (e.closest('[data-section]') || {}).dataset && e.closest('[data-section]').dataset.section, cls: String(e.className).slice(0, 40) }); return rr; });
        window.scrollTo(0, document.documentElement.scrollHeight);
        const scrolled = Math.round(scrollY);
        return {
          dataSections: secs.length, sections: secs,
          withHeight: secs.filter(s => s.h >= 40).length, zeroHeight: secs.filter(s => s.h < 40).map(s => s.section), notVisible: secs.filter(s => !s.visible).map(s => s.section),
          hiddenTextTotal: secs.reduce((n, s) => n + s.hiddenText, 0), tinyTextTotal: secs.reduce((n, s) => n + s.tinyText, 0),
          h1: hs.length, h1Text: hs.map(x => x.textContent.trim().slice(0, 100)), h1Visible: hs.every(vis),
          skipLinks: skip.map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href'), targetExists: !!document.getElementById((a.getAttribute('href') || '').replace(/^#/, '')) })),
          streamedBlocks: streamed.length, streamedShown: streamed.filter(s => s.shown).length, templatesPending: templates,
          introVisible: ov ? vis(ov) && ov.getBoundingClientRect().height > 0 : false,
          docHeight: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, canScroll: scrolled > 0, scrolledTo: scrolled,
          bodyFont: bodyCS.fontFamily.slice(0, 60), bodyFontSize: bodyCS.fontSize, bodyColor: bodyCS.color, bodyBg: bodyCS.backgroundColor,
          contrastLows: lows, contrastSampleN: ratios.length, contrastMin: ratios.length ? Math.min(...ratios) : null, contrastMedian: ratios.length ? ratios.sort((a, b) => a - b)[Math.floor(ratios.length / 2)] : null, contrastLt45: ratios.filter(r => r < 4.5).length,
          textChars: document.body.innerText.length,
          animationsRunning: document.getAnimations().filter(a => a.playState === 'running').length,
          jsReady: document.documentElement.classList.contains('js'),
          sticky: [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'sticky').length, pins: [...document.querySelectorAll('[data-act-card-pin]')].map(p => ({ h: p.offsetHeight, stage: (p.querySelector(':scope > [data-card-stage]') || {}).offsetHeight || null })), fixedEls: [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 0).slice(0, 8).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 30)),
        };
      });
      D.errors = errs; D.failedRequests = failed; D.scriptRequests = scripts.length;
      // screenshots (JPEG): top, and a handful of sections scrolled in with instant scroll
      D.shots = [];
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
      await sleep(200);
      const pick = ['top', ...['work', 'journey', 'principles', 'contact', 'credits'].filter(i => D.sections.some(s => s.section === i))];
      for (const id of pick) {
        const ok = await page.evaluate(i => { const e = document.getElementById(i); if (!e) return false; window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + scrollY - 60)); return true; }, id);
        if (!ok) continue; await sleep(250);
        const f = `nojs-${w}x${h}-${id}.jpg`;
        await page.screenshot({ path: path.join(SHOTS, f), type: 'jpeg', quality: 55 });
        D.shots.push({ id, file: f, top: await page.evaluate(i => Math.round(document.getElementById(i).getBoundingClientRect().top), id) });
      }
      R.widths[`${w}x${h}`] = D;
      console.log(`${w}x${h}: sections=${D.dataSections} withHeight=${D.withHeight} zero=[${D.zeroHeight}] notVisible=[${D.notVisible}] hiddenText=${D.hiddenTextTotal} h1=${D.h1} skip=${JSON.stringify(D.skipLinks)} streamed ${D.streamedShown}/${D.streamedBlocks} introVisible=${D.introVisible} docH=${D.docHeight} overflow=${D.scrollWidth - D.clientWidth} contrastMin=${D.contrastMin} <4.5:${D.contrastLt45}/${D.contrastSampleN} scripts=${D.scriptRequests} errs=${errs.length}`);
      await ctx.close();
      fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
    }
  } finally { await browser.close(); }
  fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
})();
```

## lcp.cjs

```js
// P3-12 step 5: LCP in the qa.js method. Usage: node lcp.cjs <baseUrl> <out.json> --kind=mobile|desktop --w=1440 --h=900 --runs=3 [--path=/] [--label=x]
// mobile  = qa.js section 7: 390x844, isMobile+hasTouch, dsf 2, CPU 4x, 150 ms RTT, 1.6 Mbps down / 750 kbps up, cache off, goto '/', 4 s settle
// desktop = qa.js section 7: 1440x900 (or --w/--h), CPU 1x, cache off, goto '/', 4 s settle
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const [, , BASE, OUT, ...rest] = process.argv;
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const KIND = opt.kind || 'desktop';
const W = Number(opt.w || (KIND === 'mobile' ? 390 : 1440)), H = Number(opt.h || (KIND === 'mobile' ? 844 : 900));
const RUNS = Number(opt.runs || 3);
const PATHQ = opt.path || '/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = { meta: { base: BASE, kind: KIND, vw: `${W}x${H}`, path: PATHQ, label: opt.label || '', date: new Date().toISOString(), chromium: browser.version() }, runs: [] };
  try {
    for (let i = 0; i < RUNS; i++) {
      const mobile = KIND === 'mobile';
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
      page.on('pageerror', e => errs.push('pageerror ' + String(e.message).slice(0, 200)));
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (mobile) {
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      }
      await page.addInitScript(() => {
        window.__lcp = []; window.__cls = 0; window.__shifts = [];
        new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), el: e.element ? `${e.element.tagName}${e.element.id ? '#' + e.element.id : ''}.${String(e.element.className).slice(0, 40)}` : '', url: (e.url || '').slice(-60), size: e.size }); }).observe({ type: 'largest-contentful-paint', buffered: true });
        try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(5) }); } }).observe({ type: 'layout-shift', buffered: true }); } catch {}
      });
      await page.goto(BASE + PATHQ, { waitUntil: 'load', timeout: 120000 });
      await sleep(4000);
      const l = await page.evaluate(() => ({ lcp: window.__lcp, cls: +window.__cls.toFixed(5), shifts: window.__shifts, nav: (() => { const n = performance.getEntriesByType('navigation')[0]; return n ? { ttfb: Math.round(n.responseStart), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) } : null; })() }));
      const last = l.lcp[l.lcp.length - 1] || null;
      out.runs.push({ lcp: last ? last.t : null, el: last ? last.el : null, url: last ? last.url : null, cls: l.cls, shifts: l.shifts, nav: l.nav, errors: errs, all: l.lcp });
      console.log(`${opt.label || BASE} ${KIND} ${W}x${H} run${i + 1}: LCP ${last ? last.t : 'none'} ms (${last ? last.el : ''}) cls=${l.cls} load=${l.nav && l.nav.load}`);
      await ctx.close();
    }
  } finally { await browser.close(); }
  const v = out.runs.map(r => r.lcp).filter(x => x != null).sort((a, b) => a - b);
  out.summary = { n: v.length, min: v[0], median: v[Math.floor(v.length / 2)], max: v[v.length - 1], mean: v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('summary', JSON.stringify(out.summary));
})();
```

## bundle.cjs

```js
// P3-12 step 6: first-load JS/CSS gz for "/" (the scripts and stylesheets the HTML itself references; zlib level 9),
// the method of tools/capture/probes/bundle.mjs htmlAssets() and docs/build/p3-reports/W3-notes.md section 3.
const zlib = require('zlib'); const fs = require('fs');
const [, , BASE, OUT, LABEL] = process.argv;
(async () => {
  const html = await (await fetch(BASE + '/')).text();
  const urls = new Set();
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) urls.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = m[0]; const href = /\bhref="([^"]+)"/.exec(tag)?.[1]; if (!href) continue;
    if (/rel="stylesheet"/.test(tag) || /rel="(?:modulepreload|preload)"[^>]*as="(?:script|style)"|as="(?:script|style)"[^>]*rel="(?:modulepreload|preload)"/.test(tag)) urls.add(href);
  }
  const out = { label: LABEL, base: BASE, htmlBytes: Buffer.byteLength(html), js: [], css: [] };
  for (const u of urls) {
    const abs = new URL(u.replace(/&amp;/g, '&'), BASE + '/').href;
    const r = await fetch(abs); if (!r.ok) continue;
    const body = Buffer.from(await r.arrayBuffer());
    const isCss = /\.css(\?|$)/.test(abs) || (r.headers.get('content-type') || '').includes('css');
    const e = { url: abs.replace(BASE, ''), raw: body.length, gz: zlib.gzipSync(body, { level: 9 }).length };
    (isCss ? out.css : out.js).push(e);
  }
  const sum = a => a.reduce((n, x) => n + x.gz, 0);
  out.jsGz = sum(out.js); out.cssGz = sum(out.css); out.jsRaw = out.js.reduce((n, x) => n + x.raw, 0); out.cssRaw = out.css.reduce((n, x) => n + x.raw, 0);
  out.jsFiles = out.js.length; out.cssFiles = out.css.length;
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(LABEL, 'JS gz', out.jsGz, `(${out.jsFiles} files, raw ${out.jsRaw})`, 'CSS gz', out.cssGz, `(${out.cssFiles} files, raw ${out.cssRaw})`);
})();
```

## phone-dl.cjs

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const [, , BASE, OUT] = process.argv;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  for (const hash of ['work', 'beyond', 'principles', 'journey']) {
    for (const variant of ['plain', 'skip']) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
      const page = await ctx.newPage();
      await page.goto(BASE + (variant === 'skip' ? '/?skip=intro' : '/') + '#' + hash, { waitUntil: 'load', timeout: 120000 });
      await sleep(5500);
      const read = () => page.evaluate(h => { const e = document.getElementById(h); return { top: e ? Math.round(e.getBoundingClientRect().top) : null, y: Math.round(scrollY), h: document.documentElement.scrollHeight }; }, hash);
      const a = await read(); await sleep(3500); const b = await read();
      rows.push({ hash, variant, at5_5s: a, at9s: b, landed: a.top != null && a.top >= -2 && a.top <= 300 });
      console.log(hash, variant, JSON.stringify(a), JSON.stringify(b));
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify({ meta: { base: BASE, vw: '390x844', date: new Date().toISOString() }, rows, landed: rows.filter(r => r.landed).length, of: rows.length }, null, 1));
  console.log('landed', rows.filter(r => r.landed).length, 'of', rows.length);
})();
```

## footdbg.cjs

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [, , BASE, W, H, MODE] = process.argv;
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__log = []; window.__sh = [];
    let last = '';
    const snap = () => {
      const f = document.getElementById('credits'); const pc = document.querySelector('.post-credits');
      const r = f && f.getBoundingClientRect();
      const secs = Object.fromEntries([...document.querySelectorAll('section[id], footer#credits')].map(e => [e.id, Math.round(e.offsetHeight)])); const o = { fonts: document.documentElement.getAttribute('data-fonts'), secs, t: Math.round(performance.now()), sy: Math.round(scrollY), dh: document.documentElement.scrollHeight, fh: f ? Math.round(f.offsetHeight) : null, ft: f ? Math.round(r.top + scrollY) : null, pch: pc ? Math.round(pc.offsetHeight) : null, boot: document.documentElement.getAttribute('data-boot') || document.documentElement.getAttribute('data-motion-boot'), stage: document.documentElement.getAttribute('data-stage'), det: f && f.querySelector('details') ? f.querySelector('details').open : null };
      const k = JSON.stringify({ ...o, t: 0, sy: 0, dh: 0, ft: 0 });
      if (k !== last) { last = k; window.__log.push(o); }
      requestAnimationFrame(snap);
    };
    requestAnimationFrame(snap);
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__sh.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), hri: e.hadRecentInput, src: e.sources.map(s => (s.node && s.node.nodeType === 1 ? s.node.tagName.toLowerCase() + (s.node.id ? '#' + s.node.id : '') + '.' + String(s.node.className).slice(0, 25) : '?') + ' ' + [s.previousRect.y, s.previousRect.height].map(Math.round) + '->' + [s.currentRect.y, s.currentRect.height].map(Math.round)) }); }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(BASE + '/?skip=intro', { waitUntil: 'load' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.evaluate(async (mode) => {
    const sl = ms => new Promise(r => setTimeout(r, ms));
    const step = Math.round(innerHeight * 0.8);
    let y = 0, n = 0, stable = 0, lastH = 0;
    for (;;) {
      const Hh = document.documentElement.scrollHeight;
      window.scrollTo(0, y);
      await sl(mode === 'slow' ? 400 : 90);
      n++;
      if (y >= Hh - innerHeight) { if (Hh === lastH) { stable++; if (stable >= 3) break; } else stable = 0; lastH = Hh; await sl(250); } else { y += step; }
      if (n > 1500) break;
    }
  }, MODE || 'fast');
  await page.waitForTimeout(1500);
  const sh = await page.evaluate(() => window.__sh); const log = await page.evaluate(() => window.__log);
  console.log('SHIFTS', JSON.stringify(sh));
  const near = log.filter(l => sh.some(s => Math.abs(l.t - s.t) < 1500)); for (let i = 1; i < log.length; i++) { const a = log[i - 1].secs, b = log[i].secs; const d = Object.keys(b).filter(k => a[k] !== b[k]).map(k => k + ' ' + a[k] + '->' + b[k]); if (d.length) console.log('SECDIFF t=' + log[i].t + ' sy=' + log[i].sy + ' ' + d.join(', ')); }
  for (let i = 1; i < log.length; i++) if (log[i].fonts !== log[i - 1].fonts) console.log('FONTS t=' + log[i].t + ' sy=' + log[i].sy + ' ' + log[i - 1].fonts + ' -> ' + log[i].fonts);
  console.log('LOG near shifts (' + near.length + ' of ' + log.length + ')');
  for (const l of near.slice(0, 40)) console.log(JSON.stringify(l));
  console.log('LAST', JSON.stringify(log.slice(-3)));
  await browser.close();
})();
```

## compare2.py

```python
import json,sys,re,collections
head=json.load(open(sys.argv[1])); base=json.load(open(sys.argv[2])); outp=sys.argv[3]
def toks(t): return re.findall(r"[\w’'\-\.]+|[^\w\s]", t.lower().replace(' ',' '))
def diff(field,vp):
    H=[collections.Counter(toks(r['after'][field])) for r in head['results'] if r['vp']==vp]
    B=[collections.Counter(toks(r['after'][field])) for r in base['results'] if r['vp']==vp]
    keys=set().union(*H,*B); add={}; rem={}
    for k in keys:
        hmin=min(c[k] for c in H); hmax=max(c[k] for c in H); bmin=min(c[k] for c in B); bmax=max(c[k] for c in B)
        if hmin>bmax: add[k]=hmin-bmax
        if bmin>hmax: rem[k]=bmin-hmax
    return add,rem
def linediff(field,vp):
    H=[set(r['after'][field].split('\n')) for r in head['results'] if r['vp']==vp]
    B=[set(r['after'][field].split('\n')) for r in base['results'] if r['vp']==vp]
    return sorted(set.intersection(*H)-set.union(*B)), sorted(set.intersection(*B)-set.union(*H))
out={}
for vp in ['1024x1366','844x390','390x844','320x640']:
    H=[r for r in head['results'] if r['vp']==vp]; B=[r for r in base['results'] if r['vp']==vp]
    o={}
    o['docHeight']={'head':[r['after']['docHeight'] for r in H],'base':[r['after']['docHeight'] for r in B]}
    o['innerTextHash']={'head':[r['bodyHash'] for r in H],'base':[r['bodyHash'] for r in B]}
    o['textContentHash']={'head':[r['allHash'] for r in H],'base':[r['allHash'] for r in B]}
    o['textContentChars']={'head':[r['allChars'] for r in H],'base':[r['allChars'] for r in B]}
    o['innerTextChars']={'head':[r['bodyChars'] for r in H],'base':[r['bodyChars'] for r in B]}
    o['overflowPx']={'head':[r['after']['scrollWidth']-r['after']['clientWidth'] for r in H],'base':[r['after']['scrollWidth']-r['after']['clientWidth'] for r in B]}
    o['h1']={'head':[r['after']['h1'] for r in H],'base':[r['after']['h1'] for r in B]}
    o['closedDetails']={'head':sorted(H[0]['after']['closedDetails']),'base':sorted(B[0]['after']['closedDetails'])}
    ids=[]
    for r in H+B:
        for s in r['after']['sections']:
            if s['id'] not in ids: ids.append(s['id'])
    def hs(rs,i): return sorted(set(next((s['h'] for s in r['after']['sections'] if s['id']==i),None) for r in rs))
    o['sectionHeights']=[{'id':i,'head':hs(H,i),'base':hs(B,i),'delta':(hs(H,i)[0]-hs(B,i)[0]) if len(hs(H,i))==1 and len(hs(B,i))==1 else None} for i in ids]
    a,r_=diff('allText',vp); o['tokensAddedTextContent']=a; o['tokensRemovedTextContent']=r_
    la,lr=linediff('allText',vp); o['linesAddedTextContent']=la; o['linesRemovedTextContent']=lr
    a,r_=diff('bodyText',vp); o['tokensAddedInnerText']=a; o['tokensRemovedInnerText']=r_
    la,lr=linediff('bodyText',vp); o['linesAddedInnerText']=la; o['linesRemovedInnerText']=lr
    # per-section textContent hash equality (stable runs only)
    sec=[]
    for i in ids:
        hh=set(r['after']['secAll'].get(i) for r in H); bb=set(r['after']['secAll'].get(i) for r in B)
        sec.append({'id':i,'sameTextContent': (hh==bb) if (len(hh)==1 and len(bb)==1) else None})
    o['sections']=sec
    out[vp]=o
json.dump(out,open(outp,'w'),indent=1,ensure_ascii=False)
for vp,o in out.items():
    print('==',vp,'docH',o['docHeight'],'| textContent chars',o['textContentChars'],'| innerText chars',o['innerTextChars'])
    print('  textContent tokens +',sum(o['tokensAddedTextContent'].values()),'-',sum(o['tokensRemovedTextContent'].values()),'| innerText tokens +',sum(o['tokensAddedInnerText'].values()),'-',sum(o['tokensRemovedInnerText'].values()))
    print('  closed <details> head',o['closedDetails']['head'],'base',o['closedDetails']['base'])
    print('  textContent lines +',len(o['linesAddedTextContent']),'-',len(o['linesRemovedTextContent']))
    for l in o['linesAddedTextContent'][:30]: print('    +',l[:170])
    for l in o['linesRemovedTextContent'][:30]: print('    -',l[:170])
    print('  section height deltas:',[(s['id'],s['delta']) for s in o['sectionHeights'] if s['delta']])
    print('  sections with different textContent:',[s['id'] for s in o['sections'] if s['sameTextContent'] is False],' unknown(flaky):',[s['id'] for s in o['sections'] if s['sameTextContent'] is None])
```

## chunks.py

```python
import json,sys,re,difflib
head=json.load(open(sys.argv[1])); base=json.load(open(sys.argv[2])); vp=sys.argv[3]; field=sys.argv[4] if len(sys.argv)>4 else 'secAll'
H=[r for r in head['results'] if r['vp']==vp][0]; B=[r for r in base['results'] if r['vp']==vp][0]
out=[]
for sid,ht in H['after'][field].items():
    bt=B['after'][field].get(sid,'')
    a=bt.split(' '); b=ht.split(' ')
    sm=difflib.SequenceMatcher(None,a,b,autojunk=False)
    for op,i1,i2,j1,j2 in sm.get_opcodes():
        if op=='equal': continue
        dl=' '.join(a[i1:i2]); ins=' '.join(b[j1:j2])
        if len(dl)+len(ins)<6: continue
        out.append((sid,op,dl[:260],ins[:260],len(dl),len(ins)))
for o in out: print(o[0],'|',o[1],'| DEL:',o[2],'| INS:',o[3],'|',o[4],o[5])
```

## srv.sh

```bash
#!/bin/bash
# usage: srv.sh start <tree> <port> | stop <port>
SP=/tmp/claude-0/-home-user-Personal-blog-/7ca933b7-5e56-569a-94dd-f539ac2c18f0/scratchpad
case "$1" in
  start)
    cd "$2" || exit 1
    setsid nohup npx next start -p "$3" > $SP/p3final/server-$3.log 2>&1 &
    for i in $(seq 1 60); do curl -s -o /dev/null -m 2 http://localhost:$3/robots.txt && { echo "up :$3"; exit 0; }; sleep 0.5; done
    echo "FAILED to start :$3"; exit 1;;
  stop)
    fuser -k -TERM $2/tcp >/dev/null 2>&1
    sleep 1.5
    pgrep -f "next start -p $2" >/dev/null && pkill -f "next start -p $2"
    sleep 0.5
    curl -s -o /dev/null -m 2 http://localhost:$2/robots.txt && echo "STILL UP :$2" || echo "stopped :$2";;
esac
```

## alt-lcp.sh

```bash
#!/bin/bash
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
SP=/tmp/claude-0/-home-user-Personal-blog-/7ca933b7-5e56-569a-94dd-f539ac2c18f0/scratchpad
OUT=/home/user/Personal-blog-/docs/build/motion-strips/p3-final
cd $SP/p3final
./srv.sh stop 3161; ./srv.sh stop 3162
for round in 1 2; do
  for tree in head base; do
    if [ $tree = head ]; then T=/home/user/Personal-blog-; P=3161; else T=$SP/p3-base; P=3162; fi
    ./srv.sh start $T $P || exit 1
    node lcp.cjs http://localhost:$P $OUT/lcp-mobile-$tree-r$round.json --kind=mobile --runs=3 --label=$tree-r$round
    ./srv.sh stop $P
  done
done
echo ALLDONE
```

## cards-alt.sh

```bash
#!/bin/bash
# alternate HEAD (ef0a549, :3161) and e91fbd6 (qa-base, :3162), five cards probes each at 1440x900, one server at a time
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
SP=/tmp/claude-0/-home-user-Personal-blog-/7ca933b7-5e56-569a-94dd-f539ac2c18f0/scratchpad
cd /home/user/Personal-blog-
$SP/p3final/srv.sh stop 3161; $SP/p3final/srv.sh stop 3162
for i in 1 2 3 4 5; do
  for tree in head qabase; do
    if [ $tree = head ]; then T=/home/user/Personal-blog-; P=3161; else T=$SP/qa-base; P=3162; fi
    $SP/p3final/srv.sh start $T $P || exit 1
    node tools/capture/p3-probes.mjs http://localhost:$P $SP/p3final/cards-$tree-$i --only=cards --vw=1440x900 2>&1 | tail -2
    $SP/p3final/srv.sh stop $P
  done
done
echo ALLDONE
```
