"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_TONE,
  DEFAULT_WORLD,
  type ToneId,
  type WorldId,
} from "@/lib/worlds";

/**
 * WorldProvider / useWorld — the plane (world × tone) a subtree sits on, for
 * client leaves that need it as DATA (e.g. which loader renderer to draw).
 * Colours never come from here: they come from the CSS vars that the nearest
 * `data-world` / `data-tone` element selects (app/globals.css).
 *
 * SectionFrame mounts one per manifest entry with serializable scalars only.
 * Outside any provider, useWorld() returns the house canvas plane.
 */
export type Plane = { world: WorldId; tone: ToneId };

const WorldContext = createContext<Plane>({
  world: DEFAULT_WORLD,
  tone: DEFAULT_TONE,
});

export function WorldProvider({
  world,
  tone,
  children,
}: Plane & { children: ReactNode }) {
  const value = useMemo(() => ({ world, tone }), [world, tone]);
  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld(): Plane {
  return useContext(WorldContext);
}
