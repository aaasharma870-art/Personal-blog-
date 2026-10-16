"use client";

/* ============================================================================
   BED FOLLOWER (spec §10.2, §3.5) — OWNER: W2-SOUND. Loaded lazily by the
   SoundToggle only while sound is on. Picks the bed of the world at the
   reading line (the shared active-section store, corrected by a DOM probe
   once scrolling settles, like the header) and hands it to the engine after
   150 ms of stability (the engine crossfades over 1.1 s, equal power).
   - CARD-AWARE: inside a pinned act card the picture changes at the card's
     own progress, not when its box reaches the reading line. The card
     publishes its phase as `data-card-phase` (a below p .50, then b, m, e;
     components/sections/act-card/card-p3.tsx usePhase). While it is "a" the
     bed is the OLD world's (the seam keeps Pirates + storm, the ignite
     card keeps the campfire); from "b" on it is the card's world with the
     storm off, so the classroom is never under the sea and the Great Hall
     hum never starts under the campfire. No attribute (unpinned, reduced
     motion, phones): the whole card box plays the card's world as before.
   - The intro: while html.intro-armed (the Play card, the flight) the bed
     is the Harry Potter hall; the broom landing hands over to Pirates.
   - The experiment section is a silent bed; off the home page, the house.
   - Entering the films chapter starts a projector; the credits run the reel
     out (once per page view each, even if Pause unmounts and remounts the
     follower; a new pass re-arms them: p3:view-reset). During the director's
     cut the credits stay silent: dc:stop plays the one run-out.
   - Never on /lab/**: the sound lab picks its beds by hand (the header's
     toggle would otherwise force the house bed over the bench).
   ========================================================================== */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { actCards, anchors, cardAnchors, sectionById, worldOf } from "@/lib/sections";
import { bedLayer, sound, type BedId } from "@/lib/audio";
import { ENTRY_CUES, SILENT_SECTIONS } from "@/lib/audio/cues";
import { on } from "@/lib/events";
import { useActiveSection } from "@/components/site/use-active-section";

const DEBOUNCE_MS = 150;
/** Entry cues already played in this page view (survives a remount). */
const played = { path: "", ids: new Set<string>() };
const SETTLE_MS = 160;
const PROBE_IDS: readonly string[] = [...anchors, ...cardAnchors, ...(sectionById("credits") ? [] : ["credits"])];

/** The anchored section (or act card) spanning the reading band, or null. */
function probeActive(): string | null {
  const y = window.innerHeight * 0.475;
  let hit: string | null = null;
  for (const id of PROBE_IDS) {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (r && r.height > 0 && r.top <= y && r.bottom > y) hit = id;
  }
  return hit;
}

/** A new pass over the page (the controller's arm(): Replay intro, "Play it
 *  again"): the section-entry cues play again. lib/impact.ts re-arms its own
 *  once-per-world impacts and the engine its title stings on the same event. */
export function resetViewState(): void {
  played.ids.clear();
}
on("p3:view-reset", resetViewState);

/* — The pinned card's phase (a, b, m, e; "" = not pinned / not live) ——— */
const phaseOfCard = (id: string): string => document.getElementById(id)?.getAttribute("data-card-phase") ?? "";
function subscribePhase(cb: () => void): () => void {
  const mo = new MutationObserver(cb);
  mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-card-phase"] });
  return () => mo.disconnect();
}

/* — The intro: the Play card and the flight play the hall's bed ———————— */
let landed = false;
on("intro:land", () => {
  landed = true;
});
on("p3:view-reset", () => {
  landed = false;
});
const introHeld = (): boolean => !landed && document.documentElement.classList.contains("intro-armed");
function subscribeIntro(cb: () => void): () => void {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const offs = [on("intro:land", cb), on("p3:view-reset", cb)];
  return () => {
    mo.disconnect();
    offs.forEach((off) => off());
  };
}

/** "bed|storm" for an active id ("" = before the first observation = top);
 *  `phase` is that card's data-card-phase. */
function bedKey(id: string, home: boolean, phase: string, intro: boolean): string {
  if (!home) return "house|0";
  if (intro) return "hp|0";
  const key = id || "top";
  if (SILENT_SECTIONS.includes(key)) return "|0";
  const card = actCards.find((c) => c.id === key);
  if (card) {
    if (phase === "a") {
      // before the new world is on screen: the old world's bed
      if (card.transition === "seam") return "pirates|1";
      if (card.transition === "ignite") return "rdr2|0";
      if (card.transition === "opening") return "pirates|0";
      return `${card.to}|0`;
    }
    if (phase) return `${card.to}|0`; // b, m, e: the card's world, storm off
    return card.transition === "seam" ? "pirates|1" : `${card.to}|0`; // unpinned: the whole box
  }
  const s = sectionById(key);
  return `${s ? worldOf(s) : "house"}|0`;
}

export default function BedFollower() {
  const path = usePathname();
  return path.startsWith("/lab") ? null : <Follow path={path} />;
}

function Follow({ path }: { path: string }) {
  const home = path === "/";
  const observed = useActiveSection();
  const observedRef = useRef(observed);
  const [probe, setProbe] = useState<{ id: string | null; base: string }>({ id: null, base: "" });

  useEffect(() => {
    observedRef.current = observed;
  }, [observed]);

  // After scrolling settles, re-read the truth from the DOM (a long jump can
  // leave the observer stale). Passive listener; one timeout per event.
  useEffect(() => {
    let t = 0;
    const read = () => {
      const id = probeActive();
      const base = observedRef.current;
      setProbe((prev) => (prev.id === id && prev.base === base ? prev : { id, base }));
    };
    const schedule = () => {
      window.clearTimeout(t);
      // twice: a long jump can still be settling (pin spacers, lazy images)
      // at the first look, and no scroll event follows to correct it
      t = window.setTimeout(() => {
        read();
        t = window.setTimeout(read, 450);
      }, SETTLE_MS);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    // and a slow look every 0.7 s: a jump that lands while the page is still
    // settling must not leave the wrong bed until the next scroll
    const iv = window.setInterval(() => {
      if (document.visibilityState === "visible") read();
    }, 700);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(iv);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  const active = probe.id !== null && probe.base === observed ? probe.id : observed;
  const phase = useSyncExternalStore(
    subscribePhase,
    () => phaseOfCard(active),
    () => "",
  );
  const intro = useSyncExternalStore(subscribeIntro, introHeld, () => false);
  const key = bedKey(active, home, phase, intro);

  // The bed: at once on mount (sound just came on), then debounced.
  const first = useRef(true);
  useEffect(() => {
    const apply = () => {
      const [b, storm] = key.split("|");
      bedLayer("storm", storm === "1");
      sound.bed((b || null) as BedId | null);
    };
    if (first.current) {
      first.current = false;
      apply();
      return;
    }
    const t = window.setTimeout(apply, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [key]);

  // Section-entry cues, once per page view each.
  useEffect(() => {
    if (played.path !== path) {
      played.path = path;
      played.ids.clear();
    }
    const cue = home ? ENTRY_CUES[active] : undefined;
    if (!cue || played.ids.has(active)) return;
    played.ids.add(active);
    // during the director's cut dc:stop plays the one reel run-out
    if (cue === "reel-runout" && (window as Window & { __dc?: boolean }).__dc) return;
    sound.cue(cue);
  }, [active, home, path]);

  return null;
}
