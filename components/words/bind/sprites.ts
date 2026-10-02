/* ============================================================================
   WORDS ENGINE — pre-rendered sprites (W2-WORDS; DP-6: sprites as code).
   Small static SVGs used as background images: each is rasterised once and
   then only moved (transform) or faded (opacity). Lazy-chunk bytes only.
   Colours are the world decorative inks from app/globals.css, written out
   (an SVG image cannot read the page's CSS variables):
     --w-dusk #e0a458, --w-flame-halo #f4b740, --w-flame-core #ffe9c4
     (sprite stops only), --w-chalk #f2efe6, --w-ink-contour #c9ac72,
     --hp-deep #070504; char brown #1c0d05 / scorch red #a8452a (blot only).
   ========================================================================== */

import { svgUrl } from "./shared";

const NS = "xmlns='http://www.w3.org/2000/svg'";

/** Pirates: the scorch-edged front (char behind, an ember line at the edge). */
export const SCORCH_EDGE = svgUrl(
  `<svg ${NS} viewBox='0 0 24 100' preserveAspectRatio='none'><defs><linearGradient id='a'><stop offset='0' stop-color='#1c0d05' stop-opacity='0'/><stop offset='.45' stop-color='#1c0d05' stop-opacity='.85'/><stop offset='.72' stop-color='#e0a458' stop-opacity='.95'/><stop offset='.86' stop-color='#ffe9c4' stop-opacity='.9'/><stop offset='1' stop-color='#f4b740' stop-opacity='0'/></linearGradient></defs><path fill='url(#a)' d='M0 0h17l3 6-3 7 4 8-3 9 5 9-4 10 3 8-4 9 4 9-3 8 4 9-2 8H0z'/></svg>`,
);

/** Pirates: the scorch blot behind a stamped title (.5 → .25 → 0). */
export const SCORCH_BLOT = svgUrl(
  `<svg ${NS} viewBox='0 0 200 100' preserveAspectRatio='none'><defs><radialGradient id='b' cx='.5' cy='.55' r='.5'><stop offset='0' stop-color='#e0a458' stop-opacity='.7'/><stop offset='.45' stop-color='#a8452a' stop-opacity='.45'/><stop offset='1' stop-color='#1c0d05' stop-opacity='0'/></radialGradient></defs><path fill='url(#b)' d='M14 52C10 30 40 12 78 14c24-9 58-6 80 6 30 6 42 28 30 48-6 20-40 28-70 24-22 6-58 4-80-6C20 80 16 66 14 52Z'/></svg>`,
);

/** 3 Idiots: the baked ragged chalk edge (with a few specks). */
export const CHALK_EDGE = svgUrl(
  `<svg ${NS} viewBox='0 0 20 100' preserveAspectRatio='none'><defs><linearGradient id='a'><stop offset='0' stop-color='#f2efe6' stop-opacity='0'/><stop offset='.6' stop-color='#f2efe6' stop-opacity='.5'/><stop offset='.85' stop-color='#f2efe6' stop-opacity='.85'/><stop offset='1' stop-color='#f2efe6' stop-opacity='0'/></linearGradient></defs><path fill='url(#a)' d='M0 0h14l2 5-1 6 3 7-2 6 2 8-1 7 3 6-2 8 2 7-1 8 3 6-2 9 1 7-2 6H0z'/><g fill='#f2efe6' fill-opacity='.7'><circle cx='17' cy='14' r='.8'/><circle cx='15.5' cy='38' r='.6'/><circle cx='18' cy='61' r='.7'/><circle cx='16' cy='83' r='.6'/></g></svg>`,
);

/** 3 Idiots ALT: the board duster (wooden back, felt face). */
export const DUSTER = svgUrl(
  `<svg ${NS} viewBox='0 0 40 24'><rect x='1' y='1' width='38' height='12' rx='3' fill='#8a6a44'/><rect x='3' y='12' width='34' height='11' rx='1.5' fill='#3a3f39'/><path d='M3 21h34' stroke='#f2efe6' stroke-opacity='.35' stroke-width='1.5' stroke-dasharray='2 2.5'/></svg>`,
);

/** Harry Potter: the nib riding the baseline (tip at the bottom). */
export const NIB = svgUrl(
  `<svg ${NS} viewBox='0 0 16 40'><path fill='#c9ac72' d='M8 40 2.5 17Q2.5 7 8 0q5.5 7 5.5 17Z'/><path stroke='#070504' stroke-width='.9' d='M8 40V20'/><circle cx='8' cy='18' r='1.4' fill='#070504'/></svg>`,
);

/** "noise": a grain tile that settles to nothing. */
export const GRAIN = svgUrl(
  `<svg ${NS} width='64' height='64'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .93 0 0 0 0 .9 0 0 0 0 .84 0 0 0 2.4 -1.1'/></filter><rect width='64' height='64' filter='url(#n)'/></svg>`,
);

/** "Killed": the ember spark at the strike's front (CSS gradient). */
export const SPARK = "radial-gradient(circle, #ffe9c4 0, #f4b740 38%, rgba(244, 183, 64, 0) 70%)";
