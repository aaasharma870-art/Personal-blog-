import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/visuals/spotlight-card";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <Section
      id="voices"
      seam
      backdrop={
        <AmbientBackground
          image="/media/still-calm.png"
          opacity={0.3}
          overlayClassName="bg-gradient-to-b from-canvas/80 via-canvas/84 to-canvas/90"
        />
      }
    >
      <SectionHeading
        index="08"
        eyebrow="What teachers say"
        title="In their words."
        variant="scale"
      />

      <Reveal
        stagger
        role="list"
        ariaLabel="Teacher testimonials"
        className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {testimonials.map((t) => (
          <RevealItem key={t.name} role="listitem" className="h-full">
            <SpotlightCard tilt className="h-full p-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 right-3 select-none font-serif text-7xl leading-none text-gold/10 transition-colors duration-300 group-hover:text-gold/25"
              >
                &rdquo;
              </span>
              <figure className="relative flex h-full flex-col">
                <blockquote className="editorial flex-1 text-[0.98rem] italic leading-relaxed text-ink/90">
                  {`“${t.quote}”`}
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.roleLine}</p>
                </figcaption>
              </figure>
            </SpotlightCard>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
