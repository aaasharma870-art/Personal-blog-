import sharp from '/home/user/Personal-blog-/node_modules/sharp/lib/index.js';
import fs from 'node:fs';
const t = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = process.argv[3];
const [ , , W, H] = t.viewBox;
const n = t.frames.length, gap = 8, cellW = W, cellH = H;
const totalW = n * cellW + (n + 1) * gap, totalH = cellH + 2 * gap;
let g = '';
t.frames.forEach((f, i) => {
  const x = gap + i * (cellW + gap), y = gap;
  g += `<g transform="translate(${x} ${y})"><line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#b9ae98" stroke-width="0.6"/><path d="${f.d}" fill="#2e2c29" fill-rule="evenodd"/></g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW*4}" height="${totalH*4}" viewBox="0 0 ${totalW} ${totalH}"><rect width="100%" height="100%" fill="#efe9dc"/>${g}</svg>`;
fs.writeFileSync(out.replace(/\.png$/, '.svg'), svg);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
console.log('ok', out, totalW*4, totalH*4);
