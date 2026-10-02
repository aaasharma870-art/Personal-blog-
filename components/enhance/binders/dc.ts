/* ============================================================================
   ENHANCER BINDER: dc — OWNER: W3-CINEMA (plan §3.2; spec §11.1).
   Binds the director's-cut controls in the server markup (`[data-dc]`: the
   hero CTA row's "▶ Director's cut", components/director/
   directors-cut-button.tsx). Run by components/enhance/desktop-enhancer.ts
   (DESKTOP_FINE, home page: at ladder step 2 with motion on, or after the
   quiet window with motion off), which then replays the clicks the boot
   script recorded before this ran (`data-enhance-queue`): the delegated
   listener below takes those replays like any click.

   - A click (or Enter / Space) starts the cut (components/director/api.ts:
     it borrows the sound inside the click and loads the player).
   - Reduced motion or Pause: every control is aria-disabled ("Motion is
     paused" shows by CSS from the first paint) and a press does nothing.
   - Intent (hover, focus) warms the player chunk.
   ========================================================================== */

import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { startDirectorsCut } from "@/components/director/api";

const SEL = "[data-dc]";

export default function bind(root: Document): () => void {
  const sync = () => {
    const off = motionOffNow();
    for (const el of root.querySelectorAll<HTMLElement>(SEL)) {
      if (off) el.setAttribute("aria-disabled", "true");
      else el.removeAttribute("aria-disabled");
    }
  };

  const onClick = (e: MouseEvent) => {
    const t = e.target instanceof Element ? e.target.closest<HTMLElement>(SEL) : null;
    if (!t) return;
    e.preventDefault();
    if (motionOffNow() || t.getAttribute("aria-disabled") === "true") return;
    startDirectorsCut();
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
    root.removeEventListener("click", onClick);
    root.removeEventListener("pointerover", warm);
    root.removeEventListener("focusin", warm);
    offMotion();
  };
}
