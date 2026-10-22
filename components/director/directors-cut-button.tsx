import type { Tempo } from "@/lib/beats";
import { anchorId, copyText, copyVisible, pageItems } from "@/lib/sections";
import { Play } from "lucide-react";

/* ============================================================================
   "▶ Director's cut" BUTTON (spec §11.1; plan DP-17) — OWNER: W3-CINEMA.
   Pre-mounted in the hero CTA row (components/sections/hero/
   hero-section.tsx), beside the CTA.

   SERVER MARKUP (0 bytes of first-load JS): a real <button data-dc>,
   shown only on DESKTOP_FINE by the full media query (`df:`; never `lg:`),
   so a touch tablet never shows a button that cannot work and nothing pops
   in (no CLS: the CTA row reserves its line either way). The desktop
   enhancer's dc binder (components/enhance/binders/dc.ts) wires the click
   to the header dock's chooser (Quick / Full tour; it stops a run that is
   going); a click before the binder ran is recorded by the boot script
   (`data-enhance-queue`) and replayed. It wears the arcade key look
   (app/p3/arcade.css, Oct 22: "Director's cut" with a "Tour" window; the old
   aqua "try" look is still the header dock's and the menu's); the old grey
   "(sound on)" suffix is gone, since the chooser says "Sound stays as you
   set it.". Under reduced motion or Pause the window reads "Motion is paused"
   (CSS, from the first paint) and the binder marks it aria-disabled.

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
  const paused = copyText("dc.paused");
  const tag = copyText("game.tour");
  // fix5 (Oct 20): "Director's cut" at EVERY width, the same word as the header
  // dock's button (fix3c had shortened both to "Tour" below 84rem, so a laptop
  // at 1280 CSS px saw no "Director's cut" button at all).
  const full = label.text.replace(/^▶\s*/u, "");
  return (
    <button
      type="button"
      data-dc="hero"
      data-dc-shots={shotList()}
      data-enhance-queue='[data-dc="hero"]'
      data-house-type=""
      className="arcade-key arcade-key--big hidden df:inline-flex motion-off:cursor-not-allowed motion-off:opacity-60"
    >
      <span className="arcade-key-face">
        <Play className="arcade-key-ico" aria-hidden="true" strokeWidth={2} />
        {/* the copy's leading play glyph is the icon above */}
        <span className="arcade-key-name">{full}</span>
        {/* the window says what it is ("Tour"); under reduced motion or Pause it says why it does nothing */}
        {copyVisible(tag) || copyVisible(paused) ? (
          <span className="arcade-key-win">
            <i className="arcade-lamp" aria-hidden="true" />
            {copyVisible(tag) ? (
              <span aria-hidden="true" className="motion-off:hidden">
                {tag.text}
              </span>
            ) : null}
            {copyVisible(paused) ? <span className="hidden motion-off:inline">{paused.text}</span> : null}
          </span>
        ) : null}
      </span>
    </button>
  );
}
