// Build an anonymized stranger-judge set: downscaled JPGs with shuffled neutral names (M2; P3-11.0 at 1440 + 1024).
// Usage: node tools/capture/anon.mjs <framesDir> <outDir> [suffix] [--mode=blind|captioned|frames] [--key=<file>]
//          [--prefix=J] [--seed=20260929] [--width=1024] [--quality=78] [--match=<regex>] [--exclude=<regex>]
//          [--manifest=<scenes manifest.json> --modes=BLIND,…]
// <framesDir> = a tools/capture/scenes.js output (NAME.blind.png + NAME.captioned.png, names D##-… / A##-…), at
// any width (1440×900, 1024×768: the frames keep their own aspect; --width caps the JPG width, never upscales).
//   --mode=blind      (default) the *.blind.png frames (CSS hides all text, keeps the shapes): world
//                     recognizability. An A-frame whose blind image matches its D-frame (48×30 grey mean abs
//                     diff < 4) is judged once, under the D name.
//   --mode=captioned  the D-frames' *.captioned.png (text visible): the name read, "can't read this", the fast lane.
//   --mode=frames     every *.jpg / *.png in <framesDir> as is (e.g. the card hook frames from hooks.mjs).
// The positional [suffix] (old form) is the frame suffix of blind mode ("blind").
// --prefix   the neutral id letter (J blind, C captioned, H hooks …); --seed a per-set shuffle (use a different
//            seed per width so the two sets are not in the same order).
// --modes    with --manifest: keep only frames of those RECOGNIZABILITY modes (BLIND, CAPTION, TRANSITION, …).
// --key      where the id → frame key goes (default: <outDir>-key.json beside <outDir>). Keep it OUT of the folder
//            the judges get: the out dir holds only <prefix>###.jpg, no URL, frame or film name.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "1"];
  }),
);
const [SRC, DST, suffixArg] = argv.filter((a) => !a.startsWith("--"));
if (!SRC || !DST) {
  console.error("usage: node tools/capture/anon.mjs <framesDir> <outDir> [suffix] [--mode=blind|captioned|frames] [--key=…] [--prefix=J] [--seed=…] [--width=1024]");
  process.exit(2);
}
const MODE = flags.mode ?? "blind";
const suffix = MODE === "captioned" ? "captioned" : suffixArg ?? "blind";
const PREFIX = flags.prefix ?? (MODE === "captioned" ? "C" : MODE === "frames" ? "H" : "J");
const WIDTH = Number(flags.width ?? 1024);
const QUALITY = Number(flags.quality ?? 78);
const KEYF = flags.key ?? path.join(path.dirname(DST), path.basename(DST) + "-key.json");
const match = flags.match ? new RegExp(flags.match) : null;
const exclude = flags.exclude ? new RegExp(flags.exclude) : null;

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });

const strip = (f) => f.replace(new RegExp(`\\.${suffix}\\.png$`), "").replace(/\.(png|jpe?g)$/i, "");
let files;
if (MODE === "frames") files = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
else if (MODE === "captioned") files = fs.readdirSync(SRC).filter((f) => f.endsWith(".captioned.png") && /^D\d/.test(f)).sort();
else files = fs.readdirSync(SRC).filter((f) => f.endsWith(`.${suffix}.png`) && /^[DA]\d/.test(f)).sort();
files = files.filter((f) => (!match || match.test(strip(f))) && (!exclude || !exclude.test(strip(f))));
// --manifest=<scenes manifest.json> --modes=BLIND,CAPTION: keep only frames whose manifest mode is listed
if (flags.manifest && flags.modes) {
  const modes = new Set(flags.modes.split(","));
  const man = Object.fromEntries(JSON.parse(fs.readFileSync(flags.manifest, "utf8")).map((m) => [m.frame, m]));
  files = files.filter((f) => modes.has(man[strip(f)]?.mode));
}

const sig = async (f) => sharp(path.join(SRC, f)).resize(48, 30, { fit: "fill" }).greyscale().raw().toBuffer();
const keep = [];
for (const f of files) {
  if (MODE === "blind" && f.startsWith("A")) {
    const d = "D" + f.slice(1);
    if (fs.existsSync(path.join(SRC, d))) {
      const [a, b] = await Promise.all([sig(f), sig(d)]);
      let s = 0;
      for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
      if (s / a.length < 4) continue; // alt identical to default -> judged once
    }
  }
  keep.push(f);
}
// deterministic shuffle (seeded per set)
let seed = Number(flags.seed ?? 20260929);
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const order = keep.map((f) => [rnd(), f]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const key = {};
let n = 1;
for (const f of order) {
  const id = PREFIX + String(n++).padStart(3, "0");
  key[id] = strip(f);
  const meta = await sharp(path.join(SRC, f)).metadata();
  await sharp(path.join(SRC, f))
    .resize({ width: Math.min(WIDTH, meta.width ?? WIDTH) })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(path.join(DST, id + ".jpg"));
}
fs.mkdirSync(path.dirname(KEYF), { recursive: true });
fs.writeFileSync(KEYF, JSON.stringify(key, null, 1));
console.log(`anon (${MODE}): kept ${keep.length} of ${files.length} → ${DST} (${PREFIX}001…); key ${KEYF}`);
