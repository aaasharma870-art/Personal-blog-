/* ============================================================================
   CODEC — one encode choice for every video host: the intro, MediaFrame and
   StageVideo (PHASE3-SPEC §4.2, §6.3; DP-3; the vanilla intro controller
   carries the same rule in JS and shares this cache). Client module (pure
   helpers are server-safe); lib/media.ts stays pure data.

   THE RULE: ask MediaCapabilities `decodingInfo()` about both encodes at the
   entry's size and rank each: 2 = supported, smooth and power-efficient;
   1 = supported; 0 = not decodable. The WebM (VP9) twin wins only with the
   higher rank; every tie, any error, no API or no twin → the MP4 (VP9 in
   software drops frames on older iGPUs, so H.264 is the safe default). An
   encode the browser cannot decode at all never wins a tie (an H.264-less
   Chromium build plays the WebM). The chosen file is set as `video.src`
   directly (no <source> list).

   THE CACHE: one answer per MP4 src, on `window.__codecPicks` (the intro
   controller writes the same map for the flight, L05 and the hero loop, so
   MediaFrame's first render after the hand-off already knows the answer).

   THE HAND-OFF: the controller prefetches the hero loop during the warm-up
   and parks it on `window.__introHandoff` ({ src, url, at }): MediaFrame
   plays the `blob:` URL (no network at the hand-off) and starts at `at`
   (FLIGHTS[*].loopAt). `handoffSource()` reads it.
   ========================================================================== */

export type CodecEntry = { src: string; webm?: string; width: number; height: number };
export type CodecPick = { src: string; type: "video/mp4" | "video/webm" };

type CodecType = CodecPick["type"];
type CodecWindow = Window & {
  __codecPicks?: Record<string, CodecType>;
  __introHandoff?: { src: string; url: string | null; at: number };
};

/** Every site encode is 24 fps; ≈ 0.1 bit per pixel per frame (IN-02 is
 *  4.7 Mb/s at 1080p24). Only used to describe the stream to the API. */
const FPS = 24;
const BITS_PER_PIXEL = 0.1;

/** The two VideoConfigurations asked about (also shipped to the vanilla
 *  controller by the intro model, so both sides ask the same question):
 *  VP9 profile 0 / H.264 High, level 4.0 up to 1080p, 5.0 / 5.1 above. */
export function codecConfigs(e: { width: number; height: number }) {
  const big = e.width * e.height > 1920 * 1088;
  const base = {
    width: e.width,
    height: e.height,
    framerate: FPS,
    bitrate: Math.round(e.width * e.height * FPS * BITS_PER_PIXEL),
  };
  return {
    webm: { ...base, contentType: `video/webm; codecs="vp09.00.${big ? "50" : "40"}.08"` },
    mp4: { ...base, contentType: `video/mp4; codecs="avc1.6400${big ? "33" : "28"}"` },
  };
}

const mp4 = (e: CodecEntry): CodecPick => ({ src: e.src, type: "video/mp4" });
const as = (e: CodecEntry, t: CodecType): CodecPick =>
  t === "video/webm" && e.webm ? { src: e.webm, type: t } : mp4(e);

function store(): Record<string, CodecType> | null {
  if (typeof window === "undefined") return null;
  const w = window as CodecWindow;
  return (w.__codecPicks ??= {});
}

const pending = new Map<string, Promise<CodecPick>>();

/** The cached answer for `e`, or null while nothing is known (an entry
 *  without a WebM twin is always its MP4). */
export function codecKnown(e: CodecEntry): CodecPick | null {
  if (!e.webm) return mp4(e);
  const t = store()?.[e.src];
  return t ? as(e, t) : null;
}

/** The encode this browser should play for `e` (cached per page). */
export function pickCodec(e: CodecEntry): Promise<CodecPick> {
  const known = codecKnown(e);
  if (known) return Promise.resolve(known);
  const inflight = pending.get(e.src);
  if (inflight) return inflight;
  const remember = (t: CodecType): CodecPick => {
    const s = store();
    if (s) s[e.src] = t;
    pending.delete(e.src);
    return as(e, t);
  };
  const mc = typeof navigator !== "undefined" ? navigator.mediaCapabilities : undefined;
  if (!mc || typeof mc.decodingInfo !== "function") return Promise.resolve(remember("video/mp4"));
  const c = codecConfigs(e);
  const rank = (video: MediaDecodingConfiguration["video"]): Promise<number> =>
    mc.decodingInfo({ type: "file", video }).then(
      (r) => (!r.supported ? 0 : r.smooth && r.powerEfficient ? 2 : 1),
      () => 0,
    );
  const p = Promise.all([rank(c.webm), rank(c.mp4)]).then(
    ([webm, h264]) => remember(webm > h264 ? "video/webm" : "video/mp4"),
    () => remember("video/mp4"),
  );
  pending.set(e.src, p);
  return p;
}

/** The cached answer for `e`, or the MP4 before anything is known. */
export function pickCodecSync(e: CodecEntry): CodecPick {
  return codecKnown(e) ?? mp4(e);
}

/** The intro's prefetched hand-off for the encode `src` (see the header):
 *  the URL to play (a `blob:` once the bytes are in, else `src`) and the
 *  start time (s). Null for any other video. Client only. */
export function handoffSource(src: string): { url: string; at: number } | null {
  if (typeof window === "undefined") return null;
  const h = (window as CodecWindow).__introHandoff;
  if (!h || h.src !== src) return null;
  return { url: h.url ?? src, at: h.at > 0 ? h.at : 0 };
}
