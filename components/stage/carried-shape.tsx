/* ============================================================================
   CARRIED SHAPE (spec §7.3) — OWNER: W2-CARDS.
   The css-tier fallback: a static SVG of the incoming carried shape (never
   animated). The GL tier draws the same shapes as SDFs (lib/gl).
   W1.0 stub: renders nothing.
   ========================================================================== */

export type CarriedShapeId = "ring32" | "gear12" | "wheel12" | "snitch";

export type CarriedShapeProps = {
  shape: CarriedShapeId;
  className?: string;
};

export function CarriedShape(props: CarriedShapeProps): null {
  void props;
  return null;
}
