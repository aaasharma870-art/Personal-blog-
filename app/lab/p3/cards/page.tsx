import type { Metadata } from "next";
import { actCards } from "@/lib/sections";
import { ActCardSection } from "@/components/sections/act-card/act-card-section";

/* /lab/p3/cards — the four pinned act cards on their own (PHASE3-SPEC §7.1,
   §8.1, §8.4; PHASE3-PLAN §6.1). OWNER: W2-CARDS. Not linked, noindex.
   The real cards (the same server component as the home page), in page
   order, with a breath between them so each one clears the viewport (a
   card goes live only once it has been offscreen) and pins on its own.
   Previews through the URL (lib/variants.ts, after hydration):
     ?variant=alt                       every ALT (choreographies, pushes, title mask, shape)
     ?variant=title.mask:alt            the rising title + plain bars
     ?variant=card-opening.push:alt     the rack on L01 (seam / ignite likewise)
     ?gl=off | ?gl=force                the css tier | GL in headless (SwiftShader)
     ?debug=cards                       window.__cards (tools/capture/probes/cards.mjs; on /lab always)
   Desktop with a fine pointer and motion on shows the pin mode; anything
   else shows the Phase-2 cards. */
export const metadata: Metadata = {
  title: "Cards lab",
  description: "The four pinned act cards: the transitions, the push-ins and the act titles as masks.",
  robots: { index: false, follow: false, nocache: true },
};

const PREVIEWS: readonly (readonly [string, string])[] = [
  ["Defaults", "?"],
  ["Every ALT", "?variant=alt"],
  ["Title: rising + bars", "?variant=title.mask:alt"],
  ["Push ALTs", "?variant=card-opening.push:alt,card-seam.push:alt,card-ignite.push:alt"],
  ["CSS tier", "?gl=off"],
  ["GL forced", "?gl=force"],
];

export default function CardsLabPage() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-3 px-gutter pt-[calc(var(--header-h)+2rem)] pb-tier-block">
        <h1 className="type-heading">Cards lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          The four act cards as the page plays them. On a desktop with a mouse or trackpad and motion on, each card pins: the world
          transition, a breath, then the push through the act title. Scroll slowly, or jump between them.
        </p>
        <ul className="flex flex-wrap gap-2">
          {PREVIEWS.map(([label, q]) => (
            <li key={label}>
              <a href={`/lab/p3/cards${q}`} className="type-meta rounded-sm border border-rule px-3 py-1.5 text-fg-muted hover:text-fg">
                {label}
              </a>
            </li>
          ))}
          {actCards.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="type-meta rounded-sm border border-rule px-3 py-1.5 text-fg-muted hover:text-fg">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {actCards.map((c) => (
        <div key={c.id}>
          <div aria-hidden="true" className="h-[100svh]" />
          <ActCardSection item={c} />
        </div>
      ))}
      <div aria-hidden="true" className="h-[100svh]" />
    </div>
  );
}
