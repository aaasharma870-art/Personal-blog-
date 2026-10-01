// tools/capture/diff.mjs: per-frame pixel diff of two capture folders (Phase 3, B1-SCROLL).
// Usage: node tools/capture/diff.mjs <dirA> <dirB> [--threshold=24] [--max=0.1] [--out=<file.json>]
//                                    [--diffs=<dir>] [--recursive] [--only=<regex>]
//
// Pairs every image in <dirA> (png / jpg / jpeg / webp) with the file of the same relative name in <dirB>
// and reports the share of pixels that CHANGED: a pixel counts when any RGBA channel differs by more than
// --threshold (0-255, default 24: ignores JPEG / anti-alias noise). Typical use: "is the page unchanged?"
// (W1.0 / wave gates: phones and reduced motion must stay pixel-identical, anti-alias noise <= 0.1 %):
//   node tools/capture/scenes.js http://localhost:3162 <base> --only=mobile
//   node tools/capture/scenes.js http://localhost:3161 <head> --only=mobile
//   node tools/capture/diff.mjs <base> <head> --max=0.1 --diffs=<head>/diff
// Output: a table (worst first), <dirB>/diff.json (or --out) with { meta, frames: [{ name, pct, changed,
// total, size?, missing? }] }. --diffs writes a PNG per changed frame (changed pixels red over a dimmed B).
// Exit code: 1 when any frame changed more than --max percent, differs in size or is missing from <dirB>;
// 2 on bad arguments. Frames only in <dirB> are listed (`extra`) but never fail.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const [A, B] = argv.filter((a) => !a.startsWith("--"));
if (!A || !B || flags.help) {
  console.error("usage: node tools/capture/diff.mjs <dirA> <dirB> [--threshold=24] [--max=0.1] [--out=f.json] [--diffs=dir] [--recursive] [--only=regex]");
  process.exit(flags.help ? 0 : 2);
}
for (const d of [A, B]) {
  if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) {
    console.error(`diff.mjs: not a directory: ${d}`);
    process.exit(2);
  }
}
const THRESHOLD = Number(flags.threshold ?? 24);
const MAX = Number(flags.max ?? 0.1);
const ONLY = flags.only ? new RegExp(flags.only) : null;
const OUT = flags.out ?? path.join(B, "diff.json");
const DIFFS = flags.diffs ?? null;
if (!Number.isFinite(THRESHOLD) || !Number.isFinite(MAX)) {
  console.error("diff.mjs: --threshold and --max must be numbers");
  process.exit(2);
}

const IMG = /\.(png|jpe?g|webp)$/i;
function list(dir, rel = "") {
  const out = [];
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = path.join(rel, e.name);
    if (e.isDirectory()) {
      if (flags.recursive && path.resolve(dir, r) !== path.resolve(DIFFS ?? "\0")) out.push(...list(dir, r));
    } else if (IMG.test(e.name) && (!ONLY || ONLY.test(r))) out.push(r);
  }
  return out.sort();
}

const raw = (file) => sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

async function compare(name) {
  const [a, b] = await Promise.all([raw(path.join(A, name)), raw(path.join(B, name))]);
  const { width: w, height: h } = a.info;
  if (w !== b.info.width || h !== b.info.height) {
    return { name, pct: 100, changed: null, total: null, size: [`${w}x${h}`, `${b.info.width}x${b.info.height}`] };
  }
  const pa = a.data;
  const pb = b.data;
  const total = w * h;
  let changed = 0;
  const mask = DIFFS ? Buffer.alloc(total * 4) : null;
  for (let i = 0, p = 0; p < total; p++, i += 4) {
    const d = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]), Math.abs(pa[i + 3] - pb[i + 3]));
    const hit = d > THRESHOLD;
    if (hit) changed++;
    if (mask) {
      if (hit) {
        mask[i] = 255;
        mask[i + 1] = 0;
        mask[i + 2] = 0;
      } else {
        mask[i] = pb[i] >> 2;
        mask[i + 1] = pb[i + 1] >> 2;
        mask[i + 2] = pb[i + 2] >> 2;
      }
      mask[i + 3] = 255;
    }
  }
  const pct = (100 * changed) / total;
  if (mask && changed) {
    const outFile = path.join(DIFFS, name.replace(IMG, ".diff.png"));
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    await sharp(mask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(outFile);
  }
  return { name, pct: Math.round(pct * 1000) / 1000, changed, total };
}

const namesA = list(A);
const namesB = new Set(list(B));
const frames = [];
for (const name of namesA) {
  if (!namesB.has(name)) {
    frames.push({ name, pct: 100, changed: null, total: null, missing: true });
    continue;
  }
  try {
    frames.push(await compare(name));
  } catch (e) {
    frames.push({ name, pct: 100, changed: null, total: null, error: String(e && e.message ? e.message : e) });
  }
}
const setA = new Set(namesA);
const extra = [...namesB].filter((n) => !setA.has(n));
frames.sort((x, y) => y.pct - x.pct || x.name.localeCompare(y.name));

const failed = frames.filter((f) => f.pct > MAX || f.size || f.missing || f.error);
const report = {
  meta: { a: path.resolve(A), b: path.resolve(B), threshold: THRESHOLD, max: MAX, date: new Date().toISOString(), compared: frames.length, failed: failed.length },
  frames,
  extra,
};
fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 1) + "\n");

const pad = Math.min(60, Math.max(10, ...frames.map((f) => f.name.length)));
console.log(`${"frame".padEnd(pad)}  changed %`);
for (const f of frames) {
  const note = f.missing ? "missing in B" : f.size ? `size ${f.size[0]} vs ${f.size[1]}` : f.error ? `error: ${f.error}` : f.pct.toFixed(3);
  console.log(`${f.name.padEnd(pad)}  ${note}${f.pct > MAX || f.size || f.missing || f.error ? "  <-- over" : ""}`);
}
if (extra.length) console.log(`only in B (${extra.length}): ${extra.slice(0, 8).join(", ")}${extra.length > 8 ? " …" : ""}`);
console.log(`diff.mjs: ${frames.length} frame(s), ${failed.length} over ${MAX} % (threshold ${THRESHOLD}) -> ${OUT}`);
process.exit(failed.length ? 1 : 0);
