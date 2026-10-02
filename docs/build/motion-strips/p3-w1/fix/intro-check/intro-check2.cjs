// W1 measure: §4.4 extras — media state at reveal t0, hand-off script, marks, LoAF warm→titles-end (work vs duration).
let { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const [base, vw = '1440x900', runs = '3'] = process.argv.slice(2);
const [W, H] = vw.split('x').map(Number);
(async () => {
  const b = await chromium.launch();
  const all = [];
  for (let k = 0; k < +runs; k++) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    await p.addInitScript(() => {
      window.__lo = []; window.__fr = [];
      try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lo.push({ s: e.startTime, d: e.duration, block: e.blockingDuration, sl: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0, scripts: [...(e.scripts || [])].map(s => ({ d: s.duration, inv: String(s.invoker).slice(0, 80), src: String(s.sourceURL).slice(-40), fn: s.sourceFunctionName, st: s.startTime })) }); }).observe({ type: 'long-animation-frame', buffered: true }); } catch {}
      const tick = (t) => {
        const c = document.documentElement.className;
        const m = document.querySelector('[data-hero-lens="desktop"] [data-media]') || document.querySelector('#top [data-media-state]');
        const h1 = document.querySelector('main h1'); let nm = null; if (h1) { const r = h1.getBoundingClientRect(); let op = 1; for (let e = h1; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity;
          // VISUAL cover, not hit-testing: while the overlay is up, the held still covers the name unless the stage's
          // mask (transparent up to 1/3 of the stage minus the feather) has passed the name's right edge; the
          // empty .intro-block is hit-testable but transparent (the W1 measure read it as a cover)
          let covered = false; const intro = document.getElementById('intro'); const stage = document.getElementById('intro-stage');
          if (intro && getComputedStyle(intro).display !== 'none' && +getComputedStyle(intro).opacity > 0.01) {
            if (!/intro-handoff/.test(c)) covered = true;
            else if (stage) { const sb = stage.getBoundingClientRect(); const mask = getComputedStyle(stage).maskImage || getComputedStyle(stage).webkitMaskImage || ''; const F = (/(\d+)px\)/.exec(mask) || [0, 0])[1] * 1; const clearTo = sb.left + sb.width / 3 - F; covered = clearTo < r.right; }
          }
          nm = op > 0.5 && !covered ? +op.toFixed(2) : 0; }
        window.__fr.push([Math.round(t), /intro-sweep/.test(c) ? 1 : 0, /intro-handoff/.test(c) ? 1 : 0, m ? m.getAttribute('data-media-state') : null, nm]);
        if (window.__fr.length < 4000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await p.goto(base + '/?intro=1', { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    await p.click('#intro-play').catch(e => errs.push('click ' + e));
    await p.waitForFunction(() => performance.getEntriesByName('intro:titles-end').length || performance.getEntriesByName('intro:end').length && performance.now() > 0, null, { timeout: 20000 }).catch(() => null);
    await p.waitForTimeout(4500);
    const r = await p.evaluate(() => {
      const mk = {}; for (const e of performance.getEntriesByType('mark')) if (/^(intro:|p3:)/.test(e.name)) mk[e.name] = Math.round(e.startTime);
      const rev = mk['intro:reveal'];
      const fr = window.__fr;
      const firstSweep = fr.find(f => f[1]);
      const atRev = rev != null ? fr.find(f => f[0] >= rev) : null;
      const wA = mk['intro:warm'], wB = mk['intro:titles-end'] ?? mk['intro:end'];
      const inWin = window.__lo.filter(l => wA != null && l.s + l.d >= wA && l.s <= (wB ?? 1e9));
      const work = (l) => l.scripts.reduce((n, s) => n + s.d, 0) + l.sl;
      const hold = mk['intro:hold'];
      const hand = window.__lo.filter(l => hold != null && rev != null && l.s + l.d >= hold - 5 && l.s <= rev + 50);
      const handScripts = hand.flatMap(l => l.scripts).filter(s => /intro|chunks/.test(s.src) || /intro/.test(s.inv));
      const firstName = fr.find(f => f[4] > 0.5 && rev != null && f[0] >= rev - 50);
      const revFrames = rev != null ? fr.filter(f => f[0] >= rev).slice(0, 4).map(f => [f[0] - rev, f[4]]) : null;
      return {
        nameFirstVisibleMsAfterReveal: firstName && rev != null ? firstName[0] - rev : null, revFrames, nameFramesAfterReveal: firstName && rev != null ? fr.filter(f => f[0] >= rev && f[0] <= firstName[0]).length : null,
        marks: mk,
        mediaAtFirstSweepFrame: firstSweep ? firstSweep[3] : 'no sweep frame', mediaAtRevealMark: atRev ? atRev[3] : null,
        mediaStatesSeen: [...new Set(fr.map(f => f[3]))],
        loafWarmToEnd: { n: inWin.length, over50dur: inWin.filter(l => l.d > 50).length, maxDur: Math.round(Math.max(0, ...inWin.map(l => l.d))), over50work: inWin.filter(l => work(l) > 50).length, maxWork: Math.round(Math.max(0, ...inWin.map(work))), worst: inWin.sort((a, b) => work(b) - work(a)).slice(0, 3).map(l => ({ t: Math.round(l.s), d: Math.round(l.d), work: Math.round(work(l)), top: l.scripts.sort((a, b) => b.d - a.d)[0] })) },
        handoff: { loafs: hand.length, maxScript: Math.round(Math.max(0, ...hand.flatMap(l => l.scripts.map(s => s.d)))), scripts: handScripts.map(s => `${Math.round(s.d)}ms ${s.inv} ${s.src} ${s.fn}`).slice(0, 5) },
      };
    });
    all.push({ run: k, ...r, errs });
    await ctx.close();
  }
  console.log(JSON.stringify(all, null, 1));
  await b.close();
})();
