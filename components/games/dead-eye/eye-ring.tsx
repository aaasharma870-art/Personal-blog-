/* ============================================================================
   THE EYE RING (PHASE3-SPEC §9.2 #3; ICONS IC-RD-09) — OWNER: W3-GAMES.
   Our own small glyph for Dead Eye: an open eye inside the core's ring (the
   IC-RD-09 inner glyph), never the game's eye, heart or lightning icon and
   never a reticle (no cross hairs, no ticks, no centre dot on a cross).
   Server-safe, aria-hidden, currentColor, 24 × 24.
   ========================================================================== */

export function EyeRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10.25} strokeOpacity={0.7} />
      <path d="M4.75 12 C7.4 7.9 16.6 7.9 19.25 12 C16.6 16.1 7.4 16.1 4.75 12 Z" />
      <circle cx={12} cy={12} r={2.4} fill="currentColor" stroke="none" />
    </svg>
  );
}
