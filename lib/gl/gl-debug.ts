/* ============================================================================
   GL DEBUG — `window.__gl` for the gl probe and /lab/p3/gl (PHASE3-PLAN
   §6.2). Its own chunk: gl-lock.ts imports it only under `?gl=force`,
   `?debug=gl` or on a /lab/ page, so the page's GL chunk never ships it.
   OWNER: W2-GL.
   ========================================================================== */

import { glTier } from "./support";

export type GlLogEntry = { t: number; ev: string; card?: string; p?: number };

/** What gl-lock.ts lets the debug handle read (live, never copied). */
export type GlPeek = {
  dbg: { contexts: number; draws: number; compiles: { t: number; flavour: string; moving: boolean }[]; log: GlLogEntry[] };
  owner(): string | null;
  hosts: Iterable<{ state: string; spec: { card: string } }>;
  texs: Map<string, { bytes: number }>;
  ext(): WEBGL_lose_context | null;
};

export function expose(k: GlPeek): void {
  (window as Window & { __gl?: unknown }).__gl = {
    compiles: k.dbg.compiles,
    log: k.dbg.log,
    get contexts() {
      return k.dbg.contexts;
    },
    get draws() {
      return k.dbg.draws;
    },
    get tier() {
      return glTier();
    },
    get owner() {
      return k.owner();
    },
    get engaged() {
      return [...k.hosts].filter((h) => h.state === "engaged").map((h) => h.spec.card);
    },
    get bytes() {
      let b = 0;
      k.texs.forEach((t) => (b += t.bytes));
      return b;
    },
    lose: () => k.ext()?.loseContext(),
    restore: () => k.ext()?.restoreContext(),
  };
}
