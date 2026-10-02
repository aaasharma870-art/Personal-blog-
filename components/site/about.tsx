import { beatAttrs } from "@/lib/beats";
import { pillars } from "@/lib/content";
import { copyText, copyVisible, variantChoiceOf } from "@/lib/sections";
import { pieceVariant } from "@/lib/variants";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { AboutBio } from "@/components/site/about-bio";
import { AboutPillars } from "@/components/site/about-pillars";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import { ScrubSentence, splitAround } from "@/components/words/scrub-sentence";
import { SCRUB_LINES } from "@/components/words/words-data";
import type { SectionProps } from "@/components/sections/types";

/**
 * About — story `split` (Act I "The Crossing", pirates canvas; SPEC v2 §3
 * row 1; RECOGNIZABILITY S05). A first log entry, quiet and plain: the bio
 * and the method note on the left; on the right the four pillars sit as four
 * bearings around JACK'S COMPASS (lid open on its star chart; the red arrow
 * points at the pillar you reach for). The scene is named in visible text,
 * in the world face, opposite the h2 (rule b):
 *   JACK’S COMPASS — IT POINTS TO WHAT YOU WANT MOST • PIRATES OF THE CARIBBEAN
 * (cap.about; never beside a metric — About has none). Ground: the rhumb
 * lattice ≤ 4 %, desktop (PC-02). No backdrop video, no spotlight cards, no
 * ghost numerals (retired, SPEC §11.3).
 *
 * PHASE 3 (W3-PIRATES; PHASE3-SPEC §2.3 rows B07–B09):
 *   B07  the h2 arrives STAMPED in character (Pirata One; Act I's one
 *        animated h2), a time star through the spotlight (words binder);
 *   B08  pillar 02's second sentence is the Act I scroll-scrubbed sentence
 *        (server markup; a drifted source renders plain), then the compass
 *        toy's invite ("Spin Jack's compass", §9.2 #1; desktop only);
 *   B09  the about end → journey head match cut: the stage's cue 2
 *        (MV-05a, lib/page.ts) meets the voyage window's JV frame 0 (its
 *        pair, B09-window, sits on the window in journey-voyage.tsx). The
 *        marker below is the beat's scroll range (no paint, no layout).
 */
export function About({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  const choice = variantChoiceOf(entry);

  // B08: the exact spec §8.3 sentence inside pillar 02 (null → plain text)
  const bodies = pillars.map((p, i) => {
    if (i !== 1) return p.body;
    const parts = splitAround(p.body, SCRUB_LINES.B08.text);
    return parts ? (
      <>
        {parts[0]}
        <ScrubSentence text={parts[1]} beat="B08" variant={pieceVariant(choice, "scrub")} />
        {parts[2]}
      </>
    ) : (
      p.body
    );
  });
  const toy = copyText("toy.compass.label");

  return (
    <WorldSection entry={entry} labelledBy={titleId} ground>
      <div className="grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <SectionHead
          id={titleId}
          number={number}
          label={entry.nav?.label ?? "About"}
          title="A builder of quantitative systems."
          className="lg:col-span-7"
          inCharacter
          world="pirates"
          beat="B07"
          variant={pieceVariant(choice, "title-pirates")}
        />
        {/* ≥ lg: opposite the h2; below lg it sits under the compass,
            which leads the pillars (AboutPillars) */}
        <SceneCaption
          k="cap.about"
          place="head"
          className="hidden lg:col-span-5 lg:block lg:justify-self-end lg:pb-3 lg:text-right lg:before:left-auto lg:before:right-0"
        />
      </div>
      <div className="mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          <AboutBio />
        </div>
        {/* #about-pillars: the stage's cue 2 anchor (PHASE3-SPEC §3.2 cue plan) */}
        <div id="about-pillars" className="lg:col-span-7">
          <AboutPillars
            choice={choice}
            bodies={bodies}
            toy={copyVisible(toy) ? toy.text : null}
            caption={<SceneCaption k="cap.about" place="under" className="mt-0" />}
          />
        </div>
      </div>
      {/* B09 (match cut, scroll): the about's end into the journey head. An
          empty, unpainted box from the content's end down ≥ 300 px (the
          beats probe's minimum scroll-star span at 1440 and 1024) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0"
        style={{ top: "100%", height: "max(40vh, 300px)" }}
        {...beatAttrs("B09", { weight: 1 })}
      />
    </WorldSection>
  );
}
