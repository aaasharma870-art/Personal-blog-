/* ============================================================================
   EGG GLINT (Oct 22 fix, fix/eggs) — the marker an unfound egg wears.
   SERVER MARKUP ONLY (0 bytes of client JS): a decorative child of the egg's
   own button. An empty, unstyled span until the hotspots binder (lazy,
   DESKTOP_FINE) loads app/p3/eggs-lazy.css, which draws it: a ring and a
   four-point glint at rest (static), a slow pulse while its host is on
   screen, a gold tick once found, nothing while the eggs are off. The host
   button carries `data-egg-glint="<hunt id>"`, the one hook the binder reads
   (found state, in view, the hover / focus tip, "Take me there"'s call).
   `badge`: the glint alone at the corner, for a host that already has a shape
   (the Run button, "HERE BE MONSTERS", the snitch).
   ========================================================================== */

export function EggGlint({ badge }: { badge?: boolean }) {
  return (
    <span className="egg-glint" data-glint={badge ? "badge" : undefined} aria-hidden="true">
      <i className="egg-glint-ring" />
      <i className="egg-glint-star" />
      <svg className="egg-glint-tick" viewBox="0 0 18 18" focusable="false">
        <circle cx="9" cy="9" r="8.5" />
        <path d="M5 9.4 7.7 12 13 6.3" />
      </svg>
    </span>
  );
}
