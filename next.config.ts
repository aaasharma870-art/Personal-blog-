import type { NextConfig } from "next";

/* The browser data diet (PHASE3-SPEC §12.1, "initial route ≤ +6 KB gz JS"):
   the client copies of the four data modules every client component reaches
   drop their documentation-only fields (media provenance notes, variant
   notes, beats/tempo/estVh). Server renders, Node and tsc read the full
   source. See scripts/build/browser-data-loader.cjs. */
const nextConfig: NextConfig = {
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
    // Cap the ladder so a `sizes="116vw"` full-bleed still can't request a
    // 4K variant of a 1600–1920px source. No ultra-high-DPI rungs above 2048.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
