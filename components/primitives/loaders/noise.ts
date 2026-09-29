"use client";

import { useSyncExternalStore } from "react";

/**
 * Develop noise (STUDY R-2) — the procedural "ink-bleed" field a tintype
 * develops through. Our own seeded value noise (3 octaves), rendered ONCE
 * per size into a small greyscale PNG data URL, then thresholded by the
 * caller (an SVG feColorMatrix, or CSS contrast/brightness): per scroll
 * frame only a cheap threshold changes, never the turbulence (a live
 * feTurbulence over a 1440 px plate costs tens of ms a frame).
 *
 * Client-only: the server has no canvas, and SSR frames are the fully
 * developed plate anyway (p = 1, no mask). Hydration-safe: the server
 * snapshot is null.
 */

const cache = new Map<string, string>();

function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  const u = s(xf);
  const v = s(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** A w×h greyscale noise PNG (data URL), or null where there is no canvas. */
export function developNoise(w: number, h: number, seed = 11): string | null {
  const key = `${w}x${h}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(w, h);
  const base = 6 / Math.max(w, h); // ~6 blobs across the long side
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      let amp = 0.55;
      let f = base;
      for (let o = 0; o < 3; o++) {
        v += amp * valueNoise(x * f * (w / Math.max(w, h)) * 1.4, y * f * 1.4, seed + o * 17);
        amp *= 0.5;
        f *= 2.1;
      }
      const g = Math.round(Math.min(1, Math.max(0, v / 0.9)) * 255);
      const i = (y * w + x) * 4;
      img.data[i] = g;
      img.data[i + 1] = g;
      img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}

const noop = () => () => {};

/** The noise data URL after hydration (null on the server / first pass). */
export function useDevelopNoise(w: number, h: number, seed = 11): string | null {
  return useSyncExternalStore(
    noop,
    () => developNoise(w, h, seed),
    () => null,
  );
}

/** feColorMatrix values thresholding greyscale noise so that a fraction
 *  ≈ `q` of the field is white (developed): v' = 6v − 6 + 7q (R-2). */
export function thresholdMatrix(q: number): string {
  const c = (-6 + 7 * Math.min(1, Math.max(0, q))).toFixed(3);
  return `6 0 0 0 ${c} 0 6 0 0 ${c} 0 0 6 0 ${c} 0 0 0 1 0`;
}
