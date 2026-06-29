import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { writing } from "@/lib/content";

export function Writing() {
  return (
    <Section
      id="writing"
      seam
      backdrop={
        <AmbientBackground
          image="/media/still-calm.png"
          opacity={0.3}
          overlayClassName="bg-gradient-to-b from-canvas/78 via-canvas/84 to-canvas/90"
        />
      }
    >
      <SectionHeading
        index="06"
        eyebrow="Writing · Notes"
        title="Thinking in public, soon."
        intro="Short essays in progress — written for people who don't trade, about how I try not to fool myself."
        variant="left"
      />

      <Reveal
        stagger
        role="list"
        ariaLabel="Writing"
        className="mt-12 divide-y divide-line border-y border-line"
      >
        {writing.map((post) => (
          <RevealItem
            key={post.title}
            role="listitem"
            className="row-rail group relative -mx-3 flex flex-col gap-3 rounded-r-md px-3 py-5 transition-colors duration-200 hover:bg-elevated/25 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <div className="flex items-baseline gap-4">
              <Tag>{post.tag}</Tag>
              <h3 className="font-serif text-lg font-medium text-ink transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold-bright">
                {post.title}
              </h3>
            </div>
            <div className="flex items-baseline gap-4 sm:max-w-md sm:justify-end">
              <p className="text-sm leading-relaxed text-stone sm:text-right">
                {post.angle}
              </p>
              <span className="draft-pulse eyebrow shrink-0 rounded-full border border-gold/30 px-2 py-0.5 text-gold/80">
                Draft
              </span>
            </div>
          </RevealItem>
        ))}
      </Reveal>

      <Reveal className="mt-6">
        <p className="text-sm text-muted">
          Drafts in progress — published essays will appear here.
        </p>
      </Reveal>
    </Section>
  );
}
