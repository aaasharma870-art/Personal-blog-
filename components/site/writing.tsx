import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { SignalThumb } from "@/components/visuals/signal-thumb";
import { writing } from "@/lib/content";

export function Writing() {
  return (
    <Section
      id="writing"
      seam
      rhythm="tight"
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
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {writing.map((post) => {
          const killed = post.title.toLowerCase().includes("kill-list");
          return (
            <RevealItem
              key={post.title}
              role="listitem"
              className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface/70 shadow-[inset_0_1px_0_0_rgba(230,237,243,0.05),0_16px_36px_-18px_rgba(0,0,0,0.7)] transition-colors duration-200 hover:border-aqua/40"
            >
              {/* Higgsfield thumbnail slot (Phase 5) — deterministic SVG for now. */}
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line bg-canvas">
                <SignalThumb seed={post.title} className="absolute inset-0" />
                <span className="draft-pulse eyebrow absolute right-3 top-3 rounded-full border border-aqua/30 bg-canvas/70 px-2 py-0.5 text-aqua/80">
                  Draft
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Tag accent={killed ? "ember" : "aqua"}>{post.tag}</Tag>
                </div>
                <h3 className="font-serif text-xl font-medium text-ink transition-colors duration-200 group-hover:text-aqua-bright">
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone">
                  {post.angle}
                </p>
              </div>
            </RevealItem>
          );
        })}
      </Reveal>

      <Reveal className="mt-6">
        <p className="text-sm text-muted">
          Drafts in progress — published essays will appear here.
        </p>
      </Reveal>
    </Section>
  );
}
