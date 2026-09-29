// Build an anonymized blind-judge set. Usage: node anon.mjs <framesDir> <outDir>  (writes <outDir>-key.json beside it)
// Build an anonymized blind-judge set: downscaled JPGs with shuffled neutral names.
import sharp from 'sharp';
import fs from 'fs'; import path from 'path';
const [,, SRC, DST, suffix = 'blind'] = process.argv;
fs.rmSync(DST, { recursive: true, force: true }); fs.mkdirSync(DST, { recursive: true });
const files = fs.readdirSync(SRC).filter(f => f.endsWith(`.${suffix}.png`) && /^[DA]\d/.test(f)).sort();
const sig = async f => (await sharp(path.join(SRC, f)).resize(48, 30, { fit: 'fill' }).greyscale().raw().toBuffer());
const keep = [];
for (const f of files) {
  if (f.startsWith('A')) {
    const d = 'D' + f.slice(1);
    if (fs.existsSync(path.join(SRC, d))) {
      const [a, b] = await Promise.all([sig(f), sig(d)]);
      let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
      const mad = s / a.length;
      if (mad < 4) { continue; } // alt identical to default -> judged once
    }
  }
  keep.push(f);
}
// deterministic shuffle
let seed = 20260929; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const order = keep.map(f => [rnd(), f]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const key = {};
let n = 1;
for (const f of order) {
  const id = 'J' + String(n++).padStart(3, '0');
  key[id] = f.replace(`.${suffix}.png`, '');
  await sharp(path.join(SRC, f)).resize({ width: 1024 }).jpeg({ quality: 78 }).toFile(path.join(DST, id + '.jpg'));
}
fs.writeFileSync(path.join(path.dirname(DST), path.basename(DST) + '-key.json'), JSON.stringify(key, null, 1));
console.log('kept', keep.length, 'of', files.length);
