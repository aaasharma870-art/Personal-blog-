import type { Metadata } from "next";
import { SectionFrame } from "@/components/sections/SectionFrame";
import { rendererFor } from "@/components/sections/registry";
import { StageLayers } from "@/components/stage/stage-layers";
import { enabledSections, numberOf } from "@/lib/sections";

/* /lab/p3/games — the two real games on their own (PHASE3-SPEC §9.2 #2, #3;
   PHASE3-PLAN §7.1). OWNER: W3-GAMES. Not linked, noindex. The real
   sections (the same server components as the home page, through the same
   registry and frame): `systems` with FLY THE HOMEMADE DRONE in its band,
   and `kill-list` with DEAD EYE in its header, plus the fixed stage layers
   the HUDs portal into. The pills show on a desktop with a mouse or
   trackpad (DESKTOP_FINE); phones and tablets get today's sections.
   Previews through the URL (lib/variants.ts, after hydration):
     ?variant=systems.drone:alt      the blueprint drone (dashed gates)
     ?variant=kill-list.deadeye:alt  Dead Eye's tally marks, fired in turn
     ?variant=alt                    every ALT of both sections
   The probe (tools/capture/probes/games.mjs) runs on the home page; this
   page is for looking. Reduced motion (or Pause): the drone shows its
   flight plan, Dead Eye runs untimed. */
export const metadata: Metadata = {
  title: "Games lab",
  description: "On desktop: the homemade drone and Dead Eye, default and alternate.",
  robots: { index: false, follow: false, nocache: true },
};

const HOSTS = ["systems", "kill-list"] as const;

const PREVIEWS: readonly (readonly [string, string])[] = [
  ["Defaults", "?"],
  ["Drone ALT", "?variant=systems.drone:alt"],
  ["Dead Eye ALT", "?variant=kill-list.deadeye:alt"],
  ["Every ALT", "?variant=alt"],
];

export default function GamesLabPage() {
  const entries = HOSTS.map((id) => enabledSections.find((e) => e.id === id)).filter((e) => e !== undefined);
  return (
    <>
      <StageLayers />
      <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-3 px-gutter pt-[calc(var(--header-h)+2rem)] pb-tier-block">
        <h1 className="type-heading">Games lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          Fly the homemade drone through the seven gates (arrow keys or WASD in the field, or drag; Esc lands), then call Dead Eye on
          the kill-list (mark the killed rows, fire once; Esc or Release restores the ledger).
        </p>
        <ul className="flex flex-wrap gap-2">
          {PREVIEWS.map(([label, q]) => (
            <li key={label}>
              <a href={`/lab/p3/games${q}`} className="type-meta rounded-sm border border-rule px-3 py-1.5 text-fg-muted hover:text-fg">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {entries.map((entry) => {
        const Section = rendererFor(entry.type);
        const i = enabledSections.indexOf(entry);
        return (
          <SectionFrame key={entry.id} entry={entry} prevEntry={enabledSections[i - 1] ?? null}>
            <Section entry={entry} number={numberOf(entry.id)} />
          </SectionFrame>
        );
      })}
      <div aria-hidden="true" className="h-[100svh]" />
    </>
  );
}
