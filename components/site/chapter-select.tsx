"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { track } from "@/lib/analytics";
import { film } from "@/lib/film";
import { useReducedMotion } from "@/lib/flags";
import { isMediaId, resolveMedia, type MediaAsset } from "@/lib/media";
import { scrollToTarget } from "@/lib/smooth-scroll";
import {
  actCards,
  anchorId,
  copyText,
  copyVisible,
  labelFor,
  letteringFor,
  navGroups,
  pageItems,
  type NavItem,
} from "@/lib/sections";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { cn } from "@/lib/utils";
import { startDirectorsCut } from "@/components/director/api";
import { Glyphed } from "@/components/director/glyphed";

/* ============================================================================
   DVD CHAPTER SELECT (spec §11.2; plan DP-17; P3-10 #2) — OWNER: W3-CINEMA.
   Loaded by the header's menu sheet with next/dynamic (ssr: false), only
   while the menu is open on DESKTOP_FINE on the home page (phones and the
   404 keep today's menu: its targets live on "/"). It sits above the
   sheet's section links. `onPick` closes the menu (the header passes it;
   the jump or the cut's ■ Stop moves focus, and the header puts it back on
   Menu when nothing did).

   ▶ Director's cut first (the DVD "Play movie"): it closes the menu and
   starts the cut (components/director/api.ts; the click is the sound
   consent). aria-disabled with "Motion is paused" under reduced motion /
   Pause.

   Then SEVEN TILES in page order, every one a real link:
     Prologue (the hero, MV-01) · I The Crossing (iconic-pearl) · II The
     Workshop (iconic-ice) · Intermission (F-3I) · III The Frontier (MV-10)
     · IV The Light (iconic-hall) · Credits (MV-08)
   each a 16:9 next/image at 320 w (lazy, fetched with this chunk on open),
   the numeral, and the act title in its world face where the lettering
   ships (this file is on validator #10's lettering allow-list); the menu's
   section links for that chapter listed under it. Hover zooms the picture
   only (a transform; none under reduced motion / Pause). No video.
   Every pick: close the menu → scrollToTarget(anchor, { cut, focus,
   history: "push" }); act tiles land at the card's `landAt` (lib/smooth-
   scroll.ts), on the new world fully shown. Tracked as `chapter`.
   Thumbnails are derived: the first act world's hero plate, each card's
   settled still (film.worlds[world].media.cardStill), the films chapter's
   F-3I, the credits' stage cue. Nothing is a new fact.
   ========================================================================== */

export type ChapterSelectProps = {
  onPick?: () => void;
};

type Tile = {
  id: string;
  href: string;
  numeral: string | null;
  title: string;
  world: WorldId;
  lettered: { lettered: boolean; upper: boolean };
  media: MediaAsset | null;
  links: readonly NavItem[];
};

/** A usable still for a tile (a video's poster), or null. */
function still(id: string | undefined): MediaAsset | null {
  if (!id || !isMediaId(id)) return null;
  const a = resolveMedia(id);
  if (!a) return null;
  if (a.kind === "image") return a;
  return a.poster && isMediaId(a.poster) ? resolveMedia(a.poster) : null;
}

const NO_FACE = { lettered: false, upper: false } as const;

function linksOf(groupId: string): readonly NavItem[] {
  return navGroups.find((g) => g.id === groupId)?.items ?? [];
}

/** The seven chapters, in page order (derived; module-level, pure). */
const TILES: readonly Tile[] = (() => {
  const out: Tile[] = [];
  const firstWorld = actCards[0]?.to;
  for (const it of pageItems) {
    if (it.kind === "act") {
      const world = it.to;
      out.push({
        id: it.id,
        href: `#${it.id}`,
        numeral: it.numeral,
        title: it.title,
        world,
        lettered: world === "house" ? NO_FACE : letteringFor(it.lettering, it.title),
        media: still(world === "house" ? undefined : (film.worlds[world].media.cardStill ?? film.worlds[world].media.plate)),
        links: linksOf(it.id),
      });
      continue;
    }
    const id = anchorId(it.entry);
    if (!id) continue;
    const type = it.entry.type;
    if (type === "hero") {
      const prologue = copyText("chapter.prologue");
      if (!copyVisible(prologue)) continue; // its name is new copy: no name, no tile
      out.push({
        id,
        href: `#${id}`,
        numeral: null,
        title: prologue.text,
        world: "house",
        lettered: NO_FACE,
        media: still(firstWorld && firstWorld !== "house" ? film.worlds[firstWorld].media.plate : undefined),
        links: linksOf("cold-open"),
      });
    } else if (type === "films") {
      out.push({
        id,
        href: `#${id}`,
        numeral: null,
        title: navGroups.find((g) => g.id === "intermission")?.label ?? labelFor(id),
        world: "house",
        lettered: NO_FACE,
        media: still("F-3I"),
        links: linksOf("intermission").filter((l) => l.id !== id),
      });
    } else if (type === "credits") {
      const cue = it.entry.stage?.cues?.[0]?.media;
      out.push({
        id,
        href: `#${id}`,
        numeral: null,
        title: navGroups.find((g) => g.id === "credits")?.label ?? labelFor(id),
        world: "house",
        lettered: NO_FACE,
        media: still(cue ?? "MV-08"),
        links: linksOf("credits").filter((l) => l.id !== id),
      });
    }
  }
  return out;
})();

export function ChapterSelect({ onPick }: ChapterSelectProps) {
  const off = useReducedMotion();
  const heading = copyText("chapter.heading");
  const play = copyText("dc.button");
  const sound = copyText("dc.sound");
  const paused = copyText("dc.paused");

  const go = (href: string, id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onPick?.();
    track("chapter", { to: id });
    void scrollToTarget(href, { cut: true, focus: true, history: "push" });
  };

  const onPlay = () => {
    if (off) return;
    onPick?.();
    startDirectorsCut();
  };

  if (!TILES.length) return null;
  return (
    <section
      aria-labelledby={copyVisible(heading) ? "chapter-select-title" : undefined}
      className="pt-tier-group"
      data-chapter-select=""
      data-house-type=""
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {copyVisible(heading) ? (
          <h2 id="chapter-select-title" className="type-meta text-fg-muted">
            {heading.text}
          </h2>
        ) : (
          <span />
        )}
        {copyVisible(play) ? (
          <button
            type="button"
            onClick={onPlay}
            aria-disabled={off || undefined}
            data-dc-menu=""
            className={cn(
              "type-meta inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-5 transition-colors duration-(--dur-micro)",
              off ? "cursor-not-allowed text-fg-muted opacity-60" : "text-fg hover:border-accent-bright hover:text-accent-bright",
            )}
          >
            <Glyphed text={play.text} />
            {off ? (
              copyVisible(paused) ? <span>{paused.text}</span> : null
            ) : copyVisible(sound) ? (
              <span className="text-fg-ghost">{sound.text}</span>
            ) : null}
          </button>
        ) : null}
      </div>
      <ol className="mt-tier-group grid grid-cols-4 gap-x-4 gap-y-tier-group">
        {TILES.map((t) => (
          <li key={t.id} className="flex min-w-0 flex-col gap-2" data-chapter={t.id}>
            <a href={t.href} onClick={go(t.href, t.id)} className="group flex flex-col gap-2 rounded-control">
              <span className="relative block aspect-video overflow-hidden rounded-control bg-bg" {...planeAttrs("deep", t.world)}>
                {t.media ? (
                  <Image
                    src={t.media.src}
                    alt=""
                    width={320}
                    height={180}
                    quality={55}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-(--dur-base) group-hover:scale-[1.04] motion-off:transition-none motion-off:group-hover:scale-100"
                  />
                ) : null}
              </span>
              <span className="flex min-w-0 items-baseline gap-2 text-fg" {...(t.world !== "house" ? planeAttrs("deep", t.world) : {})}>
                {t.numeral ? <span className="type-meta text-fg-muted">{t.numeral}</span> : null}
                <span
                  className={cn(
                    "truncate text-[1.25rem] leading-tight",
                    t.lettered.lettered && "font-world-act",
                    t.lettered.upper && "uppercase",
                  )}
                >
                  {t.title}
                </span>
              </span>
            </a>
            {t.links.length ? (
              <ul className="flex flex-col">
                {t.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.href}
                      onClick={go(l.href, l.id)}
                      className="inline-flex min-h-8 items-center type-small text-fg-muted transition-colors hover:text-fg"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ChapterSelect;
