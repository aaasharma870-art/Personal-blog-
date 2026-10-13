import type { BeatWeight } from "@/lib/beats";
import type { CaptionWorld } from "@/lib/film";

/* ============================================================================
   FILMS BEATS (PHASE3-SPEC §2.3; lib/page.ts, the films entry) — OWNER:
   W3-CINEMA. Each screen's title in character (film-screen.tsx, a time
   star through the words binder) and its finale (film-frame.tsx, a time
   star through useEnterOnce): Pirates' finale is demoted to weight 1 (a
   breath), the others are weight-2 signatures. A plain module so the server
   screen and the client frame read the same ids (a value exported from a
   "use client" file is only a reference on the server).
   ========================================================================== */

export const FILM_BEATS: Readonly<Record<CaptionWorld, { title: string; finale: string; weight: BeatWeight }>> = {
  pirates: { title: "B31", finale: "B31-finale", weight: 1 },
  idiots: { title: "B32", finale: "B32-finale", weight: 2 },
  rdr2: { title: "B33", finale: "B33-finale", weight: 2 },
  hp: { title: "B34", finale: "B34-finale", weight: 2 },
};
