import type { CSSProperties, ReactNode } from "react";
import { film, type CaptionWorld, type Copy, type CopyKey } from "@/lib/film";
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

/** An invitation line by copy key, gated like every proposed string; null
 *  when the key is not in the manifest (yet). */
export function playCopy(key: string): Copy | null {
  if (!(key in film.copy)) return null;
  const c = copyText(key as CopyKey);
  return copyVisible(c) ? c : null;
}

/** C4 (P3-11 r3): the game invitation on the act-1 contents page, before
 *  the drone and Dead Eye (F6's words; F1's copy key, proposed + unsigned).
 *  The same static desktop-only line as the films one. */
export const OPENING_PLAY_KEY = "opening.play";

export function FilmsPlay({ copyKey = "films.play", className }: { copyKey?: string; className?: string }) {
  const c = playCopy(copyKey);
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
    <p className={className ?? "mt-tier-group hidden max-w-lead type-small text-fg df:block"} data-copy-status={c.status}>
      {parts}
    </p>
  );
}

/** P3-11 r4 (F2, layout shift 0): a title of at most this many characters
 *  stays on one line ("3 IDIOTS"). */
const ONE_LINE = 10;
/** The title's most even two-line break (by characters, at a space), or the
 *  one line. Explicit lines, each nowrap, make the bill's height independent
 *  of the face: with wrapping columns, "Red Dead Redemption 2" and
 *  "Harry Potter" arriving in their own faces squeezed the Pirates title
 *  from two lines to three, +36 px under everything below the card (the
 *  0.025 shift of r2–r3, reduced motion included). Four titles, at most
 *  two lines each, never wrap again. */
export function billLines(title: string): readonly string[] {
  const words = title.split(" ");
  if (words.length < 2 || title.length <= ONE_LINE) return [title];
  let at = 1;
  let best = Infinity;
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(" ").length;
    const gap = Math.abs(left - (title.length - left - 1));
    if (gap < best) {
      best = gap;
      at = i;
    }
  }
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}

/** The bill's title size: the card's old clamp, capped at 2.25rem so the
 *  four titles' widest lines (≈ 21.6 em together, both faces) and three
 *  2 rem gaps always fit the card's 66 rem (910 px of content): 36 px is
 *  4.8 % under it, and 1440's 34.56 px is unchanged. */
const BILL_TITLE: CSSProperties = { fontSize: "clamp(1.6rem, 2.4vw, 2.25rem)", whiteSpace: "nowrap" };

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
              <FilmTitle world={w.world} as="span" className="films-bill-title" style={BILL_TITLE} lines={billLines} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
