"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Routes that render WITHOUT the site chrome (header, footer, rail,
 *  palette, cursor/scroll effects): the /lab workbench, whose captures must
 *  show only the primitive under test and whose page has none of the home
 *  anchors the chrome links to. */
const BARE_PREFIXES = ["/lab"] as const;

export function isBareRoute(pathname: string | null): boolean {
  return BARE_PREFIXES.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
}

/**
 * ChromeGate — renders its children (site chrome) everywhere except bare
 * routes. It adds no DOM of its own, so the home page is unchanged.
 */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isBareRoute(pathname) ? null : <>{children}</>;
}
