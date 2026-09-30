import { beatAttrs } from "@/lib/beats";

/* ============================================================================
   SCROLL-SCRUBBED SENTENCE (spec §8.3, P3-7; plan §3.6) — OWNER: W2-WORDS.
   One sentence per act, scrubbed per word (words.scrub DEFAULT / ALT). The
   host splits its body with splitAround(); null → the host renders plain
   text.
   W1.0 stub: the sentence as plain text; splitAround is real.
   ========================================================================== */

export type ScrubSentenceProps = {
  text: string;
  beat: string;
  className?: string;
};

export function ScrubSentence({ text, beat, className }: ScrubSentenceProps) {
  return (
    <span className={className} data-words="scrub" {...beatAttrs(beat)}>
      {text}
    </span>
  );
}

/** [before, sentence, after] around the first exact occurrence of
 *  `sentence` in `body`, or null when it is not there verbatim. */
export function splitAround(body: string, sentence: string): [string, string, string] | null {
  if (!sentence) return null;
  const i = body.indexOf(sentence);
  if (i < 0) return null;
  return [body.slice(0, i), sentence, body.slice(i + sentence.length)];
}
