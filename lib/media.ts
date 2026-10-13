/* ============================================================================
   MEDIA — typed manifest of every file under public/media (SYNTHESIS §8).
   PURE DATA: no React, no Next, type-only imports — Node can import this
   file directly (scripts/check-manifest.mjs validates it).

   Sections reference media by ID (`MediaId`), never by path. `resolveMedia()`
   walks `fallback` until it reaches an asset whose status is usable
   ("accepted" | "integrated"), so a planned/missing asset never 404s or leaves
   an empty rectangle.

   Dimensions are the real intrinsic sizes (images read with sharp, videos with
   ffprobe). Every asset here is decorative atmosphere (aria-hidden, alt="")
   so `alt` is null throughout: generated media is never evidence (SPEC §15 H4).

   Two families:
   - LEGACY (pre-redesign, /media/*): the "Midnight Aqua" stills and loops.
     They are the fallbacks of every planned film asset.
   - FILMS (/media/films/*, MEDIA-PLAN v2 filenames, SPEC ids MV-nn / IN-nn /
     F-xx): Higgsfield generations accepted at the MEDIA-PLAN gates. Each one
     carries provenance {source:"higgsfield", model, credits, date, jobId} and
     the Check-L2 `accept` block (SPEC §12.5 #8). `*.master.*` files and
     `media/masters/` NEVER enter public/ (H2).

   VARIANTS (M1.5; Aryan: "a DEFAULT and an ALTERNATE of every animation
   and video"): a default asset names its alternate in `variants.alt`; the
   alternate points back with `variantOf` (the validator checks both ways,
   same kind, no chains). `resolveVariant(id, variant)` picks the side
   (lib/variants.ts is the variant model; `useVariant()` the client hook).
   Alternates are the RUNNERS-UP of each generation batch (0 extra credits),
   not MEDIA-PLAN picks: their LOG verdicts travel in `provenance.note`.
   NOTE: `alt` on an entry is the ALT TEXT (null = decorative), not the
   variant.

   Adding an asset: add one entry below (status "planned" is fine while it is
   being made — give it a `fallback`, usually a legacy still), then run
   `npm run check`. When the file is accepted: copy the web encode into
   public/media/films/, set status "accepted", real width/height, provenance
   and `accept`.

   M2 (integrator, 2026-09-29): every staged M2 asset and the eight iconic
   plates are registered below. Status "received" = the file is in public/
   with its provenance but is NEVER played (resolveMedia skips it): MV-01-alt
   (a reject; the hero plays MV-01 under both variants) and MV-06-alt (fails
   board evenness; waits on Aryan). ANCHORS: `marks` (points) and `rects`
   (boxes) are the named registration points code draws against — read them
   with markOf() / rectOf(); `sequenceFrames()` lists a sequence's frames.
   ========================================================================== */

import type { Variant } from "./variants";

export type MediaKind = "image" | "video" | "sequence";
export type MediaStatus = "planned" | "received" | "accepted" | "integrated";
export type MediaSource = "higgsfield" | "authentic" | "code" | "legacy";

export type MediaProvenance = {
  source: MediaSource;
  /** Higgsfield model id (+ mode), e.g. "gpt_image_2_5 16:9 4k xhigh". */
  model?: string;
  /** Credits billed for THIS accepted output (the asset's total incl.
   *  drafts/alternates is in research/build/media/LEDGER.md). */
  credits?: number;
  date?: string;
  /** Higgsfield job id of the accepted output. */
  jobId?: string;
  note?: string;
};

/** Check L2 (SPEC §15, DESIGN v3 §7): every generated asset is ours, has no
 *  people or likeness, no legible text/marks, nothing ripped. `checkL2` is
 *  "claude:<date>+aryan:<date|pending>"; production needs both dates. */
export type MediaAccept = {
  people: false;
  likeness: false;
  text: false;
  ripped: false;
  /** ICONS.md icon ids the image depicts (recreated by us). */
  icon?: readonly string[];
  checkL2: `claude:${string}+aryan:${string}`;
};

/** Normalised 0-1 box of the plate's focal subject (the hero Lens `frame`). */
export type FocalBox = { x0: number; x1: number; y0: number; y1: number };

/** The variant link of a DEFAULT asset (a MediaId, typed as string for the
 *  same reason as `poster`). */
type MediaVariants = { alt: string };

/** Shape of one manifest entry. `poster` / `fallback` hold MediaIds (typed as
 *  string here only to avoid a self-referential type; the validator checks
 *  they exist, and `MediaAsset` re-types them as `MediaId`). */
type MediaDef = {
  kind: MediaKind;
  status: MediaStatus;
  src: string;
  srcMobile?: string;
  /** VP9 WebM twin of a video `src` (list it first in <source>). */
  webm?: string;
  /** Video whose LAST frame is registered to this still (MediaId): the
   *  prologue flight lands on the hero plate (SPEC §5.5). */
  endsOn?: string;
  poster?: string;
  width: number;
  height: number;
  /** Seconds (video only). */
  durationS?: number;
  focal?: readonly [x: number, y: number];
  focalBox?: FocalBox;
  /** Named 0-1 points measured on the plate (MEDIA LOG), e.g. the Pearl's
   *  stern lantern: the page's one warm point (SPEC §1, §6). These are the
   *  plate ANCHORS code registers against (RECOGNIZABILITY §7.2: the Jolly
   *  Roger on `mastTop`, embers from `fire` …). Read them with `markOf()`. */
  marks?: Readonly<Record<string, readonly [x: number, y: number]>>;
  /** Named 0-1 boxes measured on the plate (the ICE board, the WANTED
   *  poster …). Read them with `rectOf()`. */
  rects?: Readonly<Record<string, FocalBox>>;
  /** `sequence` only: frame count. Frames are `${src}000.webp` …
   *  (3-digit, zero-based); `sequenceFrames()` lists them. */
  frames?: number;
  /** null => decorative: aria-hidden, alt="". */
  alt: string | null;
  provenance: MediaProvenance;
  accept?: MediaAccept;
  fallback?: string;
  /** A planned asset with NO media fallback: what its consumers draw in code
   *  until it is accepted (MEDIA-PLAN "Code alternative"). A film surface
   *  never falls back to a LEGACY still (validator: a film world's media must
   *  not resolve to provenance "legacy"), so these resolve to null and the
   *  consumer renders its code alternative. */
  codeAlt?: string;
  /** Reduced-motion / Save-Data behaviour. */
  reduced: "poster" | "hide";
  /** DEFAULT side: its alternate (`resolveVariant(id, "alt")`). */
  variants?: MediaVariants;
  /** ALT side: the default asset it stands in for. */
  variantOf?: string;
};

const legacy: MediaProvenance = { source: "legacy" };

/** Check L2 signed by Claude on 2026-09-28; Aryan's countersignature pending
 *  (MEDIA LOG "Open flags"). The validator warns until it is dated. */
/** Aryan countersigned every plate as-is on 2026-09-29 ("sign everything as-is"). */
const L2_SIGNED = "claude:2026-09-28+aryan:2026-09-29" as const;
const clean = (icon?: readonly string[]): MediaAccept => ({
  people: false, likeness: false, text: false, ripped: false,
  ...(icon ? { icon } : {}), checkL2: L2_SIGNED,
});
const hf = (model: string, credits: number, jobId: string, note?: string): MediaProvenance => ({
  source: "higgsfield", model, credits, date: "2026-09-28", jobId, ...(note ? { note } : {}),
});
/** Alternates: Check L2 signed by Claude on 2026-09-29 (viewed: no people,
 *  likeness, text or marks; generated, nothing ripped); Aryan pending. */
const cleanAlt = (icon?: readonly string[]): MediaAccept => ({
  ...clean(icon), checkL2: "claude:2026-09-29+aryan:2026-09-29",
});
/** M2 media (lanes A + B, the M2-R iconic lane; 2026-09-29): Check L2
 *  signed by Claude on 2026-09-29 (M2-MEDIA-REPORT §3, LEDGER-m2iconic);
 *  Aryan pending. */
const cleanM2 = (icon?: readonly string[]): MediaAccept => ({
  ...clean(icon), checkL2: "claude:2026-09-29+aryan:2026-09-29",
});
const hf2 = (model: string, credits: number, jobId: string, note?: string): MediaProvenance => ({
  source: "higgsfield", model, credits, date: "2026-09-29", jobId, ...(note ? { note } : {}),
});
/** Phase 3 media (the P3 media lane, PHASE3-PLAN §9; registered by the W1
 *  assembler on 2026-10-01): generated 2026-09-30; Check L2 signed by Claude
 *  on 2026-10-01, Aryan pending (DP-9: RELEASE gates on the countersignature). */
const L2_P3 = "claude:2026-10-01+aryan:pending" as const;
const cleanP3 = (icon?: readonly string[]): MediaAccept => ({
  ...clean(icon), checkL2: L2_P3,
});
const hfP3 = (model: string, credits: number, jobId: string, note?: string): MediaProvenance => ({
  source: "higgsfield", model, credits, date: "2026-09-30", jobId, ...(note ? { note } : {}),
});
/** The iconic plates (M2-R lane, LEDGER-m2iconic.md): gpt_image_2_5 16:9 4k
 *  xhigh, 3840×2160 masters, 2560×1440 web encodes here. Anchors (marks /
 *  rects) marked "provisional" are Claude's estimates at 960 px; the
 *  builder that registers code to them re-measures on the accepted plate. */
const ICONIC = "gpt_image_2_5 16:9 4k xhigh";

export const mediaAssets = {
  /* — Hero ———————————————————————————————————————————————————————— */
  "hero-volsurface": {
    kind: "image", status: "integrated", src: "/media/hero-volsurface.webp",
    width: 1600, height: 914, alt: null, provenance: legacy, reduced: "poster",
  },
  "hero-loop": {
    kind: "video", status: "integrated", src: "/media/hero-loop.mp4", poster: "hero-volsurface",
    width: 1920, height: 1080, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },
  "hero-still": {
    kind: "image", status: "integrated", src: "/media/hero-still.png",
    width: 2688, height: 1520, alt: null, provenance: legacy, reduced: "poster",
  },

  /* — Section backdrops (AmbientBackground stills) ———————————————— */
  "still-network": {
    kind: "image", status: "integrated", src: "/media/still-network.png",
    width: 2688, height: 1520, alt: null, provenance: legacy, reduced: "poster",
  },
  "still-calm": {
    kind: "image", status: "integrated", src: "/media/still-calm.png",
    width: 2688, height: 1520, alt: null, provenance: legacy, reduced: "poster",
  },
  "still-terminal": {
    kind: "image", status: "integrated", src: "/media/still-terminal.png",
    width: 2688, height: 1520, alt: null, provenance: legacy, reduced: "poster",
  },
  "still-blueprint": {
    kind: "image", status: "integrated", src: "/media/still-blueprint.png",
    width: 2688, height: 1520, alt: null, provenance: legacy, reduced: "poster",
  },
  "still-rays-img": {
    kind: "image", status: "integrated", src: "/media/still-rays-img.png",
    width: 2688, height: 1520, alt: null, provenance: legacy, reduced: "poster",
  },
  methodology: {
    kind: "image", status: "integrated", src: "/media/methodology.webp",
    width: 1600, height: 914, alt: null, provenance: legacy, reduced: "poster",
  },

  /* — Section backdrop loops (desktop + motion only) ——————————————— */
  "v-particles": {
    kind: "video", status: "integrated", src: "/media/v-particles.mp4", poster: "still-network",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },
  "v-network": {
    kind: "video", status: "integrated", src: "/media/v-network.mp4", poster: "still-calm",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },
  "v-terminal": {
    kind: "video", status: "integrated", src: "/media/v-terminal.mp4", poster: "still-terminal",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },
  "v-waveform": {
    kind: "video", status: "integrated", src: "/media/v-waveform.mp4", poster: "hero-still",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },
  "v-finale": {
    kind: "video", status: "integrated", src: "/media/v-finale.mp4", poster: "hero-still",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },

  /* — Media bands (referenced from lib/page.ts) ——————————————————— */
  "band-flow": {
    kind: "video", status: "integrated", src: "/media/band-flow.mp4", poster: "still-terminal",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },
  "v-contour": {
    kind: "video", status: "integrated", src: "/media/v-contour.mp4", poster: "still-network",
    width: 1280, height: 720, durationS: 5.06, alt: null, provenance: legacy, reduced: "poster",
  },

  /* — Flagship project covers (lib/content.ts `cover`) ————————————— */
  "cover-trading-algos": {
    kind: "image", status: "integrated", src: "/media/cover-trading-algos.webp",
    width: 1600, height: 914, alt: null, provenance: legacy, reduced: "poster",
  },
  "cover-optuna": {
    kind: "image", status: "integrated", src: "/media/cover-optuna.webp",
    width: 1600, height: 914, alt: null, provenance: legacy, reduced: "poster",
  },

  /* — Present in public/media but NOT referenced by any component yet
       (TEARDOWN "unused assets"). Status "received": not usable by
       resolveMedia until a later phase accepts them. ——————————————— */
  "cover-option-alpha": {
    kind: "image", status: "received", src: "/media/cover-option-alpha.webp",
    width: 1600, height: 914, alt: null, provenance: legacy, reduced: "poster",
  },
  "chapter-sweep": {
    kind: "image", status: "received", src: "/media/chapter-sweep.webp",
    width: 1920, height: 1097, alt: null, provenance: legacy, reduced: "poster",
  },
  "writing-compounding": {
    kind: "image", status: "received", src: "/media/writing-compounding.webp",
    width: 900, height: 900, alt: null, provenance: legacy, reduced: "poster",
  },
  "writing-noise-signal": {
    kind: "image", status: "received", src: "/media/writing-noise-signal.webp",
    width: 900, height: 900, alt: null, provenance: legacy, reduced: "poster",
  },
  "writing-paths": {
    kind: "image", status: "received", src: "/media/writing-paths.webp",
    width: 900, height: 900, alt: null, provenance: legacy, reduced: "poster",
  },

  /* == FILMS (MEDIA-PLAN v2; public/media/films/) =========================
     ACCEPTED. Check L2: Claude 2026-09-28, Aryan pending.                  */

  /* — Prologue (hp): the play screen and the broom flight (SPEC §5) — */
  "IN-01": {
    kind: "image", status: "accepted", src: "/media/films/intro-play.webp",
    width: 2560, height: 1440, focal: [0.77, 0.51], alt: null,
    marks: { broom: [0.77, 0.51] },
    provenance: hf("gpt_image_2_5 16:9 4k xhigh", 7, "3edb46de-7312-414f-bbac-9f0a1bbd12ed",
      "castle, Black Lake, ~22 floating candles, riderless broom; Play zone x 9-46% y 28-64% p95 0.0060"),
    accept: clean(["IC-HP-01", "IC-HP-02", "IC-HP-03", "IC-HP-04"]),
    fallback: "hero-volsurface", reduced: "poster",
    variants: { alt: "IN-01-alt" },
  },
  "IN-01m": {
    kind: "image", status: "accepted", src: "/media/films/intro-play-mobile.webp",
    width: 1290, height: 2281, focal: [0.5, 0.31], alt: null,
    marks: { broom: [0.5, 0.31] },
    provenance: hf("gpt_image_2_5 9:16 2k high", 2.75, "57484139-4999-4e06-90fe-1e09186cca34",
      "portrait play screen; castle upper-middle, broom at ~31% height; lower half p95 0.0048"),
    accept: clean(["IC-HP-01", "IC-HP-02", "IC-HP-03", "IC-HP-04"]),
    fallback: "IN-01", reduced: "poster",
    variants: { alt: "IN-01m-alt" },
  },
  /* The play screens WITHOUT their broom (the code flight's plate once the
     SVG broom has taken the plate broom's pose; SPEC §5.4). Same generation,
     broom removed by LOCAL inpainting (OpenCV xphoto shift-map in two
     passes + a warm-highlight clamp so the fill invents no lights; 0
     credits). Pixel-registered to IN-01 / IN-01m: the controller draws them
     only inside the feathered broom mask. Masters + scripts:
     research/build/media/masters/IN-01-empty/. */
  "IN-01-empty": {
    kind: "image", status: "accepted", src: "/media/films/intro-play-empty.webp",
    width: 2560, height: 1440, focal: [0.77, 0.51], alt: null,
    provenance: {
      source: "higgsfield", model: "gpt_image_2_5 16:9 4k xhigh (IN-01) + local OpenCV shift-map inpaint",
      credits: 0, date: "2026-09-28", jobId: "3edb46de-7312-414f-bbac-9f0a1bbd12ed",
      note: "IN-01 with the broom removed (mask = the intro-model BROOM handle + tail, dilated 7 px)",
    },
    accept: clean(["IC-HP-01", "IC-HP-02", "IC-HP-03"]),
    fallback: "IN-01", reduced: "poster",
  },
  "IN-01m-empty": {
    kind: "image", status: "accepted", src: "/media/films/intro-play-mobile-empty.webp",
    width: 1290, height: 2281, focal: [0.5, 0.31], alt: null,
    provenance: {
      source: "higgsfield", model: "gpt_image_2_5 9:16 2k high (IN-01m) + local OpenCV shift-map inpaint",
      credits: 0, date: "2026-09-28", jobId: "57484139-4999-4e06-90fe-1e09186cca34",
      note: "IN-01m with the broom removed (mask = the intro-model BROOM handle + tail, dilated 7 px)",
    },
    accept: clean(["IC-HP-01", "IC-HP-02", "IC-HP-03"]),
    fallback: "IN-01m", reduced: "poster",
  },
  "IN-02": {
    kind: "video", status: "accepted", src: "/media/films/intro-flight.mp4",
    webm: "/media/films/intro-flight.webm", poster: "IN-01", endsOn: "MV-01",
    width: 1920, height: 1080, durationS: 6.04, focal: [0.5, 0.5], alt: null,
    provenance: hf("kling3_0 pro 16:9 6s sound-off", 10.5, "c3f279c6-108a-4f75-ae70-a864a57fe5a6",
      "start IN-01, end MV-01; tail-anchored (last 0.33 s blended into MV-01, SSIM 0.985, 0 px); the broom exits through the top at ~4.6 s; G3 (Aryan) pending: pale-handle flag"),
    accept: clean(["IC-HP-01", "IC-HP-03", "IC-HP-04", "IC-PC-01"]),
    fallback: "IN-01", reduced: "hide",
    variants: { alt: "IN-02-alt" },
  },
  "IN-02-poster": {
    kind: "image", status: "accepted", src: "/media/films/intro-flight-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf("frame 0 of IN-02", 0, "c3f279c6-108a-4f75-ae70-a864a57fe5a6",
      "identical in content to IN-01; code may keep using IN-01 (already fetched)"),
    accept: clean(), fallback: "IN-01", reduced: "poster",
    variants: { alt: "IN-02-alt-poster" },
  },

  /* — Act I (pirates): the hero sea with the Black Pearl (SPEC §6) — */
  "MV-01": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea.webp",
    width: 2560, height: 1440, focal: [0.7, 0.5],
    focalBox: { x0: 0.49, x1: 0.96, y0: 0.46, y1: 0.6 },
    marks: { lantern: [0.893, 0.419], horizon: [0, 0.426] },
    // M2 fix (ART-DIRECTOR #3): the Black Pearl's silhouette (mast tips →
    // hull, the stern lantern), measured on the 2560 px web file. The hero
    // Lens frames focalBox (the crest) ∪ pearl; the ALT spyglass frames it.
    rects: { pearl: { x0: 0.862, x1: 0.896, y0: 0.375, y1: 0.428 } },
    alt: null,
    provenance: hf("gpt_image_2_5 16:9 4k xhigh", 7, "548e5fc0-1d27-4024-bbf4-98e85e018e0e",
      "the Act I anchor; crest aqua from x 0.485, bright body 0.60-0.96; name zone x 9-46% p95 0.0079; the Pearl's stern lantern is the one warm pixel"),
    accept: clean(["IC-PC-01", "IC-PC-08"]),
    fallback: "hero-volsurface", reduced: "poster",
    variants: { alt: "MV-01-alt" },
  },
  "MV-02": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea-mobile.webp",
    width: 1280, height: 1600, focal: [0.6, 0.5], alt: null,
    rects: { pearl: { x0: 0.758, x1: 0.81, y0: 0.31, y1: 0.347 } }, // M2 fix: the Pearl (ART-DIRECTOR #3)
    provenance: hf("gpt_image_2_5 4:5 2k high", 2.75, "10b81664-5614-4298-9601-17ae26c50073",
      "hero mobile 4:5; crest xp02 0.268 / xp98 0.939; ship + lantern kept"),
    accept: clean(["IC-PC-01", "IC-PC-08"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-02-alt" },
  },
  "MV-03": {
    kind: "video", status: "accepted", src: "/media/films/hero-sea-loop.mp4",
    webm: "/media/films/hero-sea-loop.webm", poster: "MV-01", endsOn: "MV-01",
    width: 1920, height: 1080, durationS: 8, focal: [0.7, 0.5],
    focalBox: { x0: 0.49, x1: 0.96, y0: 0.46, y1: 0.6 }, alt: null,
    provenance: hf("kling3_0 pro 16:9 8s sound-off", 14, "764ca916-286d-41a4-b06f-81f36fd06c92",
      "start = end = MV-01 (encoded reg 0.982/0.975, join 0.987, 0 px shift); x<50% static; the lantern flickers softly (director); wrap step ~2 frames (Aryan to watch) · P3 (2026-10-01): re-seamed P3 (residual ramp K=24, one keyframe per loop): web join mp4 0.9905 / webm 0.9976 (was 0.9879 / 0.9891); H.264 2.09 MB / VP9 1.28 MB (docs/build/media-staged/p3/accepted/reseam/hero-sea-loop.json)"),
    accept: clean(["IC-PC-01", "IC-PC-08"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-03-alt" },
  },
  "MV-03-poster": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf("frame 0 of MV-03", 0, "764ca916-286d-41a4-b06f-81f36fd06c92",
      "frame 0 of the loop; code keeps MV-01 (the priority poster) as the loop's poster · P3 (2026-10-01): frame 0 of the re-seam (= the pinned plate frame src[0])"),
    accept: clean(), fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-03-alt-poster" },
  },

  /* == ALTERNATES (M1.5) ==================================================
     The runner-up of each batch (Aryan's answer: "use the runner-up from
     each generation batch as the alternate"; 0 extra credits). Each one's
     LOG verdict is in its note. Masters stay in research/build/media/masters/;
     copies of these web files are in research/build/media/accepted/alt/. */
  "IN-01-alt": {
    kind: "image", status: "accepted", src: "/media/films/intro-play-alt.webp",
    width: 2560, height: 1440, focal: [0.73, 0.49], alt: null,
    marks: { broom: [0.73, 0.49] },
    provenance: hf("nano_banana_pro 16:9 4k", 4, "23581665-f640-4588-9b77-071588d8dd0a",
      "IN-01 batch runner-up (LOG: 'Alternate (not chosen)': softer, purple-navy grade); 5504x3072 centre-cropped to 16:9. NOT pixel-registered to IN-01 / IN-02: the code flight needs its own BROOM numbers (approx. tip 0.544,0.390 -> end 0.918,0.583) and the IN-02 video does not start on it"),
    accept: cleanAlt(["IC-HP-01", "IC-HP-02", "IC-HP-03", "IC-HP-04"]),
    variantOf: "IN-01", fallback: "IN-01", reduced: "poster",
  },
  "IN-01m-alt": {
    kind: "image", status: "accepted", src: "/media/films/intro-play-mobile-alt.webp",
    width: 1290, height: 2281, focal: [0.49, 0.48], alt: null,
    marks: { broom: [0.49, 0.48] },
    provenance: hf("nano_banana_pro 9:16 2k", 2, "89b7ca3f-afff-4008-9116-78d5e4c022bd",
      "IN-01m batch runner-up (LOG: 'Alternate': immersive, large centred castle; the broom sits at ~48% height, the brief was 32%); 1536x2752 centre-cropped to IN-01m's 1290:2281. Broom approx. tip 0.125,0.430 -> end 0.850,0.540 (needs its own BROOM numbers)"),
    accept: cleanAlt(["IC-HP-01", "IC-HP-02", "IC-HP-03", "IC-HP-04"]),
    variantOf: "IN-01m", fallback: "IN-01m", reduced: "poster",
  },
  "IN-02-alt": {
    kind: "video", status: "accepted", src: "/media/films/intro-flight-alt.mp4",
    webm: "/media/films/intro-flight-alt.webm", poster: "IN-01", endsOn: "MV-01",
    width: 1920, height: 1080, durationS: 6.04, focal: [0.5, 0.5], alt: null,
    provenance: hf("kling3_0 pro 16:9 6s sound-off (v3 prompt)", 10.5, "9503416d-4ef3-4612-82be-479db735895a",
      "IN-02 'Alternate 1' (LOG): start IN-01, end MV-01; dark-wood handle and a real cloud-deck dive, BUT at ~3.4 s the broom plunges into the crest and a spray puff lingers to ~5 s (reads as a splash-down). NOT tail-anchored: web encode first 0.986 vs IN-01, last 0.957 vs MV-01 (960x540 SSIM), so land with the crossfade. H.264 3.18 MB / VP9 1.75 MB, 0 audio, faststart"),
    accept: cleanAlt(["IC-HP-01", "IC-HP-03", "IC-HP-04", "IC-PC-01"]),
    variantOf: "IN-02", fallback: "IN-02", reduced: "hide",
  },
  "IN-02-alt-poster": {
    kind: "image", status: "accepted", src: "/media/films/intro-flight-alt-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf("frame 0 of IN-02-alt", 0, "9503416d-4ef3-4612-82be-479db735895a",
      "frame 0 (0.986 vs IN-01); code may keep using IN-01 as the poster"),
    accept: cleanAlt(), variantOf: "IN-02-poster", fallback: "IN-02-poster", reduced: "poster",
  },
  "MV-01-alt": {
    // M2: REJECTED and parked (status "received" = on disk, never played).
    // No acceptable MV-01 ALT exists (M2-MEDIA-REPORT §5): IN-02, MV-03,
    // MV-04, MV-05 and LINE_D are all registered to MV-01, so the hero plays
    // the DEFAULT plate under both variants and differs in choreography
    // (RECOGNIZABILITY S03). resolveVariant("MV-01", "alt") -> MV-01.
    kind: "image", status: "received", src: "/media/films/hero-sea-alt.webp",
    width: 2560, height: 1440, focal: [0.74, 0.52],
    focalBox: { x0: 0.53, x1: 0.98, y0: 0.46, y1: 0.6 },
    marks: { lantern: [0.897, 0.417], horizon: [0, 0.426] },
    alt: null,
    provenance: hf("nano_banana_pro 16:9 4k (Route A)", 4, "00c4c97b-4281-4691-ac3c-d398980a9d02",
      "MV-01 batch runner-up (LOG verdict 'Reject': purple cast in the sky, loud moon glow top-right; crest body from x 0.532, running to the right edge); 5504x3072 centre-cropped to 16:9. focalBox measured on this file (aqua mask, calibrated against MV-01's). MV-03 and MV-03-alt are registered to MV-01, NOT to this plate. M2: parked as a reject (status received)"),
    accept: cleanAlt(["IC-PC-01", "IC-PC-08"]),
    variantOf: "MV-01", fallback: "MV-01", reduced: "poster",
  },
  "MV-02-alt": {
    // M2 alt2: replaces the rejected M1.5 runner-up (nbp 84001a3b), per
    // M2-MEDIA-REPORT §6.6 and RECOGNIZABILITY S03. Lantern not re-measured.
    kind: "image", status: "accepted", src: "/media/films/hero-sea-mobile-alt2.webp",
    width: 1280, height: 1600, focal: [0.6, 0.5], alt: null,
    rects: { pearl: { x0: 0.754, x1: 0.805, y0: 0.343, y1: 0.378 } }, // M2 fix: the Pearl (the ALT spyglass)
    provenance: hf2("gpt_image_2_5 4:5 2k high (ref MV-01)", 2.75, "37eb75b2-d3b1-48c5-97df-787555f63abd",
      "MV-02 alt2 (extra run; the nbp runner-ups were rejects): crest xp02 0.306 / xp98 0.924; top 8% p95 0.0070; bottom 22% p95 0.0023; ship clean at 2.5x"),
    accept: cleanM2(["IC-PC-01", "IC-PC-08"]),
    variantOf: "MV-02", fallback: "MV-02", reduced: "poster",
  },
  "MV-03-alt": {
    // M2 alt2: replaces the rejected minimax runner-up (ebb7db32).
    kind: "video", status: "accepted", src: "/media/films/hero-sea-loop-alt2.mp4",
    webm: "/media/films/hero-sea-loop-alt2.webm", poster: "MV-01", endsOn: "MV-01",
    width: 1920, height: 1080, durationS: 8, focal: [0.7, 0.5],
    focalBox: { x0: 0.49, x1: 0.96, y0: 0.46, y1: 0.6 }, alt: null,
    provenance: hf2("kling3_0 pro 16:9 8s sound-off", 14, "f5130107-5bde-46a1-84b4-094c1b72fc4c",
      "MV-03 alt2 (extra run): start = end = MV-01; first/last 0.987 / 0.986, join 0.995 (web MP4 0.975); left half <= 0.41/255; lantern peak +-2.3%; calmer (crest amplitude ~57% of the default). H.264 0.66 MB / VP9 0.35 MB, silent · P3 (2026-10-01): re-seamed P3 (residual ramp K=24, one keyframe per loop): web join mp4 0.9956 / webm 0.9997 (was 0.9948 / 0.9936); H.264 0.64 MB / VP9 0.24 MB (docs/build/media-staged/p3/accepted/reseam/hero-sea-loop-alt2.json)"),
    accept: cleanM2(["IC-PC-01", "IC-PC-08"]),
    variantOf: "MV-03", fallback: "MV-03", reduced: "poster",
  },
  "MV-03-alt-poster": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea-loop-alt2-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf2("frame 0 of MV-03-alt (alt2)", 0, "f5130107-5bde-46a1-84b4-094c1b72fc4c",
      "frame 0; code keeps MV-01 as the loop's poster · P3 (2026-10-01): frame 0 of the re-seam (= the pinned plate frame src[0])"),
    accept: cleanM2(), variantOf: "MV-03-poster", fallback: "MV-03-poster", reduced: "poster",
  },

  /* == M2 MEDIA (lanes A + B; M2-MEDIA-REPORT) ==========================
     ACCEPTED 2026-09-29 (Check L2: Claude 09-29, Aryan pending). Every
     DEFAULT names its ALT (`variants.alt`); job ids from LEDGER-laneA/B.
     `codeAlt` strings are kept on the entries that had one: they document
     what the consumer draws if the asset is ever parked again. -- */

  /* — Act I (pirates): the storm, the voyage stills and sequence — */
  "MV-04": {
    kind: "image", status: "accepted", src: "/media/films/storm.webp",
    width: 2560, height: 1440, focal: [0.7, 0.5], alt: null,
    marks: { horizon: [0, 0.423] },
    provenance: hf2("gpt_image_2_5 16:9 4k xhigh (edit of MV-01)", 7, "350f546b-fb55-4549-820c-3e052999cfc4",
      "the hero's camera in a night squall: no ship, lantern or lightning; the kraken mass reads as a swell under the foam (IC-PC-05 egg); horizon -0.28% vs MV-01; crest centreline median 1.7% / p90 4.5%; 0 warm px. LINE_D re-check pending lib/line.ts"),
    accept: cleanM2(["IC-PC-05", "IC-PC-08"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-04-alt" },
  },
  "MV-04-alt": {
    kind: "image", status: "accepted", src: "/media/films/storm-alt.webp",
    width: 2560, height: 1440, focal: [0.7, 0.5], alt: null,
    marks: { horizon: [0, 0.426] },
    provenance: hf2("gpt_image_2_5 16:9 4k xhigh (edit of MV-01)", 7, "a0060b78-f625-4ea9-a38d-768ff6653ad1",
      "ALT: horizon 0; centreline median 3.0% / p90 5.75% (marginal); 26% brighter mean than MV-01"),
    accept: cleanM2(["IC-PC-05", "IC-PC-08"]),
    variantOf: "MV-04", fallback: "MV-04", reduced: "poster",
  },
  "MV-05a": {
    kind: "image", status: "accepted", src: "/media/films/voyage-a.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.431] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01)", 4.25, "6ce86233-1be6-4d6a-b6b3-535932a1609a",
      "Port Royal harbour at night: piers, lanterns, masts; quays empty at 2.5x gain; JV-1 start"),
    accept: cleanM2(["IC-PC-11"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-05a-alt" },
  },
  "MV-05a-alt": {
    kind: "image", status: "accepted", src: "/media/films/voyage-a-alt.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.437] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01)", 4.25, "8af307c9-a43d-4d71-8f54-3653a0b2c373",
      "ALT: horizon +1.2% vs the set mean (marginal). Swapping any MV-05 still to its ALT breaks the JV sequence at that beat"),
    accept: cleanM2(["IC-PC-11"]),
    variantOf: "MV-05a", fallback: "MV-05a", reduced: "poster",
  },
  "MV-05b": {
    kind: "image", status: "accepted", src: "/media/films/voyage-b.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.45] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01, regen 1)", 4.25, "57a84723-17e6-4bb8-8314-543e3cd92acd",
      "the fog around Isla de Muerta: real fog, soft horizon ~0.45, mean lum 0.032"),
    accept: cleanM2(),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-05b-alt" },
  },
  "MV-05b-alt": {
    kind: "image", status: "accepted", src: "/media/films/voyage-b-alt.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01, regen 1)", 4.25, "c864d744-01d9-4120-a647-86039426caa7",
      "ALT: fog with a brighter moon glow (mean 0.041)"),
    accept: cleanM2(),
    variantOf: "MV-05b", fallback: "MV-05b", reduced: "poster",
  },
  "MV-05c": {
    kind: "image", status: "accepted", src: "/media/films/voyage-c.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.425] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01)", 4.25, "bcb620aa-274b-4c74-bcff-a7b02686c467",
      "the squall (The break): squall wall, one aqua glint, no vessel, no lightning"),
    accept: cleanM2(["IC-PC-08"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-05c-alt" },
  },
  "MV-05c-alt": {
    kind: "image", status: "accepted", src: "/media/films/voyage-c-alt.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.428] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01)", 4.25, "3c50b647-5060-442c-a40a-a13e37e3fbb4", "ALT"),
    accept: cleanM2(["IC-PC-08"]),
    variantOf: "MV-05c", fallback: "MV-05c", reduced: "poster",
  },
  "MV-05d": {
    kind: "image", status: "accepted", src: "/media/films/voyage-d.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.419] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01)", 4.25, "f73d3e86-05ea-424c-a04d-53544952cbe1",
      "first light WITH the distant ship (a silhouette: no crew, flag or lettering at 100%); the DEFAULT (MEDIA-PLAN Q6, RECOGNIZABILITY S06); JV-3 end"),
    accept: cleanM2(["IC-PC-01"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-05d-alt" },
  },
  "MV-05d-alt": {
    kind: "image", status: "accepted", src: "/media/films/voyage-d-alt.webp",
    width: 2560, height: 1440, alt: null, marks: { horizon: [0, 0.42] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-01)", 4.25, "fe8963a1-c8bc-49f9-9bf6-9862de6a673f",
      "ALT: first light, empty sea (no ship). Swapping it in breaks the JV sequence's last beat"),
    accept: cleanM2(),
    variantOf: "MV-05d", fallback: "MV-05d", reduced: "poster",
  },
  JV: {
    kind: "sequence", status: "accepted", src: "/media/films/voyage-seq/", frames: 72,
    width: 1280, height: 720, alt: null,
    provenance: hf2("kling3_0 pro 16:9 5s sound-off x3 -> 72 webp frames", 26.25, "ab5526ac-c3ea-4ed4-9e99-2266da0b0333",
      "JV-1 ab5526ac (MV-05a -> b, frames 0-24) + JV-2 169d76b5-d55a-4556-b841-6d004bf0967e (b -> c, 24-47; end SSIM 0.910 < 0.93 on texture only, <= 1 px: TAIL-ANCHORED) + JV-3 ee674bcf-b6c0-49ce-a444-0951f4ce0555 (c -> d, 48-71; 0.929). 1.47 MB, max frame 46 KB; largest luminance step 5.6/255"),
    accept: cleanM2(["IC-PC-11", "IC-PC-08", "IC-PC-01"]),
    fallback: "MV-05a", reduced: "poster",
    variants: { alt: "JV-alt" },
  },
  "JV-alt": {
    kind: "sequence", status: "accepted", src: "/media/films/voyage-seq-alt/", frames: 72,
    width: 1280, height: 720, alt: null,
    provenance: hf2("kling3_0 pro 16:9 5s sound-off x3 -> 72 webp frames", 26.25, "bf8f2262-d610-4a77-8722-8be6050da54b",
      "ALT: JV-1 bf8f2262 + JV-2 64a0052d-37af-4ddf-aac6-53d33255ea4c (end SSIM 0.899, tail-anchored) + JV-3 8c75dd34-e51a-45d2-a145-d7bd1a2b65ea; neon-aqua overshoot at frames 55-66; 1.61 MB. Built on the DEFAULT stills (MV-05a-d)"),
    accept: cleanM2(["IC-PC-11", "IC-PC-08", "IC-PC-01"]),
    variantOf: "JV", fallback: "JV", reduced: "poster",
  },

  /* — Act II (idiots): the dawn board — */
  "MV-06": {
    kind: "image", status: "accepted", src: "/media/films/board-dawn.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 2k high (edit of 1935fc6f)", 2.75, "4686928b-b125-419b-aa30-af1b607c5b0e",
      "the wiped chalkboard under stone colonnade windows at dawn (IC-3I-09); board interior left 60%: p95 0.013, SD 5.0; the beam confined right of 65%; no ghost text at 6x gain"),
    accept: cleanM2(["IC-3I-01", "IC-3I-09"]),
    codeAlt: "a CSS board (--idi-canvas + a 4% grid); the seam card uses its storm plate", reduced: "poster",
    variants: { alt: "MV-06-alt" },
  },
  "MV-06-alt": {
    // "received", NOT accepted: it fails board evenness. The gauntlet's ALT
    // variant plays the DEFAULT board until Aryan accepts this one
    // (M2-MEDIA-REPORT §6.1, RECOGNIZABILITY S08) — flip to "accepted" then.
    kind: "image", status: "received", src: "/media/films/board-dawn-alt.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 2k xhigh", 4.5, "1935fc6f-82b8-47ee-8ac7-a191d371f116",
      "ALT, FAILS check 1: left-60% SD 12.5 > 6 (the diagonal beam); p95 0.038 ok, local SD 2.8 ok; the stronger 'morning' read"),
    accept: cleanM2(["IC-3I-01", "IC-3I-09"]),
    variantOf: "MV-06", fallback: "MV-06", reduced: "poster",
  },

  /* — Act III (rdr2): the frontier, the campfire — */
  "MV-10": {
    kind: "image", status: "accepted", src: "/media/films/frontier-dusk.webp",
    width: 2560, height: 1440, focal: [0.78, 0.45], alt: null,
    // the low sun: card II->III sinks its sprite onto it (cards builder, measured)
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { sun: [0.8125, 0.2185], horizon: [0, 0.333] },
    provenance: hf2("gpt_image_2_5 16:9 2k high (edit of e0987388)", 2.75, "32281e86-6f1d-4db7-8bb5-73eb276e6618",
      "the Heartlands at golden hour: a riderless horse (clean at 200%), a river; left 45% x y 25-75% p95 0.0059; the rdr2 anchor (card II->III settled state = the Beyond band, a declared reuse)"),
    accept: cleanM2(["IC-RD-05", "IC-RD-06"]),
    codeAlt: "the tintype develops into a CSS golden-hour ground with the code low sun (card III)", reduced: "poster",
    variants: { alt: "MV-10-alt" },
  },
  "MV-10-alt": {
    kind: "image", status: "accepted", src: "/media/films/frontier-dusk-alt.webp",
    width: 2560, height: 1440, focal: [0.78, 0.45], alt: null,
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { horizon: [0, 0.333] },
    provenance: hf2("gpt_image_2_5 16:9 2k high (edit of e0987388)", 2.75, "c249b137-3f83-4bc7-9f0f-33ce136af6ce",
      "ALT: left45 p95 0.0073 (the sub-band x .30-.45 x y .25-.45 is 0.106)"),
    accept: cleanM2(["IC-RD-05", "IC-RD-06"]),
    variantOf: "MV-10", fallback: "MV-10", reduced: "poster",
  },
  "MV-10m": {
    kind: "image", status: "accepted", src: "/media/films/frontier-dusk-mobile.webp",
    width: 1280, height: 1600, alt: null,
    provenance: hf2("gpt_image_2_5 4:5 2k high (ref MV-10, regen 1)", 2.75, "8f6f4c4f-a360-46a7-9836-e44f3200df50",
      "frontier mobile 4:5; the horse clean at 200% (the first pair was rejected: a two-headed horse, a cut-off horse)"),
    accept: cleanM2(["IC-RD-05", "IC-RD-06"]),
    fallback: "MV-10", reduced: "poster",
    variants: { alt: "MV-10m-alt" },
  },
  "MV-10m-alt": {
    kind: "image", status: "accepted", src: "/media/films/frontier-dusk-mobile-alt.webp",
    width: 1280, height: 1600, alt: null,
    provenance: hf2("gpt_image_2_5 4:5 2k high (ref MV-10, regen 1)", 2.75, "76920a65-e7d1-468a-9bdf-850f8cbec21c", "ALT"),
    accept: cleanM2(["IC-RD-05", "IC-RD-06"]),
    variantOf: "MV-10m", fallback: "MV-10m", reduced: "poster",
  },
  "MV-11": {
    kind: "image", status: "accepted", src: "/media/films/campfire.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-10)", 4.25, "a2e95902-b79b-4402-9057-6a74d51e4233",
      "the campfire in a stone ring, two tents behind; left 55% p95 0.0038, SD 3.75; MV-11L start/end. RECOGNIZABILITY S16: the Voices ALT (iconic-camp is the default)"),
    accept: cleanM2(["IC-RD-04"]),
    codeAlt: "the R-6 code campfire on --rd-deep (Voices)", reduced: "poster",
    variants: { alt: "MV-11-alt" },
  },
  "MV-11-alt": {
    kind: "image", status: "accepted", src: "/media/films/campfire-alt.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-10)", 4.25, "dc902346-fc12-4423-82be-9af37e12f247",
      "ALT: fire centroid x 0.735 (range 0.74-0.82, marginal); left 55% p95 0.0030, SD 3.30. MV-11L-alt is registered to MV-11, not to this plate"),
    accept: cleanM2(["IC-RD-04"]),
    variantOf: "MV-11", fallback: "MV-11", reduced: "poster",
  },
  "MV-11L": {
    kind: "video", status: "accepted", src: "/media/films/campfire-loop.mp4",
    webm: "/media/films/campfire-loop.webm", poster: "MV-11", endsOn: "MV-11",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hf2("kling3_0 pro 16:9 8s sound-off", 14, "d4086e11-bb78-451d-ae83-438b841f3a4c",
      "start = end = MV-11; web join 0.970; silent; passes every flash check. H.264 0.54 MB / VP9 0.24 MB · P3 (2026-10-01): re-seamed P3 (residual ramp K=12, one keyframe per loop): web join mp4 0.9959 / webm 0.9992 (was 0.9948 / 0.9941); H.264 0.59 MB / VP9 0.22 MB (docs/build/media-staged/p3/accepted/reseam/campfire-loop.json)"),
    accept: cleanM2(["IC-RD-04"]),
    fallback: "MV-11", reduced: "poster",
    variants: { alt: "MV-11L-alt" },
  },
  "MV-11L-alt": {
    kind: "video", status: "accepted", src: "/media/films/campfire-loop-alt.mp4",
    webm: "/media/films/campfire-loop-alt.webm", poster: "MV-11", endsOn: "MV-11",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hf2("kling3_0 pro 16:9 8s sound-off", 14, "8d687e50-6273-4711-a462-d03cc7ab5531",
      "ALT: start = end = MV-11 (the DEFAULT plate); web join 0.973; BORDERLINE: ground glow 16.6% (limit 15) and <= 3/s reversals on a very dark mean · P3 (2026-10-01): re-seamed P3 (residual ramp K=12, one keyframe per loop): web join mp4 0.9962 / webm 0.9993 (was 0.995 / 0.9943); H.264 0.66 MB / VP9 0.25 MB (docs/build/media-staged/p3/accepted/reseam/campfire-loop-alt.json)"),
    accept: cleanM2(["IC-RD-04"]),
    variantOf: "MV-11L", fallback: "MV-11L", reduced: "poster",
  },
  "MV-11L-poster": {
    kind: "image", status: "accepted", src: "/media/films/campfire-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf2("frame 0 of MV-11L", 0, "d4086e11-bb78-451d-ae83-438b841f3a4c", "frame 0; code keeps MV-11 as the loop's poster · P3 (2026-10-01): frame 0 of the re-seam (= the pinned plate frame src[0])"),
    accept: cleanM2(), fallback: "MV-11", reduced: "poster",
    variants: { alt: "MV-11L-alt-poster" },
  },
  "MV-11L-alt-poster": {
    kind: "image", status: "accepted", src: "/media/films/campfire-loop-alt-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf2("frame 0 of MV-11L-alt", 0, "8d687e50-6273-4711-a462-d03cc7ab5531", "frame 0 · P3 (2026-10-01): frame 0 of the re-seam (= the pinned plate frame src[0])"),
    accept: cleanM2(), variantOf: "MV-11L-poster", fallback: "MV-11L-poster", reduced: "poster",
  },

  /* — Act IV (hp): the hall of lights, the last light — */
  "MV-07": {
    kind: "image", status: "accepted", src: "/media/films/lights-line.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 4k xhigh", 7, "5155788f-adb3-410a-bd57-b462456ba723",
      "the enchanted hall of lights: floating candles densest along the Line; no people, tables, banners or crests; left 40% p95 0.024; flame ridge vs the provisional LINE_D 14/15 bands within +-6% (re-run tools/laneB_ridge.py once lib/line.ts lands). RECOGNIZABILITY S17: card III->IV at p .7-.85, then iconic-hall"),
    accept: cleanM2(["IC-HP-03", "IC-HP-16"]),
    codeAlt: "the ignition's final frame in code: the candles lit along the Line (card IV)", reduced: "poster",
    variants: { alt: "MV-07-alt" },
  },
  "MV-07-alt": {
    kind: "image", status: "accepted", src: "/media/films/lights-line-alt.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("nano_banana_pro 16:9 4k (5504x3072 -> 2560x1440)", 4, "c9c70e36-728b-437d-b670-9ce6078c0c36",
      "ALT: ridge 13/15 (max 0.08), centroid 15/15; bluer windows; left 40% p95 0.020"),
    accept: cleanM2(["IC-HP-03", "IC-HP-16"]),
    variantOf: "MV-07", fallback: "MV-07", reduced: "poster",
  },
  "MV-08": {
    kind: "image", status: "accepted", src: "/media/films/last-light.webp",
    width: 2560, height: 1440, alt: null,
    // the candle flame: the contact monogram stands on it (act4 builder, measured)
    marks: { flame: [0.868, 0.428] },
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-07)", 4.25, "b31ef3f6-2456-48eb-b0f2-e546c474a149",
      "one floating candle far right at the end of a fading trail of lights; FLAG (disclosed): the trail runs left to x ~0.44, darkness still passes (left 65% p95 0.0016, SD 2.72); MV-09 start/end"),
    accept: cleanM2(["IC-HP-03"]),
    codeAlt: "the InkCandle drawing on --hp-deep (Contact)", reduced: "poster",
    variants: { alt: "MV-08-alt" },
  },
  "MV-08-alt": {
    kind: "image", status: "accepted", src: "/media/films/last-light-alt.webp",
    width: 2560, height: 1440, alt: null,
    provenance: hf2("gpt_image_2_5 16:9 4k high (ref MV-07, regen 1)", 4.25, "47e9a970-dde7-41aa-b082-8055ca573fc3",
      "ALT: trail 0.63-0.80, nothing left of 62%; but the nearest trail candle is 4.8% from the flame (calm +-8% fails). MV-09 exists for the DEFAULT plate only"),
    accept: cleanM2(["IC-HP-03"]),
    variantOf: "MV-08", fallback: "MV-08", reduced: "poster",
  },
  "MV-09": {
    kind: "video", status: "accepted", src: "/media/films/last-light-loop.mp4",
    webm: "/media/films/last-light-loop.webm", poster: "MV-08", endsOn: "MV-08",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hf2("kling3_0 pro 16:9 8s sound-off", 14, "154f82ce-aa27-4328-abb8-b2e43bc44911",
      "start = end = MV-08; the flame breathes 3.8%, no flicker (the ~10 Hz take b1fed92b was rejected); web join 0.975; silent · P3 (2026-10-01): re-seamed P3 (residual ramp K=12, one keyframe per loop): web join mp4 0.9982 / webm 1 (was 0.9972 / 0.9978); H.264 0.46 MB / VP9 0.08 MB (docs/build/media-staged/p3/accepted/reseam/last-light-loop.json)"),
    accept: cleanM2(["IC-HP-03"]),
    fallback: "MV-08", reduced: "poster",
    variants: { alt: "MV-09-alt" },
  },
  "MV-09-alt": {
    kind: "video", status: "accepted", src: "/media/films/last-light-loop-alt.mp4",
    webm: "/media/films/last-light-loop-alt.webm", poster: "MV-08", endsOn: "MV-08",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hf2("kling3_0 pro 16:9 8s sound-off", 14, "634151ff-7928-49c4-b113-03c2a9fcce4d",
      "ALT: start = end = MV-08 (the DEFAULT plate); nearly still (flame breathing ~1.6%); web join 0.977 · P3 (2026-10-01): re-seamed P3 (residual ramp K=12, one keyframe per loop): web join mp4 0.9985 / webm 1 (was 0.9973 / 0.9977); H.264 0.39 MB / VP9 0.08 MB (docs/build/media-staged/p3/accepted/reseam/last-light-loop-alt.json)"),
    accept: cleanM2(["IC-HP-03"]),
    variantOf: "MV-09", fallback: "MV-09", reduced: "poster",
  },
  "MV-09-poster": {
    kind: "image", status: "accepted", src: "/media/films/last-light-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf2("frame 0 of MV-09", 0, "154f82ce-aa27-4328-abb8-b2e43bc44911", "frame 0; code keeps MV-08 as the loop's poster · P3 (2026-10-01): frame 0 of the re-seam (= the pinned plate frame src[0])"),
    accept: cleanM2(), fallback: "MV-08", reduced: "poster",
    variants: { alt: "MV-09-alt-poster" },
  },
  "MV-09-alt-poster": {
    kind: "image", status: "accepted", src: "/media/films/last-light-loop-alt-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf2("frame 0 of MV-09-alt", 0, "634151ff-7928-49c4-b113-03c2a9fcce4d", "frame 0 · P3 (2026-10-01): frame 0 of the re-seam (= the pinned plate frame src[0])"),
    accept: cleanM2(), variantOf: "MV-09-poster", fallback: "MV-09-poster", reduced: "poster",
  },

  /* — Intermission: the films chapter screens (21:9; crop to 2.39:1 in
       code). F-3I / F-RD have bright skies: captions go UNDER the frame. — */
  "F-PC": {
    kind: "image", status: "accepted", src: "/media/films/films-pirates.webp",
    width: 2520, height: 1080, alt: null, marks: { lantern: [0.84, 0.555] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (ref MV-01)", 4.5, "8c581de2-0d87-4c9d-80b6-2593bc3793bc",
      "the Black Pearl at anchor in still black water at night; no flag, crew or hull lettering (100% crop); left 45% SD 7.74"),
    accept: cleanM2(["IC-PC-01"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "F-PC-alt" },
  },
  "F-PC-alt": {
    kind: "image", status: "accepted", src: "/media/films/films-pirates-alt.webp",
    width: 2520, height: 1080, alt: null, marks: { lantern: [0.836, 0.556] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (ref MV-01)", 4.5, "f86e2553-5b2b-4ffc-bbab-27a01e83c8e1", "ALT: left 45% SD 7.34"),
    accept: cleanM2(["IC-PC-01"]),
    variantOf: "F-PC", fallback: "F-PC", reduced: "poster",
  },
  "F-3I": {
    kind: "image", status: "accepted", src: "/media/films/films-idiots.webp",
    width: 2520, height: 1080, alt: null, marks: { scooter: [0.79, 0.62] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (ref MV-06)", 4.5, "a4ec7e96-84d8-4d8a-a6b9-b71c6547e72f",
      "the yellow scooter at Pangong lake at first light (no badge or plate at 100%); scooter at x ~0.79 (plan 0.72; y provisional); FLAG: left 45% SD 41.6 (the pale sky) -> captions under the frame"),
    accept: cleanM2(["IC-3I-10"]),
    fallback: "MV-06", reduced: "poster",
    variants: { alt: "F-3I-alt" },
  },
  "F-3I-alt": {
    kind: "image", status: "accepted", src: "/media/films/films-idiots-alt.webp",
    width: 2520, height: 1080, alt: null, marks: { scooter: [0.76, 0.6] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (text-only)", 4.5, "8b981679-0da7-4154-ac7e-3f274bb00a6c",
      "ALT: the sun disc and its reflection compete with the scooter as the warm point; left 45% SD 49.8"),
    accept: cleanM2(["IC-3I-10"]),
    variantOf: "F-3I", fallback: "F-3I", reduced: "poster",
  },
  "F-RD": {
    kind: "image", status: "accepted", src: "/media/films/films-rdr2.webp",
    width: 2520, height: 1080, alt: null, marks: { horse: [0.766, 0.42] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (text-only, regen 1)", 4.5, "7a6da513-4572-4785-b826-77b068747f54",
      "the Heartlands at dusk: a ridge in afterglow, riderless horses (4 legs, 1 head); regenerated WITHOUT the MV-10 ref (it copied MV-10's composition); FLAG: left 45% SD 23.7 (dusk sky) -> captions under the frame"),
    accept: cleanM2(["IC-RD-05", "IC-RD-06"]),
    codeAlt: "films chapter: the screen shows its world's code ground", reduced: "poster",
    variants: { alt: "F-RD-alt" },
  },
  "F-RD-alt": {
    kind: "image", status: "accepted", src: "/media/films/films-rdr2-alt.webp",
    width: 2520, height: 1080, alt: null, marks: { horse: [0.716, 0.436] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (text-only, regen 1)", 4.5, "f66a8f31-ade5-46f9-9baa-034678a0b386",
      "ALT: left 45% SD 19.0; horses confirmed on the master"),
    accept: cleanM2(["IC-RD-05", "IC-RD-06"]),
    variantOf: "F-RD", fallback: "F-RD", reduced: "poster",
  },
  "F-HP": {
    kind: "image", status: "accepted", src: "/media/films/films-hp.webp",
    width: 2520, height: 1080, alt: null, marks: { ink: [0.765, 0.64] },
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (ref MV-07)", 4.5, "0b8c414a-1f0f-4e70-b694-a22b320482f4",
      "enchanted ink branching on cream paper under floating candles (organic lines, not letters or a map), a soft castle glimpse through the far window (IC-HP-01); left 45% SD 4.74. RECOGNIZABILITY S12: the HP screen's ALT (iconic-express is its default)"),
    accept: cleanM2(["IC-HP-03", "IC-HP-01"]),
    codeAlt: "films chapter: the screen shows its world's code ground", reduced: "poster",
    variants: { alt: "F-HP-alt" },
  },
  "F-HP-alt": {
    kind: "image", status: "accepted", src: "/media/films/films-hp-alt.webp",
    width: 2520, height: 1080, alt: null,
    provenance: hf2("gpt_image_2_5 21:9 2k xhigh (ref MV-07)", 4.5, "0fcde977-b391-42af-bb48-bb35043d1fe6",
      "ALT: left 45% SD 8.19 (marginal; local SD 1.85)"),
    accept: cleanM2(["IC-HP-03"]),
    variantOf: "F-HP", fallback: "F-HP", reduced: "poster",
  },

  /* == ICONIC PLATES (M2-R recognizability lane; LEDGER-m2iconic) ==========
     One per scene that imagery alone must carry (RECOGNIZABILITY §7.2).
     Registered ACCEPTED (Claude L2 09-29; the lane finished before this
     integration), each keeping its planned fallback so parking one again
     is a one-word change. -- */
  "iconic-pearl": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pearl.webp",
    width: 2560, height: 1440, focal: [0.66, 0.45], alt: null,
    // provisional (Claude, 960 px): mastTop = the main mast's crow's nest (the
    // masts run off the top edge); mizzenTop; the lit stern windows; horizon.
    marks: {
      mastTop: [0.61, 0.05], mizzenTop: [0.755, 0.14], stern: [0.87, 0.6], horizon: [0, 0.8],
      // measured (cards builder): the stern flagstaff the Jolly Roger flies
      // from (the mast tops leave the 2.39 crop): its head and its foot
      ensign: [0.908, 0.3], ensignBase: [0.908, 0.456],
    },
    provenance: hf2(ICONIC, 7, "4273a1be-64f7-4c66-aabf-5b44710d490c",
      "S04 opening card: the Black Pearl close, three-quarter bow view, full tattered black sails, lit stern windows, deck lanterns, moon path, aqua wake. No crew, flag or figurehead; clean at 9x ghost gain. The Jolly Roger is added in code on a stern flagstaff (marks.ensign)"),
    accept: cleanM2(["IC-PC-01", "IC-PC-08"]),
    fallback: "F-PC", reduced: "poster",
    variants: { alt: "iconic-pearl-alt" },
  },
  "iconic-pearl-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pearl-alt.webp",
    width: 2560, height: 1440, focal: [0.63, 0.45], alt: null,
    marks: {
      mastTop: [0.67, 0.05], mizzenTop: [0.545, 0.2], stern: [0.9, 0.52], horizon: [0, 0.81],
      ensign: [0.93, 0.215], ensignBase: [0.93, 0.37],
    },
    provenance: hf2(ICONIC, 7, "c2967ce4-6951-4ea3-b003-2f194f54b2ec",
      "ALT: close stern-quarter galleon, tattered black sails, moon and aqua wake; a carved finial on the stern rail at ~1% of the frame (no face at 600%). Marks provisional"),
    accept: cleanM2(["IC-PC-01", "IC-PC-08"]),
    variantOf: "iconic-pearl", fallback: "iconic-pearl", reduced: "poster",
  },
  "iconic-ice": {
    kind: "image", status: "accepted", src: "/media/films/iconic-ice.webp",
    width: 2560, height: 1440, focal: [0.62, 0.3], alt: null,
    // boardRect measured by the lane; the chalk ledge is the board's bottom
    // edge, slanted in perspective (ledgeL -> ledgeR; provisional).
    rects: { boardRect: { x0: 0.389, x1: 0.961, y0: 0.091, y1: 0.41 } },
    marks: { ledgeL: [0.385, 0.34], ledgeR: [0.962, 0.415] },
    provenance: hf2(ICONIC, 7, "0e7a3d5c-2e37-4a53-b635-6a618e773405",
      "S07 card I->II incoming: the ICE lecture hall, tiered wooden benches, a huge blank green board on granite, a pergola corridor casting striped sun; board inner SD 9.2/255, no marks"),
    accept: cleanM2(["IC-3I-01", "IC-3I-09"]),
    fallback: "MV-06", reduced: "poster",
    variants: { alt: "iconic-ice-alt" },
  },
  "iconic-ice-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-ice-alt.webp",
    width: 2560, height: 1440, focal: [0.65, 0.35], alt: null,
    rects: { boardRect: { x0: 0.398, x1: 1, y0: 0.178, y1: 0.473 } },
    marks: { ledgeL: [0.39, 0.375], ledgeR: [1, 0.475] },
    provenance: hf2(ICONIC, 7, "950f30c7-8bb9-4782-82e6-a4f6a647e26f",
      "ALT: the same hall with a bench-style lecturer's table; board inner SD 8.8, no marks"),
    accept: cleanM2(["IC-3I-01", "IC-3I-09"]),
    variantOf: "iconic-ice", fallback: "iconic-ice", reduced: "poster",
  },
  /* M2 finish (2026-09-29): two more 3 Idiots plates (LOG "M2 finish · 3
     Idiots scenes"). Generated 13:04 UTC (4 × 7 cr); fetched, viewed and
     checked at 14:06 UTC once the environment allowed the Higgsfield CDN:
     no people / hands / faces, no signage, no legible text or pseudo-glyphs
     (full-res crops of the stopwatch dials = tick marks only; the pen's
     engraving = abstract waves). DEFAULT = the better of each pair. */
  "iconic-corridor": {
    kind: "image", status: "accepted", src: "/media/films/iconic-corridor.webp",
    width: 2560, height: 1440, focal: [0.46, 0.51], alt: null,
    provenance: hf2(ICONIC, 7, "14f08567-a7ea-4474-afda-050a12407aea",
      "S08 work head: the ICE stone corridor — rough granite wall (the calm dark left ~40%), massive square columns in long perspective, a concrete pergola casting bold striped morning sun, a bougainvillea courtyard; no people, no signage. focal = the vanishing point"),
    accept: cleanM2(["IC-3I-09"]),
    fallback: "iconic-ice", reduced: "poster",
    variants: { alt: "iconic-corridor-alt" },
  },
  "iconic-corridor-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-corridor-alt.webp",
    width: 2560, height: 1440, focal: [0.51, 0.51], alt: null,
    provenance: hf2(ICONIC, 7, "f71ce666-7b28-42db-b714-761832ac572c",
      "ALT: the same corridor, a longer and narrower run with finer pergola slats and more floor stripes; the courtyard trees brighter; no people, no signage"),
    accept: cleanM2(["IC-3I-09"]),
    variantOf: "iconic-corridor", fallback: "iconic-corridor", reduced: "poster",
  },
  "iconic-pen": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pen.webp",
    width: 2560, height: 1440, focal: [0.65, 0.6], alt: null,
    marks: { pen: [0.65, 0.6] },
    provenance: hf2(ICONIC, 7, "8ad09fd8-3fc2-439e-9e14-b8c31c71a929",
      "S11 kill-list head: Virus's astronaut pen (silver with abstract engraving, gold trim) in an open velvet-lined wooden case on a professor's desk, a silver stopwatch beside it (dial ticks only, no numerals), an ICE chalkboard behind; calm dark left ~40%; no people or text"),
    accept: cleanM2(["IC-3I-01"]),
    fallback: "MV-06", reduced: "poster",
    variants: { alt: "iconic-pen-alt" },
  },
  "iconic-pen-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pen-alt.webp",
    width: 2560, height: 1440, focal: [0.67, 0.59], alt: null,
    marks: { pen: [0.67, 0.59] },
    provenance: hf2(ICONIC, 7, "d8c90c09-68a4-4a09-b7c9-782bd2577575",
      "ALT: a larger case and pen, the stopwatch in the foreground right, the board darker; dial ticks only, no numerals; no people or text"),
    accept: cleanM2(["IC-3I-01"]),
    variantOf: "iconic-pen", fallback: "iconic-pen", reduced: "poster",
  },
  "iconic-drone": {
    kind: "image", status: "accepted", src: "/media/films/iconic-drone.webp",
    width: 2560, height: 1440, focal: [0.6, 0.47], alt: null,
    marks: { drone: [0.6, 0.47] },
    provenance: hf2(`${ICONIC} (edit of e979d365)`, 7, "69cafb24-6ff8-4408-a81f-0ab89821ebfe",
      "S10 systems band: Rancho's homemade quadcopter hovering in a sunlit stone-colonnade college courtyard; the PCB shows pads and traces only, the camera is plain, the tag is gone. IC-3I-08 sensitivity: no window or camera feed; never linked to Aryan's own drone work"),
    accept: cleanM2(["IC-3I-08", "IC-3I-09"]),
    fallback: "F-3I", reduced: "poster",
    variants: { alt: "iconic-drone-alt" },
  },
  "iconic-drone-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-drone-alt.webp",
    width: 2560, height: 1440, focal: [0.6, 0.47], alt: null,
    provenance: hf2(`${ICONIC} (edit of eb254302)`, 7, "07096f02-550d-472a-958e-b2ba002af637",
      "ALT: the PCB rows are header pins and parts (no glyph row); the blue battery is unlabelled"),
    accept: cleanM2(["IC-3I-08", "IC-3I-09"]),
    variantOf: "iconic-drone", fallback: "iconic-drone", reduced: "poster",
  },
  "iconic-camp": {
    kind: "image", status: "accepted", src: "/media/films/iconic-camp.webp",
    width: 2560, height: 1440, focal: [0.55, 0.55], alt: null,
    // `fire` is the hand-off point: the ignite card's embers rise from it
    // (RECOGNIZABILITY S16/S17). Provisional; the builder re-measures.
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { fire: [0.535, 0.68], lake: [0, 0.378], wheel: [0.8883, 0.5667], wheelR: [0.0375, 0.0722] },
    provenance: hf2(ICONIC, 7, "3c420eac-b80f-44ff-beae-c89b4e4bb3cb",
      "S16 voices default: the gang's camp at dusk: 3 horses at the rail facing camera (4 legs, 1 head each), a lit wall tent, a covered wagon, the fire with its tripod pot, the lake glinting at sunset; no people or lettering; lower-left p95 0.044"),
    accept: cleanM2(["IC-RD-04", "IC-RD-06"]),
    fallback: "MV-11", reduced: "poster",
    variants: { alt: "iconic-camp-alt" },
  },
  "iconic-camp-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-camp-alt.webp",
    width: 2560, height: 1440, focal: [0.6, 0.55], alt: null,
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { fire: [0.62, 0.71], lake: [0, 0.369], wheel: [0.4344, 0.5837], wheelR: [0.0195, 0.0517] },
    provenance: hf2(ICONIC, 7, "37726d77-ed0d-4777-8986-e84216079cfe",
      "ALT: the fire with its tripod pot, a covered wagon, A-frame and wall tents, 3 hitched horses from behind (4 legs each), the lake, sunset; no people or lettering"),
    accept: cleanM2(["IC-RD-04", "IC-RD-06"]),
    variantOf: "iconic-camp", fallback: "iconic-camp", reduced: "poster",
  },
  "iconic-wanted": {
    kind: "image", status: "accepted", src: "/media/films/iconic-wanted.webp",
    width: 2560, height: 1440, focal: [0.37, 0.47], alt: null,
    // the HTML handbill registers over the central blank poster (re-measured
    // at 2560 by the act3 builder + assembler: the paper's top edge is .165)
    rects: { posterRect: { x0: 0.255, x1: 0.493, y0: 0.165, y1: 0.748 } },
    provenance: hf2(ICONIC, 7, "3af08f65-9d2e-4d84-937d-91ea9fe2991c",
      "S14 handbill board: a shingle-roofed notice board with 5 blank aged posters on a golden-hour false-front street with no signs. WANTED is set in HTML (Rye), never in the plate"),
    accept: cleanM2(["IC-RD-03"]),
    codeAlt: "a CSS plank board (--rd-deep + 3 plank gradients + nails)", reduced: "poster",
    variants: { alt: "iconic-wanted-alt" },
  },
  "iconic-wanted-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-wanted-alt.webp",
    width: 2560, height: 1440, focal: [0.36, 0.48], alt: null,
    rects: { posterRect: { x0: 0.244, x1: 0.467, y0: 0.176, y1: 0.76 } },
    provenance: hf2(ICONIC, 7, "afe7b162-40c8-438a-b932-350b7480f3ba",
      "ALT: a larger board; all posters blank"),
    accept: cleanM2(["IC-RD-03"]),
    variantOf: "iconic-wanted", fallback: "iconic-wanted", reduced: "poster",
  },
  "iconic-deadeye": {
    kind: "image", status: "accepted", src: "/media/films/iconic-deadeye.webp",
    width: 2560, height: 1440, focal: [0.5, 0.5], alt: null,
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { oak: [0.2, 0.45], homestead: [0.66, 0.49], horizon: [0, 0.44] },
    provenance: hf2(ICONIC, 7, "0a60fa27-78e8-4340-8ddd-ca77858eed7a",
      "S13 ALT settled / SM-17 egg grade: a lone oak, a split-rail fence, a trail and a homestead with frozen birds under a heavy desaturated red-sepia grade and vignette (the Dead Eye look). No reticle, no figure; the X marks are code"),
    accept: cleanM2(["IC-RD-02", "IC-RD-05"]),
    fallback: "MV-10", reduced: "poster",
    variants: { alt: "iconic-deadeye-alt" },
  },
  "iconic-deadeye-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-deadeye-alt.webp",
    width: 2560, height: 1440, focal: [0.5, 0.5], alt: null,
    provenance: hf2(ICONIC, 7, "56c0a864-3e48-472e-8b1a-a6183c4ac10e",
      "ALT: the same icons in a vivid red sunset, less 'filtered'"),
    accept: cleanM2(["IC-RD-02", "IC-RD-05"]),
    variantOf: "iconic-deadeye", fallback: "iconic-deadeye", reduced: "poster",
  },
  "iconic-hall": {
    kind: "image", status: "accepted", src: "/media/films/iconic-hall.webp",
    width: 2560, height: 1440, focal: [0.5, 0.45], alt: null,
    // provisional: lineStart = where the Line's candle run enters the plate
    // (the builder re-measures against LINE_D once lib/line.ts lands)
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { window: [0.52, 0.33], highTable: [0.5, 0.63], lineStart: [0.08, 0.3], tableL: [0.398, 0.6385], tableR: [0.636, 0.6385] },
    provenance: hf2(ICONIC, 7, "1ef4355e-d82b-4513-a273-1cbdebbd8755",
      "S17 card III->IV settled (p > .85): the Great Hall: four long tables with gold plates, the high table, a tall central gothic window, the enchanted starry ceiling, hundreds of floating candles; no people, banners or crests; lower-left p95 0.088; clean at 9x ghost gain"),
    accept: cleanM2(["IC-HP-03", "IC-HP-16"]),
    fallback: "MV-07", reduced: "poster",
    variants: { alt: "iconic-hall-alt" },
  },
  "iconic-hall-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-hall-alt.webp",
    width: 2560, height: 1440, focal: [0.48, 0.45], alt: null,
    // P3 marks (M-AUX, measured at 2560: docs/build/media-staged/p3/marks.json; PHASE3-SPEC §7.2)
    marks: { window: [0.48, 0.35], highTable: [0.47, 0.64], lineStart: [0.08, 0.3], tableL: [0.321, 0.6306], tableR: [0.632, 0.6306] },
    provenance: hf2(ICONIC, 7, "0fd211fb-b4e9-4b19-ac70-3ac88bd8d771",
      "ALT: the same icons; slightly brighter lower-left (p95 0.105)"),
    accept: cleanM2(["IC-HP-03", "IC-HP-16"]),
    variantOf: "iconic-hall", fallback: "iconic-hall", reduced: "poster",
  },
  "iconic-express": {
    kind: "image", status: "accepted", src: "/media/films/iconic-express.webp",
    width: 2560, height: 1440, focal: [0.8, 0.55], alt: null,
    marks: { engine: [0.86, 0.58] },
    provenance: hf2(`${ICONIC} (edit of 30cb966e) + local OpenCV Telea retouch`, 7, "4c065bde-7166-496b-a481-6c34465683ab",
      "S12 films HP screen default: a red steam train crossing a curving many-arched viaduct over a loch in mist (the Hogwarts Express). The edit removed the carriage ciphers; a blank tender oval and a small cab plate were inpainted locally (2 masks <= 30 px, 0 credits). FLAG (L2 #4): recreates a famous landmark angle"),
    accept: cleanM2(),
    fallback: "F-HP", reduced: "poster",
    variants: { alt: "iconic-express-alt" },
  },
  "iconic-express-alt": {
    kind: "image", status: "accepted", src: "/media/films/iconic-express-alt.webp",
    width: 2560, height: 1440, focal: [0.8, 0.55], alt: null,
    provenance: hf2(`${ICONIC} (edit of 179e03ab)`, 7, "5d84e0b7-b33b-4156-ad6e-fa7df438fc33",
      "ALT: tender and cab plain; the carriages keep <= 5 px non-legible gold dots / handles at 2560"),
    accept: cleanM2(),
    variantOf: "iconic-express", fallback: "iconic-express", reduced: "poster",
  },

  /* == PHASE 3: LIVING LOOPS + SEQ-HALL (W1 assembler, 2026-10-01) ========
     PHASE3-PLAN §9.4. Every PASSING loop in docs/build/media-staged/p3/
     accepted/ (19 of 25; the FAIL records stay there): a `kind:"video"` row
     whose poster AND end frame are the plate (DP-5: `loopFor(plate)` finds
     it; hosts and stage cues name the plate, never the loop), `codeAlt:
     "code:plate-camera"` as its ALT (DP-8), the plate as `fallback`. Each
     loop's frame-0 still is registered beside it as "<id>-poster" (the
     registration record; code keeps the plate as the poster). Ids are the
     spec's loop ids (PHASE3-SPEC §6.3). SEQ-PEARL FAILED Check L2 (flash
     frames + figure-like silhouettes on the bow rail) and is NOT registered:
     the code push on L01 is the push-in #1 DEFAULT. Check L2: Claude ✓
     2026-10-01, Aryan pending. Ledger: docs/build/media/LEDGER-p3loops.md. */
  "L01": {
    kind: "video", status: "accepted", src: "/media/films/iconic-pearl-loop.mp4",
    webm: "/media/films/iconic-pearl-loop.webm", poster: "iconic-pearl", endsOn: "iconic-pearl",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hfP3("kling3_0 pro, 16:9, 8 s, sound off, medias = [start_image X, end_image X] (start = end = the plate); API echo cfg_scale 0.5, enhance_prompt false; declined_preset_id 24bae836 on every batch item", 14, "7adcbc7e-4ca8-413b-b16e-5400ea0dd79d",
      "L01 living loop on iconic-pearl (tier S; seam residual K=12; mp4 1947462 B / webm 1202049 B). PASS Motion: [object Object] FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/iconic-pearl-loop.json"),
    accept: cleanP3(["IC-PC-01", "IC-PC-08"]),
    codeAlt: "code:plate-camera", fallback: "iconic-pearl", reduced: "poster",
  },
  "L01-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pearl-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L01", 0, "7adcbc7e-4ca8-413b-b16e-5400ea0dd79d",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-pearl as the loop's poster"),
    accept: cleanP3(["IC-PC-01", "IC-PC-08"]), fallback: "iconic-pearl", reduced: "poster",
  },
  "L02": {
    kind: "video", status: "accepted", src: "/media/films/iconic-hall-loop.mp4",
    webm: "/media/films/iconic-hall-loop.webm", poster: "iconic-hall", endsOn: "iconic-hall",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hfP3("kling3_0 pro, 16:9, 8 s, sound off, medias = [start_image X, end_image X] (start = end = the plate); API echo cfg_scale 0.5, enhance_prompt false; declined_preset_id 24bae836 on every batch item", 14, "ba931cc6-a5b6-4ada-a891-e29e5c5c0364",
      "L02 living loop on iconic-hall (tier S; seam residual K=12; mp4 1170700 B / webm 492722 B). PASS (flagged: lineStart MP4 zone 1.16/255, see flags) Motion: [object Object] FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/iconic-hall-loop.json"),
    accept: cleanP3(["IC-HP-03", "IC-HP-16"]),
    codeAlt: "code:plate-camera", fallback: "iconic-hall", reduced: "poster",
  },
  "L02-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-hall-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L02", 0, "ba931cc6-a5b6-4ada-a891-e29e5c5c0364",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-hall as the loop's poster"),
    accept: cleanP3(["IC-HP-03", "IC-HP-16"]), fallback: "iconic-hall", reduced: "poster",
  },
  "L05": {
    kind: "video", status: "accepted", src: "/media/films/intro-play-loop.mp4",
    webm: "/media/films/intro-play-loop.webm", poster: "IN-01", endsOn: "IN-01",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, sound off, enhance_prompt false, start_image = end_image = the plate job", 14, "930949e7-1ce9-4072-8e66-0c15f9ed2693",
      "L05 living loop on IN-01 (tier S; seam residual K=12; mp4 508920 B / webm 237748 B). PASS (with the 0-credit broom hold-out): every check passes on both encodes; MP4 pass.join = \"codec\" (the IDR texture refresh), the motion seam is an ordinary step (lossless 0.9997, WebM 0.9998) Motion: Very restrained: whole-frame luma range 0.43-0.67 %; the candles do not visibly bob; candle flames and the lake reflections shimmer faintly (light zones ptp 0.5 … FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/intro-play-loop.json"),
    accept: cleanP3(["IC-HP-01", "IC-HP-02", "IC-HP-03", "IC-HP-04"]),
    codeAlt: "code:plate-camera", fallback: "IN-01", reduced: "poster",
  },
  "L05-poster": {
    kind: "image", status: "accepted", src: "/media/films/intro-play-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L05", 0, "930949e7-1ce9-4072-8e66-0c15f9ed2693",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps IN-01 as the loop's poster"),
    accept: cleanP3(["IC-HP-01", "IC-HP-02", "IC-HP-03", "IC-HP-04"]), fallback: "IN-01", reduced: "poster",
  },
  "L06": {
    kind: "video", status: "accepted", src: "/media/films/voyage-a-loop.mp4",
    webm: "/media/films/voyage-a-loop.webm", poster: "MV-05a", endsOn: "MV-05a",
    width: 1920, height: 1080, durationS: 8, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, sound off, enhance_prompt false, start_image = end_image = the plate job", 14, "fa569f31-6c24-4e47-8f10-7176e8ac857d",
      "L06 living loop on MV-05a (tier S; seam residual K=24; mp4 833976 B / webm 282606 B). PASS: every map check passes (quays empty, horizon level, lanterns <= 2 %, 0 flashes, silent); MP4 pass.join = \"codec\", lossless and WebM joins are ordinary steps (0.9993 / 0.9997) Motion: Very restrained: lantern reflections and water shimmer (light zones ptp 0.7-1.7 %, 0 reversals/s), cloud texture near the moon breathes … FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/voyage-a-loop.json"),
    accept: cleanP3(["IC-PC-11"]),
    codeAlt: "code:plate-camera", fallback: "MV-05a", reduced: "poster",
  },
  "L06-poster": {
    kind: "image", status: "accepted", src: "/media/films/voyage-a-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L06", 0, "fa569f31-6c24-4e47-8f10-7176e8ac857d",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps MV-05a as the loop's poster"),
    accept: cleanP3(["IC-PC-11"]), fallback: "MV-05a", reduced: "poster",
  },
  "L08": {
    kind: "video", status: "accepted", src: "/media/films/iconic-ice-loop.mp4",
    webm: "/media/films/iconic-ice-loop.webm", poster: "iconic-ice", endsOn: "iconic-ice",
    width: 1920, height: 1080, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, sound off, enhance_prompt false, start_image = end_image = the plate job", 10.5, "3d63bea9-97de-4a34-8615-387c0b4d723f",
      "L08 living loop on iconic-ice (tier S; seam residual K=12; mp4 773159 B / webm 237935 B). PASS: board blank and still (<= 0.81/255), benches still, 0 flashes, silent; MP4 pass.join = \"codec\", lossless and WebM joins at or above every natural step (0.9999 / 0.9999). Flag: near-still Motion: Near-still: the requested dust motes and pergola-shadow creep are not perceptible; max 16x9-tile change vs frame 0 is 3.6/255 (texture shimmer at edges and the  … FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/iconic-ice-loop.json"),
    accept: cleanP3(["IC-3I-01", "IC-3I-09"]),
    codeAlt: "code:plate-camera", fallback: "iconic-ice", reduced: "poster",
  },
  "L08-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-ice-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L08", 0, "3d63bea9-97de-4a34-8615-387c0b4d723f",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-ice as the loop's poster"),
    accept: cleanP3(["IC-3I-01", "IC-3I-09"]), fallback: "iconic-ice", reduced: "poster",
  },
  "L09": {
    kind: "video", status: "accepted", src: "/media/films/board-dawn-loop.mp4",
    webm: "/media/films/board-dawn-loop.webm", poster: "MV-06", endsOn: "MV-06",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro, 16:9, 6 s, sound off, medias = [start_image X, end_image X] (start = end); API echo mode pro, cfg_scale 0.5, enhance_prompt false; declined_preset_id 24bae836 on every batch item", 10.5, "0b1c8d95-2a02-4bc1-9962-710fa9f05cc7",
      "L09 living loop on MV-06 (tier I; seam residual K=12; mp4 190092 B / webm 172768 B). PASS: board interior left 60% still (0.50 WebM / 0.72 MP4 /255), blank at 4x gain; beam stays in place on the right (never spreads left), glow 12.9% at 0.17 Hz; 0 flashes, silent; lossless and WebM joins >= every natural step (0.9999 / 1.0000) … Motion: The beam carries it: its left edge narrows and returns once per loop (flow p99.9 up to 30 px along the soft edge, frames 54-78) … FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/board-dawn-loop.json"),
    accept: cleanP3(["IC-3I-01", "IC-3I-09"]),
    codeAlt: "code:plate-camera", fallback: "MV-06", reduced: "poster",
  },
  "L09-poster": {
    kind: "image", status: "accepted", src: "/media/films/board-dawn-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L09", 0, "0b1c8d95-2a02-4bc1-9962-710fa9f05cc7",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps MV-06 as the loop's poster"),
    accept: cleanP3(["IC-3I-01", "IC-3I-09"]), fallback: "MV-06", reduced: "poster",
  },
  "L10": {
    kind: "video", status: "accepted", src: "/media/films/iconic-corridor-loop.mp4",
    webm: "/media/films/iconic-corridor-loop.webm", poster: "iconic-corridor", endsOn: "iconic-corridor",
    width: 1920, height: 1080, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro, 16:9, 6 s, sound off, medias = [start_image X, end_image X] (start = end); API echo mode pro, cfg_scale 0.5, enhance_prompt false; declined_preset_id 24bae836 on every batch item", 10.5, "c6481b99-a3ce-4028-a768-88746a3083f3",
      "L10 living loop on iconic-corridor (tier S; seam residual K=12; mp4 818307 B / webm 456571 B). PASS (0-cr wall + column hold-out): wall 0.05/0.11 and columns <= 0.19 /255 (MP4/WebM); the shadow stripes creep and return; corridor and courtyard empty; 0 flashes, silent; lossless and WebM joins 1.0000, MP4 join \"codec\". Motion: The floor carries it: the pergola shadow stripes creep across the polished floor and return (floor flow p99.9 up to 16 px around frames 84-102 … FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/iconic-corridor-loop.json"),
    accept: cleanP3(["IC-3I-09"]),
    codeAlt: "code:plate-camera", fallback: "iconic-corridor", reduced: "poster",
  },
  "L10-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-corridor-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L10", 0, "c6481b99-a3ce-4028-a768-88746a3083f3",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-corridor as the loop's poster"),
    accept: cleanP3(["IC-3I-09"]), fallback: "iconic-corridor", reduced: "poster",
  },
  "L11": {
    kind: "video", status: "accepted", src: "/media/films/lights-line-loop.mp4",
    webm: "/media/films/lights-line-loop.webm", poster: "MV-07", endsOn: "MV-07",
    width: 1920, height: 1080, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro, 16:9, 6 s, sound off, medias = [start_image X, end_image X] (start = end); API echo mode pro, cfg_scale 0.5, enhance_prompt false; declined_preset_id 24bae836 on every batch item", 10.5, "a2d361aa-ee8b-4b80-b434-7e1049676303",
      "L11 living loop on MV-07 (tier S; seam residual K=12; mp4 551100 B / webm 294655 B). PASS, flagged near-still: left 40% still (0.21 WebM / 0.48 MP4 /255), ribbon holds LINE_D (<= 0.3 px), glow <= 2.6% with 0 reversals/s, 0 flashes, silent; lossless and WebM joins 1.0000, MP4 join \"codec\". Only a faint ribbon-flame shimmer moves. Motion: Near-still. The candles do not bob (flow p99.9 <= 0.28 px anywhere) and the large flames do not visibly flicker (luma ptp <= 0.8%); the only motion is a faint … FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/lights-line-loop.json"),
    accept: cleanP3(["IC-HP-03", "IC-HP-16"]),
    codeAlt: "code:plate-camera", fallback: "MV-07", reduced: "poster",
  },
  "L11-poster": {
    kind: "image", status: "accepted", src: "/media/films/lights-line-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L11", 0, "a2d361aa-ee8b-4b80-b434-7e1049676303",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps MV-07 as the loop's poster"),
    accept: cleanP3(["IC-HP-03", "IC-HP-16"]), fallback: "MV-07", reduced: "poster",
  },
  "L12": {
    kind: "video", status: "accepted", src: "/media/films/storm-loop.mp4",
    webm: "/media/films/storm-loop.webm", poster: "MV-04", endsOn: "MV-04",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, sound off, enhance_prompt false, start_image = end_image = the plate job", 10.5, "09b500b6-5f9c-46a8-bda6-c11f483e84fc",
      "L12 living loop on MV-04 (tier I; seam residual K=24; mp4 807036 B / webm 499791 B). PASS (flagged for Aryan): 0 flashes, no lightning, horizon level, no figures, silent, registration >= 0.95 at both ends, smooth, seamless (lossless 0.9902, WebM 0.9938); the swell becomes a large bright breaking wave mid-loop (prompted … Motion: Big: the swell rises into a tall breaking wave whose aqua crest spray brightens and fills the right third (25-75 %), then subsides back to the plate foam band b … FLAGS (4): see the json. Record: docs/build/media-staged/p3/accepted/storm-loop.json"),
    accept: cleanP3(["IC-PC-05", "IC-PC-08"]),
    codeAlt: "code:plate-camera", fallback: "MV-04", reduced: "poster",
  },
  "L12-poster": {
    kind: "image", status: "accepted", src: "/media/films/storm-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L12", 0, "09b500b6-5f9c-46a8-bda6-c11f483e84fc",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps MV-04 as the loop's poster"),
    accept: cleanP3(["IC-PC-05", "IC-PC-08"]), fallback: "MV-04", reduced: "poster",
  },
  "L14": {
    kind: "video", status: "accepted", src: "/media/films/iconic-pearl-alt-loop.mp4",
    webm: "/media/films/iconic-pearl-alt-loop.webm", poster: "iconic-pearl-alt", endsOn: "iconic-pearl-alt",
    width: 1280, height: 720, durationS: 5.042, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job", 10.5, "c1ebe370-ecb3-455f-aae8-16ff33d605af",
      "L14 living loop on iconic-pearl-alt (tier I; seam blend K=24; mp4 294548 B / webm 387363 B). PASS (blend seam): no figures/flags/text; ship and marks still (<= 0.21 px; MP4/WebM finial 0.34/0.09, ensign 0.26/0.09, mastTop 0.19/0.17, mizzenTop 0.62/0.72 /255); 0 flashes; glow <= 8.1 %, <= 0.6 reversals/s; silent; registration 0.961/0.963 … Motion: [object Object] FLAGS (5): see the json. Record: docs/build/media-staged/p3/accepted/iconic-pearl-alt-loop.json"),
    accept: cleanP3(["IC-PC-01", "IC-PC-08"]),
    codeAlt: "code:plate-camera", fallback: "iconic-pearl-alt", reduced: "poster",
  },
  "L14-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pearl-alt-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L14", 0, "c1ebe370-ecb3-455f-aae8-16ff33d605af",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-pearl-alt as the loop's poster"),
    accept: cleanP3(["IC-PC-01", "IC-PC-08"]), fallback: "iconic-pearl-alt", reduced: "poster",
  },
  "L15": {
    kind: "video", status: "accepted", src: "/media/films/iconic-wanted-loop.mp4",
    webm: "/media/films/iconic-wanted-loop.webm", poster: "iconic-wanted", endsOn: "iconic-wanted",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job", 10.5, "a0835266-1eb5-4094-8e22-7b2f037ec992",
      "L15 living loop on iconic-wanted (tier I; seam residual K=12; mp4 191234 B / webm 162365 B). PASS (with the 0-credit poster-board hold-out): posterRect 0.11 / 0.10/255 (MP4 / WebM), all posters <= 0.15, blank; 0 flashes, silent; registration 0.979-0.984; lossless join 1.0000, WebM 0.9999; bytes 191 KB / 162 KB. Flag: near-still Motion: [object Object] FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/iconic-wanted-loop.json"),
    accept: cleanP3(["IC-RD-03"]),
    codeAlt: "code:plate-camera", fallback: "iconic-wanted", reduced: "poster",
  },
  "L15-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-wanted-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L15", 0, "a0835266-1eb5-4094-8e22-7b2f037ec992",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-wanted as the loop's poster"),
    accept: cleanP3(["IC-RD-03"]), fallback: "iconic-wanted", reduced: "poster",
  },
  "L16": {
    kind: "video", status: "accepted", src: "/media/films/iconic-ice-alt-loop.mp4",
    webm: "/media/films/iconic-ice-alt-loop.webm", poster: "iconic-ice-alt", endsOn: "iconic-ice-alt",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job", 10.5, "5469d35b-e885-48eb-9576-486d8330c6fa",
      "L16 living loop on iconic-ice-alt (tier I; seam residual K=12; mp4 128860 B / webm 133994 B). PASS: boardRect 0.90 / 0.70/255 (MP4 / WebM), benches 0.96 / 0.88, board blank; 0 flashes, silent; registration 0.974-0.984; lossless join 1.0000, WebM 0.9997; bytes 129 KB / 134 KB. Flag: near-still Motion: [object Object] FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/iconic-ice-alt-loop.json"),
    accept: cleanP3(["IC-3I-01", "IC-3I-09"]),
    codeAlt: "code:plate-camera", fallback: "iconic-ice-alt", reduced: "poster",
  },
  "L16-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-ice-alt-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L16", 0, "5469d35b-e885-48eb-9576-486d8330c6fa",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-ice-alt as the loop's poster"),
    accept: cleanP3(["IC-3I-01", "IC-3I-09"]), fallback: "iconic-ice-alt", reduced: "poster",
  },
  "L17": {
    kind: "video", status: "accepted", src: "/media/films/iconic-pen-loop.mp4",
    webm: "/media/films/iconic-pen-loop.webm", poster: "iconic-pen", endsOn: "iconic-pen",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job", 10.5, "924d9028-3930-4466-9d7d-b38fa7e89e81",
      "L17 living loop on iconic-pen (tier I; seam residual K=12; mp4 124407 B / webm 105347 B). PASS (with the 0-credit stopwatch hold-out): dial 0.15 / 0.01/255, stopwatch 0.45 / 0.35 (MP4 / WebM), hand angle fixed; pen + case 0.9957 / 0.62 (flagged, see flags); 0 flashes, glow <= 1.44 %, silent; registration 0.988-0.991; lossless join 1.0000 … Motion: [object Object] FLAGS (4): see the json. Record: docs/build/media-staged/p3/accepted/iconic-pen-loop.json"),
    accept: cleanP3(["IC-3I-01"]),
    codeAlt: "code:plate-camera", fallback: "iconic-pen", reduced: "poster",
  },
  "L17-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pen-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L17", 0, "924d9028-3930-4466-9d7d-b38fa7e89e81",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-pen as the loop's poster"),
    accept: cleanP3(["IC-3I-01"]), fallback: "iconic-pen", reduced: "poster",
  },
  "L18": {
    kind: "video", status: "accepted", src: "/media/films/iconic-pen-alt-loop.mp4",
    webm: "/media/films/iconic-pen-alt-loop.webm", poster: "iconic-pen-alt", endsOn: "iconic-pen-alt",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job; declined_preset_id 24bae836 on every item", 10.5, "99005831-b285-4160-b001-f7ded5f1a2ae",
      "L18 living loop on iconic-pen-alt (tier I; seam residual K=12; mp4 113903 B / webm 93799 B). PASS: stopwatch dial 0.22 / 0.04/255 (MP4 / WebM, after the 0-cr hold-out), stopwatch 0.51 / 0.31, pen + case 0.95 / 0.60, left dark 0.42 / 0.15; 0 flashes, silent; registration 0.989-0.992; lossless join 1.0000, WebM 0.9997; bytes 114 KB / 94 KB … Motion: [object Object] FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/iconic-pen-alt-loop.json"),
    accept: cleanP3(["IC-3I-01"]),
    codeAlt: "code:plate-camera", fallback: "iconic-pen-alt", reduced: "poster",
  },
  "L18-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-pen-alt-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L18", 0, "99005831-b285-4160-b001-f7ded5f1a2ae",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-pen-alt as the loop's poster"),
    accept: cleanP3(["IC-3I-01"]), fallback: "iconic-pen-alt", reduced: "poster",
  },
  "L19": {
    kind: "video", status: "accepted", src: "/media/films/voyage-b-loop.mp4",
    webm: "/media/films/voyage-b-loop.webm", poster: "MV-05b", endsOn: "MV-05b",
    width: 1920, height: 1080, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job; declined_preset_id 24bae836 on every item", 10.5, "b82deba3-2b61-4cf6-88db-eb5ff2784802",
      "L19 living loop on MV-05b (tier S; seam residual K=12; mp4 1280366 B / webm 554227 B). PASS: horizon band 0.53 / 0.32/255 (MP4 / WebM), moon zone ptp 0.5 %; 0 flashes, silent; registration 0.990-0.991; lossless join 1.0000 (pct 1), MP4 0.9941 (true), WebM 0.9999; consecutive min 0.9933 / 0.9917; bytes 1.28 MB / 0.55 MB. Flag: fog drift weak … Motion: [object Object] FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/voyage-b-loop.json"),
    accept: cleanP3(),
    codeAlt: "code:plate-camera", fallback: "MV-05b", reduced: "poster",
  },
  "L19-poster": {
    kind: "image", status: "accepted", src: "/media/films/voyage-b-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L19", 0, "b82deba3-2b61-4cf6-88db-eb5ff2784802",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps MV-05b as the loop's poster"),
    accept: cleanP3(), fallback: "MV-05b", reduced: "poster",
  },
  "L20": {
    kind: "video", status: "accepted", src: "/media/films/voyage-d-loop.mp4",
    webm: "/media/films/voyage-d-loop.webm", poster: "MV-05d", endsOn: "MV-05d",
    width: 1920, height: 1080, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job; declined_preset_id 24bae836 on every item", 10.5, "f487f6dc-7405-4b3c-8296-4bfa96dbd1b1",
      "L20 living loop on MV-05d (tier S; seam residual K=12; mp4 1149764 B / webm 282615 B). PASS: ship on the horizon (centroid <= 0.8 px, horizon row fixed at 0.4199), no crew/flag/lettering; 0 flashes, silent; registration 0.984; lossless join 1.0000, WebM 0.9999; consecutive min 0.9981 / 0.9986; bytes 1.15 MB / 0.28 MB … Motion: [object Object] FLAGS (2): see the json. Record: docs/build/media-staged/p3/accepted/voyage-d-loop.json"),
    accept: cleanP3(["IC-PC-01"]),
    codeAlt: "code:plate-camera", fallback: "MV-05d", reduced: "poster",
  },
  "L20-poster": {
    kind: "image", status: "accepted", src: "/media/films/voyage-d-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L20", 0, "f487f6dc-7405-4b3c-8296-4bfa96dbd1b1",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps MV-05d as the loop's poster"),
    accept: cleanP3(["IC-PC-01"]), fallback: "MV-05d", reduced: "poster",
  },
  "L21": {
    kind: "video", status: "accepted", src: "/media/films/iconic-deadeye-loop.mp4",
    webm: "/media/films/iconic-deadeye-loop.webm", poster: "iconic-deadeye", endsOn: "iconic-deadeye",
    width: 1280, height: 720, durationS: 6, alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 6 s, sound off, cfg_scale 0.5, enhance_prompt false, 1920x1080 24 fps output, start_image = end_image = the plate job; declined_preset_id 24bae836 on every item", 10.5, "8f09d527-9b20-499e-8d1b-505e37f1b909",
      "L21 living loop on iconic-deadeye (tier I; seam residual K=12; mp4 146506 B / webm 155644 B). PASS: birds 0.69 / 0.29/255 (MP4 / WebM), oak 0.95 / 0.44, homestead 0.21 / 0.05 (0-cr hold-out), fence 0.91 / 0.24; 0 flashes, silent; registration 0.969-0.978; lossless join 1.0000, WebM 0.9998; bytes 147 KB / 156 KB. Flag: near-still by design Motion: [object Object] FLAGS (4): see the json. Record: docs/build/media-staged/p3/accepted/iconic-deadeye-loop.json"),
    accept: cleanP3(["IC-RD-02", "IC-RD-05"]),
    codeAlt: "code:plate-camera", fallback: "iconic-deadeye", reduced: "poster",
  },
  "L21-poster": {
    kind: "image", status: "accepted", src: "/media/films/iconic-deadeye-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 0 of L21", 0, "8f09d527-9b20-499e-8d1b-505e37f1b909",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps iconic-deadeye as the loop's poster"),
    accept: cleanP3(["IC-RD-02", "IC-RD-05"]), fallback: "iconic-deadeye", reduced: "poster",
  },
  "L22": {
    kind: "video", status: "accepted", src: "/media/films/films-idiots-loop.mp4",
    webm: "/media/films/films-idiots-loop.webm", poster: "F-3I", endsOn: "F-3I",
    width: 1680, height: 720, durationS: 6.542, alt: null,
    provenance: hfP3("minimax_h3 2K, 21:9, 6 s (no sound switch: the master carries one AAC stream, stripped with -an), start_image = end_image = the plate job; 2944x1248 24 fps output (158 frames, 6.583 s); declined_preset_id 24bae836; use_unlim false. Charged 12 credits at 2026-09-30 23:14:30 UTC (transactions)", 12, "0d55d8ed-af05-4635-94e9-1dee6d55689e",
      "L22 living loop on F-3I (tier I (21:9 inset); seam residual K=12; mp4 388028 B / webm 360298 B). PASS (lake-only cinemagraph). Supersedes films-idiots-loop.FAIL.json (renamed .FAIL.superseded.json). Motion: [object Object] FLAGS (6): see the json. Record: docs/build/media-staged/p3/accepted/films-idiots-loop.json"),
    accept: cleanP3(["IC-3I-10"]),
    codeAlt: "code:plate-camera", fallback: "F-3I", reduced: "poster",
  },
  "L22-poster": {
    kind: "image", status: "accepted", src: "/media/films/films-idiots-loop-poster.webp",
    width: 1920, height: 823, alt: null,
    provenance: hfP3("frame 0 of L22", 0, "0d55d8ed-af05-4635-94e9-1dee6d55689e",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps F-3I as the loop's poster"),
    accept: cleanP3(["IC-3I-10"]), fallback: "F-3I", reduced: "poster",
  },
  "L23": {
    kind: "video", status: "accepted", src: "/media/films/films-hp-loop.mp4",
    webm: "/media/films/films-hp-loop.webm", poster: "F-HP", endsOn: "F-HP",
    width: 1680, height: 720, durationS: 6.542, alt: null,
    provenance: hfP3("minimax_h3 2K, 21:9, 6 s (no sound switch: the master carries an AAC stream, stripped with -an), start_image = end_image = the plate job; 2944x1248 24 fps output (158 frames, 6.583 s); declined_preset_id 24bae836 on every item", 12, "f3b9136b-2ded-4021-a1f4-cbe01147b51e",
      "L23 living loop on F-HP (tier I (21:9 inset); seam residual K=12; mp4 118191 B / webm 143601 B). PASS (0-cr cinemagraph hold-out; the raw clip FAILS the glow line): ink + paper 0.06 / 0.00/255 (MP4 / WebM), window 0.40 / 0.37, flames 1.7-4.3 % with 0 reversals/s, whole-frame luma 0.8 %; 0 flashes, silent (-an); registration 0.974-0.975 … Motion: [object Object] FLAGS (3): see the json. Record: docs/build/media-staged/p3/accepted/films-hp-loop.json"),
    accept: cleanP3(["IC-HP-03", "IC-HP-01"]),
    codeAlt: "code:plate-camera", fallback: "F-HP", reduced: "poster",
  },
  "L23-poster": {
    kind: "image", status: "accepted", src: "/media/films/films-hp-loop-poster.webp",
    width: 1920, height: 823, alt: null,
    provenance: hfP3("frame 0 of L23", 0, "f3b9136b-2ded-4021-a1f4-cbe01147b51e",
      "frame 0 of the loop (= the pinned plate frame src[0]): the registration record; code keeps F-HP as the loop's poster"),
    accept: cleanP3(["IC-HP-03", "IC-HP-01"]), fallback: "F-HP", reduced: "poster",
  },
  "SEQ-HALL": {
    kind: "sequence", status: "accepted", src: "/media/films/seq-hall/", frames: 72,
    width: 1280, height: 720, poster: "iconic-hall", endsOn: "SEQ-HALL-end", alt: null,
    provenance: hfP3("kling3_0 pro 16:9, 5 s, sound off, start_image = the plate job only (no end image), cfg_scale 0.5, enhance_prompt false; declined_preset_id 24bae836 -> 72 webp frames", 8.75, "1cdc1d90-0ad3-45b3-901c-d1933b0b5443",
      "push-in #3 DEFAULT (card-ignite.push): a 72-frame dolly along the tables toward the high table; frame 000 registers to iconic-hall at 0.968; loop.mjs sequence 72 x 1280 q50 (000 at q80), 3655680 B, max frame 83944 B. FLAG: over the 1.6 MB sequence budget (spec 12.2; desktop only, fetched within one viewport; 36-frame / 960 w options in the json). The ALT is code (crane-up on L02). Record: docs/build/media-staged/p3/accepted/seq-hall.json"),
    accept: cleanP3(["IC-HP-03", "IC-HP-16"]),
    fallback: "iconic-hall", reduced: "poster",
  },
  "SEQ-HALL-end": {
    kind: "image", status: "accepted", src: "/media/films/seq-hall-end.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hfP3("frame 120 of SEQ-HALL (the Kling master)", 0, "1cdc1d90-0ad3-45b3-901c-d1933b0b5443",
      "the push's settled frame (SSIM 0.9767 vs master frame 120, 0.97 vs frame 071), 1920 w q80 (the master is 1920x1080)"),
    accept: cleanP3(["IC-HP-03", "IC-HP-16"]), fallback: "iconic-hall", reduced: "poster",
  },
} satisfies Record<string, MediaDef>;

export type MediaId = keyof typeof mediaAssets;

export type MediaAsset = Omit<MediaDef, "poster" | "fallback" | "endsOn" | "variants" | "variantOf"> & {
  id: MediaId;
  poster?: MediaId;
  fallback?: MediaId;
  endsOn?: MediaId;
  variants?: { alt: MediaId };
  variantOf?: MediaId;
};

/** Every public file an entry owns (src, srcMobile, the WebM twin). The
 *  validator's H2 check (every public file has a provenance row) uses it. */
export function filesOf(id: MediaId): string[] {
  const a = mediaAssets[id] as MediaDef;
  return [a.src, a.srcMobile, a.webm].filter((x): x is string => Boolean(x));
}

/** The tracked last-resort still for planned assets (SYNTHESIS §8). */
export const LEGACY_FALLBACK_STILL: MediaId = "hero-volsurface";

export const mediaIds = Object.keys(mediaAssets) as MediaId[];

export function isMediaId(id: string): id is MediaId {
  return Object.prototype.hasOwnProperty.call(mediaAssets, id);
}

export function isUsable(status: MediaStatus): boolean {
  return status === "accepted" || status === "integrated";
}

/** Whether `id` is itself usable (accepted / integrated), not a fallback:
 *  the same as `resolveMedia(id)?.id === id`, without the walk. */
export function isOwnUsable(id: MediaId): boolean {
  return isUsable(getMedia(id).status);
}

/** The raw manifest entry for `id` (no fallback walk). */
export function getMedia(id: MediaId): MediaAsset {
  return { id, ...(mediaAssets[id] as MediaDef) } as MediaAsset;
}

/** Walk `fallback` from `id` until a usable asset is found. Returns null when
 *  the chain ends (or cycles) without one — the validator makes sure every id
 *  the page manifest references resolves, so callers normally never see null. */
export function resolveMedia(id: MediaId): MediaAsset | null {
  const seen = new Set<string>();
  let cur: string | undefined = id;
  while (cur && !seen.has(cur) && isMediaId(cur)) {
    seen.add(cur);
    const asset = getMedia(cur);
    if (isUsable(asset.status)) return asset;
    cur = asset.fallback;
  }
  return null;
}

/** True when `id` resolves to nothing usable but its chain ends in a
 *  planned asset with a declared code alternative (`codeAlt`): consumers
 *  must then draw that alternative (the validator accepts the reference). */
export function hasCodeAlternative(id: MediaId): boolean {
  const seen = new Set<string>();
  let cur: string | undefined = id;
  while (cur && !seen.has(cur) && isMediaId(cur)) {
    seen.add(cur);
    const asset = getMedia(cur);
    if (isUsable(asset.status)) return false;
    if (asset.codeAlt) return true;
    cur = asset.fallback;
  }
  return false;
}

/* — Variants (M1.5) ————————————————————————————————————————————————— */

/** The registered alternate of `id` (its `variants.alt`), or null. */
export function altOf(id: MediaId): MediaId | null {
  const a = (mediaAssets[id] as MediaDef).variants?.alt;
  return a && isMediaId(a) ? a : null;
}

/** The default an alternate stands in for (its `variantOf`), or null. */
export function defaultOf(id: MediaId): MediaId | null {
  const d = (mediaAssets[id] as MediaDef).variantOf;
  return d && isMediaId(d) ? d : null;
}

/**
 * The asset a `variant` of `id` plays: "alt" -> the registered alternate
 * when it is itself usable, else the default's own resolution (a missing or
 * planned alternate never leaves a hole). "default" -> resolveMedia(id).
 * Pass the DEFAULT's id.
 *
 * Registration: an alternate VIDEO keeps its own `poster` / `endsOn`, which
 * may be the DEFAULT plate (MV-03-alt starts and ends on MV-01, not on
 * MV-01-alt; IN-02-alt starts on IN-01). Check `registeredTo()` before
 * cutting a video onto a plate of the other variant.
 */
export function resolveVariant(id: MediaId, variant: Variant): MediaAsset | null {
  if (variant === "alt") {
    const alt = altOf(id);
    if (alt && isOwnUsable(alt)) return getMedia(alt);
  }
  return resolveMedia(id);
}

/** Both sides of `id` for side-by-side views (/lab/variants): the default's
 *  resolution and the alternate's (null when none is registered/usable). */
export function variantPair(id: MediaId): { default: MediaAsset | null; alt: MediaAsset | null } {
  const alt = altOf(id);
  return { default: resolveMedia(id), alt: alt && isOwnUsable(alt) ? getMedia(alt) : null };
}

/** True when `video` starts or ends on the still `plate` (its poster or its
 *  end frame), so a cut between them does not jump. */
export function registeredTo(video: MediaAsset, plate: MediaId): boolean {
  return video.poster === plate || video.endsOn === plate;
}

/* — Plate anchors and sequences (M2) ————————————————————————————————— */

/** A named 0-1 point on the plate `id` (its `marks`), or null. Pass the id
 *  of the asset you actually render (e.g. `resolveVariant(id, v)?.id`): an
 *  ALT plate carries its own anchors (iconic-camp-alt's fire sits elsewhere). */
export function markOf(id: MediaId, name: string): readonly [x: number, y: number] | null {
  const m = (mediaAssets[id] as MediaDef).marks;
  return m && Object.prototype.hasOwnProperty.call(m, name) ? m[name] : null;
}

/** A named 0-1 box on the plate `id` (its `rects`), or null. Same rule as
 *  markOf: pass the rendered asset's id. */
export function rectOf(id: MediaId, name: string): FocalBox | null {
  const r = (mediaAssets[id] as MediaDef).rects;
  return r && Object.prototype.hasOwnProperty.call(r, name) ? r[name] : null;
}

/** Frame URLs of a `sequence` asset (`${src}000.webp` … in order), or [] when
 *  `id` does not resolve to a usable sequence (its fallback is a still: the
 *  consumer then renders the stills path). */
export function sequenceFrames(id: MediaId): string[] {
  const a = resolveMedia(id);
  if (!a || a.kind !== "sequence" || !a.frames) return [];
  return Array.from({ length: a.frames }, (_, i) => `${a.src}${String(i).padStart(3, "0")}.webp`);
}

/** Resolved public path for `id`; throws (failing the build loudly) rather
 *  than rendering an empty rectangle when nothing in the chain is usable. */
export function mediaSrc(id: MediaId): string {
  const asset = resolveMedia(id);
  if (!asset) throw new Error(`[media] "${id}" has no usable asset in its fallback chain`);
  return asset.src;
}
