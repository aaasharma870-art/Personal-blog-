import { Footer } from "@/components/site/footer";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   CREDITS — the closing roll as its own manifest section (SPEC v2 §3 row 15,
   SM-13; house world carrying the HP bookend). A server adapter: the roll
   itself stays in components/site/footer.tsx (the loaders-eggs-chrome
   builder's file: Snitch at rest, Time-Turner 24 px, Hallows 16 px, each
   work title in its own face via <Lettered> (O-6), and the last line
   (Q-HP-2) lettered via <FilmQuote id="Q-HP-2" rendition="lettered">, S19).
   app/page.tsx renders this entry AFTER </main>, so it stays the page's
   <footer> (the contentinfo landmark); it must be the last manifest entry.
   ========================================================================== */
export function CreditsSection({ entry }: SectionProps<"credits">) {
  return <Footer entry={entry} />;
}
