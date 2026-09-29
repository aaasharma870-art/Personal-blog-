import type { CSSProperties, MouseEvent } from "react";
import { navGroups } from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { cn } from "@/lib/utils";
import { Lettered } from "@/components/primitives/scene-caption";

/* ============================================================================
   THE MARAUDER'S MAP — of THIS page (IC-HP-05/06; SPEC v2 §10.3; eggs.BAR E6,
   E7). The plan, not the dialog: pure and hook-free, so the 404 renders it
   on the server (no JS: a static plan of real links) and the Map egg's
   dialog renders it on the client with the visitor's own footprints.

   It is TRUE (E6, E12): rooms = the enabled, navigable sections, corridors =
   page order (a serpentine through the floors), each room's wall carries its
   REAL title as microtext, and every room is a real link (≥ 44 px, in tab
   order). The footprints are the visitor's own visited sections (session
   storage, read by the dialog), the last one labelled YOU — never "Aryan was
   here". Parchment plane (hp × paper: --paper-fg ink 12.6:1). Room names use
   <Lettered world="hp"> (IM Fell once the integrator registers them as `egg`
   lettering; house type until then — the subsets hold only registered
   glyphs). Our own drawing: no traced prop map, no crest, no wordmark.
   ========================================================================== */

export type MapRoom = { id: string; label: string; group: string };

/** The page's rooms in page order (derived from the manifest's nav). */
export function mapRooms(): MapRoom[] {
  return navGroups.flatMap((g) => g.items.map((n) => ({ id: n.id, label: n.label, group: g.label })));
}

/** Serpentine placement: row r, column c (1-based) for `cols` columns. */
function place(i: number, cols: number): { r: number; c: number } {
  const r = Math.floor(i / cols);
  const k = i % cols;
  return { r: r + 1, c: (r % 2 === 0 ? k : cols - 1 - k) + 1 };
}

/** A print pair (left + right sole and heel), toe up. 16 × 22. */
function Footprints({ className }: { className?: string }) {
  const sole = "M3.2 1.4C4.8 0.2 6.4 0.6 6.8 2.6C7.2 4.6 6.8 6.8 5.6 8C4.4 9.2 2.6 8.6 2.2 6.8C1.8 5 1.8 2.6 3.2 1.4Z";
  const heel = "M3 10.2C4.2 9.6 5.4 9.8 5.6 11C5.8 12.2 5.2 13.2 4.2 13.2C3.2 13.2 2.4 12.4 2.4 11.4C2.4 10.9 2.6 10.5 3 10.2Z";
  return (
    <svg viewBox="0 0 16 22" width={16} height={22} aria-hidden="true" focusable="false" className={className}>
      <g fill="currentColor">
        <path d={sole} transform="translate(0 7)" />
        <path d={heel} transform="translate(0 7)" />
        <path d={sole} transform="translate(8 0)" />
        <path d={heel} transform="translate(8 0)" />
      </g>
    </svg>
  );
}

export function MapPlan({
  rooms,
  hrefPrefix = "",
  trail = [],
  youLabel,
  onRoom,
  className,
  headingId,
}: {
  rooms: readonly MapRoom[];
  /** "" on the home page (#id), "/" elsewhere (the 404: /#id). */
  hrefPrefix?: string;
  /** The visitor's visited section ids, in visit order (client only). */
  trail?: readonly string[];
  /** Visible label of the visitor's last room ("You"); null = none. */
  youLabel?: string | null;
  /** Room click (the dialog closes before the page scrolls). */
  onRoom?: (id: string, e: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  /** id of the heading that labels the plan's room list. */
  headingId?: string;
}) {
  const visited = new Set(trail);
  const here = trail.length ? trail[trail.length - 1] : null;
  const n = rooms.length;
  const rows2 = Math.ceil(n / 2);
  const rows4 = Math.ceil(n / 4);

  // corridors: centre → centre in page order, in a 100-unit-per-cell space
  // (preserveAspectRatio none + non-scaling strokes: widths stay in px)
  const corridor = (cols: number) =>
    rooms
      .map((_, i) => {
        const { r, c } = place(i, cols);
        return `${i ? "L" : "M"}${(c - 0.5) * 100} ${(r - 0.5) * 100}`;
      })
      .join("");
  const walked = (cols: number) =>
    rooms
      .slice(1)
      .map((room, j) => {
        const prev = rooms[j];
        if (!visited.has(room.id) || !visited.has(prev.id)) return "";
        const a = place(j, cols);
        const b = place(j + 1, cols);
        return `M${(a.c - 0.5) * 100} ${(a.r - 0.5) * 100}L${(b.c - 0.5) * 100} ${(b.r - 0.5) * 100}`;
      })
      .join("");

  const svg = (cols: number, rows: number, cls: string) => (
    <svg
      viewBox={`0 0 ${cols * 100} ${rows * 100}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", cls)}
      fill="none"
    >
      <path d={corridor(cols)} stroke="var(--fg-muted)" strokeWidth={22} strokeLinejoin="miter" strokeLinecap="square" vectorEffect="non-scaling-stroke" />
      <path d={corridor(cols)} stroke="var(--bg)" strokeWidth={18} strokeLinejoin="miter" strokeLinecap="square" vectorEffect="non-scaling-stroke" />
      {trail.length ? (
        <path d={walked(cols)} stroke="var(--fg)" strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      ) : null}
    </svg>
  );

  return (
    <div
      {...planeAttrs("paper", "hp")}
      className={cn("relative rounded-frame bg-bg p-3 text-fg sm:p-5", className)}
      data-marauders-map=""
    >
      {/* the folds of the parchment (three panels) */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-2 left-1/3 w-px bg-(--paper-edge-deep) opacity-70" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-2 left-2/3 w-px bg-(--paper-edge-deep) opacity-70" />
      <div className="relative">
        {svg(2, rows2, "sm:hidden")}
        {svg(4, rows4, "hidden sm:block")}
        <ol aria-labelledby={headingId} className="relative grid grid-cols-2 sm:grid-cols-4">
        {rooms.map((room, i) => {
          const a = place(i, 2);
          const b = place(i, 4);
          const style = { "--r2": a.r, "--c2": a.c, "--r4": b.r, "--c4": b.c } as CSSProperties;
          const been = visited.has(room.id);
          const isHere = here === room.id;
          return (
            <li
              key={room.id}
              style={style}
              className="relative flex p-2 [grid-column:var(--c2)] [grid-row:var(--r2)] sm:p-3 sm:[grid-column:var(--c4)] sm:[grid-row:var(--r4)]"
            >
              <a
                href={`${hrefPrefix}#${room.id}`}
                onClick={onRoom ? (e) => onRoom(room.id, e) : undefined}
                aria-current={isHere ? "location" : undefined}
                className="group relative flex min-h-24 w-full flex-col justify-between overflow-hidden border-4 border-double border-(--fg-muted) bg-bg px-3 pb-2 pt-1.5 transition-colors duration-(--dur-micro) hover:bg-surface-1 focus-visible:bg-surface-1"
                data-room={room.id}
              >
                {/* the wall's microtext: the room's real title, repeated */}
                <span aria-hidden="true" className="block truncate whitespace-nowrap text-[0.625rem] uppercase leading-4 tracking-[0.2em] text-fg-muted">
                  {Array.from({ length: 6 }, () => room.label).join(" · ")}
                </span>
                <span className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
                  <Lettered world="hp" text={room.label} className="min-w-0 break-words text-lg leading-tight text-fg" />
                  {been ? (
                    <span className="flex shrink-0 items-center gap-1 text-fg" data-footprints="">
                      <Footprints />
                      {isHere && youLabel ? <span className="type-meta text-fg">{youLabel}</span> : null}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
        </ol>
      </div>
    </div>
  );
}
