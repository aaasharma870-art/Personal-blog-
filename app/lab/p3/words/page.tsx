import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { about, beyond, featuredProjects, optionAlpha, pillars, principles } from "@/lib/content";
import { getMedia } from "@/lib/media";
import { copyText } from "@/lib/sections";
import { VARIANT_REGISTRY, VARIANTS, type Variant } from "@/lib/variants";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { Collapse } from "@/components/primitives/collapse";
import { FilmTitle } from "@/components/primitives/scene-caption";
import { Meta, SectionHead } from "@/components/site/world-kit";
import { FlyThrough } from "@/components/words/fly-through";
import { PhysicalWord } from "@/components/words/physical-word";
import { ScrubSentence, splitAround } from "@/components/words/scrub-sentence";
import { PHYSICAL_WORDS, SCRUB_LINES, type ScrubBeat } from "@/components/words/words-data";
import { ReplayButton, WordsLabBinder } from "./words-lab";

/* /lab/p3/words — the word primitives' workbench (PHASE3-SPEC §8.2, §8.3,
   §8.5, §3.8, §11.5; PHASE3-PLAN §6.4). OWNER: W2-WORDS. Not linked,
   noindex. Every primitive, DEFAULT and ALT, on the page's own strings:
   titles in character (SectionHead + FilmTitle), the four scrubbed
   sentences, the two physical words, the gull and horse fly-throughs and
   the collapse. The desktop enhancer does not run on /lab: the client shell
   binds the words binder itself (DESKTOP_FINE, motion on). Add
   `?debug=words,spotlight` to log grants and plays. The horse previews the
   STAGED Muybridge trace (docs/build/media-staged/p3/sprites/horse/
   frames.json, unregistered) when it is present; the page's host gets the
   registered frames from the W3 assembler. */
export const metadata: Metadata = {
  title: "Words lab",
  description: "On desktop: the word primitives, default and alternate, on the page's own strings.",
  robots: { index: false, follow: false, nocache: true },
};

type TitleWorld = Exclude<WorldId, "house">;

/** The four in-character section heads (the hosts' own strings). */
const HEADS: readonly { world: TitleWorld; label: string; title: string }[] = [
  { world: "pirates", label: "About", title: "A builder of quantitative systems." },
  { world: "idiots", label: "Work", title: "Led by what survived scrutiny." },
  { world: "rdr2", label: "Beyond", title: "Discipline, service, and a trained eye." },
  { world: "hp", label: "Principles", title: "A small philosophy of work." },
];

/** The scrub sentences inside their full source bodies. */
const SCRUB_BODIES: Readonly<Record<ScrubBeat, string>> = {
  B08: pillars[1].body,
  B21: featuredProjects[0].learned,
  B42: beyond[3].items[0].body,
  B55: principles[4].body,
};
const SCRUB_WORLD: Readonly<Record<ScrubBeat, TitleWorld>> = { B08: "pirates", B21: "idiots", B42: "rdr2", B55: "hp" };

/** The kill-list intro line (components/sections/ledger/ledger-section.tsx). */
const LEDGER_INTRO = "Killed and never retuned — each ships a written post-mortem. This is the part I am proudest of.";

/** The staged horse frames, when present (lab preview only). */
function stagedHorse(): { frames: string[]; viewBox: string } | null {
  try {
    const file = path.join(process.cwd(), "docs/build/media-staged/p3/sprites/horse/frames.json");
    const json = JSON.parse(fs.readFileSync(file, "utf8")) as { viewBox?: string; frames?: { d?: string }[] };
    const frames = (json.frames ?? []).map((f) => f.d ?? "").filter(Boolean);
    return frames.length ? { frames, viewBox: json.viewBox ?? "0 0 183.5 100" } : null;
  } catch {
    return null;
  }
}

function variantName(key: string, v: Variant): string {
  const p = (VARIANT_REGISTRY as Record<string, { default: { name: string }; alt: { name: string } | null }>)[key];
  const name = v === "alt" ? p?.alt?.name : p?.default.name;
  return `${v === "alt" ? "ALT" : "DEFAULT"}${name ? ` · ${name}` : ""}`;
}

function Block({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-tier-group border-t border-rule pt-tier-block">
      <div className="flex flex-col gap-2">
        <h2 className="type-heading">{title}</h2>
        <p className="type-small max-w-body text-fg-muted">{note}</p>
      </div>
      {children}
    </section>
  );
}

export default function WordsLabPage() {
  const voyage = getMedia("MV-05d");
  const horse = stagedHorse();
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-tier-block px-gutter py-tier-block">
      <header className="flex flex-col gap-3">
        <h1 className="type-heading">Words lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          The word primitives of PHASE3-SPEC §8 on desktop, default and alternate. Everything is real text from the server;
          the binder only animates it, and every effect ends on the same markup. Scroll slowly: offscreen pieces arm and play
          once, one at a time.
        </p>
        <WordsLabBinder />
      </header>

      <Block title="Titles in character" note="Spec §8.2: the four section heads (SectionHead inCharacter) and the four film titles (FilmTitle inCharacter).">
        {HEADS.flatMap((h) =>
          VARIANTS.map((v) => {
            const id = `lab-t-${h.world}-${v}`;
            return (
              <div key={id} id={id} {...planeAttrs("canvas", h.world)} className="flex min-h-[55vh] flex-col justify-center gap-4 bg-bg px-8 py-10 text-fg">
                <div className="flex flex-wrap items-center gap-3">
                  <Meta fields={[h.world, variantName(`words.title-${h.world}`, v)]} />
                  <ReplayButton target={`#${id} [data-words="title"]`} />
                </div>
                <SectionHead id={`${id}-h`} label={h.label} title={h.title} inCharacter world={h.world} beat={`lab-title-${h.world}-${v}`} variant={v} />
              </div>
            );
          }),
        )}
        {HEADS.flatMap((h) =>
          VARIANTS.map((v) => {
            const id = `lab-f-${h.world}-${v}`;
            return (
              <div key={id} id={id} {...planeAttrs("deep", h.world)} className="flex min-h-[40vh] flex-col justify-center gap-4 bg-bg px-8 py-10 text-fg">
                <div className="flex flex-wrap items-center gap-3">
                  <Meta fields={["Film title", variantName(`words.title-${h.world}`, v)]} />
                  <ReplayButton target={`#${id} [data-words="title"]`} />
                </div>
                <FilmTitle world={h.world} as="h3" className="type-title text-fg" inCharacter beat={`lab-film-${h.world}-${v}`} variant={v} />
              </div>
            );
          }),
        )}
      </Block>

      <Block title="Scroll-scrubbed sentences" note="Spec §8.3: per word .28 → 1 from 92% to 52% of the viewport; reverses on the way back. The sentence is the exact source string; never a number.">
        {(Object.keys(SCRUB_LINES) as ScrubBeat[]).flatMap((beat) =>
          VARIANTS.map((v) => {
            const parts = splitAround(SCRUB_BODIES[beat], SCRUB_LINES[beat].text);
            return (
              <div key={`${beat}-${v}`} {...planeAttrs("canvas", SCRUB_WORLD[beat])} className="flex min-h-[110vh] flex-col justify-center gap-3 bg-bg px-8 text-fg">
                <Meta fields={[beat, SCRUB_LINES[beat].host, variantName("words.scrub", v)]} />
                <p className="max-w-body type-body text-fg-muted">
                  {parts ? (
                    <>
                      {parts[0]}
                      <ScrubSentence text={parts[1]} beat={`lab-scrub-${beat}-${v}`} variant={v} />
                      {parts[2]}
                    </>
                  ) : (
                    SCRUB_BODIES[beat]
                  )}
                </p>
              </div>
            );
          }),
        )}
      </Block>

      <Block title="Physical words" note="Spec §8.5: one-shot, 600 ms, the first matching word in prose. The strike stays (desktop), with or without JS.">
        {VARIANTS.map((v) => (
          <div key={`noise-${v}`} {...planeAttrs("canvas", "idiots")} className="flex min-h-[60vh] flex-col justify-center gap-3 bg-bg px-8 text-fg">
            <div className="flex flex-wrap items-center gap-3">
              <Meta fields={["B23", PHYSICAL_WORDS.B23.host, variantName("words.physical", v)]} />
              <ReplayButton target={`#lab-noise-${v} [data-words="physical"]`} />
            </div>
            <p id={`lab-noise-${v}`} className="max-w-body type-body text-fg-muted">
              <PhysicalWord text={featuredProjects[1].problem} word="noise" kind="grain" beat={`lab-noise-${v}`} variant={v} />
            </p>
          </div>
        ))}
        {VARIANTS.map((v) => (
          <div key={`killed-${v}`} {...planeAttrs("deep", "idiots")} className="flex min-h-[60vh] flex-col justify-center gap-3 bg-bg px-8 text-fg">
            <div className="flex flex-wrap items-center gap-3">
              <Meta fields={["B29", PHYSICAL_WORDS.B29.host, variantName("words.physical", v)]} />
              <ReplayButton target={`#lab-killed-${v} [data-words="physical"]`} />
            </div>
            <p id={`lab-killed-${v}`} className="max-w-body type-body text-fg-muted">
              <PhysicalWord text={LEDGER_INTRO} word="Killed" kind="strike" beat={`lab-killed-${v}`} variant={v} />
            </p>
          </div>
        ))}
      </Block>

      <Block title="Fly-throughs" note="Spec §3.8: needsIdle stars inside an image zone. Stop scrolling for 0.6 s with the zone half in view; each flies once per view. Replay flies now.">
        {VARIANTS.map((v) => (
          <div key={`gull-${v}`} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Meta fields={["B12 · the gull", variantName("words.flythrough", v)]} />
              <ReplayButton target={`#lab-gull-${v} [data-words="fly"]`} />
            </div>
            <div id={`lab-gull-${v}`} {...planeAttrs("canvas", "pirates")} className="relative aspect-video w-full max-w-[56rem] overflow-hidden bg-bg">
              <Image src={voyage.src} alt="" fill sizes="(min-width: 64rem) 56rem, 100vw" className="object-cover" />
              <FlyThrough
                kind="gull"
                path={{ points: [[-0.08, 0.3], [0.35, 0.2], [0.7, 0.26], [1.08, 0.16]], ms: 4200 }}
                beat={`lab-gull-${v}`}
                variant={v}
              />
            </div>
          </div>
        ))}
        {VARIANTS.map((v) => (
          <div key={`horse-${v}`} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Meta fields={["B45 · the horse", variantName("words.flythrough", v), horse ? "staged frames" : "no frames: no fly-through"]} />
              <ReplayButton target={`#lab-horse-${v} [data-words="fly"]`} />
            </div>
            <div id={`lab-horse-${v}`} {...planeAttrs("paper", "rdr2")} className="relative h-[22rem] w-full max-w-[56rem] overflow-hidden bg-bg">
              {horse ? (
                <FlyThrough
                  kind="horse"
                  frames={horse.frames}
                  viewBox={horse.viewBox}
                  path={{ points: [[-0.14, 0.97], [1.14, 0.97]], ms: 3600 }}
                  beat={`lab-horse-${v}`}
                  variant={v}
                />
              ) : null}
            </div>
          </div>
        ))}
      </Block>

      <Block title="Collapse" note="Spec §11.5: a native details, closed in the server HTML. Phones show it expanded; desktop animates the height; reduced motion toggles at once.">
        <Collapse summary={copyText("about.philosophy.summary").text} className="max-w-body">
          <blockquote className="mt-tier-pair type-body text-fg-muted">{about.philosophyNote}</blockquote>
        </Collapse>
        <Collapse summary={copyText("optuna.appendix.summary").text} className="max-w-body">
          <div className="mt-tier-pair flex flex-col gap-2">
            <p className="type-body text-fg">{optionAlpha.name}</p>
            <p className="type-body text-fg-muted">{optionAlpha.summary}</p>
            <p className="type-body text-fg-muted">{optionAlpha.reported}</p>
            <p className="type-body text-fg-muted">{optionAlpha.honest}</p>
          </div>
        </Collapse>
      </Block>
    </div>
  );
}
