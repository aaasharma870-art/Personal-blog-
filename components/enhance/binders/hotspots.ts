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
     nothing until the eggs are back on, including hotspots that mount
     while they are off (a MutationObserver, only while off).
   ========================================================================== */

import { motionOffNow } from "@/lib/flags";
import { EGG_EVENT, eggsSessionOff, subscribeEggs, triggerEgg, type EggId } from "@/components/eggs/egg-bus";

const SEL = "button[data-egg-hotspot]";

/* — pc-coin's moonlight (PHASE3-SPEC §9.1 #5; components/worlds/pirates/
     coin-moon.tsx). Its wiring lives here, in the lazy desktop chunk, not
     in the first-load chart (W3 budget): only this binder makes the coin
     fire. Each `aztec-coin` sweeps the moonlight once over the chart's brass
     layer; under reduced motion / Pause (at the press) it is an instant
     swap held until the next press or Esc. coin-moon.tsx is plain DOM: it
     inserts its layer right after the chart's `[data-chart-medallion]`
     (over the medallion, under the compass and the labels) and removes it
     when it ends. One chart carries the coin at a time. */

const loadMoon = () => import("@/components/worlds/pirates/coin-moon");

function coinMoons(root: Document): () => void {
  let moon: { stop: () => void; hold: boolean } | null = null;
  let seq = 0;
  const onEgg = (e: Event) => {
    if ((e as CustomEvent<{ id?: string } | undefined>).detail?.id !== "aztec-coin") return;
    const medal = root.querySelector(`${SEL}[data-egg="aztec-coin"]`)?.closest("[data-chart-plot]")?.querySelector("[data-chart-medallion]");
    if (!medal) return;
    const was = moon;
    moon = null;
    was?.stop();
    const n = ++seq;
    // a held swap: this press puts the gold back
    if (was?.hold) return;
    const hold = motionOffNow();
    void loadMoon().then(
      ({ default: coinMoon }) => {
        if (n !== seq || !medal.isConnected) return;
        const m = { hold, stop: () => {} };
        moon = m;
        // (it may end at once: motion went off before the chunk arrived)
        m.stop = coinMoon(medal, hold, () => {
          if (moon === m) moon = null;
        });
      },
      () => {},
    );
  };
  window.addEventListener(EGG_EVENT, onEgg);
  return () => {
    window.removeEventListener(EGG_EVENT, onEgg);
    seq++;
    moon?.stop();
    moon = null;
  };
}

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

  /** While the eggs are off: hotspots that mount later (the coin in the
   *  voyage chart, the pen once the ledger is read) go aria-disabled too. */
  let late: MutationObserver | null = null;
  const disable = (el: Element) => el.setAttribute("aria-disabled", "true");
  const syncOff = () => {
    const off = eggsSessionOff();
    root.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
      if (off) disable(el);
      else el.removeAttribute("aria-disabled");
    });
    if (off && !late && typeof MutationObserver !== "undefined") {
      late = new MutationObserver((records) => {
        for (const r of records) {
          for (const n of r.addedNodes) {
            if (!(n instanceof Element)) continue;
            if (n.matches(SEL)) disable(n);
            n.querySelectorAll(SEL).forEach(disable);
          }
        }
      });
      late.observe(root.body ?? root.documentElement, { childList: true, subtree: true });
    } else if (!off && late) {
      late.disconnect();
      late = null;
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
  root.addEventListener("pointerover", onOver);
  root.addEventListener("pointerout", onOut);
  syncOff();
  const offEggs = subscribeEggs(syncOff);
  const offMoons = coinMoons(root);

  return () => {
    endHold();
    endDwell();
    offEggs();
    offMoons();
    late?.disconnect();
    late = null;
    root.removeEventListener("click", onClick);
    root.removeEventListener("pointerdown", onDown);
    root.removeEventListener("pointerup", onUp);
    root.removeEventListener("pointercancel", onUp);
    root.removeEventListener("pointerover", onOver);
    root.removeEventListener("pointerout", onOut);
  };
}
