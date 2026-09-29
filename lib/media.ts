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
   *  stern lantern: the page's one warm point (SPEC §1, §6). */
  marks?: Readonly<Record<string, readonly [x: number, y: number]>>;
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
const L2_PENDING = "claude:2026-09-28+aryan:pending" as const;
const clean = (icon?: readonly string[]): MediaAccept => ({
  people: false, likeness: false, text: false, ripped: false,
  ...(icon ? { icon } : {}), checkL2: L2_PENDING,
});
const hf = (model: string, credits: number, jobId: string, note?: string): MediaProvenance => ({
  source: "higgsfield", model, credits, date: "2026-09-28", jobId, ...(note ? { note } : {}),
});
/** Alternates: Check L2 signed by Claude on 2026-09-29 (viewed: no people,
 *  likeness, text or marks; generated, nothing ripped); Aryan pending. */
const cleanAlt = (icon?: readonly string[]): MediaAccept => ({
  ...clean(icon), checkL2: "claude:2026-09-29+aryan:pending",
});
/** Planned film assets: provenance is filled in when they are accepted. */
const planned: MediaProvenance = { source: "higgsfield", note: "planned (MEDIA-PLAN v2)" };

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
    provenance: hf("gpt_image_2_5 4:5 2k high", 2.75, "10b81664-5614-4298-9601-17ae26c50073",
      "hero mobile 4:5; crest xp02 0.268 / xp98 0.939; ship + lantern kept"),
    accept: clean(["IC-PC-01", "IC-PC-08"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-02-alt" },
  },
  "MV-03": {
    kind: "video", status: "accepted", src: "/media/films/hero-sea-loop.mp4",
    webm: "/media/films/hero-sea-loop.webm", poster: "MV-01", endsOn: "MV-01",
    width: 1920, height: 1080, durationS: 8.04, focal: [0.7, 0.5],
    focalBox: { x0: 0.49, x1: 0.96, y0: 0.46, y1: 0.6 }, alt: null,
    provenance: hf("kling3_0 pro 16:9 8s sound-off", 14, "764ca916-286d-41a4-b06f-81f36fd06c92",
      "start = end = MV-01 (encoded reg 0.982/0.975, join 0.987, 0 px shift); x<50% static; the lantern flickers softly (director); wrap step ~2 frames (Aryan to watch)"),
    accept: clean(["IC-PC-01", "IC-PC-08"]),
    fallback: "MV-01", reduced: "poster",
    variants: { alt: "MV-03-alt" },
  },
  "MV-03-poster": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea-loop-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: hf("frame 0 of MV-03", 0, "764ca916-286d-41a4-b06f-81f36fd06c92",
      "frame 0 of the loop; code keeps MV-01 (the priority poster) as the loop's poster"),
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
    kind: "image", status: "accepted", src: "/media/films/hero-sea-alt.webp",
    width: 2560, height: 1440, focal: [0.74, 0.52],
    focalBox: { x0: 0.53, x1: 0.98, y0: 0.46, y1: 0.6 },
    marks: { lantern: [0.897, 0.417], horizon: [0, 0.426] },
    alt: null,
    provenance: hf("nano_banana_pro 16:9 4k (Route A)", 4, "00c4c97b-4281-4691-ac3c-d398980a9d02",
      "MV-01 batch runner-up (LOG verdict 'Reject': purple cast in the sky, loud moon glow top-right; crest body from x 0.532, running to the right edge); 5504x3072 centre-cropped to 16:9. focalBox measured on this file (aqua mask, calibrated against MV-01's). MV-03 and MV-03-alt are registered to MV-01, NOT to this plate"),
    accept: cleanAlt(["IC-PC-01", "IC-PC-08"]),
    variantOf: "MV-01", fallback: "MV-01", reduced: "poster",
  },
  "MV-02-alt": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea-mobile-alt.webp",
    width: 1280, height: 1600, focal: [0.62, 0.5], alt: null,
    marks: { lantern: [0.781, 0.412] },
    provenance: hf("nano_banana_pro 4:5 2k", 2, "84001a3b-5c99-4416-8625-15c3597d8a75",
      "MV-02 batch runner-up (LOG verdict 'Reject (alternate)': strong curl, but the crest runs off the right edge and some aqua sits in the bottom 22%); 1856x2304 centre-cropped to 4:5"),
    accept: cleanAlt(["IC-PC-01", "IC-PC-08"]),
    variantOf: "MV-02", fallback: "MV-02", reduced: "poster",
  },
  "MV-03-alt": {
    kind: "video", status: "accepted", src: "/media/films/hero-sea-loop-alt.mp4",
    webm: "/media/films/hero-sea-loop-alt.webm", poster: "MV-01", endsOn: "MV-01",
    width: 1920, height: 1080, durationS: 8.0, focal: [0.7, 0.5],
    focalBox: { x0: 0.49, x1: 0.96, y0: 0.46, y1: 0.6 }, alt: null,
    provenance: {
      source: "higgsfield", model: "minimax_h3 2K 8s (audio stream stripped)", credits: 16, date: "2026-09-28",
      jobId: "ebb7db32-d4e5-42ce-a933-dc1452d9f909",
      note: "MV-03 batch runner-up (LOG verdict 'Reject: not restrained'): the crest breaks and exits right, the scene becomes a dark swell, a white sparkle point appears mid-frame, the lantern flares. start = end = MV-01: encoded first 0.976 / last 0.977 vs MV-01, join 0.990 (960x540 SSIM). Encoded 2026-09-29 from the 2560x1440 master: H.264 CRF 24 aq-mode 3 faststart 2.20 MB, VP9 CRF 30 1.74 MB, -an, ffmpeg -threads 2",
    },
    accept: cleanAlt(["IC-PC-01", "IC-PC-08"]),
    variantOf: "MV-03", fallback: "MV-03", reduced: "poster",
  },
  "MV-03-alt-poster": {
    kind: "image", status: "accepted", src: "/media/films/hero-sea-loop-alt-poster.webp",
    width: 1920, height: 1080, alt: null,
    provenance: {
      source: "higgsfield", model: "frame 0 of MV-03-alt", credits: 0, date: "2026-09-29",
      jobId: "ebb7db32-d4e5-42ce-a933-dc1452d9f909", note: "frame 0 (0.976 vs MV-01); code may keep using MV-01 as the loop's poster",
    },
    accept: cleanAlt(), variantOf: "MV-03-poster", fallback: "MV-03-poster", reduced: "poster",
  },

  /* -- PLANNED (MEDIA-PLAN v2 §4): the ids exist so builders can code against
        them; resolveMedia() walks the fallback until something is usable. -- */
  "MV-04": {
    kind: "image", status: "planned", src: "/media/films/storm.webp",
    width: 2560, height: 1440, focal: [0.7, 0.5], alt: null, provenance: planned,
    fallback: "MV-01", reduced: "poster",
  },
  "MV-05a": {
    kind: "image", status: "planned", src: "/media/films/voyage-a.webp",
    width: 2560, height: 1440, alt: null, provenance: planned, fallback: "MV-01", reduced: "poster",
  },
  "MV-05b": {
    kind: "image", status: "planned", src: "/media/films/voyage-b.webp",
    width: 2560, height: 1440, alt: null, provenance: planned, fallback: "MV-01", reduced: "poster",
  },
  "MV-05c": {
    kind: "image", status: "planned", src: "/media/films/voyage-c.webp",
    width: 2560, height: 1440, alt: null, provenance: planned, fallback: "MV-01", reduced: "poster",
  },
  "MV-05d": {
    kind: "image", status: "planned", src: "/media/films/voyage-d.webp",
    width: 2560, height: 1440, alt: null, provenance: planned, fallback: "MV-01", reduced: "poster",
  },
  JV: {
    kind: "sequence", status: "planned", src: "/media/films/voyage-seq/",
    width: 1280, height: 720, alt: null, provenance: planned, fallback: "MV-05a", reduced: "poster",
  },
  "MV-06": {
    kind: "image", status: "planned", src: "/media/films/board-dawn.webp",
    width: 2560, height: 1440, alt: null, provenance: planned,
    codeAlt: "a CSS board (--idi-canvas + a 4% grid); the seam card uses its storm plate", reduced: "poster",
  },
  "MV-10": {
    kind: "image", status: "planned", src: "/media/films/frontier-dusk.webp",
    width: 2560, height: 1440, focal: [0.78, 0.45], alt: null, provenance: planned,
    codeAlt: "the tintype develops into a CSS golden-hour ground with the code low sun (card III)", reduced: "poster",
  },
  "MV-10m": {
    kind: "image", status: "planned", src: "/media/films/frontier-dusk-mobile.webp",
    width: 1280, height: 1600, alt: null, provenance: planned, fallback: "MV-10", reduced: "poster",
  },
  "MV-11": {
    kind: "image", status: "planned", src: "/media/films/campfire.webp",
    width: 2560, height: 1440, alt: null, provenance: planned,
    codeAlt: "the R-6 code campfire on --rd-deep (Voices)", reduced: "poster",
  },
  "MV-11L": {
    kind: "video", status: "planned", src: "/media/films/campfire-loop.mp4",
    webm: "/media/films/campfire-loop.webm", poster: "MV-11",
    width: 1920, height: 1080, alt: null, provenance: planned, fallback: "MV-11", reduced: "poster",
  },
  "MV-07": {
    kind: "image", status: "planned", src: "/media/films/lights-line.webp",
    width: 2560, height: 1440, alt: null, provenance: planned,
    codeAlt: "the ignition's final frame in code: the candles lit along the Line (card IV)", reduced: "poster",
  },
  "MV-08": {
    kind: "image", status: "planned", src: "/media/films/last-light.webp",
    width: 2560, height: 1440, alt: null, provenance: planned,
    codeAlt: "the InkCandle drawing on --hp-deep (Contact)", reduced: "poster",
  },
  "MV-09": {
    kind: "video", status: "planned", src: "/media/films/last-light-loop.mp4",
    webm: "/media/films/last-light-loop.webm", poster: "MV-08",
    width: 1920, height: 1080, alt: null, provenance: planned, fallback: "MV-08", reduced: "poster",
  },
  "F-PC": {
    kind: "image", status: "planned", src: "/media/films/films-pirates.webp",
    width: 2520, height: 1080, alt: null, provenance: planned, fallback: "MV-01", reduced: "poster",
  },
  "F-3I": {
    kind: "image", status: "planned", src: "/media/films/films-idiots.webp",
    width: 2520, height: 1080, alt: null, provenance: planned, fallback: "MV-06", reduced: "poster",
  },
  "F-RD": {
    kind: "image", status: "planned", src: "/media/films/films-rdr2.webp",
    width: 2520, height: 1080, alt: null, provenance: planned,
    codeAlt: "films chapter (M2, not built): the screen shows its world's code ground", reduced: "poster",
  },
  "F-HP": {
    kind: "image", status: "planned", src: "/media/films/films-hp.webp",
    width: 2520, height: 1080, alt: null, provenance: planned,
    codeAlt: "films chapter (M2, not built): the screen shows its world's code ground", reduced: "poster",
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
    const a = alt ? resolveMedia(alt) : null;
    if (a && a.id === alt) return a;
  }
  return resolveMedia(id);
}

/** Both sides of `id` for side-by-side views (/lab/variants): the default's
 *  resolution and the alternate's (null when none is registered/usable). */
export function variantPair(id: MediaId): { default: MediaAsset | null; alt: MediaAsset | null } {
  const alt = altOf(id);
  const a = alt ? resolveMedia(alt) : null;
  return { default: resolveMedia(id), alt: a && a.id === alt ? a : null };
}

/** True when `video` starts or ends on the still `plate` (its poster or its
 *  end frame), so a cut between them does not jump. */
export function registeredTo(video: MediaAsset, plate: MediaId): boolean {
  return video.poster === plate || video.endsOn === plate;
}

/** Resolved public path for `id`; throws (failing the build loudly) rather
 *  than rendering an empty rectangle when nothing in the chain is usable. */
export function mediaSrc(id: MediaId): string {
  const asset = resolveMedia(id);
  if (!asset) throw new Error(`[media] "${id}" has no usable asset in its fallback chain`);
  return asset.src;
}
