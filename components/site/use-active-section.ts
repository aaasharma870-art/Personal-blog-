"use client";

import { useSyncExternalStore } from "react";
import { anchors } from "@/lib/sections";

/* ONE shared active-section observer for the whole page (header nav, mobile
   menu and section rail all subscribe to it). It watches every manifest
   anchor — including the `#top` hero sentinel and `#voices` — so the active
   id is "top" (no nav item lit) at the top of the page instead of whatever
   section was last scrolled past. Same detection band as before: a 5% strip
   just above the viewport's middle. */

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
  for (const id of anchors) {
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
