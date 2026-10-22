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
   - THE MARKERS (Oct 22, fix/eggs; app/p3/eggs-lazy.css): every element
     carrying `data-egg-glint="<hunt id>"` (the hotspots' <EggGlint/>, and the
     Run button, "HERE BE MONSTERS" and the snitch) gets its state here:
     `data-found` (from the stored hunt, live), `data-in-view` (the slow pulse
     runs only while it is on screen), `data-egg-off` (eggs off: no marker),
     the one hover / focus tip (a few words naming the action), and the
     "Take me there" call (`egg:call`: the hunt panel arrives, the marker
     pulses ~2 s, or stands out still under reduced motion / Pause).
   ========================================================================== */

import "@/app/p3/eggs-lazy.css";

import { motionOffNow } from "@/lib/flags";
import { copyText, copyVisible } from "@/lib/sections";
import { EGG_EVENT, eggsSessionOff, subscribeEggs, triggerEgg, type EggId } from "@/components/eggs/egg-bus";
import { HUNT_ROWS } from "@/components/eggs/hunt-rows";
import { foundIds, isHuntId, subscribeHunt, type HuntId } from "@/components/eggs/hunt-store";

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


/* — the markers: found / in view / off, the tip, the call ———————————————— */

const GL = "[data-egg-glint]";
/** The call's marker stays lit this long (a still call under reduced motion
 *  stays a little longer: nothing moves, so it is read, not caught). */
const CALL_MS = 2600;
const CALL_STILL_MS = 3600;

const huntOf = (el: Element): HuntId | null => {
  const h = el.getAttribute("data-egg-glint");
  return h && isHuntId(h) ? h : null;
};

/** The tip's words: the action while unfound; the egg's name and "Found"
 *  once found. Null when the copy may not render here. */
function tipFor(el: HTMLElement): string | null {
  const h = huntOf(el);
  if (!h) return null;
  const row = HUNT_ROWS[h];
  if (el.hasAttribute("data-found")) {
    const name = copyText(row.name);
    const found = copyText("egg.hunt.found");
    return copyVisible(name) && copyVisible(found) ? `${name.text} · ${found.text}` : null;
  }
  const tip = "tip" in row ? copyText(row.tip) : null;
  return tip && copyVisible(tip) ? tip.text : null;
}

function markers(root: Document): () => void {
  const hosts = new Set<HTMLElement>();
  const io =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) e.target.toggleAttribute("data-in-view", e.isIntersecting);
          },
          { threshold: 0.25 },
        );

  const syncOne = (el: HTMLElement, found: ReadonlySet<HuntId>) => {
    const h = huntOf(el);
    el.toggleAttribute("data-found", h !== null && found.has(h));
    el.toggleAttribute("data-egg-off", eggsSessionOff());
  };
  const sync = () => {
    const found = new Set(foundIds());
    for (const el of hosts) {
      if (!el.isConnected) {
        hosts.delete(el);
        io?.unobserve(el);
        continue;
      }
      syncOne(el, found);
    }
    // a find while its tip shows: the tip reads "found" at once; the eggs
    // turned off: it goes with the marker
    if (tipHost) {
      if (tipHost.hasAttribute("data-egg-off")) hide();
      else place(tipHost);
    }
  };
  const arm = (el: HTMLElement) => {
    if (hosts.has(el)) return;
    hosts.add(el);
    io?.observe(el);
    syncOne(el, new Set(foundIds()));
  };
  const scan = (n: ParentNode) => n.querySelectorAll<HTMLElement>(GL).forEach(arm);

  /* — the tip: ONE element, shown on hover and keyboard focus ———————— */
  let tipEl: HTMLElement | null = null;
  let tipHost: HTMLElement | null = null;
  /** Why the tip shows: the pointer is on the host, the keyboard is, or a call. */
  let tipWhy: "hover" | "focus" | "call" = "hover";
  let posTimer = 0;
  let callTimer = 0;
  let callEl: HTMLElement | null = null;
  /** A call holds the tip against the arrival scroll's own events. */
  let holdUntil = 0;

  const ensureTip = (): HTMLElement => {
    if (!tipEl) {
      tipEl = root.createElement("div");
      tipEl.id = "egg-tip";
      tipEl.className = "egg-tip";
      tipEl.setAttribute("role", "tooltip");
      tipEl.hidden = true;
      root.body.appendChild(tipEl);
    }
    return tipEl;
  };
  function place(host: HTMLElement) {
    const tip = ensureTip();
    const text = tipFor(host);
    if (!text) {
      hide();
      return;
    }
    if (tip.textContent !== text) tip.textContent = text;
    tip.hidden = false;
    const r = host.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const vw = window.innerWidth;
    let x = r.left + r.width / 2 - w / 2;
    x = Math.max(8, Math.min(x, vw - w - 8));
    // above the marker; below it when the header is in the way, and for a
    // host that already has words around it (Run, "HERE BE MONSTERS": the
    // `badge` markers), below, so the tip never sits on Aryan's text
    let y = r.top - h - 12;
    const below = r.bottom + 12;
    const badge = host.querySelector('.egg-glint[data-glint="badge"]') !== null;
    if (y < 76 || (badge && below + h < window.innerHeight - 8)) y = below;
    tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  function show(host: HTMLElement, why: "hover" | "focus" | "call") {
    if (tipHost && tipHost !== host) tipHost.removeAttribute("aria-describedby");
    tipHost = host;
    tipWhy = why;
    host.setAttribute("aria-describedby", "egg-tip");
    place(host);
    window.clearInterval(posTimer);
    // the page may still be settling under the cursor (a glide, a landing, a
    // pinned card): follow the host, and let go when the reason is gone (the
    // pointer / the key focus left it) or it scrolled out of sight
    posTimer = window.setInterval(() => {
      const h = tipHost;
      if (!h) return;
      const r = h.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || !h.isConnected) return hide();
      if (performance.now() >= holdUntil) {
        if (tipWhy === "hover" && !h.matches(":hover")) return hide();
        if (tipWhy === "focus" && !h.matches(":focus-visible")) return hide();
      }
      place(h);
    }, 120);
  }
  function hide() {
    window.clearInterval(posTimer);
    if (tipHost) tipHost.removeAttribute("aria-describedby");
    tipHost = null;
    if (tipEl) tipEl.hidden = true;
  }
  const hostOf = (t: EventTarget | null): HTMLElement | null => (t instanceof Element ? t.closest<HTMLElement>(GL) : null);

  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const h = hostOf(e.target);
    if (h && h !== tipHost && !h.hasAttribute("data-egg-off")) show(h, "hover");
  };
  const onOut = (e: PointerEvent) => {
    const h = hostOf(e.target);
    if (!h || h !== tipHost) return;
    const to = e.relatedTarget;
    if (to instanceof Node && h.contains(to)) return;
    if (performance.now() < holdUntil) return;
    hide();
  };
  const onFocusIn = (e: FocusEvent) => {
    const h = hostOf(e.target);
    if (h && !h.hasAttribute("data-egg-off") && h.matches(":focus-visible")) show(h, "focus");
  };
  const onFocusOut = (e: FocusEvent) => {
    if (hostOf(e.target) === tipHost && performance.now() >= holdUntil) hide();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") hide();
  };
  // the reader scrolling away (a wheel; the page's own motion is followed, not dismissed)
  const onWheel = () => {
    if (tipHost && tipWhy !== "call" && performance.now() >= holdUntil) hide();
  };

  /* — "Take me there": the panel arrived; call the marker ————————— */
  const endCall = () => {
    window.clearTimeout(callTimer);
    callEl?.removeAttribute("data-call");
    callEl = null;
    holdUntil = 0;
    hide();
  };
  const onCall = (e: Event) => {
    const h = (e as CustomEvent<{ hunt?: string } | undefined>).detail?.hunt;
    if (!h || !isHuntId(h)) return;
    const el = root.querySelector<HTMLElement>(`[data-egg-glint="${h}"]`);
    if (!el || el.hasAttribute("data-egg-off")) return;
    endCall();
    const still = motionOffNow();
    // reduced motion / Pause: no pulse, the ring just stands out
    el.setAttribute("data-call", still ? "still" : "pulse");
    callEl = el;
    const ms = still ? CALL_STILL_MS : CALL_MS;
    holdUntil = performance.now() + 800;
    show(el, "call");
    callTimer = window.setTimeout(endCall, ms);
  };

  scan(root);
  const offHunt = subscribeHunt(sync);
  // the pen, the coin and the others that mount after this binder ran
  let queued: Node[] = [];
  let raf = 0;
  const flush = () => {
    raf = 0;
    const nodes = queued;
    queued = [];
    for (const n of nodes) {
      if (!n.isConnected || !(n instanceof Element)) continue;
      if (n.matches(GL)) arm(n as HTMLElement);
      scan(n);
    }
  };
  const mo =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver((records) => {
          for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1) queued.push(n);
          if (queued.length && !raf) raf = window.requestAnimationFrame(flush);
        });
  mo?.observe(root.body ?? root.documentElement, { childList: true, subtree: true });

  root.addEventListener("pointerover", onOver);
  root.addEventListener("pointerout", onOut);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  root.addEventListener("keydown", onKey);
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("egg:call", onCall);
  const offEggs = subscribeEggs(sync);

  return () => {
    offHunt();
    offEggs();
    mo?.disconnect();
    io?.disconnect();
    window.cancelAnimationFrame(raf);
    endCall();
    window.clearInterval(posTimer);
    root.removeEventListener("pointerover", onOver);
    root.removeEventListener("pointerout", onOut);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    root.removeEventListener("keydown", onKey);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("egg:call", onCall);
    for (const el of hosts) {
      el.removeAttribute("data-found");
      el.removeAttribute("data-in-view");
      el.removeAttribute("data-egg-off");
      el.removeAttribute("data-call");
    }
    hosts.clear();
    tipEl?.remove();
    tipEl = null;
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
  const offMarkers = markers(root);

  return () => {
    offMarkers();
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
