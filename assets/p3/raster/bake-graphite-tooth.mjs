// Bakes the R-1 graphite "paper tooth" into graphite-tooth.png (PHASE3-SPEC
// §12.1 #5: the journal's live graphite filters become baked graphite).
//
// The live filter (components/worlds/rdr2/kit.tsx GraphiteFilter) is
// feTurbulence fractalNoise (baseFrequency 1.4, 2 octaves, seed 3) driving a
// sub-pixel displacement (±0.2 px typical) and the tooth: stroke alpha ×
// clamp(1.25 − 1.6·A). The tooth is the look, so it is baked HERE, by
// Chromium's own feTurbulence, as a 128 px tile (100 user units, stitched so
// it repeats seamlessly; mean alpha .45) and applied as a static CSS mask.
//
//   node assets/p3/raster/bake-graphite-tooth.mjs
//
// Needs playwright (with a Chromium) and sharp. Run by hand; not part of the
// build.
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const OUT = fileURLToPath(new URL("./graphite-tooth.png", import.meta.url));
const PX = 128;
const UNITS = 100;

const html = `<!doctype html><html><body style="margin:0;background:transparent">
<svg width="${PX}" height="${PX}" viewBox="0 0 ${UNITS} ${UNITS}" style="display:block">
 <filter id="f" x="0" y="0" width="${UNITS}" height="${UNITS}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
  <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" stitchTiles="stitch" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25"/>
 </filter>
 <rect width="${UNITS}" height="${UNITS}" filter="url(#f)"/>
</svg></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: PX, height: PX }, deviceScaleFactor: 1 });
await page.setContent(html);
const shot = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: PX, height: PX } });
await browser.close();

// black, the tooth in alpha; 64 alpha levels are plenty for paper grain
await sharp(shot).png({ compressionLevel: 9, palette: true, colours: 64, dither: 0 }).toFile(OUT);
console.log(`wrote ${OUT}`);
