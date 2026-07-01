import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/visuals/spotlight-card";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { testimonials } from "@/lib/content";

const HONORIFICS = new Set([
  "dr",
  "dr.",
  "mr",
  "mr.",
  "ms",
  "ms.",
  "mrs",
  "mrs.",
  "prof",
  "prof.",
]);

/** Initials monogram from a display name, skipping honorifics. Pure + guarded
 *  for noUncheckedIndexedAccess (never throws, never returns undefined). */
function monogram(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((p) => p.length > 0 && !HONORIFICS.has(p.toLowerCase()));
  const first = parts[0];
  const last = parts[parts.length - 1];
  const a = first?.[0] ?? "";
  const b = parts.length > 1 ? (last?.[0] ?? "") : "";
  const out = `${a}${b}`.toUpperCase();
  return out.length > 0 ? out : "•";
}

export function Testimonials() {
  const [lead, ...rest] = testimonials;

  return (
    <Section
      id="voices"
      seam
      rhythm="default"
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
        className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {lead ? (
          <RevealItem role="listitem" className="sm:col-span-2">
            <SpotlightCard
              tier="showcase"
              className="relative h-full overflow-hidden p-8 sm:p-10"
            >
              {/* giant clipped opening quote — decorative, aqua low-alpha */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-1 -top-12 select-none font-serif text-[10rem] leading-none text-aqua/10 transition-colors duration-300 group-hover:text-aqua/20 lg:text-[14rem]"
              >
                &ldquo;
              </span>
              <figure className="relative flex h-full flex-col">
                <blockquote className="editorial max-w-3xl font-serif text-2xl italic leading-snug text-ink/95 sm:text-3xl">
                  {`“${lead.quote}”`}
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-aqua/30 bg-aqua/5 font-mono text-sm tracking-wide text-aqua"
                  >
                    {monogram(lead.name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">
                      {lead.name}
                    </span>
                    <span className="text-xs text-muted">{lead.roleLine}</span>
                  </span>
                </figcaption>
              </figure>
            </SpotlightCard>
          </RevealItem>
        ) : null}

        {rest.map((t) => (
          <RevealItem key={t.name} role="listitem" className="h-full">
            <SpotlightCard tilt className="h-full p-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 right-3 select-none font-serif text-7xl leading-none text-aqua/10 transition-colors duration-300 group-hover:text-aqua/25"
              >
                &rdquo;
              </span>
              <figure className="relative flex h-full flex-col">
                <blockquote className="editorial flex-1 text-[0.98rem] italic leading-relaxed text-ink/90">
                  {`“${t.quote}”`}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-elevated font-mono text-xs tracking-wide text-stone"
                  >
                    {monogram(t.name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">{t.name}</span>
                    <span className="text-xs text-muted">{t.roleLine}</span>
                  </span>
                </figcaption>
              </figure>
            </SpotlightCard>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
