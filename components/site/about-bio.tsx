import { about } from "@/lib/content";
import { Meta } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";

/** The bio (verbatim content.ts) and the method note. Server-rendered and
 *  final in the HTML; paragraphs rise once when they enter (R1). */
export function AboutBio() {
  return (
    <div className="max-w-body">
      <Rise className="space-y-tier-group">
        <p className="type-body text-fg">{about.bio}</p>
        <p className="type-body text-fg-muted">{about.bioSecond}</p>
      </Rise>
      <Rise as="figure" delay={0.08} className="mt-tier-block border-t border-rule pt-tier-group">
        <figcaption>
          <Meta fields={["On method"]} />
        </figcaption>
        <blockquote className="mt-tier-pair type-body text-fg-muted">{about.philosophyNote}</blockquote>
      </Rise>
    </div>
  );
}
