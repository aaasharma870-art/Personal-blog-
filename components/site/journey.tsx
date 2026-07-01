import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { JourneyExperience } from "@/components/site/journey-experience";

export function Journey() {
  return (
    <Section
      id="journey"
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
        index="02"
        eyebrow="The Journey"
        title="How the methodology was earned."
        intro="Every part of the process I trust today exists because an earlier, prettier version of it failed me first. Step through it."
        variant="right"
      />
      <JourneyExperience />
    </Section>
  );
}
