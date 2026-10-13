/* ============================================================================
   GAMES · the toy invites (PHASE3-SPEC §2.3 B26, B28; §3.8) — OWNER: W3-GAMES.
   One quiet "you can play this" gesture per toy, once per page view, never
   a game starting by itself: B26 the band's chalk drone lifts 8 px beside
   "▲ Take off", B28 the DEAD EYE pill pulses once. Each is a toy-invite
   TIME star: it asks the spotlight with `needsIdle` (it waits for the reader
   to stop scrolling, and is dropped if its host leaves the viewport), plays
   only on "play" and releases the spotlight when its one animation ends.
   Lazy (the desk chunks import it on DESKTOP_FINE with motion on); the
   spotlight answers "skip" at once for anything else, and a skip shows
   nothing (the end state is the rest state).
   ========================================================================== */

import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { spotlight } from "@/lib/spotlight";

/** Arm the invite `beat` on `host` (the element carrying its data-beat):
 *  once ≥ 60 % of it is in view, ask the spotlight; on "play" run `play()`.
 *  Returns the cancel (unmount): withdraws a waiting request, cancels a
 *  playing animation. */
export function armInvite(host: Element, beat: string, play: () => Animation | null | undefined): () => void {
  let gone = false;
  let asked = false;
  let anim: Animation | null = null;
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting || asked) return;
      asked = true;
      io.disconnect();
      void spotlight.request(beat, { weight: 1, needsIdle: true, durationMs: 1000 }).then((answer) => {
        if (answer !== "play") return;
        if (gone || motionOffNow()) {
          spotlight.release(beat);
          return;
        }
        anim = play() ?? null;
        const done = () => spotlight.release(beat);
        if (anim) anim.finished.then(done, done);
        else done();
      });
    },
    { threshold: 0.6 },
  );
  io.observe(host);
  // Pause / reduced motion mid-invite: stop at once (the rest state)
  const offMotion = onMotionOffChange(() => {
    if (motionOffNow()) anim?.cancel();
  });
  return () => {
    gone = true;
    offMotion();
    io.disconnect();
    anim?.cancel();
    if (asked) spotlight.release(beat);
  };
}
