// scripts/optimize-media.mjs
// Media optimizer for personal-website (Spec §7b).
// Masters live (gitignored) in ./media-src ; shipped deliverables go to
// ./public/media. Stills are re-written IN PLACE at the same filename so the
// existing /media/*.png references keep working; next/image + next.config
// `formats` handle AVIF/WebP delivery to browsers. AVIF/WebP siblings and video
// posters are emitted for direct/poster use. Videos are re-encoded H.264 High
// + VP9 webm + poster. Text-free abstract art only — matches the honesty rule.
//
// Prereqs: `npm i -D sharp` and ffmpeg/ffprobe on PATH.
// Run: `npm run optimize:media`

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "media-src");
const OUT_DIR = path.join(ROOT, "public", "media");

// hero-still is the LCP poster → allow 1920px; every other still caps at 1600px.
export const STILLS = [
  { in: "hero-still.png", maxW: 1920 },
  { in: "still-blueprint.png", maxW: 1600 },
  { in: "still-calm.png", maxW: 1600 },
  { in: "still-network.png", maxW: 1600 },
  { in: "still-rays-img.png", maxW: 1600 },
  { in: "still-terminal.png", maxW: 1600 },
];

export const VIDEOS = [
  "band-flow.mp4",
  "hero-loop.mp4",
  "v-contour.mp4",
  "v-finale.mp4",
  "v-network.mp4",
  "v-particles.mp4",
  "v-terminal.mp4",
  "v-waveform.mp4",
];

/** Pure: swap a filename's extension. `swapExt("x.png","avif") === "x.avif"`. */
export function swapExt(name, ext) {
  return name.replace(/\.[^./\\]+$/, `.${ext}`);
}

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

function assertTool(cmd) {
  try {
    execFileSync(cmd, ["-version"], { stdio: "ignore" });
  } catch {
    throw new Error(
      `Required tool "${cmd}" not found on PATH. Install ffmpeg (bundles ffprobe) and retry.`,
    );
  }
}

async function optimizeStill({ in: name, maxW }) {
  const input = path.join(SRC_DIR, name);
  if (!existsSync(input)) {
    console.warn(`  skip still (no master): media-src/${name}`);
    return;
  }
  const base = swapExt(name, ""); // e.g. "hero-still."
  const stem = base.slice(0, -1); // "hero-still"
  const resize = { width: maxW, withoutEnlargement: true, fit: "inside" };

  // 1) The next/image SOURCE — downsized optimized PNG at the SAME filename.
  await sharp(input)
    .resize(resize)
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 8 })
    .toFile(path.join(OUT_DIR, `${stem}.png`));

  // 2) Direct-use / poster / OG siblings.
  await sharp(input)
    .resize(resize)
    .avif({ quality: 50, effort: 5 })
    .toFile(path.join(OUT_DIR, `${stem}.avif`));
  await sharp(input)
    .resize(resize)
    .webp({ quality: 72, effort: 5 })
    .toFile(path.join(OUT_DIR, `${stem}.webp`));

  console.log(`  still  ✓ ${stem} (≤${maxW}px png+avif+webp)`);
}

function optimizeVideo(name) {
  const input = path.join(SRC_DIR, name);
  if (!existsSync(input)) {
    console.warn(`  skip video (no master): media-src/${name}`);
    return;
  }
  const stem = swapExt(name, "").slice(0, -1);
  const mp4Out = path.join(OUT_DIR, `${stem}.mp4`);
  const webmOut = path.join(OUT_DIR, `${stem}.webm`);
  const posterPng = path.join(OUT_DIR, `${stem}-poster.png`);
  const posterTmp = path.join(OUT_DIR, `${stem}-poster.tmp.png`);
  const vf =
    "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24";

  // H.264 High, ~1.5 Mbps, faststart (moov to front), muted, ≤10s.
  run("ffmpeg", [
    "-y", "-i", input,
    "-vf", vf, "-t", "10",
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
    "-b:v", "1500k", "-maxrate", "1800k", "-bufsize", "3000k",
    "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart",
    mp4Out,
  ]);

  // Parallel VP9 webm, ~1.2 Mbps.
  run("ffmpeg", [
    "-y", "-i", input,
    "-vf", vf, "-t", "10",
    "-c:v", "libvpx-vp9", "-b:v", "1200k", "-maxrate", "1600k",
    "-bufsize", "2400k", "-row-mt", "1", "-an",
    webmOut,
  ]);

  // Poster: grab a representative frame (~1s in) then produce avif/webp/png.
  run("ffmpeg", ["-y", "-ss", "1", "-i", input, "-frames:v", "1", "-q:v", "3", posterTmp]);
  return sharp(posterTmp)
    .resize({ width: 1280, withoutEnlargement: true, fit: "inside" })
    .png({ compressionLevel: 9, quality: 88 })
    .toFile(posterPng)
    .then(() =>
      sharp(posterTmp).avif({ quality: 50 }).toFile(path.join(OUT_DIR, `${stem}-poster.avif`)),
    )
    .then(() =>
      sharp(posterTmp).webp({ quality: 72 }).toFile(path.join(OUT_DIR, `${stem}-poster.webp`)),
    )
    .then(() => {
      rmSync(posterTmp, { force: true });
      console.log(`  video  ✓ ${stem} (mp4+webm+poster)`);
    });
}

async function main() {
  assertTool("ffmpeg");
  assertTool("ffprobe");
  if (!existsSync(SRC_DIR)) {
    throw new Error(
      `No media-src/ directory. Move the 3–4k PNG/MP4 masters into ./media-src (gitignored) first.`,
    );
  }
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Optimizing stills → ${path.relative(ROOT, OUT_DIR)}`);
  for (const s of STILLS) await optimizeStill(s);
  console.log(`Optimizing videos → ${path.relative(ROOT, OUT_DIR)}`);
  for (const v of VIDEOS) await optimizeVideo(v);
  console.log(
    `\nDone. Present masters in media-src/: ${readdirSync(SRC_DIR).length} file(s). ` +
      `Review public/media weight before committing (target ≈10–14MB).`,
  );
}

// Guard: only run when executed directly, so tests can import the pure helpers.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}
