import type { Tempo } from "@/lib/beats";
import { anchorId, copyText, copyVisible, pageItems } from "@/lib/sections";
import { Glyphed } from "@/components/director/glyphed";

/* ============================================================================
   "▶ Director's cut" BUTTON (spec §11.1; plan DP-17) — OWNER: W3-CINEMA.
   Pre-mounted in the hero CTA row (components/sections/hero/
   hero-section.tsx), beside the CTA.

   SERVER MARKUP (0 bytes of first-load JS): a real <button data-dc>,
   shown only on DESKTOP_FINE by the full media query (`df:`; never `lg:`),
   so a touch tablet never shows a button that cannot work and nothing pops
   in (no CLS: the CTA row reserves its line either way). The desktop
   enhancer's dc binder (components/enhance/binders/dc.ts) wires the click
   to startDirectorsCut(); a click before the binder ran is recorded by the
   boot script (`data-enhance-queue`) and replayed. Under reduced motion or
   Pause it reads "Motion is paused" (CSS, from the first paint) and the
   binder marks it aria-disabled.

   `data-dc-shots` carries the SHOT LIST's tempo from the manifest (lib/
   page.ts sections, lib/film.ts acts): "id:t" per page item in render
   order, t = c (act card, 140 px/s) · s (slow, 90) · m (medium, 110) ·
   b (brisk, 150). The tempo fields are stripped from the browser bundle
   (scripts/build/browser-data-loader.cjs), so the player reads them here.
   Server-only: never import this file from a client component.
   ========================================================================== */

const CODE: Readonly<Record<Tempo, "s" | "m" | "b">> = { slow: "s", medium: "m", brisk: "b" };

/** "hero:s about:m act-1:c …" (server only: reads the manifest's tempo). */
function shotList(): string {
  const out: string[] = [];
  for (const it of pageItems) {
    if (it.kind === "act") {
      out.push(`${it.id}:c`);
      continue;
    }
    const id = anchorId(it.entry);
    if (!id) continue;
    out.push(`${id}:${CODE[it.entry.tempo ?? "medium"] ?? "m"}`);
  }
  return out.join(" ");
}

export function DirectorsCutButton() {
  const label = copyText("dc.button");
  if (!copyVisible(label)) return null;
  const sound = copyText("dc.sound");
  const paused = copyText("dc.paused");
  return (
    <button
      type="button"
      data-dc="hero"
      data-dc-shots={shotList()}
      data-enhance-queue='[data-dc="hero"]'
      data-house-type=""
      className="type-meta hidden min-h-11 items-center gap-2 rounded-full border border-rule px-5 text-fg-muted transition-colors duration-(--dur-micro) hover:border-accent-bright hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent df:inline-flex motion-off:cursor-not-allowed motion-off:opacity-60"
    >
      <Glyphed text={label.text} />
      {copyVisible(sound) ? <span className="text-fg-ghost motion-off:hidden">{sound.text}</span> : null}
      {copyVisible(paused) ? <span className="hidden motion-off:inline">{paused.text}</span> : null}
    </button>
  );
}
