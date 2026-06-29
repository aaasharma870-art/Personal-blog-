import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { principles } from "@/lib/content";

export function Principles() {
  return (
    <Section
      id="principles"
      seam
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
          <RevealItem
            key={p.n}
            role="listitem"
            className="row-rail group relative -mx-3 grid grid-cols-1 gap-3 rounded-r-md border-b border-line px-3 py-8 transition-colors duration-200 hover:bg-elevated/20 sm:grid-cols-12 sm:gap-8"
          >
            <div className="sm:col-span-2">
              <span className="font-serif text-5xl font-medium leading-none text-aqua/25 transition-colors duration-300 group-hover:text-aqua/70">
                {p.n}
              </span>
            </div>
            <div className="sm:col-span-7">
              <h3 className="font-serif text-2xl font-medium text-ink">
                {p.title}
              </h3>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-stone">
                {p.body}
              </p>
            </div>
            <div className="sm:col-span-3 sm:text-right">
              {p.thinker ? (
                <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted transition-colors duration-200 group-hover:text-aqua">
                  {p.thinker}
                </span>
              ) : null}
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
