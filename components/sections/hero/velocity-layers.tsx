"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { springSoft } from "@/lib/motion";
import type { Box01 } from "@/components/sections/hero/focal";

/**
 * VelocityNoise — the hero's velocity dialect, MEDIA ONLY (SPEC v2 §6;
 * hero-lens.BAR S3, H14–H17; PC-13 "the wake brightens with velocity").
 * Scrolling fast raises, inside the plate:
 *   - grain      a pre-rendered noise tile, opacity ≤ .10;
 *   - chroma     the wake layer rides ≤ 2 px ahead of the plate;
 *   - wake       a copy of the plate masked to the crest band and lifted to
 *                brightness 1.15, faded in by velocity: the plate's crest
 *                brightens by ≤ 15 % (1 + .15·vn);
 * all from one value `vn` (0–1) that decays on springSoft, so stopping
 * restores clarity (vn < .005 within ~1.5 s). `--vn` is mirrored on the host
 * for tests. Nothing here touches text; every node is aria-hidden and sits
 * inside the plate, under the h1. Mounted only on a wide fine-pointer
 * screen with motion on and no Save-Data (H17): elsewhere vn stays 0.
 *
 * DIALECTS (M1.5, lib/variants.ts piece hero.velocity):
 *   "grain" (DEFAULT)  grain + chroma + wake, as above;
 *   "spray" (ALT)      the crest throws SPRAY: pale droplets (≤ 90, r ≤ 1.8
 *                      px, alpha ≤ .85) leave the crest band's top edge —
 *                      mostly along its bright body — and arc back under
 *                      gravity, at a rate ∝ vn; plus the same wake (the
 *                      crest brightens ≤ 15 %). No grain, no chroma. Its one
 *                      canvas lives in the plate (under the h1) and runs rAF
 *                      only while vn > .03 or a droplet is alive: droplets
 *                      live ≤ .65 s and emission stops as vn decays, so the
 *                      sea is clear ≤ 1.5 s after the scroll stops (H16).
 */

/** |v| (px/s) below which nothing happens, and the span to full effect. */
const DEADZONE = 400;
const SPAN = 2400;
const GRAIN_MAX = 0.1;
const CHROMA_MAX_PX = 2;
const WAKE_LIFT = 1.15;
const TILE = 128;

/** The spray dialect's bounds. */
const SPRAY = {
  /** Emission stops below this vn (the rAF follows). */
  minVn: 0.03,
  /** Droplets per second at vn = 1. */
  rate: 140,
  max: 90,
  lifeS: [0.35, 0.65] as const,
  radiusPx: [0.6, 1.8] as const,
  alphaMax: 0.85,
  /** Launch speed (px/s) up, sideways spread, gravity (px/s²). */
  up: [60, 200] as const,
  side: 90,
  gravity: 260,
  /** Pale sea-foam: the crest's own colour, near white. */
  rgb: "226,255,250",
} as const;

export type VelocityDialect = "grain" | "spray";

/* — A seeded grain tile (pure hash; no Math.random), rendered once. — */
let tileCache: string | null | undefined;
function grainTile(): string | null {
  if (tileCache !== undefined) return tileCache;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const ctx = c.getContext("2d");
  if (!ctx) return (tileCache = null);
  const img = ctx.createImageData(TILE, TILE);
  for (let i = 0; i < TILE * TILE; i++) {
    let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    const g = ((h ^ (h >>> 16)) >>> 0) & 255;
    img.data[i * 4] = g;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = g;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  tileCache = c.toDataURL("image/png");
  return tileCache;
}
const noop = () => () => {};
function useGrainTile(): string | null {
  return useSyncExternalStore(noop, grainTile, () => null);
}

export function VelocityLayers({
  hostRef,
  wake,
  objectPosition,
  dialect = "grain",
}: {
  /** The plate element: the poster <img> is read from it, `--vn` set on it. */
  hostRef: RefObject<HTMLElement | null>;
  /** The crest band in FRAME fractions (the Lens frame). */
  wake: Box01;
  objectPosition?: string;
  /** hero.velocity: DEFAULT grain + chroma, ALT crest spray (both + wake). */
  dialect?: VelocityDialect;
}) {
  const spray = dialect === "spray";
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const target = useTransform(velocity, (v) =>
    Math.min(1, Math.max(0, (Math.abs(v) - DEADZONE) / SPAN)),
  );
  const vn = useSpring(target, springSoft);
  const grain = useTransform(vn, (n) => n * GRAIN_MAX);
  const chroma = useTransform(vn, (n) => n * CHROMA_MAX_PX);
  useMotionValueEvent(vn, "change", (n) => {
    hostRef.current?.style.setProperty("--vn", n.toFixed(4));
  });

  // The wake copies the poster the plate ALREADY loaded (its currentSrc), so
  // it never costs a request of its own.
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const img = hostRef.current?.querySelector("img");
    if (!img) return;
    const take = () => {
      if (img.currentSrc) setSrc(img.currentSrc);
    };
    if (img.complete && img.currentSrc) {
      const t = window.setTimeout(take, 0);
      return () => window.clearTimeout(t);
    }
    img.addEventListener("load", take, { once: true });
    return () => img.removeEventListener("load", take);
  }, [hostRef]);

  const tile = useGrainTile();
  const pct = (f: number) => `${(f * 100).toFixed(2)}%`;
  const soft = 0.06;
  const mask =
    `linear-gradient(to right, transparent ${pct(wake.x0 - soft)}, #000 ${pct(wake.x0 + soft)}, #000 ${pct(wake.x1 - soft)}, transparent ${pct(wake.x1 + soft / 2)}),` +
    ` linear-gradient(to bottom, transparent ${pct(wake.y0 - soft)}, #000 ${pct(wake.y0 + soft / 2)}, #000 ${pct(wake.y1 - soft / 2)}, transparent ${pct(wake.y1 + soft)})`;
  const wakeStyle: CSSProperties = {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
    filter: `brightness(${WAKE_LIFT})`,
    objectPosition,
  };

  return (
    <>
      {src ? (
        // a masked copy of the already-loaded poster (same URL: a cache hit)
        <motion.img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          data-hero-wake=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={{ ...wakeStyle, opacity: vn, x: spray ? 0 : chroma }}
        />
      ) : null}
      {spray ? <SprayCanvas vn={vn} band={wake} /> : null}
      {tile && !spray ? (
        <motion.div
          aria-hidden="true"
          data-hero-grain=""
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{ opacity: grain, backgroundImage: `url(${tile})`, backgroundSize: `${TILE}px ${TILE}px` }}
        />
      ) : null}
    </>
  );
}

/* — The spray dialect (ALT) ———————————————————————————————————————— */

type Drop = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number; a: number };

/** A fixed-seed PRNG (mulberry32): the spray is repeatable frame to frame
 *  for captures, and no Math.random in a render path. */
function prng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Droplets thrown off the crest while the reader hurries. One canvas the
 * size of the plate box (DPR ≤ 2), driven by `vn`: a change of vn wakes the
 * loop; the loop sleeps (0 rAF) once vn is under SPRAY.minVn and the last
 * droplet has fallen. Emission points lie on the crest band's top edge
 * (`band`, frame fractions), weighted toward its bright right-hand body.
 */
function SprayCanvas({ vn, band }: { vn: MotionValue<number>; band: Box01 }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const bandRef = useRef(band);
  const kickRef = useRef<() => void>(() => {});
  useEffect(() => {
    bandRef.current = band;
  }, [band]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const rnd = prng(20260929);
    const drops: Drop[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;
    let owed = 0;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.offsetWidth;
      H = cv.offsetHeight;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(size);
    ro?.observe(cv);

    const frame = (t: number) => {
      raf = 0;
      const dt = last ? Math.min(0.064, Math.max(0, (t - last) / 1000)) : 0;
      last = t;
      const n = vn.get();
      const b = bandRef.current;
      if (n >= SPRAY.minVn && W && H) {
        owed += n * SPRAY.rate * dt;
        while (owed >= 1 && drops.length < SPRAY.max) {
          owed -= 1;
          // along the top edge of the crest band, weighted to its right body
          const u = 0.25 + 0.75 * Math.sqrt(rnd());
          const x = (b.x0 + (b.x1 - b.x0) * u) * W;
          const y = (b.y0 + (b.y1 - b.y0) * (0.12 + 0.28 * rnd())) * H;
          drops.push({
            x,
            y,
            vx: (rnd() - 0.6) * SPRAY.side,
            vy: -(SPRAY.up[0] + (SPRAY.up[1] - SPRAY.up[0]) * rnd()) * (0.6 + 0.6 * n),
            age: 0,
            life: SPRAY.lifeS[0] + (SPRAY.lifeS[1] - SPRAY.lifeS[0]) * rnd(),
            r: SPRAY.radiusPx[0] + (SPRAY.radiusPx[1] - SPRAY.radiusPx[0]) * rnd(),
            a: SPRAY.alphaMax * (0.4 + 0.6 * n),
          });
        }
        if (drops.length >= SPRAY.max) owed = 0;
      } else {
        owed = 0;
      }
      ctx.clearRect(0, 0, W, H);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]!;
        d.age += dt;
        if (d.age >= d.life) {
          drops.splice(i, 1);
          continue;
        }
        d.vy += SPRAY.gravity * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const f = 1 - d.age / d.life;
        ctx.globalAlpha = d.a * f;
        ctx.fillStyle = `rgb(${SPRAY.rgb})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (0.6 + 0.4 * f), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (drops.length || n >= SPRAY.minVn) raf = window.requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = window.requestAnimationFrame(frame);
    };
    kickRef.current = kick;
    return () => {
      ro?.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      kickRef.current = () => {};
    };
  }, [vn]);

  useMotionValueEvent(vn, "change", (n) => {
    if (n >= SPRAY.minVn) kickRef.current();
  });

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-hero-spray=""
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
