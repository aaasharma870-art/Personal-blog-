/* ============================================================================
   CODEC — one encode choice for every video host: the intro, MediaFrame and
   StageVideo (PHASE3-SPEC §6.3, DP-3; the vanilla intro controller carries
   the same rule in JS). Client module; lib/media.ts stays pure data.

   W1.0 STUB: always the MP4 (B1-INTRO implements the real pick —
   MediaCapabilities `decodingInfo` for the WebM twin at the entry's size,
   cached per session — and `pickCodecSync` then returns the cached answer).
   ========================================================================== */

export type CodecEntry = { src: string; webm?: string; width: number; height: number };
export type CodecPick = { src: string; type: "video/mp4" | "video/webm" };

const mp4 = (e: CodecEntry): CodecPick => ({ src: e.src, type: "video/mp4" });

/** The encode this browser should play for `e`. */
export function pickCodec(e: CodecEntry): Promise<CodecPick> {
  return Promise.resolve(mp4(e));
}

/** The cached answer for `e`, or the MP4 before anything is known. */
export function pickCodecSync(e: CodecEntry): CodecPick {
  return mp4(e);
}
