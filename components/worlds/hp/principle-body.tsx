import type { ReactNode } from "react";
import type { Variant } from "@/lib/variants";
import { ScrubSentence, splitAround } from "@/components/words/scrub-sentence";
import { SCRUB_LINES } from "@/components/words/words-data";

/* ============================================================================
   PRINCIPLE BODY — one principle's body paragraph, shared by both
   Principles choreographies (principles-map.tsx DEFAULT, principles-lumos.tsx
   ALT) so the Act IV scroll-scrubbed sentence (B55, spec §8.3, P3-7) has ONE
   host in the source (the words validator counts the scrub's hosts).

   Room 05 (`principles[4].body`): its second sentence is the scrub, exactly
   SCRUB_LINES.B55.text; the rest of the paragraph stays plain text around it.
   If the copy ever stops containing that sentence verbatim, splitAround
   returns null and the paragraph renders plain (nothing invented, nothing
   scrubbed). Server-safe markup (no hooks): identical text on every device;
   only the desktop words binder animates the sentence's words.

   SERVER ONLY in practice: principles.tsx renders room 05's paragraph here
   and hands the element to the client choreographies (`ScrubBody`), so the
   words data never ships in the first-load JS (deferred-handoffs #34).
   ========================================================================== */

/** The room whose body carries the Act IV scrub (SCRUB_LINES.B55.source). */
export const SCRUB_ROOM = 4;

/** Room `at`'s body, rendered on the server (the client renders the rest). */
export type ScrubBody = { at: number; node: ReactNode };

export function PrincipleBody({
  body,
  index,
  scrub,
  className,
}: {
  body: string;
  index: number;
  /** The manifest's `words.scrub` variant (the binder previews on top). */
  scrub?: Variant;
  className?: string;
}) {
  const parts = index === SCRUB_ROOM ? splitAround(body, SCRUB_LINES.B55.text) : null;
  return (
    <p className={className}>
      {parts ? (
        <>
          {parts[0]}
          <ScrubSentence text={parts[1]} beat="B55" variant={scrub} />
          {parts[2]}
        </>
      ) : (
        body
      )}
    </p>
  );
}
