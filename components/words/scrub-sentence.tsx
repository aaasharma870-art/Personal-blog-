import { Fragment } from "react";
import { beatAttrs, type BeatWeight } from "@/lib/beats";
import { film } from "@/lib/film";
import type { Variant } from "@/lib/variants";

/* ============================================================================
   SCROLL-SCRUBBED SENTENCE (spec §8.3, P3-7; plan §3.6) — OWNER: W2-WORDS.

   SERVER MARKUP ONLY: the sentence renders as normal text, each word in its
   own span (`[data-w]`; the spaces stay plain text between them), so it is
   fully visible and identical with no JS, under reduced motion or Pause, on
   phones and on touch. On DESKTOP_FINE with motion on, the words binder
   (components/enhance/binders/words.ts) scrubs each word's opacity
   .28 → 1 while the sentence travels from 92% to 52% of the viewport (its
   top at 92% → its bottom at 52%), on the compositor (a document
   ScrollTimeline; a scroll-synced fallback elsewhere). It reverses when the
   reader scrolls back, completes before the reading line, and registers the
   sentence as its beat's SCROLL star with the spotlight.
     DEFAULT word-opacity: word by word, in reading order.
     ALT     line-sweep: line by line, each line swept left → right.

   NEVER A NUMBER: a sentence with a digit renders as plain text, unbound.
   The four sentences are exact existing strings
   (components/words/words-data.ts SCRUB_LINES; validator words.mjs).

   HOST USE:
     const parts = splitAround(body, SCRUB_LINES.B08.text);
     parts ? <p>{parts[0]}<ScrubSentence text={parts[1]} beat="B08" />{parts[2]}</p>
           : <p>{body}</p>
   ========================================================================== */

export type ScrubSentenceProps = {
  text: string;
  /** The beat id (lib/page.ts `kind: "scrub-sentence"`), e.g. "B08". */
  beat: string;
  className?: string;
  /** The scroll star's weight (all four are 1). */
  weight?: BeatWeight;
  /** The manifest's variant (default film.defaultVariant). */
  variant?: Variant;
};

/** True when `s` holds a digit (a scrubbed sentence never does). */
export function hasDigit(s: string): boolean {
  return /\d/.test(s);
}

export function ScrubSentence({ text, beat, className, weight = 1, variant }: ScrubSentenceProps) {
  if (!text || hasDigit(text)) return <span className={className}>{text}</span>;
  const parts = text.split(/(\s+)/);
  return (
    <span
      className={className}
      data-words="scrub"
      data-words-variant={variant ?? film.defaultVariant}
      {...beatAttrs(beat, { weight })}
    >
      {parts.map((p, i) =>
        p === "" ? null : /^\s+$/.test(p) ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <span key={i} data-w="">
            {p}
          </span>
        ),
      )}
    </span>
  );
}

/** [before, sentence, after] around the first exact occurrence of
 *  `sentence` in `body`, or null when it is not there verbatim (the host
 *  then renders `body` as plain text). */
export function splitAround(body: string, sentence: string): [string, string, string] | null {
  if (!sentence) return null;
  const i = body.indexOf(sentence);
  if (i < 0) return null;
  return [body.slice(0, i), sentence, body.slice(i + sentence.length)];
}
