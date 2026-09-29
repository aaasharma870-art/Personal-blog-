/* ============================================================================
   HP SPRITES — the floating candle (IC-HP-03) at page scale: a cream taper
   with a drip, a wick, and (lit) a teardrop flame with its halo. 48 × 144 px
   PNGs drawn by code for this page (provenance: code, no file in public/;
   generator: research scratch gen-candles.js, SVG → sharp), shown at 24 × 72
   CSS px (2× for crisp edges) or smaller.
   Law 1 / loaders L6: every luminous pixel on the page is media or a
   pre-rendered sprite like these (<img> / <image>): never CSS glow,
   box-shadow, blur or radial-gradient paint in the DOM. The UNLIT taper is
   the same drawing without flame and halo, so lighting = one crossfade.
   The small loader sprites (LUMOS_SPRITE, FLAME_SPRITE, CANDLE_SPRITE) live
   in components/primitives/loaders/sprites-hp.ts.
   ========================================================================== */

/** A lit floating candle: flame + halo + taper (48 × 144). */
export const CANDLE_LIT_SPRITE =
  "data:image/png;base64,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";

/** The same taper, unlit: wick only (48 × 144). */
export const CANDLE_UNLIT_SPRITE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAACQCAYAAABOHuhpAAAACXBIWXMAAAsTAAALEwEAmpwYAAACKElEQVR42u3cTWsTURSA4dA/oOBK6EK6UlHoSin+jv4DcduduEvFLuOqIAHRgrWK0iRWCzWO2sQOSTPmOzGTD2uMM23z1ZqU0EU3x8kUBF2JLszV94Wzvw+HC3c24/EQEREREREREREREREREf0zXTh96uxwlAWcGz+RHY6ygPPjJyvDAQAAgAI1KtpEu2H4Bh1T7zcLZm87E7ly8czecFpbkYhVCpvVVFDP6Q98hnZnYqQOX0sGp62Sdtj5YsigW5aDVkF6OxmZu3FNbl2/Ku1PUbHNsNTSQcnri5II+w8jK7enR+LwGX1hspoKHFnma/kZsG8b0m3EfgCYxlNJvPLL+orvaPWhd/KvA3LRhVkHIL8KsKtRF+BsQNYe35xVCvAxE5J+qyjJN3fVBHwurslB25ScvqQmwK68dQHFzSdqAppbGy7AfB9UE9BpJFxAJf1cTcCelXQBtcwLNQH725njDSSfqQn4upNV+w70dvPHACOg6AZ2cy6gEHukKMBOu4Dk+n01AV0rJf3mB3XfQu16XFr1TXUB9fyqlI1ldQHfP2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8LIPvu3uVKctn6DYD1cmnukmcUEvGO2SVtyvm7zcygU57vtwohB6A5gHinEYs7AM0yw6FqOjCf21icSWj+KfF6xzxE9Md9Azs0tV2nlkcIAAAAAElFTkSuQmCC";

/** Intrinsic sprite size (px) and the flame centre as a fraction of it. */
export const CANDLE_SPRITE_SIZE = { w: 48, h: 144 } as const;
export const CANDLE_FLAME_AT = { x: 0.5, y: 0.2 } as const;

/* — The enchanted ceiling (IC-HP-03's sky: the Great Hall's night ceiling) —
   Pre-rendered by code as SVG images (Law 1: light is an image, never DOM
   glow). Deterministic (integer hash), so server and client agree. — */

/** Deterministic 0–1 hash (integer math). */
function hash01(i: number, salt: number): number {
  const x = (Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 11, 40503)) >>> 0;
  return (x % 10007) / 10007;
}

const svgUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** A tileable star field (STAR_TILE_SIZE px square): ~50 cool-white points
 *  of varied size and brightness, a few with a four-point glint. */
export const STAR_TILE_SIZE = 420;
export const STAR_TILE = (() => {
  const S = STAR_TILE_SIZE;
  let body = "";
  for (let i = 0; i < 52; i++) {
    const x = 6 + hash01(i, 101) * (S - 12);
    const y = 6 + hash01(i, 202) * (S - 12);
    const b = hash01(i, 303);
    const r = 0.45 + b * b * 1.05;
    const o = 0.28 + b * 0.62;
    body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#eef2fa" fill-opacity="${o.toFixed(2)}"/>`;
    if (b > 0.9) {
      const l = 3.5 + b * 2;
      body += `<path d="M${(x - l).toFixed(1)} ${y.toFixed(1)}H${(x + l).toFixed(1)}M${x.toFixed(1)} ${(y - l).toFixed(1)}V${(y + l).toFixed(1)}" stroke="#eef2fa" stroke-opacity="0.45" stroke-width="0.6"/>`;
    }
  }
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${body}</svg>`);
})();

/** Night clouds drifting across the enchanted ceiling: soft blue-grey
 *  banks, stretched to their box (preserveAspectRatio none). Dim by design:
 *  a ground for the candles, never a light source. */
export const CEILING_CLOUDS = (() => {
  let body = "";
  for (let i = 0; i < 9; i++) {
    const cx = 80 + hash01(i, 11) * 1440;
    const cy = 60 + hash01(i, 12) * 330;
    const rx = 150 + hash01(i, 13) * 230;
    const ry = 26 + hash01(i, 14) * 40;
    const o = 0.07 + hash01(i, 15) * 0.1;
    body += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="#8ea3cc" fill-opacity="${o.toFixed(2)}"/>`;
  }
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600" preserveAspectRatio="none">` +
      `<filter id="c" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="28"/></filter>` +
      `<g filter="url(#c)">${body}</g></svg>`,
  );
})();

/** The ceiling's night blue (the Great Hall plate's sky, darkened): the
 *  ground under the stars. Not a light — text on it stays AA (≥ 12:1). */
export const CEILING_NIGHT = "#0d1830";
