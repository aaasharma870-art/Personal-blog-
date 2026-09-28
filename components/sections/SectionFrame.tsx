"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { SectionEntry } from "@/lib/page";

export type SectionContextValue = {
  entry: SectionEntry;
  /** Derived "01"…"NN" (numbered entries only). */
  number?: string;
  /** Position among the enabled sections. */
  index: number;
  prevEntry: SectionEntry | null;
  nextEntry: SectionEntry | null;
};

const SectionContext = createContext<SectionContextValue | null>(null);

/**
 * SectionFrame — the per-section wrapper every manifest entry renders inside.
 *
 * Phase 0: context only. It renders NO DOM of its own, so the page is
 * pixel-identical to the pre-manifest build; each section still owns its
 * <section id>. Later phases move the cross-cutting concerns here (anchor +
 * scroll-margin, tone planes, auto-seams between tones, density, the
 * enter-once reveal, reduced-motion context) so every section looks native.
 */
export function SectionFrame({
  children,
  entry,
  number,
  index,
  prevEntry,
  nextEntry,
}: SectionContextValue & { children: ReactNode }) {
  return (
    <SectionContext.Provider
      value={{ entry, number, index, prevEntry, nextEntry }}
    >
      {children}
    </SectionContext.Provider>
  );
}

/** The enclosing SectionFrame's entry / number / neighbours (client leaves). */
export function useSection(): SectionContextValue {
  const ctx = useContext(SectionContext);
  if (!ctx) {
    throw new Error("useSection() must be used inside a <SectionFrame>.");
  }
  return ctx;
}
