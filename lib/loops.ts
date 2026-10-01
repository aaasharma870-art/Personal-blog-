/* ============================================================================
   LOOPS — which living loop plays over a plate (DP-5). Hosts and stage cues
   name the PLATE, never the loop: a loop lights up the moment the assembler
   registers it in lib/media.ts (a usable `kind:"video"` entry whose poster
   or end frame is the plate, `registeredTo`). No host edit, no tsc
   dependency on registration order.

   A loop is a video that starts and ends on the same still (`endsOn` absent
   or equal to its poster); the prologue flight (IN-02 / IN-02-alt) is never
   one. The ALT variant of `plates.loops` is code (depth + camera on the
   still, DP-8): `loopFor(plate, "alt")` returns the default loop's
   registered alternate when one is usable, else null → the code ALT.
   ========================================================================== */

import { film } from "./film";
import {
  altOf,
  getMedia,
  isMediaId,
  isOwnUsable,
  mediaIds,
  registeredTo,
  type MediaAsset,
  type MediaId,
} from "./media";
import type { Variant } from "./variants";

function isFlight(id: MediaId): boolean {
  const flight = film.prologue.flight;
  if (id === flight) return true;
  const alt = isMediaId(flight) ? altOf(flight) : null;
  return id === alt;
}

function isLoop(a: MediaAsset): boolean {
  return a.kind === "video" && (a.endsOn === undefined || a.endsOn === a.poster) && !isFlight(a.id);
}

const cache = new Map<MediaId, MediaId | null>();

/** The DEFAULT loop registered to `plate` (never an alternate), or null. */
function defaultLoopFor(plate: MediaId): MediaId | null {
  if (cache.has(plate)) return cache.get(plate) ?? null;
  let found: MediaId | null = null;
  for (const id of mediaIds) {
    const a = getMedia(id);
    if (a.variantOf || !isLoop(a) || !isOwnUsable(id) || !registeredTo(a, plate)) continue;
    found = id;
    break;
  }
  cache.set(plate, found);
  return found;
}

/** The loop to play over `plate` for `variant`, or null (poster / code). */
export function loopFor(plate: MediaId, variant: Variant = "default"): MediaId | null {
  const loop = defaultLoopFor(plate);
  if (variant === "default") return loop;
  if (!loop) return null;
  // ALT: the default loop's registered alternate, when it is usable
  const alt = altOf(loop);
  return alt && isOwnUsable(alt) && isLoop(getMedia(alt)) ? alt : null;
}
