/* ============================================================================
   EVENTS — the Phase-3 page bus (PHASE3-PLAN §3.1). Window CustomEvents named
   by the keys of `P3Events`; `detail` is the payload. "egg:trigger" is the
   existing EGG_EVENT (components/eggs/egg-bus.ts), same name, same detail.
   Client only: emit/on are no-ops on the server. No state lives here.
   ========================================================================== */

import type { EggId } from "@/components/eggs/egg-bus";
import type { TransitionKind } from "./film";
import type { HuntId } from "./hunt";
import type { LadderStep } from "./ladder";
import type { WorldId } from "./worlds";

/** The two real games (§9.2). */
export type GameId = "drone" | "deadeye";
/** The four toys, one per act (§9.2). */
export type ToyId = "compass" | "drone" | "deadeye" | "candles";

/** Event name → detail. `void` = no payload (call `emit("fastlane")`). */
export type P3Events = {
  /** The intro controller: warm (nothing new starts until quiet-end). */
  "intro:quiet": void;
  /** After the opening titles, or on any exit (§4.3). */
  "intro:quiet-end": void;
  /** The opening titles begin (§4.3; marks `intro:titles`). */
  "intro:titles": void;
  /** The opening titles end, or are cut by input/Pause (marks `intro:titles-end`). */
  "intro:titles-end": void;
  /** The intro controller: the broom flight begins (video or code flight).
   *  The sound engine voices it (broom-whoosh); silent while muted. */
  "intro:flight": void;
  /** The intro controller: the broom has landed on the hero (the hold, or
   *  the dome opening on the code flight). broom-land + the Pirates bed. */
  "intro:land": void;
  /** A new pass over the page begins (the controller's arm(): first load,
   *  every Replay intro, the end "Play it again"): per-view guards re-arm
   *  (lib/impact.ts fired set, entry cues, card crossings, title stings). */
  "p3:view-reset": void;
  /** <PageHydrated/>: the last Suspense child committed. */
  "page:hydrated": void;
  "ladder:step": { step: LadderStep };
  "scroll:jump": { y: number; immediate: boolean };
  "fastlane": void;
  "stage:live": { on: boolean };
  /** The stage re-marked the sections it covers (`[data-stage-on]`): inline
   *  MediaFrames under a covered backdrop re-check their play state
   *  (W2-PLATES; dispatched as a plain window Event, no detail). */
  "stage:cover": void;
  "impact": { world: WorldId };
  /** A card's two halves meet at the carried line/shape (§7.1). */
  "transition:meet": { card: TransitionKind };
  /** A pinned card's phase changed (a < b < m < e, the `data-card-phase`
   *  attribute): `card` = the section id. The engine voices the arrival at
   *  "m" (the act title appears) with the title-sting, once per card per view. */
  "card:phase": { card: string; phase: string; prev: string };
  "letterbox": { state: "close" | "open" };
  "title:in-character": { world: WorldId; id: string };
  "hunt:found": { id: HuntId; count: number };
  "egg:trigger": { id: EggId };
  "game:start": { game: GameId };
  "game:stop": { game: GameId; reason: string };
  "game:gate": { n: number };
  "game:mark": { row: string };
  "game:fire": void;
  "game:finish": { game: GameId; score: number };
  "toy": { toy: ToyId; action: string; n?: number };
  "dc:start": void;
  "dc:stop": { reason: string; pct: number };
  "post-credits": { extended: boolean };
  "sound:change": { on: boolean };
};

export type P3EventName = keyof P3Events;

/** The detail argument: optional for payload-less (`void`) events. */
export type EmitArgs<K extends P3EventName> = P3Events[K] extends void ? [d?: P3Events[K]] : [d: P3Events[K]];

/** Dispatch `k` on window with `d` as its detail (`emit("fastlane")`). */
export function emit<K extends P3EventName>(k: K, ...[d]: EmitArgs<K>): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(k, { detail: d }));
}

/** Listen for `k`; returns the unsubscribe function. */
export function on<K extends P3EventName>(k: K, fn: (d: P3Events[K]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = (e: Event) => fn((e as CustomEvent<P3Events[K]>).detail);
  window.addEventListener(k, h);
  return () => window.removeEventListener(k, h);
}
