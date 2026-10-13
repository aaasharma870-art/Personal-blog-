import type { Metadata } from "next";
import type { Beat } from "@/lib/beats";
import { film, type CaptionWorld } from "@/lib/film";
import { anchorId, pageItems } from "@/lib/sections";
import { VARIANTS } from "@/lib/variants";
import { planeAttrs } from "@/lib/worlds";
import { Meta } from "@/components/site/world-kit";
import { DWELL, SPEED } from "@/components/director/timing";
import { FilmFrame } from "@/components/sections/films/film-frame";
import { ChapterSelectLab } from "./cinema-lab";

/* /lab/p3/cinema — W3-CINEMA's workbench (PHASE3-SPEC §11.1, §11.2, §6.1,
   §8.2). Not linked, noindex. Three benches:
   1. THE SHOT LIST the director's cut plays, computed here from the
      manifest (lib/page.ts, lib/film.ts: tempo, estVh, beats) exactly as
      the hero button writes it: per item the tempo speed, the estimated
      height at 1440×900, the dwells of its weight-2/3 stars and the
      estimated running time at 1× and 2×. (The player measures the live
      layout; this is the estimate.)
   2. THE CHAPTER SELECT, inline (picks are logged here, not jumped: the
      anchors live on the home page).
   3. THE FOUR FILMS SCREENS, DEFAULT and ALT: the LivePlate push (1 →
      1.05 over the passage), the loops through loopFor, the finales. On
      DESKTOP_FINE with motion on; reduced motion or Pause shows the stills.
   The director's cut itself, the house lights and the warm-point carry
   run on the home page only (`/?debug=analytics,spotlight` logs them). */
export const metadata: Metadata = {
  title: "Cinema lab",
  description: "On desktop: the director's cut shot list, the chapter select and the four films screens, default and alternate.",
  robots: { index: false, follow: false, nocache: true },
};

const VH = 900;
const CODE = { slow: "s", medium: "m", brisk: "b" } as const;

type Shot = { id: string; label: string; tempo: keyof typeof SPEED; px: number; dwells: string[]; secs: number };

function shots(): Shot[] {
  const out: Shot[] = [];
  for (const it of pageItems) {
    const act = it.kind === "act" ? film.acts.find((a) => a.id === it.act) : undefined;
    const id = it.kind === "act" ? it.id : anchorId(it.entry);
    if (!id) continue;
    const tempo: keyof typeof SPEED = it.kind === "act" ? "c" : CODE[it.entry.tempo ?? "medium"];
    const est = it.kind === "act" ? act?.estVh : it.entry.estVh;
    const beats: readonly Beat[] = (it.kind === "act" ? act?.beats : it.entry.beats) ?? [];
    const px = Math.round((est?.d ?? 1) * VH);
    const heavy = beats.filter((b) => b.star && (b.weight ?? 1) >= 2);
    const dwellMs = heavy.reduce((t, b) => t + (DWELL[b.weight ?? 1] ?? 0), 0);
    out.push({
      id,
      label: it.kind === "act" ? `Act ${it.numeral} · ${it.title}` : (it.entry.nav?.label ?? it.entry.id),
      tempo,
      px,
      dwells: heavy.map((b) => `${b.id} w${b.weight}`),
      secs: px / SPEED[tempo] + dwellMs / 1000,
    });
  }
  return out;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export default function CinemaLabPage() {
  const list = shots();
  const total = list.reduce((t, s) => t + s.secs, 0);
  const worlds = Object.keys(film.worlds).filter((w): w is CaptionWorld => w !== "house" && Boolean(film.worlds[w as CaptionWorld].media.filmsStill));
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-tier-block px-gutter py-tier-block" {...planeAttrs("deep", "house")}>
      <header className="flex flex-col gap-3">
        <h1 className="type-heading">Cinema lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          The director&apos;s cut shot list, the chapter select and the films screens. The cut, the house lights and the warm
          point run on the home page.
        </p>
      </header>

      <section className="flex flex-col gap-tier-group border-t border-rule pt-tier-block" data-lab="shots">
        <h2 className="type-heading">Shot list</h2>
        <p className="type-small max-w-body text-fg-muted">
          Speeds: act cards {SPEED.c} px/s · slow {SPEED.s} · medium {SPEED.m} · brisk {SPEED.b}. Dwell 1.2 s on weight 3,
          0.6 s on weight 2. Estimated at 1440×900: {fmt(total)} at 1×, {fmt(total / 2)} at 2×.
        </p>
        <table className="w-full type-small tnum">
          <thead className="text-left text-fg-muted">
            <tr>
              <th className="py-2 pr-4 font-normal">item</th>
              <th className="py-2 pr-4 font-normal">tempo</th>
              <th className="py-2 pr-4 font-normal">px</th>
              <th className="py-2 pr-4 font-normal">dwells</th>
              <th className="py-2 font-normal">time</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-rule">
                <td className="py-2 pr-4">{s.label}</td>
                <td className="py-2 pr-4">{`${s.tempo} · ${SPEED[s.tempo]} px/s`}</td>
                <td className="py-2 pr-4">{s.px}</td>
                <td className="py-2 pr-4 text-fg-muted">{s.dwells.join(", ") || "—"}</td>
                <td className="py-2">{fmt(s.secs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-tier-group border-t border-rule pt-tier-block" data-lab="chapters">
        <h2 className="type-heading">Chapter select</h2>
        <ChapterSelectLab />
      </section>

      <section className="flex flex-col gap-tier-group border-t border-rule pt-tier-block" data-lab="screens">
        <h2 className="type-heading">Films screens</h2>
        <p className="type-small max-w-body text-fg-muted">
          Each plate pushes 1 → 1.05 over its passage; a registered loop plays over it (one decoder page-wide), else depth on
          its line. The finale draws once when half the frame is in view.
        </p>
        {worlds.flatMap((w) =>
          VARIANTS.map((v) => (
            <div key={`${w}-${v}`} {...planeAttrs("deep", w)} className="flex flex-col gap-3 bg-bg py-tier-group text-fg">
              <Meta fields={[w, v === "alt" ? "ALT · iris-marks" : "DEFAULT · clip-finales"]} />
              <FilmFrame world={w} choice={v} bearing={90} gates={7} />
            </div>
          )),
        )}
      </section>
    </div>
  );
}
