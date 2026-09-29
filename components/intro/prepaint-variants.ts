import { manifestVariant } from "@/lib/sections";
import { hasAlt, pieceSpec, type VariantChoice } from "@/lib/variants";
import type { PrepaintVariants } from "./variant-snippet";

/**
 * The data the pre-paint variant resolver (./variant-snippet.ts) needs, for
 * `keys`: each piece's MANIFEST variant (clamped exactly like useVariant's
 * hydration pass) and whether its ALT is built. Server-side only (it reads
 * the film layer); the result is serialized into an inline script config.
 * A piece that is not in the registry is never clamped (as in
 * lib/variants.ts effectiveVariant).
 */
export function prepaintVariants(
  choice: VariantChoice | null | undefined,
  keys: readonly string[],
): PrepaintVariants {
  const out: Record<string, readonly ["default" | "alt", 0 | 1]> = {};
  for (const k of keys) out[k] = [manifestVariant(choice, k), hasAlt(k) || !pieceSpec(k) ? 1 : 0];
  return out;
}
