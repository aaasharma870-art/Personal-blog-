import { beatAttrs } from "@/lib/beats";
import { film, type CaptionWorld } from "@/lib/film";
import {
  acts,
  bearingOf,
  copyText,
  copyVisible,
  pageItems,
  variantChoiceOf,
  worksInUse,
  worksWords,
} from "@/lib/sections";
import type { WorldId } from "@/lib/worlds";
import { SectionHead, WorldSection } from "@/components/site/world-kit";
import { FilmScreen } from "@/components/sections/films/film-screen";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   FILMS — the Intermission: "Three films and a game" (SPEC v2 SM-9; bar
   films-chapter; RECOGNIZABILITY S12 + T6). Mid-page, after the graveyard,
   the house lights come up: Meta INTERMISSION, the h2 (derived from the
   works in use: "Three films" without RDR2), one lead, then ONE SCREEN PER
   WORK in act order (worksInUse): Pirates of the Caribbean → 3 Idiots →
   Red Dead Redemption 2 → Harry Potter. Each screen is ~one viewport and
   the only world in it (film-screen.tsx), its film named big in its own
   fan face, its iconic still letterboxed with a caption, one attributed
   line, what the page borrowed, Aryan's reason and "Seen here in" links.
   Everything is derived (film.acts × film.worlds × the manifest): 0 film
   literals here. The last (HP) screen leaves one warm point on the Line,
   which Card II→III's low sun takes over.
   Variant piece `films.screens` (DEFAULT "clip-finales", ALT
   "iris-marks"): film-frame.tsx / finales.tsx.
   PHASE 3 (W3-CINEMA; PHASE3-SPEC §2.3 B30–B35): the house lights go down
   on the first screen (the global letterbox bars, film-frame.tsx `lights`),
   each film title arrives in character (film-screen.tsx, B31–B34), every
   plate moves (LivePlate push 1 → 1.05, loops through loopFor), and the
   last screen's warm point is carried onto the tintype's sun (B35: the
   marker below, films-desktop.tsx).
   ========================================================================== */

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Compass bearing of the next act on the page after `id` (the Pirates
 *  finale's needle: "it points to what you want most" — the story's next
 *  act). Falls back to the first act. */
function nextActBearing(id: string): number {
  const i = pageItems.findIndex((it) => it.kind === "section" && it.entry.id === id);
  const next = pageItems.slice(i + 1).find((it) => it.kind === "act");
  const index = next && next.kind === "act" ? acts.findIndex((a) => a.id === next.act) : 0;
  return bearingOf(Math.max(0, index));
}

export function FilmsSection({ entry }: SectionProps<"films">) {
  const titleId = `${entry.id}-title`;
  const h2 = copyText("films.h2");
  const lead = copyText("films.lead");
  const screens = worksInUse.filter((w): w is typeof w & { world: CaptionWorld } => w.world !== "house");
  if (!film.enabled || screens.length === 0) return null;
  const choice = variantChoiceOf(entry);
  const bearing = nextActBearing(entry.id);
  return (
    <WorldSection entry={entry} labelledBy={titleId} className="overflow-x-clip scroll-mt-24">
      <SectionHead
        id={titleId}
        label="Intermission"
        title={copyVisible(h2) ? h2.text : capitalize(worksWords)}
        intro={copyVisible(lead) ? lead.text : undefined}
      />
      <div className="mt-tier-block">
        {screens.map((w, i) => (
          <FilmScreen
            key={w.world}
            world={w.world}
            years={w.years}
            prev={(i === 0 ? "house" : screens[i - 1].world) as WorldId}
            first={i === 0}
            last={i === screens.length - 1}
            choice={choice}
            bearing={bearing}
          />
        ))}
      </div>
      {/* B35 (the films half of the warm point → the tintype's sun; a
          weight-1 scroll star): its spotlight box at the section's bottom
          edge (films-desktop.tsx registers it and runs the carry) */}
      <span
        aria-hidden="true"
        data-beat-scroll=""
        className="pointer-events-none invisible absolute left-0 w-px"
        style={{ bottom: "-20vh", height: "max(40vh, 320px)" }}
        {...beatAttrs("B35", { weight: 1 })}
      />
    </WorldSection>
  );
}
