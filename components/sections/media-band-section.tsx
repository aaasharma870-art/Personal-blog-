import type { ReactNode } from "react";
import type { SectionProps } from "@/components/sections/types";

/** RETIRED D-3 layer (P3-11 r3, F4: "cut to make room before adding"). Both
 *  `mediaBand` entries in lib/page.ts are `enabled: false`, yet the adapter's
 *  import shipped the whole client MediaBand (≈ 3.4 KB gz) in the first load
 *  of "/". The slot stays typed for the registry and renders nothing; to bring
 *  a band back, restore this adapter from git (it rendered
 *  components/site/media-band.tsx with the entry's resolved media). */
export const MediaBandSection: (props: SectionProps<"mediaBand">) => ReactNode = () => null;
