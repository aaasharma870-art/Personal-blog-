// Bakes the homemade-drone game's sprites (PHASE3-SPEC §9.2 #2 "Media": the
// chalk ChalkQuadcopter flies as a PRE-RASTERIZED PNG sprite, never a live
// ChalkFilter on a moving element; PHASE3-PLAN §0.1 #6, DP-6: code sprites
// live in assets/p3/<builder>/ and are imported statically).
//
// The drawing is ChalkQuadcopter's (components/worlds/idiots/chalk.tsx: four
// rotors on crossed arms, a strapped battery, a board, a camera stub, a loose
// wire; our own drawing, never a window, feed or label, IC-3I-08), rasterized
// by Chromium's own feTurbulence / feDisplacementMap (the same `chalkRough`
// filter: fractalNoise 0.9, 2 octaves, seed 7, scale 1.6), so the sprite is
// the chalk the page draws, frozen once.
//
//   drone-chalk.png      DEFAULT (`systems.drone` "chalk-sprite"): --w-chalk
//                        #f2efe6 through the chalk filter.
//   drone-blueprint.png  ALT ("blueprint"): --w-bp-line #cfe8f7, clean
//                        strokes (a drafting line, no chalk roughness).
//
// Both 192 × 134 px (the 120 × 84 viewBox at 1.6×): the game shows the
// sprite at ≈ 5.5 % of the band width (72 CSS px at 1440), so 192 px covers
// a 2× screen up to a 96 px sprite. The stroke is 3.2 user units so the
// line reads ≈ 2 px at the flying size (the page's chalk weight).
//
//   node assets/p3/games/bake-drone-sprites.mjs
//
// Needs playwright (with a Chromium) and sharp. Run by hand; not part of the
// build.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const W = 192;
const H = 134;

/** ChalkQuadcopter's strokes (viewBox 0 0 120 84), verbatim geometry. */
function drawing(stroke, filtered) {
  const rotors = [
    [22, 26],
    [98, 26],
    [14, 50],
    [106, 50],
  ];
  const rotorSvg = rotors
    .map(([x, y]) => `<path d="M${x} ${y + 2} L${x} ${y + 7}"/><ellipse cx="${x}" cy="${y}" rx="15" ry="3.4" stroke-opacity="0.85"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="-2 -2 124 86" style="display:block">
 <defs><filter id="c" x="-5%" y="-20%" width="110%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6"/>
 </filter></defs>
 <g ${filtered ? 'filter="url(#c)"' : ""} stroke="${stroke}" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 30 L60 42 L98 30 M14 52 L60 42 L106 52"/>
  ${rotorSvg}
  <rect x="46" y="36" width="28" height="12" rx="2"/>
  <path d="M49 36 L49 30 L71 30 L71 36 M56 30 L56 36 M64 30 L64 36" stroke-opacity="0.9"/>
  <rect x="56" y="50" width="8" height="6" rx="1"/>
  <path d="M48 48 L44 60 M72 48 L76 60 M40 60 L48 60 M72 60 L80 60" stroke-opacity="0.8"/>
  <path d="M74 40 C82 44 80 50 86 50" stroke-opacity="0.6" stroke-width="2.2"/>
 </g>
</svg>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const [name, stroke, filtered] of [
  ["drone-chalk.png", "#f2efe6", true],
  ["drone-blueprint.png", "#cfe8f7", false],
]) {
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${drawing(stroke, filtered)}</body></html>`);
  const shot = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  const out = fileURLToPath(new URL(`./${name}`, import.meta.url));
  await sharp(shot).png({ compressionLevel: 9, palette: true, colours: 64, dither: 0 }).toFile(out);
  console.log(`wrote ${out}`);
}
await browser.close();
