import type { ComponentType } from "react";
import type { SectionType } from "@/lib/page";
import type { SectionProps } from "@/components/sections/types";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { CredibilitySection } from "@/components/sections/credibility-section";
import { StorySection } from "@/components/sections/story-section";
import { MediaBandSection } from "@/components/sections/media-band-section";
import { pendingSection } from "@/components/sections/pending-section";
import { Projects } from "@/components/site/projects";
import { Capabilities } from "@/components/site/capabilities";
import { Principles } from "@/components/site/principles";
import { Writing } from "@/components/site/writing";
import { Testimonials } from "@/components/site/testimonials";
import { Contact } from "@/components/site/contact";

/** type → component. A mapped type over every `SectionEntry["type"]`, so a
 *  section type without a renderer, an extra key, or a renderer with the
 *  wrong props is a compile error. */
type Renderers = { [K in SectionType]: ComponentType<SectionProps<K>> };

export const registry = {
  /* Cold open: the name at sea (SPEC v2 §6). */
  hero: HeroSection,
  /* Act I + III: about (split), journey (voyage), beyond (notes). */
  story: StorySection,
  /* Act II. The legacy gauntlet still renders the chapters, the demo and
     the kill-list inside it (their own entries are M2 stubs). */
  gauntlet: Projects,
  chapter: pendingSection("chapter"),
  experiment: pendingSection("experiment"),
  matrix: Capabilities,
  ledger: pendingSection("ledger"),
  /* Intermission. */
  films: pendingSection("films"),
  /* Act III: writing (the journal), voices (the campfire). */
  index: Writing,
  quotes: Testimonials,
  /* Act IV. */
  principles: Principles,
  contact: Contact,
  /* M1: the credits roll lives in the layout footer. */
  credits: pendingSection("credits"),
  /* Retired D-3 layer (entries disabled; delete at the retirement pass). */
  credibility: CredibilitySection,
  mediaBand: MediaBandSection,
} satisfies Renderers;

/* — Strict-slot check ————————————————————————————————————————————————
   `Renderers` alone accepts ANY zero-prop component in any slot (a function
   with fewer parameters is always assignable), so `hero: CredibilityStrip`
   or `about: () => null` would compile. Each renderer must also DECLARE
   props assignable to its own slot's SectionProps<K>; a zero-prop component
   declares `unknown` and fails. On failure tsc names the offending slot(s):
   "Type '"about"' does not satisfy the constraint 'never'". Wrap a prop-less
   client component in a small server adapter (see credibility-section.tsx). */
type DeclaredProps<C> = C extends (props: infer P) => unknown ? P : unknown;
type MisTypedSlots = {
  [K in SectionType]: [DeclaredProps<(typeof registry)[K]>] extends [
    SectionProps<K>,
  ]
    ? never
    : K;
}[SectionType];
type AssertNone<T extends never> = T;
export type RegistrySlotsOk = AssertNone<MisTypedSlots>;

/** Renderer for a runtime entry. The correlation between `entry.type` and its
 *  props is guaranteed by `Renderers`; TS can't follow it through a union
 *  index, hence the single widening cast here. */
export function rendererFor(type: SectionType): ComponentType<SectionProps> {
  return registry[type] as ComponentType<SectionProps>;
}
