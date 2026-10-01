"use client";

/* ============================================================================
   DVD CHAPTER SELECT (spec §11.2; plan DP-17) — OWNER: W3-CINEMA.
   Loaded by the header's menu sheet with next/dynamic (ssr: false), only
   while the menu is open on DESKTOP_FINE. Its first item is
   "▶ Director's cut" (the DVD "Play movie"). `onPick` closes the menu after
   a chapter is chosen (the header passes it).
   W1.0 stub: renders nothing.
   ========================================================================== */

export type ChapterSelectProps = {
  onPick?: () => void;
};

export function ChapterSelect(props: ChapterSelectProps): null {
  void props;
  return null;
}

export default ChapterSelect;
