import { EggHotspot } from "@/components/eggs/egg-hotspot";
import { cn } from "@/lib/utils";

/* ============================================================================
   THE CHALK HEART (PHASE3-SPEC §9.1 #7, the `3i-aal` egg) — OWNER: W3-IDIOTS.
   SERVER MARKUP ONLY (0 bytes of client JS): a small two-stroke chalk heart
   resting on the optuna board's chalk ledge (ChalkboardFrame `ledge`). Our
   own drawing: two strokes that meet at the point, as a hand chalks a heart
   ("hand on heart" — aal izz well), no hand, no figure, no text.

   The heart IS the hotspot (<EggHotspot hunt="3i-aal">): a real ≥ 44 px
   <button>, shown only on DESKTOP_FINE by the full media query (game.css),
   so phones and touch tablets keep today's ledge. Press and HOLD 600 ms (the
   hotspots binder; Enter / Space count as the hold; the held ring draws in
   currentColor = chalk). The egg runtime counts it, settles the section h2
   twice and toasts Q-3I-1; the sound engine plays the two soft heartbeats.
   The grain of chalk is a lighter offset twin of each stroke (no filter).
   ========================================================================== */

/** Left lobe → the point, then right lobe → the point (they cross a hair
 *  below it, as two chalk strokes do). viewBox 0 0 32 28. */
const HEART = [
  "M16 24.6 C9.4 19.2 3.7 14.6 3.8 9.3 C3.9 5.4 6.7 3.1 9.8 3.2 C12.7 3.3 14.8 5.3 16 8.1",
  "M16.4 8.3 C17.5 5.3 19.7 3.3 22.7 3.2 C25.9 3.1 28.4 5.5 28.3 9.4 C28.2 14.8 22.5 19.6 15.4 25.3",
] as const;

export function ChalkHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" aria-hidden="true" focusable="false" className={cn("block overflow-visible", className)} data-chalk="heart">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {HEART.map((d) => (
          <path key={d} d={d} strokeWidth={1.9} strokeOpacity={0.92} />
        ))}
        {HEART.map((d) => (
          <path key={`g-${d}`} d={d} transform="translate(0.6 -0.4)" strokeWidth={0.7} strokeOpacity={0.35} />
        ))}
      </g>
    </svg>
  );
}

/** The `3i-aal` hotspot on the ICE board's ledge (left of the board, the
 *  chalk stub and duster sit on the right). The frame is `relative`; the
 *  ledge's top is 0.5rem above its bottom edge. */
export function LedgeHeart() {
  return (
    <EggHotspot
      hunt="3i-aal"
      label="egg.hunt.hint.3i-aal"
      className="absolute bottom-2 left-[9%] items-end pb-px text-(--w-chalk)"
    >
      <ChalkHeart className="h-[1.15rem] w-auto" />
    </EggHotspot>
  );
}
