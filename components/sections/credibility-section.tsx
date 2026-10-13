import type { ReactNode } from "react";
import { CredibilityStrip } from "@/components/site/credibility-strip";
import type { SectionProps } from "@/components/sections/types";

/** Manifest adapter (server): the strip is a client component with no props,
 *  so the entry stays on the server instead of being serialized into the RSC
 *  payload, and the slot is typed SectionProps<"credibility"> for the registry. */
export const CredibilitySection: (
  props: SectionProps<"credibility">,
) => ReactNode = () => <CredibilityStrip />;
