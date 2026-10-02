/* ============================================================================
   GLYPHED — the director's-cut copy ("▶ Director's cut", "■ Stop") with its
   leading play / stop glyph shown but not read (aria-hidden), so the
   accessible name is the words alone. Server-safe (no hooks). — OWNER:
   W3-CINEMA.
   ========================================================================== */

/** The copy's leading play / stop glyph is decoration: shown, not read. */
export function Glyphed({ text }: { text: string }) {
  const m = /^([▶■])\s*(.*)$/u.exec(text);
  if (!m) return <span>{text}</span>;
  return (
    <span>
      <span aria-hidden="true">{`${m[1]} `}</span>
      {m[2]}
    </span>
  );
}
