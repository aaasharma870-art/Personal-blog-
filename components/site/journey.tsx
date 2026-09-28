import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { JourneyExperience } from "@/components/site/journey-experience";
import { anchorId } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

export function Journey({ entry, number }: SectionProps<"journey">) {
  return (
    <Section
      id={anchorId(entry)}
      seam
      backdrop={
        <AmbientBackground
          image="/media/still-calm.png"
          video="/media/v-network.mp4"
          opacity={0.34}
          overlayClassName="bg-gradient-to-b from-canvas/82 via-canvas/86 to-canvas/92"
        />
      }
    >
      <SectionHeading
        index={number ?? ""}
        eyebrow="The Journey"
        title="How the methodology was earned."
        intro="Every part of the process I trust today exists because an earlier, prettier version of it failed me first. Step through it."
        variant="right"
      />
      <JourneyExperience />
    </Section>
  );
}
