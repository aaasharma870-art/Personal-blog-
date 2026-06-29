import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/visuals/spotlight-card";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { about, pillars } from "@/lib/content";

export function About() {
  return (
    <Section
      id="about"
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
        index="01"
        eyebrow="About"
        title="A builder of quantitative systems."
        variant="left"
      />

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        <Reveal variant="left" className="lg:col-span-5">
          <div className="space-y-5 text-base leading-relaxed text-stone">
            <p>{about.bio}</p>
            <p>{about.bioSecond}</p>
          </div>
          <figure className="mt-8 border-l-2 border-gold/40 pl-5">
            <figcaption className="eyebrow mb-2 text-muted">On method</figcaption>
            <blockquote className="editorial text-[1.02rem] italic leading-relaxed text-ink/90">
              {about.philosophyNote}
            </blockquote>
          </figure>
        </Reveal>

        <Reveal
          stagger
          role="list"
          ariaLabel="Four operating pillars"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7"
        >
          {pillars.map((p) => (
            <RevealItem key={p.index} role="listitem" className="h-full">
              <SpotlightCard tilt className="h-full p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-lg font-medium text-ink">
                    {p.title}
                  </h3>
                  <span className="font-mono text-xs text-aqua/80">
                    {p.index}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone">
                  {p.body}
                </p>
              </SpotlightCard>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
