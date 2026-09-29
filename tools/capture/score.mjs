// Score blind-judge verdicts. Usage: node score.mjs <unused> <out.json> <key.json> <verdictsPrefix> <manifest.json>  (reads <prefix>1..3.json)
import fs from 'fs';
const SP = process.argv[2], OUT = process.argv[3];
const [KEYF, VPRE, MANF] = [process.argv[4], process.argv[5], process.argv[6]];
const key = JSON.parse(fs.readFileSync(KEYF, 'utf8'));
const man = JSON.parse(fs.readFileSync(MANF, 'utf8'));
const byFrame = Object.fromEntries(man.map(m => [m.frame, m]));
const J = [1, 2, 3].map(i => { try { return JSON.parse(fs.readFileSync(`${VPRE}${i}.json`, 'utf8')); } catch { return []; } });
const norm = f => /harry/i.test(f) ? 'hp' : /pirat/i.test(f) ? 'pirates' : /idiot/i.test(f) ? 'idiots' : /red dead|rdr/i.test(f) ? 'rdr2' : '??';
// 'idiots(no film styling)' (the experiment) carries NO film by rule H4: n/a.
// A hand-off beat ('hp→pirates', the flight's cross-dissolve) is intended as
// BOTH films: a verdict naming either is correct, neither is "wrong-film".
const intended = w => w.includes('no film styling') ? null : w === 'hp→pirates' ? 'hp|pirates' : w.startsWith('house') ? null : w.startsWith('idiots') ? 'idiots' : w;
const matches = (f, want) => want.split('|').includes(f);
const rows = [];
for (const [jid, frame] of Object.entries(key)) {
  const m = byFrame[frame] || {};
  const want = intended(m.world || '');
  const vs = J.map(j => j.find(v => v.frame === jid));
  const ok = want ? vs.filter(v => v && matches(norm(v.film), want) && v.confidence >= 0.6).length : 0;
  const wrong = want ? vs.filter(v => v && norm(v.film) !== '??' && !matches(norm(v.film), want) && v.confidence >= 0.5).length : 0;
  rows.push({ jid, frame, world: m.world, mode: m.mode, moment: m.moment, want, ok, wrong, pass: want ? ok >= 2 : null,
    v: vs.map(v => v ? `${norm(v.film)} ${(+v.confidence).toFixed(2)}` : '—'), why: vs[0]?.why || '' });
}
rows.sort((a, b) => a.frame.localeCompare(b.frame));
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
const md = rows.map(r => `| ${r.frame} | ${r.mode} | ${r.want} | ${r.v.join(' / ')} | ${r.pass === null ? 'n/a' : r.pass ? 'PASS' : 'FAIL'}${r.wrong ? ` (${r.wrong} wrong-film)` : ''} |`).join('\n');
console.log(md);
const blind = rows.filter(r => r.mode === 'BLIND');
console.log(`\nBLIND pass ${blind.filter(r => r.pass).length}/${blind.length}; all-with-film pass ${rows.filter(r => r.pass).length}/${rows.filter(r => r.pass !== null).length}; wrong-film frames ${rows.filter(r => r.wrong).length}`);
