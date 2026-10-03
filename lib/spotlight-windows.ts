/* ============================================================================
   SPOTLIGHT WINDOWS — the performance window of every scroll star whose
   host registers without one (P3-11 r1 F1; lib/spotlight.ts THE WINDOW).
   PURE (no imports): the lazy spotlight impl, the desktop words binder and
   the validator (scripts/checks/beats.mjs) read it; no first-load module
   imports it.

   A window is relative to the box of the element that carries
   `data-beat="<id>"` + `data-beat-star` (the one the host registers). The
   words binder also REGISTERS every such element listed here, so a host
   with markup only (the hero, the About's B09 marker, the voyage steps, the
   principles room) needs no client code. A host's own `own` option or a
   non-empty `data-beat-scroll` attribute wins over this table.

   Each value says WHEN the star visibly performs, read off its host:
   ========================================================================== */

/** Card markers (app/p3/cards.css: 50svh + p × travel inside the pin
 *  spacer): the box crosses the reading line exactly while p ∈ [b0, b1]. */
const CARD = "top 50%, bottom 50%";

export const SCROLL_WINDOWS: Readonly<Record<string, string>> = {
  // hero-stage.tsx: the wave loop + the exit push, while the hero is on screen
  B02: "top 0%, bottom 0%",
  // the act cards' two stars (card-p3.tsx BeatMarkers)
  B03: CARD,
  B04: CARD,
  B13: CARD,
  B14: CARD,
  B36: CARD,
  B38: CARD,
  B48: CARD,
  B50: CARD,
  // about.tsx: the marker sits at the journey's top; the voyage column
  // arrives and pins with the h2 (journey top from 35 % to just above the
  // viewport; r1 sheets: the panel settles, its caption fades, the route
  // icons draw; earlier it only scrolls)
  B09: "top 35%, top -5%",
  // journey-voyage.tsx: frame = the scroll between the step centres
  // (steps 1–2 = B10, 3–4 = B11), each centre on the reading line
  B10: "center 50%, #journey-step-3 center 50%",
  B11: "center 50%, #journey-step-4 center 50%",
  // stage.tsx: the split window arrives over 40vh (lib/stage.ts
  // shotArrival: the split's top from the viewport bottom to 60 %); the
  // window is sticky, so it is measured from its split's top
  B19: "top 100%, top 60%",
  // film-screen.tsx: the house lights close (frame top 125 % → 85 %); the
  // marker sits 105vh above the frame, 40vh tall
  B30: "top 20%, bottom 20%",
  // films-section.tsx: the warm point descends while the tintype card's top
  // travels 80 % → 0 (the marker straddles the films' bottom edge)
  B35: "top 60%, bottom 20%",
  // rdr2-frontier.tsx: the trail fog lifts over `entry 35% cover 55%`
  B41: "35% 100%, 55% 45%",
  // writing.tsx: the camp fades up as the voices' top rises 100 % → 30 %
  B46: "bottom 100%, bottom 30%",
  // campfire-stage.tsx: night falls, the camp drifts, the fire flickers and
  // the fireflies drift (live) from the fade-up's end until the stage's
  // bottom passes 30 %
  B47: "top 30%, bottom 30%",
  // principles-map.tsx: the footprints' walk (one useScroll, "start 62%" →
  // "end 62%", split per room) through rooms 1–4; room 1 hosts the beat
  // (P3-11 r1, F5), room 5 is B55's scrubbed sentence. The Lumos ALT (no
  // rooms; B54 on its third row): that row crossing the 62 % line.
  B54: "top 62%, [data-room='4'] bottom 62%",
};

/** Scroll stars that animate on their own while owned (not only with the
 *  scroll): the hero's wave loop, the camp's fire and fireflies. */
export const LIVE_STARS: ReadonlySet<string> = new Set(["B02", "B47"]);

/** No window declared anywhere: the old middle-60 % band (the box overlaps
 *  20 %–80 % of the viewport). */
export const DEFAULT_WINDOW = "top 80%, bottom 20%";

/** One end of a window: `sel` (null = the star's own element), `f` = the
 *  share of that element's height from its top, `v` = the viewport share. */
export type WindowEdge = { sel: string | null; f: number; v: number };

const share = (s: string | undefined): number | null => {
  const m = s ? /^(-?\d+(?:\.\d+)?)%$/.exec(s) : null;
  return m ? Number(m[1]) / 100 : null;
};

function edgeOf(s: string): WindowEdge | null {
  const t = s.trim().split(/\s+/);
  if (t.length < 2) return null;
  const v = share(t[t.length - 1]);
  const e = t[t.length - 2];
  const f = e === "top" ? 0 : e === "center" ? 0.5 : e === "bottom" ? 1 : share(e);
  return v == null || f == null ? null : { sel: t.length > 2 ? t.slice(0, -2).join(" ") : null, f, v };
}

/** "<start>, <end>" → its two edges, or null when it does not parse. */
export function parseWindow(spec: string): readonly [WindowEdge, WindowEdge] | null {
  const parts = spec.split(",");
  if (parts.length !== 2) return null;
  const a = edgeOf(parts[0]);
  const b = edgeOf(parts[1]);
  return a && b ? [a, b] : null;
}
