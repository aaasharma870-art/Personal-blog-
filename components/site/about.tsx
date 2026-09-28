import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { AboutBio } from "@/components/site/about-bio";
import { AboutPillars } from "@/components/site/about-pillars";
import { anchorId } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

export function About({ entry, number }: SectionProps<"story">) {
  return (
    <Section
      id={anchorId(entry)}
      seam
      backdrop={
        <AmbientBackground
          image="/media/still-network.png"
          video="/media/v-particles.mp4"
          opacity={0.34}
          overlayClassName="bg-gradient-to-b from-canvas/80 via-canvas/84 to-canvas/90"
        />
      }
    >
      <SectionHeading
        index={number}
        eyebrow="About"
        title="A builder of quantitative systems."
        variant="left"
      />
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <AboutBio />
        </div>
        <AboutPillars />
      </div>
    </Section>
  );
}
