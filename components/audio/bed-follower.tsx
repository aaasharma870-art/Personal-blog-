"use client";

/* ============================================================================
   BED FOLLOWER (spec §10.2, §3.5) — OWNER: W2-SOUND. Loaded lazily by the
   SoundToggle only while sound is on. Picks the bed of the world at the
   reading line (the shared active-section store, corrected by a DOM probe
   once scrolling settles, like the header) and hands it to the engine after
   300 ms of stability (the engine crossfades over 1.5 s, equal power).
   - The seam card plays the Pirates bed with its storm layer.
   - The experiment section is a silent bed; off the home page, the house.
   - Entering the films chapter starts a projector; the credits run the reel
     out (once per page view each, even if Pause unmounts and remounts the
     follower).
   - Never on /lab/**: the sound lab picks its beds by hand (the header's
     toggle would otherwise force the house bed over the bench).
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { actCards, anchors, cardAnchors, sectionById, worldOf } from "@/lib/sections";
import { bedLayer, sound, type BedId } from "@/lib/audio";
import { ENTRY_CUES, SILENT_SECTIONS } from "@/lib/audio/cues";
import { useActiveSection } from "@/components/site/use-active-section";

const DEBOUNCE_MS = 300;
/** Entry cues already played in this page view (survives a remount). */
const played = { path: "", ids: new Set<string>() };
const SETTLE_MS = 300;
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

/** "bed|storm" for an active id ("" = before the first observation = top). */
function bedKey(id: string, home: boolean): string {
  if (!home) return "house|0";
  const key = id || "top";
  if (SILENT_SECTIONS.includes(key)) return "|0";
  const card = actCards.find((c) => c.id === key);
  if (card) return card.transition === "seam" ? "pirates|1" : `${card.to}|0`;
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
    const schedule = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const id = probeActive();
        const base = observedRef.current;
        setProbe((prev) => (prev.id === id && prev.base === base ? prev : { id, base }));
      }, SETTLE_MS);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  const active = probe.id !== null && probe.base === observed ? probe.id : observed;
  const key = bedKey(active, home);

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
    sound.cue(cue);
  }, [active, home, path]);

  return null;
}
