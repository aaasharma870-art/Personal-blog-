/* ============================================================================
   ENHANCER BINDER: hotspots — OWNER: W2-HUNT (plan §3.2; PHASE3-SPEC §9.1).
   Binds every <EggHotspot> (`button[data-egg-hotspot]`) by delegation on
   the document, so hotspots that mount later bind too. Run by
   components/enhance/desktop-enhancer.ts (ladder step 2, DESKTOP_FINE,
   home page; the hotspots exist only there).
   - Activation → `triggerEgg(data-egg)`: the egg runtime counts it, the
     host draws it, the sound engine voices it. Triggered effects bypass the
     spotlight.
   - `data-egg-hold` (the chalk heart): a pointer must HOLD that long; a
     short press does nothing. A keyboard click (Enter / Space) is the hold.
     While held the button carries `data-holding` (game.css draws the
     progress ring; instant release).
   - `data-egg-dwell` (the campfire): resting a mouse on it that long fires
     it once per view; a click or a key still fires it any time.
   - "Turn off easter eggs" (session): hotspots go aria-disabled and do
     nothing until the eggs are back on.
   ========================================================================== */

import { eggsSessionOff, subscribeEggs, triggerEgg, type EggId } from "@/components/eggs/egg-bus";

const SEL = "button[data-egg-hotspot]";

function hotspotOf(t: EventTarget | null): HTMLElement | null {
  return t instanceof Element ? t.closest<HTMLElement>(SEL) : null;
}

export default function bind(root: Document): () => void {
  let holdTimer = 0;
  let holdEl: HTMLElement | null = null;
  /** The hold already fired: swallow the click its pointerup makes. */
  let swallow: HTMLElement | null = null;
  let dwellTimer = 0;
  let dwellEl: HTMLElement | null = null;
  const dwelt = new WeakSet<HTMLElement>();

  const fire = (el: HTMLElement) => {
    if (eggsSessionOff()) return;
    const id = el.dataset.egg as EggId | undefined;
    if (id) triggerEgg(id);
  };

  const endHold = () => {
    window.clearTimeout(holdTimer);
    holdEl?.removeAttribute("data-holding");
    holdEl = null;
  };
  const endDwell = () => {
    window.clearTimeout(dwellTimer);
    dwellEl = null;
  };

  const onClick = (e: MouseEvent) => {
    const el = hotspotOf(e.target);
    if (!el) return;
    if (swallow === el) {
      swallow = null;
      return;
    }
    // a pointer click on a hold hotspot is a short press: not the hold
    if (el.dataset.eggHold && e.detail > 0) return;
    fire(el);
  };

  const onDown = (e: PointerEvent) => {
    const el = hotspotOf(e.target);
    if (!el || !el.dataset.eggHold || e.button !== 0 || eggsSessionOff()) return;
    endHold();
    holdEl = el;
    el.setAttribute("data-holding", "");
    holdTimer = window.setTimeout(() => {
      swallow = el;
      endHold();
      fire(el);
    }, Number(el.dataset.eggHold) || 600);
  };
  const onUp = () => {
    if (holdEl) endHold();
    // the release may land outside the button (no click follows): the
    // swallow lives only until this press's own click (dispatched in the
    // same task), so a later Enter / Space still fires (W2 gate)
    const s = swallow;
    if (s) window.setTimeout(() => {
      if (swallow === s) swallow = null;
    }, 0);
  };

  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = hotspotOf(e.target);
    if (!el || el === dwellEl || !el.dataset.eggDwell || dwelt.has(el)) return;
    endDwell();
    dwellEl = el;
    dwellTimer = window.setTimeout(() => {
      dwelt.add(el);
      dwellEl = null;
      fire(el);
    }, Number(el.dataset.eggDwell) || 800);
  };
  const onOut = (e: PointerEvent) => {
    const el = hotspotOf(e.target);
    if (!el) return;
    const to = e.relatedTarget;
    if (to instanceof Node && el.contains(to)) return;
    if (el === dwellEl) endDwell();
    if (el === holdEl) endHold();
  };

  const syncOff = () => {
    const off = eggsSessionOff();
    root.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
      if (off) el.setAttribute("aria-disabled", "true");
      else el.removeAttribute("aria-disabled");
    });
  };

  root.addEventListener("click", onClick);
  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
  root.addEventListener("pointerover", onOver);
  root.addEventListener("pointerout", onOut);
  syncOff();
  const offEggs = subscribeEggs(syncOff);

  return () => {
    endHold();
    endDwell();
    offEggs();
    root.removeEventListener("click", onClick);
    root.removeEventListener("pointerdown", onDown);
    root.removeEventListener("pointerup", onUp);
    root.removeEventListener("pointercancel", onUp);
    root.removeEventListener("pointerover", onOver);
    root.removeEventListener("pointerout", onOut);
  };
}
