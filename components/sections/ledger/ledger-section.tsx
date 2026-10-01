import { LedgerIndex, type LedgerRow } from "@/components/site/ledger-reckoning";
import { Meta } from "@/components/site/world-kit";
import { MaskReveal } from "@/components/primitives/mask-reveal";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { IdiotsSection } from "@/components/worlds/idiots/idiots-section";
import { PenInset } from "@/components/worlds/idiots/plate-band";
import { featuredProjects, killList, survivors } from "@/lib/content";
import { variantChoiceOf } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   LEDGER — the kill-list (SPEC v2 §3 row 8, SM-8 "The reckoning"; signature;
   Act II · idiots canvas; RECOGNIZABILITY S11, O-5, T5; SM-17 host).
   HEADER (the film cue lives here only, O-5): Virus's astronaut pen (the
   pen kept for the one student who proves worthy — here, only the three
   survivors did) as a large inset beside the h2 (M2 finish, ART-DIRECTOR
   #9: the 56 px doodle read as a sled): the iconic-pen plate, the pen in
   its open velvet case, ≥ 45 % of the content width at 1440, with the
   caption VIRUS'S ASTRONAUT PEN • 3 IDIOTS under it (never beside the Meta
   count, never on a row). Variants (`kill-list.head`): default pats, alt
   lid-lift.
   ROWS (components/site/ledger-reckoning.tsx): the Lens Index, equally
   quiet at rest; no chalk, no icons (D-6, H27).
   GROUND: the Act II graph grid (≤ 6 %) arrives here at half strength from
   `systems` and thins row by row to 0 by the LAST row (3I-07, H26: a static
   mask from the rows' measured span, CSS vars written by the list); then
   T5 crossfades the idiots canvas into the intermission's deep over the
   last 30vh.
   DEAD EYE (SM-17): opt-in; its runtime is components/eggs/dead-eye.ts
   (palette + typed word). The list keeps its DOM contract (data-verdict /
   data-reason / data-name) and grades its lens figure while it runs.
   ========================================================================== */

/** Rows from `include`, in order, verbatim from content.ts (lens BAR §9). */
function rowsOf(include: readonly ("flagships" | "survivors" | "killed")[]): LedgerRow[] {
  const flagship = featuredProjects.find((p) => p.id === "trading-algos") ?? featuredProjects[0];
  const rows: LedgerRow[] = [];
  for (const kind of include) {
    if (kind === "flagships") {
      for (const p of featuredProjects) {
        rows.push({
          key: `f-${p.id}`,
          kind: "flagship",
          name: p.name,
          detail: p.summary,
          status: p.status,
          href: p.href,
          hrefLabel: p.repo,
          hrefAria: `${p.name}: the ${p.repo} repository on GitHub`,
          figure: p.id === "optuna-screener" ? "optuna" : "ta",
          route: "all",
          figLabel: `FIG. • ${p.repo}`,
        });
      }
    } else if (kind === "survivors") {
      for (const s of survivors) {
        // EXCEPTION: a flagship's own limitations sentence that names this
        // survivor (data, never the name hard-coded); it sits in the same
        // row as the claim it qualifies, never dimmer than muted
        const caveat = featuredProjects.find((p) => p.limitations.includes(s.name))?.limitations;
        rows.push({
          key: `s-${s.name}`,
          kind: "survived",
          name: s.name,
          detail: s.thesis,
          evidence: s.evidence,
          caveat,
          status: s.status,
          figure: "ta",
          route: "survivors",
          figLabel: flagship ? `FIG. • ${flagship.repo} → survivors` : "FIG. • survivors",
        });
      }
    } else {
      for (const k of killList) {
        rows.push({
          key: `k-${k.name}`,
          kind: "killed",
          name: k.name,
          detail: k.reason,
          href: flagship?.href,
          hrefLabel: flagship?.repo,
          hrefAria: flagship ? `Post-mortem for ${k.name}: the ${flagship.repo} repository on GitHub` : undefined,
          figure: "ta",
          route: "kill-list",
          figLabel: flagship ? `FIG. • ${flagship.repo} → kill-list` : "FIG. • kill-list",
        });
      }
    }
  }
  return rows;
}

export function LedgerSection({ entry, number }: SectionProps<"ledger">) {
  const titleId = `${entry.id}-title`;
  const rows = rowsOf(entry.props.include);

  return (
    <IdiotsSection
      entry={entry}
      labelledBy={titleId}
      className="scroll-mt-24"
      grid
      gridMask="linear-gradient(to bottom, color-mix(in srgb, black 50%, transparent) 0%, color-mix(in srgb, black 50%, transparent) var(--ledger-grid-a, 25%), transparent var(--ledger-grid-b, 88%))"
      fadeOut
    >
      <header className="grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:items-start lg:gap-x-6">
        <div className="min-w-0 lg:col-span-6 lg:pt-tier-group">
          <Meta fields={[number, "The reckoning", `${survivors.length} survived the full process`]} />
          <MaskReveal as="h2" id={titleId} className="mt-tier-group max-w-title type-chapter text-fg">
            The kill-list
          </MaskReveal>
          <p className="mt-tier-group max-w-body type-body text-fg-muted">
            Killed and never retuned — each ships a written post-mortem. This is the part I am proudest of.
          </p>
        </div>
        {entry.props.head ? (
          <PenInset
            spec={entry.props.head}
            choice={variantChoiceOf(entry)}
            pieceKey="kill-list.head"
            captionKey="cap.kill-list"
            className="lg:col-span-6"
          />
        ) : (
          <SceneCaption k="cap.kill-list" place="head" className="lg:col-span-6 lg:self-end lg:pb-2" />
        )}
      </header>

      {/* the ledger DATA (rows, verdicts, figures, the caveat) is a research
          island: no world type role reaches it (P3-4, PHASE3-SPEC §5.5);
          display: contents, so no box changes. The head above is Kalam. */}
      <div className="contents" data-research="">
        <LedgerIndex rows={rows} choice={variantChoiceOf(entry)} />

        <p className="mt-tier-group max-w-body type-small text-fg-muted">
          Tuning to a backtest usually enlarges your future loss.
        </p>
      </div>
    </IdiotsSection>
  );
}
