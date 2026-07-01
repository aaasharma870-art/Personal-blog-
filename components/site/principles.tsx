import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { PrincipleRow } from "@/components/site/principle-row";
import { principles } from "@/lib/content";

export function Principles() {
  return (
    <Section
      id="principles"
      seam
      rhythm="spacious"
      backdrop={
        <AmbientBackground
          image="/media/still-rays-img.png"
          opacity={0.3}
          overlayClassName="bg-gradient-to-b from-canvas/82 via-canvas/86 to-canvas/92"
        />
      }
    >
      <SectionHeading
        index="05"
        eyebrow="Operating Principles"
        title="A small philosophy of work."
        intro="Five ideas I actually use when I build. The names are sources, not decoration."
        variant="scale"
      />

      {/* Editorial numbered rows — deliberately NOT a card grid. */}
      <Reveal
        stagger
        role="list"
        ariaLabel="Operating principles"
        className="mt-14 border-t border-line"
      >
        {principles.map((p) => (
          <PrincipleRow key={p.n} principle={p} />
        ))}
      </Reveal>
    </Section>
  );
}
