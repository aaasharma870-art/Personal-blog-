import type { ReactNode } from "react";
import type { SectionEntry } from "@/lib/page";
import { toneOf, worldOf } from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { WorldProvider } from "@/components/primitives/world";

/**
 * SectionFrame — the per-section wrapper every manifest entry renders inside.
 *
 * A SERVER component on purpose: its props never enter the RSC payload, so
 * handing it whole manifest entries costs nothing on the wire.
 *
 * v1.5 (P1-early): emits the section's PLANE — `data-tone` + `data-world`
 * from the manifest entry (defaults canvas / house) — so every descendant
 * resolves the semantic tokens (--bg, --fg, --accent, --world-line …) of its
 * world × tone (app/globals.css), and mounts WorldProvider so client leaves
 * know their plane as data. Nothing is painted here: sections opt in by
 * using bg-bg / text-fg …, so the page stays pixel-identical.
 *
 * WHY `display: contents`: the wrapper must not generate a box, so layout,
 * margin collapsing, sticky containment and every section's own <section>
 * stay exactly as before. `display: contents` removes only the element's box;
 * the element stays in the DOM tree, and inheritance (custom properties
 * included) follows the DOM tree, so descendants still inherit the vars its
 * data attributes select (CSS Display 3 §2.5 — Chrome 65+, Firefox 37+,
 * Safari 11.1+). The historical display:contents accessibility bugs concern
 * semantic elements (buttons, headings, lists) losing their role; this is a
 * role-less <div>. Limits, by design: the frame itself has no box, so it
 * can't paint, be observed (IntersectionObserver) or measured — the section
 * element inside it does those. Phase 1 moves the <section id> itself here
 * (plus scroll-margin, density, the auto dome Seam where toneOf(prevEntry)
 * differs, and the enter-once reveal); the wrapper then becomes that box.
 *
 * Phase 3 (PHASE3-SPEC §3.2, B1-STAGE): `data-stage-mode` mirrors the
 * entry's StageSpec mode (absent without one). The persistent stage marks
 * this wrapper `[data-stage-on]` while it shows the section's plate (a
 * backdrop section then turns transparent behind its StageScrim, only
 * inside the boot gate and while not paused: app/p3/stage.css); the
 * section components render the modes themselves (WorldSection / the
 * credits footer: backdrop; StageSplit: split). Attributes only: nothing
 * here paints, so every page without a live stage is unchanged.
 */
export function SectionFrame({
  entry,
  children,
}: {
  entry: SectionEntry;
  prevEntry: SectionEntry | null;
  children: ReactNode;
}) {
  const tone = toneOf(entry);
  const world = worldOf(entry);
  return (
    <div
      className="contents"
      data-section={entry.id}
      data-stage-mode={entry.stage?.mode}
      {...planeAttrs(tone, world)}
    >
      <WorldProvider world={world} tone={tone}>
        {children}
      </WorldProvider>
    </div>
  );
}
