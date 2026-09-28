/* ============================================================================
   MEDIA — typed manifest of every file under public/media (SYNTHESIS §8).
   PURE DATA: no React, no Next, no imports — Node can import this file
   directly (scripts/check-manifest.mjs validates it).

   Sections reference media by ID (`MediaId`), never by path. `resolveMedia()`
   walks `fallback` until it reaches an asset whose status is usable
   ("accepted" | "integrated"), so a planned/missing asset never 404s or leaves
   an empty rectangle.

   Dimensions are the real intrinsic sizes (images read with sharp, videos with
   ffprobe). All current files are the pre-redesign ("legacy") set; every one is
   decorative atmosphere (aria-hidden, alt="") so `alt` is null throughout.

   Adding an asset: add one entry below (status "planned" is fine while it is
   being made — give it a `fallback`, usually LEGACY_FALLBACK_STILL), then run
   `npm run check`.
   ========================================================================== */

export type MediaKind = "image" | "video" | "sequence";
export type MediaStatus = "planned" | "received" | "accepted" | "integrated";
export type MediaSource = "higgsfield" | "authentic" | "code" | "legacy";

export type MediaProvenance = {
  source: MediaSource;
  model?: string;
  credits?: number;
  date?: string;
  note?: string;
};

/** Shape of one manifest entry. `poster` / `fallback` hold MediaIds (typed as
 *  string here only to avoid a self-referential type; the validator checks
 *  they exist, and `MediaAsset` re-types them as `MediaId`). */
type MediaDef = {
  kind: MediaKind;
  status: MediaStatus;
  src: string;
  srcMobile?: string;
  poster?: string;
  width: number;
  height: number;
  /** Seconds (video only). */
  durationS?: number;
  focal?: readonly [x: number, y: number];
  /** null => decorative: aria-hidden, alt="". */
  alt: string | null;
  provenance: MediaProvenance;
  fallback?: string;
  /** Reduced-motion / Save-Data behaviour. */
  reduced: "poster" | "hide";
};

const legacy: MediaProvenance = { source: "legacy" };

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
} satisfies Record<string, MediaDef>;

export type MediaId = keyof typeof mediaAssets;

export type MediaAsset = Omit<MediaDef, "poster" | "fallback"> & {
  id: MediaId;
  poster?: MediaId;
  fallback?: MediaId;
};

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

/** Resolved public path for `id`; throws (failing the build loudly) rather
 *  than rendering an empty rectangle when nothing in the chain is usable. */
export function mediaSrc(id: MediaId): string {
  const asset = resolveMedia(id);
  if (!asset) throw new Error(`[media] "${id}" has no usable asset in its fallback chain`);
  return asset.src;
}
