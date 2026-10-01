/* ============================================================================
   GL TEXTURES — plate sources and decoding (PHASE3-SPEC §3.3 "Images",
   "Noise"). The right rung comes from next/image's own loader
   (`getImageProps`, the same URL the DOM <img> asks for, so the HTTP cache
   is shared), fetched at low priority and decoded OFF the main thread with
   `createImageBitmap`; the runtime uploads each bitmap in its own idle
   slice. The noise is generated here (0 bytes over the network).
   OWNER: W2-GL.
   ========================================================================== */

import { getImageProps } from "next/image";
import { resolveMedia, type MediaAsset, type MediaId } from "../media";
import type { RawTex } from "./transition-gl";

/** The image a plate id draws from (a video id → its poster still). */
export function plateAsset(id: MediaId): MediaAsset | null {
  const a = resolveMedia(id);
  if (!a) return null;
  if (a.kind === "image") return a;
  const poster = a.poster ? resolveMedia(a.poster) : null;
  return poster?.kind === "image" ? poster : null;
}

/** The optimized URL of `asset` at the rung ≥ `width` (frame CSS width ×
 *  min(DPR, 1.5) × the box scale: the 1920 rung at 1440, 1440 at 1024). */
export function plateUrl(asset: MediaAsset, width: number): string {
  const w = Math.max(64, Math.round(width));
  const { props } = getImageProps({
    src: asset.src,
    alt: "",
    width: w,
    height: Math.round((w * asset.height) / asset.width),
    quality: 75,
  });
  // srcSet "<1x url> 1x, <2x url> 2x": the 1x entry is the rung ≥ width
  return props.srcSet?.split(", ")[0]?.split(" ")[0] || props.src;
}

/** What Chrome's <img> sends, so the optimizer negotiates the same format
 *  and the response is the cached one when the DOM already fetched it. */
const IMG_ACCEPT = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";

/** fetch (low priority) → createImageBitmap (decoded off the main thread). */
export async function loadBitmap(url: string, signal?: AbortSignal): Promise<ImageBitmap> {
  const res = await fetch(url, { headers: { Accept: IMG_ACCEPT }, signal, priority: "low" } as RequestInit);
  if (!res.ok) throw new Error(`gl: ${res.status} ${url}`);
  return createImageBitmap(await res.blob());
}

/** 256² value noise (R8, REPEAT), seeded: identical on every load. */
export function noiseTexture(): RawTex {
  const data = new Uint8Array(256 * 256);
  let s = 0x9e3779b9;
  for (let i = 0; i < data.length; i++) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    data[i] = ((t ^ (t >>> 14)) >>> 0) & 255;
  }
  return { w: 256, h: 256, data, r8: true, repeat: true };
}

/** A 1×1 RGBA texture of `rgb` (0–1): a missing plate draws the deep. */
export function solidTexture(rgb: readonly number[]): RawTex {
  return { w: 1, h: 1, data: new Uint8Array([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255, 255]) };
}

/** Any CSS colour (the card's `--bg`, oklch included) → sRGB 0–1. */
export function cssRgb(value: string, fallback: readonly [number, number, number]): [number, number, number] {
  const v = value.trim();
  if (!v) return [...fallback];
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return [...fallback];
  x.fillStyle = `rgb(${fallback.map((f) => Math.round(f * 255)).join(",")})`;
  x.fillStyle = v;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
}
