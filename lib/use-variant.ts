/* ============================================================================
   useVariant — the client side of the variant system (lib/variants.ts).

   HYDRATION RULE (same as lib/flags.ts): the URL is unknowable on the
   server, so the query string comes through a useSyncExternalStore whose
   SERVER snapshot is "" — the server render and the hydration pass both use
   the MANIFEST's variant, and the client switches after mount only when a
   ?variant=… override is present. Never read `location` during render.

     const v = useVariant(choice, "hero.aperture");   // "default" | "alt"

   `choice` is the manifest value the server component passes down
   (variantChoiceOf(entry), card.variant, introVariant, loaderVariantOf(w));
   `key` is the registry piece. An "alt" for a piece without a built ALT
   resolves to "default". Grammar of the override: lib/variants.ts header.

   Both variants must render the same DOM contract where it matters (the h1,
   headings, focus order): a variant switch after hydration may change
   choreography and media, never content or focus targets.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { film } from "./film";
import {
  NO_OVERRIDES,
  effectiveVariant,
  parseVariantOverrides,
  type Variant,
  type VariantChoice,
  type VariantOverrides,
} from "./variants";

const serverSearch = () => "";
const clientSearch = () => window.location.search;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/** The effective variant of one piece: the URL override (client, after
 *  hydration) ?? the manifest choice ?? film.defaultVariant. */
export function useVariant(choice?: VariantChoice | null, key?: string): Variant {
  const search = useSyncExternalStore(subscribe, clientSearch, serverSearch);
  return effectiveVariant(choice, key, search, film.defaultVariant);
}

// Cached per search string so useSyncExternalStore sees a stable object
// between renders (the lib/flags.ts `?skip` pattern).
let lastSearch: string | null = null;
let lastOverrides: VariantOverrides = NO_OVERRIDES;

function overridesSnapshot(): VariantOverrides {
  const search = window.location.search;
  if (search !== lastSearch) {
    lastSearch = search;
    lastOverrides = parseVariantOverrides(search);
  }
  return lastOverrides;
}

const serverOverrides = () => NO_OVERRIDES;

/** The parsed ?variant=… overrides (NO_OVERRIDES on the server and during
 *  hydration). For tools like /lab/variants that list what is forced. */
export function useVariantOverrides(): VariantOverrides {
  return useSyncExternalStore(subscribe, overridesSnapshot, serverOverrides);
}
