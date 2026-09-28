import type { ReactNode } from "react";
import type { SectionEntry } from "@/lib/page";

/**
 * SectionFrame — the per-section wrapper every manifest entry renders inside.
 *
 * A SERVER component on purpose: its props never enter the RSC payload, so
 * handing it whole manifest entries costs nothing on the wire.
 *
 * Phase 0: renders NO DOM of its own, so the page is pixel-identical to the
 * pre-manifest build; each section still owns its <section id={anchorId(entry)}>.
 * Phase 1 moves the cross-cutting concerns here: the #id from `anchorId(entry)`
 * + scroll-margin, the tone plane, an auto-seam where toneOf(prevEntry) differs,
 * density, and the enter-once reveal. If a client leaf ever needs section
 * context, mount a small client provider here that receives only serializable
 * scalars (id, tone, world, number) — never whole entries.
 */
export function SectionFrame({
  children,
}: {
  entry: SectionEntry;
  prevEntry: SectionEntry | null;
  children: ReactNode;
}) {
  return <>{children}</>;
}
