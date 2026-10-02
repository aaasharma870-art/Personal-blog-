import { beatAttrs } from "@/lib/beats";
import { cn } from "@/lib/utils";

/* ============================================================================
   SUBTITLE (spec §8.4, L5) — OWNER: W2-CARDS.
   An act logline as ONE static subtitle line in its card's lower bar:
   Geist 500, 20 px @1440 / 18 @1024, --fg on the bar's deep (AA), centred,
   wrapping to ≤ 2 lines at 1024 (app/p3/cards.css `.act-card-subtitle`).
   Real text, read once by a screen reader. Server markup (no hooks): the
   pinned card (DESKTOP_FINE + the boot gate) shows it during star (b) — it
   fades in (200 ms) at p .50 and out (200 ms) as the mask opens the bars,
   by STATE (CardShell's `data-card-phase`), never scrubbed. Everywhere else
   (phones, tablets, no JS, reduced motion at boot, a paused boot) it is
   screen-reader only, so no layout changes there; a mid-session Pause or
   reduced motion shows the static settled card (the h2 and the caption).
   No reason subtitles, nothing in the global bars, no time-held cues (the
   loglines are single static lines; Phase 2 may make them multi-cue).
   HONESTY: the loglines are Aryan's drafts, rendered `unsigned`
   (lib/film.ts `loglines`; validator #10 lists them under RELEASE=1).
   ========================================================================== */

export type SubtitleProps = {
  text: string;
  className?: string;
  /** The subtitle beat (e.g. "B04-subtitle"; data-beat on the line). */
  beat?: string;
};

export function Subtitle({ text, className, beat }: SubtitleProps) {
  if (!text) return null;
  return (
    <p className={cn("act-card-subtitle", className)} data-subtitle="" {...(beat ? beatAttrs(beat) : {})}>
      <span className="act-card-subtitle-line">{text}</span>
    </p>
  );
}
