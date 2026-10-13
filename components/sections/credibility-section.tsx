import type { ReactNode } from "react";
import type { SectionProps } from "@/components/sections/types";

/** RETIRED D-3 layer (P3-11 r3, F4: "cut to make room before adding"). The
 *  `credibility` entry in lib/page.ts is `enabled: false`, yet the adapter's
 *  import shipped the client CredibilityStrip (≈ 1.4 KB gz) in the first load
 *  of "/". The slot stays typed for the registry and renders nothing; to bring
 *  the strip back, restore this adapter from git (it rendered
 *  components/site/credibility-strip.tsx). */
export const CredibilitySection: (props: SectionProps<"credibility">) => ReactNode = () => null;
