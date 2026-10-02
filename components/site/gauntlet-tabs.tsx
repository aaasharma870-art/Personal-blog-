"use client";

import { lazy, Suspense, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import { beatAttrs } from "@/lib/beats";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import type { MediaId } from "@/lib/media";
import { dur, ease } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { eggsSessionOff, triggerEgg } from "@/components/eggs/egg-bus";
import {
  GauntletBoard,
  RUN_HYPOTHESES,
  clearedOf,
  useGauntletRun,
  type RunState,
} from "@/components/worlds/idiots/gauntlet-board";

type Step = { n: string; title: string; body: string };

/** The Run invite (B18; desktop only, lazy: components/worlds/idiots/run-invite.tsx). */
const RunInvite = lazy(() => import("@/components/worlds/idiots/run-invite"));

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
 *   Reduced motion / Pause: the settled tally, chalk drawn; Run settles at
 *     once (no dots travel, no lift) and still counts (spec §9.1 #8).
 *   No JS: every gate as a list (the <noscript> block) + the static board;
 *   no Run button, no dead tabs.
 *   < 1024: the tablist, then the words, then the board (1:1 below 640).
 * PHASE 3 (W3-IDIOTS):
 *   - `3i-quad` (spec §9.1 #8): the first Run of the view that clears a
 *     hypothesis through every gate fires `triggerEgg("quadcopter-lift")`
 *     (the hunt counts it, the toast and the rotor spin-up play from the
 *     egg runtime); skipped while the eggs are off for the session. The
 *     doodle lifts on every clearing Run (gauntlet-board.tsx).
 *   - the Run invite (B18, a toy-invite time star, spec §2.3): the Run slot
 *     carries the beat; on DESKTOP_FINE with motion on and before the first
 *     Run, a lazy chunk asks the spotlight (needsIdle) and plays ONE pulse
 *     (`work.invite` DEFAULT "pulse": a chalk ring breathes out of the
 *     button; ALT "nudge": the ▶ steps forward twice). Never on phones,
 *     under RM / Pause, or after the visitor has run it.
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
  const fine = useDesktopFine();
  const hydrated = useHydrated();
  const variant = useVariant(choice, "work.board");
  const inviteVariant = useVariant(choice, "work.invite");
  const n = steps.length;
  const { state: live, start } = useGauntletRun(n);
  // motion off: the settled frame, chalk drawn (derived, so a run in flight
  // simply shows its final frame); a Run under motion off settles at once
  const run: RunState = reduce ? { phase: "settled", step: n, runs: live.runs } : live;
  const slotRef = useRef<HTMLDivElement>(null);

  // 3i-quad: the first clearing Run of the view counts (spec §9.1 #8)
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current || live.phase !== "settled" || live.runs < 1) return;
    if (!quadcopter || clearedOf(n) < 1 || eggsSessionOff()) return;
    counted.current = true;
    triggerEgg("quadcopter-lift");
  }, [live.phase, live.runs, n, quadcopter]);
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
  const canRun = hydrated;

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

        {/* the verb (reserved slot: no layout shift when it appears); the
            slot is the B18 invite's host */}
        <div ref={slotRef} className="mt-tier-group min-h-11" {...beatAttrs("B18", { weight: 1 })}>
          {canRun ? (
            <button
              type="button"
              onClick={() => {
                if (!running) start(reduce);
              }}
              aria-disabled={running || undefined}
              aria-describedby={labelId}
              className={cn(
                "relative inline-flex min-h-11 items-center gap-2 rounded-control px-4 type-small text-fg shadow-[inset_0_0_0_1px_var(--rule)] transition-colors duration-(--dur-micro) hover:bg-surface-1",
                running && "text-fg-muted",
              )}
            >
              <Play className="size-3.5" strokeWidth={1.5} aria-hidden="true" data-run-glyph="" />
              {running ? "Running…" : run.runs > 0 ? "Run again" : `Run ${RUN_HYPOTHESES} illustrative hypotheses`}
              {/* the invite's chalk ring (B18 DEFAULT): invisible at rest */}
              <span
                aria-hidden="true"
                data-run-ring=""
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1.5px_var(--w-chalk)]"
              />
            </button>
          ) : null}
          {canRun && fine && !reduce && live.runs === 0 ? (
            <Suspense fallback={null}>
              <RunInvite host={slotRef} variant={inviteVariant} />
            </Suspense>
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
