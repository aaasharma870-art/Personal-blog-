let { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const [vw, path = '/?skip=intro,smooth'] = process.argv.slice(2);
const [W, H] = vw.split('x').map(Number);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto('http://localhost:3161' + path, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  const ids = await p.evaluate(() => [...document.querySelectorAll('[data-stage-split]')].map(e => e.getAttribute('data-stage-split')));
  for (const id of ids) {
    const out = [];
    for (const at of ['start', 'middle', 'end']) {
      await p.evaluate(({ id, at }) => { const s = document.querySelector(`[data-stage-split="${id}"]`); const r = s.getBoundingClientRect(); const top = r.top + scrollY, h = r.height; const y = at === 'start' ? top - innerHeight * 0.3 : at === 'middle' ? top + h / 2 - innerHeight / 2 : top + h - innerHeight * 0.9; window.scrollTo({ top: Math.max(0, y), behavior: 'instant' }); }, { id, at });
      await p.waitForTimeout(1200);
      out.push(await p.evaluate(({ id, at }) => {
        const s = document.querySelector(`[data-stage-split="${id}"]`); const win = s.querySelector(':scope > .stage-window'); const txt = s.querySelector(':scope > .stage-split-text');
        const wr = win.getBoundingClientRect(); const hb = document.querySelector('body header').getBoundingClientRect().bottom;
        const imgs = [...win.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth > 0 && +getComputedStyle(i).opacity > 0.5 && +getComputedStyle(i.closest('.stage-layer') || i).opacity > 0.5);
        return `${at}: win.top=${Math.round(wr.top)} h=${Math.round(wr.height)} hdr=${Math.round(hb)} winL=${Math.round(wr.left)} txtL=${Math.round(txt.getBoundingClientRect().left)} on=${win.hasAttribute('data-stage-on')} imgs=${imgs.length} ovf=${document.documentElement.scrollWidth - document.documentElement.clientWidth}`;
      }, { id, at }));
    }
    console.log(vw, id, '\n  ' + out.join('\n  '));
  }
  await b.close();
})();
