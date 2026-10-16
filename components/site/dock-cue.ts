/* ============================================================================
   DOCK CUE (lazy; loaded after hydration by components/site/control-dock.tsx):
   the silent "you can press this" cue. Two ring pulses (about 2.8 s, CSS in
   app/p3/dock.css `[data-cue]`) on the Director's cut and Games buttons,
   once per session each, starting after the intro ends (or at once when the
   intro is not showing: a revisit, `?skip=intro`). Nothing under reduced
   motion or Pause (checked when it fires; the CSS also drops the animation).
   ========================================================================== */

import { motionOffNow } from "@/lib/flags";

const CUE_KEY = "aryan:dock-cue";

function cueSeen(name: string): boolean {
  try {
    return window.sessionStorage.getItem(`${CUE_KEY}:${name}`) === "1";
  } catch {
    return false;
  }
}
function cueMark(name: string): void {
  try {
    window.sessionStorage.setItem(`${CUE_KEY}:${name}`, "1");
  } catch {
    /* in-memory only: it plays once per page view */
  }
}

/** Arm both cues; returns the cleanup. */
export function armCues(cut: HTMLElement | null, games: HTMLElement | null): () => void {
  let timers: number[] = [];
  const clear = () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
  };
  const cue = (name: string, el: HTMLElement | null, delay: number) => {
    if (!el || cueSeen(name)) return;
    timers.push(
      window.setTimeout(() => {
        if (motionOffNow() || document.documentElement.classList.contains("intro-armed")) return;
        cueMark(name);
        el.setAttribute("data-cue", "");
        el.addEventListener("animationend", () => el.removeAttribute("data-cue"), { once: true });
      }, delay),
    );
  };
  const run = (lead: number) => {
    cue("cut", cut, lead);
    cue("games", games, lead + 700);
  };
  if (document.documentElement.classList.contains("intro-armed")) {
    const onEnd = () => run(1800);
    window.addEventListener("intro:end", onEnd, { once: true });
    return () => {
      window.removeEventListener("intro:end", onEnd);
      clear();
    };
  }
  run(1500);
  return clear;
}
