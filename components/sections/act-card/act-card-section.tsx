import type { ReactNode } from "react";
import { film, type ActSpec, type CaptionKey, type Copy } from "@/lib/film";
import { numberWord } from "@/lib/derive";
import { isMediaId, markOf, resolveMedia, resolveVariant, type MediaId } from "@/lib/media";
import {
  actCards,
  acts,
  bearingOf,
  captionKeyFor,
  captionOf,
  copyText,
  copyVisible,
  enabledSections,
  intensityOf,
  letteringFor,
  sectionById,
  toneOf,
  worldOf,
  type ActCardItem,
} from "@/lib/sections";
import { cn } from "@/lib/utils";
import type { Variant } from "@/lib/variants";
import type { ToneId, WorldId } from "@/lib/worlds";
import { EggHint } from "@/components/eggs/egg-hint";
import { FilmQuote } from "@/components/site/film-quote";
import { FilmTitle, SceneCaption } from "@/components/primitives/scene-caption";
import {
  IgniteLumosFrame,
  OpeningMapFrame,
  SeamChalkFrame,
  TintypeDeadEyeFrame,
} from "@/components/sections/act-card/alt-frames";
import type { CaptionCue } from "@/components/sections/act-card/card-captions";
import { CardReveal } from "@/components/sections/act-card/card-reveal";
import { CardShell } from "@/components/sections/act-card/card-shell";
import { buildPin, type PinPlates } from "@/components/sections/act-card/pin-build";
import { StageScrim } from "@/components/stage/scrim";
import { Subtitle } from "@/components/stage/subtitle";
import { IgniteFrame } from "@/components/sections/act-card/frames/ignite";
import { OpeningFrame, type OpeningRow } from "@/components/sections/act-card/frames/opening";
import { OpeningPlateFrame } from "@/components/sections/act-card/frames/opening-plate";
import { ReelFrame } from "@/components/sections/act-card/frames/reel";
import { SeamFrame } from "@/components/sections/act-card/frames/seam";
import { TintypeFrame } from "@/components/sections/act-card/frames/tintype";

/**
 * ActCardSection — renders one DERIVED act card (lib/derive.ts
 * `ActCardItem`: kind "act") as a letterboxed loading-reel interstitial
 * (SPEC v2 §8.2, §9.3; act-cards.BAR). A SERVER component: it resolves
 * everything that is data — the FILM title (in its fan face), the act title
 * (and its world lettering), the epigraph or TIP (a film line only through
 * <FilmQuote>), the MOMENT captions, the Meta credit and reel mark, the
 * world media for BOTH variants, the neighbouring grounds, the opening
 * program — and hands the client CardShell + the transition's frame only
 * plain props and server markup. Choreography by `transition`:
 *   opening (act 1) · seam (pirates>idiots, long) · tintype (idiots>rdr2,
 *   0 travel) · ignite (rdr2>hp or idiots>hp, long) · reel (unknown pair) ·
 *   title (same world).
 *
 * RECOGNIZABILITY (M2, binding; §4.3, §5 S03/S04/S07/S13/S17, §8): every card,
 * DEFAULT and ALT, names its FILM prominently (the world's fan face at
 * --text-title, above the frame), shows the film's most iconic imagery
 * (iconic-pearl; the ICE lecture hall; the Heartlands at
 * golden hour / Dead Eye; the Great Hall) and names the MOMENT under the
 * frame ("THE BLACK PEARL • PIRATES OF THE CARIBBEAN"). The world change
 * into and out of every card is a dissolve (CardShell prev/next grounds,
 * the hero feather, each frame's own morph).
 *
 * Copy gates (SPEC §9.6): `proposed` strings render in dev / preview, and
 * in production only after sign-off; a gated act title falls back to its
 * numeral ("Act II") so no heading is ever empty; a gated caption is simply
 * absent (captionOf → null).
 *
 * Variants (lib/variants.ts, piece `card-<kind>.choreo`): every authored
 * transition hands CardShell its DEFAULT `frame` and its ALT `altFrame`
 * (lazy chunks, components/sections/act-card/alt-frames.tsx), each with its
 * own plates (resolveVariant) and its own captions (captionKeyFor); the
 * shell plays `item.variant` (or the ?variant=… preview). The generic
 * `reel` / `title` cards have no alternate.
 *
 * Phase 3 (PHASE3-SPEC §6.2, §7.1–§7.6, §8.1, §8.4; W2-CARDS): the four
 * authored cards PIN (item.travel; the boot gate only). Here the server
 * builds what the pinned card plays (pin-build.ts: the registered crops on
 * MATCH_ROW, the GL specs, the push-ins, the impact, the title mask, the
 * beats) and the act LOGLINE as the lower bar's static subtitle (copy-gated;
 * Aryan's unsigned drafts), the seam's "HERE BE MONSTERS" (pc-kraken) and
 * the opening program's stage backdrop. Below the pin mode none of it
 * changes what a card shows.
 */

/** When each piece of the lower bar rises (card passage / pinned p). */
const REVEAL: Record<ActCardItem["transition"], { title: number; line: number }> = {
  opening: { title: 0.05, line: 0.5 },
  seam: { title: 0.05, line: 0.75 },
  tintype: { title: 0.66, line: 0.74 },
  ignite: { title: 0.25, line: 0.6 },
  reel: { title: 0.1, line: 0.5 },
  title: { title: 0.1, line: 0.5 },
  flight: { title: 0.1, line: 0.5 },
};

/** When the film title rises: with the card, before the act title (it is
 *  the first thing a stranger reads). */
const FILM_AT: Record<ActCardItem["transition"], number> = {
  opening: 0.02,
  seam: 0,
  tintype: 0.35,
  ignite: 0.12,
  reel: 0.05,
  title: 0.05,
  flight: 0.05,
};

/** Pin mode (P3-11 r1, hooks + panel J2 #1 / J4 #5): where the card opens
 *  on the OLD world's picture (the seam's storm, the ignite's camp), the new
 *  film's title lands as the transition visibly starts (star (a) progress
 *  .045 ≈ the card's p .02, just inside the hook frame), never while the
 *  card approaches over the old world's image and caption. The opening and
 *  the tintype open on their own world: their title is up from arrival. */
const FILM_PIN: Partial<Record<ActCardItem["transition"], number>> = { seam: 0.045, ignite: 0.045 };

const visible = (c: Copy | { text: string; status: string } | null | undefined) =>
  Boolean(c && copyVisible(c));

function titleOf(item: ActCardItem): string {
  return visible(item.titleCopy) ? item.title : `Act ${item.numeral}`;
}

/** `id` when it resolves to FILM media; never a legacy still (validator:
 *  a film world's media may not resolve to provenance "legacy"). null →
 *  the frame draws its code alternative. Exported for /lab/variants. */
export function usable(id: MediaId | undefined): MediaId | null {
  const a = id ? resolveMedia(id) : null;
  return id && a && a.provenance.source !== "legacy" ? id : null;
}

/** The asset a variant of `id` renders (its registered ALT when usable),
 *  as an id; null when `id` is not usable film media. */
export function variantMedia(id: MediaId | undefined, v: Variant): MediaId | null {
  const d = usable(id);
  if (!d) return null;
  const a = resolveVariant(d, v);
  return a && a.provenance.source !== "legacy" ? a.id : d;
}

/** The program on the opening card: one row per act card in page order,
 *  plus the Intermission where the films chapter sits (SM-3, TA-04). */
export function openingRows(): OpeningRow[] {
  const rows: OpeningRow[] = [];
  const films = copyText("films.h2");
  for (const s of enabledSections) {
    const card = actCards.find((c) => c.before === s.id);
    if (card) {
      rows.push({
        key: card.id,
        href: `#${card.id}`,
        title: titleOf(card),
        credit: card.credit ? `Act ${card.numeral} • ${card.credit}` : card.label,
        bearing: bearingOf(card.n - 1),
        world: card.to,
      });
    }
    if (s.type === "films" && s.anchor !== false) {
      rows.push({
        key: s.id,
        href: `#${s.id}`,
        title: visible(films) ? films.text : "Intermission",
        credit: "Intermission",
        bearing: Number.NaN, // filled below: between its neighbours
        world: "house",
      });
    }
  }
  rows.forEach((r, i) => {
    if (!Number.isNaN(r.bearing)) return;
    const a = rows[i - 1]?.bearing ?? 0;
    const b = rows[i + 1]?.bearing ?? a + 90;
    r.bearing = (a + b) / 2;
  });
  return rows;
}

/* — Neighbouring grounds (the dissolve into / out of the card) ——————— */

type Ground = { world: WorldId; tone: ToneId };

/** The section right before the card's first section (null at the top). */
function prevSection(item: ActCardItem) {
  const i = enabledSections.findIndex((s) => s.id === item.before);
  return i > 0 ? enabledSections[i - 1] : null;
}

/** The ground the reader leaves: the previous section's plane — the films
 *  chapter included: its last screen's bottom 24vh returns to the chapter's
 *  own house deep (film-screen.tsx T6), so the tintype card's top dissolves
 *  FROM house deep (T7; painting the last act's deep here left a band where
 *  the house blue-black met it, D10-act-3-enter). */
function groundBefore(item: ActCardItem): Ground | null {
  const prev = prevSection(item);
  if (!prev) return null;
  return { world: worldOf(prev), tone: toneOf(prev) };
}

/** The ground the reader arrives on: the card's first section. */
function groundAfter(item: ActCardItem): Ground | null {
  const next = sectionById(item.before);
  return next ? { world: worldOf(next), tone: toneOf(next) } : null;
}

/** The previous section's fire (plate anchor `fire`), in 0–1 of its plate:
 *  where the ignite card's embers rise from (RECOGNIZABILITY S16/S17).
 *  Exported for /lab/variants. */
export function fireBefore(item: ActCardItem): readonly [number, number] | null {
  const prev = prevSection(item);
  const media = prev ? (prev.props as { media?: unknown }).media : undefined;
  if (typeof media !== "string" || !isMediaId(media)) return null;
  const a = resolveMedia(media);
  return a ? markOf(a.id, "fire") : null;
}

/** The previous section's LIT camp plate for that variant (Voices: `media`
 *  = iconic-camp, its registered alt iconic-camp-alt) — the OUTGOING
 *  picture the ignite card holds while its embers rise (T10, ART-DIRECTOR
 *  #6). Both variants start on the lit camp (M2 critic 3 #3: the ALT used
 *  Voices' night plate MV-11, whose upper half is black, so the card entered
 *  on an empty frame with "THE CAMPFIRE" over nothing). null → no camp. */
function campBefore(item: ActCardItem, v: Variant): MediaId | null {
  const prev = prevSection(item);
  const props = prev ? (prev.props as { media?: unknown }) : null;
  const media = typeof props?.media === "string" && isMediaId(props.media) ? props.media : null;
  const id = variantMedia(media ?? undefined, v);
  return id && resolveMedia(id)?.kind === "image" ? id : null;
}

/* — Captions ———————————————————————————————————————————————————————— */

/** One MOMENT caption cue for CardCaptions, or null when the caption may
 *  not render in this build. */
function cue(
  key: CaptionKey,
  opts: {
    in?: readonly [number, number];
    out?: readonly [number, number];
    settled?: boolean;
    slot?: CaptionCue["slot"];
  } = {},
): CaptionCue | null {
  const c = captionOf(key);
  if (!c) return null;
  return {
    key,
    world: c.world,
    node: <SceneCaption k={key} place="under" className="mt-0 sm:mt-0" />,
    in: opts.in,
    out: opts.out,
    settled: opts.settled ?? true,
    slot: opts.slot,
  };
}

/** The OUTGOING caption of a transition: over the frame's top-right corner
 *  — on screen as the card enters, and beside the part of the picture the
 *  old world still holds — through the whole first half of the morph,
 *  still up at its middle (p .5), gone by .58 (ART-DIRECTOR #6: enter and
 *  mid frames carry it). */
const OUT = { out: [0.5, 0.58], settled: false, slot: "frame" } as const;
/** The incoming caption of a long card, under the frame: in as the
 *  incoming world takes over, fully up at the transition's middle (p .5) —
 *  so the mid frame names BOTH worlds, each beside its half. */
const IN_BY_MID = [0.42, 0.5] as const;

const cues = (...xs: (CaptionCue | null)[]): CaptionCue[] => xs.filter((x): x is CaptionCue => x !== null);

/** The settled caption of a card for a variant ("cap.act-2" / ".alt"). */
const settledKey = (base: CaptionKey, v: Variant) => captionKeyFor(base, v);

export function ActCardSection({
  item,
  variant,
}: {
  item: ActCardItem;
  /** Force a variant (the /lab side-by-side); default: `item.variant`. */
  variant?: Variant;
}) {
  const kind = item.transition;
  const at = REVEAL[kind];
  const title = titleOf(item);
  const titleId = `${item.id}-title`;
  const spec = film.worlds[item.to];
  // turned down (SPEC §12.4 whisper / grade): a static title card
  const first = sectionById(item.before);
  const still = (first ? intensityOf(first) : film.intensity) !== "full";

  // the FILM, named at a glance (RECOGNIZABILITY §4.3, O-1 / O-4): the
  // world's work title in its fan face at --text-title, above the frame
  const filmTitle =
    item.to !== "house" && spec.work ? (
      <p className="card-film text-[length:var(--text-title)] leading-[1.02] tracking-[0.03em] text-balance text-fg">
        <CardReveal at={FILM_AT[kind]} pinned={FILM_PIN[kind] ?? "static"}>
          <FilmTitle world={item.to} as="span" />
        </CardReveal>
      </p>
    ) : null;

  // the act h2 (lettered), smaller than the film title (§4.3)
  const face = kind === "opening" ? { lettered: false, upper: false } : letteringFor(item.lettering, title);
  const heading = (
    // a COMPLETE step (the type-title family and leading at the §4.3 size;
    // not type-title + an override, whose utility order is not guaranteed)
    <h2
      id={titleId}
      className="max-w-title font-serif text-[length:clamp(1.75rem,2.9vw,3.1rem)] leading-[1.02] font-normal tracking-[-0.015em] text-balance text-fg"
    >
      <CardReveal at={at.title}>
        <span className={cn(face.lettered && "lettered-title font-world-act", face.upper && "uppercase")}>
          {title}
        </span>
      </CardReveal>
    </h2>
  );

  // ≤ 1 line under the title: a TIP (card III) or an epigraph.
  let line: ReactNode = null;
  if (item.tip && visible(item.tip)) {
    line = (
      <p className="type-lead max-w-lead text-fg">
        <CardReveal at={at.line}>
          <span className="type-meta mr-3 align-[0.12em] text-fg-muted">Tip</span>
          {item.tip.text}
        </CardReveal>
      </p>
    );
  } else if (item.epigraph?.kind === "copy" && visible(item.epigraph.copy)) {
    line = (
      <p className="type-lead max-w-lead text-fg-muted">
        <CardReveal at={at.line}>{item.epigraph.copy.text}</CardReveal>
      </p>
    );
  } else if (item.epigraph?.kind === "quote") {
    line = (
      <CardReveal as="div" at={at.line}>
        <FilmQuote id={item.epigraph.id} rendition="epigraph" attribution="credits" excerpt />
      </CardReveal>
    );
  }

  const upperLeft =
    kind === "opening"
      ? `In ${numberWord(acts.length)} acts`
      : item.credit
        ? `Act ${item.numeral} • ${item.credit}`
        : item.label;

  let frame: ReactNode;
  let altFrame: ReactNode = null;
  let after: ReactNode = null;
  let altAfter: ReactNode = null;
  let captions: CaptionCue[] = [];
  let altCaptions: CaptionCue[] | undefined;
  // Phase 3: what each choreography's two halves draw (pin-build.ts)
  const plates: PinPlates = { from: { default: null, alt: null }, to: { default: null, alt: null } };
  // the frames' registered crops (filled once the plates are known)
  const regOf = (v: Variant, side: "from" | "to") => pinned?.regs[v][side] ?? null;
  let pinned: ReturnType<typeof buildPin> = null;
  switch (kind) {
    case "opening": {
      // S03/S04: the hero sea sinks into the deep (hero-stage.tsx's feather);
      // the Black Pearl opens by aperture from its own horizon, its top
      // feathered into the deep; the program (h2 + rows + Jack's compass)
      // below.
      const pearl = spec.media.cardStill;
      plates.to = { default: variantMedia(pearl, "default"), alt: variantMedia(pearl, "alt") };
      plates.from = { default: variantMedia(spec.media.plate, "default"), alt: variantMedia(spec.media.plate, "alt") };
      pinned = buildPin(item, plates, title);
      frame = <OpeningPlateFrame plate={plates.to.default} />;
      altFrame = <OpeningPlateFrame plate={plates.to.alt} alt />;
      const h2Copy = copyText("opening.h2");
      // ONE heading node for both choreographies (same id, same text)
      const openingHeading = (
        <h2 id={titleId} className="type-title max-w-title text-fg">
          <CardReveal at={at.title}>{visible(h2Copy) ? h2Copy.text : title}</CardReveal>
        </h2>
      );
      const rows = openingRows();
      after = <OpeningFrame heading={openingHeading} rows={rows} />;
      // the ALT's caption names the CHART, so it sits under the chart box
      // (ART-DIRECTOR #9), not under the Pearl: the shell gets none
      const chartKey = settledKey("cap.act-1", "alt");
      altAfter = (
        <OpeningMapFrame
          heading={openingHeading}
          rows={rows}
          caption={captionOf(chartKey) ? <SceneCaption k={chartKey} place="under" /> : null}
        />
      );
      captions = cues(cue(settledKey("cap.act-1", "default"), { in: [0.55, 0.8] }));
      altCaptions = [];
      break;
    }
    case "seam": {
      // S07 / T3: the storm (MV-04: no ship; the kraken under the foam) is
      // wiped into the ICE lecture hall; the sea's horizon registers on the
      // board's chalk ledge; FIG. 0 is chalked ON the board. ALT: a duster
      // wipes the storm off iconic-ice-alt.
      const from = item.from ? film.worlds[item.from] : null;
      const stormId = spec.media.reelStill ?? from?.media.plate;
      const storm = variantMedia(stormId, "default");
      const board = variantMedia(spec.media.cardStill, "default");
      if (storm || board) {
        plates.from = { default: storm, alt: variantMedia(stormId, "alt") };
        plates.to = { default: board, alt: variantMedia(spec.media.cardStill, "alt") };
        pinned = buildPin(item, plates, title);
        frame = (
          <SeamFrame
            storm={storm}
            board={board}
            graded={false}
            reg={{ storm: regOf("default", "from"), board: regOf("default", "to") }}
          />
        );
        altFrame = (
          <SeamChalkFrame
            storm={plates.from.alt}
            board={plates.to.alt}
            graded={false}
            reg={{ storm: regOf("alt", "from"), board: regOf("alt", "to") }}
          />
        );
      } else {
        frame = <ReelFrame world={item.to} still={null} kind="title" />;
      }
      captions = cues(
        cue("cap.act-2.out", OUT),
        cue(settledKey("cap.act-2", "default"), { in: IN_BY_MID }),
      );
      altCaptions = cues(
        cue("cap.act-2.out", OUT),
        cue(settledKey("cap.act-2", "alt"), { in: IN_BY_MID }),
      );
      break;
    }
    case "tintype": {
      // S13 / T7: a low sun sinks, the tintype DEVELOPS into the Heartlands
      // (MV-10) and colours to golden hour. ALT: Dead Eye — the red-sepia
      // frozen frontier (iconic-deadeye), four ember X marks locked on the
      // act points; the settled ALT keeps the grade and the marks.
      const plate = variantMedia(spec.media.cardStill, "default") ?? usable(spec.media.plate);
      const deadeye = variantMedia(spec.media.cardAltStill, "default") ?? variantMedia(spec.media.cardStill, "alt");
      plates.to = { default: plate, alt: deadeye };
      plates.from = plates.to;
      pinned = buildPin(item, plates, title);
      frame = <TintypeFrame plate={plate} reg={regOf("default", "to")} />;
      altFrame = <TintypeDeadEyeFrame plate={deadeye} reg={regOf("alt", "to")} />;
      // the plate develops over p .25–.82: its caption comes up with it
      captions = cues(cue(settledKey("cap.act-3", "default"), { in: [0.5, 0.66] }));
      altCaptions = cues(cue(settledKey("cap.act-3", "alt"), { in: [0.3, 0.45] }));
      break;
    }
    case "ignite": {
      // S17 / T10: embers rise from the camp's fire and become floating
      // candles along the Line; the lit Line (MV-07) at p .7–.85, then the
      // Great Hall (iconic-hall). ALT: one Lumos light sweeps the hall and
      // lights it; it settles on iconic-hall-alt.
      // Both worlds at mid (ART-DIRECTOR #6): the camp (Voices' own plate)
      // holds with its ember glow until p ≈ .45 while the Great Hall comes
      // up to a third from p ≈ .35, then takes the frame.
      const hall = variantMedia(spec.media.cardStill, "default") ?? usable(spec.media.plate);
      const mid = variantMedia(spec.media.cardMidStill, "default");
      const fire = fireBefore(item);
      plates.from = { default: campBefore(item, "default"), alt: campBefore(item, "alt") };
      plates.to = { default: hall, alt: variantMedia(spec.media.cardStill, "alt") ?? hall };
      pinned = buildPin(item, plates, title);
      frame = (
        <IgniteFrame
          hall={hall}
          mid={mid}
          fire={fire}
          camp={plates.from.default}
          reg={{ camp: regOf("default", "from"), hall: regOf("default", "to") }}
        />
      );
      altFrame = (
        <IgniteLumosFrame
          hall={plates.to.alt}
          camp={plates.from.alt}
          reg={{ camp: regOf("alt", "from"), hall: regOf("alt", "to") }}
        />
      );
      captions = cues(cue("cap.act-4.out", OUT), cue(settledKey("cap.act-4", "default"), { in: IN_BY_MID }));
      altCaptions = cues(cue("cap.act-4.out", OUT), cue(settledKey("cap.act-4", "alt"), { in: IN_BY_MID }));
      break;
    }
    default:
      frame = (
        <ReelFrame
          world={item.to}
          still={kind === "reel" ? (usable(spec.media.cardStill) ?? usable(spec.media.reelStill)) : null}
          kind={kind === "reel" ? "reel" : "title"}
        />
      );
  }

  const prev = groundBefore(item);
  const next = groundAfter(item);

  // Phase 3: the logline as the lower bar's static subtitle (§8.4; Aryan's
  // drafts, unsigned: copy-gated), the kraken's hint (§9.1 #6), the opening
  // program's stage backdrop (spec §3.2)
  const act = (film.acts as readonly ActSpec[]).find((a) => a.id === item.act);
  const subtitle = item.logline && visible(item.logline) ? item.logline.text : null;
  const subtitleBeat = act?.beats?.find((b) => b.kind === "subtitle")?.id;
  const krakenHint = kind === "seam" ? copyText("egg.hunt.hint.pc-kraken") : null;
  const programCue = act?.stage?.mode === "backdrop" ? act.stage.cues?.find((c) => c.at) : undefined;
  const program =
    kind === "opening" && act?.stage?.scrim && programCue?.at
      ? { id: programCue.at, scrim: <StageScrim scrim={act.stage.scrim} /> }
      : null;
  const kraken =
    krakenHint && visible(krakenHint) && pinned ? (
      // pc-kraken (§9.1 #6): DESKTOP_FINE only (cards.css), bound by the pin
      // chunk (card-p3.tsx, by delegation on the section); the frame it
      // changes is right below. Only on a card that pins (else no chunk
      // binds it), and gone with the eggs (P3-8 #2, W2 gate)
      <EggHint egg="hidden-kraken">
        <button type="button" className="act-card-kraken type-meta" data-kraken="">
          {krakenHint.text}
        </button>
      </EggHint>
    ) : null;
  const same = (g: Ground | null, w: WorldId) => g !== null && g.world === w && g.tone === "deep";

  return (
    <CardShell
      id={item.id}
      kind={kind}
      world={item.to}
      motifWorld={item.to}
      long={item.long && !still}
      still={still}
      fromGround={kind === "ignite" ? item.from : null}
      prevGround={kind === "opening" || same(prev, item.to) ? null : prev}
      nextGround={same(next, item.to) ? null : next}
      upperLeft={upperLeft}
      upperRight={kind === "opening" ? undefined : item.reel}
      film={filmTitle}
      frame={frame}
      altFrame={altFrame}
      after={after}
      altAfter={altAfter}
      captions={captions}
      altCaptions={altCaptions}
      variantChoice={item.variant}
      variant={variant}
      layout={kind === "opening" ? "flow" : "letterbox"}
      lower={
        kind === "opening" ? undefined : (
          <>
            {heading}
            {line}
          </>
        )
      }
      // the opening frame is the Pearl (aria-hidden): its summary names the
      // program; the program itself is real text and links
      summary={kind === "opening" ? "" : item.summary}
      // the opening's course (compass → rows) is its progress element
      progress={kind !== "opening"}
      travel={pinned ? item.travel : 0}
      pin={pinned?.spec ?? null}
      subtitle={subtitle ? <Subtitle text={subtitle} beat={subtitleBeat} /> : null}
      metaExtra={kraken}
      program={program}
    />
  );
}
