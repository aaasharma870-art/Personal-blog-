// node preview.mjs frames.json preview-strip.png  -> text-free graphite strip (8 frames on paper, ground line)
import sharp from '../../../../../../../node_modules/sharp/lib/index.js';
import fs from 'node:fs';
const t = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const [, , W, H] = t.viewBox.split(' ').map(Number);
const gap = 6, n = t.frames.length, sc = 1.5;
const TW = n * W + (n + 1) * gap, TH = H + 2 * gap;
let g = '';
t.frames.forEach((f, i) => {
  const x = gap + i * (W + gap);
  g += `<g transform="translate(${x} ${gap})"><line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#b9ae98" stroke-width="0.5"/><path d="${f.d}" fill="#34312d" fill-rule="${t.fillRule}"/></g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(TW*sc)}" height="${Math.round(TH*sc)}" viewBox="0 0 ${TW} ${TH}"><rect width="100%" height="100%" fill="#efe9dc"/>${g}</svg>`;
await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(process.argv[3]);
console.log('ok', Math.round(TW*sc), Math.round(TH*sc));
