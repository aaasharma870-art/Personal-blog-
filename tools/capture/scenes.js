// Scene capture for the recognizability re-test (M2 / M5).
// Usage: node tools/capture/scenes.js <baseUrl> <outDir> [--only=desktop,alt,mobile,rm,loaders,intro] [--names=F06,F08]
//                                      [--vw=<w>x<h>] [--touch]
// --vw=WxH   the viewport of every group that runs (default: 1440x900 for desktop / alt / rm / intro /
//            loaders, 390x844 for mobile). E.g. --only=desktop --vw=1024x768, --only=mobile --vw=320x640,
//            --only=mobile --vw=844x390 (a phone in landscape).
// --touch    those contexts are a phone / tablet (isMobile + hasTouch + a mobile UA; tools/capture/browser.js
//            contextFor), e.g. --only=desktop --vw=1024x1366 --touch (an iPad: DESKTOP_WIDE, coarse pointer).
// Phase 3: on a desktop context Lenis may be running; scrolls here are programmatic (window.scrollTo), which
// Lenis follows, so frames are unchanged. Defaults (no flags) shoot exactly what they shot before.
// One browser for the whole run. Every film scene is shot twice from the SAME
// state: NAME.captioned.png, then NAME.blind.png (CSS hides all text, keeps shapes).
// Also: act-card transitions at 3 scroll points, 390 + reduced-motion frames per
// section, and manifest.json (frame -> world -> moment -> mode) + checks.json
// (console errors, horizontal overflow, h1 count) + index.html contact sheet.
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs');
const path = require('path');
const { parseViewport, contextFor } = require('./browser');

const [, , BASE, OUT, ...rest] = process.argv;
if (!BASE || !OUT) { console.error('usage: node scenes.js <baseUrl> <outDir>'); process.exit(1); }
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const ONLY = opt.only ? String(opt.only).split(',') : null;
const NAMES = opt.names ? new Set(String(opt.names).split(',')) : null;
const want = g => !ONLY || ONLY.includes(g);
const VW = parseViewport(opt.vw);
if (opt.vw && !VW) { console.error(`--vw must be WxH (got "${opt.vw}")`); process.exit(1); }
const TOUCH = !!opt.touch;
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BLIND_CSS = `*, *::before, *::after { color: transparent !important; text-shadow: none !important;
  -webkit-text-fill-color: transparent !important; -webkit-text-stroke: 0 !important; caret-color: transparent !important; }
  svg text, svg tspan { fill: transparent !important; stroke: transparent !important; }`;

const manifest = [];
const checks = { consoleErrors: [], overflow: [], h1: {}, hydration: [] };

async function newPage(browser, { width, height, mobile, reduced }) {
  // --vw / --touch override every group's viewport / device (defaults: exactly the old contexts)
  if (VW) ({ width, height } = VW);
  const touch = !!mobile || TOUCH;
  const ctx = await browser.newContext(contextFor({ width, height, touch, reduced }));
  const page = await ctx.newPage();
  const tag = `${width}${touch && !mobile ? '-touch' : ''}${reduced ? '-rm' : ''}`;
  page.on('console', m => {
    if (m.type() === 'error') {
      const t = m.text().slice(0, 300);
      checks.consoleErrors.push(`[${tag}] ${page.url()} :: ${t}`);
      if (/hydrat|#418|#423|#425/i.test(t)) checks.hydration.push(`[${tag}] ${t}`);
    }
  });
  page.on('pageerror', e => checks.consoleErrors.push(`[${tag}] pageerror ${page.url()} :: ${e.message.slice(0, 300)}`));
  return { ctx, page };
}

async function go(page, url, settle = 1500) {
  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.error('goto', url, e.message));
  await sleep(settle);
}

// Scroll in small steps so scroll-linked choreography and enter-once observers fire.
async function scrollToY(page, y, settle = 1400) {
  await page.evaluate(async (target) => {
    const from = window.scrollY, n = 14;
    for (let i = 1; i <= n; i++) { window.scrollTo(0, from + (target - from) * i / n); await new Promise(r => setTimeout(r, 40)); }
  }, Math.max(0, Math.round(y)));
  await sleep(settle);
}

const rectOf = (page, sel) => page.evaluate(s => {
  const e = document.querySelector(s); if (!e) return null;
  const r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height };
}, sel);

// Wait until every <img> intersecting the viewport has decoded (first hits on
// /_next/image are optimized on demand and can take seconds).
async function imagesReady(page, timeout = 12000) {
  await page.waitForFunction(() => [...document.images].filter(i => {
    const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && getComputedStyle(i).display !== 'none';
  }).every(i => i.complete && i.naturalWidth > 0), null, { timeout, polling: 250 }).catch(() => console.error('images not ready before shot'));
  await sleep(350);
}

async function shoot(page, name, meta, { blind = true, clip, only } = {}) {
  if (NAMES && !NAMES.has(name.split('.')[0])) return;
  await imagesReady(page);
  const o = clip ? { clip } : {};
  // `only`: one kind per call (the intro's two synchronised passes)
  if (only) {
    await page.screenshot({ path: path.join(OUT, `${name}.${only}.png`), ...o }).catch(e => console.error(name, e.message));
    if (only === 'captioned') { manifest.push({ frame: name, ...meta }); console.log('shot', name); }
    return;
  }
  await page.screenshot({ path: path.join(OUT, `${name}.captioned.png`), ...o }).catch(e => console.error(name, e.message));
  if (blind) {
    const h = await page.addStyleTag({ content: BLIND_CSS });
    await sleep(120);
    await page.screenshot({ path: path.join(OUT, `${name}.blind.png`), ...o }).catch(() => {});
    await h.evaluate(n => n.remove());
  }
  manifest.push({ frame: name, ...meta });
  console.log('shot', name);
}

async function overflowCheck(page, label) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth,
    offenders: [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > window.innerWidth + 1 || b.left < -1) && getComputedStyle(e).position !== 'fixed'; })
      .filter(e => { let p = e.parentElement; while (p) { const cs = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) return false; p = p.parentElement; } return true; })
      .slice(0, 6).map(e => `${e.tagName.toLowerCase()}#${e.id}.${String(e.className).slice(0, 60)}`) }));
  if (r.sw > r.iw) checks.overflow.push({ label, ...r });
  checks.h1[label] = await page.evaluate(() => document.querySelectorAll('h1').length);
}

const SECTIONS = ['top', 'act-1', 'about', 'journey', 'act-2', 'work', 'trading-algos', 'optuna-screener', 'experiment', 'systems', 'kill-list', 'films', 'act-3', 'beyond', 'writing', 'voices', 'act-4', 'principles', 'contact', 'credits'];
const WORLD = { top: 'pirates', 'act-1': 'pirates', about: 'pirates', journey: 'pirates', 'act-2': 'idiots', work: 'idiots', 'trading-algos': 'idiots', 'optuna-screener': 'idiots', experiment: 'idiots(no film styling)', systems: 'idiots', 'kill-list': 'idiots', films: 'house (4 screens)', 'act-3': 'rdr2', beyond: 'rdr2', writing: 'rdr2', voices: 'rdr2', 'act-4': 'hp', principles: 'hp', contact: 'hp', credits: 'house' };

async function desktop(browser, variant) {
  const V = variant === 'alt';
  const q = V ? '?skip=intro&variant=alt' : '?skip=intro';
  const { ctx, page } = await newPage(browser, { width: 1440, height: 900 });
  await go(page, '/' + q, 2500);
  const { width: vw, height: vh } = page.viewportSize();
  await overflowCheck(page, `${vw}${TOUCH ? '-touch' : ''}${V ? '-alt' : ''}`);
  const P = (n) => V ? `A${n}` : `D${n}`;
  const at = async (sel, frac, settle) => { const r = await rectOf(page, sel); if (!r) return null; await scrollToY(page, r.top + frac, settle); return r; };

  // Hero
  await scrollToY(page, 0, 2000);
  await shoot(page, `${P('01')}-hero`, { world: 'pirates', moment: 'SM-2 hero: name at sea, the Black Pearl', mode: 'BLIND', variant });
  // every act card fits the viewport (a taller card's sticky stage is
  // pushed under the fixed header at the end of its travel: critic 3 #2)
  checks.cardFit = checks.cardFit || {};
  checks.cardFit[V ? 'alt' : 'default'] = await page.evaluate(() => [...document.querySelectorAll('[data-act-card]:not([data-act-card="opening"])')].map(c => {
    const g = c.querySelector('.act-card-letterbox') || c;
    return { id: c.id, h: Math.round(g.getBoundingClientRect().height), vh: innerHeight, fits: g.getBoundingClientRect().height <= innerHeight + 1 };
  }));
  // Act cards at 3 scroll points each
  for (const [card, moment] of [['act-1', 'SM-3 opening card (Act I, Pirates)'], ['act-2', 'SM-5 card I→II Pirates→3 Idiots'], ['act-3', 'SM-14 card II→III → RDR2 tintype'], ['act-4', 'SM-10 card III→IV RDR2→HP ignite']]) {
    const r = await rectOf(page, '#' + card); if (!r) continue;
    const pts = [['enter', r.top - vh * 0.5], ['mid', r.top + Math.max(0, r.h - vh) / 2], ['settled', r.top + Math.max(0, r.h - vh)]];
    for (const [k, y] of pts) {
      await scrollToY(page, y, k === 'settled' ? 2200 : 1600);
      await shoot(page, `${P('10')}-${card}-${k}`, { world: WORLD[card], moment: `${moment} — ${k}`, mode: k === 'settled' ? 'BLIND' : 'TRANSITION', variant });
    }
  }
  // Sections
  const plan = [
    ['about', 120, 'Act I About (ship\'s log)', 'CAPTION'],
    ['#journey-step-1', -150, 'SM-4 voyage step 1: harbour', 'BLIND'],
    ['#journey-step-3', -150, 'SM-4 voyage step 3: the break', 'BLIND'],
    ['#journey-step-4', -150, 'SM-4 voyage step 4: X marks the spot', 'BLIND'],
    ['work', 0, 'SM-6 work head band (top)', 'BLIND'],
    // an ELEMENT target (the layout moved: the board is ~1500 px down now)
    ['work', { sel: '#work figure:has([data-board])', tag: 'board', lead: 140 }, 'SM-6 gauntlet on the ICE dawn board (board, gates)', 'BLIND'],
    ['trading-algos', 0, 'SM-7 chapter Trading_Algos', 'CAPTION'],
    ['optuna-screener', 0, 'SM-7 chapter Optuna-Screener', 'CAPTION'],
    ['experiment', 0, 'Experiment (BacktestDemo, synthetic; NO film styling)', 'NONE'],
    ['systems', 0, 'Systems FIG + drone band', 'BLIND'],
    ['kill-list', 0, 'SM-8 kill-list header cue', 'CAPTION'],
    ['voices', 0, 'SM-16 by the fire (camp)', 'BLIND'],
    ['beyond', 0, 'SM-15 frontier golden-hour band', 'BLIND'],
    ['beyond', { sel: '#beyond [data-motif="satchel"]', tag: 'satchel', lead: 160 }, 'SM-15 beyond: the satchel', 'CAPTION'],
    ['beyond', { sel: '#beyond [data-piece="beyond.handbill"]', tag: 'wanted', lead: 100 }, 'SM-15 beyond: the WANTED handbill', 'BLIND'],
    ['beyond', 2800, 'SM-15 beyond end', 'CAPTION'],
    ['writing', 0, 'SM-11 Arthur\'s journal (writing)', 'BLIND'],
    ['writing', 1000, 'SM-11 journal pages', 'BLIND'],
    ['principles', 0, 'Principles (HP)', 'BLIND'],
    ['principles', 1000, 'Principles lower', 'BLIND'],
    ['contact', 0, 'SM-12 last light (contact)', 'BLIND'],
    ['credits', 0, 'SM-13 credits roll', 'CAPTION'],
    ['credits', 1000, 'SM-13 credits end (Mischief managed)', 'CAPTION'],
  ];
  let i = 20;
  for (const [id, off, moment, mode] of plan) {
    const key = id.replace('#', '');
    let r;
    if (typeof off === 'object') {
      // an element target: its top `lead` px below the header
      r = await rectOf(page, off.sel);
      if (r) await scrollToY(page, r.top - 68 - off.lead, 1800);
    } else {
      const sel = id.startsWith('#') ? id : '#' + id;
      r = await at(sel, off, 1800);
    }
    if (!r) { console.error('missing', id, off); i++; continue; }
    const suffix = typeof off === 'object' ? '-' + off.tag : off > 0 ? '-' + off : '';
    await shoot(page, `${P(String(i++))}-${key}${suffix}`, { world: WORLD[key.replace(/-step-\d/, '')] || 'pirates', moment, mode, variant });
  }
  // Films chapter: one frame per screen
  const arts = await page.evaluate(() => [...document.querySelectorAll('#films article[data-films-world]')].map(a => { const r = a.getBoundingClientRect(); return { w: a.dataset.filmsWorld, top: r.top + scrollY, h: r.height }; }));
  for (const a of arts) {
    await scrollToY(page, a.top + Math.max(0, (a.h - vh) / 2) - 40, 1800);
    await shoot(page, `${P(String(i++))}-films-${a.w}`, { world: a.w, moment: `SM-9 films chapter screen: ${a.w}`, mode: 'BLIND', variant });
  }
  await ctx.close();
}

async function intro(browser, variant) {
  const V = variant === 'alt';
  const P = V ? 'A' : 'D';
  // Two passes on the SAME timeline, one screenshot per beat: captioned, then
  // blind (text hidden from the start). Shooting both kinds back to back let
  // the video run on ~2 s between them, so the blind frame showed a later
  // moment than its captioned twin (M2 fix round 3). Each beat's world is
  // the flight caption on screen at that instant (hp, pirates, or both
  // during the cross-dissolve) — the hand-off is HP→Pirates by design.
  const worlds = {};
  for (const kind of ['captioned', 'blind']) {
    const { ctx, page } = await newPage(browser, { width: 1440, height: 900 });
    await go(page, `/?intro=1${V ? '&variant=alt' : ''}`, 2600);
    if (kind === 'blind') { await page.addStyleTag({ content: BLIND_CSS }); await sleep(120); }
    await shoot(page, `${P}00-intro-play`, { world: 'hp', moment: 'SM-1 play screen: Hogwarts, candles, broom', mode: 'BLIND', variant }, { only: kind });
    await page.click('#intro-play').catch(e => console.error('play', e.message));
    const t0 = Date.now();
    // beats on the FLIGHT'S OWN CLOCK (the video's currentTime), so both
    // passes shoot the same moment whatever the clip's load time (a fresh
    // load starts ~1 s later than a cached one); a clip held at its cut, or
    // an intro already gone, releases the wait
    for (const [at, k] of [[1.2, 'flight-early'], [2.6, 'flight-mid'], [4.0, 'flight-late'], [0, 'landed']]) {
      if (k === 'landed') await sleep(Math.max(0, 11000 - (Date.now() - t0)));
      else await page.waitForFunction((t) => {
        const v = document.querySelector('#intro video');
        if (!document.getElementById('intro') || !v) return true;
        return v.currentTime >= t || (v.paused && v.currentTime > 0.5) || v.ended;
      }, at, { timeout: 15000, polling: 16 }).catch(() => console.error('beat timeout', k));
      const w = await page.evaluate(() => {
        const o = id => { const e = document.getElementById(id); return e ? +getComputedStyle(e).opacity * +getComputedStyle(e.parentElement || e).opacity : 0; };
        const hp = o('intro-cap-hp'), pc = o('intro-cap-pc');
        const on = document.documentElement.className.match(/intro-(launched|landing|fold)/) && document.getElementById('intro');
        if (!on) return 'pirates';
        return hp > 0.5 && pc > 0.5 ? 'hp→pirates' : hp > 0.5 ? 'hp' : pc > 0.5 ? 'pirates' : hp >= pc ? 'hp→pirates' : 'pirates';
      }).catch(() => 'hp→pirates');
      const name = `${P}00-intro-${k}`;
      if (kind === 'captioned') worlds[name] = k === 'landed' ? 'pirates' : w;
      const meta = k === 'landed'
        ? { world: 'pirates', moment: 'SM-1 landing → hero (hand-off caption)', mode: 'TRANSITION', variant }
        : { world: worlds[name] || w, moment: `SM-1 broom flight (${k}, flight t ≈ ${at} s); hand-off HP→Pirates`, mode: 'CAPTION', variant, at };
      await shoot(page, name, meta, { only: kind });
    }
    await ctx.close();
  }
}

async function loaders(browser, variant) {
  const V = variant === 'alt';
  const { ctx, page } = await newPage(browser, { width: 1440, height: 900 });
  await go(page, `/lab${V ? '?variant=alt' : ''}`, 2500);
  const P = V ? 'A' : 'D';
  for (const w of ['pirates', 'idiots', 'rdr2', 'hp']) {
    const el = await page.$(`[data-lab-world-loaders="${w}"]`); if (!el) { console.error('no loader', w); continue; }
    await el.scrollIntoViewIfNeeded(); await sleep(2200);
    const b = await el.boundingBox();
    await shoot(page, `${P}80-loader-card-${w}`, { world: w, moment: `World loader, card size (${w})`, mode: 'BLIND', variant }, { clip: { x: b.x, y: b.y, width: b.width, height: Math.min(b.height, 900) } });
  }
  for (const o of ['about', 'work', 'writing', 'principles']) {
    const el = await page.$(`[data-lab-route-loader="${o}"]`); if (!el) continue;
    await el.scrollIntoViewIfNeeded(); await sleep(2200);
    const b = await el.boundingBox();
    await shoot(page, `${P}85-loader-route-${o}`, { world: { about: 'pirates', work: 'idiots', writing: 'rdr2', principles: 'hp' }[o], moment: `Route loader card (${o})`, mode: 'CAPTION', variant }, { clip: { x: b.x, y: b.y, width: b.width, height: Math.min(b.height, 900) } });
  }
  await ctx.close();
}

// 390 + reduced motion: one captioned frame per section (+ overflow / h1 checks)
async function sweep(browser, kind) {
  const mobile = kind === 'mobile';
  const size = mobile ? { width: 390, height: 844, mobile: true } : { width: 1440, height: 900, reduced: true };
  const { ctx, page } = await newPage(browser, size);
  if (VW) Object.assign(size, VW);
  await go(page, '/?skip=intro', 2500);
  await overflowCheck(page, mobile ? `${size.width}` : `${size.width}-rm`);
  const tag = mobile ? 'm390' : 'rm';
  let i = 0;
  for (const id of SECTIONS) {
    const r = await rectOf(page, '#' + id); if (!r) continue;
    const pts = r.h > size.height * 2.2 ? [0, Math.round((r.h - size.height) / 2)] : [0];
    for (const off of pts) {
      await scrollToY(page, r.top + off, mobile ? 1200 : 900);
      // content above can still grow as it mounts (lazy sections, images):
      // re-measure and land again until the section sits where intended
      // (m390 contact was shot blank and "credits" showed contact)
      for (let k = 0; k < 3; k++) {
        const again = await rectOf(page, '#' + id);
        if (!again || Math.abs(again.top + off - (await page.evaluate(() => scrollY))) < 8) break;
        await scrollToY(page, again.top + off, 900);
      }
      const name = `${tag}-${String(i++).padStart(2, '0')}-${id}${off ? '-' + off : ''}`;
      await imagesReady(page);
      await sleep(800); // late-mounting sections
      await page.screenshot({ path: path.join(OUT, `${name}.png`) }).catch(() => {});
      manifest.push({ frame: name, world: WORLD[id], moment: `${id} @ ${kind}`, mode: kind });
      console.log('shot', name);
    }
  }
  if (mobile) {
    // mobile overflow after full scroll (lazy content mounted)
    await overflowCheck(page, `${size.width}-after-scroll`);
  }
  await ctx.close();
}

function contactSheet() {
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).sort();
  const cards = files.map(f => `<figure><img loading="lazy" src="${f}"><figcaption>${f}</figcaption></figure>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Frames</title><style>body{background:#111;color:#ddd;font:12px system-ui;display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px;padding:12px}img{width:100%;border:1px solid #333}figure{margin:0}</style>${cards}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  try {
    if (want('intro')) { await intro(browser, 'default'); await intro(browser, 'alt'); }
    if (want('desktop')) await desktop(browser, 'default');
    if (want('alt')) await desktop(browser, 'alt');
    if (want('loaders')) { await loaders(browser, 'default'); await loaders(browser, 'alt'); }
    if (want('mobile')) await sweep(browser, 'mobile');
    if (want('rm')) await sweep(browser, 'rm');
  } finally {
    await browser.close();
  }
  const mf = path.join(OUT, 'manifest.json');
  const prev = fs.existsSync(mf) && (ONLY || NAMES) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : [];
  const merged = [...prev.filter(p => !manifest.some(m => m.frame === p.frame)), ...manifest];
  fs.writeFileSync(mf, JSON.stringify(merged, null, 1));
  fs.writeFileSync(path.join(OUT, 'checks.json'), JSON.stringify(checks, null, 1));
  contactSheet();
  console.log('DONE', manifest.length, 'frames; console errors', checks.consoleErrors.length, '; overflow', checks.overflow.length);
})();
