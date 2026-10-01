/* ============================================================================
   PHYSICAL WORD (spec §8.5, P3-7; plan §3.6) — OWNER: W2-WORDS.
   Wraps the first `word` token in `text` in a grain-settle or ember-strike
   (words.physical DEFAULT / ALT); absent → plain text.
   W1.0 stub: plain text.
   ========================================================================== */

export type PhysicalWordProps = {
  text: string;
  word: "noise" | "Killed";
  kind: "grain" | "strike";
  beat: string;
};

export function PhysicalWord({ text }: PhysicalWordProps) {
  return <>{text}</>;
}
