"use client";

import { useSyncExternalStore } from "react";
import { anchors, cardAnchors, sectionById } from "@/lib/sections";

/* ONE shared active-section observer for the whole page (the header's act
   label and world ground, and the menu, subscribe to it). It watches every
   manifest anchor — including the `#top` hero sentinel — plus the derived
   act cards (#act-1…, present once the cards render) and, while the credits
   roll lives in the layout footer, `#credits`; so the active id is "top" (no
   act label) at the top of the page instead of whatever section was last
   scrolled past. Detection band: a 5% strip just above the viewport's
   middle. Ids with no element on the page are simply skipped. */

let active = "";
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;

function start() {
  if (observer || typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver(
    (entries) => {
      let next = active;
      for (const e of entries) if (e.isIntersecting) next = e.target.id;
      if (next !== active) {
        active = next;
        listeners.forEach((l) => l());
      }
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
  );
  const ids = [...anchors, ...cardAnchors, ...(sectionById("credits") ? [] : ["credits"])];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  start();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

/** Id of the section currently crossing the viewport's reading line
 *  ("" before the first observation, and on the server). */
export function useActiveSection(): string {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => "",
  );
}
