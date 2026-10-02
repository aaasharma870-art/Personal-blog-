import { capabilities, featuredProjects, gauntlet } from "@/lib/content";
import { Meta, SectionHead } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { ChalkboardFrame } from "@/components/worlds/idiots/chalk";
import { DroneBand } from "@/components/worlds/idiots/drone-band";
import { IdiotsSection } from "@/components/worlds/idiots/idiots-section";
import { BlueprintSchematic } from "@/components/worlds/idiots/schematic";
import { actCards, acts, copyText, copyVisible, enabledSections, variantChoiceOf, worksInUse } from "@/lib/sections";
import { beatAttrs } from "@/lib/beats";
import type { CopyKey } from "@/lib/film";
import type { SectionProps } from "@/components/sections/types";
import { droneCopy } from "@/components/games/copy";
import chalkDrone from "@/assets/p3/games/drone-chalk.png";
import blueprintDrone from "@/assets/p3/games/drone-blueprint.png";

/** The drone game's two baked sprites (assets/p3/games/, DP-6). */
const SPRITES = {
  default: { src: chalkDrone.src, width: chalkDrone.width, height: chalkDrone.height },
  alt: { src: blueprintDrone.src, width: blueprintDrone.width, height: blueprintDrone.height },
};

/**
 * Systems — the capabilities matrix (Act II, idiots canvas; SPEC v2 §3 row 7,
 * SM-7 "same grammar"; RECOGNIZABILITY S10).
 *   1. The head band: Rancho's homemade drone in the college courtyard
 *      (iconic-drone), captioned THE HOMEMADE DRONE • 3 IDIOTS; the h2
 *      comes after it.
 *   2. A real matrix of rows (area · methods · tools · outputs).
 *   3. FIG "How this page is built": a TRUE schematic of the pipeline that
 *      renders this very page, on the ICE board in the jugaad register;
 *      every count is computed from the live manifest at build time (beat
 *      B27: the FIG inks). Under it the honesty Meta (PHASE3-SPEC §8.6:
 *      every claim carries its scope, validator P3 #6), the space-pen wink
 *      (IC-3I-06, our own phrasing, not a quote): "Why not just use a
 *      pencil?", and a footnote that checks the film's legend.
 * The graph grid thins here toward open air and keeps thinning through the
 * kill-list to 0 at its last row (3I-07): this section takes it 6 % → 3 %.
 *
 * PHASE 3 (W3-GAMES): the band hosts FLY THE HOMEMADE DRONE (PHASE3-SPEC
 * §9.2 #2): its strings are resolved here, on the server (the seven gate
 * lines carry the gauntlet's titles VERBATIM), and handed to the band, so no
 * client chunk reads lib/content for them. B26 (the take-off invite) is the
 * band's; B27 (the FIG ink) stays on the FIG column below and its ink-on is
 * a time star through the spotlight (BlueprintSchematic `star`).
 */
const COLS = [
  ["Methods", "methods"],
  ["Tools", "tools"],
  ["Outputs", "outputs"],
] as const;

/** How this page is built, scoped to where each claim is true (PHASE3-SPEC
 *  §8.6; proposed + unsigned until Aryan signs). "systems.meta.webgl"
 *  ("WebGL, where supported, only for scene changes") joined in the commit
 *  that ships the WebGL layer (W2 assembly). */
const META: readonly CopyKey[] = ["systems.meta.scroll", "systems.meta.native", "systems.meta.css", "systems.meta.webgl"];

export function Capabilities({ entry, number }: SectionProps<"matrix">) {
  const titleId = `${entry.id}-title`;
  const chain = [
    { label: "lib/page.ts", note: `manifest • ${enabledSections.length} sections` },
    { label: "lib/film.ts", note: `${acts.length} acts • ${worksInUse.length} works` },
    { label: "lib/sections.ts", note: `derives ${actCards.length} act cards` },
    { label: "registry.ts", note: "type → component" },
    { label: "SectionFrame", note: "data-world × data-tone" },
  ];
  const choice = variantChoiceOf(entry);
  const pencilQ = copyText("systems.pencil.q");
  const pencilBody = copyText("systems.pencil.body.p3");
  const pencilNote = copyText("systems.pencil.footnote");
  const meta = META.map((k) => copyText(k)).filter(copyVisible).map((c) => c.text);
  return (
    <IdiotsSection
      entry={entry}
      labelledBy={titleId}
      grid
      gridMask="linear-gradient(to bottom, black 0%, black 22%, color-mix(in srgb, black 50%, transparent) 100%)"
    >
      {entry.props.media ? (
        <DroneBand
          media={entry.props.media}
          choice={choice}
          caption={<SceneCaption k="cap.systems" place="bl" />}
          className="mb-tier-block"
          game={droneCopy(gauntlet.map((g) => g.title))}
          sprites={SPRITES}
        />
      ) : null}

      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Systems"}
        title="What I can actually do."
        intro="A working map, not a skills cloud: the methods I rely on, the tools behind them, and what they are meant to produce."
      />

      <div className="mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-8">
          {/* column heads (desktop); every cell also carries its own label */}
          <div
            aria-hidden="true"
            className="hidden border-b border-rule pb-tier-pair lg:grid lg:grid-cols-[9rem_1fr_1fr_1fr] lg:gap-6"
          >
            <span className="type-meta text-fg-muted">Area</span>
            {COLS.map(([label]) => (
              <span key={label} className="type-meta text-fg-muted">
                {label}
              </span>
            ))}
          </div>
          <ol aria-label="Capabilities matrix" className="border-t border-rule lg:border-t-0">
            {capabilities.map((c, i) => (
              <Rise
                as="li"
                key={c.area}
                delay={i * 0.04}
                className="grid grid-cols-1 gap-3 border-b border-rule py-tier-group lg:grid-cols-[9rem_1fr_1fr_1fr] lg:gap-6"
              >
                <h3 className="type-heading text-fg lg:text-[length:var(--text-lead)] lg:leading-[1.45]">{c.area}</h3>
                {COLS.map(([label, key]) => (
                  <dl key={key}>
                    <dt className="type-meta text-fg-muted lg:sr-only">{label}</dt>
                    <dd className="mt-1 type-small text-fg-muted lg:mt-0">{c[key]}</dd>
                  </dl>
                ))}
              </Rise>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-4" {...beatAttrs("B27", { weight: 2 })}>
          {/* FIG numbering continues the chapters' FIG. 1…n */}
          <ChalkboardFrame>
            <BlueprintSchematic
              compact
              fig={`FIG. ${featuredProjects.length + 1} • How this page is built • ${chain.length} stages`}
              spec={{ chain }}
              choice={choice}
              pieceKey="systems.fig"
              star={{ id: "B27", weight: 2 }}
            />
          </ChalkboardFrame>
          <Meta className="mt-tier-group" fields={meta} />
          {/* IC-3I-06: the space-pen wink, in our own words (not a quote);
              lib/film.ts copy "systems.pencil.*" (proposed). The body is the
              Phase-3 line (PHASE3-SPEC §8.6: "on desktop, one small WebGL
              layer only where the scenes change"), scoped so it is true on
              every device, so it renders everywhere (the W1 line, "no WebGL,
              just native scroll", was retired when WebGL shipped in W2). */}
          {copyVisible(pencilQ) && copyVisible(pencilBody) ? (
            <p className="mt-tier-group max-w-body type-small text-fg-muted">
              <span className="text-fg">{pencilQ.text}</span> {pencilBody.text}
            </p>
          ) : null}
          {copyVisible(pencilNote) ? (
            <p className="mt-tier-pair max-w-body type-small text-fg-muted">
              <span className="type-meta">Footnote</span> {pencilNote.text}
            </p>
          ) : null}
        </div>
      </div>
    </IdiotsSection>
  );
}
