import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { capabilities } from "@/lib/content";

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="eyebrow mb-1 block lg:hidden">{label}</span>
      <p className="text-sm leading-relaxed text-stone">{value}</p>
    </div>
  );
}

export function Capabilities() {
  return (
    <Section
      id="systems"
      seam
      backdrop={
        <AmbientBackground
          image="/media/still-blueprint.png"
          opacity={0.24}
          overlayClassName="bg-gradient-to-b from-canvas/82 via-canvas/86 to-canvas/92"
        />
      }
    >
      <SectionHeading
        index="04"
        eyebrow="Systems · Capabilities"
        title="What I can actually do."
        intro="A working map, not a skills cloud: the methods I rely on, the tools behind them, and what they are meant to produce."
        variant="right"
      />

      <Reveal className="mt-12 hidden border-b border-line pb-3 lg:block">
        <div className="grid grid-cols-12 gap-6">
          <span className="eyebrow col-span-2">Area</span>
          <span className="eyebrow col-span-5">Methods</span>
          <span className="eyebrow col-span-3">Tools</span>
          <span className="eyebrow col-span-2">Outputs</span>
        </div>
      </Reveal>

      <Reveal
        stagger
        role="list"
        ariaLabel="Capabilities matrix"
        className="divide-y divide-line lg:mt-0"
      >
        {capabilities.map((c) => (
          <RevealItem
            key={c.area}
            role="listitem"
            className="row-rail group relative -mx-3 grid grid-cols-1 gap-3 rounded-r-md px-3 py-6 transition-colors duration-200 hover:bg-elevated/25 lg:grid-cols-12 lg:gap-6"
          >
            <div className="lg:col-span-2">
              <span className="font-serif text-lg text-ink transition-colors duration-200 group-hover:text-gold-bright">
                {c.area}
              </span>
            </div>
            <Field label="Methods" value={c.methods} className="lg:col-span-5" />
            <Field label="Tools" value={c.tools} className="lg:col-span-3" />
            <Field label="Outputs" value={c.outputs} className="lg:col-span-2" />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
