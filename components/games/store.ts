/* ============================================================================
   GAMES STORE (PHASE3-SPEC §9.2 #2, #3) — OWNER: W3-GAMES.
   The two real games' best scores, per visitor, in this browser only:
     localStorage["aryan:games:v1"] =
       {"v":1,"drone":{"best":18400},"deadeye":{"n":5,"left":2300}}
   drone   the fastest clean course (all 7 gates), in ms;
   deadeye the best round: most killed rows marked, then the most Dead Eye
           time left (ms; 0 when untimed under reduced motion).
   Lazy only (the game chunks import it; never the first load). Every access
   is in try/catch: a blocked store keeps the view's own copy in memory, so a
   best still reads right for the rest of the visit.
   ========================================================================== */

const KEY = "aryan:games:v1";

export type DeadEyeBest = { n: number; left: number };
type Stored = { v: 1; drone?: { best: number }; deadeye?: DeadEyeBest };

let memory: Stored | null = null;

function read(): Stored {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Partial<Stored>) : null;
    if (s && s.v === 1) return s as Stored;
  } catch {
    /* blocked or malformed: start over */
  }
  return { v: 1 };
}

function write(s: Stored): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    memory = null;
  } catch {
    memory = s;
  }
}

const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;

/** The drone's best clean course (ms), or null. */
export function droneBest(): number | null {
  const b = read().drone?.best;
  return finite(b) ? b : null;
}

/** Record a clean course; returns the best after it and whether it is new. */
export function recordDroneCourse(ms: number): { best: number; fresh: boolean } {
  const s = read();
  const prev = droneBest();
  if (prev !== null && prev <= ms) return { best: prev, fresh: false };
  write({ ...s, drone: { best: Math.round(ms) } });
  return { best: Math.round(ms), fresh: true };
}

/** Dead Eye's best round, or null. */
export function deadEyeBest(): DeadEyeBest | null {
  const b = read().deadeye;
  return b && finite(b.n) && finite(b.left) ? b : null;
}

/** Record a round; returns the best after it and whether it is new. */
export function recordDeadEyeRound(n: number, left: number): { best: DeadEyeBest; fresh: boolean } {
  const s = read();
  const prev = deadEyeBest();
  const next = { n, left: Math.round(left) };
  if (prev && (prev.n > n || (prev.n === n && prev.left >= next.left))) return { best: prev, fresh: false };
  write({ ...s, deadeye: next });
  return { best: next, fresh: true };
}
