import type { ReactNode } from "react";
import type { CaptionWorld, Copy } from "@/lib/film";
import { acts, anchorId, copyText, copyVisible, enabledSections, numeralOf } from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { FilmTitle } from "@/components/primitives/scene-caption";

/* ============================================================================
   FILMS BILL + THE INVITATION TO PLAY — the Intermission's title card
   (P3-11 round 1; panel J2 #3, J3 #6, J4 #8: "Three films and a game" was a
   bare grey title on black for 4–5 s while the house lights went down; and
   discovery: it promised a game nobody found). OWNER: F2. Server markup.

   <FilmsPlay> (F6's hand-off): directly under the lead, ONE static
   `type-small` line, desktop only (`df:`), no motion, no beat: F6's words
   under the copy key `films.play` (page microcopy, proposed + unsigned),
   with "Systems" and "kill-list" linked to their sections when those
   sections are on the page.

   <FilmsBill>: under it, the evening's programme in the cinema's own
   grammar — a hairline, then the films in act order, each named in its OWN
   fan face and ink under its act numeral: four worlds side by side for the
   first time, the frame worth holding while the bars close. Type only: 0
   bytes of media, no plate reused (the screens below show each one). All
   derived (the works in use × their acts): 0 film literals, no new words.
   aria-hidden: the four screens right after it carry the same titles as
   real h3s. Desktop only (app/p3/cinema.css): phones keep today's head.
   ========================================================================== */

type Work = { world: CaptionWorld };

/** Words of the invitation that point at a section on this page. */
const LINKS: Readonly<Record<string, string>> = { Systems: "systems", "kill-list": "kill-list" };

function onPage(id: string): boolean {
  return enabledSections.some((s) => anchorId(s) === id);
}

/** F6's line (`films.play`), gated like every proposed string. */
function playCopy(): Copy | null {
  const c = copyText("films.play");
  return copyVisible(c) ? c : null;
}

export function FilmsPlay() {
  const c = playCopy();
  if (!c) return null;
  const words = Object.keys(LINKS).filter((w) => onPage(LINKS[w]));
  const parts: ReactNode[] = words.length
    ? c.text.split(new RegExp(`\\b(${words.map((w) => w.replace(/[-]/g, "\\-")).join("|")})\\b`)).map((part, i) =>
        LINKS[part] && words.includes(part) ? (
          <a key={i} href={`#${LINKS[part]}`} className="underline decoration-rule underline-offset-4 transition-colors hover:decoration-current">
            {part}
          </a>
        ) : (
          part
        ),
      )
    : [c.text];
  return (
    <p className="mt-tier-group hidden max-w-lead type-small text-fg df:block" data-copy-status={c.status}>
      {parts}
    </p>
  );
}

export function FilmsBill({ works }: { works: readonly Work[] }) {
  return (
    <div className="films-bill" aria-hidden="true">
      <ol className="films-bill-acts">
        {works.map((w) => {
          const act = acts.find((a) => a.world === w.world);
          const n = act ? numeralOf(act.id) : undefined;
          return (
            <li key={w.world} {...planeAttrs("deep", w.world)}>
              {n ? <span className="type-meta text-fg-muted">{`Act ${n}`}</span> : null}
              <FilmTitle world={w.world} as="span" className="films-bill-title" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
