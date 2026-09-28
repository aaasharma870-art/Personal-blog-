import type { ComponentType } from "react";
import type { SectionType } from "@/lib/page";
import type { SectionProps } from "@/components/sections/types";
import { Hero } from "@/components/site/hero";
import { CredibilitySection } from "@/components/sections/credibility-section";
import { About } from "@/components/site/about";
import { Journey } from "@/components/site/journey";
import { MediaBandSection } from "@/components/sections/media-band-section";
import { Projects } from "@/components/site/projects";
import { Capabilities } from "@/components/site/capabilities";
import { Principles } from "@/components/site/principles";
import { Writing } from "@/components/site/writing";
import { Beyond } from "@/components/site/beyond";
import { Testimonials } from "@/components/site/testimonials";
import { Contact } from "@/components/site/contact";

/** type → component. A mapped type over every `SectionEntry["type"]`, so a
 *  section type without a renderer, an extra key, or a renderer with the
 *  wrong props is a compile error. */
type Renderers = { [K in SectionType]: ComponentType<SectionProps<K>> };

export const registry = {
  hero: Hero,
  credibility: CredibilitySection,
  about: About,
  journey: Journey,
  mediaBand: MediaBandSection,
  work: Projects,
  systems: Capabilities,
  principles: Principles,
  writing: Writing,
  beyond: Beyond,
  voices: Testimonials,
  contact: Contact,
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
