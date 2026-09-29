"use client";

import type { ReactNode } from "react";
import { useVariant } from "@/lib/use-variant";

/**
 * The 404's DEFAULT / ALT switch (Aryan's answer: a default and an alt of
 * everything). Both pages are server-rendered by app/not-found.tsx; the
 * server and the hydration pass render the DEFAULT (the Marauder's Map,
 * which works with no JS: E7), and `?variant=404.page:alt` (or a bare
 * `?variant=alt`) previews the ALT (the RDR2 journal TIP) after hydration.
 * Register "404.page" in lib/variants.ts (integrator) to list it in /lab.
 */
export function NotFoundSwitch({ main, alt }: { main: ReactNode; alt: ReactNode }) {
  const variant = useVariant(null, "404.page");
  return <>{variant === "alt" ? alt : main}</>;
}
