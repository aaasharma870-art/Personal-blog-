import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ============================================================================
   COLLAPSE (spec §11.5, D3-9; plan §3.6) — OWNER: W2-WORDS.

   A native <details>, CLOSED in the server HTML: no JS needed to open it,
   and find-in-page opens it in Chromium. SERVER MARKUP ONLY (0 bytes of
   first-load JS). Styles: app/p3/words.css, keyed on `[data-collapse]`
   (never the class `collapse`: in Tailwind v4 that is `visibility:
   collapse`).
   - Phones (< 64rem) stay EXPANDED where `::details-content` is supported:
     the summary is hidden and the content shows in flow, as today. Without
     that support a normal, working disclosure shows.
   - Desktop (≥ 64rem): the open/close height animates with
     `interpolate-size: allow-keywords` (spec §11.5, 240 ms); reduced motion
     and Pause toggle instantly.
   - Toggling changes the page height: on desktop the words binder
     (components/enhance/binders/words.ts) calls requestScrollRefresh() on
     every toggle (Lenis + ScrollTrigger re-measure); phones run native
     scroll and need nothing.

   RULES (spec §11.5): never split a claim from its caveat (the caveat goes
   inside the same block, and a summary that is the only framing a reader
   sees carries the honest framing itself); never collapse metrics,
   limitations or research verdicts. The details is a BLOCK: wrap a block
   (or pass the spacing the replaced block had in `className`).
   Summaries come from copy keys (`optuna.appendix.summary`,
   `about.philosophy.summary`, `credits.more.summary`).
   ========================================================================== */

export type CollapseProps = {
  summary: ReactNode;
  id?: string;
  className?: string;
  /** Classes for the <summary> (default: a Meta-sized muted line). */
  summaryClassName?: string;
  children?: ReactNode;
};

export function Collapse({ summary, id, className, summaryClassName, children }: CollapseProps) {
  return (
    <details id={id} className={className} data-collapse="">
      <summary className={cn("w-fit cursor-pointer type-meta text-fg-muted transition-colors hover:text-fg", summaryClassName)}>
        {summary}
      </summary>
      {children}
    </details>
  );
}
