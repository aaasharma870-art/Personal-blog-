import type { ReactNode } from "react";
import { film, type Copy } from "@/lib/film";
import { numberWord } from "@/lib/derive";
import { resolveMedia, type MediaId } from "@/lib/media";
import {
  actCards,
  acts,
  bearingOf,
  copyText,
  copyVisible,
  enabledSections,
  intensityOf,
  letteringFor,
  sectionById,
  type ActCardItem,
} from "@/lib/sections";
import { cn } from "@/lib/utils";
import type { Variant } from "@/lib/variants";
import { FilmQuote } from "@/components/site/film-quote";
import {
  IgniteLumosFrame,
  OpeningMapFrame,
  SeamChalkFrame,
  TintypeDeadEyeFrame,
} from "@/components/sections/act-card/alt-frames";
import { CardReveal } from "@/components/sections/act-card/card-reveal";
import { CardShell } from "@/components/sections/act-card/card-shell";
import { IgniteFrame } from "@/components/sections/act-card/frames/ignite";
import { OpeningFrame, type OpeningRow } from "@/components/sections/act-card/frames/opening";
import { ReelFrame } from "@/components/sections/act-card/frames/reel";
import { SeamFrame } from "@/components/sections/act-card/frames/seam";
import { TintypeFrame } from "@/components/sections/act-card/frames/tintype";

/**
 * ActCardSection — renders one DERIVED act card (lib/derive.ts
 * `ActCardItem`: kind "act") as a letterboxed loading-reel interstitial
 * (SPEC v2 §8.2, §9.3; act-cards.BAR). A SERVER component: it resolves
 * everything that is data — the act title (and its world lettering), the
 * epigraph or TIP (a film line only through <FilmQuote>), the Meta credit
 * and reel mark, the world media, the opening program — and hands the
 * client CardShell + the transition's frame only plain props and server
 * markup. Choreography by `transition`:
 *   opening (act 1) · seam (pirates>idiots, long) · tintype (idiots>rdr2,
 *   0 travel) · ignite (rdr2>hp or idiots>hp, long) · reel (unknown pair) ·
 *   title (same world).
 * Copy gates (SPEC §9.6): `proposed` strings render in dev / preview, and
 * in production only after sign-off; a gated act title falls back to its
 * numeral ("Act II") so no heading is ever empty.
 *
 * Variants (lib/variants.ts, piece `card-<kind>.choreo`): every authored
 * transition hands CardShell its DEFAULT `frame` and its ALT `altFrame`
 * (lazy chunks, components/sections/act-card/alt-frames.tsx) with the same
 * media; the shell plays `item.variant` (or the ?variant=… preview). The
 * generic `reel` / `title` cards have no alternate.
 */

/** When each piece of the lower bar rises (card passage / pinned p). */
const REVEAL: Record<ActCardItem["transition"], { title: number; line: number }> = {
  opening: { title: 0.05, line: 0.5 },
  seam: { title: 0.05, line: 0.75 },
  tintype: { title: 0.8, line: 0.85 },
  ignite: { title: 0.25, line: 0.6 },
  reel: { title: 0.1, line: 0.5 },
  title: { title: 0.1, line: 0.5 },
  flight: { title: 0.1, line: 0.5 },
};

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

  const face = kind === "opening" ? { lettered: false, upper: false } : letteringFor(item.lettering, title);
  const heading = (
    <h2 id={titleId} className="type-title max-w-title text-fg">
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
  switch (kind) {
    case "opening": {
      const h2Copy = copyText("opening.h2");
      // ONE heading node for both choreographies (same id, same text)
      const openingHeading = (
        <h2 id={titleId} className="type-title max-w-title text-fg">
          <CardReveal at={at.title}>{visible(h2Copy) ? h2Copy.text : title}</CardReveal>
        </h2>
      );
      const rows = openingRows();
      frame = <OpeningFrame heading={openingHeading} rows={rows} />;
      altFrame = <OpeningMapFrame heading={openingHeading} rows={rows} />;
      break;
    }
    case "seam": {
      const from = item.from ? film.worlds[item.from] : null;
      const storm = usable(spec.media.reelStill) ?? usable(from?.media.plate) ?? usable(spec.media.cardStill);
      // until the storm plate exists, its fallback gets the code storm grade
      const graded = storm ? resolveMedia(storm)?.id !== spec.media.reelStill : false;
      frame = storm ? (
        <SeamFrame storm={storm} graded={graded} />
      ) : (
        <ReelFrame world={item.to} still={null} kind="title" />
      );
      altFrame = storm ? <SeamChalkFrame storm={storm} graded={graded} /> : null;
      break;
    }
    case "tintype": {
      // no frontier plate yet (MV-10): the tintype develops into its code
      // alternative, a golden-hour ground under the code low sun
      const plate = usable(spec.media.cardStill) ?? usable(spec.media.plate);
      frame = <TintypeFrame plate={plate} />;
      altFrame = <TintypeDeadEyeFrame plate={plate} />;
      break;
    }
    case "ignite": {
      // no hall yet (MV-07): the ignition ends on its own final frame, the
      // candles lit along the Line (ignite.BAR "MV-07 missing")
      const hall = usable(spec.media.cardStill) ?? usable(spec.media.plate);
      frame = <IgniteFrame hall={hall} />;
      altFrame = <IgniteLumosFrame hall={hall} />;
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

  return (
    <CardShell
      id={item.id}
      kind={kind}
      world={kind === "opening" ? "house" : item.to}
      motifWorld={item.to}
      long={item.long && !still}
      still={still}
      fromGround={kind === "ignite" ? item.from : null}
      upperLeft={upperLeft}
      upperRight={kind === "opening" ? undefined : item.reel}
      frame={frame}
      altFrame={altFrame}
      variantChoice={item.variant}
      variant={variant}
      frameShape={kind === "opening" ? "free" : "plate"}
      lower={
        kind === "opening" ? undefined : (
          <>
            {heading}
            {line}
          </>
        )
      }
      // the opening program is itself real text and links: no summary twin
      summary={kind === "opening" ? "" : item.summary}
      // the opening's course (compass → rows) is its progress element
      progress={kind !== "opening"}
    />
  );
}
