// tools/capture/sheet.mjs: pack a folder of frames into labelled JPG contact sheets (P3-11.0 TOOLS).
// Usage: node tools/capture/sheet.mjs <srcDir> <outDir> [--match=<regex>] [--cols=4] [--per=12] [--width=1600]
//          [--quality=70] [--title=<text>] [--prefix=sheet]
// Every image in <srcDir> whose file name matches --match (default: any .png / .jpg) is drawn in name order,
// --cols per row, --per per sheet, the file name (without extension) burned in above each frame. Sheets are
// ≤ --width px wide: the committed record of a capture whose full-size frames stay local (e.g. scenes.js PNGs).
// Writes <outDir>/<prefix>-NN.jpg and <outDir>/<prefix>s.json (sheet → frame names).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const [SRC, DST] = argv.filter((a) => !a.startsWith("--"));
if (!SRC || !DST) {
  console.error("usage: node tools/capture/sheet.mjs <srcDir> <outDir> [--match=regex] [--cols=4] [--per=12] [--width=1600]");
  process.exit(2);
}
const re = new RegExp(flags.match ?? "\\.(png|jpe?g)$", "i");
const COLS = Number(flags.cols ?? 4);
const PER = Number(flags.per ?? 12);
const W = Number(flags.width ?? 1600);
const Q = Number(flags.quality ?? 70);
const PREFIX = flags.prefix ?? "sheet";
const files = fs.readdirSync(SRC).filter((f) => re.test(f) && /\.(png|jpe?g)$/i.test(f)).sort();
if (!files.length) {
  console.error(`sheet: no frames matching ${re} in ${SRC}`);
  process.exit(1);
}
fs.mkdirSync(DST, { recursive: true });
const first = await sharp(path.join(SRC, files[0])).metadata();
const GAP = 6;
const LABEL = 18;
const HEAD = flags.title ? 24 : 0;
const tw = Math.floor((W - (COLS + 1) * GAP) / COLS);
const th = Math.round((tw * first.height) / first.width);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const index = {};
const n = Math.ceil(files.length / PER);
for (let s = 0; s < n; s++) {
  const part = files.slice(s * PER, (s + 1) * PER);
  const rows = Math.ceil(part.length / COLS);
  const H = HEAD + GAP + rows * (LABEL + th + GAP);
  const comp = [];
  if (HEAD) comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HEAD}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="17" font-family="DejaVu Sans" font-size="14" fill="#fff">${esc(`${flags.title} · sheet ${s + 1}/${n}`)}</text></svg>`), left: 0, top: 0 });
  for (let k = 0; k < part.length; k++) {
    const left = GAP + (k % COLS) * (tw + GAP);
    const top = HEAD + GAP + Math.floor(k / COLS) * (LABEL + th + GAP);
    const label = part[k].replace(/\.(captioned|blind)?\.?(png|jpe?g)$/i, (m, a) => (a ? `.${a}` : ""));
    comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${LABEL}"><rect width="100%" height="100%" fill="#1d1d1d"/><text x="4" y="13" font-family="DejaVu Sans" font-size="12" fill="#f2f2f2">${esc(label)}</text></svg>`), left, top });
    comp.push({ input: await sharp(path.join(SRC, part[k])).resize(tw, th, { fit: "contain", background: "#000" }).toBuffer(), left, top: top + LABEL });
  }
  const name = `${PREFIX}-${String(s + 1).padStart(2, "0")}.jpg`;
  await sharp({ create: { width: W, height: H, channels: 3, background: "#000" } }).composite(comp).jpeg({ quality: Q, mozjpeg: true }).toFile(path.join(DST, name));
  index[name] = part;
}
fs.writeFileSync(path.join(DST, `${PREFIX}s.json`), JSON.stringify(index, null, 1));
console.log(`sheet: ${files.length} frame(s) → ${n} sheet(s) in ${DST}`);
