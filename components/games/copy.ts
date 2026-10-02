/* ============================================================================
   GAMES · copy (SERVER ONLY: used by components/site/capabilities.tsx and
   components/sections/ledger/ledger-section.tsx) — OWNER: W3-GAMES.
   Resolves the games' strings from lib/film.ts (`toy.drone.*`,
   `toy.deadeye.*`: page microcopy, status "proposed", unsigned) on the
   server and hands them to the client pieces as props. A string that may
   not render here (copyVisible) is dropped; the game then hides the piece
   that needs it rather than show a hole.
   Gate lines are filled with the gauntlet's titles VERBATIM (content rules:
   research text is never reworded).
   ========================================================================== */

import { film, type Copy, type CopyKey } from "@/lib/film";
import { copyText, copyVisible } from "@/lib/sections";
import type { DeadEyeCopy, DroneCopy } from "@/components/games/shared";

const text = (k: CopyKey, extra?: Record<string, string | number>): string | null => {
  const c = copyText(k, extra);
  return copyVisible(c) ? c.text : null;
};

/** A key that may not exist yet (asked of the assembler in a handoff):
 *  its text once lib/film.ts has it, else null. Never a tsc dependency on
 *  the order the keys land in. */
const optional = (k: string): string | null => {
  const has = (film.copy as Readonly<Record<string, Copy | undefined>>)[k];
  return has ? text(k as CopyKey) : null;
};

/** The drone's strings, or null when any required one may not render. */
export function droneCopy(titles: readonly string[]): DroneCopy | null {
  const pill = text("toy.drone.pill");
  const cmd = text("toy.drone.cmd");
  const help = text("toy.drone.help");
  const score = text("toy.drone.score");
  const next = text("toy.drone.next");
  const rm = text("toy.drone.rm");
  const gates = titles.map((title, i) => text("toy.drone.gate", { n: i + 1, title }));
  if (!pill || !cmd || !help || !score || !next || !rm || titles.length !== 7 || gates.some((g) => !g)) return null;
  return { pill, cmd, help, score, next, rm, gates: gates as string[], titles, best: optional("toy.drone.best") };
}

/** Dead Eye's strings, or null when any required one may not render. */
export function deadEyeCopy(): DeadEyeCopy | null {
  const pill = text("toy.deadeye.pill");
  const survivor = text("toy.deadeye.survivor");
  const score = text("toy.deadeye.score");
  const fire = text("toy.deadeye.fire");
  const release = text("toy.deadeye.release");
  if (!pill || !survivor || !score || !fire || !release) return null;
  return { pill, survivor, score, fire, release, best: optional("toy.deadeye.best") };
}
