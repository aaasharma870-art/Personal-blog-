// Validates the page manifest (lib/page.ts), the film layer (lib/film.ts,
// lib/quotes.ts), the media manifest (lib/media.ts) and the world tokens
// (app/globals.css). Runs in `npm run check` after `tsc --noEmit`. Node >=
// 22.18 / 24 strips the TypeScript types natively, so this imports the .ts
// sources directly — every imported file is pure data / pure functions by
// contract (type-only imports, no React).
//
// SPEC v2 §12.5 checks implemented here (numbers match the SPEC list):
//   1 acts contiguous, ≤ 4 works, ≤ 4 major world changes   2 hero / credits / films placement
//   3 ≤ 2 derived long cards                                 4 signature ≤ 6, scene + long ≤ 2
//   5 world × tone AA table computed from globals.css        6 draft / proposed copy (release gate)
//   7 quote registry lint + OUT lines                        8 H2 file checks (provenance, accept, font licences)
//   9 hygiene (title / description / OG: no work titles)     10 lettering scope + display-face allow-list
//   11 H3 fan-tribute line                                   12 confirmed tips vs content.ts
//   14 prologue / CTA / egg hosts resolve
// plus M1.5 VARIANTS (Aryan's answer: a DEFAULT and an ALT of every animation
// and video): media `variants.alt` <-> `variantOf` pairs; every intro / hero /
// signature-or-scene section / derived card / world loader in use registers
// DEFAULT + ALT pieces in lib/variants.ts; manifest choices name real pieces
// and never pick an ALT that is not built;
// plus the cheap adaptability fixtures (A, D, E, F, G, I, J) run through the
// SAME derivation code the page uses (lib/derive.ts).
// Not automated yet: travel budgets (no travel data in the manifest yet) and
// #13 handbill fields (no handbill data yet).
//
// Errors fail the run (exit 1); warnings are printed only. `RELEASE=1`
// promotes the production-only gates (#6 copy sign-off + film.branchPreview
// off, #8 Aryan's Check L2, #11 the credits line rendered, every missing
// variant ALT) from warnings to errors.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHORLESS_TYPES, DEFAULT_TONE, DEFAULT_WORLD, page } from "../lib/page.ts";
import { mediaAssets } from "../lib/media.ts";
import {
  DEFAULT_TONE as WORLDS_DEFAULT_TONE,
  DEFAULT_WORLD as WORLDS_DEFAULT_WORLD,
  TONE_IDS,
  WORLD_IDS,
  worlds,
} from "../lib/worlds.ts";
import { FAN_TRIBUTE_LINE, film } from "../lib/film.ts";
import { OUT_LINES, quotes } from "../lib/quotes.ts";
import * as content from "../lib/content.ts";
import { actCardsOf, actRunsOf, actsInUse, pageItemsOf, worldOfIn } from "../lib/derive.ts";
import { VARIANT_REGISTRY, hostOf, isVariant, pieceOf } from "../lib/variants.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE = process.env.RELEASE === "1";

/** Anchors the brief requires while their section is enabled (relaxable). */
const REQUIRED_ANCHORS = ["top", "about", "journey", "work", "systems", "principles", "writing", "beyond", "contact"];
const NAV_LABEL_WARN = 12;
/** SPEC v2 §3: at most 6 signature moments (the prologue counts as one). */
const MAX_SIGNATURE = 6;
const MAX_WORKS = 4;
const MAX_WORLD_CHANGES = 4;
const MAX_LONG_CARDS = 2;
const EXACT_H3 = "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games.";
const TONES = TONE_IDS;
const WORLDS = WORLD_IDS;
const USABLE = new Set(["accepted", "integrated"]);
/** Prop keys that hold MediaIds (string or string[]) anywhere in `props`. */
const MEDIA_KEY = /^(media|mediaMobile|image|video|poster|cover|evidence|still|stills|loop|board|sequence|portrait)$|Media$/;
/** Values that are references but not MediaIds (drawn in code / Aryan's own files). */
const NON_MEDIA_REF = /^(code|authentic):/;
/** Prop keys whose slot renders one specific kind (declared kind must match). */
const KEY_KIND = { image: "image", still: "image", stills: "image", poster: "image", board: "image", video: "video", loop: "video", sequence: "sequence" };
/** What a fallback may be for each kind. An image slot can't play a video;
 *  a video (or sequence) may degrade to a still, and its consumer must check
 *  the RESOLVED kind before rendering a <video> (see MediaBandSection). */
const FALLBACK_OK = { image: ["image"], video: ["video", "image"], sequence: ["sequence", "image"] };

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const gate = (m) => (RELEASE ? err(m) : warn(`[release gate] ${m}`));

/* — Media manifest self-consistency ——————————————————————————————— */
const mediaIds = new Set(Object.keys(mediaAssets));

/** The usable asset `id` resolves to (the resolveMedia walk), or null. */
function resolvedOf(id) {
  const seen = new Set();
  let cur = id;
  while (cur && !seen.has(cur) && mediaIds.has(cur)) {
    seen.add(cur);
    const a = mediaAssets[cur];
    if (USABLE.has(a.status)) return { id: cur, ...a };
    cur = a.fallback;
  }
  return null;
}
function resolves(id) {
  return resolvedOf(id) !== null;
}
/** Unresolved, but the chain ends in a planned asset with a declared code
 *  alternative (`codeAlt`): the consumer draws it (lib/media.ts). */
function codeAlternative(id) {
  const seen = new Set();
  let cur = id;
  while (cur && !seen.has(cur) && mediaIds.has(cur)) {
    seen.add(cur);
    const a = mediaAssets[cur];
    if (USABLE.has(a.status)) return null;
    if (a.codeAlt) return a.codeAlt;
    cur = a.fallback;
  }
  return null;
}

for (const [id, a] of Object.entries(mediaAssets)) {
  for (const k of ["poster", "fallback", "endsOn"]) {
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
    for (const k of ["src", "srcMobile", "webm"]) {
      if (a[k] && !fs.existsSync(path.join(ROOT, "public", a[k]))) err(`media "${id}": ${k} ${a[k]} not found under public/`);
    }
  }
  if (a.status === "planned" && !a.fallback && !a.codeAlt) warn(`media "${id}": planned with no fallback and no codeAlt (resolveMedia returns null)`);
  if (a.fallback && a.codeAlt) err(`media "${id}": codeAlt is only for planned assets with NO media fallback`);
  if (a.focalBox) {
    const b = a.focalBox;
    if (!(0 <= b.x0 && b.x0 < b.x1 && b.x1 <= 1 && 0 <= b.y0 && b.y0 < b.y1 && b.y1 <= 1)) err(`media "${id}": focalBox out of 0-1 order`);
  }
}

/* — Media variants (M1.5): default.variants.alt <-> alt.variantOf ———— */
const mediaNoAlt = { video: [], image: [] };
for (const [id, a] of Object.entries(mediaAssets)) {
  const alt = a.variants?.alt;
  if (alt !== undefined) {
    if (!mediaIds.has(alt)) err(`media "${id}": variants.alt "${alt}" is not a MediaId`);
    else {
      const b = mediaAssets[alt];
      if (alt === id) err(`media "${id}": variants.alt points at itself`);
      if (b.kind !== a.kind) err(`media "${id}": variants.alt "${alt}" is a ${b.kind}, not a ${a.kind}`);
      if (b.variantOf !== id) err(`media "${id}": its alternate "${alt}" must say variantOf: "${id}"`);
      if (b.variants) err(`media "${alt}": an alternate cannot have alternates of its own (no chains)`);
      if (USABLE.has(a.status) && !USABLE.has(b.status)) warn(`media "${id}": its alternate "${alt}" is ${b.status} (resolveVariant plays the default)`);
      // an alternate clip cuts from / to the default's plates or their alternates
      if (a.kind === "video") {
        for (const k of ["poster", "endsOn"]) {
          if (b[k] && a[k] && b[k] !== a[k] && mediaAssets[a[k]]?.variants?.alt !== b[k]) {
            warn(`media "${alt}": ${k} "${b[k]}" is neither the default's "${a[k]}" nor its alternate`);
          }
        }
      }
    }
  }
  if (a.variantOf !== undefined) {
    if (a.variants) err(`media "${id}": an alternate (variantOf) cannot also be a default (variants)`);
    if (!mediaIds.has(a.variantOf)) err(`media "${id}": variantOf "${a.variantOf}" is not a MediaId`);
    else if (mediaAssets[a.variantOf].variants?.alt !== id) err(`media "${id}": variantOf "${a.variantOf}", which does not name it in variants.alt`);
  }
  // every accepted FILM clip / plate has an alternate (Aryan's answer #2)
  if (a.provenance.source === "higgsfield" && USABLE.has(a.status) && !a.variantOf && !a.variants) {
    (a.kind === "video" ? mediaNoAlt.video : mediaNoAlt.image).push(id);
  }
}
if (mediaNoAlt.video.length) gate(`variants: film video(s) with no alternate: ${mediaNoAlt.video.join(", ")}`);
if (mediaNoAlt.image.length) warn(`variants: film still(s) with no alternate (fine for derived plates): ${mediaNoAlt.image.join(", ")}`);

/* — #8 H2 file checks ————————————————————————————————————————————— */
{
  // every public/ file has a provenance row (src / srcMobile / webm of an entry)
  const owned = new Set();
  for (const a of Object.values(mediaAssets)) for (const k of ["src", "srcMobile", "webm"]) if (a[k]) owned.add(a[k]);
  const walk = (dir) =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
          d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)],
        )
      : [];
  for (const f of walk(path.join(ROOT, "public"))) {
    const rel = "/" + path.relative(path.join(ROOT, "public"), f).split(path.sep).join("/");
    if (/\.master\./i.test(rel)) err(`H2: ${rel} is a master file (masters never enter public/)`);
    else if (/\.(webp|png|jpe?g|avif|gif|mp4|webm|mov)$/i.test(rel) && !owned.has(rel)) {
      err(`H2: public${rel} has no lib/media.ts provenance row`);
    }
  }
  // generated assets carry the Check-L2 accept block
  for (const [id, a] of Object.entries(mediaAssets)) {
    if (a.provenance.source !== "higgsfield" || a.status === "planned") continue;
    const acc = a.accept;
    if (!acc) {
      err(`H2: higgsfield media "${id}" has no accept block`);
      continue;
    }
    for (const k of ["people", "likeness", "text", "ripped"]) if (acc[k] !== false) err(`H2: media "${id}" accept.${k} must be false`);
    if (!/^claude:\d{4}-\d{2}-\d{2}\+aryan:(\d{4}-\d{2}-\d{2}|pending)$/.test(acc.checkL2 ?? "")) err(`H2: media "${id}" accept.checkL2 malformed`);
    else if (acc.checkL2.endsWith("aryan:pending")) gate(`media "${id}": Check L2 awaits Aryan's countersignature`);
    if (!a.provenance.model || !a.provenance.date || !a.provenance.jobId) err(`H2: media "${id}" provenance needs model, date and jobId`);
  }
  // tracked font binaries carry their licence beside them
  const fontRoots = ["assets", "public", "app", "lib", "components"].map((d) => path.join(ROOT, d));
  for (const f of fontRoots.flatMap(walk)) {
    if (!/\.(ttf|otf|woff2?)$/i.test(f)) continue;
    const dir = path.dirname(f);
    if (!["OFL.txt", "LICENSE", "LICENSE.txt"].some((l) => fs.existsSync(path.join(dir, l)))) {
      err(`H2: font ${path.relative(ROOT, f)} has no OFL.txt / LICENSE beside it`);
    }
  }
  if (fs.existsSync(path.join(ROOT, "design-src", "fonts-personal"))) {
    const gi = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
    if (!/^\/?design-src\/fonts-personal\/?$/m.test(gi)) err(`H2: design-src/fonts-personal/ exists but is not git-ignored`);
  }
}

/* — Page manifest ————————————————————————————————————————————————— */
const ids = new Map();
const actIds = new Set(film.acts.map((a) => a.id));
page.forEach((s, i) => {
  if (ids.has(s.id)) err(`duplicate id "${s.id}" (entries ${ids.get(s.id)} and ${i})`);
  else ids.set(s.id, i);
  if (!/^[a-z][a-z0-9-]*$/.test(s.id)) err(`id "${s.id}" must be a lowercase slug (it is the #anchor)`);
  if (/^act-\d+$/.test(s.id)) err(`id "${s.id}" collides with the derived act-card anchors`);
  if (s.tone !== undefined && !TONES.includes(s.tone)) err(`"${s.id}": unknown tone "${s.tone}"`);
  if (s.world !== undefined && !WORLDS.includes(s.world)) err(`"${s.id}": unknown world "${s.world}"`);
  if (s.act != null && !actIds.has(s.act)) err(`"${s.id}": unknown act "${s.act}" (lib/film.ts acts)`);
  if (ANCHORLESS_TYPES.includes(s.type) && s.anchor !== false) {
    err(`"${s.id}": type "${s.type}" renders no #id — set anchor: false (else it leaks a dead #${s.id} into the sitemap/observer)`);
  }
  if (s.nav) {
    if (s.anchor === false || ANCHORLESS_TYPES.includes(s.type)) err(`"${s.id}": has nav but no anchor (nothing to jump to)`);
    if (!s.nav.label?.trim()) err(`"${s.id}": nav.label is empty`);
    else if (s.nav.label.length > NAV_LABEL_WARN) warn(`"${s.id}": nav label "${s.nav.label}" is ${s.nav.label.length} chars (> ${NAV_LABEL_WARN})`);
  }
});

/* — Worlds / tones (lib/worlds.ts is the single list of ids) ———————— */
if (DEFAULT_TONE !== WORLDS_DEFAULT_TONE) err(`lib/page.ts DEFAULT_TONE "${DEFAULT_TONE}" != lib/worlds.ts "${WORLDS_DEFAULT_TONE}"`);
if (DEFAULT_WORLD !== WORLDS_DEFAULT_WORLD) err(`lib/page.ts DEFAULT_WORLD "${DEFAULT_WORLD}" != lib/worlds.ts "${WORLDS_DEFAULT_WORLD}"`);
for (const w of WORLDS) {
  if (!film.worlds[w]) err(`lib/film.ts has no WorldSpec for world "${w}"`);
  else if (film.worlds[w].slots.loader !== worlds[w].loader) err(`world "${w}": film loader "${film.worlds[w].slots.loader}" != worlds.ts "${worlds[w].loader}"`);
}

const enabled = page.filter((s) => s.enabled !== false);
for (const s of enabled) {
  const w = worldOfIn(s, enabled, film);
  if (!worlds[w].ready) warn(`"${s.id}": world "${w}" is a placeholder (its token block is empty; renders house values)`);
  if (s.world && s.world !== "house") {
    const act = film.acts.find((a) => a.id === s.act);
    if (!act || act.world !== s.world) warn(`"${s.id}": world cameo "${s.world}" overrides its act`);
  }
  // media props ignored by a plain dressing
  if (s.type === "story" && s.props.variant === "notes" && (s.props.media || s.props.mediaMobile)) {
    if (film.worlds[w].slots.dressing.notes === "plain") warn(`"${s.id}": its media props are ignored by the plain notes dressing of "${w}"`);
  }
}

/* — #1 acts contiguous · works · world changes ——————————————————— */
{
  const runs = actRunsOf(enabled, film);
  const seen = new Set();
  for (const r of runs) {
    if (seen.has(r.act.id)) err(`#1 act "${r.act.id}" is not contiguous (it appears in two runs)`);
    seen.add(r.act.id);
  }
  const works = new Set(actsInUse(enabled, film).map((a) => a.world).filter((w) => w !== "house"));
  if (film.prologue.enabled) works.add(film.prologue.world);
  if (works.size > MAX_WORKS) err(`#1 ${works.size} film/game worlds in use (max ${MAX_WORKS})`);
  let changes = film.enabled && film.prologue.enabled ? 1 : 0; // the prologue flight
  let prev = null;
  for (const s of enabled) {
    const w = worldOfIn(s, enabled, film);
    if (w === "house") continue;
    if (prev && w !== prev) changes++;
    prev = w;
  }
  if (changes > MAX_WORLD_CHANGES) err(`#1 ${changes} major world changes (max ${MAX_WORLD_CHANGES}, the prologue flight counts)`);
}

/* — #2 placement ———————————————————————————————————————————————————— */
const heroes = page.filter((s) => s.type === "hero");
if (heroes.length !== 1) err(`#2 expected exactly one hero, found ${heroes.length}`);
if (page[0]?.type !== "hero") err(`#2 the first entry must be the hero (found "${page[0]?.type}")`);
if (heroes[0] && heroes[0].enabled === false) err(`#2 the hero cannot be disabled`);
if (heroes[0] && heroes[0].act != null) err(`#2 the hero must have act: null (it is the cold open)`);
if (page.filter((s) => s.type === "films").length > 1) err(`#2 at most one films section`);
{
  const credits = enabled.filter((s) => s.type === "credits");
  if (credits.length > 1) err(`#2 at most one credits section`);
  if (credits.length === 1) {
    if (enabled.at(-1) !== credits[0]) err(`#2 credits must be the last enabled section`);
    if (enabled.at(-2)?.type !== "contact") warn(`contact is not the last section before the credits`);
  } else if (enabled.at(-1)?.type !== "contact") warn(`contact is not the last section`);
}
{
  const runs = actRunsOf(enabled, film);
  const act2 = runs.find((r) => r.act.world === "idiots");
  if (act2 && act2.sections.length > 6) warn(`the Act II run has ${act2.sections.length} sections (> 6)`);
}

/* — #3/#4 cards, long cards, signature ———————————————————————————— */
const cards = actCardsOf(enabled, film);
{
  const long = cards.filter((c) => c.long);
  if (long.length > MAX_LONG_CARDS) err(`#3 ${long.length} derived long cards (max ${MAX_LONG_CARDS}): ${long.map((c) => c.id).join(", ")}`);
  const scenes = enabled.filter((s) => s.motion === "scene").length;
  if (scenes + long.length > 2) err(`#4 scene sections (${scenes}) + long cards (${long.length}) > 2`);
  for (const c of cards) if (c.transition === "reel") warn(`generic transition used for ${c.from}>${c.to} (card ${c.id})`);
  const signature = enabled.filter((s) => s.motion === "signature").map((s) => s.id);
  if (film.enabled && film.prologue.enabled) signature.unshift("(prologue)");
  if (signature.length > MAX_SIGNATURE) err(`#4 ${signature.length} signature moments (max ${MAX_SIGNATURE}): ${signature.join(", ")}`);
}

/* — Variants (M1.5): registry + manifest choices ———————————————————— */
const variantStats = { hosts: 0, pieces: 0, alts: 0 };
{
  const keys = Object.keys(VARIANT_REGISTRY);
  const keysOf = (host) => keys.filter((k) => hostOf(k) === host);
  for (const k of keys) {
    if (!/^[a-z0-9-]+\.[a-z0-9-]+$/.test(k)) err(`variants: registry key "${k}" must be "<host>.<piece>" (lowercase slugs)`);
    const p = VARIANT_REGISTRY[k];
    for (const side of ["default", "alt"]) {
      const impl = p[side];
      if (!impl) continue;
      if (!impl.name?.trim() || !impl.note?.trim()) err(`variants: ${k}.${side} needs a name and a note`);
      for (const m of impl.media ?? []) if (!mediaIds.has(m)) err(`variants: ${k}.${side} plays unknown media "${m}"`);
    }
    if (!p.default) err(`variants: ${k} has no DEFAULT`);
    if (p.alt && p.default && p.alt.name === p.default.name) err(`variants: ${k}: the ALT must be a different choreography (same name "${p.alt.name}" as the DEFAULT)`);
    if (p.alt?.media && p.default?.media) {
      for (const m of p.alt.media) {
        if (!p.default.media.includes(m) && mediaIds.has(m) && !mediaAssets[m].variantOf) warn(`variants: ${k}.alt plays "${m}", which is not a registered media alternate (variantOf)`);
      }
    }
  }
  // the hosts in use that must ship a DEFAULT and an ALT
  const required = new Map();
  if (film.enabled && film.prologue.enabled) required.set("intro", "the prologue");
  for (const s of enabled) {
    if (s.type === "hero") required.set("hero", "the hero");
    else if (s.motion === "signature" || s.motion === "scene") required.set(s.id, `${s.motion} section`);
  }
  for (const c of cards) required.set(`card-${c.transition}`, `card ${c.id}`);
  const loaderWorlds = new Set(actsInUse(enabled, film).map((a) => a.world));
  if (film.enabled && film.prologue.enabled) loaderWorlds.add(film.prologue.world);
  for (const w of loaderWorlds) {
    const kind = film.worlds[w]?.slots.loader;
    if (kind && kind !== "plain") required.set(`loader-${kind}`, `the ${w} loader`);
  }
  const noPieces = [];
  const noAlt = [];
  for (const [host, why] of required) {
    const ks = keysOf(host);
    if (!ks.length) noPieces.push(`${host} (${why})`);
    for (const k of ks) {
      if (VARIANT_REGISTRY[k].alt) variantStats.alts++;
      else noAlt.push(k);
    }
    variantStats.pieces += ks.length;
  }
  variantStats.hosts = required.size;
  if (noPieces.length) gate(`variants: ${noPieces.length} host(s) register no pieces in lib/variants.ts: ${noPieces.join(", ")}`);
  if (noAlt.length) gate(`variants: ${noAlt.length} piece(s) still need an ALT: ${noAlt.join(", ")}`);

  // manifest choices: real variants, real pieces, never an unbuilt ALT
  const checkChoice = (choice, host, where) => {
    if (choice == null) return;
    const pickAlt = (k, how) => {
      if (VARIANT_REGISTRY[k] && !VARIANT_REGISTRY[k].alt) err(`variants: ${where} ${how} "alt" for ${k}, which has no ALT built (it would silently play the default)`);
    };
    if (typeof choice === "string") {
      if (!isVariant(choice)) err(`variants: ${where} "${choice}" is not "default" | "alt"`);
      else if (choice === "alt") for (const k of keysOf(host)) pickAlt(k, "picks");
      return;
    }
    for (const [piece, v] of Object.entries(choice)) {
      if (!isVariant(v)) err(`variants: ${where}.${piece} "${v}" is not "default" | "alt"`);
      if (piece !== "*" && !(`${host}.${piece}` in VARIANT_REGISTRY)) warn(`variants: ${where} names piece "${piece}", which is not registered under host "${host}"`);
      if (v === "alt") {
        const ks = piece === "*" ? keysOf(host).filter((k) => !(pieceOf(k) in choice)) : [`${host}.${piece}`];
        for (const k of ks) pickAlt(k, "picks");
      }
    }
  };
  if (!isVariant(film.defaultVariant)) err(`variants: film.defaultVariant "${film.defaultVariant}" is not "default" | "alt"`);
  else if (film.defaultVariant === "alt") {
    const unbuilt = keys.filter((k) => !VARIANT_REGISTRY[k].alt);
    if (unbuilt.length) warn(`variants: film.defaultVariant is "alt" but ${unbuilt.length} piece(s) have no ALT and play their default`);
  }
  checkChoice(film.prologue.variant, "intro", "film.prologue.variant");
  for (const s of page) checkChoice(s.variant, s.type === "hero" ? "hero" : s.id, `"${s.id}".variant`);
  for (const a of film.acts) {
    const card = cards.find((c) => c.act === a.id);
    if (card) checkChoice(a.variant, `card-${card.transition}`, `film.acts ${a.id}.variant`);
  }
  for (const [w, spec] of Object.entries(film.worlds)) checkChoice(spec.loaderVariant, `loader-${spec.slots.loader}`, `film.worlds.${w}.loaderVariant`);
}

/* — Required anchors ——————————————————————————————————————————————— */
for (const id of REQUIRED_ANCHORS) {
  const s = page.find((e) => e.id === id);
  if (!s) err(`required anchor #${id} is missing from the manifest`);
  else if (s.enabled === false) warn(`required anchor #${id} is disabled (hidden everywhere)`);
  else if (s.anchor === false) err(`required anchor #${id} has anchor:false`);
}

/* — Media references in props ————————————————————————————————————— */
function collectMedia(value, key, out) {
  if (Array.isArray(value)) value.forEach((v) => collectMedia(v, key, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectMedia(v, k, out);
  } else if (typeof value === "string" && key && MEDIA_KEY.test(key) && !NON_MEDIA_REF.test(value)) out.push({ key, id: value });
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
      if (s.enabled !== false && !resolves(id) && !codeAlternative(id)) err(`"${s.id}": media "${id}" has no usable asset (or codeAlt) in its fallback chain`);
    }
  }
}
// A film world's media (its act card plate, loop, films screen) is never a
// LEGACY still: a legacy fallback put a sci-fi horizon on the frontier card
// and a teal nebula on the Harry Potter card (M1 critic). Missing film media
// resolves to nothing and the consumer draws its code alternative.
for (const [w, spec] of Object.entries(film.worlds)) {
  for (const [k, id] of Object.entries(spec.media ?? {})) {
    if (!mediaIds.has(id)) {
      err(`film.worlds.${w}.media.${k} references unknown media "${id}"`);
      continue;
    }
    const r = resolvedOf(id);
    if (!r && !codeAlternative(id)) err(`film.worlds.${w}.media.${k} "${id}" has no usable asset (or codeAlt) in its fallback chain`);
    if (r && r.provenance?.source === "legacy") {
      err(`film.worlds.${w}.media.${k} "${id}" resolves to the LEGACY still "${r.id}": a film card's plate must be film media or its code alternative`);
    }
  }
}

/* — #14 prologue, CTA, egg hosts ——————————————————————————————————— */
{
  const hero = enabled.find((s) => s.type === "hero");
  const P = film.prologue;
  if (film.enabled && P.enabled) {
    if (!hero || P.landsOn !== hero.id) err(`#14 prologue.landsOn "${P.landsOn}" is not the hero`);
    for (const k of ["poster", "posterMobile", "flight"]) {
      if (!mediaIds.has(P[k])) err(`#14 prologue.${k} "${P[k]}" is not a MediaId`);
      else if (!resolves(P[k])) err(`#14 prologue.${k} "${P[k]}" does not resolve`);
    }
    const end = mediaAssets[P.flight]?.endsOn;
    if (hero && end && hero.props.media !== end) warn(`prologue end frame (${end}) != hero plate (${hero.props.media}): the landing falls back to a crossfade`);
  }
  if (hero) {
    const to = enabled.find((s) => s.id === hero.props.cta?.to);
    if (!to || to.anchor === false) err(`#14 hero cta.to "${hero.props.cta?.to}" does not resolve to an enabled anchored section`);
  }
  const hostOk = new Set([...page.map((s) => s.id), ...cards.map((c) => c.id), "global", "chrome", "intro", "console", "404"]);
  // M1: the credits roll renders in the layout footer, so "credits" is live,
  // and #kill-list still renders inside the legacy `work` gauntlet.
  const subAnchors = enabled.some((s) => s.id === "work") ? ["kill-list"] : [];
  const enabledHosts = new Set([...enabled.map((s) => s.id), ...cards.map((c) => c.id), ...subAnchors, "global", "chrome", "intro", "console", "404", "credits"]);
  for (const e of film.eggs.list) {
    if (!hostOk.has(e.host)) err(`#14 egg "${e.id}": host "${e.host}" does not exist`);
    else if (e.enabled && !enabledHosts.has(e.host)) warn(`egg "${e.id}": host "${e.host}" is disabled (the egg is dropped)`);
  }
}

/* — #5 AA table from globals.css ————————————————————————————————— */
const css = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
const aa = { cells: 0, min: Infinity, minAt: "" };
{
  const vars = {};
  for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) if (!(m[1] in vars)) vars[m[1]] = m[2];
  const hex = (name) => {
    const v = vars[name];
    if (!v) throw new Error(`globals.css: --${name} not found`);
    return v;
  };
  const lum = (h) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const check = (fgName, bgName, min, where) => {
    const r = ratio(hex(fgName), hex(bgName));
    aa.cells++;
    if (min >= 4.5 && r < aa.min) {
      aa.min = r;
      aa.minAt = `${fgName} on ${bgName}`;
    }
    if (r < min) err(`#5 AA: --${fgName} on --${bgName} (${where}) = ${r.toFixed(2)} < ${min}`);
  };
  const TEXT = ["color-ink", "color-stone", "color-muted", "color-aqua", "color-amber", "color-ember"];
  const INK_STONE = ["color-ink", "color-stone"];
  const G = {
    house: { canvas: "house-canvas", raised: "house-raised", overlay: "house-overlay", slate: "house-slate", deep: "house-deep" },
    pirates: { canvas: "pir-canvas", raised: "pir-raised", overlay: "pir-overlay", slate: "pir-overlay", deep: "pir-deep" },
    idiots: { canvas: "idi-canvas", raised: "idi-raised", overlay: "idi-overlay", slate: "idi-overlay", deep: "idi-deep" },
    hp: { canvas: "hp-canvas", raised: "hp-raised", overlay: "hp-overlay", slate: "hp-overlay", deep: "hp-deep" },
    rdr2: { canvas: "rd-canvas", raised: "rd-raised", overlay: "rd-overlay", slate: "rd-overlay", deep: "rd-deep" },
  };
  const INKS = {
    house: [],
    pirates: ["w-brass"],
    idiots: ["w-bp-line", "w-chalk"],
    hp: ["w-ink-contour", "w-patronus"],
    rdr2: ["w-pencil", "w-bone"],
  };
  for (const w of WORLDS) {
    const g = G[w];
    if (!g) {
      err(`#5 AA: no ground map for world "${w}"`);
      continue;
    }
    // tone planes: bg / surface-1 / surface-2 (DESIGN v3 §1.3.4)
    const planes = {
      canvas: [g.canvas, g.raised, g.overlay],
      raised: [g.raised, g.overlay, g.slate],
      deep: [g.deep, g.canvas, g.raised],
    };
    for (const [tone, [bg, s1, s2]] of Object.entries(planes)) {
      for (const t of TEXT) check(t, bg, 4.5, `${w} ${tone} bg`);
      for (const t of TEXT) check(t, s1, 4.5, `${w} ${tone} surface-1`);
      // surface-2 of the raised tone is slate: ink + stone only (DESIGN §1.1)
      for (const t of tone === "raised" && w === "house" ? INK_STONE : TEXT) check(t, s2, 4.5, `${w} ${tone} surface-2`);
      check("color-aqua-bright", bg, 4.5, `${w} ${tone} hover`);
    }
    // role inks carry meaning: UI >= 3 on the world's own grounds
    for (const ink of INKS[w]) for (const gr of [g.canvas, g.raised, g.deep]) check(ink, gr, 3, `${w} role ink`);
  }
  // the paper plane (the rdr2 journal / HP parchment)
  for (const t of ["paper-fg", "paper-muted", "paper-ghost", "paper-accent", "paper-kill", "paper-exception", "paper-pencil", "paper-red"]) {
    for (const bg of ["paper", "paper-s1", "paper-s2"]) check(t, bg, 4.5, "paper plane");
  }
  // rdr2 paper objects (DESIGN v3 §1.3.2a)
  for (const t of ["handbill-graphite", "paper-fg", "paper-pencil", "paper-muted", "paper-red", "paper-accent"]) check(t, "handbill", 4.5, "handbill");
  for (const t of ["handbill-graphite", "paper-pencil"]) check(t, "trail-map", 4.5, "trail map");
  // the Dead Eye ground, the blueprint panel, the intro night
  for (const t of TEXT) check(t, "rd-deadeye-bg", 4.5, "Dead Eye ground");
  for (const t of INK_STONE) check(t, "bp-panel", 4.5, "blueprint panel (ink + stone only)");
  const introNight = css.match(/--color-intro-night:\s*(#[0-9a-fA-F]{6})/)?.[1];
  if (!introNight) err(`#5 --color-intro-night missing`);
  else {
    vars["color-intro-night"] = introNight;
    for (const t of ["color-ink", "color-stone", "color-muted", "color-aqua"]) check(t, "color-intro-night", 4.5, "intro night");
  }
  // compass red: decorative, >= 3 where it sits (pirates canvas / deep), never on pirates raised
  check("pir-compass-red", "pir-canvas", 3, "Jack's compass arrow");
  check("pir-compass-red", "pir-deep", 3, "Jack's compass arrow");
  // every world block fills every slot
  for (const w of WORLDS) {
    const block = css.match(new RegExp(`\\[data-world="${w}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";
    for (const slotName of ["canvas", "raised", "overlay", "slate", "deep", "line", "emphasis", "quiet", "panel", "font-act"]) {
      if (!new RegExp(`--world-${slotName}:`).test(block)) err(`#5 [data-world="${w}"] does not set --world-${slotName}`);
    }
  }
}

/* — #6 copy statuses (release gate) ——————————————————————————————
   film.branchPreview (Aryan's answer #2) renders proposed AND draft copy in
   every build of the branch. The strings keep their statuses, so RELEASE=1
   fails while the preview is on or any shown string is unsigned. */
const copyStats = { drafts: 0, proposed: 0, quotes: 0 };
{
  const proposed = [];
  const drafts = [];
  const visit = (c, where) => {
    if (!c || typeof c !== "object" || !("status" in c)) return;
    if (c.text && (c.draft === true) !== (c.status === "draft")) err(`#6 ${where}: \`draft: true\` must go with status "draft" (and back)`);
    if (c.alternates && c.status === "confirmed") warn(`${where}: confirmed copy still carries draft alternates`);
    if (c.status === "draft" && c.text) drafts.push(where);
    if (c.status === "proposed" && c.text && !film.copySignedOff) proposed.push(where);
  };
  for (const [k, c] of Object.entries(film.copy)) visit(c, `copy.${k}`);
  for (const a of film.acts) {
    visit(a.title, `${a.id}.title`);
    visit(a.logline, `${a.id}.logline`);
    if (a.epigraph && typeof a.epigraph === "object") visit(a.epigraph, `${a.id}.epigraph`);
  }
  for (const [w, s] of Object.entries(film.worlds)) {
    visit(s.borrowed, `${w}.borrowed`);
    visit(s.reason, `${w}.reason`);
  }
  film.tips.forEach((t, i) => visit(t, `tip #${i + 1}`));
  const qProposed = Object.entries(quotes).filter(([, q]) => q.status === "proposed" && !film.copySignedOff).map(([id]) => id);
  Object.assign(copyStats, { drafts: drafts.length, proposed: proposed.length, quotes: qProposed.length });
  if (film.branchPreview) gate(`#6 film.branchPreview is ON: proposed and draft copy render in every build (turn it off before main)`);
  if (drafts.length) {
    gate(`#6 ${drafts.length} draft string(s) with text${film.branchPreview ? " RENDER on this branch" : " would render"} until Aryan rewrites and confirms them: ${drafts.join(", ")}`);
  }
  if (proposed.length || qProposed.length) {
    gate(`#6 ${proposed.length} proposed string(s) + ${qProposed.length} quote(s)${film.branchPreview ? " render on this branch and" : ""} await Aryan's sign-off (film.copySignedOff)`);
  }
}

/* — #7 quote registry lint + OUT lines ——————————————————————————— */
const uiFiles = (() => {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) walk(p);
      else if (/\.(tsx?|mjs|js|css|md)$/.test(d.name)) out.push(p);
    }
  };
  for (const d of ["app", "components", "lib", "public"]) walk(path.join(ROOT, d));
  return out;
})();
{
  const quoteFile = path.join(ROOT, "lib", "quotes.ts");
  for (const [id, q] of Object.entries(quotes)) {
    if (!q.work || !q.year) err(`#7 quote ${id} needs work and year`);
    if (q.verified === "COMMUNITY") warn(`quote ${id} is COMMUNITY-sourced: verify it in the work before "confirmed"`);
  }
  const texts = Object.entries(quotes).flatMap(([id, q]) => [[id, q.text], ...(q.excerptText ? [[id, q.excerptText]] : [])]);
  for (const f of uiFiles) {
    if (f === quoteFile) continue;
    const src = fs.readFileSync(f, "utf8");
    const rel = path.relative(ROOT, f);
    for (const [id, t] of texts) if (src.includes(t)) err(`#7 ${rel} contains the text of quote ${id}: render it through <FilmQuote id="${id}"> (no unattributed quotes)`);
    const low = src.toLowerCase();
    for (const o of OUT_LINES) if (low.includes(o)) err(`#7 ${rel} contains an OUT line ("${o}")`);
  }
}

/* — #9 hygiene: title / description / OG carry no work titles ——————— */
{
  const titles = Object.values(film.worlds).flatMap((w) => (w.work ? [w.work.title] : []));
  const layout = fs.readFileSync(path.join(ROOT, "app", "layout.tsx"), "utf8");
  const metaBlock = layout.slice(layout.indexOf("const description"), layout.indexOf("export default function"));
  const scan = [["app/layout.tsx metadata", metaBlock]];
  for (const f of ["opengraph-image.tsx", "icon.tsx"]) {
    const p = path.join(ROOT, "app", f);
    if (fs.existsSync(p)) scan.push([`app/${f}`, fs.readFileSync(p, "utf8")]);
  }
  for (const [where, text] of scan) {
    for (const t of titles) if (text.toLowerCase().includes(t.toLowerCase())) err(`#9 hygiene: ${where} names "${t}" (screen one and the crawl surface stay name-first)`);
  }
}

/* — #10 lettering scope + display-face allow-list —————————————————— */
{
  for (const l of film.lettering) {
    if (!["act-title", "loader", "egg"].includes(l.slot) && !film.fontScope.extended) err(`#10 lettering "${l.id}" slot "${l.slot}" is outside the display-font scope`);
    if (l.mode === "B" && l.shipped && !fs.existsSync(path.join(ROOT, "lib", "lettering.generated.ts"))) err(`#10 lettering "${l.id}" is mode B + shipped but lib/lettering.generated.ts is missing`);
  }
  // who may reference a display face (font-world-*, --font-egg-*)
  const ALLOW = [
    /^app[\\/]globals\.css$/,
    /^app[\\/]layout\.tsx$/,
    /^lib[\\/]fonts\.ts$/,
    /^components[\\/]primitives[\\/](act-card|loader)\.tsx$/,
    /^components[\\/]primitives[\\/]loaders[\\/]/,
    /^components[\\/]sections[\\/]act-card[\\/]/,
    /^components[\\/]eggs[\\/]/,
    /^components[\\/]site[\\/]journey[^\\/]*\.tsx$/, // the THE CROSSING cartouche
    /^app[\\/](not-found|lab)/,
  ];
  for (const f of uiFiles) {
    const rel = path.relative(ROOT, f);
    const src = fs.readFileSync(f, "utf8");
    if (/font-world-|--font-egg-|fontWorld(Pirates|Idiots|Hp)|fontEggRye/.test(src) && !ALLOW.some((re) => re.test(rel))) {
      err(`#10 ${rel} uses a world display face outside the allowed slots (act titles, loader route cards, eggs)`);
    }
  }
}

/* — #11 H3 fan-tribute line ————————————————————————————————————————— */
if (FAN_TRIBUTE_LINE !== EXACT_H3) err(`#11 H3: the credits line in lib/film.ts is not the exact required string`);
if (film.enabled) {
  const renders = uiFiles.some((f) => /components[\\/]/.test(f) && /FAN_TRIBUTE_LINE|credits\.legal|Fan tribute — not affiliated/.test(fs.readFileSync(f, "utf8")));
  if (!renders) gate(`#11 H3: no component renders the fan-tribute line yet (the credits roll)`);
}

/* — #12 confirmed tips vs content.ts ————————————————————————————— */
{
  const get = (p) => p.split(/[.[\]]/).filter(Boolean).reduce((o, k) => (o == null ? o : o[k]), content);
  film.tips.forEach((t, i) => {
    if (t.status !== "confirmed" || !t.source || t.source === "REPO") return;
    const src = get(t.source);
    if (typeof src !== "string") return err(`#12 tip #${i + 1}: source "${t.source}" is not a content.ts string`);
    // verbatim; a trailing full stop may close a clause the source continues (with " —")
    const core = t.text.endsWith(".") ? t.text.slice(0, -1) : t.text;
    if (!src.includes(t.text) && !src.includes(core)) err(`#12 tip #${i + 1} is not verbatim in content.ts ${t.source}`);
  });
}

/* — Adaptability fixtures (SPEC §12.6), same derivation code ———————— */
const fixtures = [];
{
  const kinds = (secs, f = film) => actCardsOf(secs, f).map((c) => c.transition).join(" ");
  const expect = (name, got, want) => {
    fixtures.push(name);
    if (got !== want) err(`fixture ${name}: cards "${got}" (expected "${want}")`);
  };
  // the full v2 page, every stub enabled (independent of the M1 enabled flags)
  const all = page.filter((s) => !["credibility", "mediaBand"].includes(s.type));
  expect("A default", kinds(all), "opening seam tintype ignite");
  expect("D film off", kinds(all, { ...film, enabled: false }), "");
  expect("E films off", kinds(all.filter((s) => s.type !== "films")), "opening seam tintype ignite");
  expect("F journey off", kinds(all.filter((s) => s.id !== "journey")), "opening seam tintype ignite");
  const g = actCardsOf(all, { ...film, intensity: "grade" });
  fixtures.push("G grade");
  if (g.some((c) => c.long)) err(`fixture G grade: long cards remain`);
  expect("I rdr2 removed", kinds(all.filter((s) => s.act !== "act-3")), "opening seam ignite");
  const J = all.filter((s) => s.id !== "writing");
  J.splice(J.findIndex((s) => s.id === "contact"), 0, { ...all.find((s) => s.id === "writing"), act: "act-4" });
  fixtures.push("J writing→IV");
  if (worldOfIn(J.find((s) => s.id === "writing"), J, film) !== "hp") err(`fixture J: writing did not become hp`);
  if (actCardsOf(J, film).length !== 4) err(`fixture J: expected 4 cards`);
  // the live (enabled) page must give the same card sequence as A
  expect("live", kinds(enabled), "opening seam tintype ignite");
  if (pageItemsOf(enabled, film).filter((i) => i.kind === "section").length !== enabled.length) err(`pageItems lost a section`);
}

/* — Report ————————————————————————————————————————————————————————— */
const numbered = enabled.filter((s) => s.numbered).map((s) => s.id);
console.log(
  `check-manifest: ${page.length} entries (${enabled.length} enabled, ${numbered.length} numbered: ${numbered.join(" ")}); ` +
    `${mediaIds.size} media assets, ${mediaRefs} manifest media refs`,
);
console.log(
  `  acts: ${cards.map((c) => `${c.id} ${c.transition}${c.long ? "(long)" : ""} ${c.from ?? "—"}→${c.to} "${c.title}"`).join(" | ")}`,
);
console.log(`  AA: ${aa.cells} cells, tightest text cell ${aa.min.toFixed(2)} (${aa.minAt}); fixtures: ${fixtures.join(", ")}`);
console.log(
  `  variants: ${variantStats.hosts} hosts in use, ${variantStats.pieces} pieces, ${variantStats.alts} with an ALT; ` +
    `copy: branchPreview ${film.branchPreview ? "ON" : "off"}, ${copyStats.drafts} drafts + ${copyStats.proposed} proposed + ${copyStats.quotes} quotes unsigned`,
);
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  error ${e}`);
if (errors.length) {
  console.error(`check-manifest: FAILED with ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`check-manifest: OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}`);
