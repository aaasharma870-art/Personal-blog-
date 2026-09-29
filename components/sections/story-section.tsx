import type { ReactNode } from "react";
import type { SectionProps } from "@/components/sections/types";
import { About } from "@/components/site/about";
import { Journey } from "@/components/site/journey";
import { Beyond } from "@/components/site/beyond";

/**
 * StorySection — the registry slot for the structural `story` type (SPEC v2
 * §12.2). The variant picks the layout; the section's WORLD supplies the
 * skin (read `useWorld()` / `slot(entry, "dressing")` in the component):
 *   split  → About   (Act I, pirates)
 *   voyage → Journey (Act I, pirates; the voyage chart)
 *   notes  → Beyond  (Act III, rdr2: the frontier dressing)
 * A server component: it only picks, so no props enter the RSC payload.
 */
export function StorySection({ entry, number }: SectionProps<"story">): ReactNode {
  switch (entry.props.variant) {
    case "split":
      return <About entry={entry} number={number} />;
    case "voyage":
      return <Journey entry={entry} number={number} />;
    case "notes":
      return <Beyond entry={entry} number={number} />;
  }
}
