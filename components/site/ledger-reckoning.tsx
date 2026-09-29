import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects, killList, site, survivors } from "@/lib/content";
import { Meta } from "@/components/site/world-kit";
import { cn } from "@/lib/utils";

/**
 * The reckoning — the kill-list ledger (SPEC v2 SM-8 / D-6, M1 form; the
 * Lens Index is the ledger builder's M2 work). Rows are EQUALLY QUIET at
 * rest: the verdict WORD carries the meaning (SURVIVED / KILLED), ember is
 * reserved for KILLED, and a killed row takes its ember strike only while it
 * is the active row (hover or keyboard focus within). No chalk and no icons
 * here: the graveyard's power is austerity (the opt-in Dead Eye egg is M2).
 * Figures verbatim from content.ts and static (ratios never animate).
 * Server-rendered: no JS needed for anything on this ledger.
 *
 * M2: the ledger is its own manifest section (`kill-list`, type ledger):
 * components/sections/ledger/ledger-section.tsx renders the <section
 * id="kill-list"> and passes the h2 id + the derived number here.
 */
export function Ledger({ titleId, number, headExtra }: { titleId: string; number?: string; headExtra?: ReactNode }) {
  const flagshipHref = featuredProjects[0]?.href ?? site.github;
  const rows = [
    ...survivors.map((s) => ({
      kind: "survived" as const,
      name: s.name,
      detail: s.thesis,
      evidence: s.evidence,
      status: s.status,
    })),
    ...killList.map((k) => ({
      kind: "killed" as const,
      name: k.name,
      detail: k.reason,
      evidence: null,
      status: null,
    })),
  ];

  return (
    <div>
      <Meta fields={[number, "The reckoning", `${survivors.length} survived the full process`]} />
      <h2 id={titleId} className="mt-tier-pair type-title text-fg">
        The kill-list
      </h2>
      {headExtra}
      <p className="mt-tier-group max-w-body type-body text-fg-muted">
        Killed and never retuned — each ships a written post-mortem. This is the part I am proudest of.
      </p>

      <ol aria-label="Ledger: survivors and killed ideas" className="mt-tier-block border-t border-rule">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className="group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 border-b border-rule py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline"
          >
            <span className="tnum type-meta text-fg-ghost">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p className="type-body text-fg">
                <span className="relative">
                  {r.name}
                  {r.kind === "killed" ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-kill transition-transform duration-(--dur-base) group-focus-within:scale-x-100 group-hover:scale-x-100"
                    />
                  ) : null}
                </span>
              </p>
              <p className="mt-1 type-small text-fg-muted">{r.detail}</p>
              {r.evidence ? <p className="tnum mt-1 type-small text-fg-muted">{r.evidence}</p> : null}
            </div>
            <div className="col-start-2 flex flex-wrap items-center gap-x-4 sm:col-start-3 sm:justify-end">
              <span className={cn("type-meta", r.kind === "killed" ? "text-kill" : "text-fg")}>
                {r.kind === "killed" ? "Killed" : "Survived"}
              </span>
              {r.status ? <span className="type-meta text-fg-muted">{r.status}</span> : null}
              {r.kind === "killed" ? (
                <a
                  href={flagshipHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Post-mortem for ${r.name} on GitHub`}
                  className="inline-flex min-h-11 items-center gap-1 type-meta text-fg-muted transition-colors hover:text-fg"
                >
                  Post-mortem
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-tier-group max-w-body type-small text-fg-muted">
        Tuning to a backtest usually enlarges your future loss.
      </p>
    </div>
  );
}
