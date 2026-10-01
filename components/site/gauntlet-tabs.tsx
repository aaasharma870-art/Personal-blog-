"use client";

import { useId, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import { useReducedMotion } from "@/lib/flags";
import type { MediaId } from "@/lib/media";
import { dur, ease } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import {
  GauntletBoard,
  RUN_HYPOTHESES,
  clearedOf,
  useGauntletRun,
  type RunState,
} from "@/components/worlds/idiots/gauntlet-board";

type Step = { n: string; title: string; body: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** true only after hydration (the server and the hydration pass say false),
 *  so the Run control never renders without JS (N23: 0 dead buttons). */
const noop = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/**
 * GauntletTabs — the seven real gates on the dawn board (SPEC v2 SM-6,
 * noise-order-seam.BAR §3B). The vertical tablist (arrows, Home/End with
 * wrap, roving tabindex) and the chosen gate's own words (verbatim
 * content.ts) beside the board, where the chosen gate DERIVES in chalk.
 * **Run** sends seeded, labelled-illustrative hypotheses through the real
 * gates (the verb); the tally settles in HTML with Rancho's circle and one
 * polite announcement that says "illustrative".
 *   Reduced motion / Pause: the settled tally, chalk drawn, no Run.
 *   No JS: every gate as a list (the <noscript> block) + the static board;
 *   no Run button, no dead tabs.
 *   < 1024: the tablist, then the words, then the board (1:1 below 640).
 */
export function GauntletTabs({
  steps,
  board,
  choice,
  header,
  caption,
  quadcopter = true,
}: {
  steps: readonly Step[];
  board: MediaId;
  /** The section's manifest variant choice (host "work"). */
  choice: VariantChoice;
  header?: ReactNode;
  caption?: ReactNode;
  /** Draw the quadcopter doodle (the `quadcopter-lift` egg is on). */
  quadcopter?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const variant = useVariant(choice, "work.board");
  const n = steps.length;
  const { state: live, start } = useGauntletRun(n);
  // motion off: the settled frame, chalk drawn, no Run (derived, so a run
  // in flight simply shows its final frame)
  const run: RunState = reduce ? { phase: "settled", step: n, runs: 0 } : live;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `gauntlet-label-${uid}`;
  const panelId = `gauntlet-panel-${uid}`;
  const tabId = (i: number) => `gauntlet-tab-${uid}-${i}`;

  const cleared = clearedOf(n);
  // one polite announcement per finished Run (empty while running, so a
  // re-run is announced again); it always says "illustrative"
  const announce =
    run.phase === "settled" && run.runs > 0
      ? `Illustrative run: ${cleared} of ${RUN_HYPOTHESES} hypotheses cleared all ${n} gates.`
      : "";

  const select = (i: number) => {
    setActive(i);
    setTouched(true);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = {
      ArrowDown: (active + 1) % n,
      ArrowRight: (active + 1) % n,
      ArrowUp: (active - 1 + n) % n,
      ArrowLeft: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  const cur = steps[active] ?? steps[0];
  if (!cur) return null;

  const running = run.phase === "anticipate" || run.phase === "running";
  const tally =
    run.phase === "settled"
      ? `${cleared} of ${RUN_HYPOTHESES} cleared all ${n} gates`
      : running
        ? `Gate ${pad(Math.max(0, Math.min(run.step, n - 1)) + 1)} / ${pad(n)}`
        : `${RUN_HYPOTHESES} illustrative hypotheses • not yet run`;
  const canRun = hydrated && !reduce;

  return (
    <div className="grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
      {/* the gates are data (Geist); the board beside them marks its own
          data islands and leaves its film lettering out (P3-4 #4) */}
      <div data-research="" className="lg:col-span-4">
        <div
          role="tablist"
          aria-label="Validation gauntlet gates"
          aria-orientation="vertical"
          onKeyDown={onKey}
          data-gauntlet-js=""
          className="flex flex-col gap-1"
        >
          {steps.map((s, i) => {
            const sel = i === active;
            return (
              <button
                key={s.n}
                type="button"
                role="tab"
                id={tabId(i)}
                aria-selected={sel}
                aria-controls={panelId}
                tabIndex={sel ? 0 : -1}
                onClick={() => select(i)}
                className={cn(
                  "group flex min-h-11 items-baseline gap-3 rounded-control px-3 py-2.5 text-left transition-colors duration-(--dur-micro)",
                  sel ? "bg-surface-1" : "hover:bg-surface-1",
                )}
              >
                <span className={cn("tnum type-meta", sel ? "text-fg" : "text-fg-muted")}>{pad(Number(s.n) || i + 1)}</span>
                <span className={cn("type-body", sel ? "text-fg" : "text-fg-muted group-hover:text-fg")}>{s.title}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(active)}
          tabIndex={0}
          data-gauntlet-js=""
          className="mt-tier-group rounded-control"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cur.n}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
              transition={{ duration: reduce ? 0 : dur.base, ease }}
            >
              <p className="type-meta text-fg-muted">
                <span className="tnum">{`GATE ${pad(active + 1)} / ${pad(n)}`}</span>
              </p>
              <h4 className="mt-tier-pair type-heading text-fg">{cur.title}</h4>
              <p className="mt-tier-pair max-w-body type-body text-fg-muted">{cur.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the verb (reserved slot: no layout shift when it appears) */}
        <div className="mt-tier-group min-h-11">
          {canRun ? (
            <button
              type="button"
              onClick={() => {
                if (!running) start();
              }}
              aria-disabled={running || undefined}
              aria-describedby={labelId}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-control px-4 type-small text-fg shadow-[inset_0_0_0_1px_var(--rule)] transition-colors duration-(--dur-micro) hover:bg-surface-1",
                running && "text-fg-muted",
              )}
            >
              <Play className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              {running ? "Running…" : run.runs > 0 ? "Run again" : `Run ${RUN_HYPOTHESES} illustrative hypotheses`}
            </button>
          ) : null}
        </div>
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>

        {/* no JS: every gate as a list, and the dead tablist hidden */}
        <noscript>
          <style>{`[data-gauntlet-js]{display:none!important}`}</style>
          <ol aria-label="Validation gauntlet gates" className="space-y-tier-group">
            {steps.map((s, i) => (
              <li key={s.n}>
                <p className="tnum type-meta text-fg-muted">{`GATE ${pad(i + 1)} / ${pad(n)}`}</p>
                <h4 className="mt-tier-pair type-heading text-fg">{s.title}</h4>
                <p className="mt-tier-pair max-w-body type-body text-fg-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </noscript>
      </div>

      <div className="lg:col-span-8">
        <GauntletBoard
          board={board}
          gates={n}
          active={active}
          derive={touched && !reduce}
          run={run}
          variant={variant}
          header={header}
          caption={caption}
          labelId={labelId}
          tallyText={tally}
          quadcopter={quadcopter}
        />
      </div>
    </div>
  );
}
