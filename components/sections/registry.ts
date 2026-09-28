import type { ComponentType } from "react";
import type { SectionType } from "@/lib/page";
import type { SectionProps } from "@/components/sections/types";
import { Hero } from "@/components/site/hero";
import { CredibilityStrip } from "@/components/site/credibility-strip";
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
 *  section type without a renderer (or a renderer with the wrong props) is a
 *  compile error. */
type Renderers = { [K in SectionType]: ComponentType<SectionProps<K>> };

export const registry: Renderers = {
  hero: Hero,
  credibility: CredibilityStrip,
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
};

/** Renderer for a runtime entry. The correlation between `entry.type` and its
 *  props is guaranteed by `Renderers`; TS can't follow it through a union
 *  index, hence the single widening cast here. */
export function rendererFor(type: SectionType): ComponentType<SectionProps> {
  return registry[type] as ComponentType<SectionProps>;
}
