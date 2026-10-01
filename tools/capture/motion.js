// Motion harness: records how the page MOVES while a person scrolls it.
// Usage: node tools/capture/motion.js <baseUrl> <outDir> [--runs=desktop,alt,mobile,intro,rm,native] [--nth=1] [--limit=<scroll ms>]
//                                      [--idle=0] [--trace=0] [--vw=1024x768] [--analyse-only]
//
// Runs (each in a fresh context, one browser for the whole job):
//   desktop  1440x900  /?skip=intro               wheel 100 px / 110 ms, 1.2 s pauses at act cards + films screens
//   alt      1440x900  /?skip=intro&variant=alt   same
//   native   1440x900  /?skip=intro,smooth        the desktop run with Lenis off (Phase 3 A/B: smooth vs native
//                                                 scroll on the same build; not in the default --runs)
//   rm       1440x900  /?skip=intro, reducedMotion 'reduce'  (the control)
//   mobile   390x844   /?skip=intro               touch strokes at 1200 px/s top to bottom (synthesizeScrollGesture,
//                                                 falling back to raw Input.dispatchTouchEvent strokes in headless)
//   intro    1440x900  /?intro=1                  wait 2.5 s, click #intro-play, record flight + landing (~9 s)
//
// Instrumentation (addInitScript): a rAF loop logging [t, dt, scrollY, section], PerformanceObserver
// 'long-animation-frame' (duration, blockingDuration, render/style split, top scripts) and 'layout-shift'
// (value, hadRecentInput, source nodes). CDP Page.startScreencast saves every frame as <run>/f#####.jpg
// with its timestamp + scrollY (frames.json). Post-processing: frame-time stats per run / section / act
// transition, LoAF + CLS summaries, VISUAL POPS (96x60 grey mean-abs-diff > 3x running median while the
// scroll moved < 40 px, confirmed by a scroll-undone residual), contact strips under <outDir>/strips/,
// motion.json + summary.md. Attribution beyond LoAF (headless is raster-bound, so LoAFs are mostly the
// main thread waiting on the compositor): a scroll-time Paint/raster trace per section (which nodes repaint
// while you scroll), per-section "paint suspects" (filters, masks, blend, canvas, video, image MP), a desktop
// IDLE PROBE (each section standing still), and mobile SCROLL TRAPS (a stroke that did not move the page).
// Each run's raw data is kept in <outDir>/<run>/raw.json; --analyse-only re-runs the analysis on it.
//
// --vw=WxH sets the desktop viewport of the desktop / alt / native / rm / intro runs (e.g. 1024x768).
// Phase 3 smooth scroll (Lenis, DESKTOP_FINE only): the desktop runs wait for window.__lenis before they
// scroll (recorded as `lenis` in each run), and every pause waits until window.__lenis.isScrolling === false
// (the Lenis tail runs ~0.9 s per notch) instead of a fixed 80 ms; with no Lenis it is the old 80 ms.
//
// NOTE: headless Chromium rasterises in software (SwiftShader), so absolute frame times are pessimistic
// vs a real GPU; read the numbers as RELATIVE hotspots. The wheel is the same CDP event page.mouse.wheel
// sends, dispatched WITHOUT awaiting the renderer's ack (at most 8 in flight): awaiting it paces the
// input to the software frame rate, which turns jank into slow motion instead of showing it.
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const sharp = require('sharp');
const { parseViewport } = require('./browser');
const fs = require('fs');
const os = require('os');
const path = require('path');

const [, , BASE_ARG, OUT_ARG, ...rest] = process.argv;
if (!BASE_ARG || !OUT_ARG) { console.error('usage: node motion.js <baseUrl> <outDir> [--runs=desktop,alt,mobile,intro,rm] [--nth=1]'); process.exit(1); }
const BASE = BASE_ARG.replace(/\/$/, '');
const OUT = path.resolve(OUT_ARG);
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const RUNS = String(opt.runs || 'desktop,alt,mobile,intro,rm').split(',');
const ALL_RUNS = ['intro', 'desktop', 'native', 'alt', 'mobile', 'rm'];
const NTH = Number(opt.nth || 1);
const IDLE = opt.idle !== '0';
const TRACE = opt.trace !== '0';
const ANALYSE_ONLY = !!opt['analyse-only']; // re-run the analysis on <outDir>/<run>/raw.json without a browser
const STRIPS = path.join(OUT, 'strips');
fs.mkdirSync(STRIPS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DESK = parseViewport(opt.vw) || { width: 1440, height: 900 };
if (opt.vw && !parseViewport(opt.vw)) { console.error(`--vw must be WxH (got "${opt.vw}")`); process.exit(1); }
const MOB = { width: 390, height: 844 };
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const WHEEL_DY = 100, WHEEL_MS = 110, PAUSE_MS = 1200, MAX_INFLIGHT = 8, MAX_SCROLL_MS = Number(opt.limit || 240000);
const TOUCH_SPEED = 1200;
const POP = { factor: 3, maxDy: 40, floor: 2, win: 31, group: 150 };
const JANK = 33.4, JANK2 = 50;
const ACTS = ['act-1', 'act-2', 'act-3', 'act-4'];

// ---------------------------------------------------------------- in-page instrumentation
function initMotion() {
  if (window.top !== window) return;
  const M = window.__motion = { raf: [], loaf: [], ls: [], names: [], errors: [], clickAt: null, timeOrigin: performance.timeOrigin };
  let secs = [];
  const seen = new WeakSet();
  let ro = null;
  const idx = (name) => { let i = M.names.indexOf(name); if (i < 0) i = M.names.push(name) - 1; return i; };
  function measure() {
    const y = scrollY;
    secs = [...document.querySelectorAll('section[id], footer[id]')].map(e => {
      if (ro && !seen.has(e)) { seen.add(e); ro.observe(e); }
      const r = e.getBoundingClientRect();
      return { id: e.id, top: r.top + y, bot: r.bottom + y, h: r.height };
    });
  }
  M.measure = () => { measure(); return secs.map(s => ({ id: s.id, top: Math.round(s.top), h: Math.round(s.h) })); };
  // the intro overlay: its phase classes live on <html> only while it plays (#intro stays in the DOM, hidden)
  // (P3-3: titles after the end; reveal = intro-sweep, which coexists with intro-handoff + intro-landing; hold = intro-handoff)
  const PH = [['intro-leaving', 'leaving'], ['intro-fold', 'fold'], ['intro-caps-linger', 'titles'], ['intro-sweep', 'reveal'], ['intro-handoff', 'hold'], ['intro-landing', 'landing'], ['intro-waiting', 'waiting'], ['intro-launched', 'flight'], ['intro-armed', 'play-screen']];
  function where() {
    const c = document.documentElement.classList;
    for (const [k, v] of PH) if (c.contains(k)) return 'intro:' + v;
    const mid = scrollY + innerHeight / 2;
    let best = null;
    for (const s of secs) if (s.top <= mid && mid < s.bot && (!best || s.h < best.h)) best = s;
    return best ? best.id : '-';
  }
  let last = 0;
  function tick(now) {
    const s = idx(where());
    if (last) M.raf.push([Math.round(now * 10) / 10, Math.round((now - last) * 10) / 10, Math.round(scrollY), s]);
    last = now;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  const hook = () => {
    try { ro = new ResizeObserver(() => measure()); ro.observe(document.documentElement); } catch (e) { M.errors.push('ro:' + e.message); }
    measure();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
  addEventListener('load', measure);
  setInterval(measure, 3000);
  addEventListener('click', e => { if (e.target && e.target.closest && e.target.closest('#intro-play')) M.clickAt = performance.now(); }, true);

  function desc(n) {
    if (!n) return '(detached)';
    const e = n.nodeType === 1 ? n : n.parentElement;
    if (!e) return '#text';
    const cls = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : '';
    const data = [...e.attributes].filter(a => a.name.startsWith('data-')).slice(0, 2).map(a => `[${a.name}${a.value ? '=' + a.value.slice(0, 24) : ''}]`).join('');
    const sec = e.closest('section[id],footer[id]');
    return `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${cls ? '.' + cls : ''}${data} in #${sec ? sec.id : '-'}`.slice(0, 220);
  }
  const rect = r => r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null;
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        const end = e.startTime + e.duration;
        const scripts = [...(e.scripts || [])].map(s => ({
          d: Math.round(s.duration), inv: String(s.invoker || '').slice(0, 160), type: s.invokerType, src: s.sourceURL,
          fn: s.sourceFunctionName, pos: s.sourceCharPosition, fsl: Math.round(s.forcedStyleAndLayoutDuration || 0),
        })).sort((a, b) => b.d - a.d);
        const scriptMs = scripts.reduce((a, s) => a + s.d, 0);
        const styleLayout = e.styleAndLayoutStart ? end - e.styleAndLayoutStart : 0; // style + layout + paint + commit
        M.loaf.push({
          start: Math.round(e.startTime), dur: Math.round(e.duration), block: Math.round(e.blockingDuration || 0),
          render: e.renderStart ? Math.round(end - e.renderStart) : 0, styleLayout: Math.round(styleLayout),
          scriptMs: Math.round(scriptMs), nScripts: scripts.length, scripts: scripts.slice(0, 3),
          // what the main thread actually did; the rest of the frame it sat waiting (for the compositor / raster)
          work: Math.round(Math.min(e.duration, scriptMs + styleLayout)),
        });
      }
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) { M.errors.push('loaf:' + e.message); }
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        M.ls.push({ t: Math.round(e.startTime), v: e.value, input: e.hadRecentInput,
          src: (e.sources || []).map(s => ({ node: desc(s.node), prev: rect(s.previousRect), cur: rect(s.currentRect) })) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { M.errors.push('ls:' + e.message); }
}

// ---------------------------------------------------------------- browser plumbing
async function openRun(browser, run) {
  const mobile = run === 'mobile';
  const ctx = await browser.newContext({
    viewport: mobile ? MOB : DESK, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
    reducedMotion: run === 'rm' ? 'reduce' : 'no-preference', userAgent: mobile ? IPHONE_UA : undefined,
  });
  await ctx.addInitScript(initMotion);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 300)));
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp, errors };
}

function recorder(cdp, dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  let seq = 0, on = false;
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    if (!on) return;
    const file = `f${String(seq).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(dir, file), Buffer.from(data, 'base64'));
    frames.push({ seq: seq++, file, ts: metadata.timestamp ? metadata.timestamp * 1000 : Date.now(), y: Math.round(metadata.scrollOffsetY || 0) });
  });
  return {
    frames,
    start: async () => { on = true; await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 960, everyNthFrame: NTH }); },
    stop: async () => { await cdp.send('Page.stopScreencast').catch(() => {}); await sleep(200); on = false; },
  };
}

const perfNow = page => page.evaluate(() => performance.now());

async function pauseTargets(page) {
  return page.evaluate((acts) => {
    const vh = innerHeight, y0 = scrollY, out = [];
    for (const id of acts) {
      const e = document.getElementById(id); if (!e) continue;
      const r = e.getBoundingClientRect();
      out.push({ key: id, y: Math.round(r.top + y0 + Math.max(0, r.height - vh) / 2) }); // mid of the sticky travel
    }
    document.querySelectorAll('#films article[data-films-world]').forEach(a => {
      const r = a.getBoundingClientRect();
      out.push({ key: 'films-' + a.dataset.filmsWorld, y: Math.round(r.top + y0 + Math.max(0, (r.height - vh) / 2) - 40) });
    });
    return out;
  }, ACTS);
}

const scrollState = page => page.evaluate(() => ({ y: Math.round(scrollY), end: scrollY + innerHeight >= document.documentElement.scrollHeight - 2 }));

// The scroll has come to rest: Lenis (Phase 3, desktop) reports isScrolling === false; native scroll gets 80 ms.
async function settle(page, timeout = 4000) {
  const lenis = await page.evaluate(() => !!window.__lenis).catch(() => false);
  if (!lenis) { await sleep(80); return; }
  await page.waitForFunction(() => !window.__lenis || window.__lenis.isScrolling === false, null, { timeout, polling: 16 })
    .catch(() => console.error('  lenis still scrolling after', timeout, 'ms'));
}

// A person with a mouse wheel: one 100 px notch every 110 ms (~900 px/s), a 1.2 s look at every act card and films screen.
async function wheelScroll(page, cdp) {
  const x = DESK.width / 2, yM = DESK.height / 2;
  await page.mouse.move(x, yM);
  const pauses = [], done = new Set();
  let targets = await pauseTargets(page);
  let inflight = 0, tick = 0, endTicks = 0, still = 0, lastY = -1;
  const start = Date.now();
  let next = Date.now();
  while (Date.now() - start < MAX_SCROLL_MS) {
    const st = await scrollState(page);
    const ahead = st.y + inflight * WHEEL_DY; // where the queued notches will land
    const hit = targets.find(t => !done.has(t.key) && ahead >= t.y - 20);
    if (hit) {
      while (inflight > 0) await sleep(20);
      await settle(page);
      const y = (await scrollState(page)).y;
      done.add(hit.key);
      pauses.push({ key: hit.key, target: hit.y, y, at: Date.now() - start });
      await sleep(PAUSE_MS);
      targets = await pauseTargets(page);
      next = Date.now();
      continue;
    }
    if (st.end) { if (++endTicks >= 8) break; } else endTicks = 0;
    if (st.y === lastY && !st.end) { if (++still > 120) { console.error('scroll stuck at', st.y); break; } } else still = 0;
    lastY = st.y;
    if (inflight < MAX_INFLIGHT) {
      inflight++;
      cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y: yM, deltaX: 0, deltaY: WHEEL_DY }).catch(() => {}).finally(() => inflight--);
    }
    if (++tick % 20 === 0) targets = await pauseTargets(page);
    next += WHEEL_MS;
    const w = next - Date.now();
    if (w > 0) await sleep(w); else next = Date.now();
  }
  while (inflight > 0) await sleep(20);
  await settle(page);
  return { pauses, ms: Date.now() - start };
}

// The same thumb stroke from raw touch events (60 Hz touchMoves, not awaiting each ack, <= 6 in flight, no fling).
async function touchDrag(cdp, x, y0, dist, speed) {
  const steps = Math.max(4, Math.round(dist / speed * 60)), dt = 1000 / 60;
  let inflight = 0;
  const send = (type, touchPoints) => { inflight++; return cdp.send('Input.dispatchTouchEvent', { type, touchPoints }).catch(() => {}).finally(() => inflight--); };
  await send('touchStart', [{ x, y: y0 }]);
  let next = Date.now();
  for (let i = 1; i <= steps; i++) {
    while (inflight >= 6) await sleep(4);
    send('touchMove', [{ x, y: Math.round(y0 - dist * i / steps) }]);
    next += dt;
    const w = next - Date.now();
    if (w > 0) await sleep(w);
  }
  while (inflight > 0) await sleep(4);
  await sleep(120); // hold before lifting, like synthesizeScrollGesture's preventFling (else a 10k px fling)
  await send('touchEnd', []);
  while (inflight > 0) await sleep(4);
}

// A thumb: repeated touch scroll strokes (~0.7 viewport each) at 1200 px/s through the page.
// Input.synthesizeScrollGesture (touch) first; headless Chromium ignores synthetic TOUCH gestures
// (scrollY stays put; 'mouse' ones scroll), so on no movement it falls back to raw touch-event strokes.
// A stroke that does not move the page is a SCROLL TRAP (e.g. touch-action: none under the thumb): it is
// logged with the element under the finger, and the thumb moves to the gutter like a person would.
async function touchScroll(page, cdp) {
  const xs = [Math.round(MOB.width / 2), 14, MOB.width - 14], y0 = Math.round(MOB.height * 0.85), dist = Math.round(MOB.height * 0.7);
  let method = 'synthesizeScrollGesture', endTicks = 0, still = 0, lastY = -1, n = 0, xi = 0;
  const traps = [];
  const start = Date.now();
  while (Date.now() - start < MAX_SCROLL_MS) {
    const st = await scrollState(page);
    if (st.end) { if (++endTicks >= 2) break; } else endTicks = 0;
    if (st.y === lastY && !st.end) {
      const x = xs[xi];
      traps.push({ y: st.y, x, yFinger: y0, under: await page.evaluate(([x, y]) => {
        const out = [];
        for (let e = document.elementFromPoint(x, y); e && e !== document.body; e = e.parentElement) {
          const ta = getComputedStyle(e).touchAction;
          if (ta !== 'auto' || !out.length) out.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 4).join('.') : ''} (touch-action: ${ta})`);
        }
        const sec = document.elementFromPoint(x, y)?.closest('section[id],footer[id]');
        return `${out.join(' < ')} in #${sec ? sec.id : '-'}`;
      }, [x, y0]).catch(() => '?') });
      console.error(`  scroll trap at y=${st.y} x=${x}: ${traps[traps.length - 1].under}`);
      xi = (xi + 1) % xs.length;
      if (++still > 6) { console.error('touch scroll stuck at', st.y); break; }
    } else { still = 0; xi = 0; }
    lastY = st.y;
    const x = xs[xi];
    if (method === 'synthesizeScrollGesture') {
      await cdp.send('Input.synthesizeScrollGesture', { x, y: y0, yDistance: -dist, speed: TOUCH_SPEED, gestureSourceType: 'touch', repeatCount: 1 })
        .catch(e => console.error('gesture', e.message));
      if (n === 0 && (await scrollState(page)).y === st.y) { method = 'dispatchTouchEvent'; lastY = -1; console.error('  synthetic touch gesture did not scroll; using raw touch-event strokes'); }
    } else {
      await touchDrag(cdp, x, y0, dist, TOUCH_SPEED);
      await sleep(80); // the thumb lifts
    }
    n++;
  }
  return { method, strokes: n, traps, ms: Date.now() - start };
}

async function collect(page) {
  return page.evaluate(() => {
    const M = window.__motion;
    return { raf: M.raf, loaf: M.loaf, ls: M.ls, names: M.names, errors: M.errors, clickAt: M.clickAt, timeOrigin: M.timeOrigin,
      secs: M.measure(), vh: innerHeight, vw: innerWidth, H: document.documentElement.scrollHeight, suspects: suspects(),
      marks: performance.getEntriesByType('mark').filter(m => m.name.startsWith('intro:')).map(m => ({ name: m.name, t: Math.round(m.startTime * 10) / 10 })) };
    // what in each section is expensive to paint/raster (for the raster-bound hotspots)
    function suspects() {
      const out = {};
      const anims = document.getAnimations();
      for (const sec of document.querySelectorAll('section[id], footer[id]')) {
        const o = { filter: 0, backdrop: 0, blend: 0, mask: 0, willChange: 0, video: 0, canvas: 0, img: 0, bigImgMP: 0, infiniteAnims: 0, anims: 0 };
        for (const e of sec.querySelectorAll('*')) {
          const cs = getComputedStyle(e);
          if (cs.display === 'none') continue;
          if (cs.filter !== 'none') o.filter++;
          if (cs.backdropFilter && cs.backdropFilter !== 'none') o.backdrop++;
          if (cs.mixBlendMode !== 'normal') o.blend++;
          if ((cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) o.mask++;
          if (/transform|opacity|filter/.test(cs.willChange)) o.willChange++;
          if (e.tagName === 'VIDEO') o.video++;
          if (e.tagName === 'CANVAS') o.canvas++;
          if (e.tagName === 'IMG') { o.img++; o.bigImgMP += (e.naturalWidth * e.naturalHeight) / 1e6; }
        }
        o.bigImgMP = Math.round(o.bigImgMP * 10) / 10;
        for (const a of anims) {
          const t = a.effect && a.effect.target;
          if (!t || !sec.contains(t)) continue;
          o.anims++;
          const it = a.effect.getTiming ? a.effect.getTiming().iterations : 1;
          if (it === Infinity) o.infiniteAnims++;
        }
        out[sec.id] = o;
      }
      return out;
    }
  });
}

// SCROLL-TIME PAINT TRACE: Paint (main thread, with the node) and raster (GPU process) events for the
// whole run, mapped to sections through a performance.mark() seen on both clocks. It names the nodes
// that repaint while you scroll, the concrete cause behind a raster-bound hotspot.
const TRACE_KEEP = new Set(['Paint', 'RasterDecoderImpl::DoEndRasterCHROMIUM', 'RasterTask', 'motion-trace-start']);
async function startTrace(page, cdp) {
  if (!TRACE) return null;
  const events = [];
  const on = d => { for (const e of d.value) if (TRACE_KEEP.has(e.name) && (e.ph === 'X' || e.name === 'motion-trace-start')) events.push(e); };
  cdp.on('Tracing.dataCollected', on);
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,gpu,blink.user_timing', transferMode: 'ReportEvents' });
  const markT = await page.evaluate(() => performance.mark('motion-trace-start').startTime);
  return {
    events, markT,
    stop: async () => { const done = new Promise(r => cdp.once('Tracing.tracingComplete', r)); await cdp.send('Tracing.end').catch(() => {}); await done; cdp.off('Tracing.dataCollected', on); },
  };
}
const nodeDesc = new Map();
async function describe(cdp, id) {
  if (nodeDesc.has(id)) return nodeDesc.get(id);
  let d = 'node ' + id;
  try {
    const { node } = await cdp.send('DOM.describeNode', { backendNodeId: id });
    const a = node.attributes || [], attr = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : ''; };
    d = `${node.localName || node.nodeName}${attr('id') ? '#' + attr('id') : ''}${attr('class') ? '.' + attr('class').trim().split(/\s+/).slice(0, 3).join('.') : ''}${attr('viewBox') ? ' viewBox=' + attr('viewBox') : ''}${attr('data-motif') ? '[data-motif=' + attr('data-motif') + ']' : ''}`.slice(0, 120);
    const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: id });
    const { result } = await cdp.send('Runtime.callFunctionOn', { objectId: object.objectId, returnByValue: true,
      functionDeclaration: 'function () { const e = this.nodeType === 1 ? this : this.parentElement; const s = e && e.closest("section[id],footer[id],header"); return s ? (s.id || s.tagName.toLowerCase()) : ""; }' });
    if (result && result.value) d += ' in #' + result.value;
  } catch { /* node gone */ }
  nodeDesc.set(id, d);
  return d;
}
async function paintAttribution(tr, M, cdp) {
  if (!tr) return null;
  const mark = tr.events.find(e => e.name === 'motion-trace-start');
  if (!mark) return null;
  const off = mark.ts / 1000 - tr.markT;
  const secs = {};
  for (const e of tr.events) {
    if (e.name === 'motion-trace-start') continue;
    const sec = sectionAt(M.raf, M.names, e.ts / 1000 - off);
    const s = secs[sec] || (secs[sec] = { paints: 0, paintMs: 0, rasterMs: 0, nodes: new Map() });
    if (e.name === 'Paint') {
      s.paints++; s.paintMs += e.dur / 1000;
      const n = e.args && e.args.data && e.args.data.nodeId;
      if (n) { const v = s.nodes.get(n) || { n: 0, ms: 0 }; v.n++; v.ms += e.dur / 1000; s.nodes.set(n, v); }
    } else s.rasterMs += e.dur / 1000;
  }
  const out = {};
  for (const [sec, s] of Object.entries(secs)) {
    const top = [...s.nodes.entries()].sort((a, b) => b[1].n - a[1].n || b[1].ms - a[1].ms).slice(0, 4);
    out[sec] = { paints: s.paints, paintMs: Math.round(s.paintMs), rasterMs: Math.round(s.rasterMs), top: [] };
    for (const [id, v] of top) out[sec].top.push({ node: await describe(cdp, id), n: v.n, ms: r1(v.ms) });
  }
  return out;
}

// ---------------------------------------------------------------- runs
async function scrollRun(browser, run) {
  const { ctx, page, cdp, errors } = await openRun(browser, run);
  const q = run === 'alt' ? '?skip=intro&variant=alt' : run === 'native' ? '?skip=intro,smooth' : '?skip=intro';
  await page.goto(BASE + '/' + q, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.error('goto', e.message));
  await sleep(2500);
  // Phase 3: smooth scroll starts as ladder step 1 (desktop runs only); give it a moment, record whether it ran
  if (run === 'desktop' || run === 'alt') {
    await page.waitForFunction(() => !!window.__lenis, null, { timeout: 4000 }).catch(() => {});
  }
  const lenis = await page.evaluate(() => !!window.__lenis).catch(() => false);
  console.log(`  ${run}: smooth scroll (Lenis) ${lenis ? 'ON' : 'off'}`);
  await page.evaluate(() => scrollTo(0, 0));
  await sleep(300);
  const rec = recorder(cdp, path.join(OUT, run));
  await rec.start();
  const tr = await startTrace(page, cdp);
  await sleep(600);
  const t0 = await perfNow(page);
  const scroll = run === 'mobile' ? await touchScroll(page, cdp) : await wheelScroll(page, cdp);
  await sleep(1500);
  const t1 = await perfNow(page);
  await rec.stop();
  if (tr) await tr.stop();
  const M = await collect(page);
  const paints = await paintAttribution(tr, M, cdp);
  const idle = run === 'desktop' && IDLE ? await idleProbe(page, cdp) : null;
  await ctx.close();
  return { run, url: '/' + q, lenis, M, frames: rec.frames, t0, t1, scroll, errors, idle, paints };
}

// IDLE PROBE (desktop, after the scroll): park on each section for 2.5 s, then trace 1.5 s of standing
// still: rAF rate, GPU/CPU raster time, main-thread paint count and the nodes that keep repainting.
// A section that is slow while NOTHING scrolls is paying for continuous animation or a raster-heavy layer.
async function idleProbe(page, cdp) {
  console.log('  idle probe');
  const ids = await page.evaluate(() => [...document.querySelectorAll('section[id], footer[id]')].map(e => e.id));
  const out = {};
  for (const id of ids) {
    await page.evaluate(id => {
      const e = document.getElementById(id); const r = e.getBoundingClientRect();
      scrollTo(0, r.top + scrollY + Math.max(0, Math.min(r.height - innerHeight, innerHeight) / 2));
    }, id);
    await sleep(2500); // let the first raster of the newly shown tiles finish
    const events = [];
    const onData = d => events.push(...d.value);
    cdp.on('Tracing.dataCollected', onData);
    const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,gpu,cc', transferMode: 'ReportEvents' });
    const fps = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else res(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
    await cdp.send('Tracing.end');
    await done;
    cdp.off('Tracing.dataCollected', onData);
    const sum = {}, paints = new Map();
    for (const e of events) {
      if (e.ph !== 'X' || !e.dur) continue;
      sum[e.name] = (sum[e.name] || 0) + e.dur / 1000;
      if (e.name === 'Paint') {
        const n = e.args && e.args.data && e.args.data.nodeId;
        const k = n || 'root';
        const v = paints.get(k) || { n: 0, ms: 0, node: n };
        v.n++; v.ms += e.dur / 1000; paints.set(k, v);
      }
    }
    const top = [...paints.values()].sort((a, b) => b.n - a.n || b.ms - a.ms).slice(0, 3);
    for (const v of top) {
      v.ms = r1(v.ms);
      if (!v.node) { v.desc = '(layer root)'; continue; }
      try {
        const { node } = await cdp.send('DOM.describeNode', { backendNodeId: v.node });
        const a = node.attributes || [], attr = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : ''; };
        v.desc = `${node.localName || node.nodeName}${attr('id') ? '#' + attr('id') : ''}${attr('class') ? '.' + attr('class').trim().split(/\s+/).slice(0, 3).join('.') : ''}${attr('viewBox') ? ' viewBox=' + attr('viewBox') : ''}`.slice(0, 120);
      } catch { v.desc = 'node ' + v.node; }
      delete v.node;
    }
    const perS = ms => r1((ms || 0) / 1.5);
    out[id] = {
      fps: r1(fps),
      rasterMsPerS: perS((sum['RasterDecoderImpl::DoEndRasterCHROMIUM'] || 0) + (sum['RasterTask'] || 0)),
      paintMsPerS: perS(sum['Paint']), paintsPerS: r1([...paints.values()].reduce((a, v) => a + v.n, 0) / 1.5),
      styleLayoutMsPerS: perS((sum['UpdateLayoutTree'] || 0) + (sum['Layout'] || 0)), rafJsMsPerS: perS(sum['FireAnimationFrame']),
      repaints: top,
    };
  }
  return out;
}

async function introRun(browser) {
  const run = 'intro';
  const { ctx, page, cdp, errors } = await openRun(browser, run);
  const rec = recorder(cdp, path.join(OUT, run));
  await page.goto(BASE + '/?intro=1', { waitUntil: 'load', timeout: 90000 }).catch(e => console.error('goto', e.message));
  await rec.start();
  const tr = await startTrace(page, cdp);
  const tLoad = await perfNow(page);
  await sleep(2500);
  await page.click('#intro-play', { timeout: 15000 }).catch(async e => {
    console.error('click #intro-play:', e.message.split('\n')[0], '- falling back to a mouse click on its box');
    const b = await page.locator('#intro-play').boundingBox().catch(() => null);
    if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  });
  const clickWall = Date.now();
  // record until the overlay has handed over (no intro phase class) and ~9 s have passed; cap 18 s
  while (Date.now() - clickWall < 18000) {
    const on = await page.evaluate(() => /\bintro-(armed|launched|waiting|handoff|landing|sweep|fold|leaving|caps-linger)\b/.test(document.documentElement.className)).catch(() => false);
    if (!on && Date.now() - clickWall > 9000) break;
    await sleep(250);
  }
  await sleep(1200);
  const t1 = await perfNow(page);
  await rec.stop();
  if (tr) await tr.stop();
  const M = await collect(page);
  const paints = await paintAttribution(tr, M, cdp);
  await ctx.close();
  const t0 = M.clickAt || (t1 - (Date.now() - clickWall));
  return { run, url: '/?intro=1', M, frames: rec.frames, t0, tStart: tLoad, t1, scroll: { clickAt: t0, ms: Date.now() - clickWall }, errors, paints };
}

// ---------------------------------------------------------------- analysis helpers
const q = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const r1 = v => v == null ? null : Math.round(v * 10) / 10;
function frameStats(samples) {
  const dts = samples.map(s => s[1]);
  if (!dts.length) return { frames: 0 };
  const worst = samples.reduce((a, s) => s[1] > a[1] ? s : a, samples[0]);
  return {
    frames: dts.length, p50: r1(q(dts, 0.5)), p95: r1(q(dts, 0.95)), p99: r1(q(dts, 0.99)),
    jank33: r1(100 * dts.filter(d => d > JANK).length / dts.length), jank50: r1(100 * dts.filter(d => d > JANK2).length / dts.length),
    max: r1(worst[1]), maxAtY: worst[2], mean: r1(dts.reduce((a, b) => a + b, 0) / dts.length), fps: r1(1000 * dts.length / dts.reduce((a, b) => a + b, 0)),
  };
}
const basename = u => { try { return new URL(u).pathname.split('/').pop() || u; } catch { return String(u || '').split('/').pop(); } };
const scriptKey = s => `${s.type || '?'}:${String(s.inv || '').replace(/^https?:\/\/[^/]+/, '').slice(0, 80)}${s.src ? ' @ ' + basename(s.src) : ''}${s.fn ? ' ' + s.fn : ''}`;

const chunkCache = new Map();
async function snippet(src, pos) {
  if (!src || pos == null || pos < 0) return null;
  try {
    if (!chunkCache.has(src)) chunkCache.set(src, fetch(src).then(r => r.ok ? r.text() : '').catch(() => ''));
    const text = await chunkCache.get(src);
    return text ? text.slice(pos, pos + 140).replace(/\s+/g, ' ') : null;
  } catch { return null; }
}

// the section a moment belongs to: the rAF sample nearest in time
function sectionAt(raf, names, t) {
  if (!raf.length) return '-';
  let lo = 0, hi = raf.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (raf[mid][0] < t) lo = mid + 1; else hi = mid; }
  const a = raf[Math.max(0, lo - 1)], b = raf[lo];
  const s = Math.abs(a[0] - t) < Math.abs(b[0] - t) ? a : b;
  return names[s[3]];
}

function clsSummary(ls) {
  const shifts = ls.filter(s => !s.input);
  const total = shifts.reduce((a, s) => a + s.v, 0);
  // standard CLS: the worst session window (gap < 1 s, window < 5 s)
  let best = 0, cur = 0, wStart = -1e9, prev = -1e9;
  for (const s of shifts) {
    if (s.t - prev > 1000 || s.t - wStart > 5000) { cur = 0; wStart = s.t; }
    cur += s.v; prev = s.t; best = Math.max(best, cur);
  }
  return { total: +total.toFixed(4), sessionMax: +best.toFixed(4), count: shifts.length, withInput: ls.length - shifts.length };
}

// grey thumbnails: lo = 96x60 (the pop metric), hi = 96x240 (~4 px per row, fine enough to undo a scroll)
const HI_ROWS = 240;
async function greyOf(file) {
  const { data, info } = await sharp(file).resize(96, HI_ROWS, { fit: 'fill' }).toColourspace('b-w').raw().toBuffer({ resolveWithObject: true });
  const hi = Buffer.alloc(96 * HI_ROWS);
  for (let i = 0; i < hi.length; i++) hi[i] = data[i * info.channels];
  const lo = Buffer.alloc(96 * 60), k = HI_ROWS / 60;
  for (let r = 0; r < 60; r++) for (let c = 0; c < 96; c++) {
    let v = 0; for (let j = 0; j < k; j++) v += hi[(r * k + j) * 96 + c];
    lo[r * 96 + c] = Math.round(v / k);
  }
  return { lo, hi };
}
function mad(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; }
// b(r) ~ a(r + dRows): undo the scroll before diffing (what is left moved on its own)
function madShift(a, b, dRows, rows) {
  let s = 0, n = 0;
  for (let r = 0; r < rows; r++) {
    const ra = r + dRows; if (ra < 0 || ra > rows - 1) continue;
    const r0 = Math.floor(ra), r1_ = Math.min(rows - 1, r0 + 1), f = ra - r0;
    for (let c = 0; c < 96; c++) { const va = a[r0 * 96 + c] * (1 - f) + a[r1_ * 96 + c] * f; s += Math.abs(va - b[r * 96 + c]); n++; }
  }
  return n ? s / n : 0;
}

// what kind of jump: blank -> content (raster lag / late image), content -> blank, or content -> other content
function popKind(a, b) {
  const ia = [], ib = [];
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 16) { ia.push(a[i]); ib.push(b[i]); }
  const area = r1(100 * ia.length / a.length);
  if (ia.length < 20) return { kind: 'small', area };
  const sd = v => { const m = v.reduce((x, y) => x + y, 0) / v.length; return Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0) / v.length); };
  const sa = sd(ia), sb = sd(ib);
  const kind = sa < 6 && sb > 2 * sa + 4 ? 'fill-in' : sb < 6 && sa > 2 * sb + 4 ? 'blank-out' : 'change';
  return { kind, area, sdBefore: r1(sa), sdAfter: r1(sb) };
}

async function detectPops(frames, dir, vh) {
  const diffs = [];
  let prev = null;
  for (const f of frames) {
    const g = await greyOf(path.join(dir, f.file)).catch(() => null);
    if (g && prev) {
      const dy = f.y - prev.f.y;
      const raw = mad(prev.g.lo, g.lo);
      // the same pair with the scroll undone at 4 px/row: what changed by itself
      const resid = dy ? madShift(prev.g.hi, g.hi, dy * HI_ROWS / vh, HI_ROWS) : mad(prev.g.hi, g.hi);
      diffs.push({ seq: f.seq, t: f.t, y: f.y, sec: f.sec, dy, raw, resid, ...(raw > POP.floor ? popKind(prev.g.lo, g.lo) : {}) });
    }
    if (g) prev = { f, g };
  }
  const hits = [];
  for (let i = 0; i < diffs.length; i++) {
    const d = diffs[i];
    const win = diffs.slice(Math.max(0, i - POP.win), i);
    if (win.length < 5) continue;
    const med = q(win.map(x => x.raw), 0.5), medR = q(win.map(x => x.resid), 0.5);
    d.med = med;
    // the spec'd test (96x60 diff > 3x running median, > floor, scroll moved < 40 px) AND the scroll-undone
    // residual says it really changed by itself (else a slow touch scroll reads as a pop)
    // (resampling text shifted by a few px leaves ~20-25% of the raw diff, so a scrolled pair must keep >= 40%)
    if (Math.abs(d.dy) < POP.maxDy && d.raw > POP.factor * med && d.raw > POP.floor && d.resid > Math.max(POP.floor, POP.factor * medR) && (!d.dy || d.resid >= 0.4 * d.raw)) hits.push(d);
  }
  // one pop per burst
  const pops = [];
  for (const h of hits) {
    const last = pops[pops.length - 1];
    const k = { kind: h.kind, area: h.area };
    if (last && h.t * 1000 - last.tEnd * 1000 < POP.group) { last.tEnd = h.t; last.frames++; if (h.raw > last.diff) Object.assign(last, { seq: h.seq, t: h.t, y: h.y, diff: r1(h.raw), resid: r1(h.resid), median: r1(h.med), ratio: r1(h.raw / Math.max(h.med, 0.01)), dy: h.dy, sec: h.sec, ...k }); continue; }
    pops.push({ seq: h.seq, t: h.t, tEnd: h.t, y: h.y, sec: h.sec, dy: h.dy, diff: r1(h.raw), resid: r1(h.resid), median: r1(h.med), ratio: r1(h.raw / Math.max(h.med, 0.01)), frames: 1, ...k });
  }
  const rawAll = diffs.map(d => d.raw);
  return { pops, diffStats: { n: diffs.length, p50: r1(q(rawAll, 0.5)), p95: r1(q(rawAll, 0.95)), max: r1(Math.max(0, ...rawAll)) } };
}

// ---------------------------------------------------------------- strips
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
async function strip(frames, dir, name, { cols = 4, tileW = 400, title = name, mark = null } = {}) {
  if (!frames.length) return null;
  const m0 = await sharp(path.join(dir, frames[0].file)).metadata();
  const tileH = Math.round(m0.height * tileW / m0.width);
  const LH = 18, G = 4, TH = 26;
  const rows = Math.ceil(frames.length / cols);
  const W = cols * tileW + (cols + 1) * G, H = TH + rows * (tileH + LH + G) + G;
  const comps = [{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TH}"><text x="${G}" y="18" font-family="DejaVu Sans Mono, monospace" font-size="14" fill="#f2f2f2">${esc(title)}</text></svg>`), left: 0, top: 0 }];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i], c = i % cols, r = Math.floor(i / cols);
    const left = G + c * (tileW + G), top = TH + r * (tileH + LH + G);
    const img = await sharp(path.join(dir, f.file)).resize(tileW, tileH, { fit: 'fill' }).toBuffer();
    comps.push({ input: img, left, top });
    const hot = mark && mark(f);
    const lbl = `t=${f.t.toFixed(2)}s y=${f.y} ${f.sec}${hot ? ' ' + hot : ''}`;
    comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${LH}"><rect width="${tileW}" height="${LH}" fill="${hot ? '#6b1010' : '#1d1d1d'}"/><text x="3" y="13" font-family="DejaVu Sans Mono, monospace" font-size="${tileW < 260 ? 9 : 11}" fill="#eee">${esc(lbl)}</text></svg>`), left, top: top + tileH });
  }
  const file = path.join(STRIPS, name + '.png');
  await sharp({ create: { width: W, height: H, channels: 3, background: '#0e0e0e' } }).composite(comps).png({ compressionLevel: 9 }).toFile(file);
  return path.relative(OUT, file);
}
function evenByTime(frames, n, ta, tb) {
  const pool = frames.filter(f => f.t >= ta && f.t <= tb);
  if (pool.length <= n) return pool;
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = ta + (tb - ta) * i / (n - 1);
    const f = pool.reduce((a, x) => Math.abs(x.t - t) < Math.abs(a.t - t) ? x : a, pool[0]);
    if (!out.includes(f)) out.push(f);
  }
  return out;
}
function evenByScroll(frames, n, ya, yb) {
  const pool = frames.filter(f => f.y >= ya && f.y <= yb);
  if (pool.length <= n) return pool;
  const out = [];
  for (let i = 0; i < n; i++) {
    const y = ya + (yb - ya) * i / (n - 1);
    const f = pool.reduce((a, x) => Math.abs(x.y - y) < Math.abs(a.y - y) ? x : a, pool[0]);
    if (!out.includes(f)) out.push(f);
  }
  return out.sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- per-run analysis
async function analyse(R) {
  const { run, M, frames, t0, t1 } = R;
  const dir = path.join(OUT, run);
  const vh = M.vh;
  const tStart = R.tStart ?? t0;
  const raf = M.raf.filter(s => s[0] >= tStart && s[0] <= t1);
  const names = M.names;
  const rel = t => (t - t0) / 1000;
  // frames: relative time + section (the screencast occasionally delivers a frame late: order by its timestamp)
  frames.sort((a, b) => a.ts - b.ts);
  for (const f of frames) { const pt = f.ts - M.timeOrigin; f.t = +rel(pt).toFixed(3); f.sec = sectionAt(M.raf, names, pt); }
  fs.writeFileSync(path.join(dir, 'frames.json'), JSON.stringify(frames.map(({ seq, file, ts, t, y, sec }) => ({ seq, file, ts: Math.round(ts), t, y, sec }))));
  const measured = run === 'intro' ? raf.filter(s => s[0] >= t0) : raf;
  const loaf = M.loaf.filter(l => l.start + l.dur >= tStart && l.start <= t1).map(l => ({ ...l, sec: sectionAt(M.raf, names, l.start + l.dur / 2), t: +rel(l.start).toFixed(2) }));
  const ls = M.ls.filter(s => s.t >= tStart && s.t <= t1).map(s => ({ ...s, sec: sectionAt(M.raf, names, s.t), tRel: +rel(s.t).toFixed(2) }));

  // janky frames that overlap a LoAF in which the main thread really WORKED (script/style/layout/paint
  // >= half the frame, or a >50 ms task) vs frames it spent waiting on the compositor (raster-bound)
  const busy = loaf.filter(l => l.block > 0 || l.work >= 0.5 * l.dur);
  const overlaps = (s) => busy.some(l => l.start < s[0] && l.start + l.dur > s[0] - s[1]);
  const cause = (samples, list) => {
    const janky = samples.filter(s => s[1] > JANK);
    const cov = janky.length ? r1(100 * janky.filter(overlaps).length / janky.length) : null;
    const by = new Map();
    let script = 0, sl = 0, total = 0, work = 0;
    for (const l of list) {
      total += l.dur; sl += l.styleLayout; script += l.scriptMs; work += l.work;
      for (const s of l.scripts) { const k = scriptKey(s); by.set(k, (by.get(k) || 0) + s.d); }
    }
    const top = [...by.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, d]) => ({ script: k, ms: Math.round(d) }));
    const pct = v => total ? r1(100 * v / total) : null;
    return { busyJankPct: cov, loafMs: Math.round(total), workPct: pct(work), waitPct: total ? r1(100 - 100 * work / total) : null, scriptPct: pct(script), styleLayoutPct: pct(sl), topScripts: top };
  };

  const secStats = {};
  for (const name of names) {
    const smp = raf.filter(s => names[s[3]] === name); // (the intro's play screen too)
    if (!smp.length) continue;
    const L = loaf.filter(l => l.sec === name);
    const C = ls.filter(s => s.sec === name && !s.input);
    const P = R.paints && R.paints[name];
    const secS = smp.reduce((a, x) => a + x[1], 0) / 1000;
    const paint = P ? { paintsPerS: r1(P.paints / secS), rasterMsPerS: r1(P.rasterMs / secS), paintMs: P.paintMs, rasterMs: P.rasterMs, repaints: P.top } : null;
    secStats[name] = { ...frameStats(smp), paint, loaf: L.length, loafBlockMs: L.reduce((a, l) => a + l.block, 0), cls: +C.reduce((a, s) => a + s.v, 0).toFixed(4), ...cause(smp, L), suspects: M.suspects[name] || null, idle: R.idle ? R.idle[name] || null : null };
  }
  const trans = {};
  for (const id of ACTS) {
    const s = M.secs.find(x => x.id === id); if (!s) continue;
    const ya = s.top - 0.5 * vh, yb = s.top + s.h;
    const smp = measured.filter(x => x[2] >= ya && x[2] <= yb);
    if (!smp.length) continue;
    const lo = smp[0][0] - smp[0][1], hi = smp[smp.length - 1][0];
    const L = loaf.filter(l => l.start + l.dur > lo && l.start < hi);
    trans[id] = { from: Math.round(ya), to: Math.round(yb), ...frameStats(smp), paint: secStats[id] ? secStats[id].paint : null, loaf: L.length, loafBlockMs: L.reduce((a, l) => a + l.block, 0), ...cause(smp, L), suspects: M.suspects[id] || null, idle: R.idle ? R.idle[id] || null : null };
  }
  const worstLoaf = [...loaf].sort((a, b) => b.dur - a.dur).slice(0, 5);
  for (const l of [...worstLoaf, ...[...loaf].sort((a, b) => b.work - a.work).slice(0, 5)]) for (const s of l.scripts.slice(0, 1)) if (s.snippet === undefined) s.snippet = await snippet(s.src, s.pos);
  const { pops, diffStats } = frames.length > 2 ? await detectPops(frames, dir, vh) : { pops: [], diffStats: {} };
  const cls = clsSummary(ls);
  const topShifts = [...ls].filter(s => !s.input).sort((a, b) => b.v - a.v).slice(0, 8).map(s => ({ t: s.tRel, v: +s.v.toFixed(4), sec: s.sec, sources: s.src.slice(0, 3) }));
  const durS = (t1 - t0) / 1000;
  // P3-3 §4.4: LoAF between the marks intro:warm and intro:titles-end (target: none > 50 ms)
  let introWindow = null;
  if (run === 'intro') {
    const mk = M.marks || [];
    const at = n => { const m = mk.find(x => x.name === n); return m ? m.t : null; };
    const wA = at('intro:warm'), wB = [...mk].reverse().find(x => x.name === 'intro:titles-end')?.t ?? null;
    const W = wA != null && wB != null ? M.loaf.filter(l => l.start + l.dur > wA && l.start < wB) : [];
    introWindow = { marks: mk.map(m => ({ name: m.name, t: +rel(m.t).toFixed(3) })), warm: wA == null ? null : +rel(wA).toFixed(3), titlesEnd: wB == null ? null : +rel(wB).toFixed(3),
      loaf: W.length, over50: W.filter(l => l.dur > 50).length, maxMs: W.reduce((a, l) => Math.max(a, l.dur), 0), blockingMs: W.reduce((a, l) => a + l.block, 0),
      complete: wA != null && wB != null };
  }
  return {
    introWindow,
    run, url: R.url, lenis: R.lenis == null ? null : !!R.lenis, viewport: `${M.vw}x${vh}`, pageHeight: M.H, durationS: r1(durS), scroll: R.scroll,
    screencast: { frames: frames.length, fps: r1(frames.length / Math.max(0.001, (t1 - tStart) / 1000)) },
    frame: frameStats(measured), whole: cause(measured, loaf),
    loaf: { count: loaf.length, totalMs: loaf.reduce((a, l) => a + l.dur, 0), blockingMs: loaf.reduce((a, l) => a + l.block, 0),
      workMs: loaf.reduce((a, l) => a + l.work, 0),
      worst: worstLoaf.map(l => ({ t: l.t, sec: l.sec, dur: l.dur, block: l.block, work: l.work, render: l.render, styleLayout: l.styleLayout, scriptMs: l.scriptMs, scripts: l.scripts })),
      worstWork: [...loaf].sort((a, b) => b.work - a.work).slice(0, 5).map(l => ({ t: l.t, sec: l.sec, dur: l.dur, block: l.block, work: l.work, styleLayout: l.styleLayout, scriptMs: l.scriptMs, scripts: l.scripts })) },
    cls: { ...cls, top: topShifts }, pops, diffStats, sections: secStats, transitions: trans,
    sectionsAt: M.secs, idle: R.idle, pageErrors: [...R.errors, ...M.errors].slice(0, 20), _frames: frames,
  };
}

async function runStrips(A) {
  const out = [];
  const dir = path.join(OUT, A.run);
  const fr = A._frames;
  if (!fr.length) return out;
  const isMob = A.run === 'mobile';
  const tw = isMob ? 180 : 400, cols = isMob ? 8 : 4;
  if (A.run === 'intro') {
    const tEnd = fr[fr.length - 1].t;
    out.push(await strip(evenByTime(fr, 24, -0.5, tEnd), dir, 'intro', { title: 'intro: /?intro=1, click #intro-play at t=0 (24 frames, even in time)' }));
    const land = fr.find(f => /intro:(hold|reveal|landing|fold|leaving)/.test(f.sec));
    if (land) out.push(await strip(evenByTime(fr, 24, land.t - 0.4, tEnd), dir, 'intro-landing', { title: `intro landing -> hero (from t=${land.t.toFixed(2)}s, 24 frames)` }));
  } else {
    if (!isMob) {
      for (const id of ACTS) {
        const s = A.sectionsAt.find(x => x.id === id); if (!s) continue;
        const vh = +A.viewport.split('x')[1];
        const ya = s.top - 0.5 * vh, yb = s.top + s.h;
        // first pass through the window only
        const firstIn = fr.findIndex(f => f.y >= ya);
        const lastIn = fr.findIndex((f, i) => i > firstIn && f.y > yb);
        const pass = fr.slice(Math.max(0, firstIn), lastIn < 0 ? undefined : lastIn + 1);
        out.push(await strip(evenByScroll(pass, 20, ya, yb), dir, `${A.run}-${id}`, { title: `${A.run} ${id}: scrollY ${Math.round(ya)} -> ${Math.round(yb)} (card top ${s.top}, h ${s.h}; 20 frames even in scroll)` }));
      }
      if (A.run === 'desktop' || A.run === 'rm' || A.run === 'native') out.push(await strip(evenByTime(fr, 24, 0, 60), dir, `${A.run}-first-60s`, { title: `${A.run}: first 60 s of the scroll (24 frames, even in time)` }));
      if (A.run === 'alt') out.push(await strip(evenByTime(fr, 24, 0, 60), dir, 'alt-first-60s', { title: 'alt: first 60 s of the scroll (24 frames, even in time)' }));
    } else {
      out.push(await strip(evenByTime(fr, 24, 0, fr[fr.length - 1].t), dir, 'mobile-full-scroll', { cols, tileW: tw, title: 'mobile 390x844: full touch scroll (24 frames, even in time)' }));
    }
  }
  // the biggest pops: 12 sequential frames around each
  const bySeq = new Map(fr.map((f, i) => [f.seq, i]));
  // design pops first (content -> other content), then the biggest raster/late-image fill
  const byDiff = [...A.pops].sort((a, b) => b.diff - a.diff);
  const big = [...byDiff.filter(p => p.kind === 'change').slice(0, 3), ...byDiff.filter(p => p.kind !== 'change')].slice(0, 4);
  for (const p of big) {
    const i = bySeq.get(p.seq); if (i == null) continue;
    const seqFrames = fr.slice(Math.max(0, i - 5), i + 7);
    out.push(await strip(seqFrames, dir, `pop-${A.run}-${p.seq}`, { cols: isMob ? 6 : 6, tileW: isMob ? 180 : 300,
      title: `${A.run} pop @ t=${p.t.toFixed(2)}s y=${p.y} ${p.sec}: ${p.kind}, diff ${p.diff} vs median ${p.median} (dy ${p.dy}, ${p.area}% of the frame) - 12 consecutive frames`,
      mark: f => f.seq === p.seq ? 'POP' : null }));
  }
  return out.filter(Boolean);
}

// ---------------------------------------------------------------- hotspots + report
function hotspots(all) {
  const cands = [];
  for (const A of all) {
    if (A.run === 'rm') continue;
    // enough time spent there to mean something (at ~5 fps a section is only a dozen frames)
    const enough = s => s.frames >= 5 && s.frames * s.mean >= 1500;
    for (const [k, s] of Object.entries(A.sections)) if (enough(s)) cands.push({ run: A.run, where: k, kind: 'section', ...s });
    for (const [k, s] of Object.entries(A.transitions)) if (enough(s)) cands.push({ run: A.run, where: k + ' transition', kind: 'transition', ...s });
  }
  const base = Object.fromEntries(all.map(A => [A.run, A.frame.mean || 1]));
  const idle = (all.find(A => A.idle) || {}).idle || {};
  for (const c of cands) if (!c.idle) c._idle = idle[c.where.replace(' transition', '')] || null;
  // rank by mean frame time (robust at a few fps); a card's section and its transition window overlap,
  // so keep the worse of the two
  const ranked = cands.map(c => ({ ...c, relMean: r1(c.mean / base[c.run]) })).sort((a, b) => (b.mean - a.mean) || (b.p95 - a.p95));
  const seen = new Set(), out = [];
  for (const c of ranked) {
    const k = c.run + ':' + c.where.replace(' transition', '');
    if (seen.has(k)) continue;
    seen.add(k); out.push(c);
    if (out.length === 10) break;
  }
  return out.map(c => ({ run: c.run, where: c.where, frames: c.frames, fps: c.fps, mean: c.mean, p50: c.p50, p95: c.p95, p99: c.p99, jank50: c.jank50, max: c.max, relMean: c.relMean,
    paint: c.paint, loaf: c.loaf, loafBlockMs: c.loafBlockMs, busyJankPct: c.busyJankPct, workPct: c.workPct, waitPct: c.waitPct, scriptPct: c.scriptPct, styleLayoutPct: c.styleLayoutPct,
    topScripts: c.topScripts, suspects: c.suspects, idle: c.idle || c._idle || null, likely: likely(c) }));
}
function suspectText(s) {
  if (!s) return '';
  const parts = [['canvas', 'canvas'], ['video', 'video'], ['filter', 'filter'], ['backdrop', 'backdrop-filter'], ['blend', 'blend'], ['mask', 'mask'], ['willChange', 'will-change'], ['infiniteAnims', 'infinite anims']]
    .filter(([k]) => s[k]).map(([k, l]) => `${s[k]} ${l}`);
  if (s.bigImgMP) parts.push(`${s.bigImgMP} MP of images`);
  return parts.join(', ');
}
function idleText(i) {
  if (!i) return '';
  const rp = i.repaints.filter(r => r.n >= 3).map(r => `${r.desc} ×${r.n}`).join('; ');
  return `idle ${i.fps} fps, raster ${i.rasterMsPerS} ms/s, ${i.paintsPerS} paints/s${rp ? ' (' + rp + ')' : ''}`;
}
function paintText(p) {
  if (!p) return '';
  const rp = p.repaints.slice(0, 2).map(r => `${r.node} ×${r.n}`).join('; ');
  return `while scrolling: raster ${p.rasterMsPerS} ms/s, ${p.paintsPerS} paints/s${rp ? ' — repainting: ' + rp : ''}`;
}
function likely(c) {
  const base = likelyBase(c);
  const extra = [paintText(c.paint), idleText(c.idle || c._idle)].filter(Boolean).join(' | ');
  return extra ? `${base} [${extra}]` : base;
}
function likelyBase(c) {
  if (c.busyJankPct == null) return 'no janky frames';
  const top = c.topScripts[0];
  const sus = suspectText(c.suspects);
  if (c.busyJankPct < 35) return `raster/composite-bound: only ${c.busyJankPct}% of janky frames overlap real main-thread work; the LoAFs are ${c.waitPct}% waiting for the compositor${sus ? ' — on screen: ' + sus : ''}`;
  const sl = c.styleLayoutPct || 0, sc = c.scriptPct || 0;
  if (sl >= sc) return `main thread, style/layout/paint-bound (${sl}% of LoAF time${top ? '; top script ' + top.script + ' ' + top.ms + ' ms' : ''})${sus ? ' — ' + sus : ''}`;
  return `main thread, script-bound (${sc}% script${top ? '; top: ' + top.script + ' ' + top.ms + ' ms' : ''})`;
}

function mdTable(head, rows) { return [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map(r => `| ${r.map(v => v == null ? '' : String(v).replace(/\|/g, '\\|')).join(' | ')} |`)].join('\n'); }
function summary(report) {
  const L = [];
  L.push(`# Motion baseline — ${report.meta.date}`, '');
  L.push(`Base ${report.meta.base} · Chromium ${report.meta.chromium} headless · ${report.meta.cpus} CPUs · screencast everyNthFrame=${NTH}.`, '');
  L.push(`> ${report.meta.note}`, '');
  L.push('## Runs', '');
  L.push(mdTable(['run', 'viewport', 'lenis', 'secs', 'rAF frames', 'fps', 'mean ms', 'p50', 'p95', 'p99', '>33.4 %', '>50 %', 'max', 'LoAF n', 'LoAF block ms', 'busy∩jank %', 'CLS total', 'CLS (session)', 'pops', 'shots'],
    report.runs.map(A => [A.run, A.viewport, A.lenis == null ? '' : A.lenis ? 'on' : 'off', A.durationS, A.frame.frames, A.frame.fps, A.frame.mean, A.frame.p50, A.frame.p95, A.frame.p99, A.frame.jank33, A.frame.jank50, A.frame.max, A.loaf.count, A.loaf.blockingMs, A.whole.busyJankPct, A.cls.total, A.cls.sessionMax, A.pops.length, A.screencast.frames])));
  L.push('', '## Top 10 hotspots (by mean frame time; rm excluded)', '');
  L.push(mdTable(['#', 'run', 'where', 'frames', 'fps', 'mean', 'p95', 'p99', '>50 %', 'max', 'mean / run mean', 'LoAF block ms', 'likely cause'],
    report.hotspots.map((h, i) => [i + 1, h.run, h.where, h.frames, h.fps, h.mean, h.p95, h.p99, h.jank50, h.max, h.relMean, h.loafBlockMs, h.likely])));
  const I = (report.runs.find(A => A.idle) || {}).idle;
  if (I) {
    L.push('', '## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)', '');
    L.push(mdTable(['section', 'idle fps', 'raster ms/s', 'paints/s', 'paint ms/s', 'style+layout ms/s', 'rAF JS ms/s', 'top repainting nodes'],
      Object.entries(I).map(([k, i]) => [k, i.fps, i.rasterMsPerS, i.paintsPerS, i.paintMsPerS, i.styleLayoutMsPerS, i.rafJsMsPerS, i.repaints.map(r => `${r.desc} ×${r.n}`).join('; ')])));
  }
  for (const A of report.runs) {
    L.push('', `## ${A.run} — per section`, '');
    L.push(mdTable(['section', 'frames', 'fps', 'mean', 'p50', 'p95', 'p99', '>33.4 %', '>50 %', 'max', 'LoAF n', 'block ms', 'busy∩jank %', 'CLS', 'raster ms/s', 'paints/s', 'top repainting nodes (scroll)', 'top script', 'paint suspects'],
      Object.entries(A.sections).map(([k, s]) => [k, s.frames, s.fps, s.mean, s.p50, s.p95, s.p99, s.jank33, s.jank50, s.max, s.loaf, s.loafBlockMs, s.busyJankPct, s.cls,
        s.paint ? s.paint.rasterMsPerS : '', s.paint ? s.paint.paintsPerS : '', s.paint ? s.paint.repaints.slice(0, 2).map(r => `${r.node} ×${r.n}`).join('; ') : '',
        s.topScripts[0] ? `${s.topScripts[0].script} (${s.topScripts[0].ms} ms)` : '', suspectText(s.suspects)])));
    if (Object.keys(A.transitions).length) {
      L.push('', `### ${A.run} — act-card transitions (scrollY from 0.5 vh before the card to its end)`, '');
      L.push(mdTable(['card', 'scrollY', 'frames', 'fps', 'mean', 'p50', 'p95', 'p99', '>50 %', 'max', 'LoAF n', 'block ms', 'busy∩jank %'],
        Object.entries(A.transitions).map(([k, s]) => [k, `${s.from}→${s.to}`, s.frames, s.fps, s.mean, s.p50, s.p95, s.p99, s.jank50, s.max, s.loaf, s.loafBlockMs, s.busyJankPct])));
    }
    const loafRow = l => [l.t, l.sec, l.dur, l.block, l.work, l.styleLayout, l.scriptMs, l.scripts[0] ? `${scriptKey(l.scripts[0])} ${l.scripts[0].d} ms` : '(no script)', l.scripts[0] && l.scripts[0].snippet ? '`' + l.scripts[0].snippet.slice(0, 90).replace(/`/g, "'") + '`' : ''];
    if (A.introWindow) {
      const I = A.introWindow;
      L.push('', `### intro — marks and LoAF intro:warm → intro:titles-end`, '',
        I.complete ? `warm t=${I.warm}s → titles-end t=${I.titlesEnd}s: ${I.loaf} LoAF, **${I.over50} > 50 ms** (max ${I.maxMs} ms, blocking ${I.blockingMs} ms)` : '**window incomplete** (intro:warm or intro:titles-end mark missing)',
        '', I.marks.map(m => `${m.name}@${m.t}`).join(' · '));
    }
    L.push('', `### ${A.run} — longest animation frames (LoAF total ${A.loaf.totalMs} ms, main-thread work ${A.loaf.workMs} ms, blocking ${A.loaf.blockingMs} ms)`, '');
    L.push(mdTable(['t s', 'section', 'dur', 'block', 'work', 'style/layout/paint', 'script', 'top script', 'snippet'], A.loaf.worst.map(loafRow)));
    L.push('', `### ${A.run} — LoAFs with the most main-thread work`, '');
    L.push(mdTable(['t s', 'section', 'dur', 'block', 'work', 'style/layout/paint', 'script', 'top script', 'snippet'], A.loaf.worstWork.map(loafRow)));
    L.push('', `### ${A.run} — layout shifts (CLS total ${A.cls.total}, session ${A.cls.sessionMax}, ${A.cls.count} shifts)`, '');
    if (A.cls.top.length) L.push(mdTable(['t s', 'value', 'section', 'sources'], A.cls.top.map(s => [s.t, s.v, s.sec, s.sources.map(x => x.node).join(' ; ')])));
    L.push('', `### ${A.run} — visual pops (${A.pops.length}; diff = 96×60 grey mean abs diff > ${POP.factor}× running median and > ${POP.floor}, scroll moved < ${POP.maxDy} px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)`, '');
    if (A.pops.length) L.push(mdTable(['t s', 'scrollY', 'section', 'dy', 'diff', 'x median', 'kind', 'area %', 'frames'], A.pops.map(p => [p.t.toFixed(2), p.y, p.sec, p.dy, p.diff, p.ratio, p.kind, p.area, p.frames])));
    if (A.scroll && A.scroll.traps && A.scroll.traps.length) {
      L.push('', `### ${A.run} — scroll traps (a touch stroke that did not move the page)`, '');
      L.push(mdTable(['scrollY', 'finger x,y', 'under the finger'], A.scroll.traps.map(t => [t.y, `${t.x},${t.yFinger}`, t.under])));
    }
    if (A.pageErrors.length) L.push('', `Console/page errors: ${A.pageErrors.length} — ${A.pageErrors.slice(0, 3).join(' · ')}`);
  }
  L.push('', '## Strips', '', ...report.strips.map(s => `- ${s}`), '');
  return L.join('\n');
}

(async () => {
  const results = [];
  let version = null;
  if (ANALYSE_ONLY) {
    for (const run of ALL_RUNS) {
      const f = path.join(OUT, run, 'raw.json');
      if (RUNS.includes(run) && fs.existsSync(f)) { const R = JSON.parse(fs.readFileSync(f, 'utf8')); version = R.version; results.push(R); }
    }
  } else {
    const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
    version = browser.version();
    try {
      for (const run of ALL_RUNS) {
        if (!RUNS.includes(run)) continue;
        console.log('run', run);
        const R = run === 'intro' ? await introRun(browser) : await scrollRun(browser, run);
        console.log(`  ${run}: ${R.frames.length} screencast frames, ${R.M.raf.length} rAF samples, ${R.M.loaf.length} LoAF, ${R.M.ls.length} shifts`);
        fs.writeFileSync(path.join(OUT, run, 'raw.json'), JSON.stringify({ ...R, version }));
        results.push(R);
      }
    } finally {
      await browser.close();
    }
  }
  const runs = [], strips = [];
  for (const R of results) {
    console.log('analyse', R.run);
    const A = await analyse(R);
    strips.push(...await runStrips(A));
    runs.push(A);
  }
  const report = {
    meta: { base: BASE, date: new Date().toISOString(), chromium: version, cpus: os.cpus().length, nth: NTH, pop: POP,
      params: { wheel: `${WHEEL_DY}px / ${WHEEL_MS}ms, pause ${PAUSE_MS}ms, in-flight ≤ ${MAX_INFLIGHT}`, touch: `${TOUCH_SPEED}px/s, 0.7 vh gestures` },
      note: 'Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).' },
    runs: runs.map(({ _frames, ...a }) => a),
    hotspots: hotspots(runs),
    strips,
  };
  fs.writeFileSync(path.join(OUT, 'motion.json'), JSON.stringify(report, null, 1));
  fs.writeFileSync(path.join(OUT, 'summary.md'), summary(report));
  console.log('DONE', OUT, runs.map(a => `${a.run}: p50 ${a.frame.p50} p95 ${a.frame.p95} pops ${a.pops.length} CLS ${a.cls.total}`).join(' | '));
})().catch(e => { console.error(e); process.exit(1); });
