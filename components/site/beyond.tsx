import { beyond, site } from "@/lib/content";
import { film } from "@/lib/film";
import { copyText, copyVisible, hrefOfId, slot, variantChoiceOf, worldOf } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { ShoePrints } from "@/components/site/rdr2-graphite";
import { Handbill, TrailMap } from "@/components/site/rdr2-frontier";
import { Lettered, SceneCaption } from "@/components/primitives/scene-caption";
import { FrontierBand } from "@/components/worlds/rdr2/frontier-band";
import { Satchel } from "@/components/worlds/rdr2/satchel";
import { WantedBoard } from "@/components/worlds/rdr2/wanted-board";
import { StageSplit } from "@/components/stage/stage-window";
import s from "@/components/worlds/rdr2/rdr2.module.css";
import type { SectionProps } from "@/components/sections/types";

/**
 * Beyond — story `notes` (Act III "The Frontier"; SPEC v2 SM-15, rdr2
 * `frontier` dressing on the rd canvas; RECOGNIZABILITY S14). The life
 * around the work, in the dark foreground of a lit frontier: four plain
 * notes (verbatim content.ts), each an h3 with its facts beside it.
 *
 * The frontier dressing (M2, every recognisable beat named in its fan face):
 *   - THE BAND: the golden-hour Heartlands (MV-10 / mobile MV-10m) runs
 *     full-bleed from the section's top edge — card II→III's developed
 *     plate, continued — with the h2 and intro in its dark left foreground
 *     and "THE HEARTLANDS • RED DEAD REDEMPTION 2" under them
 *     (components/worlds/rdr2/frontier-band; DEFAULT ride-in, ALT
 *     dead-eye-release).
 *   - Athletics: the running-shoe prints under the h3, and a wide
 *     ILLUSTRATIVE frontier map (hachured range, pines, river and lake, a
 *     dashed trail to a tent, a compass rose; no text) under the facts,
 *     whose fog lifts as you read (desktop).
 *   - Creative: the leather satchel and his real kit, captioned "WHAT'S IN
 *     THE SATCHEL" (DEFAULT spill, ALT inventory).
 *   - The end: a WANTED poster nailed over the blank poster of the notice-
 *     board plate (iconic-wanted), WANTED in Rye, facts verbatim, the reply
 *     link its only focusable, captioned "A WANTED POSTER" (DEFAULT
 *     nailed-up, ALT pasted-and-stamped). ≥ 1 viewport below the band, so
 *     the two warm families never share a viewport (B2).
 * In any world whose `notes` dressing is not `frontier` the same notes
 * render plain (SPEC §12.4).
 *
 * Phase 3 (PHASE3-SPEC §3.2; B1-STAGE): the lower half is `split` with the
 * window LEFT. When the entry's StageSpec is split, the notes after the
 * first (Activities → Creative; Athletics keeps its wide trail map above)
 * sit beside a sticky stage window (MV-10, the push toward the sun) in the
 * empty column under the headings, under the boot gate only; each note's
 * grid is `split-stack` (it stacks in the narrow column at 1024). The
 * stage's cue anchor is the Activities note, `#beyond-activities` (each
 * note article is `#<id>-<first word of its kicker>`). Anything else:
 * today's DOM.
 */

/** A note's anchor: `beyond-athletics`, `beyond-activities`, … */
function noteAnchor(section: string, kicker: string): string {
  const word = kicker.toLowerCase().match(/[a-z0-9]+/)?.[0] ?? "note";
  return `${section}-${word}`;
}

/** Confirmed Beyond facts for the handbill, verbatim content.ts item heads
 *  (B7). Community stays off it on purpose: a WANTED bill is no place for
 *  service or a family legacy (and Q-RD-1 never sits near it). */
function knownFor(): string[] {
  const heads = (kicker: string, n?: number) =>
    (beyond.find((b) => b.kicker === kicker)?.items ?? []).slice(0, n).map((i) => i.head);
  return [...heads("Athletics", 2), ...heads("Activities & Leadership", 1), ...heads("Creative")];
}

function HandbillBody() {
  const sub = copyText("beyond.handbill.sub");
  const reward = copyText("beyond.handbill.reward");
  const contactHref = hrefOfId("contact");
  const devDraftSlot = process.env.NODE_ENV !== "production" && !copyVisible(reward);
  const facts = knownFor();
  return (
    <>
      {copyVisible(sub) ? <p className="mt-tier-pair text-center type-small text-fg-muted">{sub.text}</p> : null}
      <p className="mt-tier-group text-center font-serif text-[2rem] leading-[1.05] tracking-[-0.01em] text-fg">
        {site.name}
      </p>

      <dl className="mt-tier-group space-y-tier-pair border-t border-rule pt-tier-group">
        <div>
          <dt className="type-meta text-fg-muted">Known for</dt>
          <dd>
            <ul className={cn(s.knownList, "mt-1 font-serif text-small text-fg")}>
              {facts.map((h, i) => (
                <li key={h}>
                  {i > 0 ? <span aria-hidden="true">{" · "}</span> : null}
                  {h}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="type-meta text-fg-muted">Last seen</dt>
          <dd className="mt-1 font-serif text-small text-fg">{site.location}</dd>
        </div>
        {copyVisible(reward) ? (
          <div>
            <dt className="type-meta text-fg-muted">Reward</dt>
            <dd className="mt-1 font-serif text-small text-fg">{reward.text}</dd>
          </div>
        ) : devDraftSlot ? (
          // dev / preview only: the empty slot Aryan is asked to write (or leave empty)
          <div data-draft="beyond.handbill.reward">
            <dt className="type-meta text-fg-muted">Reward</dt>
            <dd className="mt-1 type-meta text-fg-muted">[Draft — Aryan]</dd>
          </div>
        ) : null}
      </dl>

      {contactHref ? (
        <a
          href={contactHref}
          className="mt-tier-pair inline-flex min-h-11 items-center type-small text-accent underline decoration-1 underline-offset-4"
        >
          Reply by email →
        </a>
      ) : null}
    </>
  );
}

export function Beyond({ entry, number }: SectionProps<"story">) {
  const titleId = `${entry.id}-title`;
  const frontier = slot(entry, "dressing").notes === "frontier";
  const props = entry.props.variant === "notes" ? entry.props : null;
  const choice = variantChoiceOf(entry);
  const worldMedia = film.worlds[worldOf(entry)].media;
  const band = frontier ? (props?.media ?? worldMedia.plate) : undefined;
  const bandMobile = props?.mediaMobile ?? worldMedia.mobile;
  const handbill = frontier && props !== null && props.handbill?.enabled !== false;
  const board = props?.handbill?.board;
  const handbillTitleId = `${entry.id}-handbill-title`;

  const head = (
    <SectionHead
      id={titleId}
      number={number}
      label={entry.nav?.label ?? "Beyond"}
      title="Discipline, service, and a trained eye."
      intro="The same temperament, away from the terminal."
      titleClassName={band ? "lg:text-title" : undefined}
    />
  );

  const note = (b: (typeof beyond)[number], i: number) => {
    const noteId = `${entry.id}-note-${i + 1}`;
    const athletics = frontier && b.kicker === "Athletics";
    const creative = frontier && b.kicker === "Creative";
    return (
      <Rise
        as="article"
        key={b.kicker}
        id={noteAnchor(entry.id, b.kicker)}
        className="split-stack split-stack-wide grid grid-cols-1 gap-tier-group border-b border-rule py-tier-block lg:grid-cols-12 lg:gap-x-6"
      >
        <div className="lg:col-span-4">
          <Meta fields={[b.kicker]} />
          <h3 id={noteId} className="mt-tier-pair type-heading text-fg">
            {b.title}
          </h3>
          {athletics ? (
            <div className="mt-tier-group hidden max-w-[24rem] lg:block">
              <ShoePrints />
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-8">
          <dl aria-labelledby={noteId} data-split-pairs="" className="grid grid-cols-1 gap-x-8 gap-y-tier-group sm:grid-cols-2">
            {b.items.map((it) => (
              <div key={it.head}>
                <dt className="type-body text-fg">{it.head}</dt>
                <dd className="mt-1 type-small text-fg-muted">{it.body}</dd>
              </div>
            ))}
          </dl>
          {/* the frontier map runs the full width of the facts' column
              (ART-DIRECTOR #15: a small box in the left column left
              the right two thirds empty) */}
          {athletics ? <TrailMap className="mt-tier-block hidden lg:block" /> : null}
          {creative ? (
            <Satchel
              choice={choice}
              className="mt-tier-block"
              caption={<SceneCaption k="cap.beyond.satchel" place="head" />}
            />
          ) : null}
        </div>
      </Rise>
    );
  };

  return (
    <WorldSection entry={entry} labelledBy={titleId} className={cn(band && "overflow-x-clip")}>
      {band ? (
        <FrontierBand
          media={band}
          mediaMobile={bandMobile}
          deadEye={worldMedia.cardAltStill}
          choice={choice}
          head={head}
          caption={<SceneCaption k="cap.beyond" place="under" />}
          deadEyeCaption={<SceneCaption k="cap.act-3.alt" place="under" ariaHidden />}
        />
      ) : (
        head
      )}

      <div className="mt-tier-block border-t border-rule">
        {beyond.slice(0, 1).map((b, i) => note(b, i))}
        <StageSplit entry={entry}>{beyond.slice(1).map((b, i) => note(b, i + 1))}</StageSplit>
      </div>

      {handbill && board ? (
        <div className="mt-tier-block grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-8 lg:col-start-5">
            <WantedBoard
              board={board}
              choice={choice}
              titleId={handbillTitleId}
              wanted={<Lettered world="rdr2" text="WANTED" as="h3" id={handbillTitleId} className={cn("handbill-rule", s.wanted)} />}
            >
              <HandbillBody />
            </WantedBoard>
            <SceneCaption k="cap.beyond.handbill" place="under" />
          </div>
        </div>
      ) : handbill ? (
        // no board plate registered: the M1 handbill on the rd canvas
        <div className="mt-tier-block flex justify-center lg:justify-end lg:pr-[8%]">
          <Handbill />
        </div>
      ) : null}
    </WorldSection>
  );
}
