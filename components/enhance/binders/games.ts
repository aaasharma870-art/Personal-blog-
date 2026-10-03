/* ============================================================================
   ENHANCER BINDER: games — OWNER: W3-GAMES (plan §3.2; PHASE3-SPEC §9.2 #2,
   #3; the dc binder's pattern). Run by components/enhance/desktop-enhancer.ts
   (DESKTOP_FINE, home page: at ladder step 2 with motion on, or after the
   quiet window with motion off), which then replays the clicks the boot
   script recorded before this ran (`data-enhance-queue`): the delegated
   listener below takes those replays like any click.

   Both game pills are plain markup with no first-load handler:
   - "▲ Take off" (`#drone-takeoff`, components/worlds/idiots/drone-band.tsx)
     carries the drone's strings (`data-copy`), the `systems.drone` variant
     (`data-variant`, useVariant's live value) and sits beside the chalk
     drone whose src the game flies. Each press renders the lazy game
     (components/games/drone/drone-game.tsx) into a small React root of its
     own inside the band's picture box (the pill row's parent), with the
     press count: the flight controller answers each new press once (take
     off, land, or the motion-off flight plan). One root per band, kept
     between flights (the score panel stays), dropped on leaving DESKTOP_FINE.
   - "DEAD EYE" (`#deadeye-call`, components/games/dead-eye/dead-eye-call.tsx,
     server markup) carries Dead Eye's strings and the manifest's
     `kill-list.deadeye` variant (a ?variant= override applies here, as in
     useVariant). A press starts a round (the lazy HUD, components/games/
     dead-eye/dead-eye-hud.tsx, in a fresh root: its HUD portals into the
     game-hud stage layer); a press during a round releases it at once.
     `aria-pressed` follows the round. The typed word and the palette reach
     it through DEAD_EYE_CALL (components/eggs/dead-eye.ts): "start" / "stop"
     here, "fire" in the HUD. B28, the invite: once, on scroll-idle, the pill
     pulses through the spotlight (motion on; re-armed when motion returns).
   Each game's chunk is warmed when its pill comes within a viewport, so a
   first press renders inside the click.
   Nothing starts by itself. Leaving DESKTOP_FINE (or this binder's cleanup)
   ends both games at once and resets the pill; coming back starts nothing.
   A round that ends by itself (Esc, Release, offscreen, the fast lane)
   brings focus home to the pill if it was in the game.
   Phones, touch tablets and reduced-motion phones never load this file.
   ========================================================================== */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "@/lib/flags";
import { effectiveVariant, type Variant } from "@/lib/variants";
import { armInvite } from "@/components/games/invite";
import { DEAD_EYE_CALL, type DeadEyeAction, type DeadEyeCopy, type DroneCopy } from "@/components/games/shared";

const DRONE = "drone-takeoff";
const DEAD_EYE = "deadeye-call";

type DroneMod = typeof import("@/components/games/drone/drone-game");
type HudMod = typeof import("@/components/games/dead-eye/dead-eye-hud");
const loadDrone = () => import("@/components/games/drone/drone-game");
const loadHud = () => import("@/components/games/dead-eye/dead-eye-hud");

function copyOf<T>(el: Element): T | null {
  try {
    return JSON.parse(el.getAttribute("data-copy") ?? "") as T;
  } catch {
    return null;
  }
}
const variantOf = (el: HTMLElement): Variant => (el.dataset.variant === "alt" ? "alt" : "default");

export default function bind(doc: Document): () => void {
  const fine = window.matchMedia(DESKTOP_FINE);
  let dead = false;
  /** Unmount after the current task's React work (a cleanup may run inside
   *  the page root's commit); still before the next paint. */
  const drop = (r: Root, after?: () => void) =>
    queueMicrotask(() => {
      r.unmount();
      after?.();
    });

  /* — the homemade drone —————————————————————————————————————————————— */
  let droneMod: DroneMod | null = null;
  let drone: {
    root: Root;
    host: HTMLElement;
    box: { current: HTMLDivElement | null };
    pill: { current: HTMLButtonElement | null };
    copy: DroneCopy;
  } | null = null;
  /** Presses of the pill (the controller answers each new count once). */
  let presses = 0;

  const renderDrone = (pill: HTMLButtonElement) => {
    if (!droneMod || dead || !fine.matches) return;
    // the chalk drone beside the pill: its src follows the variant
    const sprite = pill.parentElement?.querySelector("img")?.getAttribute("src");
    if (!sprite) return;
    if (!drone) {
      const box = pill.closest(".drone-pill-row")?.parentElement;
      const copy = copyOf<DroneCopy>(pill);
      if (!(box instanceof HTMLDivElement) || !copy) return;
      const host = document.createElement("div");
      host.style.display = "contents";
      box.appendChild(host);
      drone = { root: createRoot(host, { identifierPrefix: "drone-" }), host, box: { current: box }, pill: { current: pill }, copy };
    }
    drone.root.render(
      createElement(droneMod.default, {
        run: presses,
        box: drone.box,
        pill: drone.pill,
        copy: drone.copy,
        variant: variantOf(pill),
        sprite,
      }),
    );
  };
  const pressDrone = (pill: HTMLButtonElement) => {
    presses += 1;
    // a warmed chunk renders inside the click (no frame of delay)
    if (droneMod) renderDrone(pill);
    else
      void loadDrone().then(
        (m) => {
          droneMod = m;
          renderDrone(pill);
        },
        () => {},
      );
  };
  const dropDrone = () => {
    const d = drone;
    drone = null;
    if (d) drop(d.root, () => d.host.remove());
  };

  /* — Dead Eye ——————————————————————————————————————————————————————— */
  let hudMod: HudMod | null = null;
  let round: Root | null = null;
  /** A round is running or its chunk is on its way. */
  let live = false;
  /** The current round's number (a stale load or end is ignored). */
  let roundNo = 0;
  const deadEyePill = () => doc.getElementById(DEAD_EYE);

  const stopRound = () => {
    if (!live) return;
    live = false;
    roundNo += 1;
    deadEyePill()?.setAttribute("aria-pressed", "false");
    const r = round;
    round = null;
    // the HUD's unmount releases the round (the ledger restored at once)
    if (r) drop(r);
  };
  const ended = (n: number, reason: string) => {
    if (n !== roundNo || !live) return;
    const a = document.activeElement;
    const inGame = !a || a === document.body || Boolean(a.closest("#kill-list, [data-stage-layers]"));
    stopRound();
    // the fast lane moves focus to #work itself
    if (inGame && reason !== "fastlane") deadEyePill()?.focus({ preventScroll: true });
  };
  const startRound = () => {
    const pill = deadEyePill();
    if (live || dead || !fine.matches || !pill) return;
    const copy = copyOf<DeadEyeCopy>(pill);
    if (!copy) return;
    live = true;
    const n = ++roundNo;
    pill.setAttribute("aria-pressed", "true");
    const mount = (m: HudMod) => {
      hudMod = m;
      if (dead || !live || n !== roundNo || !fine.matches) return;
      round = createRoot(document.createElement("div"), { identifierPrefix: `deadeye-${n}-` });
      round.render(
        createElement(m.default, {
          copy,
          variant: effectiveVariant(variantOf(pill), "kill-list.deadeye", window.location.search),
          onEnd: (reason: string) => ended(n, reason),
        }),
      );
    };
    if (hudMod) mount(hudMod);
    else void loadHud().then(mount, () => (n === roundNo ? stopRound() : undefined));
  };

  /* — the presses (and the boot script's replays) ———————————————————————— */
  const onClick = (e: MouseEvent) => {
    const t = e.target instanceof Element ? e.target.closest<HTMLButtonElement>(`#${DRONE}, #${DEAD_EYE}`) : null;
    if (!t || dead || !fine.matches) return;
    // bound while the enhancer's queue still records (the binders bind one
    // per idle slice, the replay comes after the last): this press is
    // answered now, so it must not be replayed too (a second toggle)
    const q = window.__enhanceQ;
    if (q) for (let i = q.length - 1; i >= 0; i--) if (q[i]?.sel === `#${t.id}`) q.splice(i, 1);
    if (t.id === DRONE) pressDrone(t);
    else if (live) stopRound();
    else startRound();
  };
  // the typed word "deadeye" and the palette (components/eggs/dead-eye.ts):
  // `handled` tells the caller a bound binder answered (else it queues)
  const onCall = (e: Event) => {
    const d = (e as CustomEvent<{ action?: DeadEyeAction; handled?: boolean } | null>).detail;
    if (!d || dead) return;
    d.handled = true;
    if (d.action === "start") startRound();
    else if (d.action === "stop") stopRound();
  };
  // leaving DESKTOP_FINE: both games end at once; coming back starts nothing
  const onFine = () => {
    if (fine.matches) return;
    stopRound();
    dropDrone();
  };

  /* — B28: the invite; both chunks warmed when near ———————————————————— */
  const pill = deadEyePill();
  let offInvite: (() => void) | null = null;
  const arm = () => {
    if (offInvite || dead || !pill || motionOffNow()) return;
    offInvite = armInvite(pill, "B28", () =>
      pill.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)", offset: 0.35 }, { transform: "scale(1)" }], {
        duration: 700,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      }),
    );
  };
  // each game's chunk, warmed when its pill is within a viewport, so the
  // first press renders inside the click (a cold press loads it then)
  const warm = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        warm.unobserve(e.target);
        if (e.target.id === DRONE)
          void loadDrone().then(
            (m) => {
              droneMod = m;
            },
            () => {},
          );
        else
          void loadHud().then(
            (m) => {
              hudMod = m;
            },
            () => {},
          );
      }
    },
    { rootMargin: "100% 0px" },
  );
  for (const el of [doc.getElementById(DRONE), pill]) if (el) warm.observe(el);

  doc.addEventListener("click", onClick);
  window.addEventListener(DEAD_EYE_CALL, onCall);
  fine.addEventListener("change", onFine);
  const offMotion = onMotionOffChange(arm);
  arm();

  return () => {
    dead = true;
    doc.removeEventListener("click", onClick);
    window.removeEventListener(DEAD_EYE_CALL, onCall);
    fine.removeEventListener("change", onFine);
    offMotion();
    warm.disconnect();
    offInvite?.();
    stopRound();
    dropDrone();
  };
}
