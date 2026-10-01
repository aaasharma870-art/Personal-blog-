// scripts/checks/sound.mjs: spec §3.4 check 9 (sound provenance) + P3-9 #4.
// Owner: W2-SOUND (PHASE3-PLAN §4.7).
// Loaded by scripts/check-manifest.mjs, which calls `run(ctx)` (sync or async)
// with ctx = { ROOT, RELEASE, err, warn, gate, page, film, mediaAssets, quotes,
// OUT_LINES, content, VARIANT_REGISTRY, derive: { actCardsOf, actRunsOf,
// actsInUse, pageItemsOf, worldOfIn }, css, readFile(rel), uiFiles }.
//
// Rules (DP-7: public/audio/** is exempt from the media-row rule; this covers it):
//   errors
//   - docs/build/SOUNDS.md exists;
//   - every file under public/audio/** has a SOUNDS.md table row naming its
//     exact path ("/audio/<name>"), with non-empty source and licence cells;
//   - every CueId (lib/audio/cues.ts CUE_IDS) has a procedural recipe (a key of
//     RECIPES in lib/audio/recipes.ts) or is a file cue (FILE_CUES) whose
//     .webm and .mp3 both have SOUNDS.md rows;
//   - all files of one format together ≤ 150 KB (a browser loads one format);
//   - no component plays sound through <audio loop> (AudioBufferSourceNode only).
//   release gates (ctx.gate: a warning now, an error under RELEASE=1)
//   - a file in public/audio whose SOUNDS.md row still says "to approve" or
//     "to confirm" (a quotation or licence awaiting Aryan: what goes public is
//     his call, CONTENT-RULES); the same kind as the Check-L2 countersignatures.
//   warnings
//   - a file cue with no file in public/audio yet (the engine plays nothing);
//   - a SOUNDS.md row whose file is not in public/audio, or whose bytes cell
//     differs from the file's size;
//   - a TTS line over 10 KB, any other file over 15 KB (spec §10.4; the WebM,
//     the MP3 fallback counts only in its format's total).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TOTAL_MAX = 150_000;
const TTS_MAX = 10_000;
const SFX_MAX = 15_000;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else if (!d.name.startsWith(".")) out.push(p);
  }
  return out;
}

/** Table rows of SOUNDS.md as cell arrays (header and separator rows dropped). */
function tableRows(md) {
  return md
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|") && !/^\|[\s:|-]+\|$/.test(l))
    .map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));
}

export default async function run(ctx) {
  const { ROOT, err, warn } = ctx;
  const gate = ctx.gate ?? ((m) => (ctx.RELEASE ? err(m) : warn(`[release gate] ${m}`)));
  const tag = "#9 sound";
  const soundsPath = path.join(ROOT, "docs", "build", "SOUNDS.md");
  if (!fs.existsSync(soundsPath)) {
    err(`${tag}: docs/build/SOUNDS.md is missing (every public/audio file needs a provenance row)`);
    return;
  }
  const md = fs.readFileSync(soundsPath, "utf8");
  const rows = tableRows(md);
  const header = rows.find((r) => r.some((c) => /^file$/i.test(c)) && r.some((c) => /^bytes$/i.test(c)));
  const col = (name) => (header ? header.findIndex((c) => new RegExp(`^${name}`, "i").test(c)) : -1);
  const iFile = col("file");
  const iSource = col("source");
  const iLicence = col("licen");
  const iBytes = col("bytes");
  const iId = col("id");
  if (!header || iFile < 0 || iSource < 0 || iLicence < 0 || iBytes < 0) {
    err(`${tag}: SOUNDS.md needs a files table with the columns file, source, licence and bytes`);
    return;
  }
  /** "/audio/x.webm" → its row. */
  const byFile = new Map();
  for (const r of rows) {
    if (r === header) continue;
    const m = /\/audio\/[\w./-]+/.exec(r[iFile] ?? "");
    if (m) byFile.set(m[0], r);
  }

  /* — every file under public/audio has a row ——————————————————————— */
  const audioDir = path.join(ROOT, "public", "audio");
  const files = walk(audioDir).map((abs) => ({ abs, rel: "/audio/" + path.relative(audioDir, abs).split(path.sep).join("/"), bytes: fs.statSync(abs).size }));
  const present = new Set(files.map((f) => f.rel));
  const totals = {};
  /** line id → the public files and the flags ("to approve", "to confirm"). */
  const awaiting = new Map();
  for (const f of files) {
    const r = byFile.get(f.rel);
    if (!r) {
      err(`${tag}: public${f.rel} has no row in docs/build/SOUNDS.md (id, file, source, licence, edits, bytes)`);
      continue;
    }
    if (!r[iSource] || !r[iLicence] || /^[—–-]$/.test(r[iSource]) || /^[—–-]$/.test(r[iLicence])) err(`${tag}: the SOUNDS.md row for ${f.rel} needs its source and licence`);
    // "as above" rows (the MP3 fallback) inherit their line's flags: every
    // row with the same id cell counts.
    const id = iId >= 0 ? r[iId] : "";
    const family = id ? rows.filter((x) => x !== header && x[iId] === id) : [r];
    const pending = family.map((x) => x.join(" | ")).join(" | ").match(/to approve|to confirm/gi);
    if (pending) {
      const key = id.replace(/`/g, "") || f.rel;
      const a = awaiting.get(key) ?? { files: [], flags: new Set() };
      a.files.push(f.rel);
      pending.forEach((x) => a.flags.add(x.toLowerCase()));
      awaiting.set(key, a);
    }
    const listed = Number(String(r[iBytes]).replace(/[^\d]/g, ""));
    if (listed !== f.bytes) warn(`${tag}: SOUNDS.md lists ${f.rel} as ${r[iBytes]} bytes; the file is ${f.bytes}`);
    const ext = path.extname(f.rel).slice(1).toLowerCase();
    totals[ext] = (totals[ext] ?? 0) + f.bytes;
    // Per-file sizes apply to the primary format (Opus WebM); the MP3
    // fallback is about twice the size by design and only counts in the total.
    const isTts = /\/tts-[^/]+$/.test(f.rel);
    if (ext !== "webm") continue;
    if (isTts && f.bytes > TTS_MAX) warn(`${tag}: ${f.rel} is ${f.bytes} B (spec §10.4: a TTS line ≤ 10 KB)`);
    if (!isTts && f.bytes > SFX_MAX) warn(`${tag}: ${f.rel} is ${f.bytes} B (spec §10.4: an effect file ≤ 15 KB)`);
  }
  for (const [key, a] of awaiting) gate(`${tag}: ${key} (${a.files.join(", ")}) awaits Aryan: its SOUNDS.md rows say "${[...a.flags].join('", "')}"`);
  for (const [ext, sum] of Object.entries(totals)) {
    if (sum > TOTAL_MAX) err(`${tag}: the .${ext} sound files total ${sum} B (spec §10.4: ≤ 150 KB, fetched after the first unmute)`);
  }
  const cueFiles = new Set();

  /* — every CueId has a recipe or a file ———————————————————————————— */
  const cues = await import(pathToFileURL(path.join(ROOT, "lib", "audio", "cues.ts")).href);
  const recipesSrc = fs.readFileSync(path.join(ROOT, "lib", "audio", "recipes.ts"), "utf8");
  const body = recipesSrc.slice(recipesSrc.indexOf("export const RECIPES"));
  const fileCues = new Set(cues.FILE_CUES);
  const seen = new Set();
  const notCopied = [];
  for (const id of cues.CUE_IDS) {
    if (seen.has(id)) err(`${tag}: CueId "${id}" is listed twice in lib/audio/cues.ts`);
    seen.add(id);
    if (fileCues.has(id)) {
      for (const ext of cues.AUDIO_EXTS) {
        const rel = `/audio/${id}.${ext}`;
        cueFiles.add(rel);
        if (!byFile.has(rel)) err(`${tag}: file cue "${id}" has no SOUNDS.md row for ${rel}`);
        else if (!present.has(rel)) notCopied.push(rel);
      }
      continue;
    }
    const key = new RegExp(`^\\s*(?:"${id.replace(/[-]/g, "\\-")}"|${/^[a-z]\w*$/i.test(id) ? id : "(?!)"})\\s*:`, "m");
    if (!key.test(body)) err(`${tag}: CueId "${id}" has neither a recipe in lib/audio/recipes.ts nor a file`);
  }

  if (notCopied.length) warn(`${tag}: ${notCopied.length} file-cue file(s) listed in SOUNDS.md are not in public/audio yet (the engine plays nothing for them; the assembler copies them from docs/build/media-staged/p3/accepted/audio/): ${notCopied.join(", ")}`);
  for (const rel of byFile.keys()) {
    if (!present.has(rel) && !cueFiles.has(rel)) warn(`${tag}: SOUNDS.md lists ${rel}, which is not in public/audio`);
  }

  /* — no <audio loop> anywhere in the UI ——————————————————————————— */
  for (const f of ctx.uiFiles ?? []) {
    const src = fs.readFileSync(f, "utf8");
    if (/<audio\b[^>]*\bloop\b/.test(src)) err(`${tag}: ${path.relative(ROOT, f)} plays sound through <audio loop> (spec §3.5: AudioBufferSourceNode only)`);
  }
}
