import { copyText, copyVisible } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { EggHint } from "@/components/eggs/egg-hint";

/* ============================================================================
   MAP HINT — the `hp-map` hunt egg's hint (PHASE3-SPEC §9.1 #1; P3-8 #1):
   a faint IM Fell line, "I solemnly swear…" (copy `egg.hunt.hint.hp-map`,
   proposed + unsigned), on the Principles Map banner (DEFAULT) or under the
   hall's ceiling band (ALT).

   SERVER-RENDERED (principles.tsx renders both placements and the stage
   shows the one its choreography uses), so none of this ships in the
   first-load JS; only <EggHint> (already first-load) runs on the client,
   hiding the line once the visitor turns the eggs off for the session.
   aria-hidden: the egg's own paths are the typed words and the palette
   (fully keyboard); this line is only a marginal. DESKTOP_FINE only (`df:`,
   where the hunt can be played) and absolutely positioned (`className`), so
   it changes no layout on any device. The face is the hp head role
   (`font-world-head`: IM Fell English SC on desktop), never beside a data
   class.
   ========================================================================== */

const HINT = copyText("egg.hunt.hint.hp-map");

export function MapHint({ className }: { className: string }) {
  if (!copyVisible(HINT)) return null;
  return (
    <EggHint egg="marauders-map">
      <p
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute hidden text-[1rem] leading-none tracking-[0.04em] text-fg-muted opacity-70 select-none font-world-head df:block",
          className,
        )}
        data-egg-hint="marauders-map"
      >
        {HINT.text}
      </p>
    </EggHint>
  );
}
