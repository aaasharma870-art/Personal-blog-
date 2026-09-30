#!/usr/bin/env node
/**
 * tools/media/loop.mjs — seamless-loop build + acceptance checks for the film loops.
 *
 * Replaces the old tools/join.py, vcheck.py and laneB_vloop.py (never committed).
 * Node 22 ESM. Needs ffmpeg 7 (no ffprobe needed; FFMPEG env or /usr/local/bin/ffmpeg)
 * and sharp (repo devDependency). python3 + cv2 is optional (phase shift in `check`).
 * Every ffmpeg call runs with -threads 2 (FFMPEG_THREADS to override).
 *
 * SUBCOMMANDS
 *
 *   seam <master.mp4> <out-base> --k=12|24 --tier=S|I
 *        [--crf-mp4=22|26] [--crf-webm=32] [--curve=linear|smooth]
 *        [--rotate=0|auto|<n>] [--plate=<still>] [--keep-intermediate]
 *     Tail->head blend seam (media-loops map §4; NOT xfade). With N source frames:
 *       out = src[K..N-K-1] ++ blend(src[N-K+i] -> src[i], w = i/(K-1)), i = 0..K-1
 *     so the last output frame IS src[K-1] and the first is src[K]: the wrap is one
 *     natural frame step. Output length N-K frames (8.04 s @ K=24 -> 7.04 s).
 *     The seam is rendered once to a lossless intermediate (x264 -qp 0), then encoded:
 *       <out-base>.mp4         H.264 High yuv420p, GOP 48, +faststart, -an
 *       <out-base>.webm        VP9 -b:v 0 -crf, -row-mt 1, GOP 48, -an
 *       <out-base>-poster.webp frame 0, 1920 w, q80 (steps down to stay <= 100 KB)
 *     Tier S = 1920x1080 (mp4 CRF 22), tier I = 1280x720 (mp4 CRF 26). WebM CRF 32.
 *     --rotate=auto (needs --plate) cyclically rotates the loop so frame 0 is the output
 *     frame closest to the plate (best poster->video registration; the loop is unchanged).
 *     Use K=12 for slow scenes, K=24 for busy ones (sea, rain). Prints a JSON summary.
 *
 *   boomerang <master.mp4> <out-base> --tier=S|I [--crf-mp4] [--crf-webm]
 *     Forward src[0..N-1] then reverse src[N-2..1] (2N-2 frames, no held frames at the
 *     turns). ONLY for oscillating motion (bob, hover, sway, haze breathing) — never
 *     fire, smoke, steam, rain, flowing water or falling dust. Same outputs as `seam`.
 *
 *   check <video> [--plate=<still>] [--static=x0,y0,x1,y1 ...] [--light=x0,y0,x1,y1 ...]
 *     Prints JSON. Rects are fractions of the frame (0..1); repeat the flag for more.
 *       ssim.firstVsPlate / lastVsPlate  frame 0 / N-1 vs the plate, both at 960x540
 *       ssim.join                        frame N-1 -> frame 0 (the loop wrap). All SSIM is
 *                                        ffmpeg `ssim` "All" on yuv420p at 960x540 (the LOG /
 *                                        vcheck convention); joinRgb is the same on RGB planes
 *                                        (gbrp), which is what the map's 0.952 figure used
 *       ssim.consecutive                 min / p05 / median over every n -> n+1 step,
 *                                        and where the join ranks among them
 *       static[]                         max over frames of mean |Y_t - Y_0| (0-255 luma),
 *                                        and max consecutive mean |Y_t - Y_t-1|
 *       flash                            WCAG-style general flashes (opposing relative-
 *                                        luminance swings >= 0.10, darker < 0.80): max per
 *                                        any 1 s window, whole frame + worst 4x4 tile;
 *                                        max saturated-red pixel share
 *       luma                             whole-frame mean luma (0-255) min/max/range/%
 *       light[]                          zone mean luma: peak-to-trough %, reversals/s
 *                                        (5% hysteresis), dominant frequency (Hz)
 *       audioStreams, frames, fps, durationS, bytes, width, height, codec
 *       phaseShiftPx                     frame 0 vs plate (cv2.phaseCorrelate), if python3
 *       pass{}                           each rule of map §4 as a boolean
 *
 *   frames <video> <outdir> [--at=0,25,50,75,100] [--crop=x0,y0,x1,y1] [--scale=2]
 *          [--wrap=3]
 *     PNG frames at the given percentages (frame index round(p/100*(N-1))). --crop adds a
 *     crop of each frame enlarged by --scale (100-200% crops for the L2 sweep). --wrap=w
 *     adds wrap.png (frames N-w..N-1 | 0..w-1 side by side), wrap-crop.png (same with the
 *     crop) and wrap-diff.png (|last - first| x 8) to eyeball the join.
 *
 *   sequence <master.mp4> <outdir> [--frames=72] [--width=1280] [--quality=75]
 *     Evenly spaced WebP frame sequence 000.webp..071.webp (like films/voyage-seq/)
 *     for scroll-scrubbed push-ins.
 *
 * EXAMPLES
 *   node tools/media/loop.mjs seam media-src/p3/masters/L01.mp4 out/iconic-pearl-loop --k=12 --tier=S
 *   node tools/media/loop.mjs check out/iconic-pearl-loop.mp4 --plate=public/media/films/iconic-pearl.webp \
 *        --static=0,0,0.45,1
 *   node tools/media/loop.mjs frames out/iconic-pearl-loop.mp4 /tmp/l01 --crop=0.6,0.3,0.9,0.7 --wrap=3
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const FFMPEG = process.env.FFMPEG || (fs.existsSync("/usr/local/bin/ffmpeg") ? "/usr/local/bin/ffmpeg" : "ffmpeg");
const THREADS = String(process.env.FFMPEG_THREADS || 2);
const TIERS = { S: [1920, 1080], I: [1280, 720] };
const CHECK_W = 960;
const CHECK_H = 540;

// ---------------------------------------------------------------- utilities

function die(msg) {
  process.stderr.write(`loop.mjs: ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (const a of argv) {
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const k = eq < 0 ? a.slice(2) : a.slice(2, eq);
      const v = eq < 0 ? true : a.slice(eq + 1);
      if (k in opt) opt[k] = [].concat(opt[k], v);
      else opt[k] = v;
    } else pos.push(a);
  }
  return { pos, opt };
}

const asList = (v) => (v === undefined ? [] : [].concat(v));

function parseRect(s) {
  const r = String(s).split(",").map(Number);
  if (r.length !== 4 || r.some((x) => !Number.isFinite(x) || x < 0 || x > 1) || r[2] <= r[0] || r[3] <= r[1])
    die(`bad rect "${s}" (want x0,y0,x1,y1 as fractions 0..1)`);
  return r;
}

function ff(args, { quiet = true } = {}) {
  const full = ["-hide_banner", ...(quiet ? ["-v", "error"] : []), "-y", ...args];
  const r = spawnSync(FFMPEG, full, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) die(`ffmpeg failed (${r.status}):\n  ${FFMPEG} ${full.join(" ")}\n${(r.stderr || "").slice(-3000)}`);
  return r.stderr || "";
}

/** ffmpeg -i parse (there is no ffprobe) + exact frame count via framecrc packets. */
function probe(file) {
  if (!fs.existsSync(file)) die(`no such file: ${file}`);
  const r = spawnSync(FFMPEG, ["-hide_banner", "-i", file], { encoding: "utf8" });
  const err = r.stderr || "";
  const vs = err.split("\n").find((l) => /Stream #.*Video:/.test(l)) || "";
  const dims = vs.match(/, (\d{2,5})x(\d{2,5})/);
  const fpsM = vs.match(/([\d.]+) fps/) || vs.match(/([\d.]+) tbr/);
  const durM = err.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const codec = (vs.match(/Video: (\w+)/) || [])[1] || null;
  const audioStreams = (err.match(/Stream #[^\n]*Audio:/g) || []).length;
  const crc = spawnSync(FFMPEG, ["-hide_banner", "-v", "error", "-threads", THREADS, "-i", file, "-map", "0:v:0", "-c", "copy", "-f", "framecrc", "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const frames = (crc.stdout || "").split("\n").filter((l) => l && !l.startsWith("#")).length;
  const fps = fpsM ? Number(fpsM[1]) : 24;
  return {
    file,
    codec,
    width: dims ? Number(dims[1]) : null,
    height: dims ? Number(dims[2]) : null,
    fps,
    frames,
    durationS: +(frames / fps).toFixed(3),
    containerDurationS: durM ? +(Number(durM[1]) * 3600 + Number(durM[2]) * 60 + Number(durM[3])).toFixed(3) : null,
    audioStreams,
    bytes: fs.statSync(file).size,
  };
}

function tmpDir(tag) {
  return fs.mkdtempSync(path.join(process.env.LOOP_TMP || os.tmpdir(), `loop-${tag}-`));
}

/** SSIM "All" at 960x540. fmt yuv420p (the LOG/vcheck convention) or gbrp (RGB planes, harsher on chroma noise). */
function ssimPair(a, b, fmt = "yuv420p") {
  const err = spawnSync(
    FFMPEG,
    ["-hide_banner", "-threads", THREADS, "-i", a, "-i", b, "-lavfi", `[0:v]scale=${CHECK_W}:${CHECK_H},format=${fmt}[x];[1:v]scale=${CHECK_W}:${CHECK_H},format=${fmt}[y];[x][y]ssim`, "-f", "null", "-"],
    { encoding: "utf8" },
  ).stderr;
  const m = (err || "").match(/All:([\d.]+)/);
  if (!m) die(`ssim failed for ${a} vs ${b}\n${(err || "").slice(-1500)}`);
  return Number(m[1]);
}

/** Per-frame SSIM (All) of a video vs a still, 960x540. Returns array (one per frame). */
function ssimVsStill(video, still, dir, fps) {
  const stats = path.join(dir, "vs-still.log");
  ff([
    "-threads", THREADS, "-i", video, "-loop", "1", "-framerate", String(fps), "-i", still,
    "-lavfi", `[0:v]scale=${CHECK_W}:${CHECK_H},format=yuv420p[x];[1:v]scale=${CHECK_W}:${CHECK_H},format=yuv420p[y];[x][y]ssim=stats_file=${stats}:shortest=1`,
    "-f", "null", "-",
  ]);
  return readSsimStats(stats);
}

function readSsimStats(file) {
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.match(/All:([\d.]+)/))
    .filter(Boolean)
    .map((m) => Number(m[1]));
}

const q = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))];
};
const r4 = (x) => (x === null || x === undefined || Number.isNaN(x) ? null : +x.toFixed(4));
const r2 = (x) => (x === null || x === undefined || Number.isNaN(x) ? null : +x.toFixed(2));

function scaleFilter(src, W, H) {
  if (src.width === W && src.height === H) return "";
  // non-16:9 sources (Kling returns 1912x1080 for off-ratio start frames): fill + centre crop
  return `,scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}`;
}

function rotateGraph(inLabel, R, fps, outLabel) {
  if (!R) return `[${inLabel}]null[${outLabel}]`;
  return (
    `[${inLabel}]split=2[ra][rb];` +
    `[ra]select='gte(n\\,${R})',setpts=N/${fps}/TB[rx];` +
    `[rb]select='lt(n\\,${R})',setpts=N/${fps}/TB[ry];` +
    `[rx][ry]concat=n=2:v=1[${outLabel}]`
  );
}

function encodeArgs(kind, crf, fps) {
  const common = ["-an", "-sn", "-dn", "-map_metadata", "-1", "-r", String(fps), "-pix_fmt", "yuv420p", "-threads", THREADS];
  if (kind === "mp4")
    return [...common, "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", String(crf), "-g", "48", "-keyint_min", "48", "-sc_threshold", "0", "-movflags", "+faststart"];
  return [...common, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf), "-row-mt", "1", "-cpu-used", "2", "-deadline", "good", "-g", "48"];
}

async function writePoster(pngPath, outPath) {
  let quality = 80;
  let buf;
  for (;;) {
    buf = await sharp(pngPath).resize({ width: 1920 }).webp({ quality, effort: 6 }).toBuffer();
    if (buf.length <= 100 * 1024 || quality <= 50) break;
    quality -= 5;
  }
  fs.writeFileSync(outPath, buf);
  return { file: outPath, bytes: buf.length, quality };
}

/** Encode <out-base>.mp4/.webm/-poster.webp from a lossless intermediate. */
async function deliver(inter, outBase, { tier, crfMp4, crfWebm, fps, R = 0, src }) {
  const [W, H] = TIERS[tier];
  const graph = `${rotateGraph("0:v", R, fps, "rot")};[rot]format=yuv420p${scaleFilter(src, W, H)}[v]`;
  fs.mkdirSync(path.dirname(path.resolve(outBase)), { recursive: true });
  const mp4 = `${outBase}.mp4`;
  const webm = `${outBase}.webm`;
  ff(["-threads", THREADS, "-i", inter, "-filter_complex", graph, "-map", "[v]", ...encodeArgs("mp4", crfMp4, fps), mp4]);
  ff(["-threads", THREADS, "-i", inter, "-filter_complex", graph, "-map", "[v]", ...encodeArgs("webm", crfWebm, fps), webm]);
  const dir = path.dirname(inter);
  const png = path.join(dir, "poster.png");
  ff(["-threads", THREADS, "-i", inter, "-vf", `select='eq(n\\,${R})'`, "-frames:v", "1", "-fps_mode", "passthrough", png]);
  const poster = await writePoster(png, `${outBase}-poster.webp`);
  return { mp4: probe(mp4), webm: probe(webm), poster };
}

// ---------------------------------------------------------------- seam / boomerang

function tierOpts(opt) {
  const tier = String(opt.tier || "S").toUpperCase();
  if (!TIERS[tier]) die(`--tier must be S or I`);
  return {
    tier,
    crfMp4: Number(opt["crf-mp4"] ?? (tier === "S" ? 22 : 26)),
    crfWebm: Number(opt["crf-webm"] ?? 32),
  };
}

async function cmdSeam(pos, opt) {
  const [master, outBase] = pos;
  if (!master || !outBase) die("usage: seam <master.mp4> <out-base> --k=12|24 --tier=S|I");
  const src = probe(master);
  const N = src.frames;
  const K = Number(opt.k ?? 12);
  if (!(K >= 2 && 2 * K < N)) die(`--k=${K} needs 2 <= K and 2K < N (${N})`);
  const { tier, crfMp4, crfWebm } = tierOpts(opt);
  const fps = src.fps;
  const curve = opt.curve === "smooth" ? "smooth" : "linear";
  const t = `min(1\\,N/${K - 1})`;
  const w = curve === "smooth" ? `(${t})*(${t})*(3-2*(${t}))` : t;
  const graph =
    `[0:v]split=3[s1][s2][s3];` +
    `[s1]select='between(n\\,${K}\\,${N - K - 1})',setpts=N/${fps}/TB[body];` +
    `[s2]select='gte(n\\,${N - K})',setpts=N/${fps}/TB[tail];` +
    `[s3]select='lt(n\\,${K})',setpts=N/${fps}/TB[head];` +
    `[tail][head]blend=all_expr='A+(B-A)*${w}'[mix];` +
    `[body][mix]concat=n=2:v=1,format=yuv420p[v]`;
  const dir = tmpDir("seam");
  const inter = path.join(dir, "seam.mkv");
  ff(["-threads", THREADS, "-i", master, "-filter_complex", graph, "-map", "[v]", "-an", "-r", String(fps), "-c:v", "libx264", "-qp", "0", "-preset", "ultrafast", "-pix_fmt", "yuv420p", inter]);
  const interInfo = probe(inter);
  if (interInfo.frames !== N - K) die(`seam produced ${interInfo.frames} frames, expected ${N - K}`);

  let R = 0;
  let rotateInfo = null;
  if (opt.rotate === "auto") {
    if (!opt.plate) die("--rotate=auto needs --plate");
    const s = ssimVsStill(inter, opt.plate, dir, fps);
    R = s.indexOf(Math.max(...s));
    rotateInfo = { mode: "auto", frame: R, ssimAtFrame: r4(s[R]), ssimAtFrame0: r4(s[0]) };
  } else if (opt.rotate !== undefined && opt.rotate !== true) {
    R = Number(opt.rotate) % (N - K);
    rotateInfo = { mode: "fixed", frame: R };
  }
  const out = await deliver(inter, outBase, { tier, crfMp4, crfWebm, fps, R, src });
  const summary = {
    op: "seam",
    master: src,
    k: K,
    curve,
    tier,
    crfMp4,
    crfWebm,
    rotate: rotateInfo,
    outFrames: N - K,
    // map an output frame back to its source: body = src[K+j]; mix i = blend(src[N-K+i], src[i])
    firstOutputFrameIs: R === 0 ? `src[${K}]` : R < N - 2 * K ? `src[${K + R}]` : `blend(src[${N - K + (R - (N - 2 * K))}] -> src[${R - (N - 2 * K)}])`,
    ...out,
  };
  if (opt["keep-intermediate"]) summary.intermediate = inter;
  else fs.rmSync(dir, { recursive: true, force: true });
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

async function cmdBoomerang(pos, opt) {
  const [master, outBase] = pos;
  if (!master || !outBase) die("usage: boomerang <master.mp4> <out-base> --tier=S|I");
  const src = probe(master);
  const N = src.frames;
  const { tier, crfMp4, crfWebm } = tierOpts(opt);
  const fps = src.fps;
  const graph =
    `[0:v]split=2[f][r];` +
    `[f]setpts=PTS-STARTPTS[fw];` +
    `[r]reverse,trim=start_frame=1:end_frame=${N - 1},setpts=PTS-STARTPTS[rv];` +
    `[fw][rv]concat=n=2:v=1,format=yuv420p[v]`;
  const dir = tmpDir("boom");
  const inter = path.join(dir, "boom.mkv");
  ff(["-threads", THREADS, "-i", master, "-filter_complex", graph, "-map", "[v]", "-an", "-r", String(fps), "-c:v", "libx264", "-qp", "0", "-preset", "ultrafast", "-pix_fmt", "yuv420p", inter]);
  const interInfo = probe(inter);
  if (interInfo.frames !== 2 * N - 2) die(`boomerang produced ${interInfo.frames} frames, expected ${2 * N - 2}`);
  const out = await deliver(inter, outBase, { tier, crfMp4, crfWebm, fps, R: 0, src });
  const summary = { op: "boomerang", master: src, tier, crfMp4, crfWebm, outFrames: 2 * N - 2, ...out };
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

// ---------------------------------------------------------------- check

/** Hysteresis transitions of a series. countIf(prevExtreme, value) decides if it counts. */
function transitions(s, thr, countIf = () => true) {
  const out = [];
  let dir = 0;
  let lo = s[0];
  let hi = s[0];
  let ext = s[0];
  for (let t = 1; t < s.length; t++) {
    const v = s[t];
    if (dir === 0) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
      if (v - lo >= thr) {
        if (countIf(lo, v)) out.push(t);
        dir = 1;
        ext = v;
      } else if (hi - v >= thr) {
        if (countIf(hi, v)) out.push(t);
        dir = -1;
        ext = v;
      }
    } else if (dir === 1) {
      if (v > ext) ext = v;
      else if (ext - v >= thr) {
        if (countIf(ext, v)) out.push(t);
        dir = -1;
        ext = v;
      }
    } else {
      if (v < ext) ext = v;
      else if (v - ext >= thr) {
        if (countIf(ext, v)) out.push(t);
        dir = 1;
        ext = v;
      }
    }
  }
  return out;
}

/** Max flashes (pairs of opposing transitions) in any 1 s window. Series in rel. luminance 0..1. */
function flashesPerSecond(s, fps) {
  const tr = transitions(s, 0.1, (a, b) => Math.min(a, b) < 0.8);
  const win = Math.round(fps);
  let best = 0;
  for (let i = 0, j = 0; i < tr.length; i++) {
    while (tr[i] - tr[j] >= win) j++;
    best = Math.max(best, i - j + 1);
  }
  return { maxPerSecond: Math.floor(best / 2), transitions: tr.length };
}

function dominantHz(s, fps) {
  const n = s.length;
  const mean = s.reduce((a, b) => a + b, 0) / n;
  // remove the linear trend so slow drift doesn't win
  const xm = (n - 1) / 2;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xm) * (s[i] - mean);
    den += (i - xm) ** 2;
  }
  const slope = den ? num / den : 0;
  const d = s.map((v, i) => v - mean - slope * (i - xm));
  let bestK = 1;
  let bestP = -1;
  for (let k = 1; k <= Math.floor(n / 2); k++) {
    let re = 0, im = 0;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * k * i) / n;
      re += d[i] * Math.cos(a);
      im -= d[i] * Math.sin(a);
    }
    const p = re * re + im * im;
    if (p > bestP) {
      bestP = p;
      bestK = k;
    }
  }
  return (bestK * fps) / n;
}

/** Stream rgb24 frames at 960x540 and gather per-frame luma statistics. */
function analyse(video, fps, staticRects, lightRects) {
  const W = CHECK_W, H = CHECK_H, FS = W * H * 3;
  const lin = new Float64Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    lin[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }
  const px = (r) => [Math.round(r[0] * W), Math.round(r[1] * H), Math.max(Math.round(r[0] * W) + 1, Math.round(r[2] * W)), Math.max(Math.round(r[1] * H) + 1, Math.round(r[3] * H))];
  const sRects = staticRects.map(px);
  const lRects = lightRects.map(px);
  const TX = 4, TY = 4;
  const tileArea = (W / TX) * (H / TY);
  const Y0 = new Uint8Array(W * H);
  const Yp = new Uint8Array(W * H);
  const Y = new Uint8Array(W * H);
  const res = {
    frames: 0,
    lumaMean: [],
    relLum: [],
    tiles: Array.from({ length: TX * TY }, () => []),
    red: 0,
    staticVsFirst: sRects.map(() => 0),
    staticStep: sRects.map(() => 0),
    light: lRects.map(() => []),
  };
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ["-hide_banner", "-v", "error", "-threads", THREADS, "-i", video, "-vf", `scale=${W}:${H},format=rgb24`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
    let buf = Buffer.alloc(0);
    let errTxt = "";
    p.stderr.on("data", (d) => (errTxt += d));
    const onFrame = (f) => {
      let sumY = 0, sumL = 0, red = 0;
      const tl = new Float64Array(TX * TY);
      for (let y = 0; y < H; y++) {
        const ty = Math.min(TY - 1, Math.floor((y * TY) / H));
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          const R = f[i * 3], G = f[i * 3 + 1], B = f[i * 3 + 2];
          const yy = (54 * R + 183 * G + 19 * B) >> 8;
          Y[i] = yy;
          sumY += yy;
          const L = 0.2126 * lin[R] + 0.7152 * lin[G] + 0.0722 * lin[B];
          sumL += L;
          tl[ty * TX + Math.min(TX - 1, Math.floor((x * TX) / W))] += L;
          if (R >= 64 && R >= 0.8 * (R + G + B)) red++;
        }
      }
      const n = res.frames;
      res.lumaMean.push(sumY / (W * H));
      res.relLum.push(sumL / (W * H));
      for (let k = 0; k < TX * TY; k++) res.tiles[k].push(tl[k] / tileArea);
      res.red = Math.max(res.red, red / (W * H));
      if (n === 0) Y0.set(Y);
      sRects.forEach(([x0, y0, x1, y1], k) => {
        let a = 0, b = 0;
        for (let y = y0; y < y1; y++)
          for (let x = x0; x < x1; x++) {
            const i = y * W + x;
            a += Math.abs(Y[i] - Y0[i]);
            if (n) b += Math.abs(Y[i] - Yp[i]);
          }
        const area = (x1 - x0) * (y1 - y0);
        res.staticVsFirst[k] = Math.max(res.staticVsFirst[k], a / area);
        res.staticStep[k] = Math.max(res.staticStep[k], b / area);
      });
      lRects.forEach(([x0, y0, x1, y1], k) => {
        let a = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) a += Y[y * W + x];
        res.light[k].push(a / ((x1 - x0) * (y1 - y0)));
      });
      Yp.set(Y);
      res.frames++;
    };
    p.stdout.on("data", (d) => {
      buf = buf.length ? Buffer.concat([buf, d]) : d;
      while (buf.length >= FS) {
        onFrame(buf.subarray(0, FS));
        buf = buf.subarray(FS);
      }
    });
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg analyse failed: ${errTxt.slice(-1500)}`));
      const flashWhole = flashesPerSecond(res.relLum, fps);
      const tileFlash = res.tiles.map((s) => flashesPerSecond(s, fps).maxPerSecond);
      const lm = res.lumaMean;
      const lmMin = Math.min(...lm), lmMax = Math.max(...lm);
      const lmAvg = lm.reduce((a, b) => a + b, 0) / lm.length;
      resolve({
        frames: res.frames,
        static: staticRects.map((r, k) => ({ rect: r, maxMeanAbsDeltaVsFirst: r2(res.staticVsFirst[k]), maxMeanAbsDeltaStep: r2(res.staticStep[k]) })),
        flash: {
          wholeMaxPerSecond: flashWhole.maxPerSecond,
          wholeTransitions: flashWhole.transitions,
          tilesMaxPerSecond: Math.max(...tileFlash),
          worstTile: tileFlash.indexOf(Math.max(...tileFlash)),
          redShareMax: +res.red.toFixed(5),
        },
        luma: { min: r2(lmMin), max: r2(lmMax), range: r2(lmMax - lmMin), rangePct: r2(((lmMax - lmMin) / lmAvg) * 100) },
        light: lightRects.map((r, k) => {
          const s = res.light[k];
          const mu = s.reduce((a, b) => a + b, 0) / s.length;
          const rev = transitions(s, 0.05 * mu).length;
          return {
            rect: r,
            meanLuma: r2(mu),
            ptpPct: r2(((Math.max(...s) - Math.min(...s)) / mu) * 100),
            reversalsPerS: r2(Math.max(0, rev - 1) / (s.length / fps)),
            dominantHz: r2(dominantHz(s, fps)),
          };
        }),
      });
    });
  });
}

function phaseShift(firstY4m, plate, dir) {
  const a = path.join(dir, "ph-a.png");
  const b = path.join(dir, "ph-b.png");
  ff(["-i", firstY4m, "-vf", `scale=${CHECK_W}:${CHECK_H},format=gray`, a]);
  ff(["-i", plate, "-vf", `scale=${CHECK_W}:${CHECK_H},format=gray`, "-frames:v", "1", b]);
  const code = "import sys,cv2,numpy as np\na=cv2.imread(sys.argv[1],0).astype(np.float32);b=cv2.imread(sys.argv[2],0).astype(np.float32)\n(dx,dy),r=cv2.phaseCorrelate(a,b)\nprint(f'{dx*2:.3f} {dy*2:.3f}')";
  const r = spawnSync("python3", ["-c", code, a, b], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const [dx, dy] = r.stdout.trim().split(/\s+/).map(Number);
  return { dx, dy, note: "px at 1920 wide (measured at 960x540 x2)" };
}

async function cmdCheck(pos, opt, { print = true } = {}) {
  const [video] = pos;
  if (!video) die("usage: check <video> [--plate=<still>] [--static=x0,y0,x1,y1 ...] [--light=...]");
  const info = probe(video);
  const N = info.frames;
  const dir = tmpDir("check");
  const first = path.join(dir, "first.y4m");
  const last = path.join(dir, "last.y4m");
  ff([
    "-threads", THREADS, "-i", video,
    "-filter_complex", `[0:v]split=2[a][b];[a]select='eq(n\\,0)'[f];[b]select='eq(n\\,${N - 1})'[l]`,
    "-map", "[f]", "-frames:v", "1", "-fps_mode", "passthrough", first,
    "-map", "[l]", "-frames:v", "1", "-fps_mode", "passthrough", last,
  ]);
  const stats = path.join(dir, "consec.log");
  ff([
    "-threads", THREADS, "-i", video,
    "-lavfi", `[0:v]scale=${CHECK_W}:${CHECK_H},format=yuv420p,split=2[a][b];[b]trim=start_frame=1,setpts=PTS-STARTPTS[b1];[a][b1]ssim=stats_file=${stats}:shortest=1`,
    "-f", "null", "-",
  ]);
  const consec = readSsimStats(stats).slice(0, N - 1);
  const join = ssimPair(last, first);
  const joinRgb = ssimPair(last, first, "gbrp");
  const plate = opt.plate && opt.plate !== true ? opt.plate : null;
  const firstVsPlate = plate ? ssimPair(first, plate) : null;
  const lastVsPlate = plate ? ssimPair(last, plate) : null;
  const phase = plate ? phaseShift(first, plate, dir) : null;
  const staticRects = asList(opt.static).map(parseRect);
  const lightRects = asList(opt.light).map(parseRect);
  const an = await analyse(video, info.fps, staticRects, lightRects);
  const cMin = Math.min(...consec);
  const cP05 = q(consec, 0.05);
  const cMed = q(consec, 0.5);
  const joinRank = consec.filter((v) => v <= join).length / consec.length;
  const glowMax = Number(opt["glow-max"] ?? 15);
  const revMax = Number(opt["rev-max"] ?? 2);
  const result = {
    file: video,
    ...info,
    decodedFrames: an.frames,
    plate,
    ssim: {
      firstVsPlate: r4(firstVsPlate),
      lastVsPlate: r4(lastVsPlate),
      join: r4(join),
      joinRgb: r4(joinRgb),
      consecutive: { min: r4(cMin), minAt: consec.indexOf(cMin), p05: r4(cP05), median: r4(cMed) },
      joinMinusMedian: r4(join - cMed),
      joinPercentile: r4(joinRank),
    },
    phaseShiftPx: phase,
    static: an.static,
    flash: an.flash,
    luma: an.luma,
    light: an.light,
  };
  result.pass = {
    registration: plate ? firstVsPlate >= 0.95 && lastVsPlate >= 0.95 : null,
    // the wrap must read as an ordinary step: >= 0.97 and no worse than the worst natural step
    join: join >= 0.97 && join >= cMin - 0.001,
    smooth: cMin >= 0.9,
    static: an.static.every((s) => s.maxMeanAbsDeltaVsFirst <= 1),
    flash: an.flash.wholeMaxPerSecond <= 3 && an.flash.tilesMaxPerSecond <= 3,
    light: lightRects.length ? an.light.every((l) => l.ptpPct <= glowMax && l.reversalsPerS <= revMax) : null,
    silent: info.audioStreams === 0,
  };
  fs.rmSync(dir, { recursive: true, force: true });
  if (print) console.log(JSON.stringify(result, null, 2));
  return result;
}

// ---------------------------------------------------------------- frames / sequence

async function extractFrames(video, indices, dir, width) {
  const expr = indices.map((i) => `eq(n\\,${i})`).join("+");
  const vf = `select='${expr}'${width ? `,scale=${width}:-2:flags=lanczos` : ""}`;
  const pat = path.join(dir, "x-%04d.png");
  ff(["-threads", THREADS, "-i", video, "-vf", vf, "-fps_mode", "passthrough", pat]);
  const uniq = [...new Set(indices)].sort((a, b) => a - b);
  return uniq.map((idx, k) => ({ idx, file: path.join(dir, `x-${String(k + 1).padStart(4, "0")}.png`) }));
}

async function cropOf(file, rect, scale) {
  const m = await sharp(file).metadata();
  const left = Math.round(rect[0] * m.width);
  const top = Math.round(rect[1] * m.height);
  const width = Math.max(1, Math.round((rect[2] - rect[0]) * m.width));
  const height = Math.max(1, Math.round((rect[3] - rect[1]) * m.height));
  return sharp(file).extract({ left, top, width, height }).resize({ width: Math.round(width * scale), kernel: "lanczos3" }).png().toBuffer();
}

async function strip(buffers, tileW) {
  const metas = await Promise.all(buffers.map((b) => sharp(b).resize({ width: tileW }).png().toBuffer()));
  const hs = await Promise.all(metas.map(async (b) => (await sharp(b).metadata()).height));
  const H = Math.max(...hs);
  return sharp({ create: { width: tileW * metas.length + 4 * (metas.length - 1), height: H, channels: 3, background: "#ff00ff" } })
    .composite(metas.map((b, i) => ({ input: b, left: i * (tileW + 4), top: 0 })))
    .png()
    .toBuffer();
}

async function cmdFrames(pos, opt) {
  const [video, outdir] = pos;
  if (!video || !outdir) die("usage: frames <video> <outdir> [--at=0,25,50,75,100] [--crop=x0,y0,x1,y1] [--scale=2] [--wrap=3]");
  const info = probe(video);
  const N = info.frames;
  fs.mkdirSync(outdir, { recursive: true });
  const at = String(opt.at ?? "0,25,50,75,100").split(",").map(Number);
  const crop = opt.crop ? parseRect(opt.crop) : null;
  const scale = Number(opt.scale ?? 2);
  const wrap = opt.wrap ? Number(opt.wrap === true ? 3 : opt.wrap) : 0;
  const base = path.basename(video).replace(/\.[^.]+$/, "");
  const pctIdx = at.map((p) => ({ p, idx: Math.round((p / 100) * (N - 1)) }));
  const wrapIdx = wrap ? [...Array.from({ length: wrap }, (_, i) => N - wrap + i), ...Array.from({ length: wrap }, (_, i) => i)] : [];
  const tmp = tmpDir("frames");
  const got = await extractFrames(video, [...pctIdx.map((x) => x.idx), ...wrapIdx], tmp);
  const byIdx = new Map(got.map((g) => [g.idx, g.file]));
  const written = [];
  for (const { p, idx } of pctIdx) {
    const out = path.join(outdir, `${base}-p${String(p).padStart(3, "0")}-f${String(idx).padStart(4, "0")}.png`);
    fs.copyFileSync(byIdx.get(idx), out);
    written.push(out);
    if (crop) {
      const c = path.join(outdir, `${base}-p${String(p).padStart(3, "0")}-crop.png`);
      fs.writeFileSync(c, await cropOf(byIdx.get(idx), crop, scale));
      written.push(c);
    }
  }
  if (wrap) {
    const files = wrapIdx.map((i) => byIdx.get(i));
    const w = path.join(outdir, `${base}-wrap.png`);
    fs.writeFileSync(w, await strip(await Promise.all(files.map((f) => fs.promises.readFile(f))), 640));
    written.push(w);
    if (crop) {
      const wc = path.join(outdir, `${base}-wrap-crop.png`);
      const crops = await Promise.all(files.map((f) => cropOf(f, crop, 1)));
      fs.writeFileSync(wc, await strip(crops, 480));
      written.push(wc);
    }
    const lastF = byIdx.get(N - 1);
    const firstF = byIdx.get(0);
    const a = await sharp(lastF).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(firstF).removeAlpha().raw().toBuffer();
    const d = Buffer.alloc(a.data.length);
    for (let i = 0; i < d.length; i++) d[i] = Math.min(255, Math.abs(a.data[i] - b[i]) * 8);
    const wd = path.join(outdir, `${base}-wrap-diff.png`);
    await sharp(d, { raw: { width: a.info.width, height: a.info.height, channels: a.info.channels } }).png().toFile(wd);
    written.push(wd);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(JSON.stringify({ video, frames: N, written }, null, 2));
}

async function cmdSequence(pos, opt) {
  const [master, outdir] = pos;
  if (!master || !outdir) die("usage: sequence <master.mp4> <outdir> [--frames=72] [--width=1280] [--quality=75]");
  const info = probe(master);
  const N = info.frames;
  const M = Number(opt.frames ?? 72);
  const width = Number(opt.width ?? 1280);
  const quality = Number(opt.quality ?? 75);
  if (M < 2 || M > N) die(`--frames must be 2..${N}`);
  const idx = Array.from({ length: M }, (_, i) => Math.round((i * (N - 1)) / (M - 1)));
  fs.mkdirSync(outdir, { recursive: true });
  const tmp = tmpDir("seq");
  const got = await extractFrames(master, idx, tmp, width);
  let bytes = 0;
  for (let i = 0; i < M; i++) {
    const f = got.find((g) => g.idx === idx[i]).file;
    const out = path.join(outdir, `${String(i).padStart(3, "0")}.webp`);
    const b = await sharp(f).webp({ quality, effort: 6 }).toBuffer();
    fs.writeFileSync(out, b);
    bytes += b.length;
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(JSON.stringify({ master, sourceFrames: N, frames: M, width, quality, sourceIndices: idx, bytes, outdir }, null, 2));
}

// ---------------------------------------------------------------- main

const [cmd, ...rest] = process.argv.slice(2);
const { pos, opt } = parseArgs(rest);
const cmds = { seam: cmdSeam, boomerang: cmdBoomerang, check: cmdCheck, frames: cmdFrames, sequence: cmdSequence };
if (!cmds[cmd]) {
  process.stderr.write("usage: node tools/media/loop.mjs <seam|boomerang|check|frames|sequence> ... (see the header)\n");
  process.exit(cmd ? 1 : 0);
}
cmds[cmd](pos, opt).catch((e) => die(e.stack || String(e)));
