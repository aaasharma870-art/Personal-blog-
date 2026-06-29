import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { beyond } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Beyond() {
  return (
    <Section
      id="beyond"
      seam
      backdrop={
        <AmbientBackground
          image="/media/hero-still.png"
          video="/media/v-waveform.mp4"
          opacity={0.36}
          overlayClassName="bg-gradient-to-b from-canvas/80 via-canvas/84 to-canvas/90"
        />
      }
    >
      <SectionHeading
        index="07"
        eyebrow="Beyond the screen"
        title="Discipline, service, and a trained eye."
        intro="The same temperament, away from the terminal."
        variant="left"
      />

      {/* Alternating zig-zag rows — a different organization from the card grids. */}
      <Reveal
        stagger
        role="list"
        ariaLabel="Life beyond the screen"
        className="mt-14 divide-y divide-line border-y border-line"
      >
        {beyond.map((b, i) => (
          <RevealItem
            role="listitem"
            key={b.kicker}
            className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-12 lg:items-start lg:gap-10"
          >
            <div
              className={cn(
                "lg:col-span-4",
                i % 2 === 1 && "lg:order-2 lg:col-start-9",
              )}
            >
              <p className="eyebrow text-aqua/80">{b.kicker}</p>
              <h3 className="mt-3 font-serif text-2xl font-medium text-ink">
                {b.title}
              </h3>
            </div>
            <div
              className={cn(
                "grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:col-span-7",
                i % 2 === 1 ? "lg:order-1 lg:col-start-1" : "lg:col-start-6",
              )}
            >
              {b.items.map((it) => (
                <div
                  key={it.head}
                  className="group -mx-2 rounded-md px-2 py-1 transition-colors duration-200 hover:bg-elevated/25"
                >
                  <p className="text-sm font-medium text-ink transition-colors duration-200 group-hover:text-gold-bright">
                    {it.head}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-stone">
                    {it.body}
                  </p>
                </div>
              ))}
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
