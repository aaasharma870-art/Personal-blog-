/* ============================================================================
   SDF TITLE — an act title as a signed-distance texture (PHASE3-SPEC §8.1):
   the title set in its world's head face (≤ 512 px cap height, smaller when
   the line would pass 4096 px or 1.6 MP), then an exact Euclidean distance
   transform (Felzenszwalb–Huttenlocher, the TinySDF scheme with sub-pixel
   anti-aliased edges). The work is a STEPPER: the runtime calls `step()` in
   separate idle slices (≈ 8 ms each) until it returns true, so no slice
   makes a long animation frame. Results are cached per text + face.
   R8 out: 0.5 = the edge, > 0.5 inside; the SDF keeps the edge crisp at any
   scale. Its own chunk: gl-lock.ts imports it on the first GL title (the
   title.mask ALT never loads it). OWNER: W2-GL.
   ========================================================================== */

import type { SdfMeta } from "./plan";

export type SdfTitle = SdfMeta & { data: Uint8Array };
export type TitleFont = { family: string; weight: string };

const INF = 1e20;
const SLICE_MS = 8;
const MAX_PX = 1.6e6;
const cache = new Map<string, SdfTitle>();

export const sdfKey = (text: string, f: TitleFont, o: readonly number[]) => `${f.weight} ${f.family}|${text}|${o.join(",")}`;

export function cachedSdf(key: string): SdfTitle | null {
  return cache.get(key) ?? null;
}

/** Forget the cached SDFs (≈ 1.6 MB of CPU memory when no card needs GL). */
export function clearSdf(): void {
  cache.clear();
}

/** 1-D squared EDT along one row/column (in place). */
function edt1d(g: Float32Array, off: number, stride: number, n: number, f: Float32Array, v: Uint16Array, z: Float32Array) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = g[off];
  for (let q = 1, k = 0, s = 0; q < n; q++) {
    f[q] = g[off + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    g[off + q * stride] = f[r] + (q - r) * (q - r);
  }
}

/** A stepper that builds the SDF of `text` in `font`; `step()` → true when
 *  done (then `result()`). `maxW` = the context's MAX_TEXTURE_SIZE. */
export function sdfTitle(text: string, font: TitleFont, origin: readonly [number, number], maxW: number) {
  const key = sdfKey(text, font, origin);
  let out: SdfTitle | null = cache.get(key) ?? null;
  let W = 0;
  let H = 0;
  let spread = 0;
  let outer: Float32Array | null = null;
  let inner: Float32Array | null = null;
  let f: Float32Array, z: Float32Array, v: Uint16Array;
  let meta: Omit<SdfMeta, "ox" | "oy" | "rIn"> | null = null;
  // phases: 0 raster · 1 seed rows · 2 outer cols · 3 inner cols · 4 outer rows · 5 inner rows · 6 encode + origin
  let phase = out ? 7 : 0;
  let cur = 0;
  let best = -INF;
  let bx = 0;
  let by = 0;
  let bd = 0;
  let bytes: Uint8Array | null = null;
  let alpha: Uint8ClampedArray | null = null;

  /** Seed one row of the two grids from the coverage (sub-pixel edges). */
  function seed(y: number) {
    for (let i = y * W, e = i + W; i < e; i++) {
      const al = alpha![i * 4 + 3] / 255;
      if (al === 0) {
        outer![i] = INF;
        inner![i] = 0;
      } else if (al === 1) {
        outer![i] = 0;
        inner![i] = INF;
      } else {
        const d = 0.5 - al;
        outer![i] = d > 0 ? d * d : 0;
        inner![i] = d < 0 ? d * d : 0;
      }
    }
  }

  function raster() {
    const c = document.createElement("canvas");
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) throw new Error("gl: no 2d");
    const face = (px: number) => `${font.weight} ${px}px ${font.family}`;
    x.font = face(100);
    const capR = (x.measureText("H").actualBoundingBoxAscent || 70) / 100;
    const m = x.measureText(text);
    const leftR = m.actualBoundingBoxLeft / 100;
    const inkR = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / 100;
    const ascR = m.actualBoundingBoxAscent / 100;
    const descR = m.actualBoundingBoxDescent / 100;
    let cap = 512;
    let fs = 0;
    let pad = 0;
    const fit = () => {
      fs = cap / capR;
      spread = Math.max(8, Math.round(cap / 8));
      pad = spread + 2;
      W = Math.ceil(inkR * fs + 2 * pad);
      H = Math.ceil((ascR + descR) * fs + 2 * pad);
    };
    fit();
    while ((W > Math.min(4096, maxW) || W * H > MAX_PX) && cap > 64) {
      cap *= 0.9;
      fit();
    }
    c.width = W;
    c.height = H;
    x.font = face(fs);
    x.fillStyle = "#fff";
    const base = pad + ascR * fs;
    x.fillText(text, pad + leftR * fs, base);
    alpha = x.getImageData(0, 0, W, H).data;
    outer = new Float32Array(W * H);
    inner = new Float32Array(W * H);
    const n = Math.max(W, H) + 1;
    f = new Float32Array(n);
    z = new Float32Array(n + 1);
    v = new Uint16Array(n);
    meta = { w: W, h: H, cap, ink: [pad, base - cap, pad + inkR * fs, base + descR * fs] };
    bytes = new Uint8Array(W * H);
  }

  function step(): boolean {
    if (phase === 7) return true;
    const t0 = performance.now();
    if (phase === 0) {
      raster();
      phase = 1;
      return false;
    }
    while (performance.now() - t0 < SLICE_MS) {
      if (phase === 1) {
        seed(cur);
        if (++cur >= H) {
          cur = 0;
          alpha = null;
          phase++;
        }
      } else if (phase <= 3) {
        // columns
        edt1d(phase === 2 ? outer! : inner!, cur, W, H, f, v, z);
        if (++cur >= W) {
          cur = 0;
          phase++;
        }
      } else if (phase <= 5) {
        edt1d(phase === 4 ? outer! : inner!, cur * W, 1, W, f, v, z);
        if (++cur >= H) {
          cur = 0;
          phase++;
        }
      } else {
        // encode one row + search it for the zoom origin: the deepest
        // stroke point near the requested one
        const m = meta!;
        const tx = m.ink[0] + origin[0] * (m.ink[2] - m.ink[0]);
        const ty = m.ink[1] + origin[1] * (m.ink[3] - m.ink[1]);
        const y = cur;
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          const di = Math.sqrt(inner![i]);
          const d = Math.sqrt(outer![i]) - di;
          bytes![i] = Math.max(0, Math.min(255, Math.round((0.5 - d / (2 * spread)) * 255)));
          if (di > 1) {
            const sc = di - 0.35 * Math.hypot(x - tx, y - ty);
            if (sc > best) {
              best = sc;
              bx = x;
              by = y;
              bd = di;
            }
          }
        }
        if (++cur >= H) {
          out = { ...m, ox: bx, oy: by, rIn: Math.max(1, bd), data: bytes! };
          cache.set(key, out);
          if (cache.size > 2) cache.delete(cache.keys().next().value as string);
          outer = inner = null;
          phase = 7;
          return true;
        }
      }
    }
    return false;
  }

  return { key, step, result: (): SdfTitle | null => out };
}
