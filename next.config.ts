import type { NextConfig } from "next";

/* The browser data diet (PHASE3-SPEC §12.1, "initial route ≤ +6 KB gz JS"):
   the client copies of the four data modules every client component reaches
   drop their documentation-only fields (media provenance notes, variant
   notes, beats/tempo/estVh). Server renders, Node and tsc read the full
   source. See scripts/build/browser-data-loader.cjs. */
/* `next dev` blocks /_next/* (the HMR socket included) for any host it was not
   started with: open at http://127.0.0.1:3000 or a LAN address and the dev site
   NEVER hydrates (no dock, no Director's cut, no eggs, no smooth scroll, no
   stage) while the plain server render and the intro still look fine (Oct 20).
   These hosts are allowed in development only; `next build` / `next start`
   ignore the option. Patterns match dot segments (`*` = one segment). */
const devHosts = [
  "127.0.0.1",
  "[::1]",
  "*.localhost",
  "*.local",
  "192.168.*.*",
  "10.*.*.*",
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: devHosts,
  turbopack: {
    rules: {
      "*.ts": {
        condition: { all: ["browser", { path: /^lib\/(media|variants|page|film)\.ts$/ }] },
        loaders: [require.resolve("./scripts/build/browser-data-loader.cjs")],
        as: "*.ts",
      },
    },
  },
  images: {
    // Serve modern formats; Next negotiates AVIF → WebP → source per request,
    // so the committed downsized PNG stills ship tiny to real browsers.
    formats: ["image/avif", "image/webp"],
    // Ambient backdrops render at low quality behind heavy scrims (see
    // AmbientBackground, quality 45). Every value used by a <Image quality>
    // must be listed here or Next 16 throws at request time.
    qualities: [45, 55, 75],
    // The ladder stops at 2048 again (Oct 20, fix5). A 2560 rung (added in the
    // blur pass) made a cold DPR 2 hero plate take 8.6 s instead of 3.9 s: the
    // sharp optimizer is ~2.7x slower at 2560 than at 2048, and 62 srcsets
    // listed it. The corrected `sizes` hints stay, so the right rung <= 2048
    // is still the one requested; a retina full-bleed plate (≈ 2900 device px)
    // gets the 2048 rung stretched 1.4x, as it always did.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
