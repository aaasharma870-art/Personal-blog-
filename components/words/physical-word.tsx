import { beatAttrs, type BeatWeight } from "@/lib/beats";
import { film } from "@/lib/film";
import type { Variant } from "@/lib/variants";

/* ============================================================================
   PHYSICAL WORD (spec §8.5, P3-7; plan §3.6) — OWNER: W2-WORDS.

   SERVER MARKUP ONLY. Wraps the FIRST whole-word occurrence of `word` in
   `text`; when the token is absent (Phase 2 may reword) the text renders
   plain and nothing plays. Prose only: never in a metric, a label, a caption
   or research data (≤ 1 per section; components/words/words-data.ts
   PHYSICAL_WORDS lists the two hosts).

   One-shot, 600 ms, transform/opacity, a TIME star through the spotlight,
   played by the words binder on DESKTOP_FINE with motion on:
     grain  "noise" (optuna problem): DEFAULT a grain sprite over the word
            settles to 0 while its letters jitter by ≤ 1 px (per-letter
            translate); ALT the jitter only. The end state is the plain word.
     strike "Killed" (kill-list intro): DEFAULT an ember strike draws through
            it once (scaleX 0 → 1 on a 1.5 px bar) and STAYS as a static
            strike; ALT a graphite strike. The word stays readable.
   The static strike (`.w-strike`, app/p3/words.css) shows on DESKTOP_FINE
   with or without JS and under reduced motion, so the enhanced end state
   equals the no-JS state; phones and touch never show it (untouched).
   ========================================================================== */

export type PhysicalWordProps = {
  text: string;
  word: "noise" | "Killed";
  kind: "grain" | "strike";
  /** The beat id (lib/page.ts `kind: "physical-word"`), e.g. "B23". */
  beat: string;
  /** The star weight (both are 1). */
  weight?: BeatWeight;
  /** The manifest's variant (default film.defaultVariant). */
  variant?: Variant;
};

const WORD_CHAR = /[A-Za-z0-9'’]/;

/** Index of the first whole-word occurrence of `word` in `text`, or -1. */
export function firstToken(text: string, word: string): number {
  if (!word) return -1;
  for (let i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) {
    const before = i > 0 ? text[i - 1] : "";
    const after = text[i + word.length] ?? "";
    if (!WORD_CHAR.test(before) && !WORD_CHAR.test(after)) return i;
  }
  return -1;
}

export function PhysicalWord({ text, word, kind, beat, weight = 1, variant }: PhysicalWordProps) {
  const at = firstToken(text, word);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span
        data-words="physical"
        data-words-kind={kind}
        data-words-variant={variant ?? film.defaultVariant}
        {...beatAttrs(beat, { weight })}
      >
        {word}
        {kind === "strike" ? <span className="w-strike" aria-hidden="true" /> : null}
        <span data-words-fx="" aria-hidden="true" hidden />
      </span>
      {text.slice(at + word.length)}
    </>
  );
}
