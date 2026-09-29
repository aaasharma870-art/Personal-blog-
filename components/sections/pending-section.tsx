import type { ReactNode } from "react";
import type { SectionType } from "@/lib/page";
import type { SectionProps } from "@/components/sections/types";

/**
 * pendingSection(type) — the registry slot of a section type whose component
 * is not built yet (SPEC v2 types that are data stubs in M1: chapter,
 * experiment, ledger, films, credits). Their manifest entries are
 * `enabled: false`, so this never renders on the page; it exists so the
 * registry stays compile-time complete. Enabling such an entry before its
 * component lands renders nothing and warns in development.
 *
 * Builders: replace the registry line with the real component.
 */
export function pendingSection<K extends SectionType>(type: K) {
  function PendingSection({ entry }: SectionProps<K>): ReactNode {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[sections] "${entry.id}" (type "${type}") has no renderer yet`);
    }
    return null;
  }
  PendingSection.displayName = `PendingSection(${type})`;
  return PendingSection;
}
