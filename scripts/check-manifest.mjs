// Validates the page manifest (lib/page.ts) and media manifest (lib/media.ts).
// Runs in `npm run check` after `tsc --noEmit`. Node >= 22.18 / 24 strips the
// TypeScript types natively, so this imports the .ts sources directly — both
// files are pure data by contract (type-only imports, no React).
//
// Errors fail the run (exit 1); warnings are printed only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHORLESS_TYPES, page } from "../lib/page.ts";
import { mediaAssets } from "../lib/media.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Anchors the brief requires while their section is enabled (relaxable). */
const REQUIRED_ANCHORS = ["top", "about", "journey", "work", "systems", "principles", "writing", "beyond", "contact"];
const NAV_LABEL_WARN = 12;
/** SYNTHESIS §8: at most 3 `motion: "signature"` sections page-wide. */
const MAX_SIGNATURE = 3;
const TONES = ["canvas", "raised", "deep", "paper"];
const WORLDS = ["neutral", "hp", "potc", "idiots"];
const USABLE = new Set(["accepted", "integrated"]);
/** Prop keys that hold MediaIds (string or string[]) anywhere in `props`. */
const MEDIA_KEY = /^(media|mediaMobile|image|video|poster|cover|evidence|still|stills|from|to)$|Media$/;
/** Prop keys whose slot renders one specific kind (declared kind must match). */
const KEY_KIND = { image: "image", still: "image", stills: "image", cover: "image", poster: "image", video: "video" };
/** What a fallback may be for each kind. An image slot can't play a video;
 *  a video (or sequence) may degrade to a still, and its consumer must check
 *  the RESOLVED kind before rendering a <video> (see MediaBandSection). */
const FALLBACK_OK = { image: ["image"], video: ["video", "image"], sequence: ["sequence", "image"] };

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* — Media manifest self-consistency ——————————————————————————————— */
const mediaIds = new Set(Object.keys(mediaAssets));

function resolves(id) {
  const seen = new Set();
  let cur = id;
  while (cur && !seen.has(cur) && mediaIds.has(cur)) {
    seen.add(cur);
    const a = mediaAssets[cur];
    if (USABLE.has(a.status)) return true;
    cur = a.fallback;
  }
  return false;
}

for (const [id, a] of Object.entries(mediaAssets)) {
  for (const k of ["poster", "fallback"]) {
    if (a[k] !== undefined && !mediaIds.has(a[k])) err(`media "${id}": ${k} "${a[k]}" is not a MediaId`);
  }
  if (a.poster && mediaIds.has(a.poster) && mediaAssets[a.poster].kind !== "image") {
    err(`media "${id}": poster "${a.poster}" is a ${mediaAssets[a.poster].kind}, not an image`);
  }
  if (a.fallback && mediaIds.has(a.fallback)) {
    const fk = mediaAssets[a.fallback].kind;
    if (!(FALLBACK_OK[a.kind] ?? [a.kind]).includes(fk)) {
      err(`media "${id}": ${a.kind} cannot fall back to "${a.fallback}" (${fk})`);
    }
  }
  if (a.fallback) {
    const chain = [id];
    let cur = a.fallback;
    while (cur && mediaIds.has(cur)) {
      if (chain.includes(cur)) {
        err(`media "${id}": fallback cycle ${[...chain, cur].join(" -> ")}`);
        break;
      }
      chain.push(cur);
      cur = mediaAssets[cur].fallback;
    }
  }
  if (!(Number.isInteger(a.width) && a.width > 0 && Number.isInteger(a.height) && a.height > 0)) {
    err(`media "${id}": width/height must be positive integers`);
  }
  if (a.status !== "planned") {
    for (const k of ["src", "srcMobile"]) {
      if (a[k] && !fs.existsSync(path.join(ROOT, "public", a[k]))) err(`media "${id}": ${k} ${a[k]} not found under public/`);
    }
  }
  if (a.status === "planned" && !a.fallback) warn(`media "${id}": planned with no fallback (resolveMedia returns null)`);
}

/* — Page manifest ————————————————————————————————————————————————— */
const ids = new Map();
page.forEach((s, i) => {
  if (ids.has(s.id)) err(`duplicate id "${s.id}" (entries ${ids.get(s.id)} and ${i})`);
  else ids.set(s.id, i);
  if (!/^[a-z][a-z0-9-]*$/.test(s.id)) err(`id "${s.id}" must be a lowercase slug (it is the #anchor)`);
  if (s.tone !== undefined && !TONES.includes(s.tone)) err(`"${s.id}": unknown tone "${s.tone}"`);
  if (s.world !== undefined && !WORLDS.includes(s.world)) err(`"${s.id}": unknown world "${s.world}"`);
  if (ANCHORLESS_TYPES.includes(s.type) && s.anchor !== false) {
    err(`"${s.id}": type "${s.type}" renders no #id — set anchor: false (else it leaks a dead #${s.id} into the sitemap/observer)`);
  }
  if (s.nav) {
    if (s.anchor === false || ANCHORLESS_TYPES.includes(s.type)) err(`"${s.id}": has nav but no anchor (nothing to jump to)`);
    if (!s.nav.label?.trim()) err(`"${s.id}": nav.label is empty`);
    else if (s.nav.label.length > NAV_LABEL_WARN) warn(`"${s.id}": nav label "${s.nav.label}" is ${s.nav.label.length} chars (> ${NAV_LABEL_WARN})`);
  }
});

const heroes = page.filter((s) => s.type === "hero");
if (heroes.length !== 1) err(`expected exactly one hero, found ${heroes.length}`);
if (page[0]?.type !== "hero") err(`the first entry must be the hero (found "${page[0]?.type}")`);
if (heroes[0] && heroes[0].enabled === false) err(`the hero cannot be disabled`);

const signature = page.filter((s) => s.enabled !== false && s.motion === "signature").map((s) => s.id);
if (signature.length > MAX_SIGNATURE) {
  err(`${signature.length} enabled "signature" sections (max ${MAX_SIGNATURE}): ${signature.join(", ")}`);
}

for (const id of REQUIRED_ANCHORS) {
  const s = page.find((e) => e.id === id);
  if (!s) err(`required anchor #${id} is missing from the manifest`);
  else if (s.enabled === false) warn(`required anchor #${id} is disabled (hidden everywhere)`);
  else if (s.anchor === false) err(`required anchor #${id} has anchor:false`);
}

function collectMedia(value, key, out) {
  if (Array.isArray(value)) value.forEach((v) => collectMedia(v, key, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectMedia(v, k, out);
  } else if (typeof value === "string" && key && MEDIA_KEY.test(key)) out.push({ key, id: value });
}

let mediaRefs = 0;
for (const s of page) {
  const refs = [];
  collectMedia(s.props, null, refs);
  for (const { key, id } of refs) {
    mediaRefs++;
    if (!mediaIds.has(id)) err(`"${s.id}": props.${key} references unknown media "${id}"`);
    else {
      const want = KEY_KIND[key];
      if (want && mediaAssets[id].kind !== want) err(`"${s.id}": props.${key} expects kind "${want}", but "${id}" is "${mediaAssets[id].kind}"`);
      if (s.enabled !== false && !resolves(id)) err(`"${s.id}": media "${id}" has no usable asset in its fallback chain`);
    }
  }
}

/* — Report ————————————————————————————————————————————————————————— */
const enabled = page.filter((s) => s.enabled !== false);
const numbered = enabled.filter((s) => s.numbered).map((s) => s.id);
console.log(
  `check-manifest: ${page.length} entries (${enabled.length} enabled, ${numbered.length} numbered: ${numbered.join(" ")}); ` +
    `${mediaIds.size} media assets, ${mediaRefs} manifest media refs`,
);
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  error ${e}`);
if (errors.length) {
  console.error(`check-manifest: FAILED with ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`check-manifest: OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}`);
