// Supplemental M5 probes (read-only against the running server).
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs');
const path = require('path');
const BASE = process.argv[2] || 'http://localhost:3161';
const OUT = process.argv[3];
const ONLY = (process.argv[4] || 'all').split(',');
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = {};
const on = k => ONLY.includes('all') || ONLY.includes(k);

async function mk(browser, o = {}, label = '') {
  const ctx = await browser.newContext({ viewport: { width: o.w || 1440, height: o.h || 900 }, isMobile: !!o.mobile, hasTouch: !!o.mobile,
    javaScriptEnabled: o.js !== false, reducedMotion: o.reduced ? 'reduce' : 'no-preference', deviceScaleFactor: o.mobile ? 2 : 1 });
  const page = await ctx.newPage();
  page.__errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') page.__errs.push(`[${label}] ${m.type()}: ${m.text().slice(0, 300)}`); });
  page.on('pageerror', e => page.__errs.push(`[${label}] pageerror ${e.message.slice(0, 300)}`));
  if (o.instr) await page.addInitScript(() => {
    window.__raf = 0; const orig = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => orig(t => { window.__raf++; cb(t); });
    window.__styleMut = 0; window.__mutTargets = {};
    const mo = new MutationObserver(ms => { for (const m of ms) { window.__styleMut++; const t = m.target; const k = (t.id ? '#' + t.id : '') + '.' + String(t.className?.baseVal ?? t.className ?? '').slice(0, 40) + ':' + t.tagName + ':' + m.attributeName; window.__mutTargets[k] = (window.__mutTargets[k] || 0) + 1; } });
    document.addEventListener('DOMContentLoaded', () => mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'd', 'transform', 'cx', 'cy', 'x', 'y', 'points', 'opacity'], subtree: true }));
  });
  return { ctx, page };
}
const jump = (page, id) => page.evaluate(i => { const el = document.getElementById(i); if (!el) return false; const y = el.getBoundingClientRect().top + window.scrollY; window.scrollTo({ top: y, behavior: 'instant' }); return true; }, id);

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    // A. no-JS screenshots, instant scroll, 1440 + 390; captions + intro overlay visibility
    if (on('nojs')) for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
      const { ctx, page } = await mk(browser, { js: false, w, h, mobile }, 'nojs' + w);
      await page.goto(BASE + '/', { waitUntil: 'load' });
      R['nojs' + w] = await page.evaluate(() => {
        const vis = (e) => { let n = e; while (n && n !== document.documentElement) { const cs = getComputedStyle(n); if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none' || (cs.clipPath && cs.clipPath.includes('inset(100%'))) return false; n = n.parentElement; } return true; };
        const intro = document.getElementById('intro');
        const caps = [...document.querySelectorAll('.scene-caption')];
        const txt = [...document.querySelectorAll('main *')].filter(e => e.childElementCount === 0 && e.textContent.trim() && !e.closest('.sr-only,[aria-hidden="true"],noscript,script,style,template'));
        const hidden = txt.filter(e => !vis(e));
        const bySec = {};
        for (const e of hidden) { const s = e.closest('section[id]')?.id || '(none)'; (bySec[s] ||= []).push(e.textContent.trim().slice(0, 40)); }
        const imgs = [...document.querySelectorAll('main img')];
        return { introExists: !!intro, introVisible: intro ? vis(intro) && intro.getBoundingClientRect().height > 0 : null,
          captions: caps.length, captionsHidden: caps.filter(c => !vis(c)).map(c => c.textContent.trim().slice(0, 50)),
          hiddenLeafText: Object.fromEntries(Object.entries(bySec).map(([k, v]) => [k, { n: v.length, sample: v.slice(0, 4) }])),
          imgs: imgs.length, imgsNoSrc: imgs.filter(i => !i.getAttribute('src')).length,
          bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow };
      });
      for (const id of ['top', 'about', 'journey', 'work', 'kill-list', 'films', 'beyond', 'voices', 'principles', 'contact', 'credits']) {
        if (await jump(page, id)) { await sleep(700); await page.screenshot({ path: path.join(OUT, `nojs${w}-${id}.png`) }); }
      }
      await ctx.close();
    }
    // B. media blocked, instant scroll
    if (on('nomedia')) {
      const { ctx, page } = await mk(browser, {}, 'noMedia');
      let blocked = 0;
      await page.route('**/*', r => ['image', 'media'].includes(r.request().resourceType()) ? (blocked++, r.abort()) : r.continue());
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 80)); } });
      R.nomedia = await page.evaluate(() => ({ brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length, imgs: document.querySelectorAll('img').length, videos: document.querySelectorAll('video').length, captions: document.querySelectorAll('.scene-caption').length }));
      R.nomedia.blockedRequests = blocked;
      R.nomedia.pageErrors = page.__errs.filter(e => /pageerror/.test(e));
      for (const id of ['top', 'act-1', 'journey', 'act-2', 'work', 'films', 'act-3', 'beyond', 'act-4', 'contact']) {
        if (await jump(page, id)) { await sleep(900); await page.screenshot({ path: path.join(OUT, `nomedia-${id}.png`) }); }
      }
      await ctx.close();
    }
    // C. motion: control vs reduced vs pause, with rAF + style mutation + WAAPI + video + canvas counters
    if (on('motion')) {
      R.motion = {};
      for (const mode of ['control', 'reduced', 'pause']) {
        const { ctx, page } = await mk(browser, { reduced: mode === 'reduced', instr: true }, mode);
        await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
        if (mode === 'pause') { const b = await page.$('header [data-motion-toggle]'); await b.click(); await sleep(600); R.motion.pausePressed = await b.getAttribute('aria-pressed'); R.motion.htmlDataMotion = await page.evaluate(() => document.documentElement.dataset.motion); }
        const rows = [];
        for (const id of ['top', 'act-1', 'about', 'journey', 'act-2', 'work', 'experiment', 'kill-list', 'films', 'act-3', 'beyond', 'voices', 'act-4', 'principles', 'contact', 'credits']) {
          if (!(await jump(page, id))) continue;
          await sleep(1800);
          const a = await page.evaluate(() => ({ raf: window.__raf, mut: window.__styleMut, targets: { ...window.__mutTargets } }));
          const canv0 = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { try { return c.toDataURL().length + ':' + c.toDataURL().slice(-80); } catch { return 'x'; } }));
          await sleep(1000);
          const b = await page.evaluate(() => ({ raf: window.__raf, mut: window.__styleMut, targets: { ...window.__mutTargets } }));
          const canv1 = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { try { return c.toDataURL().length + ':' + c.toDataURL().slice(-80); } catch { return 'x'; } }));
          const snap = await page.evaluate(() => {
            const anims = document.getAnimations().filter(x => x.playState === 'running' && !(x.effect?.getComputedTiming?.().progress === 1));
            const inf = anims.filter(x => x.effect?.getComputedTiming?.().iterations === Infinity);
            const vids = [...document.querySelectorAll('video')];
            const desc = x => `${x.constructor.name}:${x.animationName || x.transitionProperty || x.id || ''}:${(x.effect?.target?.id ? '#' + x.effect.target.id : '')}${String(x.effect?.target?.className?.baseVal ?? x.effect?.target?.className ?? '').slice(0, 60)}`;
            return { running: anims.length, infinite: inf.length, sample: anims.slice(0, 5).map(desc), videos: vids.length, playing: vids.filter(v => !v.paused && !v.ended).length, videoSrcs: vids.map(v => (v.currentSrc || v.querySelector('source')?.src || '').split('/').pop() + (v.paused ? ':paused' : ':PLAYING')) };
          });
          const tdiff = Object.entries(b.targets).map(([k, v]) => [k, v - (a.targets[k] || 0)]).filter(([, v]) => v > 0).sort((x, y) => y[1] - x[1]).slice(0, 5);
          rows.push({ id, rafPerSec: b.raf - a.raf, styleMutPerSec: b.mut - a.mut, topMutating: tdiff, canvases: canv0.length, canvasChanged: canv0.filter((c, i) => c !== canv1[i]).length, ...snap });
        }
        R.motion[mode] = rows;
        R.motion[mode + 'Errors'] = page.__errs.filter(e => !/warning/.test(e)).slice(0, 10);
        await ctx.close();
      }
    }
    // D. decoder: dwell per section on desktop (control), mobile
    if (on('decoder')) {
      R.decoder = {};
      for (const mobile of [false, true]) {
        const { ctx, page } = await mk(browser, mobile ? { w: 390, h: 844, mobile: true } : {}, mobile ? 'dec390' : 'dec1440');
        await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
        const res = await page.evaluate(async () => { let max = 0; const seen = new Set(); const all = new Set(); const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 700)); const vs = [...document.querySelectorAll('video')]; vs.forEach(v => all.add((v.currentSrc || v.poster || '').split('/').pop())); const p = vs.filter(v => !v.paused); p.forEach(v => seen.add((v.currentSrc || '').split('/').pop())); max = Math.max(max, p.length); } return { max, playedSrcs: [...seen], allVideos: [...all] }; });
        R.decoder[mobile ? 'm390' : 'd1440'] = res;
        await ctx.close();
      }
      // Also with the intro armed at "/" (intro flight uses a video?)
      const { ctx, page } = await mk(browser, {}, 'decIntro');
      await page.goto(BASE + '/', { waitUntil: 'load' });
      const s = [];
      for (let i = 0; i < 10; i++) { await sleep(800); s.push(await page.evaluate(() => ({ t: Math.round(performance.now()), intro: !!document.getElementById('intro') && getComputedStyle(document.getElementById('intro')).display !== 'none', videos: document.querySelectorAll('video').length, playing: [...document.querySelectorAll('video')].filter(v => !v.paused).length, canvases: document.querySelectorAll('canvas').length, scrollY: scrollY, htmlCls: document.documentElement.className.slice(0, 120), bodyOv: getComputedStyle(document.body).overflow, mainInert: document.querySelector('main')?.inert || document.querySelector('main')?.getAttribute('aria-hidden') }))); }
      R.decoder.introTimeline = s;
      await ctx.close();
    }
    // E. overflow 320 detail
    if (on('overflow')) {
      R.overflow = {};
      for (const w of [320, 390]) {
        const { ctx, page } = await mk(browser, { w, h: 800, mobile: true }, 'ov' + w);
        await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
        await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } });
        R.overflow[w] = await page.evaluate(() => {
          const iw = document.documentElement.clientWidth;
          const offs = [...document.querySelectorAll('body *')].map(e => ({ e, b: e.getBoundingClientRect() })).filter(({ e, b }) => b.width && b.right > iw + 0.5 && getComputedStyle(e).position !== 'fixed');
          const unclipped = offs.filter(({ e }) => { let p = e.parentElement; while (p && p !== document.documentElement) { const cs = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(cs.overflowX) && p.tagName !== 'svg') return false; p = p.parentElement; } return true; });
          const d = ({ e, b }) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className?.baseVal ?? e.className).slice(0, 70)} r=${b.right.toFixed(1)} sec=${e.closest('section[id],footer,header')?.id || e.closest('section,footer,header')?.tagName}`;
          return { scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, clientWidth: iw, htmlOvX: getComputedStyle(document.documentElement).overflowX, bodyOvX: getComputedStyle(document.body).overflowX, unclippedNonSvg: unclipped.slice(0, 10).map(d) };
        });
        // Can the user actually pan horizontally?
        R.overflow[w].scrollXAfterScrollBy = await page.evaluate(() => { window.scrollTo({ left: 50, top: 0, behavior: 'instant' }); return window.scrollX; });
        await ctx.close();
      }
    }
    // F. LCP detail (mobile x5)
    if (on('lcp')) {
      R.lcp = {};
      for (const [label, url] of [['mobileIntro', '/'], ['mobileSkip', '/?skip=intro']]) {
        const runs = [];
        for (let i = 0; i < (label === 'mobileIntro' ? 5 : 2); i++) {
          const { ctx, page } = await mk(browser, { w: 390, h: 844, mobile: true }, 'lcp');
          const cdp = await ctx.newCDPSession(page);
          await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
          await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
          await page.addInitScript(() => { window.__lcp = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), rt: Math.round(e.renderTime || 0), lt: Math.round(e.loadTime || 0), el: e.element ? `${e.element.tagName}${e.element.id ? '#' + e.element.id : ''}.${String(e.element.className).slice(0, 60)}` : '', url: (e.url || '').slice(-70), size: e.size }); }).observe({ type: 'largest-contentful-paint', buffered: true }); });
          await page.goto(BASE + url, { waitUntil: 'load', timeout: 120000 });
          await sleep(4000);
          const info = await page.evaluate(() => {
            const nav = performance.getEntriesByType('navigation')[0];
            const res = performance.getEntriesByType('resource').filter(r => /hero-sea|image\?url/.test(r.name)).map(r => ({ n: r.name.slice(-70), start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round(r.transferSize / 1024), prio: r.fetchPriority || '' }));
            const fcp = performance.getEntriesByName('first-contentful-paint')[0];
            const img = [...document.querySelectorAll('img')].find(i => /hero-sea/.test(i.currentSrc));
            const preloads = [...document.querySelectorAll('link[rel=preload]')].map(l => `${l.as}:${(l.href || l.getAttribute('imagesrcset') || '').slice(-60)}:${l.fetchPriority || ''}`);
            return { ttfb: Math.round(nav.responseStart), dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null, heroImg: img ? { loading: img.loading, fetchpriority: img.getAttribute('fetchpriority'), sizes: img.sizes, current: img.currentSrc.slice(-70), decoding: img.decoding } : null, res, preloads, jsKB: Math.round(performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').reduce((s, r) => s + r.transferSize, 0) / 1024), cssKB: Math.round(performance.getEntriesByType('resource').filter(r => /\.css/.test(r.name)).reduce((s, r) => s + r.transferSize, 0) / 1024) };
          });
          runs.push({ lcp: (await page.evaluate(() => window.__lcp)), ...info });
          await ctx.close();
        }
        R.lcp[label] = runs;
      }
    }
    // G. axe (AA contrast etc.) at 1440 + 390, skip intro, after scroll
    if (on('axe')) {
      R.axe = {};
      const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [process.cwd()] }), 'utf8');
      for (const [w, h, mobile, rm] of [[1440, 900, false, false], [390, 844, true, false], [1440, 900, false, true]]) {
        const { ctx, page } = await mk(browser, { w, h, mobile, reduced: rm }, 'axe');
        await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
        await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 150)); } window.scrollTo({ top: 0, behavior: 'instant' }); await new Promise(r => setTimeout(r, 1500)); });
        await page.addScriptTag({ content: axeSrc });
        const res = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations', 'incomplete'] }); return { violations: r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 6).map(n => `${n.target.join(' ')} :: ${(n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 220)}`) })), incompleteContrast: (r.incomplete.find(i => i.id === 'color-contrast')?.nodes.length) || 0 }; });
        R.axe[`${w}${rm ? '-rm' : ''}`] = res;
        await ctx.close();
      }
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(OUT, 'qa2-' + ONLY.join('_') + '.json'), JSON.stringify(R, null, 1));
  console.log('ok');
})();
