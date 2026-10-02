import { about } from "@/lib/content";
import { copyText, copyVisible } from "@/lib/sections";
import { Collapse } from "@/components/primitives/collapse";
import { Meta } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";

/** The bio (verbatim content.ts) and the method note. Server-rendered and
 *  final in the HTML; paragraphs rise once when they enter (R1).
 *  Phase 3 (PHASE3-SPEC §11.5 #2, D3-9): the philosophy note sits in a
 *  native <details> closed at ≥ 64rem, summary "The philosophy note"
 *  (`about.philosophy.summary`); phones keep it open in flow (words.css),
 *  no-JS opens it natively. When the summary may not render, the note
 *  stays open as before. */
export function AboutBio() {
  const summary = copyText("about.philosophy.summary");
  const note = (
    <figure>
      <figcaption>
        <Meta fields={["On method"]} />
      </figcaption>
      <blockquote className="mt-tier-pair type-body text-fg-muted">{about.philosophyNote}</blockquote>
    </figure>
  );
  return (
    <div className="max-w-body">
      <Rise className="space-y-tier-group">
        <p className="type-body text-fg">{about.bio}</p>
        <p className="type-body text-fg-muted">{about.bioSecond}</p>
      </Rise>
      <Rise delay={0.08} className="mt-tier-block border-t border-rule pt-tier-group">
        {copyVisible(summary) ? (
          // the gap rides the summary: phones hide it and show the note in
          // flow, as before (words.css)
          <Collapse summary={summary.text} summaryClassName="mb-tier-group">
            {note}
          </Collapse>
        ) : (
          note
        )}
      </Rise>
    </div>
  );
}
