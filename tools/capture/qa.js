// Final QA probes (M5). Usage: node tools/capture/qa.js <baseUrl> <outDir> [--vw=<w>x<h>] [--touch]
// --vw=WxH  the viewport of the default contexts (anchors, no-JS, media-blocked, reduced motion / Pause,
//           the desktop decoder run; default 1440x900); its width joins the overflow widths.
// --touch   those contexts are a phone / tablet (tools/capture/browser.js contextFor), e.g.
//           --vw=1024x1366 --touch (DESKTOP_WIDE with a coarse pointer: no Lenis, no stage, no GL).
// R.lenis records whether smooth scroll (Phase 3, DESKTOP_FINE only) ran in the reduced-motion / Pause
// contexts (it must not) and in the default context.
// One browser. Writes <outDir>/qa.json and a few evidence PNGs:
//  - anchors: every in-page href="#id" / "/#id" resolves to an element; external links have rel/target sanity
//  - overflow at 320 / 390 / 1024 / 1440 after scrolling the whole page (lazy content mounted)
//  - no-JS: the page renders its content (h1, every section present with visible text, no invisible
//    armed-reveal content), screenshots per section
//  - media-blocked: images/video aborted -> no page errors, sections still render, captions present
//  - reduced motion + Pause toggle: running animations / playing videos after settle
//  - LCP (mobile lab: 390, 4x CPU, ~1.6 Mbps / 150 ms RTT) and desktop
//  - console + hydration errors on every load
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs');
const path = require('path');
const { parseViewport, contextFor } = require('./browser');
const [, , BASE, OUT, ...rest] = process.argv;
if (!BASE || !OUT) { console.error('usage: node qa.js <baseUrl> <outDir> [--vw=WxH] [--touch]'); process.exit(1); }
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const VW = parseViewport(opt.vw);
if (opt.vw && !VW) { console.error(`--vw must be WxH (got "${opt.vw}")`); process.exit(1); }
const TOUCH = !!opt.touch;
const DEF = VW || { width: 1440, height: 900 };
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = { console: [], hydration: [], anchors: {}, overflow: {}, noJs: {}, mediaBlocked: {}, motion: {}, lcp: {}, lenis: {},
  meta: { viewport: `${DEF.width}x${DEF.height}`, touch: TOUCH } };

async function ctxPage(browser, o = {}, label = '') {
  // a context without its own size is a "default" one: --vw / --touch apply to it
  const dflt = !o.w;
  const touch = !!o.mobile || (dflt && TOUCH);
  const c = { viewport: { width: o.w || DEF.width, height: o.h || DEF.height }, isMobile: touch, hasTouch: touch,
    javaScriptEnabled: o.js !== false, reducedMotion: o.reduced ? 'reduce' : 'no-preference', deviceScaleFactor: o.mobile ? 2 : 1 };
  if (touch && !o.mobile) Object.assign(c, contextFor({ width: c.viewport.width, height: c.viewport.height, touch: true, reduced: o.reduced, js: o.js }));
  const ctx = await browser.newContext(c);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') { const t = `[${label}] ${m.text().slice(0, 300)}`; R.console.push(t); if (/hydrat|#418|#423|#425|did not match/i.test(t)) R.hydration.push(t); } });
  page.on('pageerror', e => R.console.push(`[${label}] pageerror ${e.message.slice(0, 300)}`));
  return { ctx, page };
}
async function scrollAll(page, step = 600) {
  await page.evaluate(async (s) => { const H = () => document.documentElement.scrollHeight; for (let y = 0; y < H(); y += s) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, H()); await new Promise(r => setTimeout(r, 400)); }, step);
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    // 1. anchors + links
    {
      const { ctx, page } = await ctxPage(browser, {}, 'anchors');
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => !!window.__lenis, null, { timeout: 4000 }).catch(() => {});
      R.lenis.default = await page.evaluate(() => !!window.__lenis);
      await scrollAll(page);
      R.anchors = await page.evaluate(() => {
        const links = [...document.querySelectorAll('a[href]')];
        const bad = [], ext = [];
        for (const a of links) {
          const h = a.getAttribute('href');
          const m = h.match(/^(?:\/)?#(.+)$/);
          if (m) { if (!document.getElementById(decodeURIComponent(m[1]))) bad.push(h); continue; }
          if (/^https?:/.test(h)) ext.push({ h, target: a.target, rel: a.rel });
          if (h === '#' || h === '') bad.push(`empty:${a.outerHTML.slice(0, 80)}`);
        }
        const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
        const dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
        return { total: links.length, broken: [...new Set(bad)], external: ext, duplicateIds: [...new Set(dupIds)], h1: document.querySelectorAll('h1').length };
      });
      // every nav anchor actually scrolls there
      const navHrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('header a[href*="#"], nav a[href*="#"]')].map(a => a.getAttribute('href')))]);
      R.anchors.nav = navHrefs;
      const sitemap = await (await page.request.get(BASE + '/sitemap.xml')).text().catch(() => '');
      R.anchors.sitemapHashes = [...sitemap.matchAll(/#([\w-]+)/g)].map(m => m[1]);
      R.anchors.sitemapMissing = [];
      for (const id of R.anchors.sitemapHashes) if (!(await page.$('#' + id))) R.anchors.sitemapMissing.push(id);
      for (const p of ['/lab', '/lab/variants', '/does-not-exist', '/robots.txt', '/sitemap.xml', '/opengraph-image', '/icon']) {
        const r = await page.request.get(BASE + p); R.anchors[`status ${p}`] = r.status();
      }
      await ctx.close();
    }
    // 2. overflow at 4 widths
    for (const w of [...new Set([320, 390, 1024, 1440, DEF.width])].sort((a, b) => a - b)) {
      const { ctx, page } = await ctxPage(browser, { w, h: w < 640 ? 800 : 900, mobile: w < 640 }, `ov${w}`);
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
      await scrollAll(page);
      R.overflow[w] = await page.evaluate(() => {
        const iw = document.documentElement.clientWidth;
        const off = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.right > iw + 1) && getComputedStyle(e).position !== 'fixed'; })
          .filter(e => { let p = e.parentElement; while (p && p !== document.body) { if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) return false; p = p.parentElement; } return true; })
          .slice(0, 8).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className?.baseVal ?? e.className).slice(0, 50)} r=${Math.round(e.getBoundingClientRect().right)}`);
        return { scrollWidth: document.documentElement.scrollWidth, clientWidth: iw, offenders: off };
      });
      await ctx.close();
    }
    // 3. no-JS
    {
      const { ctx, page } = await ctxPage(browser, { js: false }, 'nojs');
      await page.goto(BASE + '/', { waitUntil: 'load' });
      R.noJs = await page.evaluate(() => {
        const secs = [...document.querySelectorAll('main section[id], footer#credits')];
        const hiddenText = [];
        for (const s of secs) {
          const els = [...s.querySelectorAll('h2,h3,p,li')].filter(e => e.textContent.trim());
          const invisible = els.filter(e => { let n = e; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.opacity === '0' || cs.visibility === 'hidden' || (cs.clipPath && cs.clipPath.includes('inset(100%'))) return true; n = n.parentElement; } return false; });
          if (invisible.length) hiddenText.push({ id: s.id, invisible: invisible.length, of: els.length, sample: invisible.slice(0, 2).map(e => e.textContent.trim().slice(0, 50)) });
        }
        const ov = document.querySelector('#intro-caps, .intro-overlay, [data-intro-overlay]');
        return { sections: secs.map(s => s.id), h1: document.querySelectorAll('h1').length, hiddenText,
          introVisible: ov ? getComputedStyle(ov).display !== 'none' && getComputedStyle(ov).visibility !== 'hidden' && ov.getBoundingClientRect().height > 0 : false };
      });
      await page.screenshot({ path: path.join(OUT, 'nojs-top.png') });
      for (const id of ['work', 'films', 'beyond', 'contact']) { await page.evaluate(i => document.getElementById(i)?.scrollIntoView(), id); await sleep(200); await page.screenshot({ path: path.join(OUT, `nojs-${id}.png`) }); }
      await ctx.close();
    }
    // 4. media blocked
    {
      const { ctx, page } = await ctxPage(browser, {}, 'noMedia');
      await page.route('**/*', r => ['image', 'media'].includes(r.request().resourceType()) ? r.abort() : r.continue());
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
      await scrollAll(page);
      R.mediaBlocked = await page.evaluate(() => ({ sections: document.querySelectorAll('main section[id]').length, captions: document.querySelectorAll('.scene-caption').length, h1: document.querySelectorAll('h1').length }));
      for (const id of ['top', 'act-2', 'films', 'act-4']) { await page.evaluate(i => document.getElementById(i)?.scrollIntoView(), id); await sleep(600); await page.screenshot({ path: path.join(OUT, `nomedia-${id}.png`) }); }
      await ctx.close();
    }
    // 5. motion: reduced motion + Pause
    for (const mode of ['reduced', 'pause']) {
      const { ctx, page } = await ctxPage(browser, { reduced: mode === 'reduced' }, mode);
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
      // smooth scroll: none under OS reduced motion; under Pause it is destroyed (spec §3.1)
      R.lenis[mode + 'Before'] = await page.evaluate(() => !!window.__lenis);
      if (mode === 'pause') {
        // the Pause control by its own hook first: a selector LIST returns the first match in document order,
        // and the header's sound toggle (aria-pressed, Phase 3) sits before Pause (P3-11.0 fix)
        let btn = null;
        for (const sel of ['header [data-motion-toggle]', '[data-motion-toggle]', 'header button[aria-label*="otion" i]']) {
          btn = await page.$(sel);
          if (btn) break;
        }
        R.motion.pauseButton = btn ? await btn.evaluate(b => b.outerHTML.slice(0, 160)) : null;
        if (btn) { await btn.click(); await sleep(500); }
        R.lenis.pauseAfter = await page.evaluate(() => !!window.__lenis);
      }
      const samples = [];
      for (const id of ['top', 'act-1', 'journey', 'act-2', 'work', 'films', 'act-3', 'voices', 'act-4', 'contact', 'credits']) {
        await page.evaluate(i => document.getElementById(i)?.scrollIntoView(), id); await sleep(1500);
        samples.push(await page.evaluate((i) => {
          const anims = document.getAnimations().filter(a => a.playState === 'running' && !(a.effect?.getTiming?.().iterations === 1 && a.effect?.getComputedTiming?.().progress === 1));
          const vids = [...document.querySelectorAll('video')].filter(v => !v.paused && !v.ended && v.readyState > 2);
          return { id: i, runningAnimations: anims.length, sample: anims.slice(0, 3).map(a => `${a.constructor.name}:${a.animationName || a.id || ''}:${a.effect?.target?.className?.baseVal ?? a.effect?.target?.className ?? ''}`.slice(0, 120)), playingVideos: vids.length };
        }, id));
      }
      R.motion[mode] = samples;
      await ctx.close();
    }
    // 6. one decoder at a time (desktop) + mobile plays none
    for (const mobile of [false, true]) {
      const { ctx, page } = await ctxPage(browser, mobile ? { w: 390, h: 844, mobile: true } : {}, mobile ? 'dec390' : 'dec1440');
      await page.goto(BASE + '/?skip=intro', { waitUntil: 'networkidle' });
      const maxPlaying = await page.evaluate(async () => { let max = 0; const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); max = Math.max(max, [...document.querySelectorAll('video')].filter(v => !v.paused).length); } return max; });
      R.motion[mobile ? 'maxPlayingVideos390' : 'maxPlayingVideos1440'] = maxPlaying;
      await ctx.close();
    }
    // 7. LCP (lab)
    for (const [label, o] of [['mobile', { w: 390, h: 844, mobile: true, cpu: 4, net: { latency: 150, down: 1.6e6 / 8, up: 750e3 / 8 } }], ['desktop', { w: 1440, h: 900, cpu: 1 }]]) {
      const runs = [];
      for (let i = 0; i < 3; i++) {
        const { ctx, page } = await ctxPage(browser, o, `lcp-${label}`);
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        if (o.net) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: o.net.latency, downloadThroughput: o.net.down, uploadThroughput: o.net.up });
        if (o.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: o.cpu });
        await page.addInitScript(() => { window.__lcp = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp.push({ t: e.startTime, el: e.element ? `${e.element.tagName}${e.element.id ? '#' + e.element.id : ''}.${String(e.element.className).slice(0, 40)}` : '', url: (e.url || '').slice(-60), size: e.size }); }).observe({ type: 'largest-contentful-paint', buffered: true }); });
        await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
        await sleep(4000);
        const l = await page.evaluate(() => window.__lcp);
        runs.push(l[l.length - 1] || null);
        await ctx.close();
      }
      R.lcp[label] = runs;
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(OUT, 'qa.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify({ console: R.console.length, hydration: R.hydration.length, broken: R.anchors.broken, overflow: Object.fromEntries(Object.entries(R.overflow).map(([k, v]) => [k, v.scrollWidth - v.clientWidth])), lcp: R.lcp }, null, 1));
})();
