/* ============================================================================
   DIRECTOR'S CUT API (spec §11.1, P3-10) — OWNER: W3-CINEMA.
   startDirectorsCut() plays the page as a film (DESKTOP_FINE, motion on,
   Lenis alive; any input stops it); stopDirectorsCut(reason) ends it;
   useDirectorsCut() reads whether it runs.
   W1.0 stub: nothing starts; it is never running.
   ========================================================================== */

export type DirectorsCutState = { running: boolean };

const STOPPED: DirectorsCutState = { running: false };

export function startDirectorsCut(): void {}

export function stopDirectorsCut(reason: string): void {
  void reason;
}

export function useDirectorsCut(): DirectorsCutState {
  return STOPPED;
}
