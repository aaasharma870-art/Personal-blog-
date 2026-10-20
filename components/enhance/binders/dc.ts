/* ============================================================================
   ENHANCER BINDER: dc — OWNER: W3-CINEMA (plan §3.2; spec §11.1).
   Binds the director's-cut controls in the server markup (`[data-dc]`: the
   hero CTA row's "▶ Director's cut", components/director/
   directors-cut-button.tsx). Run by components/enhance/desktop-enhancer.ts
   (DESKTOP_FINE, home page: at ladder step 2 with motion on, or after the
   quiet window with motion off), which then replays the clicks the boot
   script recorded before this ran (`data-enhance-queue`): the delegated
   listener below takes those replays like any click.

   - A click (or Enter / Space) opens the header dock's chooser (Quick tour /
     Full tour; components/site/control-dock.tsx), or stops a cut that is
     running. Only if no dock answers does it start the cut itself
     (components/director/api.ts: it loads the player; the sound stays as the
     visitor set it).
   - A press before the header dock has hydrated (it is in the server markup
     but nobody answers yet; `next dev` takes seconds) shows `aria-busy` on
     the button (app/p3/dock.css: pressed look, pulsing icon) and opens the
     chooser the moment the dock answers.
   - Reduced motion or Pause: every control is aria-disabled ("Motion is
     paused" shows by CSS from the first paint) and a press does nothing.
   - Intent (hover, focus) warms the player chunk.
   ========================================================================== */

import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { startDirectorsCut } from "@/components/director/api";
import { openCutChooser } from "@/components/site/dock-actions";

const SEL = "[data-dc]";
/** How long a press waits for the dock to hydrate before the cut starts itself. */
const WAIT_MS = 12_000;

export default function bind(root: Document): () => void {
  const sync = () => {
    const off = motionOffNow();
    for (const el of root.querySelectorAll<HTMLElement>(SEL)) {
      if (off) el.setAttribute("aria-disabled", "true");
      else el.removeAttribute("aria-disabled");
    }
  };

  /** The dock is in the page's server markup but React has not hydrated it
   *  yet (nobody answers the chooser event): a press waits here, showing
   *  `aria-busy` (Oct 20, fix5; this binder now binds before hydration ends). */
  let waiting = 0;
  let waitingFor: HTMLElement | null = null;
  const endWait = () => {
    window.clearTimeout(waiting);
    waiting = 0;
    waitingFor?.removeAttribute("aria-busy");
    waitingFor = null;
  };

  const onClick = (e: MouseEvent) => {
    const t = e.target instanceof Element ? e.target.closest<HTMLElement>(SEL) : null;
    if (!t) return;
    e.preventDefault();
    if (motionOffNow() || t.getAttribute("aria-disabled") === "true") return;
    // the dock opens the chooser (or stops a run)
    if (openCutChooser()) return;
    // no dock on this page: start the cut itself
    if (!root.querySelector("[data-dock]")) {
      startDirectorsCut();
      return;
    }
    // the dock exists but has not hydrated: wait for it (<= WAIT_MS), then
    // open the chooser; a dock that never comes is not waited for forever
    if (waiting) return;
    waitingFor = t;
    t.setAttribute("aria-busy", "true");
    const t0 = performance.now();
    const poll = () => {
      waiting = 0;
      if (!openCutChooser() && performance.now() - t0 < WAIT_MS) {
        waiting = window.setTimeout(poll, 80);
        return;
      }
      const late = performance.now() - t0 >= WAIT_MS;
      endWait();
      if (late && !motionOffNow()) startDirectorsCut();
    };
    waiting = window.setTimeout(poll, 80);
  };

  let warmed = false;
  const warm = (e: Event) => {
    if (warmed || !(e.target instanceof Element) || !e.target.closest(SEL) || motionOffNow()) return;
    warmed = true;
    void import("@/components/director/directors-cut").catch(() => {
      warmed = false;
    });
  };

  root.addEventListener("click", onClick);
  root.addEventListener("pointerover", warm, { passive: true });
  root.addEventListener("focusin", warm);
  sync();
  const offMotion = onMotionOffChange(sync);
  return () => {
    endWait();
    root.removeEventListener("click", onClick);
    root.removeEventListener("pointerover", warm);
    root.removeEventListener("focusin", warm);
    offMotion();
  };
}
